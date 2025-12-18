/********************************************************************************
 * Copyright (C) 2025 STMicroelectronics and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

// @ts-check

/**
 * @file Compress all packaged .vsix files from dist/ into a tar.gz archive.
 */

const fs = require('fs-extra');
const path = require('path');
const archiver = require('archiver');
const { dist, root } = require('./paths.js');
const { resolveVscodeVersion } = require('./version');

(async () => {
    const version = await resolveVscodeVersion();
    const distPath = dist();

    if (!fs.existsSync(distPath)) {
        console.error('Error: dist/ directory does not exist. Run package-vsix first.');
        process.exit(1);
    }

    const vsixFiles = fs.readdirSync(distPath).filter(file => file.endsWith('.vsix'));

    if (vsixFiles.length === 0) {
        console.error('Error: No .vsix files found in dist/. Run "npm run package-vsix" first.');
        process.exit(1);
    }

    const outputFileName = `vscode-builtin-extensions-${version}.tar.gz`;
    const outputPath = root(outputFileName);

    console.log(`Compressing ${vsixFiles.length} .vsix files into ${outputFileName}...`);

    const output = fs.createWriteStream(outputPath);
    const archive = archiver('tar', {
        gzip: true,
        gzipOptions: { level: 9 }
    });

    output.on('close', () => {
        const sizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
        console.log(`Created ${outputFileName} (${sizeMB} MB)`);
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);

    for (const vsixFile of vsixFiles) {
        const filePath = path.join(distPath, vsixFile);
        archive.file(filePath, { name: vsixFile });
        console.log(`- ${vsixFile}`);
    }

    await archive.finalize();
})();

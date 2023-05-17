/********************************************************************************
 * Copyright (C) 2019 TypeFox and others.
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

const fs = require('fs');
const path = require('path');
// @ts-check
const { src, vscode, run, vscodeExtensions } = require('./paths.js');

if (process.cwd() !== vscode()) {
    run('node', [src('compile.js')], vscode());
} else {
    compileExtensions();
}

async function compileExtensions() {
    // @ts-ignore
    const { compileExtensionsBuildTask, compileWebExtensionsTask } = require('../vscode/build/gulpfile.extensions.js')
    await createMissingLockFiles(vscodeExtensions());
    compileExtensionsBuildTask();
    compileWebExtensionsTask();
}

async function createMissingLockFiles(extensionsPath) {
    let subFolderNames = fs.readdirSync(extensionsPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (let subFolderName of subFolderNames) {
        let subFolderPath = path.join(extensionsPath, subFolderName);
        let yarnLockExists = fs.existsSync(path.join(subFolderPath, 'yarn.lock'));
        if (!yarnLockExists) {
            await run('yarn', ['install'], subFolderPath );
        }
    }
}

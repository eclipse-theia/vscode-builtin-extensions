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

/**
 * Republish built-in VS Code extensions to npmjs under `@theia/vscode-builtin-` prefix.
 */
// @ts-check
const fs = require('fs');
const os = require('os');
const yargs = require('yargs');
const archiver = require('archiver');
const { extensions, run, vscode } = require('./paths.js');

const { tag } = yargs.option('tag', {
    choices: ['latest', 'next']
}).demandOption('tag').argv;

// bump to publish
let version = '0.2.1';

(async () => {
    if (tag === 'next') {
        const shortRevision = (await run('git', ['rev-parse', '--short', 'HEAD'], vscode())).trim();
        const [, minor] = version.split('.');
        version = `0.${Number(minor) + 1}.0-next.${shortRevision}`;
    }
    const result = [];
    for (const extension of await fs.readdirSync(extensions())) {
        if (extension.startsWith('ms-vscode')) {
            // skip marketplace extensions
            continue;
        }
        const pckPath = extensions(extension, 'package.json');
        if (!fs.existsSync(pckPath)) {
            continue;
        }
        const nodeModulesPath = extensions(extension, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
            try {
                await new Promise((resolve, reject) => {
                    try {
                        const nodeModulesZip = fs.createWriteStream(extensions(extension, 'vscode_node_modules.zip'));
                        const archive = archiver('zip');
                        nodeModulesZip.on('close', () => {
                            console.log(archive.pointer() + ' total bytes');
                            console.log('archiver has been finalized and the output file descriptor has closed.');
                            resolve();
                        });
                        archive.on('error', reject);
                        archive.pipe(nodeModulesZip);
                        archive.glob('**', { cwd: nodeModulesPath });
                        archive.finalize();
                    } catch (e) {
                        reject(e);
                    }
                });
            } catch (e) {
                console.error(e);
                continue;
            }
        }
        const originalContent = fs.readFileSync(pckPath, 'utf-8');
        const pck = JSON.parse(originalContent);
        pck.name = '@theia/vscode-builtin-' + pck.name;
        pck.version = version;
        delete pck.private;

        console.log(pck.name, ': publishing...');
        try {
            fs.writeFileSync(pckPath, JSON.stringify(pck, undefined, 2), 'utf-8');
            await run('yarn', ['publish', '--access', 'public', '--ignore-scripts', '--tag', tag], extensions(extension));
            result.push(pck.name + ': sucessfully published');
        } catch (e) {
            result.push(pck.name + ': failed to publish');
            if (e) {
                console.error(e)
            };
        } finally {
            fs.writeFileSync(pckPath, originalContent, 'utf-8');
        }
    }
    console.log(result.join(os.EOL));
})();

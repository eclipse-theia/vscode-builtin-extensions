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

// @ts-check
const rimraf = require('../vscode/node_modules/rimraf');
const vfs = require('../vscode/node_modules/vinyl-fs');
const ext = require('../vscode/build/lib/extensions');
const { theiaExtension, extensions, run, vscodeExtensions } = require('./paths.js');

const fs = require('fs');
const path = require('path');

rimraf.sync(extensions());
(async () => {
    await new Promise((resolve, reject) => {
        ext.packageLocalExtensionsStream(false)
            .pipe(vfs.dest(theiaExtension()))
            .on('error', reject)
            .on('end', resolve);
    });
    copyYarnLock(vscodeExtensions(), extensions())
    await run('yarn', ['install', '--production'], extensions('emmet'));
})();

/**
 * The 'yarn.lock' file is now required by the 'vsce' cli.
 * This method copies it from the given source folder to a corresponding
 * folder in the target.
 * 
 * The method assumes that for each subfolder in the target a corresponding
 * subfolder with the same name exists in the source folder.
 * 
 * @param {string} sourceDir - The path of the source folder.
 * @param {string} targetDir - The path of the destination folder.
 */
function copyYarnLock(sourceDir, targetDir) {
    let subFolderNames = fs.readdirSync(targetDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    for (let subFolderName of subFolderNames) {
        let sourceYarnLockPath = path.join(sourceDir, subFolderName, 'yarn.lock');
        if (fs.existsSync(sourceYarnLockPath)) {
            console.log(`copying: ${sourceYarnLockPath} ${path.join(targetDir, subFolderName)}`);
            fs.copyFileSync(sourceYarnLockPath, path.join(targetDir, subFolderName, 'yarn.lock'));
        }
    }
}

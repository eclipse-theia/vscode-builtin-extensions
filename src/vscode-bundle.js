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
const fs = require('fs');
const rimraf = require('../vscode/node_modules/rimraf');
const vfs = require('../vscode/node_modules/vinyl-fs');
const ext = require('../vscode/build/lib/extensions');
const { root, theiaExtension, extensions, run } = require('./paths.js')

const backupNodeModules = () => {
    const move = (src, dest) => fs.existsSync(src) && fs.renameSync(src, dest);
    const nodeModules = root('node_modules');
    const nodeModulesBackup = root('node_modules_backup');
    move(nodeModules, nodeModulesBackup);
    return () => move(nodeModulesBackup, nodeModules);
}
const revertNodeModules = backupNodeModules();
process.on('exit', revertNodeModules);
process.on('SIGINT', revertNodeModules);
process.on('SIGTERM', revertNodeModules);
rimraf.sync(extensions());
(async () => {
    const stream = ext.packageLocalExtensionsStream().pipe(vfs.dest(theiaExtension()));
    await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('end', resolve);
    });
    await run('yarn', ['install', '--production'], extensions('emmet'));
})();

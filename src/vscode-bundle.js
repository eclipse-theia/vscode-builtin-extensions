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
const { theiaExtension, extensions, run } = require('./paths.js');

rimraf.sync(extensions());
(async () => {
    await new Promise((resolve, reject) => {
        ext.packageLocalExtensionsStream(false)
            .pipe(vfs.dest(theiaExtension()))
            .on('error', reject)
            .on('end', resolve);
    });
    await run('yarn', ['install', '--production'], extensions('emmet'));
})();

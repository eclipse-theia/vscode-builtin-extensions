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
const path = require('path');
const cp = require('child_process');

/**
 * @type {(...paths: string[]) => string}
 */
function root(...paths) {
    return path.join(__dirname, '..', ...paths);
}
/**
 * @type {(...paths: string[]) => string}
 */
function dist(...paths) {
    return root('dist', ...paths);
}
/**
 * @type {(...paths: string[]) => string}
 */
function src(...paths) {
    return root('src', ...paths);
}
/**
 * @type {(...paths: string[]) => string}
 */
function vscode(...paths) {
    return root('vscode', ...paths);
}
/**
 * @type {(...paths: string[]) => string}
 */
function theiaExtension(...paths) {
    return root('vscode-builtin-extensions', ...paths);
}
/**
 * @type {(...paths: string[]) => string}
 */
function extensions(...paths) {
    return theiaExtension('extensions', ...paths);
}

/**
 * @type {(command: string, args?: ReadonlyArray<string>, cwd?: string) => Promise<string>}
 */
function run(command, args, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
        let result = '';
        const p = cp.spawn(command, args, { cwd });
        p.stdout.on('data', data => {
            console.log(String(data));
            result += String(data);
        });
        p.stderr.on('data', data => console.error(String(data)));
        p.on('close', code => !code ? resolve(result) : reject());
    });
}

module.exports = { root, dist, src, vscode, theiaExtension, extensions, run };

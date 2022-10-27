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
 * Root directory where we have the external builtin extensions.
 * @type {(...paths: string[]) => string}
 */
 function externalBuiltinsRepos(...paths) {
    return root('external-builtins', ...paths);
}

/**
 * Execute `command` and returns its stdout.
 *
 * Trims the last line return so you don't need to do `(await run()).trim()`.
 *
 * @type {(command: string, args?: readonly string[], cwd?: string) => Promise<string>}
 */
async function run(command, args, cwd = process.cwd()) {
    // `execa` is an ES module so we can't `require`-it
    const { execa } = await import('execa');
    const child = execa(command, args, { cwd, stdio: ['inherit', 'pipe', 'inherit'] });
    child.stdout.pipe(process.stdout);
    // `execa` already trims stdout by default
    return (await child).stdout;
}

module.exports = { root, dist, src, vscode, externalBuiltinsRepos, theiaExtension, extensions, run };

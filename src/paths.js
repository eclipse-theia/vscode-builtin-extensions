// @ts-check
const path = require('path');
const cp = require('child_process');

/**
 * @type {(paths: string[]) => string}
 */
function root(...paths) {
    return path.join(__dirname, '..', ...paths);
}
/**
 * @type {(paths: string[]) => string}
 */
function out(...paths) {
    return root('out', ...paths);
}
/**
 * @type {(paths: string[]) => string}
 */
function src(...paths) {
    return root('src', ...paths);
}
/**
 * @type {(paths: string[]) => string}
 */
function vscode(...paths) {
    return root('vscode', ...paths);
}
/**
 * @type {(paths: string[]) => string}
 */
function theiaExtension(...paths) {
    return root('vscode-builtin-extensions', ...paths);
}
/**
 * @type {(paths: string[]) => string}
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

module.exports = { root, out, src, vscode, theiaExtension, extensions, run };
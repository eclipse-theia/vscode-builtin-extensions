// @ts-check
const { src, vscode, run } = require('./paths.js')
module.exports = run('node', [src('vscode-bundle.js')], vscode());
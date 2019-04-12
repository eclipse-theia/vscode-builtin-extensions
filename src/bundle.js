// @ts-check
const { src, vscode, run } = require('./paths.js')
module.exports = run('node', ['--max-old-space-size=4096', src('vscode-bundle.js')], vscode());
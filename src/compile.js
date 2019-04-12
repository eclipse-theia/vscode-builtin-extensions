// @ts-check
const { src, vscode, run } = require('./paths.js')
if (process.cwd() !== vscode()) {
    run('node', [src('compile.js')], vscode());
} else {
    const { compileExtensionsBuildTask } = require('../vscode/build/gulpfile.extensions.js')
    compileExtensionsBuildTask();
}
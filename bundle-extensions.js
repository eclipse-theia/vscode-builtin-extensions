// @ts-check
const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const rimraf = require('./vscode/node_modules/rimraf');
const vfs = require('./vscode/node_modules/vinyl-fs');
const ext = require('./vscode/build/lib/extensions');

const backupNodeModules = () => {
    const move = (src, dest) => fs.existsSync(src) && fs.renameSync(src, dest);
    const nodeModules = path.join(__dirname, 'node_modules');
    const nodeModulesBackup = path.join(__dirname, 'node_modules_backup');
    move(nodeModules, nodeModulesBackup);
    return () => move(nodeModulesBackup, nodeModules);
}
const revertNodeModules = backupNodeModules();
process.on('exit', revertNodeModules);
process.on('SIGINT', revertNodeModules);
process.on('SIGTERM', revertNodeModules);
const extensionsPath = path.join(__dirname, 'vscode-builtin-extensions/extensions');
rimraf.sync(extensionsPath);
// @ts-ignore
ext.packageExtensionsStream().pipe(vfs.dest(path.dirname(extensionsPath))).on('end', async () => {
    // see why exlcuded https://github.com/theia-ide/theia/issues/3815#issuecomment-452686623
    rimraf.sync(path.join(extensionsPath, 'configuration-editing'));
    rimraf.sync(path.join(extensionsPath, 'css-language-features'));
    rimraf.sync(path.join(extensionsPath, 'html-language-features'));
    rimraf.sync(path.join(extensionsPath, 'extension-editing'));
    rimraf.sync(path.join(extensionsPath, 'grunt'));
    rimraf.sync(path.join(extensionsPath, 'gulp'));
    await run('yarn', ['install', '--production'], path.join(extensionsPath, 'debug-auto-launch'));
    await run('yarn', ['install', '--production'], path.join(extensionsPath, 'ms-vscode.node-debug'));
    await run('yarn', ['install', '--production'], path.join(extensionsPath, 'ms-vscode.node-debug2'));
});

function run(command, args, cwd) {
    // @ts-ignore
    return new Promise(resolve => {
        const p = cp.spawn(command, args, { cwd });
        p.stdout.on('data', data => console.log(String(data)));
        p.stderr.on('data', data => console.error(String(data)));
        p.on('close', resolve);
    });
}

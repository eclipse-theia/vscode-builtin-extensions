// @ts-check
const fs = require('fs');
const rimraf = require('../vscode/node_modules/rimraf');
const vfs = require('../vscode/node_modules/vinyl-fs');
const ext = require('../vscode/build/lib/extensions');
const { root, theiaExtension, extensions } = require('./paths.js')

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
})();

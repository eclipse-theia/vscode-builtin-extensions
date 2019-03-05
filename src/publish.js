// @ts-check
const rimraf = require('../vscode/node_modules/rimraf');
const { extensions } = require('./paths.js');

(async () => {
    await require('./bundle.js');
    // see why exlcuded https://github.com/theia-ide/theia/issues/3815#issuecomment-452686623
    rimraf.sync(extensions('configuration-editing'));
    rimraf.sync(extensions('css-language-features'));
    rimraf.sync(extensions('html-language-features'));
    rimraf.sync(extensions('extension-editing'));
    rimraf.sync(extensions('grunt'));
    rimraf.sync(extensions('gulp'));
})();
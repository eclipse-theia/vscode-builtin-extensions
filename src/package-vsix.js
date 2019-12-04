/**
 * Package individual built-in VS Code extensions in .vsix packages
 * The .vsix packages end-up in <repo root>/out
 */
// @ts-check
const fs = require('fs-extra')
const os = require('os');
const yargs = require('yargs');
const { root, out, extensions, run, vscode } = require('./paths.js');

const { tag } = yargs.option('tag', {
    choices: ['latest', 'next']
}).demandOption('tag').argv;

const repository = {
    "type": "git",
    "url": "https://github.com/theia-ide/vscode-builtin-extensions"
};

// bump to publish
let version = '1.39.1';

(async () => {

    const bin = await run('yarn', ['bin'], root());
    const vsce = bin.trim() + '/vsce';

    if (tag === 'next') {
        const shortRevision = (await run('git', ['rev-parse', '--short', 'HEAD'], vscode())).trim();
        const [, minor] = version.split('.');
        version = `0.${Number(minor) + 1}.0-next.${shortRevision}`;
    }
    const result = [];

    // typescript-language-features ext needs "extensions/node_modules" content
    // and a bit of massaging to work as standalone .vsix. Basically replace this:
    //      "vscode.typescript-language-features",["..","node_modules"]
    // with this:
    //      "vscode.typescript-language-features",[".","deps"]
    // in the compiled extension, so that the TS LS will be packaged and found at runtime
    const extensionsNodeModulesPath = extensions('node_modules');
    const tsLangFeaturesNMPath = extensions('typescript-language-features');
    if (fs.existsSync(extensionsNodeModulesPath) && fs.existsSync(tsLangFeaturesNMPath)) {
        await fs.copy(extensionsNodeModulesPath, tsLangFeaturesNMPath + '/deps');
        console.log('Copying node_modules under typescript-language-features');

        const extjs = extensions('typescript-language-features', 'dist', 'extension.js');
        const orig = '"vscode.typescript-language-features",["..","node_modules"]';
        const modified = '"vscode.typescript-language-features",[".","deps"]';
        const extjsOrigContent = fs.readFileSync(extjs, 'utf-8');
        if (extjsOrigContent.includes(orig)) {
            console.log('TS language compliled extension is original - patching')
            // const extjsNewContent = extjsOrigContent.replace(orig, modified);
            fs.writeFileSync(extjs, extjsOrigContent.replace(orig, modified), 'utf-8');
        }
        else {
            console.log('TS language extension is already patched')
        }        
    }

    if (!fs.existsSync(out())) {
        await fs.mkdir(out());
    }

    for (const extension of fs.readdirSync(extensions())) {
        // console.log(`extension: ${extension}`);
        if (extension.includes('node_modules')) {
            continue;
        }
        const pckPath = extensions(extension, 'package.json');
        if (!fs.existsSync(pckPath)) {
            continue;
        }

        const originalContent = fs.readFileSync(pckPath, 'utf-8');
        const pck = JSON.parse(originalContent);
        // warning: do not meddle with pck.publisher - it's part of the 
        // extension id and used in places to access some extensions
        // pck.publisher = "theia-ide";
        pck.repository = repository;
        pck.version = version;
        // avoid having vsce run scripts during packaging, such as "vscode-prepublish"
        pck.scripts = {};

        console.log('packaging: ', pck.name, ' ...');
        try {
            fs.writeFileSync(pckPath, JSON.stringify(pck, undefined, 2), 'utf-8');
            await run(vsce, ['package', '--yarn', '-o', out()], extensions(extension));
            result.push('sucessfully packaged: ' + pck.name);
        } catch (e) {
            result.push('failed to packaged: ' + pck.name);
            if (e) {
                console.error(e)
            };
        } finally {
            fs.writeFileSync(pckPath, originalContent, 'utf-8');
        }

    }

    console.log('Publishing extensions');
    for (const vsix of fs.readdirSync(out())) {
        try {
            console.log(`Publish ext name: ${vsix}`);
            // await run('yarn', ['release-it', 'upload',`--name  "${version}"`, `--tag ${version}`,'--owner marcdumais-work', '--repo vscode-builtin-extensions', '--prerelease', await run('ls', [out(vsix)])]);
            // await run('yarn', ['github-release', 'upload',`--name  "${version}"`, `--tag ${version}`,'--owner marcdumais-work', '--repo vscode-builtin-extensions', '--prerelease', await run('ls', [out(vsix)])]);
            // result.push('sucessfully packaged: ' + pck.name);
        } catch (e) {
            // result.push('failed to packaged: ' + pck.name);
            if (e) {
                console.error(e)
            };
        }
    }

    console.log(result.join(os.EOL));
})();

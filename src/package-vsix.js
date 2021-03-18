/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
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

/*
 * Package individual built-in VS Code extensions in .vsix packages.
 * It's assumed that the vscode git submodule has already been updated
 * and the wanted commit/tag checkled-out, before the start of packaging.
 */
// @ts-check
const fs = require('fs-extra');
const os = require('os');
const yargs = require('yargs');
const capitalize = require('capitalize');
const { dist, extensions, vscode } = require('./paths.js');
const { computeVersion, isPublished } = require('./version');
const vsce = require('vsce');

const { tag, force } = yargs.option('tag', {
    choices: ['latest', 'next']
}).demandOption('tag')
.option('force', {
    description: 'package extensions even if found to be already published',
    boolean: true,
    default: false
}).argv;

// extensions we do not want to package/publish, that
// would otherwise be
const to_skip = new Set();
to_skip.add('vscode-account');

const repository = {
    "type": "git",
    "url": "https://github.com/eclipse-theia/vscode-builtin-extensions"
};

(async () => {
    // compute the version we'll use, given the type of packaging
    // (latest/solid vs next/preview) and current vscode git submodule
    // commit checked-out
    let version = await computeVersion(tag);
    console.log(`Packaging builtins from VS Code version: ${version}\n`);

    const result = [];

    // typescript-language-features ext needs "extensions/node_modules" content
    // and a bit of massaging to work as standalone .vsix, so that the TS LS will
    // be packaged-along and available to the extension at runtime.
    // Basically we replace this:
    //      "vscode.typescript-language-features",["..","node_modules"]
    // with this:
    //      "vscode.typescript-language-features",[".","deps"]
    // const extensionsNodeModulesPath = extensions('node_modules');
    // const tsLangFeaturesNMPath = extensions('typescript-language-features');
    if (fs.existsSync(extensions('node_modules')) && fs.existsSync(extensions('typescript-language-features'))) {
        await fs.copy(extensions('node_modules'), extensions('typescript-language-features', 'deps'));
        console.log('Copying node_modules under typescript-language-features');

        const extjs = extensions('typescript-language-features', 'dist', 'extension.js');
        const orig = '"vscode.typescript-language-features",["..","node_modules"]';
        const patched = '"vscode.typescript-language-features",[".","deps"]';
        const extjsOrigContent = fs.readFileSync(extjs, 'utf-8');
        if (extjsOrigContent.includes(orig)) {
            console.log('TS language compliled extension is original - patching')
            fs.writeFileSync(extjs, extjsOrigContent.replace(orig, patched), 'utf-8');
        }
        else {
            console.log('TS language extension is already patched')
        }
    }

    // html-language-features needs typescript from root node_modules. copying it to the server's
    // node_modules lets it survive vsix packaging
    if (fs.existsSync(extensions('node_modules')) && fs.existsSync(extensions('html-language-features'))) {
        await fs.copy(extensions('node_modules'), extensions('html-language-features', 'server', 'node_modules'));
    }

    if (!fs.existsSync(dist())) {
        await fs.mkdir(dist());
    }

    for (const extension of fs.readdirSync(extensions())) {
        if (to_skip.has(extension)) {
            console.log(`  (skipping extension ${extension} as per configuration`);
            continue;
        }

        // is this extension/version already published?
        try {
            let published = await isPublished(version, extension);
            if (published && !force) {
                console.log(`  (skipping already published extension: ${extension} : v${version})`)
                continue;
            }
        } catch (e) {
            console.log('error: ' + e);
            continue;
        }

        const extDisplayName = capitalize.words(extension.replace('-', ' ')) + " (built-in)"
        const pckPath = extensions(extension, 'package.json');
        const nlsPath = extensions(extension, 'package.nls.json');
        const readmePath = extensions(extension, 'README.md');
        const readmeContent = genReadme(extension);

        if (!fs.existsSync(pckPath)) {
            continue;
        }

        const originalContent = fs.readFileSync(pckPath, 'utf-8');
        const pck = JSON.parse(originalContent);
        const nlsContent = fs.readFileSync(nlsPath, 'utf-8');
        const nls = JSON.parse(nlsContent);

        // note: do change pck.publisher - it's part of the key used to
        // lookup extensions, and so changing it may prevent dependent extensions
        // from finding it
        pck.displayName = nls.displayName ? nls.displayName + " (built-in)" : extDisplayName;
        pck.description = nls.description || "Built-in extension that adds (potentially basic) support for " + capitalize(pck.name);
        pck.keywords = ["Built-in"];
        pck.repository = repository;
        pck.version = version;
        pck.license = 'SEE LICENSE IN LICENSE-vscode.txt';

        // Prevent 'vsce' packaging errors by removing the specified icon if it does not exist.
        // When an icon is not provided a default icon will be applied by the registry.
        const icon = pck.icon;
        if (icon) {
            const iconPath = extensions(extension, icon);
            if (!fs.existsSync(iconPath)) {
                delete pck.icon;
            }
        }

        if (tag === 'next') {
            pck.preview = true;
        }

        // avoid having vsce run scripts during packaging, such as "vscode-prepublish"
        pck.scripts = {};

        const extLicense = extensions(extension, 'LICENSE-vscode.txt');
        console.log('packaging vsix: ', pck.name, ' ...');
        try {
            fs.writeFileSync(pckPath, JSON.stringify(pck, undefined, 2), 'utf-8');
            fs.writeFileSync(readmePath, readmeContent, 'utf-8');
            fs.copyFileSync(vscode('LICENSE.txt'), extLicense);
            // await run(vsce, ['package', '--yarn', '-o', dist()], extensions(extension));
            await vsce.createVSIX({
                'cwd': extensions(extension),
                'packagePath': dist(),
                'useYarn': true
            });
            result.push('sucessfully packaged: ' + pck.name);
        } catch (e) {
            result.push('failed to packaged: ' + pck.name);
            if (e) {
                console.error(e)
            };
        } finally {
            fs.writeFileSync(pckPath, originalContent, 'utf-8');
            fs.removeSync(readmePath);
            fs.removeSync(extLicense);
        }
    }

    console.log(result.join(os.EOL));
})();

// a very basic README to add to the extension to explain what it is
function genReadme(ext) {
    return `# Built-in extension: ${ext}

## Disclaimer

Microsoft does not endorse, build, test or publish this extension, nor are they involved with it in any other way. The only association is that they own the copyright of these extensions and the rest of vscode's [source code](https://github.com/microsoft/vscode/tree/main/extensions), which they released under the [MIT License](https://github.com/microsoft/vscode/blob/main/LICENSE.txt). A copy of the license is included in this extension. See LICENSE-vscode.txt

    "Original VS Code sources are Copyright (c) 2015 - present Microsoft Corporation."


## What is this extension? Do I need it?

TL;DR: If you are running \`VS Code\`, \`Code OSS\` or derived product built from the VS Code repository, such as [VSCodium](https://github.com/VSCodium/vscodium), you do not need to install this extension since it's already present - "built-in".

Built-in extensions are built-along and included in \`VS Code\` and \`Code OSS\`. In consequence they may be expected to be present and used by other extensions. They are part of the [vscode GitHub repository](https://github.com/microsoft/vscode/tree/main/) and generally contribute basic functionality such as textmate grammars, used for syntax-highlighting, for some of the most popular programming languages. In some cases, more substantial features are contributed through built-in extensions (e.g. Typescript, Markdown, git, ...). Please see the description above to learn what this specific extension does.

To learn more about built-in extensions, including how they are built and packaged, please see [vscode-builtin-extensions](https://github.com/eclipse-theia/vscode-builtin-extensions).

`;

}

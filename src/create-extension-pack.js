/********************************************************************************
 * Copyright (C) 2021 Ericsson and others.
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
 * Creates an extension package referencing all built-in extensions previously
 * created during build time i.e. by executing yarn
 * 
 * Extensions will be skipped if a corresponding .vsix file is not found under the 'dist'
 * folder and also not found under the extension registry.
 */
// @ts-check
const fs = require('fs-extra');
const path = require('path');
const vsce = require('vsce');
const yargs = require('yargs');

const { computeVersion, resolveVscodeVersion, isPublished } = require('./version');
const { dist, extensions, theiaExtension } = require('./paths.js');

const { tag, force } = yargs.option('tag', {
    choices: ['latest', 'next']
}).demandOption('tag')
    .option('force', {
        description: 'Create extension pack even if it is found to be already available',
        boolean: true,
        default: false
    }).argv;

const packageJson = 'package.json'
const categories = ['Extension Packs'];
const packName = 'builtin-extension-pack';
const publisher = 'eclipse-theia';
const repository = 'https://github.com/eclipse-theia/vscode-builtin-extensions';

(async () => {
    const vscodeVersion = await resolveVscodeVersion();
    const packVersion = await computeVersion(tag);
    const extPackNameAndVersion = packName + '-' + packVersion;

    const extPackVsixPath = dist(packName + '-' + packVersion + '.vsix');
    const extensionPackAlreadyAvailable = await isAvailable(extPackVsixPath, packName, packVersion, publisher);
    if (extensionPackAlreadyAvailable && !force) {
        console.log("Exiting as this extension package is already created or published: " + extPackVsixPath);
        return;
    }

    const extPackSrcFolder = theiaExtension(extPackNameAndVersion);
    if (!fs.existsSync(extPackSrcFolder)) {
        await fs.mkdir(extPackSrcFolder);
    }

    const extPack = {};
    extPack.name = packName;
    extPack.displayName = packName;
    extPack.description = 'Builtin extension pack associated to a version of vscode';
    extPack.version = packVersion;
    extPack.publisher = publisher;
    extPack.license = 'EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0';
    extPack.categories = categories;
    extPack.engines = { vscode: '^' + vscodeVersion };
    extPack.repository = repository;
    extPack.extensionPack = await resolveExtensions();

    if (extPack.extensionPack.length === 0) {
        process.exitCode = 1;
        console.error('Aborting: No extension was found available for this version: ' + packVersion);
        return;
    }

    const packFolderPath = path.join(extPackSrcFolder, '..', extPackNameAndVersion)
    const packJsonPath = path.join(packFolderPath, packageJson);
    const licensePath = path.join(packFolderPath, 'LICENSE.txt');
    const readmePath = path.join(packFolderPath, 'README.md');

    fs.writeFileSync(packJsonPath, JSON.stringify(extPack, null, 2), 'utf-8');
    console.log('Generated ' + packageJson + ' file at: ' + packJsonPath);
    fs.writeFileSync(licensePath, generateLicense());
    fs.writeFileSync(readmePath, generateReadme());

    await vsce.createVSIX({
        'cwd': packFolderPath,
        'packagePath': dist(),
        'useYarn': true
    });

    async function resolveExtensions() {
        const extensionsArr = [];
        for (const extension of fs.readdirSync(extensions())) {
            const extDataPath = extensions(extension, packageJson);
            if (!fs.existsSync(extDataPath)) {
                console.log('No ' + packageJson + ' found for: ' + extension);
                continue;
            }

            const content = fs.readFileSync(extDataPath, 'utf-8');
            const extData = JSON.parse(content);

            const extVsixPath = dist(extData.name + '-' + packVersion + '.vsix');
            if (!(await isAvailable(extVsixPath, extData.name, packVersion))) {
                console.log("Skipping extension, i.e. .vsix is not found and " +
                    "neither published in the registry : " + extVsixPath);
                continue;
            }

            const extensionId = extData.publisher + '.' + extData.name;
            console.log('Adding: ' + extensionId);
            extensionsArr.push(extensionId);
        }
        return Promise.resolve(extensionsArr);
    }

    async function isAvailable(extVsixPath, extensionName, extensionVersion, namespace = 'vscode') {
        if (fs.existsSync(extVsixPath)) {
            return Promise.resolve(true);
        }

        return isPublished(extensionVersion, extensionName, namespace);
    }
})();

function generateLicense() {
    const date = new Date();
    const year = date.getFullYear();
    return `Copyright(c) ${year} - Ericsson and others.

This program and the accompanying materials are made available under the
terms of the Eclipse Public License v. 2.0 which is available at
http://www.eclipse.org/legal/epl-2.0.

This Source Code may also be made available under the following Secondary
Licenses when the conditions for such availability set forth in the Eclipse
Public License v. 2.0 are satisfied: GNU General Public License, version 2
with the GNU Classpath Exception which is available at
https://www.gnu.org/software/classpath/license.html.

SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
`;
}

function generateReadme(ext) {
    return `# Built-in extension package

## What is this extension package? Do I need it?

If you are running \`VS Code\`, \`Code OSS\` or derived product built from the VS Code repository,
such as [VSCodium](https://github.com/VSCodium/vscodium), you do not need to install this extension package as
the included extensions are already present - "built-in".

Built-in extensions are built-along and included in \`VS Code\` and \`Code OSS\`.
In consequence they may be expected to be present and used by other extensions.
They are part of the [vscode GitHub repository](https://github.com/microsoft/vscode/tree/master/) and 
generally contribute basic functionality such as textmate grammars, used for syntax-highlighting, for some
of the most popular programming languages. In some cases, more substantial features are contributed through
built-in extensions (e.g. Typescript, Markdown, git, ...). Please see the description above to learn what
this specific extension does.

To learn more about built-in extensions, including how they are built and packaged,
please see [vscode-builtin-extensions](https://github.com/eclipse-theia/vscode-builtin-extensions).

This extension package may be useful for builders of \'VS Code\' derived products so it can be
included as a dependency or be installed within an extension or plugin directory instead of listing each
individual extension as a dependency.
`;
}

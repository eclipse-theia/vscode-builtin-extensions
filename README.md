# vscode-builtin-extensions

This extension contributes built-in VS Code extensions to Theia.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/theia-ide/vscode-builtin-extensions)

## Getting started (locally)

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash

Install npm and node.

    nvm install 10
    nvm use 10

Install yarn.

    npm install -g yarn

Install vscode.

    cd vscode-builtin-extensions
    git submodule init
    git submodule update

Install vscode prerequisite dependencies.

    https://github.com/Microsoft/vscode/wiki/How-to-Contribute#prerequisites

Pick a specific vscode version (optional)

    cd <repo root>/vscode
    git checkout 1.40.0

## Build

    yarn

## Running the browser example

    yarn start:browser

Open http://localhost:3000 in the browser.

## Running the Electron example

    yarn start:electron

## Developing with the browser example

Start watching of vscode-builtin-extensions.

    cd vscode-builtin-extensions
    yarn watch

Start watching of the browser example.

    yarn rebuild:browser
    cd browser-app
    yarn watch

Launch `Start Browser Backend` configuration from VS code.

Open http://localhost:3000 in the browser.

## Developing with the Electron example

Start watching of vscode-builtin-extensions.

    cd vscode-builtin-extensions
    yarn watch

Start watching of the electron example.

    yarn rebuild:electron
    cd electron-app
    yarn watch

Launch `Start Electron Backend` configuration from VS code.

## Publishing vscode-builtin-extensions to npm

If required, step the extension's version in `src/publish.js`

    // bump to publish
    let version = '0.2.1';

Create a npm user and login to the npm registry, [more on npm publishing](https://docs.npmjs.com/getting-started/publishing-npm-packages).

    npm login

Publish packages with lerna to update versions properly across local packages, [more on publishing with lerna](https://github.com/lerna/lerna#publish).

    npx lerna publish

## Packaging vscode-builtin-extensions as individual `.vsix`

The version of the packaged built-ins is taken from VS Code's `package.json` and adjusted automatically when packaging a `next` revision.

Latest / solid revision example:

    cd vscode; git checkout 1.45.0; cd ..
    yarn; yarn package-vsix:latest

Next / interim revision example:

    cd vscode; git checkout d69a79b73808559a91206d73d7717ff5f798f23c; cd ..
    yarn; yarn package-vsix:next

The generated `.vsix` will be under folder `./dist`

## Publishing vscode-builtin-extensions to open-vsx

The `ovsx` client is used to publish to an open-vsx registry. By default https://open-vsx.org is used. To use another open-vsx registry, set its URL in environment variable `OVSX_REGISTRY_URL`. Use enviromnent variable `OVSX_PAT` to store the personal access token obtained from the registry.

After packaging the extensions as `.vsix` (see above), you may examine/test them under folder `dist`. Remove any that you do not wish to be published (e.g. those not working well). When ready proceed with publishing:

    yarn publish:vsix

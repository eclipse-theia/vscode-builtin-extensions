# Built-in vscode extensions

This extension contributes built-in VS Code extensions to Eclipse Theia applications.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/theia-ide/vscode-builtin-extensions)

## Getting started (locally)

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.5/install.sh | bash

Install npm and node.

    nvm install 12
    nvm use 12

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
    git checkout 1.45.0

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

## Publishing built-in vscode extensions to npm

If required, step the extension's version in `src/publish.js`

    // bump to publish
    let version = '0.2.1';

Create a npm user and login to the npm registry, [more on npm publishing](https://docs.npmjs.com/getting-started/publishing-npm-packages).

    npm login

Publish packages with lerna to update versions properly across local packages, [more on publishing with lerna](https://github.com/lerna/lerna#publish).

    npx lerna publish

## Packaging a built-in vscode extension.

The version of the packaged built-in corresponds to the `version` present in the vscode sub-module's `package.json`. For `next` versions, an appropriate hash suffix is added.

Latest / solid revision example:

    cd vscode; git checkout 1.45.0; cd ..
    yarn; yarn package-vsix:latest

Next / interim revision example:

    cd vscode; git checkout d69a79b73808559a91206d73d7717ff5f798f23c; cd ..
    yarn; yarn package-vsix:next

The generated `.vsix` will be under folder `./dist`

## Packaging built-in vscode extensions in an extension-pack.

The version of the built-in extension-pack corresponds to the `version` present in the vscode sub-module's `package.json`. For `next` versions, an appropriate hash suffix is added.

Latest / solid revision example:

    cd vscode; git checkout 1.45.0; cd ..
    yarn; yarn create-extension-pack:latest

Next / interim revision example:

    cd vscode; git checkout d69a79b73808559a91206d73d7717ff5f798f23c; cd ..
    yarn; yarn create-extension-pack:next

The generated `.vsix` will be under the folder `./dist`

## Publishing individual built-in vscode extensions and builtin-extension-packs to open-vsx

The `ovsx` client is used to publish to an open-vsx registry. The default registry is set to the public instance at https://open-vsx.org.

The environment variable `OVSX_REGISTRY_URL` may be set to configure publishing to a different registry URL.

The environment variable `OVSX_PAT` is used to set the personal access token obtained from the registry.

After packaging the extensions and extension-packs as `.vsix` (see above), you may examine/test them under the `dist` folder. Remove any extension that you do not wish to be published (e.g. those not working well), and when ready proceed with publishing:

    yarn publish:vsix

## Re-publishing individual built-in vscode extensions and built-in extension packs to open-vsx.

### Solid version

There is a GH action to help: `publish-vsx-specific-latest`. For this to work, the version to be published needs to be removed from open-vsx. Then one must push to branch `ovsx-publish`. Make sure the wanted solid version of the `vscode` git submodule is checked-out in the pushed change. We do not care about that branch - once the publishing is done, it can be force reset the next time.

### Intermediary (next) version

There is a GH action to help: `publish-vsx-specific-next`. For this to work, the version to be published needs to be removed from open-vsx. Then one must push to branch `ovsx-publish-next`. Make sure the wanted intermediary version of the `vscode` git submodule is checked-out in the pushed change. We do not care about that branch - once the publishing is done, it can be force reset the next time.

## License

- [Eclipse Public License 2.0](LICENSE)
- [一 (Secondary) GNU General Public License, version 2 with the GNU Classpath Exception](LICENSE)

## Trademark

"Theia" is a trademark of the Eclipse Foundation
https://www.eclipse.org/theia

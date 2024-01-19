# Built-in vscode extensions

This extension contributes built-in VS Code extensions to Eclipse Theia applications.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/theia-ide/vscode-builtin-extensions)

## Getting started (locally)

Install [nvm](https://github.com/creationix/nvm#install-script).

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

Install npm and node.

    nvm install 18
    nvm use 18

NOTE: To re-build older `vscode` extensions requiring node 12, use the branch `node-12` on this repository and follow the corresponding `README.md` on that branch.

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
    git checkout 1.58.1

## Build

    yarn
    yarn build:extensions

## Packaging a built-in vscode extension.

The version of the packaged built-in corresponds to the `version` present in the vscode sub-module's `package.json`. For `next` versions, an appropriate hash suffix is added.

Latest / solid revision example:

    cd vscode; git checkout 1.58.1; cd ..
    yarn; yarn package-vsix:latest

Next / interim revision example:

    cd vscode; git checkout fe671f300845ca5161885125b1e12d43fc25ccf8; cd ..
    yarn; yarn package-vsix:next

The generated `.vsix` will be under folder `./dist`

## Packaging built-in vscode extensions in an extension-pack.

The version of the built-in extension-pack corresponds to the `version` present in the vscode sub-module's `package.json`. For `next` versions, an appropriate hash suffix is added.

Latest / solid revision example:

    cd vscode; git checkout 1.58.1; cd ..
    yarn; yarn create-extension-pack:latest

Next / interim revision example:

    cd vscode; git checkout fe671f300845ca5161885125b1e12d43fc25ccf8; cd ..
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

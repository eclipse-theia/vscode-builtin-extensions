# Building VS Code built-in Extensions

## Setup

1. Install the VS Code prerequisites as described in (link)
2. Open a command line inside this repo
3. Set up the version of VS Code you want to build:

        git submodule init
        git submodule update

4. Check out the version of VS code you want to use

        cd vscode
        git checkout <git tag or branch>

5. Install project dependencies

        npm install

## Building

Building the extensions from VS Code is done from this repository root folder with:

    npm run build:extensions

This also installs the dependencies in the `vscode` submodule.

This will compile a production ("minified") version of the built-in extensions into the `vscode/.build` folder. In order to produce unminified versions for debugging,
you will need to edit the build script at `vscode/build/lib/extensions.js`. Find the line that creates the webpack config. It should look like this:

    ```javascript
    const webpackConfig = {
       ...config,
       ...{ mode: 'production' }
    };
    ```

Remove part saying `mode: production` and redo the build

## Packaging

### Packaging the built-in vscode extensions

Once we have built our extensions, we can package them into `*.vsix`-files using this package script:

    npm run package-vsix

The script will produce `*.vsix` files in a folder called `./dist`. The vsix files will be named like `<name>-<vscode-version>.vsix`. Note that the publisher (msvscode)
is not included.

> [!NOTE]
> The VS Code build process puts some shared dependencies in a `node_modules` folder which is located in the "extensions" folder at run time.
> In order to produce self-contained extensions, we need to include those modules (at the time, it's the typescript language server) into the packaged extensions (currently for `typescript-language-features` and `html-language-features`).
> The code doing this is located in `src/package-vsix.js`. We also need to patch the `typescript-language-features` extension because it contains a hard-code reference to `../node_modules`.

### Creating the built-ins extension-pack

We also create an extension pack from the internal and external built-ins into the `dist` folder with a package script.
The file name will be of the form: `builtin-extension-pack-<vscode version>.vsix`.

    npm run create-extension-pack

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

### External built-in extensions

In addition to the extensions in the VS Code repository, VS Code includes some "external" built-in extensions (e.g., `ms-vscode.js-debug`).
These are not developed as part of the VS Code repository but are included in the VS Code product.
They are defined in the `product.json` file at the root of the VS Code repository.

To fetch the external built-in extensions:

    npm run get-external-builtins

This will:

- Clone the repositories into the `external-builtins/` directory and check out the version tags that match the current VS Code baseline (needed for IP checks and source archives)
- Download the pre-built `.vsix` files from open-vsx.org into the `dist/` folder

### Creating the built-ins extension-pack

We also create an extension pack from the internal and external built-ins into the `dist` folder with a package script.
The file name will be of the form: `builtin-extension-pack-<vscode version>.vsix`.

    npm run create-extension-pack

### Creating a compressed archive

To create a `tar.gz` archive containing all packaged `.vsix` files (for self-hosting):

    npm run compress-vsix

This creates a `vscode-builtin-extensions-<version>.tar.gz` file in the repository root containing all `.vsix` files from `dist/`.

See [Publishing.md](./Publishing.md#alternative-self-hosting-via-github-releases) for more details on local testing or self-hosting.

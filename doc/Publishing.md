# Publishing VS Code built-in Extensions for a given VS Code Version

Publishing the VS Code built-in extensions for a given relase of VS Code entails multiple steps (in order)

1. Perform IP-checks with the Eclipse foundation for the extensions included in the VS Code repo ("builtin")
2. Perform IP-checks with the Eclipse foundation for each extension that is included with VS Code, but with source in a different location ("external")
3. Build and test & package the built-ins with the latest Theia version
4. Publish the extensions from the VS Code repo to open-vsx.org

## IP checks for VS Code built-ins

To prepare for the IP checks, you'll have to perform the setup steps from [Building.md](./Building.md#setup). Now we need
to first run the [dash-licenses](https://github.com/eclipse/dash-licenses) tool to check the dependencies of the built-in
extensions for compatibility with the Theia license. There are a couple of package scripts helping with this: the following sequence downloads the dash-licenses jar to the current directory and then runs the `dash-licenses` for all relevant extensions in the `vscode/extensions` directory.

    npm run download:dash-licenses
    npm run ip-check:builtin 

This will run the dash-licenses tool an all extensions in the VS Code repo. To automatically open issues with the Eclipse [IP-issue tracker](https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab), you can pass a `--token` parameter to the `ip-check:builtin` script. The token is described [in the dash-licenses README](https://github.com/eclipse/dash-licenses?tab=readme-ov-file#automatic-ip-team-review-requests).

    npm run ip-check:builtin --token <your gitlab token>

Any issues will show up as opened by you (or the account owning the token) at <https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab>. In general, it's a good idea to wait for the
IP tickets to be closed before publishing the built-in. Technically, this restriction applies to publishing the built-ins as part of an Eclipse project artifact like Theia IDE.
Now it's time to open an ip-ticket for the source of the VS Code built-ins themselves.

Generate a source zip of the extensions folder. You can use a package script that will prune test extensions and test folders from the source:

    npm run archive:builtin

This will `git clean` all extension directories and generate a zip file named like so: `vscode-builtins-<version>.src.zip`

Open an issue that looks like this: <https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab/-/issues/11676>. Use the template "vet third party" on the new issue and fill in the templata liek in the example issue. Attach the source file generated in step one as "source". Since there is no real "clearlydefined id" for the built-ins, we set the title of the issue to `project/ecd.theia/-/vscode-builtin-extensions/<VS Code version>`

## IP checks for external VS Code built-ins

We now have to perform the IP checks for the "external builtins". These are extensions which are not developed as part of the VS code repository, but which are still included as part of the
VS Code product. They are described in the `product.json` file which lives at the root of the VS Code repository. There is a package script which will clone the relevant repos and check out
the correct tag into a folder named `external-builtins`.

    npm run get-external-builtins

We now have to run the checks for the dependencies of those extensions:

    npm run ip-check:external --token <your gitlab token>

Again, this will open issues with the Eclipse IP issue tracker. Once this is done, it's time to open an ip-check issue for the content of each of the external built ins.
For extensions from github, it's usually enough to open a "vet third party" issue with just the project in the details, like this one: <https://gitlab.eclipse.org/eclipsefdn/emo-team/iplab/-/issues/14430>. The title should be the clearlydefined id of the form `git/github/<github org>/<project>/v<version>`. The IP-check bot is usually able to download the source from the github release page on its own. In the issue template, just fill in the "project" field.
If the IP-check bot cannot figure out the source (it will ask for source in a comment on the issue), you can zip up the source of all external built-ins into files of the form `<publisher>.<name>-<version>.src.zip>` with a package script:

    npm run archive:external

You can then drag the relevant zip into the gitlab issue.

## Produce the VS Code built-ins

Building and packaging the built-ins is described in [Building.md](./Building.md).

## Testing

This section assumes you have a local clone of the [main Theia repo](https://github.com/eclipse-theia/theia). Please refer to the Theia documentation for instructions on how to build and
run Theia. Some built-ins may refuse to run if the VS Code API version reported by Theia is lower that what they require. If Theia's default API verison has not been updated yet, you can
force a newer version by either setting the `VSCODE_API_VERSION` environment variable or by passing the option `--vscode-api-version <major>.<minor>.<patch>`

If already present, delete folder `plugins` in your local Theia repo folder. We will instead use the built-ins we previously built

    ```bash
    rm -rf plugins
    mkdir plugins
    ```

Copy the builtin extension `*.vsix` files built above to Theia's `extensions` folder (typically `~/.theia/extensions`)

    ```bash
    cp -a dist/* ~/.theia/extensions   # adjust according to where your .theia folder resides
    ```

Get rid of a few builtins that will interfere with testing (note: we keep these extensions where they were generated, but remove them from our test Theia application):

    ```bash
    cd theia  # back to theia repo
    rm -rf plugins/ipynb-*
    rm -rf plugins/extension-editing-*
    ```

To test vscode builtin git, we need to remove the Theia-specific git extension from the example application, for this, remove the line referring to
`"@theia/git": "<Theia version>"` from the `package.json` of the Theia example you use for testing.

Rebuild the example and start Theia:

    ```bash
    npm ci && npm run build
    npm run start:browser OR npm run start:electron
    ```

Note that startup will take a bit longer than usual while Theia unzips the *.vsix files to `~/.theia/deployedPlugins`.

- [ ] Connect to `localhost:3000` with a browser
- [ ] Observe backend log for new exceptions, specially during activation of builtin extensions
- [ ] quick TypeScript test
- [ ] quick JSON test
- [ ] quick git test
- [ ] Submit PR for current builtins versions for review and merge.

File issues for problems found. Some problems may require changing how we build or package, in which case a fix would be made on `vscode-builtin-extensions` as part of the ongoing release PR. If the issue is with the upstream Theia repo, we open the issue there.

While testing buitins 1.72.2, we found the following, for example:

- [RangeError: Maximum call stack size exceeded with recent vscode.html builtin extension #12434](https://github.com/eclipse-theia/theia/issues/12434)
- [[builtins] [proposed API] [vscode.markdown-language-features]: Theia misses proposed API: `Document Paste`](https://github.com/eclipse-theia/theia/issues/12430)
- [[builtins] [proposed API] [vscode.git@1.72.2]: Theia misses proposed API: `Edit session identifier provider`](https://github.com/eclipse-theia/theia/issues/12437)

Once you are confident that the new set of builtins do not have obvious issues, you can proceed with publishing them to `open-vsx.org`. It's ok if there are issues that will later be fixed in Theia - older version of the builtin can be temporarily used instead in most cases.

Now it's time to open a PR against master. The convention is to create a branch that is named after the version of VS Code wer're using:

    git checkout -b <major>.<minor>.<patch>  # replace the version here wiht the VS Code version, for example "1.88.1" 

Now commit all changes you had to make to get the built-ins to correctly build, **including the `vscode` folder**. Adding `vscode` will update the submodule configuration n this repo to
check out the correct version of VS Code upon `git submodule update`. The convention is to make a single commit named `changes for builtins v<major>.<minor>.<patch>`. Open a PR and have it reviewed as usual.

## Publishing to openvsx.org

> [!IMPORTANT]
> **Before publishing to open-vsx, all issues opened in [internal](#ip-checks-for-vs-code-built-ins) and [external](#ip-checks-for-external-vs-code-built-ins) should be closed.**
> Please work with the Eclipse Foundation staff and the Theia community if there are problems!

Publishing is done using GitHub Actions. In the vscode-builtin-extensions repo, a publish token for open-vsx.org has been set, that can be used to publish under the identity of the openvsx publish bot.

Building and optionally publishing the extensions is done through the `Build and Publish VS Code Extensions` workflow.
On any pull request and push to the `master` branch, the workflow will build and package all VS Code extensions to ensure that the build scripts still work as expected.

Triggering the workflow through the GitHub UI using the `workflow_dispatch` trigger will additionally publish the built extensions to open-vsx.

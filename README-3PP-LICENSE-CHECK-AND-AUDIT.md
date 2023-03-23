# VS Code builtin extensions: 3PP license check and security vulnerability audit

Note: Further automation is possible for the future, but for now we will document how to do most of this semi-manually (tools are used but could be better integrated in this repo). For example we have a better integration for `dash-licenses` in the main Theia repo, and intend to make it re-usable. When that happens, we can use it in this repo here, too.

First, we need to do a few things to make sure we start with a known state:

```bash
# clean-up the repo
yarn clean
# initialize vscode git submodule
git submodule init && git submodule update
# check-out the wanted vscode tag. e.g. 1.55.2:
cd vscode && git checkout 1.55.2 && cd ..
# run 'yarn` to install the repo's dependencies. You do not need to
# let it complete the builtin extensions build, for the current purpose
yarn
yarn build:extensions
```

## "internal" builtin vscode extensions

These are normally just called `vscode builtin extensions`. These are in the vscode git repository, folder `extensions`, built and packaged along `vscode`. They are not made available individually by Microsoft, so to use them with Theia, we need to do this ourselves. This is what this repository is for. We have the `vscode` repository as a git submodule. We hook-into its build scripts to build the extensions and then package them individually as `.vsix` files, and publish them to [open-vsx.org](https://open-vsx.org/).

Note: in the `vscode` git repo, only the `yarn` client is used, which means only the `yarn.lock` type lockfile is expected to be present.

### 3PP License check (builtins)

We use [dash-licenses](https://github.com/eclipse/dash-licenses) to scan for 3rd party dependencies that have unclear or forbidden licenses (as per the Eclipse Foundation rules). It needs to run on each extension.

```bash
# dash-licenses - local run

yarn download:dash-licenses
export DASH_LICENSES_JAR=${PWD}/dash-licenses.jar

# Run dash-licenses on each yarn project - a summary.txt file will be created, 
# that contains the results
find vscode/extensions -name yarn.lock ! -path '*node_modules*' -exec bash -c "cd \`dirname {}\` && pwd && java -jar $DASH_LICENSES_JAR yarn.lock -timeout 120 -batch 20 -summary ./summary.txt" \;

# gather all output files and filter for restricted 3PPs:
find vscode/extensions -name summary.txt -exec bash -c "cat {} | grep restricted >> summary-restricted.txt" \; &&  grep restricted summary-restricted.txt | sort | uniq && rm summary-restricted.txt

```

```bash
# (optional) dash-licenses with Automatic IP Team Review Requests

# You need to supply your own Eclipse Foundation GitLab token. See: 
# https://github.com/eclipse/dash-licenses#automatic-ip-team-review-requests
export DASH_LICENSES_TOKEN=<token>

# run dash-licenses in review mode, that automatically submits suspicious 
# dependencies for review, by the Eclipse Foundation IP team.
find vscode/extensions -name yarn.lock ! -path '*node_modules*' -exec bash -c "cd \`dirname {}\` && pwd && java -jar $DASH_LICENSES_JAR yarn.lock -timeout 120 -batch 20 -summary ./summary.txt -review -token $DASH_LICENSES_TOKEN -project ecd.theia" \;
```

### Security vulnerability audit (builtins)

The vscode repo uses `yarn`, so we can use `yarn audit` on the individual extensions directories, that each contain a small `yarn` sub-project (at least those that have code). We are mostly interested in runtime vulnerabilities (vs dev and test) of level `high` and up.

```bash
find vscode/extensions/ -name yarn.lock ! -path '*node_modules*' -exec bash -c "cd \`dirname {}\` && pwd && yarn audit --level high --groups dependencies" \;
```

## External builtin vscode extensions

`External builtin vscode extensions` are extensions that are bundled with vscode but not built along with it. Instead they are fetched from the `Visual Studio Marketplace`, when vscode is built. For Theia, some are published to [OpenVSX](https://open-vsx.org/) by the [openvsx bot](https://github.com/open-vsx/publish-extensions) and some may not be available.

They are defined in `vscode`'s root `product.json` - each one at the version that needs to be used, for that vscode baseline. The exact list of extensions changes depending on `vscode` baseline.

For convenience, we added a `package.json` script that clones these external builtin extensions repositories and checks-out each one at the expected version (as per `product.json` in current `vscode` git submodule baseline):

```bash
# obtain external builtins and check-out each one to the "correct" version. They will be 
# stored in subfolder "external-builtins"
yarn get-external-builtins
# list of repos:
find external-builtins -maxdepth 1 -mindepth 1 -type d -exec bash -c "cd '{}' && pwd && git describe --tags" \;
# note: we may not be using all external builtin extensions in Theia, for a given vscode 
# API version. Any that's not used could be removed from consideration, for the following 
# license and vulnerability checks.
```

Both the 3PP license check and security vulnerability audit require either a `yarn.lock` or `package-lock.json` file, to discover exactly which dependencies/versions are used, at a given point in time (commit/version tag).

ATM, the external builtins repositories use a mix of `yarn` and `npm`, so we need to process both types of lockfiles.

### 3PP License check (external builtins)

We use [dash-licenses](https://github.com/eclipse/dash-licenses) to scan for 3rd party dependencies that have unclear or forbidden licenses (as per the Eclipse Foundation rules). It needs to run on each repository. Using the `yarn import` trick above, we can process all repos using a single command that target the various `yarn.lock` files.

```bash
# dash-licenses - local run
yarn download:dash-licenses
export DASH_LICENSES_JAR=${PWD}/dash-licenses.jar

# Run dash-licenses on each repo - a summary.txt file will be created, 
# that contains the results
find external-builtins -name yarn.lock ! -path '*node_modules*' -exec bash -c "cd \`dirname {}\` && pwd && java -jar $DASH_LICENSES_JAR yarn.lock -timeout 120 -batch 20 -summary ./summary.txt" \;

find external-builtins -name package-lock.json ! -path '*node_modules*' -exec bash -c "cd \`dirname {}\` && pwd && java -jar $DASH_LICENSES_JAR package-lock.json -timeout 120 -batch 20 -summary ./summary.txt" \;

# gather all output files and filter for restricted 3PPs:
find external-builtins -name summary.txt -exec bash -c "cat {} | grep restricted >> summary-restricted.txt" \; &&  grep restricted summary-restricted.txt | sort | uniq && rm summary-restricted.txt
```

```bash
# (optional) dash-licenses with Automatic IP Team Review Requests

# You need to supply your own Eclipse Foundation GitLab token. See: 
# https://github.com/eclipse/dash-licenses#automatic-ip-team-review-requests
export DASH_LICENSES_TOKEN=<token>

# run dash-licenses in review mode, that automatically submits suspicious 
# dependencies for review, by the Eclipse Foundation IP team.
find external-builtins/ -name yarn.lock -exec bash -c "cd \`dirname {}\` && pwd &&  java -jar $DASH_LICENSES_JAR yarn.lock -timeout 120 -batch 20 -summary ./summary.txt -review -token $DASH_LICENSES_TOKEN -project ecd.theia" \;

find external-builtins/ -name package-lock.json -exec bash -c "cd \`dirname {}\` && pwd &&  java -jar $DASH_LICENSES_JAR package-lock.json -timeout 120 -batch 20 -summary ./summary.txt -review -token $DASH_LICENSES_TOKEN -project ecd.theia" \;
```

### Security vulnerability audit (external builtins)

The external builtins repos use a mix of `npm` and `yarn`. However, using the `yarn import` trick above, we can process them all individually using only `yarn audit`. We are mostly interested in runtime vulnerabilities (vs dev and test) of level `high` and up.

```bash
find external-builtins -name yarn.lock -exec bash -c "cd \`dirname {}\` && pwd && yarn audit --level high --groups dependencies" \;

find external-builtins -name package-lock.json -exec bash -c "cd \`dirname {}\` && pwd && npm audit --audit-level=high" \;
```


# Tracking Proposed vscode APIs

To list all use of proposed API by the built-in extensions, run the following command in the root of the git repository:

```bash
vscode-builtin-extensions$ git submodule foreach "grep -irn enabledApiProposals --include=package.json | cut -d ':' -f 1 | xargs jq --raw-output '{filename: input_filename, enabledApiProposals: .enabledApiProposals}'"

```

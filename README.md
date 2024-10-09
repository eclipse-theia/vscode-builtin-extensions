# Built-in vscode extensions

This extension contains code to build, package and publish the extensions that are included with VS Code.

We build/package them ourselves, from the MIT-licensed vscode repository, and then publish them individually to Open VSX. We do not modify the extensions, other than a couple of very minor adaptations, to make them suitable to work as standalone extensions.

The "vscode builtins", "vscode built-ins" or "vscode built-in extensions" are a set of extensions whose code resides in the public vscode repository. They are built along and bundled as a group, in the Visual Studio Code product as well as in products based on Code OSS and derivatives such as VSCodium. As such, they are not made available as individual .vsix packages, for use in other IDE applications, outside of the vscode family. This is why we have this repo here - to build, package and individually publish, the various built-in extensions.

Every sub-folder of vscode/extensions/ is one built-in vscode extension (with a couple of exceptions like node_modules after a build)

## Getting started

Building the built-in `*.vsix` files locally is described in [Building.md](./doc/Building.md). If you need to publish a new version of the built-ins for use with Theia, please follow the process described in [Publishing.md](./doc/Publishing.md).

## License

- [Eclipse Public License 2.0](LICENSE)
- [一 (Secondary) GNU General Public License, version 2 with the GNU Classpath Exception](LICENSE)

## Trademark

"Theia" is a trademark of the Eclipse Foundation
<https://www.eclipse.org/theia>

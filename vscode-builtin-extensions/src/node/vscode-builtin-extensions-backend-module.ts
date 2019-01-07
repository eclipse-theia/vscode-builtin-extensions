import * as path from 'path';
import { ContainerModule } from 'inversify';
import { PluginDeployerDirectoryHandler } from '@theia/plugin-ext';
import { VSCodeBuiltinExtensionDirectoryHandler } from './vscode-builtin-extension-directory-handler';

let plugins = `local-dir://${path.resolve(__dirname, '../../extensions')}`;
if (process.env.THEIA_DEFAULT_PLUGINS) {
    plugins += ',' + process.env.THEIA_DEFAULT_PLUGINS;
}
process.env.THEIA_DEFAULT_PLUGINS = plugins;

export default new ContainerModule(bind => {
    bind(PluginDeployerDirectoryHandler).to(VSCodeBuiltinExtensionDirectoryHandler).inSingletonScope();
});
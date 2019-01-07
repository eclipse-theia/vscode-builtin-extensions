import * as path from 'path';
import { injectable } from 'inversify';
import { PluginDeployerEntry, PluginDeployerDirectoryHandler, PluginDeployerDirectoryHandlerContext, PluginDeployerEntryType } from '@theia/plugin-ext';

@injectable()
export class VSCodeBuiltinExtensionDirectoryHandler implements PluginDeployerDirectoryHandler {

    accept(plugin: PluginDeployerEntry): boolean {
        const pck = this.resolvePackage(plugin);
        return !!pck && !!pck.engines && !!pck.engines.vscode;
    }

    protected resolvePackage(plugin: PluginDeployerEntry): {
        engines?: {
            [engine: string]: string
        }
    } | undefined {
        let pck = plugin.getValue('package.json');
        if (pck) {
            return pck;
        }
        try {
            pck = require(path.join(plugin.path(), 'package.json'));
            if (pck) {
                plugin.storeValue('package.json', pck);
            }
            return pck;
        } catch {
            return undefined;
        }
    }

    async handle(context: PluginDeployerDirectoryHandlerContext): Promise<void> {
        context.pluginEntry().accept(PluginDeployerEntryType.BACKEND);
    }

}
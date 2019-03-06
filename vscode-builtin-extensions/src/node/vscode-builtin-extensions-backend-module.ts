import * as path from 'path';
import { ContainerModule } from 'inversify';

let plugins = `local-dir://${path.resolve(__dirname, '../../extensions')}`;
if (process.env.THEIA_DEFAULT_PLUGINS) {
    plugins += ',' + process.env.THEIA_DEFAULT_PLUGINS;
}
process.env.THEIA_DEFAULT_PLUGINS = plugins;

export default new ContainerModule(() => {});
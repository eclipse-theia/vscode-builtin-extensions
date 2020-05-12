/**
 * Publish individual built-in VS Code extensions to an
 * Open VSX registry (default: open-vsx.org) . It is 
 * assumed that the extensions to be published are present
 * in directory "dist" at the root of this repo.
 * 
 * The publishing of the extensions is delegated to `ovsx`,
 * which uses the following environment variables to know
 * to which registry to publish-to and what personal 
 * authentication token to use to authenticate:
 *  OVSX_REGISTRY_URL, OVSX_PAT
 */
// @ts-check
const fs = require('fs')
const os = require('os');
const ovsx = require('ovsx');
const { dist } = require('./paths.js');

(async () => {
    const result = [];

    for (const vsix of fs.readdirSync(dist())) {
        console.log('publishing: ', dist(vsix), ' ...');
        try {
            await ovsx.publish({ extensionFile: vsix, yarn: true });
        } catch (error) {
            result.push(`failed to publish ${vsix}: ${error}`);
            result.push('Stopping here. Fix the problem and retry.');
            break;
        }
        result.push(`Successfully published ${vsix}`);        
    }
    console.log(result.join(os.EOL));
})();

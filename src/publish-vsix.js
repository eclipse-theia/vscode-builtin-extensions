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
const { isPublished } = require('./version');

(async () => {
    const result = [];

    for (const vsix of fs.readdirSync(dist())) {
        // e.g.: bat-1.45.1.vsix
        //       css-language-features-1.45.1.vsix
        //       bat-1.45.2-next.5763d909d5.vsix
        //       css-language-features-1.45.2-next.5763d909d5.vsix
        let regexp = /^([\w-]+)-([\d\w\.-]+)\.vsix$/m;
        const matches = vsix.match(new RegExp(regexp));
        let [, extension, version] = matches;
        
        // is this extension/version alteady published?
        try {
            let found = await isPublished(version, extension);
            if (found) {
                console.log(`Extension ${extension} v${version} is already published - skipping!`)
                continue;
            } 
        } catch (e) {
            console.log('error: ' + e)
        }

        console.log('publishing: ', dist(vsix), ' ...');
        try {
            await ovsx.publish({ extensionFile: dist(vsix), yarn: true });
        } catch (error) {
            console.log(`failed to publish ${vsix}: ${error}`);
            console.log('Stopping here. Fix the problem and retry.\n');
            process.exit(1);
        }
        result.push(`Successfully published ${vsix}`);        
    }
    console.log(result.join(os.EOL));
})();

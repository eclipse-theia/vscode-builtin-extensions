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
const yargs = require('yargs');
const { root, dist, run } = require('./paths.js');

const { tag } = yargs.option('tag', {
    choices: ['latest', 'next']
}).demandOption('tag').argv;

(async () => {
    if (tag === 'next') {
        console.error("Open VSX does not support publishing 'next' versions at this time");
        return;
    }

    const bin = await run('yarn', ['bin'], root());
    const ovsx = bin.trim() + '/ovsx';
    const result = [];

    for (const vsix of fs.readdirSync(dist())) {
        try {
            console.log('publishing: ', dist(vsix), ' ...');
            await run(ovsx, ['publish', dist(vsix)]);
        } catch (e) {
            result.push(`failed to publish ${vsix}`);
        }
    }
    console.log(result.join(os.EOL));
})();

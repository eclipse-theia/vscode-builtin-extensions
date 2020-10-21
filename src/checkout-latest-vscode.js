/********************************************************************************
 * Copyright (C) 2020 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

/**
 * Checks-out the vscode git submodule to the latest "solid" release commit/tag.
 * e.g. 1.45.0, 1.46.4
 */
const { run, vscode } = require('./paths.js');

let releaseTagRegexp = /^\d+\.\d+\.\d+$/m;

// @ts-check
try {
    checkoutLatestVscodeRelease();
} catch (e) {
    console.log(`Error: ${e}`)
    process.exit(1);
}

async function checkoutLatestVscodeRelease() {
    try {
        const latestTagSha = (await run('git', ['rev-list', '--tags', '--max-count=1'], vscode())).trim();
        const latestTag = (await run('git', ['describe', '--tags', latestTagSha], vscode())).trim();
        const match = latestTag.match(releaseTagRegexp);

        if (!match) {
            console.error(`Release tag does not look correct: ${latestTag} - bailing out\n`);
            process.exit(1)
        } else {
            console.debug(`Tag ${latestTag} checked: looks legit`);
        }

        (await run('git', ['checkout', latestTag], vscode())).trim();
        return true;
    } catch (e) {
        console.error(`Error running git command: ${e}`);
    }
}


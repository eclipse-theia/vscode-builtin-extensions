/********************************************************************************
 * Copyright (C) 2022 Ericsson and others.
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

// @ts-check

/**
 * Clone and check-out the vscode external builtin extensions repositories, each to the version
 * that's expected for the current vscode baseline (as defined in vscode's product.json)
 */
const { run, externalBuiltinsRepos, vscode } = require('./paths.js');
const fs = require('fs-extra');

CloneCheckoutExternalBuiltins();

async function CloneCheckoutExternalBuiltins() {
    /** Path of `vscode` product.json file */
    const prod = vscode('product.json');
    const content = fs.readFileSync(prod, 'utf-8');
    /** 
     * vscode product.json section where we find info about external builtins 
     * @type ProductBuiltInExtensionEntry[]
    */
    const prodJsonExts = JSON.parse(content).builtInExtensions;

    for (const entry of prodJsonExts) {
        // extract repo directory name from last part of git repo URL and
        const repoName = entry.repo.split("/").slice(-1)[0];
        /** @type string[] */
        const repoDirectories = fs.readdirSync(externalBuiltinsRepos());
        const index = repoDirectories.findIndex( function (dir) {
            if (dir == repoName) { return true; }
        }) 
        if (index != -1) {
            console.info(`skipping repo already present: ${repoName}`);
        } else {
            console.info(`Cloning: ${entry.repo}`);
            await clone(entry.repo, externalBuiltinsRepos());
        }
        // Check-out the expected version tag
        const versionTag = "v" + entry.version;
        console.info(`checking-out: ${repoName} version: ${versionTag}`);
        await checkout(versionTag, externalBuiltinsRepos(repoName));
    }
}

/**
 * Clone the repo from the provided URL, into the provided directory
 * @param {string} repo URL of the git repository to clone
 * @param {string} dir directory in which to perform the clone operation
 */
async function clone(repo, dir) {
    try {
        // Avoid the command becoming interactive and prompting for 
        // GitHub credentials when the repository is not found and 
        // perhaps other scenarios
        process.env.GIT_TERMINAL_PROMPT = "0";
        await run('git', ['clone', repo], dir);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Checkout git repo in directory `dir` to the provided version `tag`
 * @param {string} tag git tag to checkout
 * @param {string} dir directory in which the git repository resides
 */
async function checkout(tag, dir) {
    try {
        await run('git', ['checkout', tag], dir);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Entry from `vscode product.json` builtInExtensions[]
 * @typedef {object} ProductBuiltInExtensionEntry
 * @property {string} name 
 * @property {string} version
 * @property {string} repo
 */


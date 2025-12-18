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
 * that's expected for the current vscode baseline (as defined in vscode's product.json).
 * 
 * Also downloads the pre-built .vsix files from open-vsx.org into the dist/ folder.
 */
const { run, externalBuiltinsRepos, vscode, dist } = require('./paths.js');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const colors = require('colors');
colors.enable();

const OPEN_VSX_ORG_URL = 'https://open-vsx.org';

/** run log */
var log = [];

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

    // Clone and checkout repos (for IP checks / source archive)
    for (const entry of prodJsonExts) {
        // extract repo directory name from last part of git repo URL
        const repoName = entry.repo.split("/").slice(-1)[0];
        /** @type string[] */
        const repoDirectories = fs.readdirSync(externalBuiltinsRepos());
        const index = repoDirectories.indexOf(repoName);
        try {
            if (index != -1) {
                console.info(`skipping repo already present: ${repoName}`);
                log.push(`Skipped cloning (already present): ${entry.repo}`);
            } else {
                console.info(`Cloning: ${entry.repo}`);
                await clone(entry.repo, externalBuiltinsRepos());
                log.push(`Successfully cloned: ${entry.repo}`.green);
            }
            // Check-out the expected version tag
            const versionTag = "v" + entry.version;
            console.info(`checking-out: ${repoName} version: ${versionTag}`);
            await checkout(versionTag, externalBuiltinsRepos(repoName));
            log.push(`Successfully checked-out: ${versionTag}`.green);

        } catch (error) {
            console.error(error);
            log.push(error.shortMessage.red);
        }
    }

    // Download pre-built vsix files from open-vsx.org
    console.info("\n---------------------");
    console.info("Downloading .vsix files from open-vsx.org...\n");

    if (!fs.existsSync(dist())) {
        fs.mkdirSync(dist());
    }

    for (const ext of prodJsonExts) {
        await downloadVsix(ext);
    }

    console.info("---------------------");
    console.info("Summary:");
    log.forEach((e) => console.info(`- ${e}`));
}

/**
 * Download a .vsix file from open-vsx.org
 * @param {ProductBuiltInExtensionEntry} ext
 */
async function downloadVsix(ext) {
    const [publisher, name] = ext.name.split('.');
    const version = ext.version;
    const vsixFileName = `${publisher}.${name}.vsix`;
    const vsixPath = dist(vsixFileName);

    if (fs.existsSync(vsixPath)) {
        console.info(`Already exists: ${vsixFileName}`);
        log.push(`Skipped download (exists): ${vsixFileName}`);
        return;
    }

    console.info(`Downloading ${ext.name}@${version}...`);

    try {
        const apiUrl = `${OPEN_VSX_ORG_URL}/api/${publisher}/${name}/${version}`;
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            const msg = `Failed to fetch metadata: ${apiResponse.status}`;
            console.error(`  ${msg}`);
            log.push(`${vsixFileName}: ${msg}`.red);
            return;
        }

        const metadata = await apiResponse.json();
        const downloadUrl = metadata.files?.download;

        if (!downloadUrl) {
            const msg = 'No download URL found';
            console.error(`  ${msg}`);
            log.push(`${vsixFileName}: ${msg}`.red);
            return;
        }

        const vsixResponse = await fetch(downloadUrl);
        if (!vsixResponse.ok) {
            const msg = `Failed to download: ${vsixResponse.status}`;
            console.error(`  ${msg}`);
            log.push(`${vsixFileName}: ${msg}`.red);
            return;
        }

        const buffer = await vsixResponse.buffer();
        fs.writeFileSync(vsixPath, buffer);
        console.info(`  Saved: ${vsixFileName}`);
        log.push(`Downloaded: ${vsixFileName}`.green);
    } catch (error) {
        console.error(`  Error: ${error.message}`);
        log.push(`${vsixFileName}: ${error.message}`.red);
    }
}

/**
 * Clone the repo from the provided URL, into the provided directory
 * @param {string} repo URL of the git repository to clone
 * @param {string} dir directory in which to perform the clone operation
 */
async function clone(repo, dir) {
    // Avoid the command becoming interactive and prompting for 
    // GitHub credentials when the repository is not found and 
    // perhaps other scenarios
    process.env.GIT_TERMINAL_PROMPT = "0";
    await run('git', ['clone', repo], dir);
}

/**
 * Checkout git repo in directory `dir` to the provided version `tag`
 * @param {string} tag git tag to checkout
 * @param {string} dir directory in which the git repository resides
 */
async function checkout(tag, dir) {
    await run('git', ['checkout', tag], dir);
}

/**
 * Entry from `vscode product.json` builtInExtensions[]
 * @typedef {object} ProductBuiltInExtensionEntry
 * @property {string} name 
 * @property {string} version
 * @property {string} repo
 */

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
 * version-related utility functions
 */
const fetch = require('node-fetch');
const fs = require('fs')
const { run, vscode } = require('./paths.js');

const OPEN_VSX_ORG_URL = 'https://open-vsx.org'

// @ts-check
/** 
 * Returns the version to use when packaging built-in extensions. Based
 * on VS Code submodule version and whether it's to be a solid or preview
 * release
 * 
 * @param releaseType latest or next
 */
async function computeVersion(releaseType) {
    let ver = await resolveVscodeVersion();
    const shortRevision = (await run('git', ['rev-parse', '--short', 'HEAD'], vscode())).trim();

    return new Promise((resolve) => {
        // use VS Code version and SHA when packaging 'next'
        if (releaseType === 'next') {            
            let [major, minor, bugfix] = ver.split('.');
            ver = `${major}.${minor}.${bugfix}-next.${shortRevision}`;
        }
        resolve(ver);
    });
}

async function resolveVscodeVersion() {
    const vscodePck = JSON.parse(fs.readFileSync(vscode('package.json'), 'utf-8'));
    return Promise.resolve(vscodePck.version || '0.0.1');
}

/** 
 * Returns whether an extension is already published on the currently
 * set registry (default: https://open-vsx.org) 
 */
async function isPublished(version, extension, namespace = 'vscode') {
    let registry = process.env.OVSX_REGISTRY_URL ? process.env.OVSX_REGISTRY_URL : OPEN_VSX_ORG_URL;
    const response = await fetch(`${registry}/api/${namespace}/${extension}/${version}`);
    const json = await response.json();

    // namespace/ext/version not found
    if (json.error) {
        return false;
    }

    return true;
}

module.exports = { computeVersion, isPublished, resolveVscodeVersion };

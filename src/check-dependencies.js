/********************************************************************************
 * Copyright (C) 2024 ST Microelectronics and others.
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

const { promises: fs } = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const { glob } = require('glob');
const { rgPath } = require('@vscode/ripgrep');

const yargs = require('yargs');
const { inherits } = require('util');

const { token, dir } = yargs.option('token', {
    type: 'string',
}).option('dir', {
    type: 'string',
    demandOption: true
}).argv;

console.log(`processing ${dir}`);

checkDependencies();

async function checkDependencies() {
    const allFailed = new Set();
    glob(`${dir}/*/*(yarn.lock|package-lock.json)`, async (err, files) => {
        const { execa } = await import('execa');

        if (token) {
            console.log('Automatically opening IP tickets');
        }

        for (file of files) {
            console.log(`inspecting ${file}...`);
            try {
                const javaArgs = ['-jar', 'dash-licenses.jar', '-summary', 'summary.txt'];
                if (token) {
                    javaArgs.push('-review', '-project',  'ecd.theia', '-token', token);
                }
                javaArgs.push(file);
                await execa('java', javaArgs, { stdout: 'inherit', stderr: 'inherit'});
                console.log('OK\n');
            } catch (e) {
                // ignore
                console.log('\x1b[31mFailures\x1b[0m\n');
            }
    
            const cp = execa(rgPath, ['restricted', 'summary.txt']);
            try {
                const { stdout } = await cp;
                const lines = stdout.split(/\r?\n|\r|\n/g);
                lines.forEach(line => allFailed.add(line));
                console.log(stdout);
            } catch (e) {
                if (cp.exitCode !== 1) { // ripgrep returns 1 for "no matches found"
                    console.error(e);
                }
            }
        }
    
        if (allFailed.size > 0) {
            console.log('\x1b[31mIPCheck failed for:\x1b[0m');
            for (line of allFailed) {
                console.log(line);
            }
        } else {
            console.log('IP check OK');
        }
    });
    
}
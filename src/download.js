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
const fetch= require('node-fetch');
const path = require('path');
const yargs = require('yargs');

const { url, out } = yargs.option('url', {
    type: 'string',
    demandOption: true
}).option('out', {
    type: 'string',
    demandOption: true
}).argv;

download();

async function download() {
    const response= await fetch(url);
    await fs.writeFile(path.resolve(out), await response.buffer());
};

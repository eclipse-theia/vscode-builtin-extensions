/**
 * Package built-in VS Code extensions in a .vsix extension pack
 */
// @ts-check
const fs = require('fs');
const os = require('os');
const yargs = require('yargs');
const archiver = require('archiver');
const { theiaExtension, extensions, run, vscode } = require('./paths.js');

let version = '0.2.1';

(async () => {
    // const result = [];
    const packMembers = [];

    const pckPath = theiaExtension('package.json');
    // if (!fs.existsSync(pckPath)) {
    //     continue;
    // }
    const extpackpckContent = fs.readFileSync(pckPath, 'utf-8');
    const pck = JSON.parse(extpackpckContent);


    for (const extension of await fs.readdirSync(extensions())) {
        if (extension.startsWith('ms-vscode')) {
            // skip marketplace extensions
            continue;
        }
        const pckPath = extensions(extension, 'package.json');
        if (!fs.existsSync(pckPath)) {
            continue;
        }
        const originalContent = fs.readFileSync(pckPath, 'utf-8');
        const extpck = JSON.parse(originalContent);

        packMembers.push(`${extpck.publisher}.${extpck.name}`);
    }
    pck.extensionPack = packMembers;

    // console.log(packMembers.join(os.EOL));

    try {
        fs.writeFileSync(pckPath, JSON.stringify(pck, undefined, 2), 'utf-8');
        console.log('pwd: ' + await run('pwd', []));
        await run('yarn', ['package']);
        // result.push(pck.name + ': sucessfully published');
    } catch (e) {
        // result.push(pck.name + ': failed to publish');
        if (e) {
            console.error(e)
        };
    } finally {
        // fs.writeFileSync(pckPath, originalContent, 'utf-8');
    }


})();

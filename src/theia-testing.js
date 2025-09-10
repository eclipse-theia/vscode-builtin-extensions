// Usage: node process-archives.js <targetPluginFolder> <prefix>

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const [,, targetFolderArg] = process.argv;
if (!targetFolderArg) {
  console.error("Usage: node process-archives.js <targetPluginFolder>");
  process.exit(1);
}

const distFolderPath = path.resolve(path.join(__dirname, '..', 'dist'));
const targetFolder = path.resolve(targetFolderArg);

// clean result folder just in case
fs.rmSync(path.join(distFolderPath, 'result'), { recursive: true, force: true });

// get all .vsix files
const vsixs = fs.readdirSync(distFolderPath).filter(f => f.endsWith(".vsix"));

for (const vsix of vsixs) {
  const base = path.basename(vsix, ".vsix");
  const outDir = path.join(distFolderPath, 'result', base);

  console.log(`Extracting ${vsix} -> ${outDir}`);
  fs.mkdirSync(outDir, { recursive: true });
  // use system unzip (already available on Ubuntu)
  execSync(`unzip -o "${path.join(distFolderPath, vsix)}" -d "${outDir}"`);

  // rename the extracted folder itself
  let newName = base;

  // remove version suffix if present
  const versionPos = newName.lastIndexOf('-');
  if (newName.lastIndexOf('-') > 0) {
    newName = newName.slice(0, versionPos);
  }

  // add prefix if not already there
  const prefix = newName.startsWith("builtin-extension-pack") ? "eclipse-theia.": "vscode.";
  if (!newName.startsWith(prefix)) {
    newName = prefix + newName;
  }

  let finalPath = outDir;
  if (newName !== base) {
    finalPath = path.join(distFolderPath, 'result', newName);
    fs.renameSync(outDir, finalPath);
    console.log(`Renamed folder: "${base}" -> "${newName}"`);
  }
  // Define blacklist for extensions that should not be copied, taken from theia's 'theiaPluginsExcludeIds'
    const blacklist = [
      "extension-editing",
      "github",
      "github-authentication",
      "microsoft-authentication"
    ];

    // after you determine newName
    let skip = blacklist.some(suffix => newName.endsWith(suffix));

    if (skip) {
      console.log(`Skipping blacklisted folder: "${newName}"`);
      continue; // don’t copy this one
    }
  // copy to target folder (force override)
  console.log(`Copying "${finalPath}" -> "${targetFolder}"`);
  execSync(`cp -r -f "${finalPath}" "${targetFolder}/"`);
}

console.log("\nDone.");

const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const rootPath = path.join(__dirname, '..', 'package.json');
const aureliaPath = path.join(__dirname, '..', 'packages', 'aurelia', 'package.json');

const root = readJson(rootPath);
const aurelia = readJson(aureliaPath);

if (!aurelia.version) {
  console.error('Missing version in packages/aurelia/package.json');
  process.exit(1);
}

if (root.version !== aurelia.version) {
  root.version = aurelia.version;
  fs.writeFileSync(rootPath, `${JSON.stringify(root, null, 2)}\n`, 'utf8');
  console.log(`Updated root version to ${aurelia.version}`);
} else {
  console.log(`Root version already ${root.version}`);
}

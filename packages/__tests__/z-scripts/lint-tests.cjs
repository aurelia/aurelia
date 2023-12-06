/* eslint-disable */
const fs = require('fs');
const { resolve, join } = require('path');

/**
 * @param {string} startPath
 * @param {RegExp | string} filter
 * @param {string[]} found
 * @returns {string[]}
 */
function findByExt(startPath, filter, found = []) {
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  const files = fs.readdirSync(startPath);
  for (let i = 0; i < files.length; i++) {
    const filename = join(startPath, files[i]);
    const stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      // recurse
      findByExt(filename, filter, found);
    }
    else if (filter instanceof RegExp) {
      if (filter.test(filename)) {
        found.push(filename);
      }
    }
    else if (filename.endsWith(filter)) {
      found.push(filename);
    }
  }
  return found;
};

const invalidFiles = findByExt('./src', /\.spec\.tsx?$/).filter(testFile => {
  const content = fs.readFileSync(testFile, { encoding: 'utf-8' });
  const normalisedTestFilename = testFile.replace(/^src[\/\\]*/, '').replace(/\\\\?/g, '\\/').replace(/\./g, '\\.');
  const regex = new RegExp(`describe(\\.skip)?\\(['"\`]${normalisedTestFilename}['"\`]`);
  const { index } = regex.exec(content) ?? { index: -1 };
  return index === -1;
});

if (invalidFiles.length > 0) {
  console.log('There are files that does not have root test suit describing the file name. This is necessary to generate time based junit report for circleCI');
  console.log(`These files are:\n    - ${invalidFiles.map(filepath => resolve(__dirname, '..', filepath)).join('\n    - ')}`);
  process.exit(1);
}

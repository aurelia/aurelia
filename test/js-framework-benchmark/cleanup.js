const _ = require('lodash');
const exec = require('child_process').execSync;
const fs = require('fs');
const commandExists = require('command-exists');
const path = require('path');
const rimraf = require('rimraf');

function rmIfExists(base, name) {
  const dir = path.join(base, name);
  if(fs.existsSync(dir)) {
    console.log("Clean ",dir);
    rimraf.sync(dir);
  }
}

for (const keyedType of ['keyed'/* , 'non-keyed' */]) {
  const dir = path.resolve('frameworks', keyedType);
  const directories = fs.readdirSync(dir);

  for (const name of directories) {
    const fd = path.resolve(dir, name);
    console.log('cleaning ', fd);
    if(fs.existsSync(`${fd}/node_modules`)) {
      rimraf.sync(`${fd}/node_modules`);
    }
    rmIfExists(fd, "package-lock.json");
    rmIfExists(fd, "yarn.lock");
    rmIfExists(fd, "dist");
    rmIfExists(fd, "elm-stuff");
    rmIfExists(fd, "bower_components");
    rmIfExists(fd, "node_modules");
  }
}

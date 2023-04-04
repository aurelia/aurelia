/* eslint-disable */
const fs = require('fs');
const { resolve, join } = require('path');
const esbuild = require('esbuild');
const { exec, execSync } = require('child_process');

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

esbuild.context({
  entryPoints: findByExt('./', /\.tsx?$/),
  outdir: resolve(__dirname, 'dist/esm/__tests__'),
  sourcemap: true,
  keepNames: true,
  plugins: [
    {
      name: 'example',
      setup(build) {
        let now;
        build.onStart(result => {
          now = Date.now();
        });
        build.onEnd(result => {
          console.log(`Build done in ${getElapsed(Date.now(), now)}s, with ${result.errors.length} errors.`);
          now = Date.now();
          console.log('verifying typings');
          try {
            execSync('npm run verify');
            console.log(`verified typings done in ${getElapsed(Date.now(), now)}.`);
          } catch (ex) {
            process.stdout.write(ex.stdout);
          }
        });
      }
    }
  ]
}).then((ctx) => {
  if (/^true/.test(process.env.NODE_ENV)) {
    ctx.watch();
  }
}).catch(err => {
  process.stderr.write(err.stderr);
  process.exit(1);
});

/**
 * @param {number} now
 * @param {number} then
 */
const getElapsed = (now, then) => {
  return ((now - then) / 1000).toFixed(2);
}

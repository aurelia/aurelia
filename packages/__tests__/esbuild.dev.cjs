/* eslint-disable */
const fs = require('fs');
const { resolve, join } = require('path');
const { build } = require('esbuild');

/**
 * @param {string} startPath
 * @param {string} filter
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
    else if (filename.endsWith(filter)) {
      found.push(filename);
    }
  }
  return found;
};

build({
  entryPoints: findByExt('./', '.ts'),
  outdir: resolve(__dirname, 'dist/esm/__tests__'),
  sourcemap: true,
  watch: /true/.test(process.env.__DEV__),
  plugins: [
    {
      name: 'example',
      setup(build) {
        let now;
        build.onStart(result => {
          now = Date.now();
        });
        build.onEnd(result => {
          console.log(`Build done in ${((Date.now() - now) / 1000).toFixed(2)}s, with ${result.errors.length} errors.`);
        });
      }
    }
  ]
}).catch(err => {
  process.stderr.write(err.stderr);
  process.exit(1);
});

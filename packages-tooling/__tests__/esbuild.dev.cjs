/* eslint-disable */
const fs = require('fs');
const { resolve, join } = require('path');
const { context } = require('esbuild');
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

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = join(src, entry);
    const d = join(dest, entry);
    const st = fs.lstatSync(s);
    if (st.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

const allEntries = findByExt('./src', /\.tsx?$/) || [];

// ignore plugin-conventions goldens (they're intentionally not valid TS)
const entryPoints = allEntries.filter(p => !/[\/\\]plugin-conventions[\/\\]golden[\/\\]/.test(p));
context({
  entryPoints,
  outdir: resolve(__dirname, 'dist/cjs'),
  sourcemap: true,
  keepNames: true,
  format: 'cjs',
  plugins: [
    {
      name: 'example',
      setup(build) {
        let now;
        const goldenRel = join('plugin-conventions', 'golden');
        const srcGolden = resolve(process.cwd(), 'src', goldenRel);
        const distGolden = resolve(__dirname, 'dist/cjs', goldenRel);
        build.onStart(result => {
          now = Date.now();
          // Make sure the golden tree is present before/after the first build as well
          copyDirSync(srcGolden, distGolden);
        });
        build.onEnd(result => {
          console.log(`Build done in ${getElapsed(Date.now(), now)}s, with ${result.errors.length} errors.`);
          now = Date.now();
          // Keep dist in sync on every rebuild (includes manifest.json and .ts golden files)
          copyDirSync(srcGolden, distGolden);
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
}).then(ctx => {
  if (/^true$/.test(process.env.DEV_MODE)) {
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

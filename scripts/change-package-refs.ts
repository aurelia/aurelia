import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';

const log = createLogger('change-package-refs');

const refs = {
  tsc: {
    'main': 'dist/build/index.js',
    'module': 'dist/build/index.js',
    'jsnext:main': 'dist/build/index.js',
    'browser': 'dist/build/index.js'
  },
  rollup: {
    'main': 'dist/index.umd.js',
    'module': 'dist/index.es6.js',
    'jsnext:main': 'dist/index.es6.js',
    'browser': 'dist/index.umd.js'
  }
};

const fields = ['main', 'module', 'jsnext:main', 'browser'];

async function run(): Promise<void> {
  const ref = process.argv.slice(2)[0];

  for (const { name } of project.packages) {
    log(`changing package.json fields to ${ref} for: ${c.magentaBright(name.npm)}`);
    const pkg = await loadPackageJson('packages', name.kebab);
    for (const field of fields) {
      pkg[field] = refs[ref][field];
    }
    await savePackageJson(pkg, 'packages', name.kebab);
  }
}

run().then(() => {
  log(`Done.`);
});

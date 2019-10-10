import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';

const log = createLogger('change-package-refs');

const refs = {
  dev: {
    'main': 'dist/esnext/index.js',
    'module': 'dist/esnext/index.js',
  },
  release: {
    'main': 'dist/umd/index.js',
    'module': 'dist/esnext/index.js',
  }
};

const fields = ['main', 'module'];

(async function (): Promise<void> {
  const ref = process.argv.slice(2)[0];

  for (const { name } of project.packages) {
    log(`changing package.json fields to ${ref} for: ${c.magentaBright(name.npm)}`);
    const pkg = await loadPackageJson('packages', name.kebab);
    for (const field of fields) {
      pkg[field] = refs[ref][field];
    }
    await savePackageJson(pkg, 'packages', name.kebab);
  }

  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});

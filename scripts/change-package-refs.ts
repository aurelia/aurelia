import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';

const log = createLogger('change-package-refs');

const refs = {
  dev: {
    'main': 'dist/esm/index.js',
    'module': 'dist/esm/index.js',
  },
  release: {
    'main': 'dist/cjs/index.js',
    'module': 'dist/esm/index.js',
  }
};

const fields = ['main', 'module'];

(async function (): Promise<void> {
  const [, , ref, type] = process.argv;

  for (const { name, folder } of project.packages.filter(p => !p.name.kebab.includes('_') && p.folder.includes('packages'))) {
    log(`changing package.json fields to ${ref} for: ${c.magentaBright(name.npm)}`);
    const pkg = await loadPackageJson(folder, name.kebab);
    for (const field of fields) {
      pkg[field] = refs[ref][field];
    }
    if (type) {
      if (type === 'none') {
        if (pkg.bin) {
          log(`saw a 'bin' field, so leaving the package.json "type" field as-is for: ${c.magentaBright(name.npm)}`);
        } else {
          log(`removing the package.json "type" field for: ${c.magentaBright(name.npm)}`);
          pkg['type'] = void 0;
        }
      } else {
        log(`changing package.json "type" to ${type} for: ${c.magentaBright(name.npm)}`);
        pkg['type'] = type;
      }
    }
    await savePackageJson(pkg, folder, name.kebab);
  }

  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});

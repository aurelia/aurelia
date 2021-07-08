import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';
import { execSync } from 'child_process';
import { join } from 'path';

const log = createLogger('publish');

(async function (): Promise<void> {
  const [, , type] = process.argv;

  for (const { name, folder }
    of project.packages
      .filter(
        p => !p.name.kebab.includes('_')
        && p.folder.includes('packages')
      )
  ) {
    log(`publishing`);
    const pkg = await loadPackageJson(folder, name.kebab);
    if (pkg.private) {
        continue;
    }

    execSync(`cd ${join(folder, name.kebab)} && npm run publish:${type}`);

    // const isCjsPackage = folder.includes('packages-cjs');
    // const refs = isCjsPackage ? cjsRefs : webRefs;
    // for (const field of fields) {
    //   pkg[field] = refs[ref][field];
    // }
    // if (type) {
    //   if (type === 'none') {
    //     if (pkg.bin) {
    //       log(`saw a 'bin' field, so leaving the package.json "type" field as-is for: ${c.magentaBright(name.npm)}`);
    //     } else {
    //       log(`removing the package.json "type" field for: ${c.magentaBright(name.npm)}`);
    //       pkg['type'] = void 0;
    //     }
    //   } else {
    //     log(`changing package.json "type" to ${type} for: ${c.magentaBright(name.npm)}`);
    //     pkg['type'] = type;
    //   }
    // }
    // await savePackageJson(pkg, folder, name.kebab);
  }

  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});

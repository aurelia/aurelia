// @ts-nocheck
// import { createLogger } from './logger';
import { loadPackageJson } from './package.json';
import project from './project';
import { execSync } from 'child_process';
import { join } from 'path';

// const log = createLogger('publish');

(async function (): Promise<void> {
  const [, , channel/* dev/latest */] = process.argv;

  for (const { name, folder }
    of project.packages
      .filter(
        p => !p.name.kebab.includes('_')
        && p.folder.includes('packages')
      )
  ) {
    console.log(`publishing`);
    const pkg = await loadPackageJson(folder, name.kebab);
    if (pkg.private) {
        continue;
    }

    execSync(`cd ${join(folder, name.kebab)} && npm run publish:${channel}`);
  }

  console.log('Done.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});

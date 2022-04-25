import { loadPackageJson } from './package.json';
import project from './project';
import { execSync } from 'child_process';
import { join } from 'path';

(async function (): Promise<void> {
  const [, , channel/* dev or latest */] = process.argv;

  console.log(`Publishing for channel: ${channel}`);

  for (const { name, folder }
    of project.packages
      .filter(
        p => !p.name.kebab.includes('_')
        && p.folder.includes('packages')
      )
  ) {
    console.log(`publishing [${channel}] ${join(folder, name.kebab)}`);
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

import { readFileSync, writeFileSync } from 'fs';
import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';
import { getCurrentVersion, getNewVersion } from './get-version-info';

const log = createLogger('bump-version');

export async function updateDependencyVersions(newVersion: string): Promise<void> {
  const aureliaRegExp = /^@aurelia/;
  for (const { name } of project.packages) {
    log(`updating dependencies for ${c.magentaBright(name.npm)}`);
    const pkg = await loadPackageJson('packages', name.kebab);
    pkg.version = newVersion;
    if ('dependencies' in pkg) {
      const deps = pkg.dependencies;
      for (const depName in deps) {
        if (aureliaRegExp.test(depName)) {
          log(`  dep ${name.npm} ${c.yellow(deps[depName])} -> ${c.greenBright(newVersion)}`);
          deps[depName] = newVersion;
        }
      }
    }
    await savePackageJson(pkg, 'packages', name.kebab);
  }
  const lernaJson = JSON.parse(readFileSync(project['lerna.json'].path, { encoding: 'utf8' }));
  lernaJson.version = newVersion;
  writeFileSync(project['lerna.json'].path, `${JSON.stringify(lernaJson, null, 2)}\n`, { encoding: 'utf8' });
}

function parseArgs(): {tag: string; suffix: string} {
  const args = process.argv.slice(2);
  const tag = args[0];
  const suffix = args[1] || '';
  log(args.join(' '));
  return { tag, suffix };
}

async function run(): Promise<void> {
  const { tag, suffix } = parseArgs();
  const { major, minor, patch } = getCurrentVersion();
  const newVersion = getNewVersion(major, minor, patch, tag, suffix);
  if (tag === 'dev') {
    await updateDependencyVersions(newVersion);
  }
}

run().then(() => {
  log(`Done.`);
});

import { readFileSync, writeFileSync } from 'fs';
import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';
import { getGitLog } from './git';
import { getCurrentVersion, getNewVersion } from './get-version-info';

const log = createLogger('bump-version');

export async function updateDependencyVersions(newVersion: string): Promise<void> {
  for (const { name } of project.packages) {
    log(`updating dependencies for ${c.magentaBright(name.npm)}`);
    const pkg = await loadPackageJson('packages', name.kebab);
    pkg.version = newVersion;
    if ('dependencies' in pkg) {
      const deps = pkg.dependencies;
      for (const depName in deps) {
        if (depName.startsWith("@aurelia")) {
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

export async function getRecommendedVersionBump(): Promise<'minor' | 'patch'> {
  const gitLog = await getGitLog(`v${project.lerna.version}`, 'HEAD', project.path);
  const lines = gitLog.split('\n');
  if (lines.some(line => /feat(\([^)]+\))?:/.test(line))) {
    return 'minor';
  } else {
    return 'patch';
  }
}

function parseArgs(): {tag: string; suffix: string} {
  const args = process.argv.slice(2);
  const tag = args[0];
  const suffix = args[1] || '';
  log(args.join(' '));
  return { tag, suffix };
}

(async function (): Promise<void> {
  const { tag, suffix } = parseArgs();
  const { major, minor, patch } = getCurrentVersion();
  const bump = await getRecommendedVersionBump();
  const newVersion = getNewVersion(major, minor, patch, tag, bump, suffix);
  if (tag === 'dev') {
    await updateDependencyVersions(newVersion);
  }
  log('Done.');
})().catch(err => {
  log.error(err);
  process.exit(1);
});

import { readFileSync, writeFileSync } from 'fs';
import { c, createLogger } from './logger';
import { loadPackageJson, Package, savePackageJson } from './package.json';
import project from './project';
import { getGitLog, git } from './git';
import { getCurrentVersion, getNewVersion } from './get-version-info';

const log = createLogger('bump-version');

export async function updateDependencyVersions(newVersion: string): Promise<void> {
  for (const { name, folder } of project.packages) {
    log(`updating dependencies for ${c.magentaBright(name.npm)}`);
    const pkg = await loadPackageJson(folder, name.kebab);
    if (/^\/?packages/.test(folder) || pkg.private !== true) {
      pkg.version = newVersion;
    }
    if ('dependencies' in pkg) {
      const deps = pkg.dependencies;
      for (const depName in deps) {
        if (depName.startsWith('@aurelia') || depName === 'aurelia') {
          log(`  dep ${name.npm} ${c.yellow(deps[depName])} -> ${c.greenBright(newVersion)}`);
          deps[depName] = newVersion;
        }
      }
    }
    if ('devDependencies' in pkg) {
      const deps = pkg.devDependencies;
      for (const depName in deps) {
        if (depName.startsWith('@aurelia') || depName === 'aurelia') {
          log(`  dep ${name.npm} ${c.yellow(deps[depName])} -> ${c.greenBright(newVersion)}`);
          deps[depName] = newVersion;
        }
      }
    }
    await savePackageJson(pkg, folder, name.kebab);
  }
  const pkgJson = JSON.parse(readFileSync(project['package.json'].path, { encoding: 'utf8' })) as Package;
  pkgJson.version = newVersion;
  writeFileSync(project['package.json'].path, `${JSON.stringify(pkgJson, null, 2)}\n`, { encoding: 'utf8' });
}

async function hasTag(tag: string): Promise<boolean> {
  try {
    await git(`show-ref --tags --verify --quiet refs/tags/${tag}`);
    return true;
  } catch {
    return false;
  }
}

async function getLatestTag(): Promise<string | null> {
  try {
    const tag = (await git('describe --tags --abbrev=0')).trim();
    return tag.length > 0 ? tag : null;
  } catch {
    return null;
  }
}

export async function getRecommendedVersionBump(): Promise<'minor' | 'patch'> {
  const desiredTag = `v${project.pkg.version}`;
  let fromTag = desiredTag;

  if (!(await hasTag(fromTag))) {
    const fallbackTag = await getLatestTag();
    if (fallbackTag) {
      log(`${c.yellow('missing tag')} ${desiredTag}; using ${fallbackTag} instead`);
      fromTag = fallbackTag;
    } else {
      log(`${c.yellow('missing tag')} ${desiredTag}; no tags available, defaulting to patch`);
      return 'patch';
    }
  }

  try {
    const gitLog = await getGitLog(fromTag, 'HEAD', project.path);
    const lines = gitLog.split('\n');
    return lines.some(line => /feat(\([^)]+\))?:/.test(line)) ? 'minor' : 'patch';
  } catch (error) {
    log(`${c.yellow('git log failed')}; defaulting to patch`);
    log.error(error);
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
  if (Boolean(tag) && !tag.includes('.')) {
    const { major, minor, patch } = getCurrentVersion();
    const bump = await getRecommendedVersionBump();
    const newVersion = getNewVersion(major, minor, patch, tag, bump, suffix);
    if (tag === 'dev') {
      await updateDependencyVersions(newVersion);
    }
    log('Done.');
  }
})().catch(err => {
  log.error(err);
  process.exit(1);
});

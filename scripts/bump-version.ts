import { readFileSync, writeFileSync } from 'fs';
import { c, createLogger } from './logger';
import { loadPackageJson, savePackageJson } from './package.json';
import project from './project';

const log = createLogger('bump-version');

export function getCurrentVersion(): {major: string; minor: string; patch: string} {
  const versionRegExp = /(\d+)\.(\d+)\.(\d+)($|\-)/;
  const match = project.lerna.version.match(versionRegExp);
  if (match === null) {
    throw new Error(`lerna.json 'version' should match ${versionRegExp}`);
  }
  const major = match[1];
  const minor = match[2];
  const patch = match[3];
  log(`${c.cyan('current version')} ${major}.${minor}.${patch}`);
  return { major, minor, patch };
}

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
  writeFileSync(project['lerna.json'].path, JSON.stringify(lernaJson, null, 2), { encoding: 'utf8' });
}

export function getDate(sep?: string): string {
  const s = sep === undefined ? '' : sep;
  const raw = new Date().toISOString().replace(/:|T|\.|-/g, '').slice(0, 8);
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  return `${y}${s}${m}${s}${d}`;
}

export function getNewVersion(major: string | number, minor: string | number, patch: string | number, tag: string): string {
  let newVersion: string;
  switch (tag) {
    case 'dev':
      newVersion = `${major}.${minor}.${patch}-${tag}.${getDate()}`;
      break;
    case 'latest':
      newVersion = `${major}.${minor}.${patch}`;
      break;
    default:
      throw new Error(`Invalid tag "${tag}"`);
  }
  log(`${c.cyan('new version')} ${newVersion}`);
  return newVersion;
}

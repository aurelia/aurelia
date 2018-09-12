import lerna from 'lerna';
import * as l from 'fancy-log';
const log = <typeof import('fancy-log')>(<any>l.default || l);
import * as c from 'chalk';
const chalk = <import('chalk').Chalk>(c.default || c);
import project from './project';
import { loadPackageJson, savePackageJson } from './package.json';

function parseArgs() {
  const args = process.argv.slice(2);
  const tag = args[0];
  log(`> ${chalk.green('publish')} ${args.join(' ')}`);
  return { tag };
}

async function getCurrentVersion() {
  const versionRegExp = /(\d+)\.(\d+)\.(\d+)($|\-)/;
  const match = project.lerna.version.match(versionRegExp);
  if (match === null) {
    throw new Error( `lerna.json 'version' should match ${versionRegExp}`);
  }
  const major = match[1];
  const minor = match[2];
  const patch = match[3];
  log(`> ${chalk.green('publish')} ${chalk.cyan('current version')} ${major}.${minor}.${patch}`);
  return { major, minor, patch };
}

async function updateDependencyVersions(newVersion: string) {
  const aureliaRegExp = /^@aurelia/
  for (const { name, scopedName } of project.packages) {
    log(`> ${chalk.green('publish')} updating dependencies for ${chalk.magentaBright(scopedName)}`);
    const pkg = await loadPackageJson('packages', name);
    pkg.version = newVersion;
    if ('dependencies' in pkg) {
      const deps = pkg.dependencies;
      for (const depName in deps) {
        if (aureliaRegExp.test(depName)) {
          log(`> ${chalk.green('publish')}   dep ${scopedName} ${chalk.yellow(deps[depName])} -> ${chalk.greenBright(newVersion)}`);
          deps[depName] = newVersion;
        }
      }
      await savePackageJson(pkg, 'packages', name);
    }
  }
}

function getNewVersion(major: string, minor: string, patch: string, tag: string): string {
  let newVersion: string;
  switch (tag) {
    case 'dev':
      const date = new Date().toISOString().replace(/:|T|\.|-/g, '').slice(0, 8);
      newVersion = `${major}.${minor}.${patch}-${tag}.${date}`;
      break;
    case 'latest':
      newVersion = `${major}.${minor}.${patch}`;
      break;
    default:
      throw new Error(`Invalid tag "${tag}"`);
  }
  log(`> ${chalk.green('publish')} ${chalk.cyan('nightly version')} ${newVersion}`);
  return newVersion;
}

async function run() {
  const { tag } = parseArgs();
  const { major, minor, patch } = await getCurrentVersion();
  const newVersion = getNewVersion(major, minor, patch, tag);
  if (tag === 'dev') {
    await updateDependencyVersions(newVersion);
  }
  lerna(['publish', newVersion, '--npm-tag', tag, '--no-git-tag-version', '--no-push', '--no-verify-registry', '--no-verify-access', '-y']);
}

run().then(() => {
  log(`> ${chalk.green('publish')} Done.`);
});

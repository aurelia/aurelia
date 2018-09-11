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
  log(`> ${chalk.green('publish-nightly')} ${args.join(' ')}`);
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
  log(`> ${chalk.green('publish-nightly')} ${chalk.cyan('current version')} ${major}.${minor}.${patch}`);
  return { major, minor, patch };
}

async function updateDependencyVersions(newVersion: string) {
  const aureliaRegExp = /^@aurelia/
  for (const { name, scopedName } of project.packages) {
    log(`> ${chalk.green('publish-nightly')} updating dependencies for ${chalk.magentaBright(scopedName)}`);
    const pkg = await loadPackageJson('packages', name);
    pkg.version = newVersion;
    if ('dependencies' in pkg) {
      const deps = pkg.dependencies;
      for (const depName in deps) {
        if (aureliaRegExp.test(depName)) {
          log(`> ${chalk.green('publish-nightly')}   dep ${scopedName} ${chalk.yellow(deps[depName])} -> ${chalk.greenBright(newVersion)}`);
          deps[depName] = newVersion;
        }
      }
      await savePackageJson(pkg, 'packages', name);
    }
  }
}

function getNightlyVersion(major: string, minor: string, patch: string, tag: string): string {
  const date = new Date().toISOString().replace(/:|T|\.|-/g, '').slice(0, 8);
  const nightlyVersion = `${major}.${minor}.${patch}-${tag}.${date}`;
  log(`> ${chalk.green('publish-nightly')} ${chalk.cyan('nightly version')} ${nightlyVersion}`);
  return nightlyVersion;
}

async function run() {
  const { tag } = parseArgs();
  const { major, minor, patch } = await getCurrentVersion();
  const nightlyVersion = getNightlyVersion(major, minor, patch, tag);
  await updateDependencyVersions(nightlyVersion);
  lerna(['publish', nightlyVersion, '--npm-tag', tag, '--no-git-tag-version', '--no-push', '--no-verify-registry', '--no-verify-access', '-y']);
}

run().then(() => {
  log(`> ${chalk.green('publish-nightly')} Done.`);
});

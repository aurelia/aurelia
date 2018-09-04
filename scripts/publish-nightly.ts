import { normalize } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import * as lerna from 'lerna';
import * as log from 'fancy-log';
import chalk from 'chalk';

interface LernaJson {
  lerna: string;
  packages: string[];
  version: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const tag = args[0];
  const lernaJsonFilePath = normalize(args[1]);
  log(`> ${chalk.green('publish-nightly')} ${args.join(' ')}`);
  return { tag, lernaJsonFilePath };
}

function getCurrentVersion(lernaJsonFilePath: string) {
  const lernaJsonValue: LernaJson = JSON.parse(readFileSync(lernaJsonFilePath, { encoding: 'utf8' }).toString());
  const versionRegExp = /(\d+)\.(\d+)\.(\d+)($|\-)/;
  const match = lernaJsonValue.version.match(versionRegExp);
  if (match === null) {
    throw new Error( `lerna.json 'version' should match ${versionRegExp}`);
  }
  const major = match[1];
  const minor = match[2];
  const patch = match[3];
  log(`> ${chalk.green('publish-nightly')} ${chalk.cyan('current version')} ${major}.${minor}.${patch}`);
  return { major, minor, patch };
}

function getNightlyVersion(major: string, minor: string, patch: string, tag: string): string {
  const date = new Date().toISOString().replace(/:|T|\.|-/g, '').slice(0, 8);
  const nightlyVersion = `${major}.${minor}.${patch}-${tag}.${date}`;
  log(`> ${chalk.green('publish-nightly')} ${chalk.cyan('nightly version')} ${nightlyVersion}`);
  return nightlyVersion;
}

function run(): void {
  const { tag, lernaJsonFilePath } = parseArgs();
  const { major, minor, patch } = getCurrentVersion(lernaJsonFilePath);
  const nightlyVersion = getNightlyVersion(major, minor, patch, tag);
  lerna(['publish', nightlyVersion, '--npm-tag', tag, '--no-git-tag-version', '--no-push', '-y']);
}

run();

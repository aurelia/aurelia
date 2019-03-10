import { c, createLogger } from './logger';
import project from './project';

const log = createLogger('get-version-info');

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

export function getDate(sep?: string): string {
  const s = sep === undefined ? '' : sep;
  const raw = new Date().toISOString().replace(/:|T|\.|-/g, '').slice(0, 8);
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  return `${y}${s}${m}${s}${d}`;
}

export function getNewVersion(major: string | number, minor: string | number, patch: string | number, tag: string, suffix: string): string {
  let newVersion: string;
  switch (tag) {
    case 'dev':
      newVersion = `${major}.${minor}.${patch}-${tag}.${getDate()}${suffix}`;
      break;
    case 'latest':
      newVersion = `${major}.${minor}.${patch}${suffix}`;
      break;
    default:
      throw new Error(`Invalid tag "${tag}"`);
  }
  log(`${c.cyan('new version')} ${newVersion}`);
  return newVersion;
}

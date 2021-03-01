import { c, createLogger } from './logger';
import project from './project';

const log = createLogger('get-version-info');

export function getCurrentVersion(): {major: string; minor: string; patch: string} {
  const versionRegExp = /(\d+)\.(\d+)\.(\d+)($|-)/;
  const match = versionRegExp.exec(project.pkg.version);
  if (match === null) {
    throw new Error(`pkg.json 'version' should match ${versionRegExp}`);
  }
  const major = match[1];
  const minor = match[2];
  const patch = match[3];
  log(`${c.cyan('current version')} ${major}.${minor}.${patch}`);
  return { major, minor, patch };
}

export function getDate(sep?: string): string {
  const s = sep === undefined ? '' : sep;
  const raw = new Date().toISOString().replace(/:|T|\.|-/g, '').slice(0, 12);
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const hh = raw.slice(8, 10);
  const mm = raw.slice(10, 12);
  return `${y}${s}${m}${s}${d}${hh}${mm}`;
}

export function getNewVersion(
  major: string | number,
  minor: string | number,
  patch: string | number,
  tag: string,
  bump: 'major' | 'minor' | 'patch' | 'none',
  suffix: string,
): string {
  let newMajor = typeof major === 'number' ? major : parseInt(major, 10);
  let newMinor = typeof minor === 'number' ? minor : parseInt(minor, 10);
  let newPatch = typeof patch === 'number' ? patch : parseInt(patch, 10);

  switch (bump) {
    case 'major':
      newMajor += 1;
      newMinor = 0;
      newPatch = 0;
      break;
    case 'minor':
      newMinor += 1;
      newPatch = 0;
      break;
    case 'patch':
      newPatch += 1;
      break;
  }

  let newVersion: string;
  switch (tag) {
    case 'dev':
      newVersion = `${newMajor}.${newMinor}.${newPatch}-${tag}.${getDate()}${suffix}`;
      break;
    case 'latest':
      newVersion = `${newMajor}.${newMinor}.${newPatch}${suffix}`;
      break;
    default:
      throw new Error(`Invalid tag "${tag}"`);
  }
  log(`${c.cyan('new version')} ${newVersion}`);
  return newVersion;
}

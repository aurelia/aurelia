import { join } from 'path';
import project from './project';
import { writeFileSync, appendFileSync, readFileSync, existsSync } from 'fs';
import { getCurrentVersion, getNewVersion, getDate } from './bump-version';
import { getGitLog } from './git';
import { createLogger, c } from './logger';

const log = createLogger('generate-changelog');
;

function toUrl(hash: string): string {
  return `([${hash}](https://github.com/aurelia/aurelia/commit/${hash}))`;
}

interface ILogRecord {
  hash: string;
  scope: string;
  message: string;
}
interface IChangeLog {
  feat: ILogRecord[];
  fix: ILogRecord[];
  perf: ILogRecord[];
  refactor: ILogRecord[];
}

const regex = {
  commit: /^commit ([0-9a-f]{40})$/i,
  feat: /feat\((.*)\):\s*(.*)$/i,
  fix: /fix\((.*)\):\s*(.*)$/i,
  perf: /perf\((.*)\):\s*(.*)$/i,
  refactor: /refactor\((.*)\):\s*(.*)$/i
};

async function getRawChangeLog(from: string, to: string, path: string) {
  const gitLog = await getGitLog(from, to, path);
  const lines = gitLog.split('\n');
  const results: IChangeLog = {
    feat: [],
    fix: [],
    perf: [],
    refactor: []
  };
  let match: RegExpExecArray;
  let currentHash = '';
  let type = '';

  for (const line of lines) {
    if (match = regex.commit.exec(line)) {
      currentHash = match[1].slice(0, 7);
      type = null;
    } else if (match = regex.feat.exec(line)) {
      type = 'feat';
    } else if (match = regex.fix.exec(line)) {
      type = 'fix';
    } else if (match = regex.perf.exec(line)) {
      type = 'perf';
    } else if (match = regex.refactor.exec(line)) {
      type = 'refactor';
    } else {
      type = null;
    }
    if (type !== null) {
      const result = {
        hash: currentHash,
        scope: match[1],
        message: match[2]
      };
      log.info(`${type}(${result.scope}): ${result.message}`)
      results[type].push(result);
    }
  }
  return results;
}

async function getChangeLogContent(from: string, to: string, path: string, pkgName?: string, newVersion?: string) {
  const changelog = await getRawChangeLog(from, to, path);

  if (newVersion === undefined) {
    const { major, minor, patch } = getCurrentVersion();
    if (changelog.feat.length > 0) {
      newVersion = getNewVersion(major, parseInt(minor, 10) + 1, patch, 'latest');
    } else {
      newVersion = getNewVersion(major, minor, parseInt(patch, 10) + 1, 'latest');
    }
  } else if (pkgName === undefined) {
    if (pkgName === undefined) {
      throw new Error('if newVersion is specified, pkgName must be too');
    }
  }

  let content = `<a name="${newVersion}"></a>\n# ${newVersion} (${getDate('-')})`;

  let hasChanges = false;
  if (changelog.feat.length) {
    hasChanges = true;
    content += '\n\n### Features:\n\n';
    for (const feat of changelog.feat) {
      content += `* **${feat.scope}:** ${feat.message} ${toUrl(feat.hash)}\n`;
    }
  }

  if (changelog.fix.length) {
    hasChanges = true;
    content += '\n\n### Bug Fixes:\n\n';
    for (const fix of changelog.fix) {
      content += `* **${fix.scope}:** ${fix.message} ${toUrl(fix.hash)}\n`;
    }
  }

  if (changelog.perf.length) {
    hasChanges = true;
    content += '\n\n### Performance Improvements:\n\n';
    for (const perf of changelog.perf) {
      content += `* **${perf.scope}:** ${perf.message} ${toUrl(perf.hash)}\n`;
    }
  }

  if (changelog.refactor.length) {
    hasChanges = true;
    content += '\n\n### Refactorings:\n\n';
    for (const refactor of changelog.refactor) {
      content += `* **${refactor.scope}:** ${refactor.message} ${toUrl(refactor.hash)}\n`;
    }
  }

  if (!hasChanges) {
    content += `\n\n**Note:** Version bump only for package ${pkgName}\n`;
  }

  content += '\n'

  return { content, newVersion };
}

export async function generateChangeLog(from: string, to: string) {
  const standardHeader = `# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

`;

  const currentAnchor = `<a name="${from.startsWith('v') ? from.slice(1) : from}"></a>`;
  const currentChangelog = readFileSync(project.changelog.path, { encoding: 'utf8' });
  const currentParts = currentChangelog.split(currentAnchor);

  const { content: newChangeLog, newVersion } = await getChangeLogContent(from, to, project.path);
  const newContent = standardHeader + newChangeLog + currentAnchor + (currentParts[1] || '');
  writeFileSync(project.changelog.path, newContent, { encoding: 'utf8' });

  for (const pkg of project.packages) {
    let existingChangeLog = '';
    if (existsSync(pkg.changelog.path)) {
      const currentPkgChangelog = readFileSync(pkg.changelog.path, { encoding: 'utf8' });
      const currentPkgParts = currentPkgChangelog.split(currentAnchor);
      const existingPart = currentPkgParts[1];
      if (existingPart && existingPart.length) {
        existingChangeLog = currentAnchor + existingPart;
      }
    }

    const { content: newPkgChangeLog } = await getChangeLogContent(from, to, pkg.path, pkg.scopedName, newVersion);
    const newPkgContent = standardHeader + newPkgChangeLog + existingChangeLog;
    writeFileSync(pkg.changelog.path, newPkgContent, { encoding: 'utf8' });
  }

  return newVersion;
}

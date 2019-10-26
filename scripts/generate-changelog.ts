import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getGitLog } from './git';
import { createLogger } from './logger';
import project from './project';

const log = createLogger('generate-changelog');

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
  feat: /feat(.*):\s*(.*)$/i,
  fix: /fix(.*):\s*(.*)$/i,
  perf: /perf(.*):\s*(.*)$/i,
  refactor: /refactor(.*):\s*(.*)$/i
};

function getCurrentVersion(): {
  major: string;
  minor: string;
  patch: string;
} {
  const versionRegExp = /(\d+)\.(\d+)\.(\d+)($|-)/;
  const match = versionRegExp.exec(project.lerna.version);

  return {
    major: match[1],
    minor: match[2],
    patch: match[3],
  };
}

async function getRawChangeLog(
  fromRevision: string,
  toRevision: string,
  pathRef: string,
): Promise<IChangeLog> {
  const gitLog = await getGitLog(fromRevision, toRevision, pathRef);
  const lines = gitLog.split('\n');
  const results: IChangeLog = {
    feat: [],
    fix: [],
    perf: [],
    refactor: []
  };
  let match: RegExpExecArray;
  let currentHash = '';
  let Type = '';

  for (const line of lines) {
    if (match = regex.commit.exec(line)) {
      currentHash = match[1].slice(0, 7);
      Type = null;
    } else if (match = regex.feat.exec(line)) {
      Type = 'feat';
    } else if (match = regex.fix.exec(line)) {
      Type = 'fix';
    } else if (match = regex.perf.exec(line)) {
      Type = 'perf';
    } else if (match = regex.refactor.exec(line)) {
      Type = 'refactor';
    } else {
      Type = null;
    }

    if (Type !== null) {
      const result = {
        hash: currentHash,
        scope: match[1].length > 0 ? match[1].slice(1, -1) : '*',
        message: match[2]
      };
      log.info(`${Type}(${result.scope}): ${result.message}`);
      results[Type].push(result);
    }
  }

  return results;
}

async function getChangeLogContent(
  fromRevision: string,
  toRevision: string,
  pathRef: string,
  pkgName?: string,
  newVersion?: string,
): Promise<{
    content: string;
    newVersion: string;
  }> {
  const changelog = await getRawChangeLog(fromRevision, toRevision, pathRef);

  if (newVersion === void 0) {
    const { major, minor, patch } = getCurrentVersion();
    if (changelog.feat.length > 0) {
      newVersion = `${major}.${parseInt(minor, 10) + 1}.0`;
    } else {
      newVersion = `${major}.${minor}.${parseInt(patch, 10) + 1}`;
    }
  }

  const datestamp = new Date().toISOString().split('T')[0];
  let content = `<a name="${newVersion}"></a>\n# ${newVersion} (${datestamp})`;

  let hasChanges = false;
  if (changelog.feat.length > 0) {
    hasChanges = true;
    content += '\n\n### Features:\n\n';

    for (const feat of changelog.feat) {
      content += `* **${feat.scope}:** ${feat.message} ${toUrl(feat.hash)}\n`;
    }
  }

  if (changelog.fix.length > 0) {
    hasChanges = true;
    content += '\n\n### Bug Fixes:\n\n';

    for (const fix of changelog.fix) {
      content += `* **${fix.scope}:** ${fix.message} ${toUrl(fix.hash)}\n`;
    }
  }

  if (changelog.perf.length > 0) {
    hasChanges = true;
    content += '\n\n### Performance Improvements:\n\n';

    for (const perf of changelog.perf) {
      content += `* **${perf.scope}:** ${perf.message} ${toUrl(perf.hash)}\n`;
    }
  }

  if (changelog.refactor.length > 0) {
    hasChanges = true;
    content += '\n\n### Refactorings:\n\n';

    for (const refactor of changelog.refactor) {
      content += `* **${refactor.scope}:** ${refactor.message} ${toUrl(refactor.hash)}\n`;
    }
  }

  if (!hasChanges) {
    content += `\n\n**Note:** Version bump only for package ${pkgName}\n`;
  }

  content += '\n';

  return { content, newVersion };
}

export async function generateChangeLog(
  fromRevision: string,
  toRevision: string,
): Promise<string> {
  const standardHeader = `# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

`;

  const currentAnchor = `<a name="${fromRevision.startsWith('v') ? fromRevision.slice(1) : fromRevision}"></a>`;
  const currentChangelog = readFileSync(project.changelog.path, { encoding: 'utf8' });
  const currentParts = currentChangelog.split(currentAnchor);

  const { content: newChangeLog, newVersion } = await getChangeLogContent(fromRevision, toRevision, project.path);
  const newContent = standardHeader + newChangeLog + currentAnchor + (currentParts[1] || '');
  writeFileSync(project.changelog.path, newContent, { encoding: 'utf8' });

  for (const pkg of project.packages) {
    let existingChangeLog = '';
    if (existsSync(pkg.changelog)) {
      const currentPkgChangelog = readFileSync(pkg.changelog, { encoding: 'utf8' });
      const currentPkgParts = currentPkgChangelog.split(currentAnchor);
      const existingPart = currentPkgParts[1];
      if (existingPart && existingPart.length) {
        existingChangeLog = currentAnchor + existingPart;
      }
    }

    const { content: newPkgChangeLog } = await getChangeLogContent(fromRevision, toRevision, pkg.path, pkg.name.npm, newVersion);
    const newPkgContent = standardHeader + newPkgChangeLog + existingChangeLog;
    writeFileSync(pkg.changelog, newPkgContent, { encoding: 'utf8' });
  }

  return newVersion;
}

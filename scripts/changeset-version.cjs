const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { getCommitsThatAddFiles } = require('@changesets/git');

const rootDir = path.resolve(__dirname, '..');
const changesetDir = path.join(rootDir, '.changeset');
const configPath = path.join(changesetDir, 'config.json');
const prePath = path.join(changesetDir, 'pre.json');
const docsChangelogPath = path.join(rootDir, 'docs', 'CHANGELOG.md');
const defaultRepo = 'aurelia/aurelia';
const rootPackagePath = path.join(rootDir, 'packages', 'aurelia', 'package.json');

const defaultHeaderLines = [
  '# Change Log',
  '',
  'All notable changes to this project will be documented in this file.',
  'See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.',
  ''
];

function getChangesetFiles() {
  if (!fs.existsSync(changesetDir)) return [];
  return fs.readdirSync(changesetDir)
    .filter(file => file.endsWith('.md') && file !== 'README.md')
    .map(file => path.join(changesetDir, file))
    .sort();
}

function getPreInfo() {
  if (!fs.existsSync(prePath)) return null;
  return JSON.parse(fs.readFileSync(prePath, 'utf8'));
}

function filterConsumedChangesets(files, preInfo) {
  if (!preInfo || preInfo.mode !== 'pre' || !Array.isArray(preInfo.changesets)) {
    return files;
  }
  const consumed = new Set(preInfo.changesets);
  return files.filter(file => !consumed.has(path.basename(file, '.md')));
}

function parseChangeset(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const id = path.basename(filePath, '.md');

  const firstDash = lines.findIndex(line => line.trim() === '---');
  const secondDash = lines.findIndex((line, index) => index > firstDash && line.trim() === '---');
  if (firstDash === -1 || secondDash === -1) return null;

  const frontmatter = lines.slice(firstDash + 1, secondDash);
  const bumps = {};
  let maxBumpType = 'patch';

  for (const line of frontmatter) {
    const match = line.match(/^"([^"]+)":\s*(major|minor|patch)/);
    if (match) {
      const [, pkg, bump] = match;
      bumps[pkg] = bump;
      if (bump === 'major') {
        maxBumpType = 'major';
      } else if (bump === 'minor' && maxBumpType !== 'major') {
        maxBumpType = 'minor';
      }
    }
  }

  const summary = lines.slice(secondDash + 1).join('\n').trim();

  return {
    id,
    bumps,
    maxBumpType,
    summary,
    packages: Object.keys(bumps)
  };
}

async function addChangesetCommits(changesets) {
  const paths = changesets.map(cs => `.changeset/${cs.id}.md`);
  const commits = await getCommitsThatAddFiles(paths, { cwd: rootDir });
  return changesets.map((cs, index) => ({ ...cs, commit: commits[index] }));
}

function loadChangelogFunctions() {
  const changelogPath = path.join(changesetDir, 'changelog.cjs');
  let changelogFuncs = require(changelogPath);
  if (changelogFuncs.default) {
    changelogFuncs = changelogFuncs.default;
  }
  return changelogFuncs;
}

function getChangelogOptions() {
  let repo = defaultRepo;
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (Array.isArray(config.changelog) && config.changelog[1] && config.changelog[1].repo) {
      repo = config.changelog[1].repo;
    }
  }
  if (process.env.CHANGELOG_REPO) {
    repo = process.env.CHANGELOG_REPO;
  }
  return { repo };
}

async function formatChangesetEntry(changelogFuncs, changelogOpts, changeset) {
  const summary = changeset.summary.trim().length > 0 ? changeset.summary : '(no description)';
  const releaseLine = await changelogFuncs.getReleaseLine(
    { summary, commit: changeset.commit },
    changeset.maxBumpType,
    changelogOpts
  );
  const trimmed = releaseLine.trim();
  return trimmed.length > 0 ? trimmed.split('\n') : [`- ${summary}`];
}

async function buildReleaseSections(changesets, changelogFuncs, changelogOpts) {
  const sections = [];
  const groups = {
    major: [],
    minor: [],
    patch: []
  };

  for (const changeset of changesets) {
    groups[changeset.maxBumpType].push(changeset);
  }

  const sectionOrder = [
    ['major', 'Major Changes'],
    ['minor', 'Minor Changes'],
    ['patch', 'Patch Changes']
  ];

  for (const [type, title] of sectionOrder) {
    const items = groups[type];
    if (items.length === 0) continue;

    const lines = [];
    for (const changeset of items) {
      const entryLines = await formatChangesetEntry(changelogFuncs, changelogOpts, changeset);
      lines.push(...entryLines);
    }

    sections.push({ title, lines });
  }

  return sections;
}

function formatReleaseNotes(version, sections) {
  const lines = [`## ${version}`, ''];
  for (const section of sections) {
    if (section.lines.length === 0) continue;
    lines.push(`### ${section.title}`, '');
    lines.push(...section.lines, '');
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines;
}

function buildAffectedPackagesSection(changesets, fixedPackages) {
  const allPackages = new Set();
  for (const changeset of changesets) {
    for (const pkg of changeset.packages) {
      allPackages.add(pkg);
    }
  }

  const listedPackages = [...allPackages].sort();
  const fixedSet = new Set(fixedPackages);
  const affectedFixed = listedPackages.filter(pkg => fixedSet.has(pkg));

  const lines = ['### Affected Packages', ''];

  if (fixedPackages.length > 0 && affectedFixed.length === fixedPackages.length) {
    lines.push('All packages in the fixed release group will be updated.');
    return lines;
  }

  if (listedPackages.length === 0) {
    lines.push('No packages were listed in changesets.');
    return lines;
  }

  lines.push('The following packages have direct changes:');
  lines.push('');
  lines.push(...listedPackages.map(pkg => `- \`${pkg}\``));

  if (fixedPackages.length > 0) {
    lines.push('');
    lines.push('All packages in the fixed release group will be versioned together.');
  }

  return lines;
}

function isVersionHeader(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) return true;
  if (trimmed.startsWith('<a name=')) return true;
  if (trimmed.startsWith('# ')) {
    return /^\d/.test(trimmed.slice(2));
  }
  return false;
}

function insertChangelogEntry(filePath, entryLines, version) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
  } else {
    content = `${defaultHeaderLines.join('\n')}\n`;
  }

  if (!content.endsWith('\n')) {
    content += '\n';
  }

  const lines = content.split(/\r?\n/);
  if (lines.some(line => {
    const trimmed = line.trim();
    return (
      trimmed === `## ${version}` ||
      trimmed === `# ${version}` ||
      trimmed.includes(`name="${version}"`)
    );
  })) {
    return;
  }
  let insertAt = lines.findIndex(line => isVersionHeader(line));
  if (insertAt === -1) {
    insertAt = lines.length;
  }

  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);

  if (before.length > 0 && before[before.length - 1] !== '') {
    before.push('');
  }

  const entry = [...entryLines];
  while (entry.length > 0 && entry[entry.length - 1] === '') {
    entry.pop();
  }
  entry.push('');

  const updated = [...before, ...entry, ...after].join('\n').replace(/\s+$/, '\n');
  fs.writeFileSync(filePath, updated);
}

function readRootVersion() {
  if (!fs.existsSync(rootPackagePath)) {
    throw new Error('Could not read packages/aurelia/package.json to determine version.');
  }
  const rootPkg = JSON.parse(fs.readFileSync(rootPackagePath, 'utf8'));
  return rootPkg.version;
}

function runChangesetVersion() {
  const cliDir = path.dirname(require.resolve('@changesets/cli/package.json'));
  const cliPath = path.join(cliDir, 'bin.js');
  execFileSync(process.execPath, [cliPath, 'version'], { stdio: 'inherit' });
}

async function main() {
  const preInfo = getPreInfo();
  const changesetFiles = filterConsumedChangesets(getChangesetFiles(), preInfo);
  if (changesetFiles.length === 0) {
    runChangesetVersion();
    return;
  }

  const parsedChangesets = changesetFiles
    .map(parseChangeset)
    .filter(Boolean);
  if (parsedChangesets.length === 0) {
    runChangesetVersion();
    return;
  }
  const changesets = await addChangesetCommits(parsedChangesets);

  const changelogFuncs = loadChangelogFunctions();
  if (
    typeof changelogFuncs.getReleaseLine !== 'function' ||
    typeof changelogFuncs.getDependencyReleaseLine !== 'function'
  ) {
    throw new Error('Could not resolve changelog generation functions');
  }
  const changelogOpts = getChangelogOptions();

  const sections = await buildReleaseSections(changesets, changelogFuncs, changelogOpts);

  runChangesetVersion();

  const version = readRootVersion();
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf8'))
    : {};
  const fixedPackages = Array.isArray(config.fixed) && Array.isArray(config.fixed[0])
    ? config.fixed[0]
    : [];

  const releaseNotesLines = formatReleaseNotes(version, sections);
  const affectedLines = buildAffectedPackagesSection(changesets, fixedPackages);
  if (affectedLines.length > 0) {
    releaseNotesLines.push('', ...affectedLines);
  }
  insertChangelogEntry(docsChangelogPath, releaseNotesLines, version);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

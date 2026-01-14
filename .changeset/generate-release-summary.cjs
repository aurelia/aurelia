/**
 * Generates a clean, deduplicated release summary for the Version PR.
 *
 * Instead of listing every change under every affected package (which creates
 * massive duplication in a fixed-version monorepo), this script:
 * 1. Groups changes by type (Major/Minor/Patch)
 * 2. Shows each change exactly once
 * 3. Uses the configured changelog generator so PR/commit/author metadata matches vanilla Changesets
 */

const fs = require('fs');
const path = require('path');
const resolveFrom = require('resolve-from');
const { getCommitsThatAddFiles } = require('@changesets/git');

const changesetDir = path.join(__dirname);
const configPath = path.join(changesetDir, 'config.json');
const prePath = path.join(changesetDir, 'pre.json');
const defaultRepo = 'aurelia/aurelia';

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
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

function getChangesetFiles() {
  return fs.readdirSync(changesetDir)
    .filter(f => f.endsWith('.md') && f !== 'README.md')
    .map(f => path.join(changesetDir, f));
}

function parseChangeset(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const id = path.basename(filePath, '.md');

  // Find frontmatter boundaries
  const firstDash = lines.findIndex(l => l.trim() === '---');
  const secondDash = lines.findIndex((l, i) => i > firstDash && l.trim() === '---');

  if (firstDash === -1 || secondDash === -1) return null;

  // Parse package bumps from frontmatter
  const frontmatter = lines.slice(firstDash + 1, secondDash);
  const bumps = {};
  let maxBumpType = 'patch';

  for (const line of frontmatter) {
    const match = line.match(/^"([^"]+)":\s*(major|minor|patch)/);
    if (match) {
      const [, pkg, bump] = match;
      bumps[pkg] = bump;
      if (bump === 'major') maxBumpType = 'major';
      else if (bump === 'minor' && maxBumpType !== 'major') maxBumpType = 'minor';
    }
  }

  // Get summary (everything after frontmatter)
  const summary = lines.slice(secondDash + 1).join('\n').trim();

  return {
    id,
    file: path.basename(filePath),
    bumps,
    maxBumpType,
    summary,
    packages: Object.keys(bumps)
  };
}

function getChangelogFunctions(config) {
  const changelogConfig = Array.isArray(config.changelog) ? config.changelog : [];
  const changelogPath = changelogConfig[0];
  const changelogOpts = changelogConfig[1] || {};

  if (!changelogPath) {
    const resolvedPath = path.join(changesetDir, 'changelog.cjs');
    let changelogFuncs = require(resolvedPath);
    if (changelogFuncs.default) {
      changelogFuncs = changelogFuncs.default;
    }
    return {
      changelogFuncs,
      changelogOpts: {
        repo: process.env.CHANGELOG_REPO || defaultRepo
      }
    };
  }

  let resolvedPath;
  try {
    resolvedPath = resolveFrom(changesetDir, changelogPath);
  } catch (err) {
    resolvedPath = resolveFrom(process.cwd(), changelogPath);
  }

  let changelogFuncs = require(resolvedPath);
  if (changelogFuncs.default) {
    changelogFuncs = changelogFuncs.default;
  }

  if (
    typeof changelogFuncs.getReleaseLine !== 'function' ||
    typeof changelogFuncs.getDependencyReleaseLine !== 'function'
  ) {
    throw new Error('Could not resolve changelog generation functions');
  }

  return { changelogFuncs, changelogOpts };
}

async function addChangesetCommits(changesets) {
  const paths = changesets.map(cs => `.changeset/${cs.id}.md`);
  const commits = await getCommitsThatAddFiles(paths, { cwd: process.cwd() });
  return changesets.map((cs, i) => ({ ...cs, commit: commits[i] }));
}

async function formatChangesetEntry(changelogFuncs, changelogOpts, changeset) {
  const summary = changeset.summary.trim().length > 0 ? changeset.summary : '(no description)';
  const releaseLine = await changelogFuncs.getReleaseLine(
    { summary, commit: changeset.commit },
    changeset.maxBumpType,
    changelogOpts
  );
  const trimmed = releaseLine.trim();
  const lines = trimmed.length > 0 ? trimmed.split('\n') : [`- ${summary}`];

  return lines;
}

async function generateSummary() {
  const config = getConfig();
  const preInfo = getPreInfo();
  const changesetFiles = filterConsumedChangesets(getChangesetFiles(), preInfo);
  const { changelogFuncs, changelogOpts } = getChangelogFunctions(config);

  if (changesetFiles.length === 0) {
    return '# No pending changesets\n\nNo version changes to release.';
  }

  const parsedChangesets = changesetFiles
    .map(parseChangeset)
    .filter(Boolean);
  const changesets = await addChangesetCommits(parsedChangesets);

  // Group by bump type
  const majorChanges = changesets.filter(c => c.maxBumpType === 'major');
  const minorChanges = changesets.filter(c => c.maxBumpType === 'minor');
  const patchChanges = changesets.filter(c => c.maxBumpType === 'patch');

  // Build output
  const lines = [];

  const versionArg = process.argv.find(arg => arg.startsWith('--version='));
  const version = versionArg ? versionArg.split('=')[1] : null;
  if (version) {
    lines.push(`## ${version}`);
    lines.push('');
  }

  const sections = [
    { title: 'Major Changes', items: majorChanges },
    { title: 'Minor Changes', items: minorChanges },
    { title: 'Patch Changes', items: patchChanges },
  ];

  for (const section of sections) {
    if (section.items.length === 0) continue;
    lines.push(`### ${section.title}`);
    lines.push('');
    for (const cs of section.items) {
      const entryLines = await formatChangesetEntry(changelogFuncs, changelogOpts, cs);
      lines.push(...entryLines);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Run if called directly
if (require.main === module) {
  generateSummary()
    .then(summary => console.log(summary))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { generateSummary, parseChangeset, getChangesetFiles };

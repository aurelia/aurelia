/**
 * Generates a clean, deduplicated release summary for the Version PR.
 *
 * Instead of listing every change under every affected package (which creates
 * massive duplication in a fixed-version monorepo), this script:
 * 1. Groups changes by type (Minor Changes, Patch Changes)
 * 2. Shows each change exactly once
 * 3. Uses the configured changelog generator so PR/commit/author metadata matches vanilla Changesets
 * 4. Lists affected packages as a simple summary at the end
 */

const fs = require('fs');
const path = require('path');
const resolveFrom = require('resolve-from');
const { getCommitsThatAddFiles } = require('@changesets/git');

const changesetDir = path.join(__dirname);
const configPath = path.join(changesetDir, 'config.json');
const prePath = path.join(changesetDir, 'pre.json');

function getConfig() {
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function getPreInfo() {
  if (fs.existsSync(prePath)) {
    const pre = JSON.parse(fs.readFileSync(prePath, 'utf8'));
    return { inPreMode: pre.mode === 'pre', tag: pre.tag };
  }
  return { inPreMode: false, tag: null };
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
    return {
      changelogFuncs: {
        getReleaseLine: async () => '',
        getDependencyReleaseLine: async () => ''
      },
      changelogOpts
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

  if (changeset.packages.length > 0) {
    lines.push('  ');
    lines.push(`  Packages: ${changeset.packages.map(pkg => `\`${pkg}\``).join(', ')}`);
  }

  return lines;
}

async function generateSummary() {
  const config = getConfig();
  const preInfo = getPreInfo();
  const changesetFiles = getChangesetFiles();
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

  // Collect all affected packages
  const allPackages = new Set();
  changesets.forEach(c => c.packages.forEach(p => allPackages.add(p)));

  // Build output
  const lines = [];

  // Header with pre-release warning if applicable
  if (preInfo.inPreMode) {
    lines.push('> Note: Pre-release mode (`' + preInfo.tag + '`) will publish pre-release versions.');
    lines.push('');
  }

  lines.push('# Release Summary');
  lines.push('');

  const sections = [
    { title: 'Major Changes', items: majorChanges },
    { title: 'Minor Changes', items: minorChanges },
    { title: 'Patch Changes', items: patchChanges },
  ];

  for (const section of sections) {
    if (section.items.length === 0) continue;
    lines.push(`## ${section.title} (${section.items.length})`);
    lines.push('');
    for (const cs of section.items) {
      const entryLines = await formatChangesetEntry(changelogFuncs, changelogOpts, cs);
      lines.push(...entryLines);
      lines.push('');
    }
  }

  // Affected packages summary
  const fixedPackages = config.fixed?.[0] || [];
  const affectedFixed = [...allPackages].filter(p => fixedPackages.includes(p));

  lines.push('---');
  lines.push('');
  lines.push('## Affected Packages');
  lines.push('');

  if (affectedFixed.length === fixedPackages.length) {
    lines.push('All packages will be updated to the new version.');
    lines.push('');
  } else {
    lines.push('The following packages have direct changes:');
    lines.push('');
    for (const pkg of [...allPackages].sort()) {
      lines.push('- `' + pkg + '`');
    }
    lines.push('');
    lines.push('All packages in the fixed group will be versioned together.');
    lines.push('');
  }

  // Footer
  lines.push('---');
  lines.push('');
  lines.push('*Generated by `.changeset/generate-release-summary.cjs`*');

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

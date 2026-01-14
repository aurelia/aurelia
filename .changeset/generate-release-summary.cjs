/**
 * Generates a clean, deduplicated release summary for the Version PR.
 *
 * Instead of listing every change under every affected package (which creates
 * massive duplication in a fixed-version monorepo), this script:
 * 1. Groups changes by type (Minor Changes, Patch Changes)
 * 2. Shows each change exactly once
 * 3. Lists affected packages as a simple summary at the end
 */

const fs = require('fs');
const path = require('path');

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

  // Get description (everything after frontmatter)
  const description = lines.slice(secondDash + 1).join('\n').trim();

  return {
    file: path.basename(filePath),
    bumps,
    maxBumpType,
    description,
    packages: Object.keys(bumps)
  };
}

function formatChangesetEntry(description, packages) {
  const trimmed = description.trim();
  const descriptionLines = trimmed.length > 0 ? trimmed.split('\n') : ['(no description)'];
  const lines = [];

  lines.push(`- ${descriptionLines[0]}`);
  for (let i = 1; i < descriptionLines.length; i++) {
    const line = descriptionLines[i];
    lines.push(line.length === 0 ? '  ' : `  ${line}`);
  }

  if (packages.length > 0) {
    lines.push('  ');
    lines.push(`  Packages: ${packages.map(pkg => `\`${pkg}\``).join(', ')}`);
  }

  return lines;
}

function generateSummary() {
  const config = getConfig();
  const preInfo = getPreInfo();
  const changesetFiles = getChangesetFiles();

  if (changesetFiles.length === 0) {
    return '# No pending changesets\n\nNo version changes to release.';
  }

  const changesets = changesetFiles
    .map(parseChangeset)
    .filter(Boolean);

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
      lines.push(...formatChangesetEntry(cs.description, cs.packages));
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
  console.log(generateSummary());
}

module.exports = { generateSummary, parseChangeset, getChangesetFiles };

const fs = require('fs');
const path = require('path');

const changelogPath = path.join(__dirname, '..', 'docs', 'CHANGELOG.md');

function isVersionHeader(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) return true;
  if (trimmed.startsWith('<a name=')) return true;
  if (trimmed.startsWith('# ')) {
    return /^\d/.test(trimmed.slice(2));
  }
  return false;
}

function extractLatestEntry(content) {
  const lines = content.split(/\r?\n/);

  let start = lines.findIndex(line => line.trim().startsWith('## '));
  if (start === -1) {
    start = lines.findIndex(line => isVersionHeader(line));
  }
  if (start === -1) {
    throw new Error('No changelog entries found.');
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (isVersionHeader(lines[i])) {
      end = i;
      break;
    }
  }

  const entryLines = lines.slice(start, end);
  while (entryLines.length > 0 && entryLines[entryLines.length - 1].trim() === '') {
    entryLines.pop();
  }

  return entryLines.join('\n').trim();
}

if (!fs.existsSync(changelogPath)) {
  console.error('docs/CHANGELOG.md not found.');
  process.exit(1);
}

const content = fs.readFileSync(changelogPath, 'utf8');
const entry = extractLatestEntry(content);
if (!entry) {
  console.error('No changelog entry found.');
  process.exit(1);
}

console.log(entry);

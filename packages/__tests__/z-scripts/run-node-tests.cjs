/* eslint-disable no-console */
const { spawn } = require('child_process');
const { existsSync, readdirSync, statSync } = require('fs');
const { join, relative, resolve } = require('path');

const args = process.argv.slice(2);
const watch = args.includes('--watch');
const patterns = args.filter(arg => arg !== '--watch');

const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');

const files = patterns.length === 0 || patterns.includes('*')
  ? ['dist/**/*.spec.js']
  : findMatchingSpecFiles(distDir, patterns);

if (files.length === 0) {
  console.error(`No compiled spec files matched: ${patterns.join(', ')}`);
  process.exit(1);
}

const mochaArgs = [
  'cross-env',
  'NODE_OPTIONS=--conditions=development',
  'mocha',
  '--ui', 'bdd',
  '--reporter', 'min',
  '--colors',
  '--recursive',
  '--timeout', '5000',
  '--watch-extensions', 'js',
  '--exclude', 'dist/integration/**/*.spec.js',
  '--exclude', 'dist/store-v1/**/*.spec.js',
  'dist/setup-node.js',
  ...files,
];

if (watch) {
  mochaArgs.push('--watch');
}

const command = `npx ${mochaArgs.map(quoteArg).join(' ')}`;
const child = process.platform === 'win32'
  ? spawn('cmd.exe', ['/d', '/s', '/c', command], {
    cwd: rootDir,
    stdio: 'inherit',
  })
  : spawn('sh', ['-c', command], {
    cwd: rootDir,
    stdio: 'inherit',
  });

child.on('exit', code => {
  process.exit(code ?? 0);
});

function findMatchingSpecFiles(startDir, rawPatterns) {
  const normalizedPatterns = rawPatterns.map(normalizePattern);
  const found = [];
  walk(startDir, filePath => {
    if (!filePath.endsWith('.spec.js')) {
      return;
    }
    const rel = relative(rootDir, filePath).replace(/\\/g, '/');
    if (normalizedPatterns.some(pattern => rel.includes(pattern))) {
      found.push(rel);
    }
  });
  return found.sort();
}

function normalizePattern(pattern) {
  return pattern
    .replace(/^src\//, '')
    .replace(/^dist\//, '')
    .replace(/\\/g, '/')
    .replace(/\.tsx?$/, '')
    .replace(/\.js$/, '');
}

function walk(dir, cb) {
  if (!existsSync(dir)) {
    return;
  }
  for (const entry of readdirSync(dir)) {
    const filePath = join(dir, entry);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath, cb);
    } else {
      cb(filePath);
    }
  }
}

function quoteArg(value) {
  return /[\s"]/u.test(value)
    ? `"${value.replace(/"/g, '\\"')}"`
    : value;
}

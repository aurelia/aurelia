/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const argv = process.argv.slice(2);
const watch = argv.includes('--watch');
const patterns = argv.filter((arg) => arg !== '--watch');

const testRoot = path.resolve(__dirname, '..');
const distRoot = path.resolve(__dirname, '..', 'dist');
const setupNode = 'dist/setup-node.js';
const setupNodeAbs = path.join(testRoot, setupNode);
const matchedSpecFiles = patterns.length === 0 || (patterns.length === 1 && patterns[0] === '*')
  ? getAllSpecFiles(distRoot)
  : findMatchingSpecFiles(distRoot, patterns);
const specFiles = matchedSpecFiles.map((file) => toPosixPath(path.relative(testRoot, file)));
const watchFiles = watch ? getWatchFiles(matchedSpecFiles) : [];

if (specFiles.length === 0) {
  console.error(`No node test files matched pattern(s): ${patterns.join(', ')}`);
  process.exit(1);
}

const mochaArgs = [
  require.resolve('mocha/bin/mocha.js'),
  '--ui', 'bdd',
  '--reporter', 'min',
  '--colors',
  '--recursive',
  '--timeout', '5000',
  '--exclude', 'dist/integration/**/*.spec.js',
  '--exclude', 'dist/store-v1/**/*.spec.js',
];

mochaArgs.push(setupNode, ...specFiles);

if (watch) {
  runWithWatch();
} else {
  runOnce();
}

function getAllSpecFiles(rootDir) {
  return walkSpecFiles(rootDir)
    .filter((file) => !isExcluded(file))
    .sort();
}

function findMatchingSpecFiles(rootDir, rawPatterns) {
  const files = getAllSpecFiles(rootDir);
  const normalizedPatterns = rawPatterns
    .map(normalizePattern)
    .filter(Boolean);

  return files.filter((file) => {
    const relative = path.relative(rootDir, file).replace(/\\/g, '/');
    const searchable = stripSpecSuffix(relative);
    return normalizedPatterns.some((pattern) => matchesPattern(searchable, pattern));
  });
}

function getWatchFiles(specFiles) {
  const files = new Set([setupNodeAbs, __filename]);

  for (const specFile of specFiles) {
    files.add(specFile);
  }

  return Array.from(files);
}

function walkSpecFiles(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkSpecFiles(fullPath, found);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.spec.js')) {
      found.push(fullPath);
    }
  }
  return found;
}

function normalizePattern(pattern) {
  return stripSpecSuffix(
    pattern
      .replace(/\\/g, '/')
      .replace(/^\.?\//, '')
      .replace(/^(src|dist)\//, '')
  );
}

function stripSpecSuffix(value) {
  return value.replace(/(?:\.spec)?(?:\.[cm]?[tj]sx?)?$/, '');
}

function matchesPattern(relativePath, pattern) {
  if (pattern === '*') {
    return true;
  }

  if (pattern.includes('*') || pattern.includes('?')) {
    const regex = wildcardToRegExp(pattern);
    return regex.test(relativePath);
  }

  return relativePath.includes(pattern);
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
  const regexSource = escaped
    .replace(/\\\*/g, '.*')
    .replace(/\\\?/g, '.');
  return new RegExp(regexSource);
}

function isExcluded(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.includes('/dist/integration/')
    || normalized.includes('/dist/store-v1/');
}

function toPosixPath(filePath) {
  return filePath.replace(/\\/g, '/');
}

function runOnce() {
  const child = spawnMocha();
  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

function runWithWatch() {
  let child = spawnMocha();
  let restartTimer = null;
  let stopping = false;
  let queuedRestart = false;

  const scheduleRestart = () => {
    clearTimeout(restartTimer);
    restartTimer = setTimeout(() => {
      if (stopping) {
        return;
      }

      if (child.exitCode === null && !child.killed) {
        queuedRestart = true;
        child.kill();
        return;
      }

      child = spawnAndTrackMocha();
    }, 150);
  };

  for (const file of watchFiles) {
    fs.watchFile(file, { interval: 250 }, (curr, prev) => {
      if (curr.mtimeMs !== prev.mtimeMs || curr.size !== prev.size) {
        scheduleRestart();
      }
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('exit', cleanupWatchers);

  function handleChildExit(code, signal) {
    if (stopping) {
      cleanupWatchers();
      if (signal) {
        process.kill(process.pid, signal);
        return;
      }
      process.exit(code ?? 0);
      return;
    }

    if (queuedRestart) {
      queuedRestart = false;
      child = spawnAndTrackMocha();
    }
  }

  function shutdown() {
    stopping = true;
    clearTimeout(restartTimer);
    if (child.exitCode === null && !child.killed) {
      child.kill();
    } else {
      cleanupWatchers();
      process.exit(0);
    }
  }

  function cleanupWatchers() {
    for (const file of watchFiles) {
      fs.unwatchFile(file);
    }
  }

  function spawnAndTrackMocha() {
    const mochaChild = spawnMocha();
    mochaChild.on('exit', handleChildExit);
    return mochaChild;
  }
}

function spawnMocha() {
  return spawn(process.execPath, mochaArgs, {
    stdio: 'inherit',
    cwd: testRoot,
    env: {
      ...process.env,
      NODE_OPTIONS: '--conditions=development',
    },
  });
}

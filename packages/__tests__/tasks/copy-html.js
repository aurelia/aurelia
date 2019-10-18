// @ts-check
/* eslint-disable import/no-extraneous-dependencies */
/**
 * A minimalist implementation to watch and copy html files to dist.
 * Existing packages like cpx does not copy new files.
 */
const chokidar = require('chokidar');
const argv = require('yargs').argv;
const path = require('path');
const fs = require('fs');

const htmlSourceDirs = ['integration'];
const baseOutDir = path.join('dist', 'esnext', '__tests__');
const toWatch = argv.watch;
const verbose = argv.watch;
const cwd = process.cwd();

/**
 * @param {string} msg
 */
function log(msg) {
  if (verbose) {
    console.log(msg);
  }
}

/**
 * @param {string} src
 * @param {string} dest
 */
function copyFile(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(path.dirname(dest), {
      recursive: true
    });
  }
  fs.copyFileSync(src, dest, fs.constants.COPYFILE_FICLONE);
}

/**
 * @param {string} dest
 */
function deleteFile(dest) {
  let dir = path.dirname(dest);
  fs.unlinkSync(dest);
  while (fs.readdirSync(dir).length < 1 && dir !== cwd) {
    fs.rmdirSync(dir);
    dir = path.join(dir, '..');
  }
}

/**
 * @param {string} eventName
 * @param {string} src
 */
function handleChange(eventName, src) {
  const dest = path.join(cwd, baseOutDir, path.relative(cwd, src));

  log(`${eventName}:${dest}`);

  switch (eventName) {
    case 'add':
    case 'change':
      copyFile(src, dest);
      break;
    case 'unlink':
      deleteFile(dest);
      break;
    default:
      break;
  }
}

const watched = htmlSourceDirs.map((dir) => path.join(cwd, dir, '**/*.html'));

const watcher = chokidar.watch(watched, {
  awaitWriteFinish: true
});
watcher.on('all', handleChange);
if (!toWatch) {
  watcher.on('ready', watcher.close);
}

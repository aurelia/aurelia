import * as gulp from 'gulp';
import * as minimatch from 'minimatch';
import * as gulpWatch from 'gulp-watch';
import * as debounce from 'debounce';
import { build } from 'aurelia-cli';
import * as project from '../aurelia.json';
import transpile from './transpile';
import processMarkup from './process-markup';

const debounceWaitTime = 100;
let isBuilding = false;
let pendingRefreshPaths = [];
let watchCallback = () => { };
let watches = [
  { name: 'transpile', callback: transpile, source: project.transpiler.source },
  { name: 'markup', callback: processMarkup, source: project.markupProcessor.source }
];

let watch = (callback) => {
  watchCallback = callback || watchCallback;

  // watch every glob individually
  for(let watcher of watches) {
    if (Array.isArray(watcher.source)) {
      for(let glob of watcher.source) {
        watchPath(glob);
      }
    } else {
      watchPath(watcher.source);
    }
  }
};

let watchPath = (p) => {
  gulpWatch(
    p,
    {
      read: false, // performance optimization: do not read actual file contents
      verbose: true
    },
    (vinyl) => processChange(vinyl));
};

let processChange = (vinyl) => {
  if (vinyl.path && vinyl.cwd && vinyl.path.startsWith(vinyl.cwd)) {
    let pathToAdd = vinyl.path.substr(vinyl.cwd.length + 1);
    log(`Watcher: Adding path ${pathToAdd} to pending build changes...`);
    pendingRefreshPaths.push(pathToAdd);
    refresh();
  }
}

let refresh = debounce(() => {
  if (isBuilding) {
    log('Watcher: A build is already in progress, deferring change detection...');
    return;
  }

  isBuilding = true;

  let paths = pendingRefreshPaths.splice(0);
  let refreshTasks = [];

  // determine which tasks need to be executed
  // based on the files that have changed
  for (let watcher of watches) {
    if (Array.isArray(watcher.source)) {
      for(let source of watcher.source) {
        if (paths.find(path => minimatch(path, source))) {
          refreshTasks.push(watcher);
        }
      }
    }
    else {
      if (paths.find(path => minimatch(path, watcher.source))) {
        refreshTasks.push(watcher);
      }
    }
  }

  if (refreshTasks.length === 0) {
    log('Watcher: No relevant changes found, skipping next build.');
    isBuilding = false;
    return;
  }

  log(`Watcher: Running ${refreshTasks.map(x => x.name).join(', ')} tasks on next build...`);

  let toExecute = gulp.series(
    readProjectConfiguration,
    gulp.parallel(refreshTasks.map(x => x.callback)),
    writeBundles,
    (done) => {
      isBuilding = false;
      watchCallback();
      done();
      if (pendingRefreshPaths.length > 0) {
        log('Watcher: Found more pending changes after finishing build, triggering next one...');
        refresh();
      }
    }
  );

  toExecute();
}, debounceWaitTime);

function log(message: string) {
  console.log(message);
}

function readProjectConfiguration() {
  return build.src(project);
}

function writeBundles() {
  return build.dest();
}

export default watch;

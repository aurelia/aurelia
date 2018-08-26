const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const tsify = require('tsify');
const gutil = require('gulp-util');
const browserSync = require('browser-sync').create();

const watchedBrowserify = watchify(
  browserify({
    basedir: '.',
    debug: true,
    entries: ['startup.ts'],
    cache: {},
    packageCache: {}
  }).plugin(tsify)
);

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: '.'
    }
  });
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.reload({ stream: true }))
    .on('change', browserSync.reload);
}

gulp.task('default', ['browser-sync'], bundle);
watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', gutil.log);

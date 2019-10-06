const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const tsify = require('tsify');
const log = require('fancy-log');
const browserSync = require('browser-sync').create();
const stringify = require('stringify');

const b = browserify({
  baseDir: '.',
  debug: true,
  entries: ['src/startup.ts'],
  cache: {},
  packageCache: {}
})
  .plugin(tsify)
  .transform(stringify, { appliesTo: { includeExtensions: ['.html'] } });

function bundle(input) {
  return input
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
}

gulp.task('default', () => {
  browserSync.init({ watch: true, server: '.', port: 9000 });
  b.on('update', bundle);
  b.on('change', browserSync.reload);
  return bundle(watchify(b));
});

gulp.task('build', () => bundle(b));
b.on('log', log);

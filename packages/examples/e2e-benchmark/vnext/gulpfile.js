const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const tsify = require('tsify');

const browserified = browserify({
  basedir: '.',
  debug: true,
  entries: ['startup.ts'],
  cache: {},
  packageCache: {}
}).plugin(tsify);


gulp.task('default', [], () => {
  return browserified
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('dist'));
});

import * as gulp from 'gulp';
import * as changedInPlace from 'gulp-changed-in-place';
import * as plumber from 'gulp-plumber';
import * as notify from 'gulp-notify';
import * as ts from 'gulp-typescript';
import * as project from '../aurelia.json';
import { build } from 'aurelia-cli';
import * as eventStream from 'event-stream';
import * as gulpif from 'gulp-if';

var typescriptCompiler = typescriptCompiler || null;
const isJsFile = f => f.extname === '.js';

function buildTypeScript() {
  typescriptCompiler = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
  let src = gulp.src(project.transpiler.source).pipe(changedInPlace({ firstPass: true }));
  return eventStream
    .merge(src)
    .pipe(plumber({ errorHandler: notify.onError('Error: <%= error.message %>') }))
    .pipe(typescriptCompiler())
    .pipe(gulpif(isJsFile, build.bundle()));
}
export default gulp.series(buildTypeScript);

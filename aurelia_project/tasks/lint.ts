import * as gulp from 'gulp';
import tslint from 'gulp-tslint';
import * as project from '../aurelia.json';

export default function lint() {
  return gulp.src([project.transpiler.source])
    .pipe(tslint({
      tslint: require("tslint")
    }))
    .pipe(tslint.report("prose"));
}

import * as gulp from 'gulp';
import { build as buildCLI } from 'aurelia-cli';
import transpile from './transpile';
import * as project from '../aurelia.json';

let build = gulp.series(readProjectConfiguration, transpile, writeBundles);

function readProjectConfiguration() {
  return buildCLI.src(project);
}
function writeBundles() {
  return buildCLI.dest();
}
export { build as default };

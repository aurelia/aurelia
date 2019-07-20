const gulp = require("gulp");
const series = gulp.series;
const parallel = gulp.parallel;
const del = require("del");
const tsConfig = require("./tsconfig.json");
const rollup = require("rollup");
const rollupTypeScript = require("rollup-plugin-typescript");
const rollupReplace = require("rollup-plugin-replace");

function clean() {
  return del(["build"]);
}

function cleanTests() {
  return del("build/tests");
}

function buildES6() {
  const ts = require("gulp-typescript");
  const tslint = require("gulp-tslint");
  const merge = require("merge2");

  const result = gulp.src(["lib/**/*.ts"])
    .pipe(tslint())
    .pipe(tslint.report("verbose", {
      emitError: false,
    }))
    .pipe(ts(Object.assign(tsConfig.compilerOptions, {
      typescript: require("typescript"),
      target: "es6",
      declaration: true,
    })));

  return merge([
    result.dts.pipe(gulp.dest("dist/typings")),
    result.js.pipe(gulp.dest("build/es6")),
  ]);
}

function distES6() {
  return rollup.rollup({
    entry: "build/es6/uibench.js",
  }).then(function(bundle) {
    return bundle.write({
      format: "es6",
      dest: "dist/es6/uibench.js",
    });
  });
}

function distUMD() {
  return rollup.rollup({
    entry: "lib/uibench.ts",
    plugins: [
      rollupTypeScript(Object.assign(tsConfig.compilerOptions, {
        typescript: require("typescript"),
        target: "es5",
        module: "es6",
        declaration: false,
      })),
    ],
  }).then((bundle) => {
    return bundle.write({
      format: "umd",
      moduleName: "uibench",
      dest: "dist/umd/uibench.js",
    });
  });
}

function distGHPagesJS() {
  return gulp.src("dist/umd/uibench.js")
    .pipe(gulp.dest("gh-pages/0.1.0"));
}

function distGHPagesCSS() {
  return gulp.src("assets/styles.css")
    .pipe(gulp.dest("gh-pages/0.1.0"));
}

function deploy() {
  const ghPages = require("gulp-gh-pages");

  return gulp.src("gh-pages/**/*")
    .pipe(ghPages());
}

const dist = parallel(series(buildES6, distES6), distUMD);
const distGHPages = parallel(distGHPagesCSS, distGHPagesJS);

exports.clean = clean;
exports.dist = series(clean, dist);
exports.distGHPages = series(clean, dist, distGHPages);
exports.deploy = series(clean, dist, distGHPages, deploy);

const { concurrent, copy, crossEnv, nps, rimraf, series } = require('nps-utils');

function tsnode(script) {
  return crossEnv(`TS_NODE_PROJECT="tsconfig-tsnode.json" ${script}`);
}

function karma(single, watch, browsers, transpileOnly, noInfo, coverage, tsconfig, logLevel) {
  return 'karma start'
    .concat(single !== null ? ` --single-run=${single}` : '')
    .concat(watch !== null ? ` --auto-watch=${watch}` : '')
    .concat(browsers !== null ? ` --browsers=${browsers}` : '')
    .concat(transpileOnly !== null ? ` --transpile-only=${transpileOnly}` : '')
    .concat(noInfo !== null ? ` --no-info=${noInfo}` : '')
    .concat(coverage !== null ? ` --coverage=${coverage}` : '')
    .concat(tsconfig !== null ? ` --tsconfig=${tsconfig}` : '')
    .concat(logLevel !== null ? ` --log-level=${logLevel}` : '');
}

module.exports = {
  scripts: {
    karma: {
      default: 'nps karma.single',
      single: tsnode(karma(true, false, 'ChromeHeadless', true, true, true, null, null)),
      watch: {
        default: 'nps karma.watch.dev',
        dev: tsnode(karma(false, true, 'ChromeHeadless', true, true, true, null, null)),
        debug: tsnode(karma(false, true, 'Chrome', true, false, false, null, 'debug')),
      }
    }
  }
};

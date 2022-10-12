// @ts-check
/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
const path = require('path');
const fs = require('fs');

const basePath = path.resolve(__dirname, '..', '..');
const smsPath = path.dirname(require.resolve('source-map-support'));


const baseKarmaArgs = 'karma start karma.conf.cjs  --browsers=ChromeDebugging --browsers=ChromeHeadlessOpt --browsers=FirefoxHeadless --browsers=Firefox --single-run --coverage --watch-extensions js,html --bail --reporter=mocha --no-auto-watch'.split(' ');
const cliArgs = process.argv.slice(2).filter(arg => !baseKarmaArgs.includes(arg));
const hasSingleRun = process.argv.slice(2).includes('--single-run');

module.exports =
/** @param {import('karma').Config & { browsers?: string[]; coverage?: any; }} config */ function (config) {
  /**
   * @type {string[]}
   */
  let browsers;
  if (process.env.BROWSERS) {
    browsers = Array.isArray(process.env.BROWSERS) ? process.env.BROWSERS : [process.env.BROWSERS];
  } else if (config.browsers) {
    browsers = config.browsers;
  } else {
    browsers = ['Chrome'];
  }
  if (browsers.length !== 1) {
    browsers = ['Chrome'];
  }
  const isFirefox = /firefox/i.test(browsers.toString());

  const baseUrl = 'packages/__tests__/dist/esm/__tests__';

  const testFilePatterns = cliArgs.length > 0
    ? cliArgs.flatMap(arg => [
        `${baseUrl}/**/*${arg.replace(/(?:\.spec)?(?:\.[tj]s)?$/, '*.spec.js')}`,
        `${baseUrl}/**/${arg}/**/*.spec.js`,
    ])
    : [`${baseUrl}/**/*.spec.js`];
  const circleCiParallelismGlob = fs.existsSync('./tests.txt')
    ? fs.readFileSync('./tests.txt', { encoding: 'utf-8' })
    : null;
  const circleCiFiles = circleCiParallelismGlob?.split(' ') ?? [];
  console.log(`parallelism blob (${circleCiFiles.length}):\n\t`, circleCiFiles.join('\n\t'));
  console.log('test patterns:', testFilePatterns);

  // Karma config reference: https://karma-runner.github.io/5.2/config/files.html
  // --------------------------------------------------------------------------------
  // Summary of why the files are configured the way they are:

  // - [2.1] All spec files (files ending in .spec.js) must be included in the html document as <script type="module"> tags, therefore they all have `included: true`

  // - [1.1] The setup-browser.js needs to run before any specs do, therefore it is included specifically as the first file (files are included on the page in the same order as declared here).

  // - [1.2, 1.3, 1.4, 2.3, 3.1] Ordinary JS files (framework, spec and utility) are all watched so that changing either the tests or the code will re-trigger a test run
  //   when the transpiled output changes (so the TS source files still need to be watched by tsc separately).

  // - [1.2, 1.3, 1.4] We don't want to include/serve setup-test262 / setup-node in the browser tests, and we don't like hacking too much with globs, therefore all top-level .js files are declared statically on top as well (instead of e.g. *.js).

  // - [2.2, 2.4, 3.2, 3.3] .ts and .js.map files are *only* served, so that source maps work properly when running in debug mode.
  //   They're not watched because they shouldn't by themselves trigger a re-run (only the transpiled output should).
  //   Because they're not watched, they're also not cached, so that the browser will always serve the latest version from disk.
  //
  const files = [
    // karma doesn't provide a way to pass environments variables from node to the browser
    // so set it up here
    // { type: 'script', watched: true,            included: true,  nocache: true,   pattern: `packages/__tests__/import-env-vars.js` },
    // in watch mode, there is a chance that packages are rebuilt
    // and the preprocessor will no longer work, https://github.com/karma-runner/karma/issues/2264
    // this is a good enough work around
    // todo: probably will need something else to run the tests in the browser in the future
    { type: 'script', watched: true,            included: true,  nocache: true,   pattern: `packages/__tests__/importmap.js` },
    { type: 'script', watched: false,           included: true,  nocache: false,  pattern: path.join(smsPath, 'browser-source-map-support.js') },
    { type: 'module', watched: true,            included: true,  nocache: true,   pattern: `${baseUrl}/setup-browser.js` }, // 1.1
    { type: 'module', watched: true,            included: false, nocache: true,   pattern: `${baseUrl}/setup-browser.js.map` }, // 1.1
    { type: 'module', watched: true,            included: false, nocache: true,   pattern: `${baseUrl}/setup-shared.js` }, // 1.2
    { type: 'module', watched: true,            included: false, nocache: true,   pattern: `${baseUrl}/setup-shared.js.map` }, // 1.2
    { type: 'module', watched: !hasSingleRun,   included: false, nocache: true,   pattern: `${baseUrl}/util.js` }, // 1.3
    { type: 'module', watched: !hasSingleRun,   included: false, nocache: true,   pattern: `${baseUrl}/util.js.map` }, // 1.3
    { type: 'module', watched: !hasSingleRun,   included: false, nocache: true,   pattern: `${baseUrl}/Spy.js` }, // 1.4
    { type: 'module', watched: !hasSingleRun,   included: false, nocache: true,   pattern: `${baseUrl}/Spy.js.map` }, // 1.4
    { type: 'none',   watched: false,           included: false, nocache: true,   pattern: 'node_modules/mocha/mocha.js.map' },
    ...(circleCiParallelismGlob
      ? circleCiFiles
        .map(file =>
          ({ type: 'module', watched: true,  included: true,  nocache: false, pattern: file  })) // 2.1
      : testFilePatterns.map(pattern =>
          ({ type: 'module', watched: true,  included: true,  nocache: false, pattern: pattern }), // 2.1
        )
    ), // 2.1 (new)
    ...testDirs.flatMap(name => [
      // // { type: 'module', watched: false, included: false, nocache: true,  pattern: `${baseUrl}/${name}/**/*.spec.js` }, // 2.1 (old)
      { type: 'module', watched: false,         included: false, nocache: false,  pattern: `${baseUrl}/${name}/**/*.js.map` }, // 2.2
      { type: 'module', watched: false,         included: false, nocache: false,  pattern: `${baseUrl}/${name}/**/!(*.$au)*.js` }, // 2.3
      { type: 'module', watched: false,         included: false, nocache: false,  pattern: `packages/__tests__/${name}/**/*.ts` }, // 2.4
    ]),
    ...packageNames.flatMap(name => [
      { type: 'module', watched: !hasSingleRun, included: false, nocache: !process.env.CI && !isFirefox,   pattern: `packages/${name}/dist/esm/index.mjs` }, // 3.1
      { type: 'module', watched: false,         included: false, nocache: !process.env.CI && !isFirefox,   pattern: `packages/${name}/dist/esm/index.mjs.map` }, // 3.2
      { type: 'module', watched: false,         included: false, nocache: true,   pattern: `packages/${name}/src/**/*.ts` }, // 3.3
    ]),
    // for i18n tests 
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/i18next/dist/esm/i18next.js` }, // 3.1
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/@babel/runtime/helpers/**/*.js` }, // 3.1
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/@babel/esm/helpers/**/*.js` }, // 3.1
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/rxjs/_esm5/**/*.js` }, // 3.1
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/rxjs/_esm5/**/*.js.map` }, // 3.1
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/rxjs/_esm5/**/*.d.ts` }, // 3.1
    { type: 'module', watched: false,           included: false, nocache: false,  pattern: `node_modules/tslib/tslib.es6.js` }, // 3.1
  ].filter(Boolean);

  const preprocessors = files.reduce((p, file) => {
    // Only process .js/.mjs files (not .js.map or .ts files)
    if (/\.m?js$/.test(file.pattern)) {
      // Only instrument core framework files (not the specs themselves, nor any test utils (for now))
      if (/__tests__|testing|node_modules/.test(file.pattern) || !config.coverage) {
        p[file.pattern] = [];
      } else {
        p[file.pattern] = ['karma-coverage-istanbul-instrumenter']
      }
    }
    return p;
  }, {});

  /** @type {import('karma').ConfigOptions} */
  const options = {
    basePath,
    browserDisconnectTimeout: 30 * 60 * 1000,
    browserNoActivityTimeout: process.env.CI ? 10000 : 30 * 60 * 1000,
    processKillTimeout: 10000,
    frameworks: [
      'mocha',
    ],
    preprocessors,
    // @ts-ignore
    files,
    mime: {
      'text/x-typescript': ['ts'],
    },
    reporters: [
      ...(hasSingleRun ? [] : ['clear-screen']),
      // @ts-ignore
      config.reporter || (process.env.CI ? 'min' : 'progress'),
    ],
    browsers: browsers,
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [
          ...commonChromeFlags,
          '--remote-debugging-port=9333'
        ],
        // @ts-ignore
        debug: true
      },
      ChromeHeadlessOpt: {
        base: 'ChromeHeadless',
        flags: [
          ...commonChromeFlags
        ]
      }
    },
    client: {
      captureConsole: true,
      // @ts-ignore
      mocha: {
        bail: config['bail'],
        ui: 'bdd',
        timeout: 5000,
      }
    },
    // enable this and the plugins down below if we want to setup environments in karma tests
    beforeMiddleware: ['aurelia-karma-loader'],
    logLevel: config.LOG_ERROR, // to disable the WARN 404 for image requests
    // logLevel: config.LOG_DEBUG,
    plugins: [
      'karma-mocha',
      'karma-aurelia-preprocessor',
      'karma-coverage-istanbul-instrumenter',
      'karma-coverage-istanbul-reporter',
      'karma-min-reporter',
      'karma-mocha-reporter',
      'karma-chrome-launcher',
      // 'karma-firefox-launcher',
      // @ts-ignore
      ...(() => {
        let runId = 0;
        /** @type {Record<string, string>} */
        let jsCache = {};
        /** @type {Record<string, string>} */
        let htmlCache = {};
        /** @type {Record<string, string>} */
        let cssCache = {};

        const importmap = prepareIndexMap();

        return [
          // a copy paste version of https://github.com/arthurc/karma-clear-screen-reporter
          // for light-weight-ness
          {
            'reporter:clear-screen': ['type', function ClearScreenReporter() {
              this.onRunStart = function () {
                runId++;
                jsCache = {};
                htmlCache = {};
                cssCache = {};
                console.log("\u001b[2J\u001b[0;0H");
                console.log(`Watch run: ${runId}. ${new Date().toJSON()}`);
              };
            }]
          },
          {'middleware:aurelia-karma-loader': ['factory', function CustomMiddlewareFactory (config) {
            /**
             * @param { import('express').Request } request
             * @param { import('http').ServerResponse } response
             */
            return function (request, response, next) {
              const requestUrl = request.url;
              if (requestUrl.includes('env-variables.js')) {
                response.end(`var process={env:${JSON.stringify({
                  BROWSERS: browsers[0],
                })}}`);
                return;
              }
              if (requestUrl.includes('importmap.js')) {
                response.setHeader('Content-Type', mimetypes.js);
                response.end(`document.write(\`<script type=importmap>${JSON.stringify({ imports: importmap })}</script>\`)`);
                return;
              }
              // some tests has images and it could cause a lot of noises related image loading errors
              // just disable it via returning an empty one
              if (requestUrl.endsWith('.jpeg') || requestUrl.endsWith('.jpg') || requestUrl.endsWith('.svg')) {
                response.setHeader('Content-Type', mimetypes.jpeg);
                response.end('');
                return;
              }

              if (requestUrl.endsWith('html')) {
                const cachedCode = htmlCache[requestUrl];
                if (cachedCode != null) {
                  response.setHeader('Content-Type', mimetypes.js);
                  response.end(cachedCode);
                  return;
                }

                const htmlFilePath = path.resolve(basePath, requestUrl.replace('/base/', '').replace('/dist/esm/__tests__/', '/'));
                if (fs.existsSync(htmlFilePath)) {
                  const jsCode = htmlCache[requestUrl] = `export default ${JSON.stringify(fs.readFileSync(htmlFilePath, { encoding: 'utf-8' }))}`;
                  response.setHeader('Content-Type', mimetypes.js);
                  response.end(jsCode);
                  return;
                }
              }

              if (requestUrl.endsWith('css')) {
                const cachedCode = cssCache[requestUrl];
                if (cachedCode != null) {
                  response.setHeader('Content-Type', mimetypes.js);
                  response.end(cachedCode);
                  return;
                }

                const cssFilePath = path.resolve(basePath, requestUrl.replace('/base/', '').replace('/dist/esm/__tests__/', '/'));
                if (fs.existsSync(cssFilePath)) {
                  const jsCode = cssCache[requestUrl] = `export default ${JSON.stringify(fs.readFileSync(cssFilePath, { encoding: 'utf-8' }))}`;
                  response.setHeader('Content-Type', mimetypes.js);
                  response.end(jsCode);
                  return;
                }
              }
    
              if (process.env.CI || isFirefox) {
                next();
                return;
              }
              const cachedCode = jsCache[requestUrl];
              if (cachedCode != null) {
                response.setHeader('Content-Type', mimetypes.js);
                response.end(cachedCode);
                return;
              }
              const maybeFilePath = path.resolve(basePath, requestUrl.replace('/base/', '').replace(/(\.m?js)(\.map)?(\??.+)?$/, '$1$2'));
              if (fs.existsSync(maybeFilePath)) {
                const jsCode = jsCache[requestUrl] = fs.readFileSync(maybeFilePath, { encoding: 'utf-8' });
                response.setHeader('Content-Type', mimetypes.js);
                response.end(jsCode);
                return;
              }
    
              next();
            }
          }]}
        ]
      })()
    ]
  };

  if (config.coverage) {
    options.reporters = ['coverage-istanbul', ...options.reporters ?? []];
    // @ts-ignore
    options.coverageIstanbulReporter = {
      reports: ['html', 'text-summary', 'json', 'lcovonly', 'cobertura'],
      dir: 'coverage',
    };
    // @ts-ignore
    options.coverageIstanbulInstrumenter = {
      // see https://github.com/monounity/karma-coverage-istanbul-instrumenter/blob/master/test/es6-native/karma.conf.js
      esModules: true,
    };
    // @ts-ignore
    options.junitReporter = {
      outputDir: 'coverage',
      outputFile: 'test-results.xml',
      useBrowserName: false,
    };
  }

  config.set(options);
};

function prepareIndexMap() {
  const babelRuntimeHelpers = fs.readdirSync(path.resolve('../../node_modules/@babel/runtime/helpers/esm'));

  return {
    ...packageNames.reduce((map, pkg) => {
      map[`@aurelia/${pkg}`] = `/base/packages/${pkg}/dist/esm/index.mjs`;
      return map;
    }, {
      'aurelia': `/base/packages/aurelia/dist/esm/index.mjs`,
      'i18next': '/base/node_modules/i18next/dist/esm/i18next.js',
      'tslib': '/base/node_modules/tslib/tslib.es6.js',
    }),

    ...babelRuntimeHelpers.reduce((map, name) => {
      const helper = path.parse(name).name;
      map[`@babel/runtime/helpers/esm/${helper}`]
        = `/base/node_modules/@babel/runtime/helpers/esm/${helper}.js`;
      map[`@babel/runtime/${helper}`]
        = `/base/node_modules/@babel/runtime/helpers/esm/${helper}.js`;
      return map;
    }, {}),

    ...fs.readdirSync(path.resolve('../../node_modules/rxjs/_esm5/internal/')).reduce((map, file) => {
      if (!file.endsWith('.js')) {
        return map;
      }
      const name = file.replace(/\.js$/, '');
      map[`rxjs/_esm5/internal/${name}`]
        // sometimes, there's relative import from within the others modules
        // that will end up requesting the path that looks like this
        = map[`/base/node_modules/rxjs/_esm5/internal/${name}`]
        = `/base/node_modules/rxjs/_esm5/internal/${file}`;
      return map;
    }, {}),
    ...['observable', 'operators', 'scheduled', 'scheduler', 'symbol', 'testing', 'util'].reduce((map, name) => {
      const modules = fs.readdirSync(path.resolve(`../../node_modules/rxjs/_esm5/internal/${name}/`));
      modules.forEach(moduleName => {
        if (!moduleName.endsWith('.js')) return;
        const basename = moduleName.replace(/\.js$/, '');

        map[`rxjs/_esm5/internal/${name}/${basename}`]
          // sometimes, there's relative import from within the others modules
          // that will end up requesting the path that looks like this
          = map[`/base/node_modules/rxjs/_esm5/internal/${name}/${basename}`]
          = `/base/node_modules/rxjs/_esm5/internal/${name}/${moduleName}`;
      });
      return map;
    }, {
      'rxjs': '/base/node_modules/rxjs/_esm5/index.js',
      'rxjs/operators': '/base/node_modules/rxjs/_esm5/operators/index.js',
    }),
  };
}

const commonChromeFlags = [
  '--no-default-browser-check',
  '--no-first-run',
  '--no-sandbox',
  '--no-managed-user-acknowledgment-check',
  '--disable-background-timer-throttling',
  '--disable-backing-store-limit',
  '--disable-boot-animation',
  '--disable-cloud-import',
  '--disable-contextual-search',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-infobars',
  '--disable-translate',
  '--disable-application-cache',
  '--media-cache-size=1',
  '--disk-cache-size=1',
];

const testDirs = [
  '1-kernel',
  '2-runtime',
  '3-runtime-html',
  'fetch-client',
  'i18n',
  'integration',
  'router',
  'router-lite',
  'state',
  'store-v1',
  'validation',
  'validation-html',
  'validation-i18n',
];

const packageNames = [
  'addons',
  'compat-v1',
  'dialog',
  'fetch-client',
  'i18n',
  'kernel',
  'metadata',
  'platform',
  'platform-browser',
  'route-recognizer',
  'router',
  'router-lite',
  'runtime',
  'runtime-html',
  'state',
  'store-v1',
  'testing',
  'ui-virtualization',
  'validation',
  'validation-html',
  'validation-i18n',
  'web-components',
];

const mimetypes = {
  html: "text/html",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  json: "application/json",
  js: "text/javascript",
  css: "text/css"
};

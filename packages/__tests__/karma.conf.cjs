const path = require('path');

const basePath = path.resolve(__dirname, '..', '..');
const smsPath = path.dirname(require.resolve('source-map-support'));

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
];

const testDirs = [
  '1-kernel',
  '2-runtime',
  '3-runtime-html',
  'fetch-client',
  'i18n',
  'integration',
  'router-lite',
  'store-v1',
  'validation',
  'validation-html',
  'validation-i18n',
];

const baseKarmaArgs = 'karma start karma.conf.cjs  --browsers=ChromeDebugging --browsers=ChromeHeadlessOpt --browsers=FirefoxHeadless --single-run --coverage --watch-extensions js,html --bail'.split(' ');
const cliArgs = process.argv.slice(2).filter(arg => !baseKarmaArgs.includes(arg));

const packageNames = [
  'fetch-client',
  'i18n',
  'kernel',
  'metadata',
  'platform',
  'platform-browser',
  'route-recognizer',
  'router-lite',
  'runtime',
  'runtime-html',
  'store-v1',
  'testing',
  'validation',
  'validation-html',
  'validation-i18n',
];

module.exports = function (config) {
  let browsers;
  if (process.env.BROWSERS) {
    browsers = [process.env.BROWSERS];
  } else if (config.browsers) {
    browsers = config.browsers;
  } else {
    browsers = ['Chrome'];
  }
  const baseUrl = 'packages/__tests__/dist/esm/__tests__';

  const testFilePatterns = cliArgs.length > 0
    ? cliArgs.flatMap(arg => [
        `${baseUrl}/**/*${arg.replace(/(?:\.[tj]s)?$/, '*.js')}`,
        `${baseUrl}/**/${arg}/**/*.spec.js`,
    ])
    : [`${baseUrl}/**/*.spec.js`];

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
    { type: 'script', watched: true,  included: true,  nocache: false, pattern: `packages/__tests__/importmap.js` },
    { type: 'script', watched: false, included: true,  nocache: false, pattern: path.join(smsPath, 'browser-source-map-support.js') },
    { type: 'module', watched: true,  included: true,  nocache: false, pattern: `${baseUrl}/setup-browser.js` }, // 1.1
    { type: 'module', watched: true,  included: false, nocache: false, pattern: `${baseUrl}/setup-shared.js` }, // 1.2
    { type: 'module', watched: true,  included: false, nocache: false, pattern: `${baseUrl}/util.js` }, // 1.3
    { type: 'module', watched: true,  included: false, nocache: false, pattern: `${baseUrl}/Spy.js` }, // 1.4
    ...testFilePatterns.map(pattern =>
      ({ type: 'module', watched: true,  included: true,  nocache: false, pattern: pattern }), // 2.1
    ), // 2.1 (new)
    ...testDirs.flatMap(name => [
      // { type: 'module', watched: false, included: false, nocache: true,  pattern: `${baseUrl}/${name}/**/*.spec.js` }, // 2.1 (old)
      { type: 'module', watched: false, included: false, nocache: true,  pattern: `${baseUrl}/${name}/**/*.js.map` }, // 2.2
      { type: 'module', watched: true,  included: false, nocache: false, pattern: `${baseUrl}/${name}/**/!(*.$au)*.js` }, // 2.3
      { type: 'module', watched: false, included: false, nocache: true,  pattern: `packages/__tests__/${name}/**/*.ts` }, // 2.4
    ]),
    ...packageNames.flatMap(name => [
      { type: 'module', watched: true,  included: false, nocache: false, pattern: `packages/${name}/dist/esm/**/!(*.$au)*.js` }, // 3.1
      { type: 'module', watched: false, included: false, nocache: true,  pattern: `packages/${name}/dist/esm/**/*.js.map` }, // 3.2
      { type: 'module', watched: false, included: false, nocache: true,  pattern: `packages/${name}/src/**/*.ts` }, // 3.3
    ]),
    // for i18n tests
    { type: 'module', watched: false,  included: false, nocache: false, pattern: `node_modules/i18next/dist/esm/i18next.js` }, // 3.1
    { type: 'module', watched: false,  included: false, nocache: false, pattern: `node_modules/@babel/runtime/helpers/**/*.js` }, // 3.1
    { type: 'module', watched: false,  included: false, nocache: false, pattern: `node_modules/rxjs/_esm5/**/*.js` }, // 3.1
    { type: 'module', watched: false,  included: false, nocache: false, pattern: `node_modules/rxjs/_esm5/**/*.js.map` }, // 3.1
    { type: 'module', watched: false,  included: false, nocache: false, pattern: `node_modules/rxjs/_esm5/**/*.d.ts` }, // 3.1
    { type: 'module', watched: false,  included: false, nocache: false, pattern: `node_modules/tslib/tslib.es6.js` }, // 3.1
  ];

  const preprocessors = files.reduce((p, file) => {
    // Only process .js files (not .js.map or .ts files)
    if (/\.js$/.test(file.pattern)) {
      // Only instrument core framework files (not the specs themselves, nor any test utils (for now))
      if (/__tests__|testing|node_modules/.test(file.pattern) || !config.coverage) {
        p[file.pattern] = ['aurelia'];
      } else {
        p[file.pattern] = ['aurelia', 'karma-coverage-istanbul-instrumenter'];
      }
    }
    return p;
  }, {});

  const options = {
    basePath,
    browserDisconnectTimeout: 10000,
    processKillTimeout: 10000,
    frameworks: [
      'mocha',
    ],
    preprocessors,
    files,
    mime: {
      'text/x-typescript': ['ts']
    },
    reporters: [config.reporter || (process.env.CI ? 'min' : 'progress')],
    browsers: browsers,
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: [
          ...commonChromeFlags,
          '--remote-debugging-port=9333'
        ],
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
      mocha: {
        bail: config['bail'],
        ui: 'bdd',
        timeout: 5000,
      }
    },
    logLevel: config.LOG_ERROR, // to disable the WARN 404 for image requests
    // logLevel: config.LOG_DEBUG,
    plugins: [
      'karma-mocha',
      'karma-aurelia-preprocessor',
      'karma-coverage-istanbul-instrumenter',
      'karma-coverage-istanbul-reporter',
      'karma-min-reporter',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
    ]
  };

  if (config.coverage) {
    options.reporters = ['coverage-istanbul', ...options.reporters];
    options.coverageIstanbulReporter = {
      reports: ['html', 'text-summary', 'json', 'lcovonly', 'cobertura'],
      dir: 'coverage',
    };
    options.coverageIstanbulInstrumenter = {
      // see https://github.com/monounity/karma-coverage-istanbul-instrumenter/blob/master/test/es6-native/karma.conf.js
      esModules: true,
    };
    options.junitReporter = {
      outputDir: 'coverage',
      outputFile: 'test-results.xml',
      useBrowserName: false,
    };
  }

  config.set(options);
};

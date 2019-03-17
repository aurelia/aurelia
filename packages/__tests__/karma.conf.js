const path = require('path');

const basePath = path.resolve(__dirname);

const commonChromeFlags = [
  '--no-default-browser-check',
  '--no-first-run',
  '--no-managed-user-acknowledgment-check',
  '--disable-background-timer-throttling',
  '--disable-backing-store-limit',
  '--disable-boot-animation',
  '--disable-cloud-import',
  '--disable-contextual-search',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-infobars',
  '--disable-translate'
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

  const options = {
    basePath,
    frameworks: ['source-map-support', 'mocha', 'chai'],
    files: [
      { pattern: 'dist/build/__tests__/setup-browser.js', type: 'module' },
      { pattern: 'dist/build/__tests__/**/*.spec.js', type: 'module' },
    ],
    preprocessors: {
      ['dist/build/__tests__/setup-browser.js']: ['sourcemap'],
      ['dist/build/__tests__/**/*.spec.js']: ['sourcemap']
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    reporters: ['junit', config.reporter || (process.env.CI ? 'min' : 'progress')],
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
        ui: 'bdd'
      }
    }
  };

  if (config.coverage) {
    options.reporters = ['coverage-istanbul', ...options.reporters];
    options.coverageIstanbulReporter = {
      reports: ['html', 'text-summary', 'json', 'lcovonly', 'cobertura'],
      dir: './coverage'
    };
    options.junitReporter = {
      outputDir: './coverage',
      outputFile: 'test-results.xml',
      useBrowserName: false
    };
  }

  config.set(options);
}

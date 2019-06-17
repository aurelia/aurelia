const path = require('path');
const webpack = require('webpack');

const basePath = path.resolve(__dirname);

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
    browserDisconnectTimeout: 10000,
    processKillTimeout: 10000,
    frameworks: [
      'source-map-support',
      'mocha',
    ],
    files: [
      'dist/build/__tests__/setup-browser.js',
    ],
    preprocessors: {
      ['dist/build/__tests__/setup-browser.js']: [
        'webpack',
        'sourcemap',
      ],
    },
    webpack: {
      mode: 'none',
      resolve: {
        extensions: [
          '.js',
        ],
        modules: [
          'dist',
          'node_modules'
        ],
        mainFields: [
          'module',
        ],
      },
      devtool: 'inline-source-map',
      performance: {
        hints: false,
      },
      optimization: {
        namedModules: false,
        namedChunks: false,
        nodeEnv: false,
        usedExports: true,
        flagIncludedChunks: false,
        occurrenceOrder: false,
        sideEffects: true,
        concatenateModules: true,
        splitChunks: {
          name: false,
        },
        runtimeChunk: false,
        noEmitOnErrors: false,
        checkWasmTypes: false,
        minimize: false,
      },
      module: {
        rules: [
          {
            test: /\.js\.map$/,
            use: ['ignore-loader'],
          },
          {
            test: /\.js$/,
            use: [
              {
                loader: 'source-map-loader',
                options: {
                  enforce: 'pre',
                },
              },
            ],
          },
        ]
      }
    },
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
        ui: 'bdd'
      }
    }
  };

  if (config.coverage) {
    options.webpack.module.rules.push({
      enforce: 'post',
      exclude: /(__tests__|testing|node_modules|\.spec\.[tj]s$)/,
      loader: 'istanbul-instrumenter-loader',
      options: { esModules: true },
      test: /\.[tj]s$/
    });
    options.reporters = ['coverage-istanbul', ...options.reporters];
    options.coverageIstanbulReporter = {
      reports: ['html', 'text-summary', 'json', 'lcovonly', 'cobertura'],
      dir: 'coverage'
    };
    options.junitReporter = {
      outputDir: 'coverage',
      outputFile: 'test-results.xml',
      useBrowserName: false
    };
  }

  config.set(options);
}

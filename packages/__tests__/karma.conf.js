const path = require('path');

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

  const setup = `setup-browser${config.package ? `-${config.package}` : ''}`;
  const options = {
    basePath,
    browserDisconnectTimeout: 10000,
    processKillTimeout: 10000,
    frameworks: [
      'source-map-support',
      'mocha',
    ],
    files: [
      `dist/esnext/__tests__/${setup}.js`,
    ],
    preprocessors: {
      [`dist/esnext/__tests__/${setup}.js`]: [
        'webpack',
        'sourcemap',
      ],
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only',
      watchOptions: {
        ignored: [
          /\.ts$/,
          'node_modules',
          'coverage'
        ],
      },
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
          'module', 'main'
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
            enforce: 'pre',
            use: ['source-map-loader'],
          },
          {
            test: /\.html$/i,
            loader: 'html-loader'
          },
          {
            test: /\.css$/i,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: { localIdentName: '[name]__[local]__[hash:base64]' },
                }
              }
            ]
          }
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
        ui: 'bdd',
        timeout: 5000,
      }
    },
    logLevel: config.LOG_ERROR // to disable the WARN 404 for image requests
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
};

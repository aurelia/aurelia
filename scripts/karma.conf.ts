import * as karma from 'karma';
import * as webpack from 'webpack';
import project from './project';
import * as path from 'path';

export interface IKarmaConfig extends karma.Config, IKarmaConfigOptions {
  transpileOnly?: boolean;
  noInfo?: boolean;
  coverage?: boolean;
  package?: string;
  reporter?: string;
  set(config: IKarmaConfigOptions): void;
}

export interface IKarmaConfigOptions extends karma.ConfigOptions {
  webpack: webpack.Configuration;
  coverageIstanbulReporter?: any;
  junitReporter?: any;
  customLaunchers: any;
  webpackMiddleware: any;
}

const commonChromeFlags = [
  '--no-default-browser-check',
  '--no-first-run',
  '--no-managed-user-acknowledgment-check',
  '--no-pings',
  '--no-sandbox',
  '--no-wifi',
  '--no-zygote',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backing-store-limit',
  '--disable-boot-animation',
  '--disable-breakpad',
  '--disable-cache',
  '--disable-clear-browsing-data-counters',
  '--disable-cloud-import',
  '--disable-component-extensions-with-background-pages',
  '--disable-contextual-search',
  '--disable-default-apps',
  '--disable-extensions',
  '--disable-infobars',
  '--disable-translate',
  '--disable-sync'
];

export default function(config: IKarmaConfig): void {
  let browsers: string[];
  if (process.env.BROWSERS) {
    browsers = [process.env.BROWSERS];
  } else if (config.browsers) {
    browsers = config.browsers;
  } else {
    browsers = ['Chrome'];
  }
  let packages = project.packages;
  if (config.package && config.package.length) {
    packages = packages.filter(p => config.package.split(',').indexOf(p.name) > -1);
  }

  const options: IKarmaConfigOptions = {
    basePath: project.path,
    frameworks: ['source-map-support', 'mocha', 'chai'],
    files: packages.map(p => p.test.setup),
    preprocessors: packages.reduce(
      (preprocessors, p) => {
        preprocessors[p.test.setup] = ['webpack', 'sourcemap'];
        return preprocessors;
      },
      {}
    ),
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js'],
        modules: [
          ...packages.map(p => p.src),
          project.node_modules.path
        ],
        alias: {
          ...project.packages.reduce(
            (alias, p) => {
              alias[p.scopedName] = p.src;
              return alias;
            },
            {}
          ),
          'test-lib': path.join(project.scripts.path, 'test-lib'),
          'test-lib-dom': path.join(project.scripts.path, 'test-lib-dom'),
          'test-suite': path.join(project.scripts.path, 'test-suite')
        }
      },
      devtool: browsers.indexOf('ChromeDebugging') > -1 ? 'eval-source-map' : 'inline-source-map',
      module: {
        rules: [{
          test: /\.ts$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            configFile: 'scripts/tsconfig.test.json',
            transpileOnly: true
          }
        }]
      }
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    reporters: [process.env.CI ? 'junit' : config.reporter || 'progress'],
    webpackMiddleware: {
      stats: {
        colors: true,
        hash: false,
        version: false,
        timings: false,
        assets: false,
        chunks: false,
        modules: false,
        reasons: false,
        children: false,
        source: false,
        errors: true,
        errorDetails: true,
        warnings: false,
        publicPath: false
      }
    },
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
    client: <any>{
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
      exclude: /(node_modules|\.spec\.ts$)/,
      loader: 'istanbul-instrumenter-loader',
      options: { esModules: true },
      test: /src[\/\\].+\.ts$/
    });
    options.reporters = ['coverage-istanbul', ...options.reporters];
    options.coverageIstanbulReporter = {
      reports: ['html', 'text-summary', 'json', 'lcovonly', 'cobertura'],
      dir: project.coverage.path
    };
    options.junitReporter = {
      outputDir: project.coverage.path,
      outputFile: 'test-results.xml',
      useBrowserName: false
    };
  }

  config.set(options);
}

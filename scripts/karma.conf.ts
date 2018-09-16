import * as karma from 'karma';
import * as webpack from 'webpack';
import project from './project';

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
  const thisPackage = project.packages.find(p => p.name === config.package);
  let browsers: string[];
  if (process.env.BROWSERS) {
    browsers = [process.env.BROWSERS];
  } else if (config.browsers) {
    browsers = config.browsers;
  } else {
    browsers = ['Chrome'];
  }

  const options: IKarmaConfigOptions = {
    basePath: thisPackage.path,
    frameworks: ['mocha', 'chai'],
    files: ['test/setup.ts'],
    preprocessors: {
      'test/setup.ts': ['webpack', 'sourcemap']
    },
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js'],
        modules: ['src', 'node_modules'],
        alias: project.packages.reduce((alias, p) => {
          alias[p.scopedName] = p.src;
          return alias;
        }, {})
      },
      devtool: 'cheap-module-eval-source-map',
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
              configFile: 'tsconfig-test.json',
              transpileOnly: true
            }
          }
        ]
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
        base: "Chrome",
        flags: [
          ...commonChromeFlags,
          '--remote-debugging-port=9333'
        ],
        debug: true
      },
      ChromeHeadlessOpt: {
        base: "ChromeHeadless",
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
    options.reporters.push('coverage-istanbul');
    options.coverageIstanbulReporter = {
      reports: ["html", "text-summary", "json", "lcovonly", "cobertura"],
      dir: thisPackage.coverage
    };
    options.junitReporter = {
      outputDir: thisPackage.coverage,
      outputFile: 'test-results.xml',
      useBrowserName: false
    };
  }

  config.set(options);
};

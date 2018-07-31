import * as karma from 'karma';
import * as webpack from 'webpack';

export interface IKarmaConfig extends karma.Config, IKarmaConfigOptions {
  transpileOnly?: boolean;
  noInfo?: boolean;
  coverage?: boolean;
  package?: string;
  set(config: IKarmaConfigOptions): void;
}

export interface IKarmaConfigOptions extends karma.ConfigOptions {
  webpack: webpack.Configuration;
  coverageIstanbulReporter?: any;
  junitReporter?: any;
  customLaunchers: any;
  webpackMiddleware: any;
}

export function configureKarma(config: IKarmaConfig): void {
  // config.package contains the value passed in via "karma start --package=..."
  // only need to set this when running from the root
  if (config.package) {
    config.basePath = `./packages/${config.package}`;
  }
  
  const options: IKarmaConfigOptions = {
    basePath: config.basePath || './',
    frameworks: ['mocha', 'chai'],
    files: ['test/setup.ts'],
    preprocessors: { 
      'test/setup.ts': ['webpack', 'sourcemap'] 
    },
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js'],
        modules: ['src', 'node_modules']
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
              transpileOnly: config.transpileOnly
            }
          }
        ]
      }
    },
    mime: { 
      'text/x-typescript': ['ts'] 
    },
    reporters: ['mocha'],
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
    browsers: config.browsers || ['Chrome'],
    customLaunchers: {
      ChromeDebugging: {
        base: "Chrome",
        flags: ['--disable-translate', '--disable-extensions', '--remote-debugging-port=9333'],
        debug: true
      }
    }
  };

  if (config.coverage) {
    options.webpack.module.rules.push({
      enforce: 'post',
      exclude: /(node_modules|\.spec\.ts$)/,
      loader: 'istanbul-instrumenter-loader',
      options: { esModules: true },
      test: {
        runtime: /src[\/\\]runtime[\/\\].+\.ts$/,
        debug: /src[\/\\]debug[\/\\].+\.ts$/,
        jit: /src[\/\\]jit[\/\\].+\.ts$/,
        all: /src[\/\\].+\.ts$/
      }[config.package]
    });
    options.reporters.push('coverage-istanbul');
    options.coverageIstanbulReporter = {
      reports: ["html", "text", "json"],
      fixWebpackSourcePaths: true
    };
    // if we're in CircleCI, add CircleCI-compatible junit report
    if (process.env.CI) {
      options.reporters.push('junit');
      options.junitReporter = {
        outputDir: process.env.JUNIT_REPORT_PATH,
        outputFile: process.env.JUNIT_REPORT_NAME,
        useBrowserName: false
      };
    }
  }

  config.set(options);
};

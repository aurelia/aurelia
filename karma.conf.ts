import * as karma from 'karma';
import * as path from 'path';
import * as webpack from 'webpack';

export interface IKarmaConfig extends karma.Config, IKarmaConfigOptions {
  transpileOnly?: boolean;
  noInfo?: boolean;
  coverage?: boolean;
  tsconfig?: string;
  set(config: IKarmaConfigOptions): void;
}

export interface IKarmaConfigOptions extends karma.ConfigOptions {
  webpack: webpack.Configuration;
  coverageIstanbulReporter?: any;
  webpackServer: any;
  customLaunchers: any;
}

export default (config: IKarmaConfig): void => {
  const rules: webpack.Rule[] = [];

  const options: IKarmaConfigOptions = {
    basePath: config.basePath || './',
    frameworks: ['jasmine'],
    files: ['test/setup.ts'],
    preprocessors: {
      'test/setup.ts': ['webpack', 'sourcemap']
    },
    webpack: {
      mode: 'development',
      resolve: {
        extensions: ['.ts', '.js'],
        modules: ['src', 'node_modules'],
        alias: {
          bluebird: path.resolve(__dirname, 'node_modules/bluebird/js/browser/bluebird.core'),
          'performance-now': path.resolve(__dirname, 'node_modules/performance-now/lib/performance-now')
        }
      },
      devtool: 'cheap-module-eval-source-map',
      module: {
        rules: [
          {
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/,
            options: {
              configFile: config.tsconfig || 'tsconfig-karma.json',
              transpileOnly: config.transpileOnly
            }
          }
        ]
      },
      plugins: [
        new webpack.ProvidePlugin({
          Promise: 'bluebird',
          now: 'performance-now'
        })
      ]
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    reporters: ['mocha', 'progress'],
    webpackServer: { noInfo: config.noInfo },
    browsers: config.browsers || ['Chrome'],
    customLaunchers: {
      ChromeDebugging: {
        base: 'Chrome',
        flags: ['--remote-debugging-port=9333'],
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
      test: /src[\/\\].+\.ts$/
    });
    options.reporters.push('coverage-istanbul');
    options.coverageIstanbulReporter = {
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    };
  }

  config.set(options);
};

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
  customLaunchers: any;
  webpackMiddleware: any;
}

export default (config: IKarmaConfig): void => {
  const rules: webpack.Rule[] = [];

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
        modules: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'node_modules')
        ],
        alias: {
          bluebird: path.resolve(__dirname, 'node_modules', 'bluebird', 'js', 'browser', 'bluebird.core.min')
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
              configFile: config.tsconfig || path.resolve(__dirname, 'test', 'tsconfig.json'),
              transpileOnly: config.transpileOnly
            }
          }
        ]
      },
      plugins: [new webpack.ProvidePlugin({ Promise: 'bluebird' })]
    },
    mime: { 'text/x-typescript': ['ts'] },
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
      test: /src[\/\\].+\.ts$/
    });
    options.reporters.push('coverage-istanbul');
    options.coverageIstanbulReporter = {
      reports: ["html", "lcovonly", "text-summary"],
      fixWebpackSourcePaths: true
    };
  }

  config.set(options);
};

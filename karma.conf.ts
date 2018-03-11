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
  coverageIstanbulReporter: any;
  webpackServer: any;
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
              configFile: config.tsconfig || 'tsconfig-karma.json',
              transpileOnly: config.transpileOnly
            }
          }
        ]
      }
    },
    mime: {
      'text/x-typescript': ['ts']
    },
    reporters: ['mocha', 'progress'],
    coverageIstanbulReporter: {
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    },
    webpackServer: { noInfo: config.noInfo },
    browsers: config.browsers || ['Chrome']
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
  }

  config.set(options);
};

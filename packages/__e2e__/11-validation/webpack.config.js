const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** @returns {import('webpack').Configuration} */
module.exports = function () {
  return {
    target: 'web',
    mode: 'production',
    entry: './src/index.ts',
    devServer: {
      port: process.env.APP_PORT ?? 8080,
    },
    optimization: {
      minimize: false,
      concatenateModules: false,
    },
    performance: {
      hints: false,
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    devtool: 'eval-cheap-module-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['.', 'node_modules'],
      alias: {
        ...[
          'fetch-client',
          'router-lite',
          'kernel',
          'expression-parser',
          'runtime',
          'template-compiler',
          'runtime-html',
        ].reduce(
          (map, pkg) => {
            const name = `@aurelia/${pkg}`;
            map[name] = resolve(
              __dirname,
              '../../../node_modules',
              name,
              'dist/esm/index.dev.mjs'
            );
            return map;
          },
          {
            aurelia: resolve(
              __dirname,
              '../../../node_modules/aurelia/dist/esm/index.dev.mjs'
            ),
          }
        ),
      },
    },
    module: {
      rules: [
        { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ },
        {
          test: /[/\\]src[/\\].+\.html$/i,
          use: 'html-loader',
          exclude: /node_modules/,
        },
      ],
    },
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })],
  };
};

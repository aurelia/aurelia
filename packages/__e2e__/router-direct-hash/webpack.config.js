const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/** @returns {import('webpack').Configuration} */
module.exports = function () {
  return {
    target: 'web',
    mode: 'production',
    entry: './src/index.ts',
    optimization: {
      minimize: false,
      // concatenateModules: false,
    },
    performance: {
      hints: false,
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    devtool: false,
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['.', 'node_modules'],
      alias: {
        ...[
          'fetch-client',
          'router',
          'kernel',
          'runtime',
          'runtime-html',
        ].reduce((map, pkg) => {
          const name = `@aurelia/${pkg}`;
          map[name] = resolve(__dirname, '../../../node_modules', name, 'dist/esm/index.dev.mjs');
          return map;
        }, {
          'aurelia': resolve(__dirname, '../../../node_modules/aurelia/dist/esm/index.dev.mjs'),
        })
      }
    },
    module: {
      rules: [
        // { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ },
        // { test: /[/\\]src[/\\].+\.html$/i, use: 'html-loader', exclude: /node_modules/ },
        { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
        { test: /[/\\]src[/\\].+\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.html' }),
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false
      })
    ]
  };
};

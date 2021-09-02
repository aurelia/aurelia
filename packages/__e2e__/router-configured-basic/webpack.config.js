const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/** @returns {import('webpack').Configuration} */
module.exports = function () {
  return {
    target: 'web',
    mode: 'production',
    entry: {
      'configured-basic': ['./src/index.ts']
    },
    optimization: {
      minimize: false,
      concatenateModules: false,
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: '[name].js',
    },
    devtool: false,
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['.', 'node_modules']
    },
    module: {
      rules: [
        { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ },
        { test: /[/\\]src[/\\].+\.html$/i, use: 'html-loader', exclude: /node_modules/ },
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

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = function (env, { analyze }) {
  const production = env.production || process.env.NODE_ENV === 'production';
  return {
    target: 'web',
    mode: production ? 'production' : 'development',
    devtool: production ? undefined : 'eval-cheap-source-map',
    entry: {
      entry: './src/main.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: production ? '[name].[contenthash].bundle.js' : '[name].bundle.js'
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules']
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      port: 9000
    },
    module: {
      rules: [
        { test: /\.css$/i, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
        { test: /\.ts$/i, use: 'ts-loader', exclude: /node_modules/ },
        { test: /\.html$/i, use: 'html-loader' },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.html' }),
      analyze && new BundleAnalyzerPlugin()
    ].filter(p => p)
  }
}

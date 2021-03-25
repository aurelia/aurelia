/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const cssLoader = 'css-loader';
const srcDir = path.resolve(__dirname, 'src');
const assetsDir = path.join(srcDir, '_assets');


const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer']
    }
  }
};

module.exports = function(env, { analyze }) {
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
        { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
        { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
        // { test: /\.css$/i, use: [ 'style-loader', cssLoader, postcssLoader ] },
        { test: /\.css$/, include: assetsDir, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
        { test: /\.css$/, exclude: assetsDir, loader: 'css-loader' },
        { test: /\.ts$/i, use: ['ts-loader' /* , '@aurelia/webpack-loader' */], exclude: /node_modules/ },
        // { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ }
        { test: /\.html$/i, use: 'html-loader', exclude: /node_modules/ }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      // analyze && new BundleAnalyzerPlugin()
    ].filter(p => p),
    experiments: {
      topLevelAwait: true,
    },
  };
};

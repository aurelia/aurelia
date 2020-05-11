const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/startup.ts',
    devtool: false,
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      mainFields: ['module', 'main']
    },
    devServer: {
      port: 9000,
      historyApiFallback: true,
      open: true,
      lazy: false
    },
    module: {
      rules: [
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      new CompressionPlugin({
        filename: '[path].br[query]',
        algorithm: 'brotliCompress',
        test: /\.(js|css|svg)$/,
        compressionOptions: {
          // zlib’s `level` option matches Brotli’s `BROTLI_PARAM_QUALITY` option.
          level: 11,
        },
        threshold: 10240,
        minRatio: 0.8,
        deleteOriginalAssets: false,
      }),
      new CompressionPlugin({
        filename: '[path].gz[query]',
        test: /\.(js|css|svg)$/,
        deleteOriginalAssets: false,
      }),
    ]
  };
};

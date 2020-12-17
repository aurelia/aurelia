const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseUrl = '/';

module.exports = function () {
  return {
    mode: 'production',
    devtool: false,
    entry: './src/main.ts',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules'],
      mainFields: ['module']
    },
    devServer: {
      contentBase: path.join(__dirname, "dist"),
      historyApiFallback: true,
      lazy: false
    },
    output: {
      publicPath: baseUrl,
    },
    module: {
      rules: [
        { test: /\.css$/i, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
        { test: /\.ts$/i, use: 'ts-loader', exclude: /node_modules/ },
        { test: /\.html$/i, use: 'html-loader' },
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
    ]
  };
};

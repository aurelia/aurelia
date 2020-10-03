const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function () {
  return {
    mode: 'development',
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
        { test: /\.ts$/, loader: 'ts-loader' },
        { test: /\.html$/, loader: 'html-loader' }
      ]
    },
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })]
  };
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, '..', 'server', 'dist'),
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules'],
      mainFields: ['module', 'main'],
    },
    devServer: {
      port: 9000,
      historyApiFallback: true,
      open: true,
      lazy: false,
    },
    module: {
      rules: [
        { test: /\.css$/i, loader: 'css-loader' },
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html',
      }),
    ],
  };
};

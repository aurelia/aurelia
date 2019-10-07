const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseUrl = '';

module.exports = function (env, { mode }) {
  const production = mode === 'production';
  if (!production) { console.warn('Warning this is built in a non production mode'); }
  return {
    mode: 'development',
    devtool: false,
    entry: './src/main.ts',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules'],
      mainFields: ['module']
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      lazy: false
    },
    output: {
      publicPath: baseUrl,
    },
    module: {
      rules: [
        { test: /\.css$/i, use: ["style-loader", "css-loader"] },
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      new CopyWebpackPlugin([{ from: './css', to: './css' }])
    ]
  };
};

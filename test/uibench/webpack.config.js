const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    devtool: 'inline-source-maps',
    entry: './src/main.ts',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules']
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      port: 9000,
      lazy: false
    },
    module: {
      rules: [
        { test: /\.css$/i, use: ["style-loader", "css-loader"] },
        { test: /\.ts$/i, loader: 'ts-loader', exclude: /node_modules/ },
        { test: /\.html$/i, loader: 'html-loader' }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      new webpack.DefinePlugin({
        'process.env': { NODE_ENV: JSON.stringify(mode) }
      }),
    ]
  }
}

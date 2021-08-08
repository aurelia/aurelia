const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/main.ts',
    devtool: "inline-cheap-module-source-map",
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      mainFields: ['module'],
      // sadly these fallbacks are required to run the app via webpack-dev-server
      fallback: {
        'html-entities': require.resolve('html-entities/'),
        'url': require.resolve('url/'),
        'events': require.resolve('events/'),
      },
    },
    devServer: {
      port: 9500,
      historyApiFallback: true,
    },
    module: {
      rules: [
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
    ]
  };
};

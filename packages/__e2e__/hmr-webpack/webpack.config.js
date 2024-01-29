const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * @return {import('webpack').Configuration}
 */
module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/index.ts',
    devtool: false,
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
      mainFields: ['module', 'main'],
      // sadly these fallbacks are required to run the app via webpack-dev-server
      fallback: {
        'html-entities': require.resolve('html-entities'),
        'url': require.resolve('url'),
        'events': require.resolve('events'),
      },
    },
    experiments: {
      lazyCompilation: true
    },
    devServer: {
      hot: true,
      port: process.env.APP_PORT ?? 9000,
      historyApiFallback: true,
      open: !process.env.CI,
      
    },
    stats: 'errors-only',
    module: {
      rules: [
        { test: /\.ts$/i, use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          },
          '@aurelia/webpack-loader'
        ], exclude: /node_modules/ },
        { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ }
      ]
    },
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })]
  };
};

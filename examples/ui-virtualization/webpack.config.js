const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = /** @return {import('webpack').Configuration} */ function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/startup.ts',
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
    devServer: {
      historyApiFallback: true,
      open: true,
      ...(process.env.WEBPACK_PORT ? { port: Number(process.env.WEBPACK_PORT) } : {}),
    },
    module: {
      rules: [
        { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
        { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ }
      ]
    },
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })]
  };
};

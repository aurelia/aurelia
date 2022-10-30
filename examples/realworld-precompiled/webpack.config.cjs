module.exports = function (env, { mode }) {
  const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const srcDir = path.resolve(__dirname, 'src');

  return {
    mode: 'development',
    devtool: 'source-map',
    entry: './src/main.ts',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [srcDir, 'node_modules'],
      alias: {
        'aurelia': path.resolve(__dirname, '..', '..', 'node_modules/aurelia/dist/esm/index.dev.mjs'),
        ...[
          'dialog',
          'fetch-client',
          'i18n',
          'kernel',
          'metadata',
          'platform',
          'platform-browser',
          'route-recognizer',
          'router',
          'router-html',
          'router-lite',
          'runtime',
          'runtime-html',
          'state',
          'store',
          'ui-virtualization',
          'validation',
          'validation-html',
          'validation-i18n',
        ].reduce((map, pkg) => {
          map[`@aurelia/${pkg}`] = path.resolve(__dirname, '..', '..', `node_modules/@aurelia/${pkg}/dist/esm/index.dev.mjs`);
          return map;
        }, {}),
      },
      mainFields: ['module', 'main'],
    },
    devServer: {
      historyApiFallback: true,
      open: true,
      port: 9000,
    },
    module: {
      rules: [
        { test: /\.ts$/, loader: 'ts-loader' },
        { test: /\.mjs$/, enforce: 'pre', loader: 'source-map-loader' },
        { test: /\.html$/, loader: 'html-loader' },
        { test: /\.css$/, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.html' }),
    ],
    experiments: {
      topLevelAwait: true,
    },
  };
};

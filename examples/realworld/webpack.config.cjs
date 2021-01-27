module.exports = function (env, { mode }) {
  const path = require('path');
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  const srcDir = path.resolve(__dirname, 'src');

  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    devtool: production ? 'source-maps' : 'inline-source-map',
    entry: './src/main.ts',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [srcDir, 'node_modules'],
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

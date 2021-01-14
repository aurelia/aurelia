const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/startup.ts',
    devtool: production ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.ts', '.js'],
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],,
      // sadly these fallbacks are required to run the app via webpack-dev-server
      fallback: {
        'html-entities': require.resolve('html-entities/'),
        'url': require.resolve('url/'),
        'events': require.resolve('events/'),
      },
    },
    devServer: {
      port: 9000,
      historyApiFallback: true,
      open: true,
    },
    module: {
      rules: [
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' },
        { test: /\.css$/i, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff2" } },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: "url-loader", options: { limit: 10000, mimetype: "application/font-woff" } },
        { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: "file-loader" },
      ]
    },
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })]
  };
};

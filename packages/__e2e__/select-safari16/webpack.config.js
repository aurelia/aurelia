const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cssLoader = 'css-loader';
const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer']
    }
  }
};

module.exports = /** @return {import('webpack').Configuration} */ function (env, { mode }) {
  const production = mode === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/startup.ts',
    devtool: production ? 'source-map' : 'inline-source-map',
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
        { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
        { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
        { test: /\.css$/i, use: [ 'style-loader', cssLoader, postcssLoader ] },
        { test: /\.ts$/i, use: ['ts-loader', '@aurelia/webpack-loader'], exclude: /node_modules/ },
        { test: /\.html$/i, use: '@aurelia/webpack-loader', exclude: /node_modules/ }
      ]
    },
    plugins: [new HtmlWebpackPlugin({ template: 'index.ejs' })]
  };
};

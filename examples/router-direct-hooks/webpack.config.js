const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const cssLoader = 'css-loader';
const postcssLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: ['autoprefixer']
    }
  }
};

module.exports = function (env, { analyze }) {
  const production = env === 'production' || process.env.NODE_ENV === 'production';
  return {
    mode: production ? 'production' : 'development',
    entry: './src/main.ts',
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
      alias: {
        ...[
        'aurelia',
        'fetch-client',
        'kernel',
        'metadata',
        'platform',
        'platform-browser',
        'route-recognizer',
        'router',
        'router-lite',
        'runtime',
        'runtime-html',
        'testing',
        'state',
        'ui-virtualization'
        ].reduce((map, pkg) => {
          const name = `@aurelia/${pkg}`;
          map[name] = path.resolve(__dirname, '../../node_modules', name, 'dist/esm/index.dev.mjs');
          return map;
        }, {
          'aurelia': path.resolve(__dirname, '../../node_modules/aurelia/dist/esm/index.dev.mjs'),
        })
      }
    },
    devServer: {
      historyApiFallback: true,
      open: !process.env.CI,
      ...(process.env.WEBPACK_PORT ? { port: Number(process.env.WEBPACK_PORT) } : { port: 9035 }),
    },
    module: {
      rules: [
        { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
        { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
        { test: /\.css$/i, use: ['style-loader', cssLoader, postcssLoader] },
        { test: /\.ts$/i, use: ['ts-loader'], exclude: /node_modules/ },
        { test: /\.html$/i, use: 'html-loader', exclude: /node_modules/ }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({ template: 'index.ejs' }),
      analyze && new BundleAnalyzerPlugin()
    ].filter(p => p)
  };
};

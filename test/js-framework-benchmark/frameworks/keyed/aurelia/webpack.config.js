const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin');
const project = require('./aurelia_project/aurelia.json');
const { AureliaPlugin, ModuleDependenciesPlugin } = require('aurelia-webpack-plugin');
const { ProvidePlugin } = require('webpack');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || [];
const when = (condition, config, negativeConfig) =>
  condition ? ensureArray(config) : ensureArray(negativeConfig);

// primary config:
const title = 'Aurelia Navigation Skeleton';
const outDir = path.resolve(__dirname, project.platform.output);
const srcDir = path.resolve(__dirname, 'src');
const baseUrl = '';

const cssRules = [
  { loader: 'css-loader' },
];

module.exports = ({ production, extractCss, analyze, tests, hmr, port, host } = {}) => ({
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [srcDir, 'node_modules'],
    // Enforce single aurelia-binding, to avoid v1/v2 duplication due to
    // out-of-date dependencies on 3rd party aurelia plugins
    alias: { 'aurelia-binding': path.resolve(__dirname, 'node_modules/aurelia-binding') }
  },
  entry: {
    app: ['aurelia-bootstrapper']
  },
  mode: production ? 'production' : 'development',
  output: {
    path: outDir,
    publicPath: baseUrl,
    filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
    chunkFilename: production ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
  },
  optimization: {
    runtimeChunk: true,  // separates the runtime chunk, required for long term cacheability
    // moduleIds is the replacement for HashedModuleIdsPlugin and NamedModulesPlugin deprecated in https://github.com/webpack/webpack/releases/tag/v4.16.0
    // changes module id's to use hashes be based on the relative path of the module, required for long term cacheability
    moduleIds: 'hashed',
    // Use splitChunks to breakdown the App/Aurelia bundle down into smaller chunks
    // https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: {
      hidePathInfo: true, // prevents the path from being used in the filename when using maxSize
      chunks: "initial",
      // sizes are compared against source before minification
      maxInitialRequests: Infinity, // Default is 3, make this unlimited if using HTTP/2
      maxAsyncRequests: Infinity, // Default is 5, make this unlimited if using HTTP/2
      minSize: 10000, // chunk is only created if it would be bigger than minSize, adjust as required
      maxSize: 40000, // splits chunks if bigger than 40k, adjust as required (maxSize added in webpack v4.15)
      cacheGroups: {
        default: false, // Disable the built-in groups default & vendors (vendors is redefined below)
        // You can insert additional cacheGroup entries here if you want to split out specific modules
        // This is required in order to split out vendor css from the app css when using --extractCss
        // For example to separate font-awesome and bootstrap:
        // fontawesome: { // separates font-awesome css from the app css (font-awesome is only css/fonts)
        //   name: 'vendor.font-awesome',
        //   test:  /[\\/]node_modules[\\/]font-awesome[\\/]/,
        //   priority: 100,
        //   enforce: true
        // },
        // bootstrap: { // separates bootstrap js from vendors and also bootstrap css from app css
        //   name: 'vendor.font-awesome',
        //   test:  /[\\/]node_modules[\\/]bootstrap[\\/]/,
        //   priority: 90,
        //   enforce: true
        // },

        // This is the HTTP/2 optimised cacheGroup configuration
        // generic 'initial/sync' vendor node module splits: separates out larger modules
        vendorSplit: { // each node module as separate chunk file if module is bigger than minSize
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Extract the name of the package from the path segment after node_modules
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.${packageName.replace('@', '')}`;
          },
          priority: 20
        },
        vendors: { // picks up everything else being used from node_modules that is less than minSize
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 19,
          enforce: true // create chunk regardless of the size of the chunk
        },
        // generic 'async' vendor node module splits: separates out larger modules
        vendorAsyncSplit: { // vendor async chunks, create each asynchronously used node module as separate chunk file if module is bigger than minSize
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // Extract the name of the package from the path segment after node_modules
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `vendor.async.${packageName.replace('@', '')}`;
          },
          chunks: 'async',
          priority: 10,
          reuseExistingChunk: true,
          minSize: 5000 // only create if 5k or larger
        },
        vendorsAsync: { // vendors async chunk, remaining asynchronously used node modules as single chunk file
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors.async',
          chunks: 'async',
          priority: 9,
          reuseExistingChunk: true,
          enforce: true // create chunk regardless of the size of the chunk
        },
        // generic 'async' common module splits: separates out larger modules
        commonAsync: { // common async chunks, each asynchronously used module a separate chunk file if module is bigger than minSize
          name(module) {
            // Extract the name of the module from last path component. 'src/modulename/' results in 'modulename'
            const moduleName = module.context.match(/[^\\/]+(?=\/$|$)/)[0];
            return `common.async.${moduleName.replace('@', '')}`;
          },
          minChunks: 2, // Minimum number of chunks that must share a module before splitting
          chunks: 'async',
          priority: 1,
          reuseExistingChunk: true,
          minSize: 5000 // only create if 5k or larger
        },
        commonsAsync: { // commons async chunk, remaining asynchronously used modules as single chunk file
          name: 'commons.async',
          minChunks: 2, // Minimum number of chunks that must share a module before splitting
          chunks: 'async',
          priority: 0,
          reuseExistingChunk: true,
          enforce: true // create chunk regardless of the size of the chunk
        }
      }
    }
  },
  performance: { hints: false },
  devServer: {
    contentBase: outDir,
    // serve index.html for all 404 (required for push-state)
    historyApiFallback: true,
    hot: hmr,
    port: port || project.platform.port,
    host: host || project.platform.host
  },
  devtool: production ? 'nosources-source-map' : 'cheap-module-eval-source-map',
  module: {
    rules: [
      // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
      // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
      {
        test: /\.css$/i,
        issuer: [{ not: [{ test: /\.html$/i }] }],
        use: extractCss ? [{
          loader: MiniCssExtractPlugin.loader
        },
        'css-loader'
        ] : ['style-loader', ...cssRules]
      },
      {
        test: /\.css$/i,
        issuer: [{ test: /\.html$/i }],
        // CSS required in templates cannot be extracted safely
        // because Aurelia would try to require it again in runtime
        use: cssRules
      },
      { test: /\.html$/i, loader: 'html-loader' },
      { test: /\.ts$/, loader: "ts-loader" },
      // embed small images and fonts as Data Urls and larger ones as files:
      { test: /\.(png|gif|jpg|cur)$/i, loader: 'url-loader', options: { limit: 8192 } },
      { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff2' } },
      { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'url-loader', options: { limit: 10000, mimetype: 'application/font-woff' } },
      // load these fonts normally, as files:
      { test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i, loader: 'file-loader' },
      { test: /environment\.json$/i, use: [
        {loader: "app-settings-loader", options: {env: production ? 'production' : 'development' }},
      ]},
      ...when(tests, {
        test: /\.[jt]s$/i, loader: 'istanbul-instrumenter-loader',
        include: srcDir, exclude: [/\.(spec|test)\.[jt]s$/i],
        enforce: 'post', options: { esModules: true },
      })
    ]
  },
  plugins: [
    ...when(!tests, new DuplicatePackageCheckerPlugin()),
    new AureliaPlugin(),
    new ProvidePlugin({
      'Promise': ['promise-polyfill', 'default']
    }),
    new ModuleDependenciesPlugin({
      'aurelia-testing': ['./compile-spy', './view-spy']
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      metadata: {
        // available in index.ejs //
        title, baseUrl
      }
    }),
    // ref: https://webpack.js.org/plugins/mini-css-extract-plugin/
    ...when(extractCss, new MiniCssExtractPlugin({ // updated to match the naming conventions for the js files
      filename: production ? 'css/[name].[contenthash].bundle.css' : 'css/[name].[hash].bundle.css',
      chunkFilename: production ? 'css/[name].[contenthash].chunk.css' : 'css/[name].[hash].chunk.css'
    })),
    ...when(!tests, new CopyWebpackPlugin([
      { from: 'static', to: outDir, ignore: ['.*'] }])), // ignore dot (hidden) files
    ...when(analyze, new BundleAnalyzerPlugin()),
    /**
     * Note that the usage of following plugin cleans the webpack output directory before build.
     * In case you want to generate any file in the output path as a part of pre-build step, this plugin will likely
     * remove those before the webpack build. In that case consider disabling the plugin, and instead use something like
     * `del` (https://www.npmjs.com/package/del), or `rimraf` (https://www.npmjs.com/package/rimraf).
     */
    new CleanWebpackPlugin()
  ]
});

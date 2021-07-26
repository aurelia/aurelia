const { resolve } = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

/** @returns {import('webpack').Configuration} */
module.exports = function () {
  return {
    target: 'web',
    mode: 'production',
    entry: {
      app: ['./app.js']
    },
    optimization: {
      concatenateModules: false
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    devtool: false,
    resolve: {
      extensions: ['.js'],
      modules: ['.', 'node_modules']
    },
    plugins: [
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: true
      })
    ]
  };
};

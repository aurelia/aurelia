const { resolve } = require('path');

module.exports = function () {
  return {
    mode: 'development',
    devtool: false,
    performance: {
      hints: false
    },
    optimization: {
      namedModules: false,
      namedChunks: false,
      nodeEnv: false,
      usedExports: true,
      flagIncludedChunks: false,
      occurrenceOrder: false,
      sideEffects: true,
      concatenateModules: true,
      splitChunks: {
        hidePathInfo: false,
        minSize: Infinity,
        maxAsyncRequests: Infinity,
        maxInitialRequests: Infinity,
      },
      noEmitOnErrors: false,
      checkWasmTypes: false,
      minimize: false,
    },
    entry: {
      app: ['./app.js']
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    resolve: {
      extensions: ['.js'],
      modules: ['.', 'node_modules'],
      mainFields: ['module']
    }
  };
};

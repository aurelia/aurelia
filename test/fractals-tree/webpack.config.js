const { resolve } = require('path');

module.exports = function () {
  return {
    target: 'web',
    mode: 'production',
    entry: {
      app: ['./app.js']
    },
    output: {
      path: resolve(__dirname, 'dist'),
      filename: 'bundle.js'
    },
    devtool: false,
    resolve: {
      extensions: ['.js'],
      modules: ['.', 'node_modules']
    }
  };
};

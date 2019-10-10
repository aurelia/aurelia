const path = require('path');

module.exports = function(env, { app }) {
  return {
    mode: 'development',
    entry: `./src/${app}/startup.ts`,
    output: {
      filename: `bundle.${app}.js`,
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: ['src', 'node_modules']
    },
    module: {
      rules: [
        { test: /\.ts$/i, loader: 'ts-loader' },
        { test: /\.html$/i, loader: 'html-loader' }
      ]
    }
  };
};

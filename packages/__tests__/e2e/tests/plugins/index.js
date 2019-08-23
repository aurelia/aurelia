const wp = require('@cypress/webpack-preprocessor');

module.exports = (on) => {
  const options = {
    webpackOptions: {
      watch: true,
      resolve: {
        extensions: ['.ts', '.tsx', '.js']
      },
      module: {
        rules: [{
          test: /\.tsx?$/,
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        }]
      }
    }
  };
  on('file:preprocessor', wp(options));
}

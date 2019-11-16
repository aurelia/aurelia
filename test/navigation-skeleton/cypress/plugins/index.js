const wp = require('@cypress/webpack-preprocessor');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const options = {
    webpackOptions: require('../../webpack.config'),
  }

  on('file:preprocessor', wp(options));
}

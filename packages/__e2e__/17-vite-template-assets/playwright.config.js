// @ts-check
module.exports = {
  ...require('../playwright-util')(require('./package.json')),
  globalSetup: require.resolve('./playwright/global-setup'),
  workers: 1,
};

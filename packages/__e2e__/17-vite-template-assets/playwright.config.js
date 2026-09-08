// @ts-check
module.exports = {
  ...require('../playwright-util')(require('./package.json')),
  workers: 1,
  webServer: {
    command: 'node scripts/vite.mjs preview',
    url: `http://127.0.0.1:${require('./package.json').port}`,
  },
};

module.exports.config = {
  port: '9515',
  path: '/',
  specs: ['./e2e/*.spec.js'],

  capabilities: [{ browserName: 'chrome' }],

  baseUrl: 'http://localhost:9000',

  framework: 'mocha',
  mochaOpts: { ui: 'bdd' },

  services: [require('./launcher')]
};

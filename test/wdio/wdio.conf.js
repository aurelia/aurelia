module.exports.config = {
  port: '9515',
  path: '/',
  specs: ['./specs/*.spec.js'],

  capabilities: [{ browserName: 'chrome' }],

  baseUrl: 'http://127.0.0.1:9000',

  framework: 'mocha',
  mochaOpts: { ui: 'bdd' },

  services: [require('./launcher')]
};

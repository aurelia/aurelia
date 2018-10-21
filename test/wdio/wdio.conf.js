module.exports.config = {
  port: '9515',
  path: '/',
  specs: ['./specs/*.spec.js'],

  capabilities: [{ browserName: 'chrome' }],

  baseUrl: 'http://localhost:9000',

  framework: 'mocha',
  mochaOpts: { ui: 'bdd' },

  services: [require('./launcher')]
};

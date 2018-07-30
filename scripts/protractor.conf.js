exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['test/e2e/*.spec.js'],
  directConnect: true,

  onPrepare: function() {
    browser.ignoreSynchronization = true;
  },
  capabilities: {
    browserName: 'chrome'
  }
};

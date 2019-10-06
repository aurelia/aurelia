const { equal } = require('assert');

describe('aurelia example', function() {
  this.timeout(20000);
  it('should display "Hello World!"', function() {
    browser.url('/');
    console.log(`[browser logs]: ${JSON.stringify(browser.log('browser'), null, 2)}`);
    browser.waitForExist('app>div', 10000);
    console.log(`[browser logs]: ${JSON.stringify(browser.log('browser'), null, 2)}`);
    equal(browser.getText('app>div'), 'Hello World!');
  });
});

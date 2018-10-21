const { equal } = require('assert');

describe('aurelia example', function() {
  it('should display "Hello World!"', function() {
    browser.url('/');
    console.log(`[browser logs]: ${JSON.stringify(browser.log('browser'), null, 2)}`);
    equal(browser.getText('app>div'), 'Hello World!');
  });
});

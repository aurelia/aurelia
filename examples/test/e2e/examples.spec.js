const { equal } = require('assert');

describe('webdriverio', function() {
  it('should run a test', function() {
    browser.url('/');
    equal(browser.getText('app>div'), 'Hello World!');
  });
});

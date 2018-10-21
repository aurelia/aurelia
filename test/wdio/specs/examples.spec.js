const { equal } = require('assert');

describe('aurelia example', function() {
  it('should display "Hello World!"', function() {
    browser.url('/');
    equal(browser.getText('app>div'), 'Hello World!');
  });
});

import { Reporter } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('The default Reporter', function () {
  it('creates an Error with a minimal message upon request', function () {
    const code = 42;
    const error = Reporter.error(code);
    assert.includes(error.message, `Code ${code}`, `error.message`);
  });
});

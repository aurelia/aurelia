import { assert, TestContext } from '@aurelia/testing';
import { isNode } from '../util.js';

describe('IPlatform', function () {
  it('setups platform', function () {
    const ctx = TestContext.create();

    assert.strictEqual(typeof ctx.platform.setInterval, 'function');
    assert.strictEqual(typeof ctx.platform.clearInterval, 'function');
    assert.strictEqual(typeof ctx.platform.setTimeout, 'function');
    assert.strictEqual(typeof ctx.platform.clearTimeout, 'function');
    assert.strictEqual(ctx.platform.Date, Date);
    if (!isNode()) {
      assert.strictEqual(ctx.platform.console, console);
    }
  });
});

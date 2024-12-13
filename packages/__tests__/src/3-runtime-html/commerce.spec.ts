import { assert } from '@aurelia/testing';
import { createCommerceFixture } from './commerce/fixture.js';

describe('3-runtime-html/commerce.spec.ts', function () {
  it('works', async function () {
    const { start, stop, appShell } = createCommerceFixture();
    await start();
    assert.strictEqual(appShell.globalFiltersPanel.state, appShell.state);

    await stop();
  });
});

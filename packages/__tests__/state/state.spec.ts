import { StandardStateConfiguration } from '@aurelia/state';
import { assert, createFixture } from '@aurelia/testing';

describe('state/state.spec.ts', function () {
  it('works', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture(
      '<input value.state="text">',
      void 0,
      [StandardStateConfiguration.init(state)]
    ).promise;

    assert.strictEqual(getBy('input').value, '123');
  });
});

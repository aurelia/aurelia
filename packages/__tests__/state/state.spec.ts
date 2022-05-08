import { IStateAction, StandardStateConfiguration } from '@aurelia/state';
import { assert, createFixture } from '@aurelia/testing';

describe('state/state.spec.ts', function () {
  it('connects to initial state object', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture(
      '<input value.state="text">',
      void 0,
      [StandardStateConfiguration.init(state)]
    ).promise;

    assert.strictEqual(getBy('input').value, '123');
  });

  it('does not observe global state object', async function () {
    const state = { text: '123' };
    const { getBy, ctx } = await createFixture(
      '<input value.state="text">',
      void 0,
      [StandardStateConfiguration.init(state)]
    ).promise;

    assert.strictEqual(getBy('input').value, '123');

    // assert that it's not observed
    state.text = 'abc';
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(getBy('input').value, '123');
  });

  it('allows access to state via $state in .state command', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture(
      '<input value.state="$state.text">',
      void 0,
      [StandardStateConfiguration.init(state)]
    ).promise;

    assert.strictEqual(getBy('input').value, '123');
  });

  it('allows access to component scope state via $parent in .state command', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture(
      '<input value.state="$parent.text">',
      { text: '456' },
      [StandardStateConfiguration.init(state)]
    ).promise;

    assert.strictEqual(getBy('input').value, '456');
  });

  it('makes state immutable', async function () {
    const state = { text: '123' };
    const { trigger } = await createFixture(
      '<input value.state="text" input.trigger="$state.text = `456`">',
      void 0,
      [StandardStateConfiguration.init(state)]
    ).promise;

    trigger('input', 'input');
    assert.strictEqual(state.text, '123');
  });

  it('dispatches action when register', async function () {
    const state = { text: '1' };
    const { getBy, trigger } = await createFixture(
      '<input value.state="text" input.dispatch="$event.target.value">',
      void 0,
      [StandardStateConfiguration.init(
        state,
        (s: typeof state, action: IStateAction<string, { value: string }>) => {
          return { text: s.text + action.payload.value };
        })
      ]
    ).promise;

    assert.strictEqual(getBy('input').value, '1');

    trigger('input', 'input');
    assert.strictEqual(getBy('input').value, '11');
  });

  describe('.dispatch', function () {
    it('works with debounce', async function () {
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture(
        '<input value.state="text" input.dispatch="$event.target.value & debounce:1">',
        void 0,
        [StandardStateConfiguration.init(
          state,
          (s: typeof state, action: IStateAction<string, { value: string }>) => {
            return { text: s.text + action.payload.value };
          })
        ]
      ).promise;

      trigger('input', 'input');
      assert.strictEqual(getBy('input').value, '1');

      await waitFor(10);
      assert.strictEqual(getBy('input').value, '11');
    });

    it('works with throttle', async function () {
      let actionCallCount = 0;
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture(
        '<input value.state="text" input.dispatch="$event.target.value & throttle:1">',
        void 0,
        [StandardStateConfiguration.init(
          state,
          (s: typeof state, action: IStateAction<string, { value: string }>) => {
            actionCallCount++;
            return { text: s.text + action.payload.value };
          })
        ]
      ).promise;

      trigger('input', 'input');
      assert.strictEqual(getBy('input').value, '11');

      trigger('input', 'input');
      assert.strictEqual(getBy('input').value, '11');

      await waitFor(10);
      assert.strictEqual(actionCallCount, 2);
      assert.strictEqual(getBy('input').value, '1111');
    });
  });
});

const waitFor = (time: number) => new Promise(r => setTimeout(r, time));

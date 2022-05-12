import { StandardStateConfiguration } from '@aurelia/state';
import { assert, createFixture } from '@aurelia/testing';

describe('state/state.spec.ts', function () {
  it('connects to initial state object', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .html`<input value.state="text">`
      .deps(StandardStateConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123');
  });

  it('does not observe global state object', async function () {
    const state = { text: '123' };
    const { getBy, ctx } = await createFixture
      .html('<input value.state="text">')
      .deps(StandardStateConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123');

    // assert that it's not observed
    state.text = 'abc';
    ctx.platform.domWriteQueue.flush();
    assert.strictEqual(getBy('input').value, '123');
  });

  it('allows access to state via $state in .state command', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .html('<input value.state="$state.text">')
      .deps(StandardStateConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123');
  });

  it('allows access to component scope state via $parent in .state command', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .component({ text: '456' })
      .html('<input value.state="$parent.text">')
      .deps(StandardStateConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '456');
  });

  it('makes state immutable', async function () {
    const state = { text: '123' };
    const { trigger } = await createFixture
      .html('<input value.state="text" input.trigger="$state.text = `456`">')
      .deps(StandardStateConfiguration.init(state))
      .build().started;

    trigger('input', 'input');
    assert.strictEqual(state.text, '123');
  });

  it('dispatches action when register', async function () {
    const state = { text: '1' };
    const { getBy, trigger } = await createFixture
      .html`<input value.state="text" input.dispatch="$event.target.value">`
      .deps(StandardStateConfiguration.init(
        state,
        { target: 'event', action: (s: typeof state, { value }: { value }) => {
          return { text: s.text + value };
        }})
      )
      .build().started;

    assert.strictEqual(getBy('input').value, '1');

    trigger('input', 'input');
    assert.strictEqual(getBy('input').value, '11');
  });

  it('works with promise', async function () {
    const state = { data: () => resolveAfter(1, 'value-1-2') };
    const { getBy } = await createFixture
      .html`<input value.state="data()">`
      .deps(StandardStateConfiguration.init(state))
      .build().started;

    await resolveAfter(2);
    assert.strictEqual(getBy('input').value, 'value-1-2');
  });

  it('works with rx-style observable', async function () {
    let disposeCallCount = 0;
    const state = {
      data: () => {
        return {
          subscribe(cb: (res: unknown) => void) {
            cb('value-1');
            setTimeout(() => {
              cb('value-2');
            }, 1);
            return () => { disposeCallCount++; };
          }
        };
      }
    };
    const { getBy, tearDown } = await createFixture
      .html`<input value.state="data()">`
      .deps(StandardStateConfiguration.init(state))
      .build().started;

      assert.strictEqual(getBy('input').value, 'value-1');

      await resolveAfter(2);
      assert.strictEqual(getBy('input').value, 'value-2');
      // observable doesn't invoke disposal of the subscription
      // only updating the target
      assert.strictEqual(disposeCallCount, 0);

      await tearDown();
      assert.strictEqual(disposeCallCount, 1);
  });

  describe('.dispatch', function () {
    // firefox not pleasant with throttling & debouncing
    this.retries(3);

    it('works with debounce', async function () {
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture
        .html('<input value.state="text" input.dispatch="$event.target.value & debounce:1">')
        .deps(StandardStateConfiguration.init(
          state,
          { target: 'event', action: (s: typeof state, { value }) => {
            return { text: s.text + value };
          }})
        )
        .build().started;

      trigger('input', 'input');
      assert.strictEqual(getBy('input').value, '1');

      await resolveAfter(10);
      assert.strictEqual(getBy('input').value, '11');
    });

    it('works with throttle', async function () {
      let actionCallCount = 0;
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture
        .html('<input value.state="text" input.dispatch="$event.target.value & throttle:1">')
        .deps(StandardStateConfiguration.init(
          state,
          { target: 'event', action: (s: typeof state, { value }) => {
            actionCallCount++;
            return { text: s.text + value };
          }})
        )
        .build().started;

      trigger('input', 'input');
      assert.strictEqual(getBy('input').value, '11');

      trigger('input', 'input');
      assert.strictEqual(getBy('input').value, '11');

      await resolveAfter(10);
      assert.strictEqual(actionCallCount, 2);
      assert.strictEqual(getBy('input').value, '1111');
    });
  });
});

const resolveAfter = <T>(time: number, value?: T) => new Promise<T>(r => setTimeout(() => r(value), time));

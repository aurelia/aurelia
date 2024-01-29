import { ValueConverter, customAttribute, customElement, ICustomAttributeController, IWindow } from '@aurelia/runtime-html';
import { StateDefaultConfiguration, fromState } from '@aurelia/state';
import { assert, createFixture, onFixtureCreated } from '@aurelia/testing';

describe('state/state.spec.ts', function () {
  this.beforeEach(function () {
    onFixtureCreated(({ ctx }) => {
      const window = ctx.container.get(IWindow);
      if ('__REDUX_DEVTOOLS_EXTENSION__' in window) return;
      Object.assign(window, {
        __REDUX_DEVTOOLS_EXTENSION__: {
          connect: () => ({ init: () => {/* empty */}, subscribe: () => {/* empty */} })
        }
      });
    });
  });

  it('connects to initial state object', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .html`<input value.state="text">`
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123');
  });

  it('works with value converter', async function () {
    const state = { text: 'aaa' };
    const { getBy } = await createFixture
      .html`<input value.state="text | suffix1">`
      .deps(
        StateDefaultConfiguration.init(state),
        ValueConverter.define('suffix1', class { toView(v: unknown) { return `${v}1`; } })
      )
      .build().started;

    assert.strictEqual(getBy('input').value, 'aaa1');
  });

  // it('does not observe global state object', async function () {
  //   const state = { text: '123' };
  //   const { getBy, ctx } = await createFixture
  //     .html('<input value.state="text">')
  //     .deps(StandardStateConfiguration.init(state))
  //     .build().started;

  //   assert.strictEqual(getBy('input').value, '123');

  //   // assert that it's not observed
  //   state.text = 'abc';
  //   ctx.platform.domWriteQueue.flush();
  //   assert.strictEqual(getBy('input').value, '123');
  // });

  it('does not see property on view model without $parent', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .component({ vmText: '456' })
      .html('<input value.state="vmText">')
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '');
  });

  it('allows access to component scope state via $parent in .state command', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .component({ text: '456' })
      .html('<input value.state="$parent.text">')
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '456');
  });

  it('remains in state boundary via this in .state command', async function () {
    const state = { text: '123' };
    const { getBy } = await createFixture
      .component({ text: '456' })
      .html('<input value.state="this.text">')
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123');
  });

  it('reacts to view model changes', async function () {
    const state = { text: '123' };
    const { component, getBy, flush } = await createFixture
      .component({ value: '--' })
      .html('<input value.state="text + $parent.value">')
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123--');
    component.value = '';
    flush();
    assert.strictEqual(getBy('input').value, '123');
  });

  it('makes state immutable', async function () {
    const state = { text: '123' };
    const { trigger } = await createFixture
      .html('<input value.state="text" input.trigger="$state.text = `456`">')
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    trigger('input', 'input');
    assert.strictEqual(state.text, '123');
  });

  it('works with promise', async function () {
    const state = { data: () => resolveAfter(1, 'value-1-2') };
    const { getBy } = await createFixture
      .html`<input value.state="data()">`
      .deps(StateDefaultConfiguration.init(state))
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
      .deps(StateDefaultConfiguration.init(state))
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

  describe('& state binding behavior', function () {
    it('connects normal binding to the global store', async function () {
      const { getBy } = await createFixture
        .html`<input value.bind="text & state">`
        .deps(StateDefaultConfiguration.init({ text: '123' }))
        .build().started;

      assert.strictEqual(getBy('input').value, '123');
    });

    it('prevents normal scope traversal', async function () {
      const { getBy } = await createFixture
        .html`<input value.bind="text & state">`
        .component({ text: 'from view model' })
        .deps(StateDefaultConfiguration.init({}))
        .build().started;

      assert.strictEqual(getBy('input').value, '');
    });

    it('allows access to host scope via $parent', async function () {
      const { getBy } = await createFixture
        .html`<input value.bind="$parent.text & state">`
        .component({ text: 'from view model' })
        .deps(StateDefaultConfiguration.init({ text: 'from state' }))
        .build().started;

      assert.strictEqual(getBy('input').value, 'from view model');
    });

    it('works with repeat', async function () {
      const { assertText } = await createFixture
        .html`<button repeat.for="item of items & state">-\${item}</button>`
        .deps(StateDefaultConfiguration.init({ items: ['sleep', 'exercise', 'eat'] }))
        .build().started;

      assertText('-sleep-exercise-eat');
    });

    it('works with text interpolation', async function () {
      const { assertText } = await createFixture
        .html`<div>\${text & state}</div>`
        .component({ text: 'from view model' })
        .deps(StateDefaultConfiguration.init({ text: 'from state' }))
        .build().started;

      assertText('from state');
    });

    it('updates text when state changes', async function () {
      const { trigger, flush, getBy } = await createFixture
        .html`<input value.bind="text & state" input.dispatch="$event.target.value">`
        .component({ text: 'from view model' })
        .deps(StateDefaultConfiguration.init({ text: '1' }, (s, a) => ({ text: s.text + a })))
        .build().started;

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '11');
    });

    it('updates repeat when state changes', async function () {
      const { trigger, assertText } = await createFixture
        .html`
          <button click.dispatch="''">change</button>
          <center><div repeat.for="item of items & state">\${item}`
        .deps(StateDefaultConfiguration.init({ items: [1, 2, 3] }, () => ({ items: [4, 5, 6] })))
        .build().started;

      assertText('center', '123');
      trigger('button', 'click');
      assertText('center', '456');
    });
  });

  describe('.dispatch', function () {
    // firefox not pleasant with throttling & debouncing
    this.retries(3);

    it('dispatches action', async function () {
      const state = { text: '1' };
      const { getBy, trigger, flush } = await createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) =>
            type === 'event' ? { text: s.text + v } : s
        ))
        .build().started;

      assert.strictEqual(getBy('input').value, '1');

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '11');
    });

    it('handles multiple action types in a single reducer', async function () {
      const state = { text: '1' };
      const { getBy, trigger, flush } = await createFixture
        .html`
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
          <button click.dispatch="{ type: 'clear' }">Clear</button>
        `
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v}: { type: string; v: string }) =>
            type === 'event'
              ? { text: s.text + v }
              : type === 'clear'
                ? { text: '' }
                : s
        ))
        .build().started;

      assert.strictEqual(getBy('input').value, '1');

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '11');

      trigger.click('button');
      flush();
      assert.strictEqual(getBy('input').value, '');
    });

    it('does not throw on unreged action type', async function () {
      const state = { text: '1' };
      const { trigger, flush, getBy } = await createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'no-reg', v: $event.target.value }">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) =>
            type === 'event' ? { text: s.text + v } : s
        ))
        .build().started;

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '1');
    });

    it('works with debounce', async function () {
      const state = { text: '1' };
      const { getBy, trigger, flush } = createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value } & debounce:1">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) =>
            type === 'event' ? { text: s.text + v } : s
        ))
        .build();

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '1');

      await resolveAfter(10);
      flush();
      assert.strictEqual(getBy('input').value, '11');
    });

    it('works with throttle', async function () {
      let actionCallCount = 0;
      const state = { text: '1' };
      const { getBy, trigger, flush } = await createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value } & throttle:1">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) => {
            if (type === 'event') {
              actionCallCount++;
              return { text: s.text + v };
            }
            return s;
          }
        ))
        .build().started;

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '11');

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '11');

      await resolveAfter(10);
      assert.strictEqual(actionCallCount, 2);
      flush();
      assert.strictEqual(getBy('input').value, '1111');
    });
  });

  describe('@state decorator', function () {
    it('works on custom element', async function () {
      @customElement({ name: 'my-el', template: `<input value.bind="text">` })
      class MyEl {
        @fromState<typeof state>(s => s.text)
        text: string;
      }

      const state = { text: '1' };
      const { getBy } = await createFixture
        .html`<my-el>`
        .deps(MyEl, StateDefaultConfiguration.init(state))
        .build().started;

      assert.strictEqual(getBy('input').value, '1');
    });

    it('works on custom attribute', async function () {
      @customAttribute('myattr')
      class MyAttr {
        $controller: ICustomAttributeController;

        @fromState<typeof state>(s => s.text)
        set text(v: string) {
          this.$controller.host.setAttribute('hello', 'world');
        }
      }

      const state = { text: '1' };
      const { queryBy } = await createFixture
        .html`<div myattr>`
        .deps(MyAttr, StateDefaultConfiguration.init(state))
        .build().started;

      assert.notStrictEqual(queryBy('div[hello=world]'), null);
    });

    it('updates when state changed', async function () {
      @customElement({ name: 'my-el', template: `<input value.bind="text" input.dispatch="{ type: 'input', v: $event.target.value }">` })
      class MyEl {
        @fromState<typeof state>(s => s.text)
        text: string;
      }

      const state = { text: '1' };
      const { trigger, flush, getBy } = await createFixture
        .html`<my-el>`
        .deps(MyEl, StateDefaultConfiguration.init(state, (s, { v }) => ({ text: s.text + v })))
        .build().started;

      trigger('input', 'input');
      flush();
      assert.strictEqual(getBy('input').value, '11');
    });

    it('updates custom attribute prop when state changes', async function () {
      @customAttribute('myattr')
      class MyAttr {
        $controller: ICustomAttributeController;

        @fromState<typeof state>(s => s.text)
        set text(v: string) {
          this.$controller.host.setAttribute('hello', v);
        }
      }

      const state = { text: '1' };
      const { trigger, queryBy } = await createFixture
        .html`<div myattr click.dispatch="{ type: '' }">`
        .deps(MyAttr, StateDefaultConfiguration.init(state, () => ({ text: '2' })))
        .build().started;

      trigger('div', 'click');
      assert.notStrictEqual(queryBy('div[hello="2"]'), null);
    });
  });

});

const resolveAfter = <T>(time: number, value?: T) => new Promise<T>(r => setTimeout(() => r(value), time));

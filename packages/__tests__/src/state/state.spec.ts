import { ValueConverter, customAttribute, customElement, ICustomAttributeController, IWindow } from '@aurelia/runtime-html';

import { tasksSettled } from '@aurelia/runtime';
import { StateDefaultConfiguration, fromState, createStateMemoizer } from '@aurelia/state';
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

  it('understands shorthand syntax', async function () {
    const state = { value: '1' };
    const { assertValue } = createFixture
      .html`<input value.state>`
      .deps(StateDefaultConfiguration.init(state))
      .build();

    assertValue('input', '1');
  });

  it('does not throw in access member - object nullish', async function () {
    const state = { a: null };
    assert.doesNotThrow(() => createFixture
      .html`<input value.state="a.b">`
      .deps(StateDefaultConfiguration.init(state))
      .build()
    );
  });

  it('[strict] throws in access member - object nullish', async function () {
    const state = { a: null };
    assert.throws(() => createFixture
      .html`<input value.state="a.b">`
      .component(class { static strict = true; })
      .deps(StateDefaultConfiguration.init(state))
      .build()
    );
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
  //   ctx.platform.domQueue.flush();
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
    const { component, getBy } = await createFixture
      .component({ value: '--' })
      .html('<input value.state="text + $parent.value">')
      .deps(StateDefaultConfiguration.init(state))
      .build().started;

    assert.strictEqual(getBy('input').value, '123--');
    component.value = '';
    await tasksSettled();
    assert.strictEqual(getBy('input').value, '123');
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
      const { trigger, getBy } = await createFixture
        .html`<input value.bind="text & state" input.dispatch="$event.target.value">`
        .component({ text: 'from view model' })
        .deps(StateDefaultConfiguration.init({ text: '1' }, (s, a) => ({ text: s.text + a })))
        .build().started;

      trigger('input', 'input');
      await tasksSettled();
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
      await tasksSettled();
      assertText('center', '456');
    });
  });

  describe('.dispatch', function () {
    // firefox not pleasant with throttling & debouncing
    this.retries(3);

    it('dispatches action', async function () {
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) =>
            type === 'event' ? { text: s.text + v } : s
        ))
        .build().started;

      assert.strictEqual(getBy('input').value, '1');

      trigger('input', 'input');
      await tasksSettled();
      assert.strictEqual(getBy('input').value, '11');
    });

    it('handles multiple action types in a single reducer', async function () {
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture
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
      await tasksSettled();
      assert.strictEqual(getBy('input').value, '11');

      trigger.click('button');
      await tasksSettled();
      assert.strictEqual(getBy('input').value, '');
    });

    it('does not throw on unreged action type', async function () {
      const state = { text: '1' };
      const { trigger, getBy } = await createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'no-reg', v: $event.target.value }">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) =>
            type === 'event' ? { text: s.text + v } : s
        ))
        .build().started;

      trigger('input', 'input');
      await tasksSettled();
      assert.strictEqual(getBy('input').value, '1');
    });

    it('works with debounce', async function () {
      const state = { text: '1' };
      const { getBy, trigger } = createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value } & debounce:5">`
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) =>
            type === 'event' ? { text: s.text + v } : s
        ))
        .build();

      trigger('input', 'input');
      await resolveAfter(1);
      assert.strictEqual(getBy('input').value, '1');

      await resolveAfter(10);
      assert.strictEqual(getBy('input').value, '11');
    });

    it('works with throttle', async function () {
      let actionCallCount = 0;
      const state = { text: '1' };
      const { getBy, trigger } = await createFixture
        .html`<input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value } & throttle:10">`
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
      await tasksSettled();
      assert.strictEqual(getBy('input').value, '11');

      trigger('input', 'input');
      await resolveAfter(1);
      assert.strictEqual(getBy('input').value, '11');

      await resolveAfter(20);
      assert.strictEqual(actionCallCount, 2);
      assert.strictEqual(getBy('input').value, '1111');
    });

    it('notifies changes only once for single synchronous dispatch', async function () {
      let started = 0;
      const logs = [];
      const state = { text: '1', click: 0 };
      const { trigger } = await createFixture
        .html`
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
          <button click.dispatch="{ type: 'click' }">Change</button>
        `
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) => {
            if (type === 'event') {
              return { ...s, text: s.text + v };
            }
            if (type === 'click') {
              return { ...s, click: s.click + 1 };
            }
            return s;
          }
        ))
        .component(class {
          @fromState<typeof state>(state => {
            if (started > 0) {
              logs.push({ ...state });
            }
            return state.text;
          })
          text: string;
        })
        .build().started;
      started = 1;

      trigger('input', 'input');
      trigger('button', 'click');

      assert.deepEqual(logs, [
        { text: '11', click: 0 },
        { text: '11', click: 1 }
      ]);
    });

    it('notifies changes only once for single asynchronous dispatch', async function () {
      let started = 0;
      const logs = [];
      const state = { text: '1', click: 0 };
      const { trigger, assertValue } = await createFixture
        .html`
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
        `
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) => {
            return Promise.resolve().then(() => {
              if (type === 'event') {
                return { ...s, text: s.text + v };
              }
              if (type === 'click') {
                return { ...s, click: s.click + 1 };
              }
              return s;
            });
          }
        ))
        .component(class {
          @fromState<typeof state>(state => {
            if (started > 0) {
              logs.push({ ...state });
            }
            return state.text;
          })
          text: string;
        })
        .build().started;
      started = 1;

      trigger('input', 'input');

      await resolveAfter(1);
      assert.deepEqual(logs, [
        { text: '11', click: 0 },
      ]);

      assertValue('input', '11');
    });

    it('notifies change for every dispatch', async function () {
      let started = false;
      const logs = [];
      const state = { text: '1', click: 0 };
      const { trigger, assertValue } = await createFixture
        .html`
          <input value.state="text" input.dispatch="{ type: 'event', v: $event.target.value }">
          <button click.dispatch="{ type: 'click' }">Change</button>
        `
        .deps(StateDefaultConfiguration.init(
          state,
          (s, { type, v }: { type: string; v: string }) => {
            return Promise.resolve().then(() => {
              if (type === 'event') {
                return { ...s, text: s.text + v };
              }
              if (type === 'click') {
                return { ...s, click: s.click + 1 };
              }
              return s;
            });
          }
        ))
        .component(class {
          @fromState<typeof state>(state => {
            if (started) {
              logs.push({ ...state });
            }
            return state.text;
          })
          text: string;
        })
        .build().started;
      started = true;

      trigger('input', 'input');
      trigger('button', 'click');

      assert.deepEqual(logs, []);

      await resolveAfter(1);
      assert.deepEqual(logs, [
        { text: '11', click: 0 },
        { text: '11', click: 1 }
      ]);

      await resolveAfter(1);
      assertValue('input', '11');

      trigger('input', 'input');
      trigger('button', 'click');

      await resolveAfter(1);
      assert.deepEqual(logs, [
        { text: '11', click: 0 },
        { text: '11', click: 1 },
        { text: '1111', click: 1 },
        { text: '1111', click: 2 },
      ]);

      assertValue('input', '1111');
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

      assert.strictEqual(getBy('input').value, '1', 'text-input value');
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
      const { trigger, getBy } = await createFixture
        .html`<my-el>`
        .deps(MyEl, StateDefaultConfiguration.init(state, (s, { v }) => ({ text: s.text + v })))
        .build().started;

      trigger('input', 'input');
      await tasksSettled();
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

  describe('createStateMemoizer', function () {
    it('memoizes results based on dependencies', function () {
      interface S { items: number[]; flag: boolean }
      const items = [1, 2, 3];
      let computeCalls = 0;
      const total = createStateMemoizer(
        (s: S) => s.items,
        (i) => { computeCalls++; return i.reduce((a, b) => a + b, 0); }
      );

      const s1: S = { items, flag: true };
      assert.strictEqual(total(s1), 6);
      assert.strictEqual(computeCalls, 1);

      const s2: S = { items, flag: false };
      assert.strictEqual(total(s2), 6);
      assert.strictEqual(computeCalls, 1);

      const s3: S = { items: [1, 2, 3, 4], flag: false };
      assert.strictEqual(total(s3), 10);
      assert.strictEqual(computeCalls, 2);
    });

    it('memoizes when single selector is provided', function () {
      interface S {
        flag: boolean;
      }
      let calls = 0;
      const selectFlag = createStateMemoizer((s: S) => { calls++; return s.flag; });

      const s: S = { flag: true };
      assert.strictEqual(selectFlag(s), true);
      selectFlag(s);
      assert.strictEqual(calls, 1);
    });
  });

  it('works with the fromState decorator', async function () {
    interface S { items: number[]; flag: boolean }
    let computeCalls = 0;
    const selectTotal = createStateMemoizer(
      (s: S) => s.items,
      items => { computeCalls++; return items.reduce((a, b) => a + b, 0); }
    );

    @customElement({ name: 'my-el', template: `\${total}` })
    class MyEl {
      @fromState<S>(selectTotal)
      total: number;
    }

    const state: S = { items: [1, 2, 3], flag: false };
    const { trigger, assertText } = await createFixture
      .html`
        <my-el></my-el>
        <button id="flag" click.dispatch="{ type: 'toggle' }"></button>
        <button id="add" click.dispatch="{ type: 'add', value: 4 }"></button>
      `
      .deps(
        MyEl,
        StateDefaultConfiguration.init(state, (s, a: { type: 'toggle' | 'add'; value?: number }) => {
          if (a.type === 'toggle') { return { ...s, flag: !s.flag }; }
          if (a.type === 'add') { return { ...s, items: [...s.items, a.value!] }; }
          return s;
        })
      )
      .build().started;

    assertText('my-el', '6');
    assert.strictEqual(computeCalls, 1);

    trigger('#flag', 'click');
    await Promise.resolve();
    assertText('my-el', '6');
    assert.strictEqual(computeCalls, 1);

    trigger('#add', 'click');
    await Promise.resolve();
    assertText('my-el', '10');
    assert.strictEqual(computeCalls, 2);
  });

  it('shares memoized results across components', async function () {
    interface S { items: number[]; flag: boolean }
    let computeCalls = 0;
    const selectTotal = createStateMemoizer(
      (s: S) => s.items,
      items => { computeCalls++; return items.reduce((a, b) => a + b, 0); }
    );

    @customElement({ name: 'el-a', template: `\${total}` })
    class ElA { @fromState<S>(selectTotal) total: number; }

    @customElement({ name: 'el-b', template: `\${total}` })
    class ElB { @fromState<S>(selectTotal) total: number; }

    const state: S = { items: [1, 2, 3], flag: false };
    const { trigger, assertText } = await createFixture
      .html`
        <el-a></el-a>
        <el-b></el-b>
        <button id="flag" click.dispatch="{ type: 'toggle' }"></button>
        <button id="add" click.dispatch="{ type: 'add', value: 4 }"></button>
      `
      .deps(
        ElA,
        ElB,
        StateDefaultConfiguration.init(state, (s, a: { type: 'toggle' | 'add'; value?: number }) => {
          if (a.type === 'toggle') { return { ...s, flag: !s.flag }; }
          if (a.type === 'add') { return { ...s, items: [...s.items, a.value!] }; }
          return s;
        })
      )
      .build().started;

    assertText('el-a', '6');
    assertText('el-b', '6');
    assert.strictEqual(computeCalls, 1);

    trigger('#flag', 'click');
    await Promise.resolve();
    assertText('el-a', '6');
    assertText('el-b', '6');
    assert.strictEqual(computeCalls, 1);

    trigger('#add', 'click');
    await Promise.resolve();
    assertText('el-a', '10');
    assertText('el-b', '10');
    assert.strictEqual(computeCalls, 2);
  });
});

const resolveAfter = <T>(time: number, value?: T) => new Promise<T>(r => setTimeout(() => r(value), time));

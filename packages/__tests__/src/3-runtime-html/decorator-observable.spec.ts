import { observable, SetterObserver, IObservable, IObserverLocator, IObserver, tasksSettled } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';
import { noop, resolve } from '@aurelia/kernel';
import { ValueConverter, customElement, watch } from '@aurelia/runtime-html';

describe('3-runtime-html/decorator-observable.spec.ts', function () {
  beforeEach(async function () {
    assert.strictEqual(await tasksSettled(), false, `queue should be empty prior to each test`);
  });
  afterEach(async function () {
    assert.strictEqual(await tasksSettled(), false, `queue should be empty after each test`);
  });

  const oldValue = 'old';
  const newValue = 'new';

  // [UNIT] tests needed:         change handler, symbol key, symbol change handler
  // todo: define the spec how it should behave for:
  // [INTEGRATION] tests needed:  <select 2 way /> <radio 2 way />

  it('initializes with TS', async function () {
    let callCount = 0;
    class Test {
      @observable
      public value = oldValue;

      public valueChanged() {
        callCount++;
      }
    }
    const instance = new Test();

    // with TC39 decorator, the initialization callback can be avoided.
    assert.strictEqual(callCount, 0);
    assert.strictEqual(instance.value, oldValue);
    assert.notInstanceOf((instance as unknown as IObservable).$observers['value'], SetterObserver);

    instance.value = newValue;
    assert.strictEqual(callCount, 1);
    assert.strictEqual(instance.value, newValue);
  });

  it('should not call valueChanged when property is assigned the same value', async function () {
    let callCount = 0;
    class Test {
      @observable
      public value = oldValue;

      public valueChanged() {
        callCount++;
      }
    }

    const instance = new Test();
    assert.strictEqual(callCount, 0);

    instance.value = oldValue;
    assert.strictEqual(callCount, 0);
  });

  it('initialize with Babel property decorator', async function () {
    let callCount = 0;
    class Test {
      public value: any;

      public constructor() {
        // this mimics the generated code by Babel
        const instanceInitializers = [];
        const metadata = Object.create(null);
        const context: ClassFieldDecoratorContext = {
          kind: 'field',
          name: 'value',
          addInitializer: (fn) => instanceInitializers.push(fn),
          private: false,
          static: false,
          metadata,
          access: {
            get(object: Test) {
              return object.value;
            },
            set(object: Test, value: any) {
              object.value = value;
            },
            has(object: Test) {
              return 'value' in object;
            }
          }
        };
        const valueInitializer = observable(undefined, context);
        Object.defineProperty(this, 'value', { value: valueInitializer.call(this, oldValue), enumerable: true, configurable: true, writable: true });
        for (const initializer of instanceInitializers) {
          initializer.call(this);
        }
      }

      public valueChanged() {
        callCount++;
      }
    }

    const instance = new Test();
    assert.strictEqual(callCount, 0);
    assert.strictEqual(instance.value, oldValue);

    instance.value = oldValue;
    assert.strictEqual(callCount, 0);

    instance.value = newValue;
    assert.strictEqual(callCount, 1);
  });

  it('should call customHandler when changing the property', async function () {
    let callCount = 0;
    class Test {
      @observable({ callback: 'customHandler' })
      public value = oldValue;

      public customHandler() {
        callCount++;
      }
    }

    const instance = new Test();
    assert.strictEqual(callCount, 0);

    instance.value = newValue;
    assert.strictEqual(callCount, 1);

    instance.customHandler = noop;
    instance.value = oldValue;
    // change handler is resolved once
    assert.strictEqual(callCount, 2);
  });

  describe('with normal app', function () {
    it('works in basic scenario', async function () {
      const noValue = {};
      let $div = noValue;
      class App {
        @observable
        public div: any;
        public divChanged(div) {
          $div = div;
        }
      }
      const { component, testHost, tearDown } = await createFixture(`<div ref="div"></div>\${div.tagName}`, App).started;

      assert.notDeepStrictEqual($div, noValue);

      assert.strictEqual(testHost.textContent, 'DIV');
      component.div = { tagName: 'hello' };

      await tasksSettled();
      assert.strictEqual(testHost.textContent, 'hello');

      await tearDown();
    });

    it('works for 2 way binding', async function () {
      let changeCount = 0;
      class App {
        @observable
        public v: any;
        public vChanged(_input) {
          changeCount++;
        }
      }
      const { ctx, component, testHost, tearDown } = await createFixture('<input value.bind="v">', App).started;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '');
      component.v = 'v';
      await tasksSettled();
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, 'v');

      input.value = 'vv';
      await tasksSettled();
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 'vv');
      assert.strictEqual(changeCount, 2);

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 'vv');
      assert.strictEqual(changeCount, 2);

      await tearDown();
    });

    it('works with 2 way binding and converter', async function () {
      let changeCount = 0;
      class App {
        @observable({
          set: v => Number(v) || 0
        })
        public v: any;
        public vChanged(_input) {
          changeCount++;
        }
      }
      const { ctx, component, testHost, tearDown } = await createFixture('<input value.bind="v">', App).started;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '', 'err1');
      component.v = 'v';
      await tasksSettled();
      assert.strictEqual(component.v, 0, 'err2');
      assert.strictEqual(changeCount, 1, 'err3');
      assert.strictEqual(input.value, '0', 'err4');

      input.value = 'vv';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err7');
      assert.strictEqual(changeCount, 1, 'err8');
      assert.strictEqual(input.value, 'vv', 'err9');
      await tasksSettled();
      // for this assignment, the component.v still 0
      // so there was no change, and it's not propagated back to the input
      assert.strictEqual(input.value, 'vv', 'err10');
      assert.strictEqual(component.v, 0, 'err11');

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err12');
      assert.strictEqual(changeCount, 1, 'err13');
      assert.strictEqual(input.value, 'vv', 'err14');
      await tasksSettled();
      assert.strictEqual(input.value, 'vv', 'err15');
      assert.strictEqual(component.v, 0, 'err16');

      // real valid input assertion
      input.value = '1';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 1, 'err17');
      assert.strictEqual(changeCount, 2, 'err18');
      await tasksSettled();
      assert.strictEqual(input.value, '1', 'err19');

      await tearDown();
    });

    it('works with 2 way binding and value converter', async function () {
      let changeCount = 0;
      class App {
        @observable({
          set: v => Number(v) || 0
        })
        public v: any;
        public vChanged(_input) {
          changeCount++;
        }
      }
      const {
        ctx,
        component,
        testHost,
        tearDown,
      } = await createFixture(
        '<input value.bind="v | two">',
        App,
        [ValueConverter.define('two', class {
          public fromView(v: any) {
            // converting back and forth with number
            // so prefixing with '0' to avoid infinite loop
            return `0${v}`;
          }
          public toView(v: any) {
            return v;
          }
        })]
      ).started;
      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '', 'err1');

      component.v = 'v';
      await tasksSettled();
      assert.strictEqual(component.v, 0, 'err2');
      assert.strictEqual(changeCount, 1, 'err3');
      assert.strictEqual(input.value, '0', 'err4');

      input.value = 'vv';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err7');
      assert.strictEqual(changeCount, 1, 'err8');
      assert.strictEqual(input.value, 'vv', 'err9');
      await tasksSettled();
      // for this assignment, the component.v still 0
      // so there was no change, and it's not propagated back to the input
      assert.strictEqual(input.value, 'vv', 'err10');
      assert.strictEqual(component.v, 0, 'err11');

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err12');
      assert.strictEqual(changeCount, 1, 'err13');
      assert.strictEqual(input.value, 'vv', 'err14');
      await tasksSettled();
      assert.strictEqual(input.value, 'vv', 'err15');
      assert.strictEqual(component.v, 0, 'err16');

      // real valid input assertion
      input.value = '1';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 1, 'err17');
      assert.strictEqual(changeCount, 2, 'err18');
      await tasksSettled();
      assert.strictEqual(input.value, '1', 'err19');

      await tearDown();
    });
  });

  it('handle recursive changes', async function () {

    @customElement('')
    class MyApp {
      public message = 'Hello Aurelia 2!';

      public logs = [];

      @observable
      public count: number = 0;

      public countObs: IObserver;
      public obsLoc = resolve(IObserverLocator);

      public created() {
        this.countObs = this.obsLoc.getObserver(this, 'count');
        this.countObs.subscribe({
          handleChange: (value: number, oldValue: number) => {
            if (value > 0 && value < 3) {
              this.log('S.1. handleChange()', value, oldValue);
              if (value > oldValue) {
                this.count++;
              } else {
                this.count--;
              }
            }
          }
        });
      }

      public countChanged(value: number) {
        this.log('P.1. countChanged()', value);
      }

      public incr() {
        if (this.count < 10) {
          this.count++;
          this.log('After incr()', this.count);
          // console.assert(this.count, 9);
        }
      }

      public decr() {
        if (this.count > 0) {
          this.count--;
          this.log('After decr()', this.count);
          // console.assert(this.count, 1);
        }
      }

      public log(...msgs: unknown[]) {
        this.logs.push(msgs);
      }
    }

    const { component, getAllBy, stop } = createFixture(`
      <button click.trigger="incr()">Incr()</button>
      <button click.trigger="decr()">Decr()</button>
      <div id="logs"><div repeat.for="log of logs">\${log}</div></div>
    `, MyApp);

    assert.deepStrictEqual(component.logs, []);
    const [incrButton, decrButton] = getAllBy('button');

    // when clicking on increment, increase count all the way to 3 by 1 at a time
    incrButton.click();
    assert.deepStrictEqual(
      component.logs,
      [
        ['S.1. handleChange()', 1, 0],
        ['S.1. handleChange()', 2, 1],
        ['P.1. countChanged()', 3],
        ['After incr()', 3]
      ]
    );

    // when clicking on decrement, decrease count all the way to 0 by 1 at a time
    decrButton.click();
    assert.deepStrictEqual(
      component.logs,
      [
        ['S.1. handleChange()', 1, 0],
        ['S.1. handleChange()', 2, 1],
        ['P.1. countChanged()', 3],
        ['After incr()', 3],
        ['S.1. handleChange()', 2, 3],
        ['S.1. handleChange()', 1, 2],
        ['P.1. countChanged()', 0],
        ['After decr()', 0]
      ]
    );

    void stop(true);
  });

  // https://github.com/aurelia/aurelia/issues/2022
  it('calls change handler callback after propagating changes', async function () {
    const logs = [];

    createFixture(
      '<outer-component>',
      class OuterComponent {
        @observable
        prop1 = 1;

        @observable
        prop2 = 1;

        prop3 = 0;

        // trigger point here
        attached() {
          logs.push(`attached`);
          logs.push(`prop1: ${this.prop1}`);
          logs.push(`prop2: ${this.prop2}`);
          logs.push(`prop3: ${this.prop3}`);
          this.prop1 = 2;
        }

        prop1Changed() {
          logs.push(`prop1Changed`);
          logs.push(`prop1: ${this.prop1}`);
          logs.push(`prop2: ${this.prop2}`);
          logs.push(`prop3: ${this.prop3}`);
          this.prop2 = 2;
        }

        prop2Changed() {
          logs.push(`prop2Changed`);
          logs.push(`prop1: ${this.prop1}`);
          logs.push(`prop2: ${this.prop2}`);
          logs.push(`prop3: ${this.prop3}`);
        }

        @watch('prop1')
        handleProp1Changed() {
          logs.push(`handleProp1Changed`);
          this.prop3 = 3;
          logs.push(`prop1: ${this.prop1}`);
          logs.push(`prop2: ${this.prop2}`);
          logs.push(`prop3: ${this.prop3}`);
        }
      }
    );

    await tasksSettled();
    assert.deepStrictEqual(logs, [
      'attached',
      'prop1: 1',
      'prop2: 1',
      'prop3: 0',
      'prop1Changed',
      'prop1: 2',
      'prop2: 1',
      'prop3: 0',
      'prop2Changed',
      'prop1: 2',
      'prop2: 2',
      'prop3: 0',
      'handleProp1Changed',
      'prop1: 2',
      'prop2: 2',
      'prop3: 3',
    ]);
  });

});

import { observable, SetterObserver, IObservable, IObserverLocator, IObserver } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';
import { noop } from '@aurelia/kernel';
import { ValueConverter, customElement } from '@aurelia/runtime-html';

describe('3-runtime-html/decorator-observable.spec.ts', function () {
  const oldValue = 'old';
  const newValue = 'new';

  // [UNIT] tests needed:         change handler, symbol key, symbol change handler
  // todo: define the spec how it should behave for:
  // [INTEGRATION] tests needed:  <select 2 way /> <radio 2 way />

  it('initializes with TS', function () {
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

  it('should not call valueChanged when property is assigned the same value', function () {
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

  it('initialize with Babel property decorator', function () {
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

  it('should call customHandler when changing the property', function () {
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
      const { component, platform, testHost, tearDown, startPromise } = createFixture(`<div ref="div"></div>\${div.tagName}`, App);
      await startPromise;

      assert.notDeepStrictEqual($div, noValue);

      assert.strictEqual(testHost.textContent, 'DIV');
      component.div = { tagName: 'hello' };

      platform.domWriteQueue.flush();
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
      const { ctx, component, platform, testHost, tearDown, startPromise }
        = createFixture('<input value.bind="v">', App);
      await startPromise;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '');
      component.v = 'v';
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '');
      platform.domWriteQueue.flush();
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, 'v');

      input.value = 'vv';
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
      const { ctx, component, platform, testHost, tearDown, startPromise }
        = createFixture('<input value.bind="v">', App);
      await startPromise;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '', 'err1');
      component.v = 'v';
      assert.strictEqual(component.v, 0, 'err2');
      assert.strictEqual(changeCount, 1, 'err3');
      assert.strictEqual(input.value, '', 'err4');
      platform.domWriteQueue.flush();
      assert.strictEqual(changeCount, 1, 'err5');
      assert.strictEqual(input.value, '0', 'err6');

      input.value = 'vv';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err7');
      assert.strictEqual(changeCount, 1, 'err8');
      assert.strictEqual(input.value, 'vv', 'err9');
      platform.domWriteQueue.flush();
      // for this assignment, the component.v still 0
      // so there was no change, and it's not propagated back to the input
      assert.strictEqual(input.value, 'vv', 'err10');
      assert.strictEqual(component.v, 0, 'err11');

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err12');
      assert.strictEqual(changeCount, 1, 'err13');
      assert.strictEqual(input.value, 'vv', 'err14');
      platform.domWriteQueue.flush();
      assert.strictEqual(input.value, 'vv', 'err15');
      assert.strictEqual(component.v, 0, 'err16');

      // real valid input assertion
      input.value = '1';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 1, 'err17');
      assert.strictEqual(changeCount, 2, 'err18');
      platform.domWriteQueue.flush();
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
        platform,
        testHost,
        tearDown,
        startPromise
      } = createFixture(
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
      );
      await startPromise;
      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '', 'err1');

      component.v = 'v';
      assert.strictEqual(component.v, 0, 'err2');
      assert.strictEqual(changeCount, 1, 'err3');
      assert.strictEqual(input.value, '', 'err4');
      platform.domWriteQueue.flush();
      assert.strictEqual(changeCount, 1, 'err5');
      assert.strictEqual(input.value, '0', 'err6');

      input.value = 'vv';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err7');
      assert.strictEqual(changeCount, 1, 'err8');
      assert.strictEqual(input.value, 'vv', 'err9');
      platform.domWriteQueue.flush();
      // for this assignment, the component.v still 0
      // so there was no change, and it's not propagated back to the input
      assert.strictEqual(input.value, 'vv', 'err10');
      assert.strictEqual(component.v, 0, 'err11');

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0, 'err12');
      assert.strictEqual(changeCount, 1, 'err13');
      assert.strictEqual(input.value, 'vv', 'err14');
      platform.domWriteQueue.flush();
      assert.strictEqual(input.value, 'vv', 'err15');
      assert.strictEqual(component.v, 0, 'err16');

      // real valid input assertion
      input.value = '1';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 1, 'err17');
      assert.strictEqual(changeCount, 2, 'err18');
      platform.domWriteQueue.flush();
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
      public obsLoc: IObserverLocator;

      public created() {
        this.countObs = this['$controller'].container.get(IObserverLocator).getObserver(this, 'count');
        this.countObs.subscribe({
          handleChange: (value: number, oldValue: number) => {
            if (value > 0 && value < 10) {
              this.log('S.1. handleChange()', value);
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

    const { component, appHost, startPromise, tearDown } = createFixture(`
      <button click.trigger="incr()">Incr()</button>
      <button click.trigger="decr()">Decr()</button>
      <div id="logs"><div repeat.for="log of logs">\${log}</div></div>
    `, MyApp);

    await startPromise;

    assert.deepStrictEqual(component.logs, []);
    component.logs.splice(0);
    const [incrButton, decrButton] = Array.from(appHost.querySelectorAll('button'));
    incrButton.click();

    assert.deepStrictEqual(
      component.logs,
      (Array
        .from({ length: 9 })
        .reduce((acc: unknown[], _: unknown, idx: number) => {
          acc.push(['P.1. countChanged()', idx + 1], ['S.1. handleChange()', idx + 1]);
          return acc;
        }, []) as unknown[])
        .concat([
          ['P.1. countChanged()', 10],
          ['After incr()', 10]
        ])
    );

    decrButton.click();
    const logs = (Array
      .from({ length: 9 })
      .reduce((acc: unknown[], _: unknown, idx: number) => {
        acc.push(['P.1. countChanged()', idx + 1], ['S.1. handleChange()', idx + 1]);
        return acc;
      }, []) as unknown[])
      .concat([
        ['P.1. countChanged()', 10],
        ['After incr()', 10]
      ]);

    assert.deepStrictEqual(
      component.logs,
      logs
        .concat(
          Array
            .from({ length: 9 })
            .reduce((acc: unknown[], _: unknown, idx: number) => {
              // start at 10 when click, but the first value log will be after the substraction of 1, which is 10 - 1
              acc.push(['P.1. countChanged()', 9 - idx], ['S.1. handleChange()', 9 - idx]);
              return acc;
            }, []) as unknown[]
        )
        .concat([
          ['P.1. countChanged()', 0],
          ['After decr()', 0]
        ])
    );

    await tearDown();
  });
});

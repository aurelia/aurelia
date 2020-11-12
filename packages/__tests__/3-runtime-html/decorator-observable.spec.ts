import { observable, SetterObserver, IObservable, ValueConverter } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';
import { noop } from '@aurelia/kernel';

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

    // with TS, initialization of class field are in constructor
    assert.strictEqual(callCount, 1);
    assert.strictEqual(instance.value, oldValue);
    assert.notInstanceOf((instance as unknown as IObservable).$observers['value'], SetterObserver);

    instance.value = newValue;
    assert.strictEqual(callCount, 2);
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
    assert.strictEqual(callCount, 1);

    instance.value = oldValue;
    assert.strictEqual(callCount, 1);
  });

  it('initialize with Babel property decorator', function () {
    let callCount = 0;
    class Test {
      public value: any;

      public valueChanged() {
        callCount++;
      }
    }
    Object.defineProperty(Test.prototype, 'value', observable(Test.prototype, 'value', {
      configurable: true,
      writable: true,
      initializer: () => oldValue
    }) as unknown as PropertyDescriptor);

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
    assert.strictEqual(callCount, 1);

    instance.value = newValue;
    assert.strictEqual(callCount, 2);

    instance.customHandler = noop;
    instance.value = oldValue;
    // change handler is resolved once
    assert.strictEqual(callCount, 3);
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
        public vChanged(input) {
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
        public vChanged(input) {
          changeCount++;
        }
      }
      const { ctx, component, platform, testHost, tearDown, startPromise }
        = createFixture('<input value.bind="v">', App);
      await startPromise;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '');
      component.v = 'v';
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '');
      platform.domWriteQueue.flush();
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '0');

      input.value = 'vv';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, 'vv');
      platform.domWriteQueue.flush();
      // for this assignment, the component.v still 0
      // so there was no change, and it's not propagated back to the input
      assert.strictEqual(input.value, 'vv');
      assert.strictEqual(component.v, 0);

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, 'vv');
      platform.domWriteQueue.flush();
      assert.strictEqual(input.value, 'vv');
      assert.strictEqual(component.v, 0);

      // real valid input assertion
      input.value = '1';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 1);
      assert.strictEqual(changeCount, 2);
      platform.domWriteQueue.flush();
      assert.strictEqual(input.value, '1');

      await tearDown();
    });

    it('works with 2 way binding and value converter', async function () {
      let changeCount = 0;
      class App {
        @observable({
          set: v => Number(v) || 0
        })
        public v: any;
        public vChanged(input) {
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
      assert.strictEqual(input.value, '');

      component.v = 'v';
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '');
      platform.domWriteQueue.flush();
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '0');

      input.value = 'vv';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, 'vv');
      platform.domWriteQueue.flush();
      // for this assignment, the component.v still 0
      // so there was no change, and it's not propagated back to the input
      assert.strictEqual(input.value, 'vv');
      assert.strictEqual(component.v, 0);

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, 'vv');
      platform.domWriteQueue.flush();
      assert.strictEqual(input.value, 'vv');
      assert.strictEqual(component.v, 0);

      // real valid input assertion
      input.value = '1';
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 1);
      assert.strictEqual(changeCount, 2);
      platform.domWriteQueue.flush();
      assert.strictEqual(input.value, '1');

      await tearDown();
    });
  });
});

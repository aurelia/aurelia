import { observable, SetterObserver, IObservable } from '@aurelia/runtime';
import { assert, createFixture } from '@aurelia/testing';
import { PLATFORM } from '@aurelia/kernel';

describe('3-runtime-html/decorator-observable.spec.ts', function () {
  const oldValue = 'old';
  const newValue = 'new';

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
    assert.notInstanceOf((instance as IObservable).$observers['value'], SetterObserver);

    instance.value = newValue;
    assert.strictEqual(callCount, 2);
    assert.strictEqual(instance.value, newValue);
  });

  it('should not call valueChanged when property is assigned the same value', function () {
    let callCount = 0;
    class Test {
      @observable value = oldValue;
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
      @observable({ changeHandler: 'customHandler' })
      public value = oldValue;

      public customHandler() {
        callCount++;
      }
    };
    const instance = new Test();
    assert.strictEqual(callCount, 1);

    instance.value = newValue;
    assert.strictEqual(callCount, 2);

    instance.customHandler = PLATFORM.noop;
    instance.value = oldValue;
    // change handler is resolved once
    assert.strictEqual(callCount, 3);
  });

  describe('with normal app', function () {
    it('works in basic scenario', async function () {
      let noValue = {};
      let $div = noValue;
      class App {
        @observable
        public div: any;
        public divChanged(div) {
          $div = div;
        }
      }
      const { component, scheduler, testHost, tearDown, startPromise } = createFixture('<div ref="div"></div>${div.tagName}', App);
      await startPromise;

      assert.strictEqual(testHost.textContent, 'DIV');
      component.div = { tagName: 'hello' };

      scheduler.getRenderTaskQueue().flush();
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
      const { ctx, component, scheduler, testHost, tearDown, startPromise }
        = createFixture('<input value.bind="v">', App);
      await startPromise;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '');
      component.v = 'v';
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '');
      scheduler.getRenderTaskQueue().flush();
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
      const { ctx, component, scheduler, testHost, tearDown, startPromise }
        = createFixture('<input value.bind="v">', App);
      await startPromise;

      const input = testHost.querySelector('input')!;
      assert.strictEqual(input.value, '');
      component.v = 'v';
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '');
      scheduler.getRenderTaskQueue().flush();
      assert.strictEqual(changeCount, 1);
      assert.strictEqual(input.value, '0');

      input.value = 'vv';
      debugger;
      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 2);
      assert.strictEqual(input.value, 'vv');
      scheduler.getRenderTaskQueue().flush();
      assert.strictEqual(input.value, '0');
      assert.strictEqual(component.v, 0);

      input.dispatchEvent(new ctx.CustomEvent('input'));
      assert.strictEqual(component.v, 0);
      assert.strictEqual(changeCount, 3);
      assert.strictEqual(input.value, 'vv');
      scheduler.getRenderTaskQueue().flush();
      assert.strictEqual(input.value, '0');
      assert.strictEqual(component.v, 0);

      await tearDown();
    });
  });

  // it('should call customHandler when changing the undefined property', () => {
  //   const instance = new class {
  //     @observable({ changeHandler: 'customHandler' }) value;
  //     customHandler() { }
  //   };
  //   spyOn(instance, 'customHandler');

  //   instance.value = newValue;
  //   assert.strictEqual(instance.customHandler).toHaveBeenCalledWith(newValue, undefined, 'value');
  // });

  // it('should work when valueChanged is undefined', () => {
  //   const instance = new class {
  //     @observable value = oldValue;
  //   };

  //   assert.strictEqual(instance.valueChanged).not.toBeDefined();
  //   instance.value = newValue;
  //   assert.strictEqual(instance.value).toEqual(newValue);
  // });

  // it('should work when valueChanged is undefined and property is undefined', () => {
  //   const instance = new class {
  //     @observable value;
  //   };

  //   assert.strictEqual(instance.valueChanged).not.toBeDefined();
  //   instance.value = newValue;
  //   assert.strictEqual(instance.value).toEqual(newValue);
  // });

  // describe('es2015 with decorators function', () => {
  //   it('should work when decorating property', () => {
  //     class MyClass {
  //       constructor() {
  //         this.value = oldValue;
  //       }
  //       valueChanged() { }
  //     }
  //     decorators(observable).on(MyClass.prototype, 'value');
  //     const instance = new MyClass();
  //     spyOn(instance, 'valueChanged');

  //     instance.value = newValue;
  //     assert.strictEqual(instance.valueChanged).toHaveBeenCalledWith(newValue, oldValue, 'value');
  //   });

  //   it('should work when decorating class', () => {
  //     class MyClass {
  //       constructor() {
  //         this.value = oldValue;
  //       }
  //       valueChanged() { }
  //     }
  //     decorators(observable('value')).on(MyClass);
  //     const instance = new MyClass();
  //     spyOn(instance, 'valueChanged');

  //     instance.value = newValue;
  //     assert.strictEqual(instance.valueChanged).toHaveBeenCalledWith(newValue, oldValue, 'value');
  //   });

  //   it('should work when property is undefined', () => {
  //     class MyClass {
  //       valueChanged() { }
  //     }
  //     decorators(observable).on(MyClass.prototype, 'value');
  //     const instance = new MyClass();
  //     spyOn(instance, 'valueChanged');

  //     instance.value = newValue;
  //     assert.strictEqual(instance.valueChanged).toHaveBeenCalledWith(newValue, undefined, 'value');
  //   });

  //   it('should work with customHandler', () => {
  //     class MyClass {
  //       constructor() {
  //         this.value = oldValue;
  //       }
  //       customHandler() { }
  //     }
  //     decorators(observable({ changeHandler: 'customHandler' })).on(MyClass.prototype, 'value');
  //     const instance = new MyClass();
  //     spyOn(instance, 'customHandler');

  //     instance.value = newValue;
  //     assert.strictEqual(instance.customHandler).toHaveBeenCalledWith(newValue, oldValue, 'value');
  //   });
  // });

  // it('should return a valid descriptor', () => {
  //   const target = class { };
  //   const descriptor = observable(target, 'value');

  //   assert.strictEqual(typeof descriptor.value).toBe('undefined');
  //   assert.strictEqual(typeof descriptor.writable).toBe('undefined');
  //   assert.strictEqual(typeof descriptor.get).toBe('function');
  //   assert.strictEqual(typeof descriptor.set).toBe('function');
  //   assert.strictEqual(Reflect.defineProperty(target, 'value', descriptor)).toBe(true);
  // });

  // it('should create an enumerable accessor', () => {
  //   const instance = new class {
  //     @observable value;
  //   };
  //   const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(instance), 'value');

  //   assert.strictEqual(descriptor.enumerable).toBe(true);
  //   assert.strictEqual(typeof descriptor.set).toBe('function');
  //   assert.strictEqual(typeof descriptor.get).toBe('function');
  // });

  // describe('private property', () => {
  //   describe(`when public property's value is not changed`, () => {
  //     const instance = new class {
  //       @observable value;
  //     };
  //     const prototype = Object.getPrototypeOf(instance);

  //     it('should exist on the prototype', () => {
  //       assert.strictEqual(prototype.hasOwnProperty('_value')).toBe(true);
  //     });

  //     it('should be nonenumerable', () => {
  //       assert.strictEqual(prototype.propertyIsEnumerable('_value')).toBe(false);
  //     });

  //     describe('observation', () => {
  //       const observer = new SetterObserver(null, prototype, '_value');

  //       it('should convert to accessors without warning', () => {
  //         spyOn(Logger.prototype, 'warn');
  //         observer.convertProperty();
  //         assert.strictEqual(Logger.prototype.warn).not.toHaveBeenCalled();
  //       });

  //       it('should exist', () => {
  //         const descriptor = Object.getOwnPropertyDescriptor(prototype, '_value');
  //         assert.strictEqual(typeof descriptor.get).toBe('function');
  //         assert.strictEqual(typeof descriptor.set).toBe('function');
  //       });

  //       it('should be nonenumerable', () => {
  //         assert.strictEqual(prototype.propertyIsEnumerable('_value')).toBe(false);
  //       });
  //     });
  //   });

  //   describe(`when public property's value is changed`, () => {
  //     const instance = new class {
  //       @observable value;
  //     };
  //     instance.value = newValue;

  //     it('should exist on the instance', () => {
  //       assert.strictEqual(instance.hasOwnProperty('_value')).toBe(true);
  //     });

  //     it('should be nonenumerable', () => {
  //       assert.strictEqual(instance.propertyIsEnumerable('_value')).toBe(false);
  //     });

  //     describe('observation', () => {
  //       const observer = new SetterObserver(null, instance, '_value');

  //       it('should convert to accessors without warning', () => {
  //         spyOn(Logger.prototype, 'warn');
  //         observer.convertProperty();
  //         assert.strictEqual(Logger.prototype.warn).not.toHaveBeenCalled();
  //       });

  //       it('should exist', () => {
  //         const descriptor = Object.getOwnPropertyDescriptor(instance, '_value');
  //         assert.strictEqual(typeof descriptor.get).toBe('function');
  //         assert.strictEqual(typeof descriptor.set).toBe('function');
  //       });

  //       it('should be nonenumerable', () => {
  //         assert.strictEqual(instance.propertyIsEnumerable('_value')).toBe(false);
  //       });
  //     });
  //   });

  //   it('should have distinct values between instances', () => {
  //     class MyClass {
  //       @observable value = oldValue;
  //     }

  //     const instance1 = new MyClass();
  //     const instance2 = new MyClass();

  //     instance1.value = newValue;
  //     assert.strictEqual(instance2.value).toBe(oldValue);
  //   });
  // });
});

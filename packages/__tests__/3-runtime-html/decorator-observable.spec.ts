import { observable, SetterObserver, IObservable } from '@aurelia/runtime';
import { assert } from '@aurelia/testing';

describe('5-jit-html/decorator-observable.spec.ts', () => {
  const oldValue = 'old';
  const newValue = 'new';

  it('initializes with TS', () => {
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
    assert.instanceOf((instance as IObservable).$observers['value'], SetterObserver);

    instance.value = newValue;
    assert.strictEqual(callCount, 2);
    assert.strictEqual(instance.value, newValue);
  });

  // it('should call valueChanged when changing the undefined property', () => {
  //   const instance = new class {
  //     @observable value;
  //     valueChanged() { }
  //   };
  //   spyOn(instance, 'valueChanged');

  //   instance.value = newValue;
  //   assert.strictEqual(instance.valueChanged).toHaveBeenCalledWith(newValue, undefined, 'value');
  // });

  // it('should not call valueChanged when property is assigned the same value', () => {
  //   const instance = new class {
  //     @observable value = oldValue;
  //     valueChanged() { }
  //   };
  //   spyOn(instance, 'valueChanged');

  //   instance.value = oldValue;
  //   assert.strictEqual(instance.valueChanged).not.toHaveBeenCalled();
  // });

  // it('should call customHandler when changing the property', () => {
  //   const instance = new class Test {
  //     @observable({ changeHandler: 'customHandler' }) value = oldValue;
  //     customHandler() { }
  //   };
  //   spyOn(instance, 'customHandler');

  //   instance.value = newValue;
  //   assert.strictEqual(instance.customHandler).toHaveBeenCalledWith(newValue, oldValue, 'value');
  // });

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

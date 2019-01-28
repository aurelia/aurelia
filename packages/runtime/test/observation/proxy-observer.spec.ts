import { expect } from 'chai';
import { eachCartesianJoin } from '../../../../scripts/test-lib';
import { LifecycleFlags, ProxyObserver } from '../../src/index';

class Foo {}

describe('ProxyObserver', function() {
  interface Spec {
    t: string;
  }
  interface ValueSpec extends Spec {
    createValue(): unknown;
  }
  interface PropertySpec extends Spec {
    name: any;
  }
  interface ObjSpec extends Spec {
    createObj(): unknown;
  }

  const valueSpecs: ValueSpec[] = [
    { t: 'undefined', createValue() { return undefined; } },
    { t: '     null', createValue() { return null;      } },
    { t: '        0', createValue() { return 0;         } },
    { t: '       ""', createValue() { return '';        } },
    { t: '       {}', createValue() { return {};        } }
  ];

  const propertySpecs: PropertySpec[] = [
    { t: '          undefined', name:           undefined },
    { t: '               null', name:                null },
    { t: '                  1', name:                   1 },
    { t: '                NaN', name:                 NaN },
    { t: '               -NaN', name:                -NaN },
    { t: '           Infinity', name:            Infinity },
    { t: '          -Infinity', name:           -Infinity },
    { t: '           Symbol()', name:            Symbol() },
    { t: '    Symbol("named")', name:     Symbol('named') },
    { t: 'Symbol.for("Named")', name: Symbol.for('named') },
    { t: '                 ""', name:                  '' },
    { t: '              "foo"', name:               'foo' }
  ];

  // tslint:disable
  // using strange objects is the point of this test, so don't complain
  const objSpecs: ObjSpec[] = [
    { t: '                 {}', createObj() { return                  {}; } },
    { t: 'Object.create(null)', createObj() { return Object.create(null); } },
    { t: '       new Number()', createObj() { return        new Number(); } },
    { t: '      new Boolean()', createObj() { return       new Boolean(); } },
    { t: '       new String()', createObj() { return        new String(); } },
    { t: '        new Error()', createObj() { return         new Error(); } },
    { t: '          new Foo()', createObj() { return           new Foo(); } },
    //{ t: '   new Uint8Array()', createObj() { return    new Uint8Array(); } }, // should we just disable this? they're not mutable anyway (and of course the tests fail in FF)
    { t: '      new WeakMap()', createObj() { return       new WeakMap(); } },
    { t: '      new WeakSet()', createObj() { return       new WeakSet(); } },
    { t: '   JSON.parse("{}")', createObj() { return    JSON.parse("{}"); } },
    { t: '             /asdf/', createObj() { return              /asdf/; } },
    { t: '       function(){}', createObj() { return        function(){}; } },
    { t: '  Promise.resolve()', createObj() { return   Promise.resolve(); } },
    { t: '  new Proxy({}, {})', createObj() { return   new Proxy({}, {}); } }
  ];
  // tslint:enable

  eachCartesianJoin([valueSpecs, propertySpecs, objSpecs], function(valueSpec, propertySpec, objSpec) {
    it(`valueSpec ${valueSpec.t}, propertySpec ${propertySpec.t} objSpec ${objSpec.t}`, function() {
      const { createValue } = valueSpec;
      const { name } = propertySpec;
      const { createObj } = objSpec;

      const obj = createObj();
      const value = createValue();

      const expectedKey = typeof name === 'symbol' ? name : String(name);

      const observer = ProxyObserver.getOrCreate(obj as object);
      const expectedFlags = LifecycleFlags.updateTargetInstance | LifecycleFlags.proxyStrategy;

      let callCount = 0;
      let newValue: unknown;
      let oldValue: unknown;
      let flags: LifecycleFlags;
      const subscriber = {
        handleChange($newValue: unknown, $oldValue: unknown, $flags: LifecycleFlags): void {
          ++callCount;
          newValue = $newValue;
          oldValue = $oldValue;
          flags = $flags;
        }
      };

      let proxyCallCount = 0;
      let proxyKey: PropertyKey;
      let proxyNewValue: unknown;
      let proxyOldValue: unknown;
      let proxyFlags: LifecycleFlags;
      const proxySubscriber = {
        handleChange(key: PropertyKey, $newValue: unknown, $oldValue: unknown, $flags: LifecycleFlags): void {
          ++proxyCallCount;
          proxyKey = key;
          proxyNewValue = $newValue;
          proxyOldValue = $oldValue;
          proxyFlags = $flags;
        }
      };
      (observer as ProxyObserver).subscribe(subscriber, name);
      observer.subscribe(proxySubscriber);

      observer.proxy[name] = value;

      let prevCallCount = 0;
      if (value !== undefined) {
        expect(callCount).to.equal(++prevCallCount, 'callCount #1');
        expect(newValue).to.equal(value);
        expect(oldValue).to.equal(undefined);
        expect(flags).to.equal(expectedFlags);

        expect(proxyCallCount).to.equal(prevCallCount, 'callCount #2');
        expect(proxyKey).to.equal(expectedKey);
        expect(proxyNewValue).to.equal(value);
        expect(proxyOldValue).to.equal(undefined);
        expect(proxyFlags).to.equal(expectedFlags);
      } else {
        expect(callCount).to.equal(prevCallCount, 'callCount #3');
        expect(proxyCallCount).to.equal(prevCallCount, 'callCount #4');
      }

      Reflect.deleteProperty(observer.proxy, name);

      if (value !== undefined) {
        expect(callCount).to.equal(++prevCallCount, 'callCount #5');
        expect(newValue).to.equal(undefined);
        expect(oldValue).to.equal(value);
        expect(flags).to.equal(expectedFlags);

        expect(proxyCallCount).to.equal(prevCallCount, 'callCount #6');
        expect(proxyKey).to.equal(expectedKey);
        expect(proxyNewValue).to.equal(undefined);
        expect(proxyOldValue).to.equal(value);
        expect(proxyFlags).to.equal(expectedFlags);
      } else {
        expect(callCount).to.equal(prevCallCount, 'callCount #7');
        expect(proxyCallCount).to.equal(prevCallCount, 'callCount #8');
      }

      Reflect.defineProperty(observer.proxy, name, { value });

      if (value !== undefined) {
        expect(callCount).to.equal(++prevCallCount, 'callCount #9');
        expect(newValue).to.equal(value);
        expect(oldValue).to.equal(undefined);
        expect(flags).to.equal(expectedFlags);

        expect(proxyCallCount).to.equal(prevCallCount, 'callCount #10');
        expect(proxyKey).to.equal(expectedKey);
        expect(proxyNewValue).to.equal(value);
        expect(proxyOldValue).to.equal(undefined);
        expect(proxyFlags).to.equal(expectedFlags);
      } else {
        expect(callCount).to.equal(prevCallCount, 'callCount #11');
        expect(proxyCallCount).to.equal(prevCallCount, 'callCount #12');
      }

      let $value = value;
      const pd1: PropertyDescriptor = {
        get() { return $value; },
        set(_value) { $value = _value; }
      };
      Reflect.defineProperty(observer.proxy, name, pd1);

      expect(callCount).to.equal(prevCallCount);

      const $$value1 = pd1.get.call({});
      const $$value2 = pd1.get.call(obj);
      const $$value3 = pd1.get.call(observer.proxy);
      const $$value4 = observer.proxy[name];

      expect($$value1).to.equal($value);
      expect($$value2).to.equal($value);
      expect($$value3).to.equal($value);
      expect($$value4).to.equal($value);
    });
  });

  it('works with array', function() {
    const obj = [];

    const observer = ProxyObserver.getOrCreate(obj);
    const proxy = observer.proxy;

    let callCount = 0;
    let newValue: unknown;
    let oldValue: unknown;
    let flags: LifecycleFlags;
    const subscriber = {
      handleChange($newValue: unknown, $oldValue: unknown, $flags: LifecycleFlags): void {
        ++callCount;
        newValue = $newValue;
        oldValue = $oldValue;
        flags = $flags;
      }
    };

    observer.subscribe(subscriber);

    proxy.length = 2;

    expect(callCount).to.equal(1);

    proxy[5] = 42;

    expect(callCount).to.equal(2);

    proxy.push(1);
    proxy.unshift(1);
    proxy.pop();
    proxy.shift();
    proxy.splice(0, 0, 1, 2, 3);
    proxy.reverse();
    proxy.sort();

    // should not call subscribers on methods, that's still the collection observers job
    expect(callCount).to.equal(2);
  });

  it('works with set', function() {
    const obj = new Set();

    const observer = ProxyObserver.getOrCreate(obj);
    const proxy = observer.proxy;

    let callCount = 0;
    let newValue: unknown;
    let oldValue: unknown;
    let flags: LifecycleFlags;
    const subscriber = {
      handleChange($newValue: unknown, $oldValue: unknown, $flags: LifecycleFlags): void {
        ++callCount;
        newValue = $newValue;
        oldValue = $oldValue;
        flags = $flags;
      }
    };

    observer.subscribe(subscriber);

    proxy.add(1);
    proxy.delete(1);
    proxy.clear();

    // should not call subscribers on methods, that's still the collection observers job
    expect(callCount).to.equal(0);
  });

  it('works with map', function() {
    const obj = new Map();

    const observer = ProxyObserver.getOrCreate(obj);
    const proxy = observer.proxy;

    let callCount = 0;
    let newValue: unknown;
    let oldValue: unknown;
    let flags: LifecycleFlags;
    const subscriber = {
      handleChange($newValue: unknown, $oldValue: unknown, $flags: LifecycleFlags): void {
        ++callCount;
        newValue = $newValue;
        oldValue = $oldValue;
        flags = $flags;
      }
    };

    observer.subscribe(subscriber);

    proxy.set(1, 1);
    proxy.set(2, 2);
    proxy.delete(1);
    proxy.clear();

    // should not call subscribers on methods, that's still the collection observers job
    expect(callCount).to.equal(0);
  });
});

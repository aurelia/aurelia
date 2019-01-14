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

  const objSpecs: ObjSpec[] = [
    { t: '                 {}', createObj() { return                  {}; } },
    { t: 'Object.create(null)', createObj() { return Object.create(null); } },
    { t: '       new Number()', createObj() { return        new Number(); } },
    { t: '      new Boolean()', createObj() { return       new Boolean(); } },
    { t: '       new String()', createObj() { return        new String(); } },
    { t: '        new Error()', createObj() { return         new Error(); } },
    { t: '          new Foo()', createObj() { return           new Foo(); } },
    { t: '   new Uint8Array()', createObj() { return    new Uint8Array(); } },
    { t: '      new WeakMap()', createObj() { return       new WeakMap(); } },
    { t: '      new WeakSet()', createObj() { return       new WeakSet(); } },
    { t: '   JSON.parse("{}")', createObj() { return    JSON.parse("{}"); } },
    { t: '             /asdf/', createObj() { return              /asdf/; } },
    { t: '       function(){}', createObj() { return        function(){}; } },
    { t: '  Promise.resolve()', createObj() { return   Promise.resolve(); } },
    { t: '  new Proxy({}, {})', createObj() { return   new Proxy({}, {}); } }
  ];

  eachCartesianJoin([valueSpecs, propertySpecs, objSpecs], function(valueSpec, propertySpec, objSpec) {
    it(`valueSpec ${valueSpec.t}, propertySpec ${propertySpec.t} objSpec ${objSpec.t}`, function() {
      const { createValue } = valueSpec;
      const { name } = propertySpec;
      const { createObj } = objSpec;

      const obj = createObj();
      const value = createValue();

      const expectedKey = typeof name === 'symbol' ? name : String(name);

      const observer = ProxyObserver.getOrCreate(obj as object);

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
      observer.subscribe(subscriber, name);
      observer.subscribe(proxySubscriber);

      observer.proxy[name] = value;

      let prevCallCount = 0;
      if (value !== undefined) {
        expect(callCount).to.equal(++prevCallCount);
        expect(newValue).to.equal(value);
        expect(oldValue).to.equal(undefined);
        expect(flags).to.equal(LifecycleFlags.updateTargetInstance);

        expect(proxyCallCount).to.equal(prevCallCount);
        expect(proxyKey).to.equal(expectedKey);
        expect(proxyNewValue).to.equal(value);
        expect(proxyOldValue).to.equal(undefined);
        expect(proxyFlags).to.equal(LifecycleFlags.updateTargetInstance);
      } else {
        expect(callCount).to.equal(prevCallCount);
        expect(proxyCallCount).to.equal(prevCallCount);
      }

      delete observer.proxy[name];

      if (value !== undefined && !(obj instanceof Uint8Array && typeof name === 'number')) {
        expect(callCount).to.equal(++prevCallCount);
        expect(newValue).to.equal(undefined);
        expect(oldValue).to.equal(value);
        expect(flags).to.equal(LifecycleFlags.updateTargetInstance);

        expect(proxyCallCount).to.equal(prevCallCount);
        expect(proxyKey).to.equal(expectedKey);
        expect(proxyNewValue).to.equal(undefined);
        expect(proxyOldValue).to.equal(value);
        expect(proxyFlags).to.equal(LifecycleFlags.updateTargetInstance);
      } else {
        expect(callCount).to.equal(prevCallCount);
        expect(proxyCallCount).to.equal(prevCallCount);
      }

      Reflect.defineProperty(observer.proxy, name, { value });

      if (value !== undefined && !(obj instanceof Uint8Array && typeof name === 'number')) {
        expect(callCount).to.equal(++prevCallCount);
        expect(newValue).to.equal(value);
        expect(oldValue).to.equal(undefined);
        expect(flags).to.equal(LifecycleFlags.updateTargetInstance);

        expect(proxyCallCount).to.equal(prevCallCount);
        expect(proxyKey).to.equal(expectedKey);
        expect(proxyNewValue).to.equal(value);
        expect(proxyOldValue).to.equal(undefined);
        expect(proxyFlags).to.equal(LifecycleFlags.updateTargetInstance);
      } else {
        expect(callCount).to.equal(prevCallCount);
        expect(proxyCallCount).to.equal(prevCallCount);
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
      if (obj instanceof Uint8Array && typeof name === 'number') {
        expect($$value4).to.equal(undefined);
      } else {
        expect($$value4).to.equal($value);
      }
    });
  });

  it('works with array', function() {
    const obj = [];

    const observer = ProxyObserver.getOrCreate(obj as object);

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

  });
});

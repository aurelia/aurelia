import { IIndexable, Registration, Tracer } from '@aurelia/kernel';
import {
  DirtyCheckProperty,
  IDirtyChecker,
  ILifecycle,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  LifecycleFlags as LF,
  RuntimeConfiguration,
  ComputedOverrides,
  createComputedObserver,
  IScheduler
} from '@aurelia/runtime';
import {
  disableTracing,
  enableTracing,
  eachCartesianJoin,
  assert,
} from '@aurelia/testing';

declare let document;

describe.skip('ComputedObserver', function () {
  function createFixture() {
    const container = RuntimeConfiguration.createContainer();
    const innerLocator = {
      handles() { return false; }
    };
    Registration.instance(ITargetAccessorLocator, innerLocator).register(container);
    Registration.instance(ITargetObserverLocator, innerLocator).register(container);
    const locator = container.get(IObserverLocator);
    const dirtyChecker = container.get(IDirtyChecker);
    const lifecycle = container.get(ILifecycle);
    const scheduler = container.get(IScheduler);

    return { container, locator, dirtyChecker, lifecycle, scheduler };
  }

  interface Spec {
    t: string;
  }

  interface ComputedSpec extends Spec {
    isVolatile: boolean;
    isStatic: boolean;
    exists: boolean;
  }

  interface PropSpec extends Spec {
    initialValue: unknown;
    newValue: unknown;
    descriptor: PropertyDescriptor;
  }

  interface DepSpec extends Spec {
    initialValue: unknown;
    newValue: unknown;
    descriptor: PropertyDescriptor;
  }
  // using some mapped shorthands here to make it easier to quickly see the failing conditions in tests

  // v0 = not volatile, v1 = volatile, s0 = not static, s1 = static, e0 = not exist, e1 = exists
  const computedSpecs: ComputedSpec[] = [
    { t: 'v0 s0 e0', isVolatile: false, isStatic: false, exists: false },
    { t: 'v0 s0 e1', isVolatile: false, isStatic: false, exists: true  },
    { t: 'v0 s1 e1', isVolatile: false, isStatic: true,  exists: true  },
    { t: 'v1 s0 e1', isVolatile: true,  isStatic: false, exists: true  },
    { t: 'v1 s1 e1', isVolatile: true,  isStatic: true,  exists: true  }
  ];

  // i0 = initial value undefined, i1 = initial value defined, n0 = new value undefined, n1 = new value defined, c1 = configurable true, s0 = no setter, s1 = has setter
  const propSpecs: PropSpec[] = [
    { t: 'i0 n1 c1 s0', initialValue: undefined, newValue: 'b',       descriptor: { configurable: true,  get() { return `${this._prop}${this.dep}`; } } },
    { t: 'i1 n1 c1 s0', initialValue: 'a',       newValue: 'b',       descriptor: { configurable: true,  get() { return `${this._prop}${this.dep}`; } } },
    { t: 'i1 n0 c1 s0', initialValue: 'a',       newValue: undefined, descriptor: { configurable: true,  get() { return `${this._prop}${this.dep}`; } } },
    { t: 'i0 n1 c1 s1', initialValue: undefined, newValue: 'b',       descriptor: { configurable: true,  get() { return `${this._prop}${this.dep}`; }, set(value) { this._prop = value; } } },
    { t: 'i1 n1 c1 s1', initialValue: 'a',       newValue: 'b',       descriptor: { configurable: true,  get() { return `${this._prop}${this.dep}`; }, set(value) { this._prop = value; } } },
    { t: 'i1 n0 c1 s1', initialValue: 'a',       newValue: undefined, descriptor: { configurable: true,  get() { return `${this._prop}${this.dep}`; }, set(value) { this._prop = value; } } }
  ];

  // v0 = no value, v1 = has value
  const depSpecs: DepSpec[] = [
    { t: 'i0 n1 c1 v1 g0 s0', initialValue: undefined, newValue: 'd',       descriptor: { configurable: true, writable: true, value: undefined } },
    { t: 'i1 n1 c1 v1 g0 s0', initialValue: 'c',       newValue: 'd',       descriptor: { configurable: true, writable: true, value: 'c' } },
    { t: 'i1 n0 c1 v1 g0 s0', initialValue: 'c',       newValue: undefined, descriptor: { configurable: true, writable: true, value: 'c' } },
    { t: 'i0 n1 c1 v0 g1 s0', initialValue: undefined, newValue: 'd',       descriptor: { configurable: true, get() { return this._dep; } } },
    { t: 'i1 n1 c1 v0 g1 s0', initialValue: 'c',       newValue: 'd',       descriptor: { configurable: true, get() { return this._dep; } } },
    { t: 'i1 n0 c1 v0 g1 s0', initialValue: 'c',       newValue: undefined, descriptor: { configurable: true, get() { return this._dep; } } },
    { t: 'i0 n1 c1 v0 g1 s1', initialValue: undefined, newValue: 'd',       descriptor: { configurable: true, get() { return this._dep; }, set(value) { this._dep = value; } } },
    { t: 'i1 n1 c1 v0 g1 s1', initialValue: 'c',       newValue: 'd',       descriptor: { configurable: true, get() { return this._dep; }, set(value) { this._dep = value; } } },
    { t: 'i1 n0 c1 v0 g1 s1', initialValue: 'c',       newValue: undefined, descriptor: { configurable: true, get() { return this._dep; }, set(value) { this._dep = value; } } }
  ];

  eachCartesianJoin([computedSpecs, propSpecs, depSpecs], (computedSpec, propSpec, depSpec) => {
    it(`computedSpec ${computedSpec.t}, propSpec ${propSpec.t}, depSpec ${depSpec.t}`, function () {
      const { locator, dirtyChecker, lifecycle } = createFixture();
      const { isVolatile, isStatic, exists } = computedSpec;
      const { initialValue: propInitialValue, newValue: propNewValue, descriptor: propDescriptor } = propSpec;
      const { initialValue: depInitialValue, newValue: depNewValue, descriptor: depDescriptor } = depSpec;

      class Subject {
        public static computed: Record<string, ComputedOverrides>;
        public _prop: unknown;
        public _dep: unknown;
        public prop: unknown;
        public dep: unknown;

        public constructor() {
          this._prop = propInitialValue;
          this._dep = depInitialValue;
        }
      }
      if (exists) {
        Subject.computed = { prop: { volatile: isVolatile, static: isStatic } };
      }

      const instance = new Subject();
      Reflect.defineProperty(instance, 'prop', propDescriptor);
      Reflect.defineProperty(instance, 'dep', depDescriptor);

      const expectedFlags = LF.updateTargetInstance;

      let callCount1 = 0;
      let evaluated1: unknown;
      let newValue1: unknown;
      let oldValue1: unknown;
      let flags1: LF;
      const subscriber1 = {
        handleChange($newValue: unknown, $oldValue: unknown, $flags: LF) {
          evaluated1 = instance.prop;
          newValue1 = $newValue;
          oldValue1 = $oldValue;
          flags1 = $flags;
          ++callCount1;
        }
      };
      let callCount2 = 0;
      let evaluated2: unknown;
      let newValue2: unknown;
      let oldValue2: unknown;
      let flags2: LF;
      const subscriber2 = {
        handleChange($newValue: unknown, $oldValue: unknown, $flags: LF) {
          evaluated2 = instance.prop;
          newValue2 = $newValue;
          oldValue2 = $oldValue;
          flags2 = $flags;
          ++callCount2;
        }
      };

      let verifiedCount = 0;
      function verifyCalled(count: number, marker: number) {
        // marker is just to make it easier to pin down failing assertions from the test logs
        if (count === 0) {
          assert.strictEqual(callCount1, verifiedCount, `callCount #${marker}`);
          assert.strictEqual(callCount2, verifiedCount, `callCount #${marker}`);
        } else {
          assert.strictEqual(callCount1, verifiedCount += count, `callCount #${marker}`);
          assert.strictEqual(evaluated1, evaluated1, `evaluated #${marker}`);
          assert.strictEqual(newValue1, newValue1, `newValue #${marker}`);
          assert.strictEqual(oldValue1, oldValue1, `oldValue #${marker}`);
          assert.strictEqual(flags1, expectedFlags, `flags #${marker}`);
          assert.strictEqual(callCount2, verifiedCount, `callCount #${marker}`);
          assert.strictEqual(evaluated2, evaluated2, `evaluated #${marker}`);
          assert.strictEqual(newValue2, newValue2, `newValue #${marker}`);
          assert.strictEqual(oldValue2, oldValue2, `oldValue #${marker}`);
          assert.strictEqual(flags2, expectedFlags, `flags #${marker}`);
        }
      }
      // TODO: use tracer to deeply verify calls
      if (propInitialValue) {
        enableTracing();
      }
      const sut = createComputedObserver(LF.none, locator, dirtyChecker, lifecycle, instance, 'prop', propDescriptor);
      sut.subscribe(subscriber1);
      sut.subscribe(subscriber2);

      if (isVolatile || !Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
        // when volatile is specified, getter traps should always be created regardless of
        // other settings, and changing any dependent property should trigger subscribers
        // (except backing properties on dependencies with setters)
        // also, when there is no setter, it should behave the same way
        if (Object.prototype.hasOwnProperty.call(depDescriptor, 'value') || Object.prototype.hasOwnProperty.call(depDescriptor, 'set')) {
          instance.dep = depNewValue;
          verifyCalled(1, 1);
          instance.dep = depNewValue;
          verifyCalled(0, 2);
        } else {
          instance._dep = depNewValue;
          verifyCalled(1, 3);
          instance._dep = depNewValue;
          verifyCalled(0, 4);
        }

        instance._prop = propNewValue;
        verifyCalled(1, 5);
        instance._prop = propNewValue;
        verifyCalled(0, 6);
        if (Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
          instance.prop = propNewValue;
          verifyCalled(0, 7);
          instance.prop = `${propNewValue}1`;
          verifyCalled(1, 8);
        }
      } else if (Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
        // when not volatile and there is a setter, using the own setter is the only way to trigger
        // subscribers
        instance._dep = depNewValue;
        verifyCalled(0, 9);
        if (Object.prototype.hasOwnProperty.call(depDescriptor, 'value') || Object.prototype.hasOwnProperty.call(depDescriptor, 'set')) {
          instance.dep = depNewValue;
          verifyCalled(0, 10);
        }
        instance._prop = propNewValue;
        verifyCalled(0, 11);
        instance.prop = propNewValue;
        verifyCalled(1, 12);
      } else {
        throw new Error('some variations are leaking through without assertions');
      }

      sut.unsubscribe(subscriber1);
      sut.unsubscribe(subscriber2);

      if (isVolatile || !Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
        // when volatile is specified, getter traps should always be created regardless of
        // other settings, and changing any dependent property should trigger subscribers
        // (except backing properties on dependencies with setters)
        // also, when there is no setter, it should behave the same way
        if (Object.prototype.hasOwnProperty.call(depDescriptor, 'value') || Object.prototype.hasOwnProperty.call(depDescriptor, 'set')) {
          instance.dep = depNewValue;
          verifyCalled(0, 13);
        } else {
          instance._dep = depNewValue;
          verifyCalled(0, 14);
        }

        instance._prop = propNewValue;
        verifyCalled(0, 15);
        if (Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
          instance.prop = propNewValue;
          verifyCalled(0, 16);
        }
      } else if (Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
        // when not volatile and there is a setter, using the own setter is the only way to trigger
        // subscribers
        instance._dep = depNewValue;
        verifyCalled(0, 17);
        if (Object.prototype.hasOwnProperty.call(depDescriptor, 'value') || Object.prototype.hasOwnProperty.call(depDescriptor, 'set')) {
          instance.dep = depNewValue;
          verifyCalled(0, 18);
        }
        instance._prop = propNewValue;
        verifyCalled(0, 19);
      } else {
        throw new Error('some variations are leaking through without assertions');
      }
      disableTracing();
    });

  });

  // only run this test in browser for now as it hangs in node due to subtleties with prototype stuff
  // TODO: fix this in node
  if (typeof document !== 'undefined') {
    it(`complex nested dependencies`, function () {
      this.timeout(30000);
      const { locator, dirtyChecker, lifecycle, scheduler } = createFixture();

      class Foo {
        public array1: unknown[];
        public array2: unknown[];
        public set1: Set<unknown>;
        public set2: Set<unknown>;
        public map1: Map<unknown, unknown>;
        public map2: Map<unknown, unknown>;
        public obj1: IIndexable;
        public obj2: IIndexable;
        public children: Foo[];
        public branch: 1 | 2;
        public sortFn: (a: unknown, b: unknown) => number;
        public constructor(...children: Foo[]) {
          this.array1 = [];
          this.array2 = [];
          this.set1 = new Set();
          this.set2 = new Set();
          this.map1 = new Map();
          this.map2 = new Map();
          // TODO: defining new properties isn't captured (need a true proxy observer for that)
          // so we can only respond to properties that already exist
          this.obj1 = { prop: 1 };
          this.obj2 = { prop: 2 };
          this.children = children;
          this.branch = 1;
        }
        public get getter() {
          const array = this[`array${this.branch}`] as unknown[];
          const set = this[`set${this.branch}`] as Set<unknown>;
          const map = this[`map${this.branch}`] as Map<unknown, unknown>;
          const obj = this[`obj${this.branch}`] as IIndexable;
          const children = this.children;
          const result: IIndexable = { ...obj };
          array
            .sort(this.sortFn)
            .slice()
            .map((v, i2) => ({ v: JSON.stringify(v), i2 }))
            .reduce(
              (acc, cur) => {
                acc[cur.i2] = cur.v;
                return acc;
              },
              result
            );
          Array.from(set)
            .sort(this.sortFn)
            .slice()
            .map((v, i2) => ({ v: JSON.stringify(v), i2 }))
            .reduce(
              (acc, cur) => {
                acc[cur.i2] = cur.v;
                return acc;
              },
              result
            );
          Array.from(map)
            .sort(this.sortFn)
            .slice()
            .map(([k, v], i2) => ({ v: JSON.stringify(v), i2 }))
            .reduce(
              (acc, cur) => {
                acc[cur.i2] = cur.v;
                return acc;
              },
              result
            );
          for (let i3 = 0, ii = children.length; i3 < ii; ++i3) {
            result[`child${i3}`] = children[i3].getter;
          }
          result[`array${this.branch}`] = array.length;
          result[`set${this.branch}`] = set.size;
          result[`map${this.branch}`] = map.size;
          return result;
        }
      }

      const child1 = new Foo();
      const child2 = new Foo();
      const parent = new Foo(child1, child2);

      const pd = Reflect.getOwnPropertyDescriptor(Foo.prototype, 'getter');

      let callCount1 = 0;
      let evaluated1: unknown;
      let newValue1: unknown;
      let oldValue1: unknown;
      const subscriber1 = {
        handleChange($newValue: unknown, $oldValue: unknown, $flags: LF) {
          evaluated1 = parent['getter'];
          newValue1 = $newValue;
          oldValue1 = $oldValue;
          ++callCount1;
        }
      };
      enableTracing();
      Tracer.enableLiveLogging();

      const sut = createComputedObserver(LF.none, locator, dirtyChecker, lifecycle, parent, 'getter', pd);
      sut.subscribe(subscriber1);

      let verifiedCount = 0;
      function verifyCalled(count: number, marker: number) {
        // marker is just to make it easier to pin down failing assertions from the test logs
        if (count === 0) {
          assert.strictEqual(callCount1, verifiedCount, `callCount #${marker}`);
        } else {
          assert.strictEqual(callCount1, verifiedCount += count, `callCount #${marker}`);
          assert.strictEqual(evaluated1, evaluated1, `evaluated #${marker}`);
          assert.strictEqual(newValue1, newValue1, `newValue #${marker}`);
          assert.strictEqual(oldValue1, oldValue1, `oldValue #${marker}`);
        }
      }

      let i = 0;
      for (const foo of [child1, child2, parent]) {
        foo.array1.push(i);
        scheduler.getRenderTaskQueue().flush();
        verifyCalled(1, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.map1.set(i, i);
        scheduler.getRenderTaskQueue().flush();
        verifyCalled(1, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.set1.add(i);
        scheduler.getRenderTaskQueue().flush();
        verifyCalled(1, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.obj1['prop'] = 5;
        verifyCalled(1, ++i);
      }
      disableTracing();

      for (const foo of [child1, child2, parent]) {
        foo.array2.push(i);
        scheduler.getRenderTaskQueue().flush();
        verifyCalled(0, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.map2.set(i, i);
        scheduler.getRenderTaskQueue().flush();
        verifyCalled(0, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.set2.add(i);
        scheduler.getRenderTaskQueue().flush();
        verifyCalled(0, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.obj2['prop'] = 5;
        verifyCalled(0, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.branch = 2;
        verifyCalled(1, ++i);
      }
      for (const foo of [child1, child2, parent]) {
        foo.sortFn = (a: number, b: number) => a - b;
        verifyCalled(1, ++i);
      }
    });
  }

  it('resorts to dirty checking for non configurable props', function () {
    const { locator, dirtyChecker, lifecycle } = createFixture();
    class Foo {}
    Reflect.defineProperty(Foo.prototype, 'bar', {
      writable: true,
      value: 1,
      configurable: false
    });
    const pd = Reflect.getOwnPropertyDescriptor(Foo.prototype, 'bar');

    const foo = new Foo();

    const sut = createComputedObserver(LF.none, locator, dirtyChecker, lifecycle, foo, 'bar', pd);

    assert.instanceOf(sut, DirtyCheckProperty, `sut`);
  });

  it('throws in case of no getter', function () {
    const { locator, dirtyChecker, lifecycle } = createFixture();
    class Foo {}
    Reflect.defineProperty(Foo.prototype, 'bar', {
      writable: true,
      value: 1,
      configurable: true
    });
    const pd = Reflect.getOwnPropertyDescriptor(Foo.prototype, 'bar');

    const foo = new Foo();
    let err: Error;
    try {
      createComputedObserver(LF.none, locator, dirtyChecker, lifecycle, foo, 'bar', pd);
    } catch (e) {
      err = e;
    }

    assert.match(err.message, /18/);
  });
});

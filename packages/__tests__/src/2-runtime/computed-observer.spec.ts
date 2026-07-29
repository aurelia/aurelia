import { DI, IIndexable, IPlatform, Registration } from '@aurelia/kernel';
import {
  IDirtyChecker,
  IObserverLocator,
  INodeObserverLocator,
  ComputedObserver,
  ISubscriberCollection,
  runTasks,
} from '@aurelia/runtime';
import {
  eachCartesianJoin,
  assert,
} from '@aurelia/testing';

describe('2-runtime/computed-observer.spec.ts', function () {
  function createFixture() {
    const container = DI.createContainer(); // Note: used to be RuntimeConfiguration.createContainer, needs deps
    const nodeLocator = {
      handles() { return false; }
    };
    Registration.instance(IDirtyChecker, {}).register(container);
    Registration.instance(IPlatform, {}).register(container);
    Registration.instance(INodeObserverLocator, nodeLocator).register(container);
    const locator = container.get(IObserverLocator);
    const dirtyChecker = container.get(IDirtyChecker);

    return { container, locator, dirtyChecker };
  }

  interface Spec {
    t: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  // i0 = initial value undefined, i1 = initial value defined, n0 = new value undefined, n1 = new value defined, c1 = configurable true, s0 = no setter, s1 = has setter
  const propSpecs: PropSpec[] = [
    { t: 'i0 n1 c1 s0', initialValue: undefined, newValue: 'b', descriptor: { configurable: true, get() { return `${this._prop}${this.dep}`; } } },
    { t: 'i1 n1 c1 s0', initialValue: 'a', newValue: 'b', descriptor: { configurable: true, get() { return `${this._prop}${this.dep}`; } } },
    { t: 'i1 n0 c1 s0', initialValue: 'a', newValue: undefined, descriptor: { configurable: true, get() { return `${this._prop}${this.dep}`; } } },
    { t: 'i0 n1 c1 s1', initialValue: undefined, newValue: 'b', descriptor: { configurable: true, get() { return `${this._prop}${this.dep}`; }, set(value) { this._prop = value; } } },
    { t: 'i1 n1 c1 s1', initialValue: 'a', newValue: 'b', descriptor: { configurable: true, get() { return `${this._prop}${this.dep}`; }, set(value) { this._prop = value; } } },
    { t: 'i1 n0 c1 s1', initialValue: 'a', newValue: undefined, descriptor: { configurable: true, get() { return `${this._prop}${this.dep}`; }, set(value) { this._prop = value; } } }
  ];

  // v0 = no value, v1 = has value
  const depSpecs: DepSpec[] = [
    { t: 'i0 n1 c1 v1 g0 s0', initialValue: undefined, newValue: 'd', descriptor: { configurable: true, writable: true, value: undefined } },
    { t: 'i1 n1 c1 v1 g0 s0', initialValue: 'c', newValue: 'd', descriptor: { configurable: true, writable: true, value: 'c' } },
    { t: 'i1 n0 c1 v1 g0 s0', initialValue: 'c', newValue: undefined, descriptor: { configurable: true, writable: true, value: 'c' } },
    { t: 'i0 n1 c1 v0 g1 s0', initialValue: undefined, newValue: 'd', descriptor: { configurable: true, get() { return this._dep; } } },
    { t: 'i1 n1 c1 v0 g1 s0', initialValue: 'c', newValue: 'd', descriptor: { configurable: true, get() { return this._dep; } } },
    { t: 'i1 n0 c1 v0 g1 s0', initialValue: 'c', newValue: undefined, descriptor: { configurable: true, get() { return this._dep; } } },
    { t: 'i0 n1 c1 v0 g1 s1', initialValue: undefined, newValue: 'd', descriptor: { configurable: true, get() { return this._dep; }, set(value) { this._dep = value; } } },
    { t: 'i1 n1 c1 v0 g1 s1', initialValue: 'c', newValue: 'd', descriptor: { configurable: true, get() { return this._dep; }, set(value) { this._dep = value; } } },
    { t: 'i1 n0 c1 v0 g1 s1', initialValue: 'c', newValue: undefined, descriptor: { configurable: true, get() { return this._dep; }, set(value) { this._dep = value; } } }
  ];

  eachCartesianJoin([propSpecs, depSpecs], (propSpec, depSpec) => {
    it(`[UNIT] propSpec ${propSpec.t}, depSpec ${depSpec.t}`, function () {
      const { locator } = createFixture();
      const { initialValue: propInitialValue, newValue: propNewValue, descriptor: propDescriptor } = propSpec;
      const { initialValue: depInitialValue, newValue: depNewValue, descriptor: depDescriptor } = depSpec;

      class Subject {
        public static computed: Record<string, unknown>;
        public _prop: unknown;
        public _dep: unknown;
        public prop: unknown;
        public dep: unknown;

        public constructor() {
          this._prop = propInitialValue;
          this._dep = depInitialValue;
        }
      }
      Reflect.defineProperty(Subject.prototype, 'prop', propDescriptor);
      Reflect.defineProperty(Subject.prototype, 'dep', depDescriptor);

      const instance = new Subject();

      let callCount1 = 0;
      let evaluated1: unknown;
      let newValue1: unknown;
      let oldValue1: unknown;
      const subscriber1 = {
        handleChange($newValue: unknown, $oldValue: unknown) {
          evaluated1 = instance.prop;
          newValue1 = $newValue;
          oldValue1 = $oldValue;
          ++callCount1;
        },
      };
      let callCount2 = 0;
      let evaluated2: unknown;
      let newValue2: unknown;
      let oldValue2: unknown;
      const subscriber2 = {
        handleChange($newValue: unknown, $oldValue: unknown) {
          evaluated2 = instance.prop;
          newValue2 = $newValue;
          oldValue2 = $oldValue;
          ++callCount2;
        },
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
          assert.strictEqual(callCount2, verifiedCount, `callCount #${marker}`);
          assert.strictEqual(evaluated2, evaluated2, `evaluated #${marker}`);
          assert.strictEqual(newValue2, newValue2, `newValue #${marker}`);
          assert.strictEqual(oldValue2, oldValue2, `oldValue #${marker}`);
        }
      }

      // TODO: use tracer to deeply verify calls
      const sut = new ComputedObserver(instance, propDescriptor.get, propDescriptor.set, locator);
      sut.subscribe(subscriber1);
      sut.subscribe(subscriber2);

      if (Object.prototype.hasOwnProperty.call(depDescriptor, 'value') || Object.prototype.hasOwnProperty.call(depDescriptor, 'set')) {
        instance.dep = depNewValue;
        runTasks();
        verifyCalled(1, 1);
        instance.dep = depNewValue;
        runTasks();
        verifyCalled(0, 2);
      } else {
        instance._dep = depNewValue;
        runTasks();
        verifyCalled(1, 3);
        instance._dep = depNewValue;
        runTasks();
        verifyCalled(0, 4);
      }

      instance._prop = propNewValue;
      runTasks();
      verifyCalled(1, 5);
      instance._prop = propNewValue;
      runTasks();
      verifyCalled(0, 6);
      if (Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
        instance.prop = propNewValue;
        runTasks();
        verifyCalled(0, 7);
        instance.prop = `${propNewValue}1`;
        runTasks();
        verifyCalled(1, 8);
      }

      sut.unsubscribe(subscriber1);
      sut.unsubscribe(subscriber2);

      if (Object.prototype.hasOwnProperty.call(depDescriptor, 'value') || Object.prototype.hasOwnProperty.call(depDescriptor, 'set')) {
        instance.dep = depNewValue;
        runTasks();
        verifyCalled(0, 13);
      } else {
        instance._dep = depNewValue;
        runTasks();
        verifyCalled(0, 14);
      }

      instance._prop = propNewValue;
      runTasks();
      verifyCalled(0, 15);
      if (Object.prototype.hasOwnProperty.call(propDescriptor, 'set')) {
        instance.prop = propNewValue;
        runTasks();
        verifyCalled(0, 16);
      }
    });

  });

  it(`[UNIT] complex nested dependencies`, function () {
    this.timeout(30000);
    const { locator } = createFixture();

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
          .map(([, v], i2) => ({ v: JSON.stringify(v), i2 }))
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
      handleChange($newValue: unknown, $oldValue: unknown) {
        evaluated1 = parent['getter'];
        newValue1 = $newValue;
        oldValue1 = $oldValue;
        ++callCount1;
      }
    };

    const sut = new ComputedObserver(parent, pd.get, pd.set, locator);
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
      runTasks();
      verifyCalled(1, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.map1.set(i, i);
      runTasks();
      verifyCalled(1, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.set1.add(i);
      runTasks();
      verifyCalled(1, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.obj1['prop'] = 5;
      runTasks();
      verifyCalled(1, ++i);
    }

    for (const foo of [child1, child2, parent]) {
      foo.array2.push(i);
      runTasks();
      verifyCalled(0, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.map2.set(i, i);
      runTasks();
      verifyCalled(0, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.set2.add(i);
      runTasks();
      verifyCalled(0, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.obj2['prop'] = 5;
      runTasks();
      verifyCalled(0, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.branch = 2;
      runTasks();
      verifyCalled(1, ++i);
    }
    for (const foo of [child1, child2, parent]) {
      foo.sortFn = (a: number, b: number) => a - b;
      runTasks();
      verifyCalled(1, ++i);
    }
  });

  it('invokes getter efficiently', function () {
    let getterCallCount = 0;
    const { locator } = createFixture();
    const obj = { prop: 1, prop1: 1 };
    const observer = new ComputedObserver(
      obj,
      function (obj) {
        getterCallCount++;
        return obj.prop1;
      },
      void 0,
      locator,
      // true,
    );
    Object.defineProperty(obj, 'prop', {
      get: () => observer.getValue(),
      set: (v) => {observer.setValue(v);}
    });
    let _handleChangeCallCount = 0;
    observer.subscribe({
      handleChange() {
        _handleChangeCallCount++;
      }
    });

    const arr = [];
    observer.observeCollection(arr);

    assert.strictEqual(getterCallCount, 1);
    assert.strictEqual(obj.prop, 1);
    assert.strictEqual(getterCallCount, 1);

    assert.strictEqual(observer.getValue(), 1);
    // shouldn't compute again
    assert.strictEqual(getterCallCount, 1);

    assert.strictEqual(obj.prop, 1);
    // shouldn't compute again
    assert.strictEqual(getterCallCount, 1);

    obj.prop1 = 2;
    runTasks();
    assert.strictEqual(getterCallCount, 2);
    assert.strictEqual(obj.prop, 2);
    // shouldn't compute again
    assert.strictEqual(observer.getValue(), 2);
    // shouldn't compute again
    assert.strictEqual(obj.prop, 2);

    // array observation should be dropped last run
    // as it's not part of the getter
    arr.push(2);
    runTasks();
    assert.strictEqual(getterCallCount, 2);
    assert.strictEqual(obj.prop, 2);
    // shouldn't compute again
    assert.strictEqual(observer.getValue(), 2);
    // shouldn't compute again
    assert.strictEqual(obj.prop, 2);
  });

  describe('queued dependency graphs', function () {
    const subscriber = { handleChange() {/* empty */} };

    it('compares a setter value against the current dirty value', function () {
      const { locator } = createFixture();
      let setterCalls = 0;
      class ViewModel {
        public backing = 0;
        public get value(): number {
          return this.backing;
        }
        public set value(value: number) {
          setterCalls++;
          this.backing = value;
        }
      }

      const vm = new ViewModel();
      const observer = locator.getObserver(vm, 'value') as ComputedObserver<ViewModel>;
      observer.subscribe(subscriber);

      // The dependency changes synchronously, but the computed notification is
      // still queued. Assigning the old cached value must compare against the
      // live dirty getter rather than suppressing the setter.
      vm.backing = 1;
      observer.setValue(0);

      assert.strictEqual(setterCalls, 1);
      assert.strictEqual(vm.backing, 0);
      runTasks();
      assert.strictEqual(observer.getValue(), 0);
    });

    it('invalidates an attached cache after a setter updates unobservable state', function () {
      const { locator } = createFixture();
      let backing = 0;
      const setterValues: number[] = [];
      class ViewModel {
        public get value(): number {
          return backing;
        }
        public set value(value: number) {
          setterValues.push(value);
          backing = value;
        }
      }

      const vm = new ViewModel();
      const observer = locator.getObserver(vm, 'value') as ComputedObserver<ViewModel>;
      observer.subscribe(subscriber);

      // Neither accessor touches an observable property. The first accepted
      // assignment must still invalidate the attached cache, otherwise the
      // old cached value suppresses the second assignment before the queue drains.
      observer.setValue(1);
      observer.setValue(0);
      assert.deepStrictEqual(setterValues, [1, 0]);
      assert.strictEqual(backing, 0);

      runTasks();
      observer.setValue(2);
      assert.strictEqual(observer.getValue(), 2, 'an accepted setter invalidates the cached getter value');
      runTasks();
    });

    it('reconciles and detaches a queued branched getter after final unsubscribe', function () {
      const { locator } = createFixture();
      let evaluations = 0;
      let setterCalls = 0;
      class ViewModel {
        public useLeft = true;
        public left = 1;
        public right = 5;
        public get selected(): number {
          evaluations++;
          return this.useLeft ? this.left : this.right;
        }
        public set selected(value: number) {
          setterCalls++;
          if (this.useLeft) {
            this.left = value;
          } else {
            this.right = value;
          }
        }
      }

      const vm = new ViewModel();
      const observer = locator.getObserver(vm, 'selected') as ComputedObserver<ViewModel>;
      observer.subscribe(subscriber);
      assert.strictEqual(evaluations, 1);

      vm.left = 2;
      observer.unsubscribe(subscriber);
      vm.useLeft = false;
      runTasks();

      // The queued run advances to the current branch, then releases every
      // dependency because the observer is dormant.
      assert.strictEqual(evaluations, 2);
      for (const key of ['useLeft', 'left', 'right'] as const) {
        const dependency = locator.getObserver(vm, key) as unknown as ISubscriberCollection;
        assert.strictEqual(dependency.subs.count, 0, `${key} dependency is detached`);
      }

      // The previously cached value was 1, while the active branch currently
      // contains 5. Returning to 1 must therefore reach the setter.
      observer.setValue(1);
      assert.strictEqual(setterCalls, 1);
      assert.strictEqual(vm.right, 1);
      runTasks();
      assert.strictEqual(evaluations, 3);
      assert.strictEqual(observer.obs.count, 0);
    });

    it('uses live values through a detached chain of computed getters', function () {
      const { locator } = createFixture();
      let setterCalls = 0;
      class ViewModel {
        public leaf: string | undefined = void 0;
        public get inner(): string | undefined {
          return this.leaf;
        }
        public get outer(): string | undefined {
          return this.inner;
        }
        public set outer(value: string | undefined) {
          setterCalls++;
          this.leaf = value;
        }
      }

      const vm = new ViewModel();
      locator.getObserver(vm, 'inner');
      const outer = locator.getObserver(vm, 'outer') as ComputedObserver<ViewModel>;
      outer.subscribe(subscriber);
      const leaf = locator.getObserver(vm, 'leaf') as unknown as ISubscriberCollection;
      assert.strictEqual(leaf.subs.count, 1);

      // The inner getter is queued, but detaching the outer getter prevents the
      // inner notification from refreshing the outer cache.
      vm.leaf = 'a';
      outer.unsubscribe(subscriber);
      runTasks();
      assert.strictEqual(leaf.subs.count, 0);

      // `undefined` equals the outer observer's stale cache, but not the value
      // obtained through the live inner getter. The setter must not be skipped.
      outer.setValue(void 0);
      assert.strictEqual(setterCalls, 1);
      assert.strictEqual(vm.leaf, void 0);
      runTasks();
      assert.strictEqual(leaf.subs.count, 0);

      // Detached equality is still suppressed when the live value really is equal.
      outer.setValue(void 0);
      assert.strictEqual(setterCalls, 1);
    });

    it('preserves a chained getter across unsubscribe and resubscribe before drain', function () {
      const { locator } = createFixture();
      class ViewModel {
        public leaf = 1;
        public get inner(): number {
          return this.leaf * 2;
        }
        public get outer(): number {
          return this.inner + 1;
        }
      }

      const vm = new ViewModel();
      locator.getObserver(vm, 'inner');
      const outer = locator.getObserver(vm, 'outer') as ComputedObserver<ViewModel>;
      const changes: [number, number][] = [];
      const changeSubscriber = {
        handleChange(newValue: number, oldValue: number) {
          changes.push([newValue, oldValue]);
        }
      };

      outer.subscribe(changeSubscriber);
      assert.strictEqual(outer.getValue(), 3);

      vm.leaf = 2;
      outer.unsubscribe(changeSubscriber);
      outer.subscribe(changeSubscriber);
      assert.strictEqual(outer.getValue(), 5);

      // The old inner task is still queued. A second mutation must be folded
      // into that task without losing the resubscribed outer dependency.
      vm.leaf = 3;
      runTasks();
      assert.deepStrictEqual(changes, [[7, 5]]);

      vm.leaf = 4;
      runTasks();
      assert.deepStrictEqual(changes, [[7, 5], [9, 7]]);
    });

    it('keeps a diamond-shaped getter graph current after an orphaned drain', function () {
      const { locator } = createFixture();
      class ViewModel {
        public leaf = 1;
        public get left(): number {
          return this.leaf * 2;
        }
        public get right(): number {
          return this.leaf * 3;
        }
        public get total(): number {
          return this.left + this.right;
        }
      }

      const vm = new ViewModel();
      locator.getObserver(vm, 'left');
      locator.getObserver(vm, 'right');
      const total = locator.getObserver(vm, 'total') as ComputedObserver<ViewModel>;
      const changes: [number, number][] = [];
      const changeSubscriber = {
        handleChange(newValue: number, oldValue: number) {
          changes.push([newValue, oldValue]);
        }
      };

      total.subscribe(changeSubscriber);
      assert.strictEqual(total.getValue(), 5);

      vm.leaf = 2;
      total.unsubscribe(changeSubscriber);
      runTasks();
      const leaf = locator.getObserver(vm, 'leaf') as unknown as ISubscriberCollection;
      assert.strictEqual(leaf.subs.count, 0, 'both orphaned branches detach');

      total.subscribe(changeSubscriber);
      assert.strictEqual(total.getValue(), 10);

      // Both branches invalidate the same downstream getter. Each scheduler
      // turn must publish one fully settled value, never an intermediate sum.
      vm.leaf = 3;
      runTasks();
      vm.leaf = 4;
      runTasks();
      assert.deepStrictEqual(changes, [[15, 10], [20, 15]]);
    });
  });
});

import { all, Constructable, DI, factory, IContainer, inject, resolve, IResolvedFactory, lazy, newInstanceForScope, newInstanceOf, optional, Registration, singleton, transient } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('1-kernel/di.get.spec.ts', function () {
  let container: IContainer;

  beforeEach(function () {
    container = DI.createContainer();
  });

  afterEach(function () {
    assert.throws(() => resolve(class Abc{}));
  });

  describe('@lazy', function () {
    class Bar {

    }
    class Foo {
      public constructor(@lazy(Bar) public readonly provider: () => Bar) {}
    }
    it('@singleton', function () {
      const bar0 = container.get(Foo).provider();
      const bar1 = container.get(Foo).provider();

      assert.strictEqual(bar0, bar1);
    });

    it('@transient', function () {
      container.register(Registration.transient(Bar, Bar));
      const bar0 = container.get(Foo).provider();
      const bar1 = container.get(Foo).provider();

      assert.notStrictEqual(bar0, bar1);
    });
  });

  describe('@scoped', function () {
    describe("true", function () {
      @singleton({ scoped: true })
      class ScopedFoo { }

      describe('Foo', function () {
        const constructor = ScopedFoo;
        it('children', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = child1.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.notStrictEqual(a, b, 'a and b are not the same');
          assert.strictEqual(root.has(constructor, false), false, 'root has class');
          assert.strictEqual(child1.has(constructor, false), true, 'child1 has class');
          assert.strictEqual(child2.has(constructor, false), true, 'child2 has class');
        });

        it('root', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = root.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.strictEqual(a, b, 'a and b are the same');
          assert.strictEqual(root.has(constructor, false), true, 'root has class');
          assert.strictEqual(child1.has(constructor, false), false, 'child1 does not have class');
          assert.strictEqual(child2.has(constructor, false), false, 'child2 does not have class');
        });
      });
    });

    describe('false', function () {
      @singleton({ scoped: false })
      class ScopedFoo { }

      describe('Foo', function () {
        const constructor = ScopedFoo;
        it('children', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = child1.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.strictEqual(a, b, 'a and b are the same');
          assert.strictEqual(root.has(constructor, false), true, 'root has class');
          assert.strictEqual(child1.has(constructor, false), false, 'child1 has class');
          assert.strictEqual(child2.has(constructor, false), false, 'child2 has class');
        });
      });

      describe('default', function () {
        @singleton
        class DefaultFoo { }

        const constructor = DefaultFoo;
        it('children', function () {
          const root = DI.createContainer();
          const child1 = root.createChild();
          const child2 = root.createChild();

          const a = child1.get(constructor);
          const b = child2.get(constructor);
          const c = child1.get(constructor);

          assert.strictEqual(a, c, 'a and c are the same');
          assert.strictEqual(a, b, 'a and b are the same');
          assert.strictEqual(root.has(constructor, false), true, 'root has class');
          assert.strictEqual(child1.has(constructor, false), false, 'child1 has class');
          assert.strictEqual(child2.has(constructor, false), false, 'child2 has class');
        });
      });
    });
  });

  describe('@optional', function () {
    it('with default', function () {
      class Foo {
        public constructor(@optional('key') public readonly test: string = 'hello') {}
      }

      assert.strictEqual(container.get(Foo).test, 'hello');
    });

    it('no default, but param allows undefined', function () {
      class Foo {
        public constructor(@optional('key') public readonly test?: string) {}
      }

      assert.strictEqual(container.get(Foo).test, undefined);
    });

    it('no default, param does not allow undefind', function () {
      class Foo {
        public constructor(@optional('key') public readonly test: string) {}
      }

      assert.strictEqual(container.get(Foo).test, undefined);
    });

    it('interface with default', function () {
      const Strings = DI.createInterface<string[]>(x => x.instance([]));
      class Foo {
        public constructor(@optional(Strings) public readonly test: string[]) {}
      }

      assert.deepStrictEqual(container.get(Foo).test, undefined);
    });

    it('interface with default and default in constructor', function () {
      const MyStr = DI.createInterface<string>(x => x.instance('hello'));
      class Foo {
        public constructor(@optional(MyStr) public readonly test: string = 'test') {}
      }

      assert.deepStrictEqual(container.get(Foo).test, 'test');
    });

    it('interface with default registered and default in constructor', function () {
      const MyStr = DI.createInterface<string>(x => x.instance('hello'));
      container.register(MyStr);
      class Foo {
        public constructor(@optional(MyStr) public readonly test: string = 'test') {}
      }

      assert.deepStrictEqual(container.get(Foo).test, 'hello');
    });
  });

  describe('intrinsic', function () {

    describe('bad', function () {

      it('Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: string[]) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('ArrayBuffer', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: ArrayBuffer) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Boolean', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Boolean) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('boolean', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: boolean) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('DataView', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: DataView) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Date', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Date) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
      it('Error', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Error) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('EvalError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: EvalError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Float32Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Float32Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Float64Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Float64Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Function', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Function) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Int8Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Int8Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Int16Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Int16Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Int32Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Int16Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Map', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Map<unknown, unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Number', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Number) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('number', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: number) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Object', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Object) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('object', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: object) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Promise', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Promise<unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('RangeError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: RangeError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('ReferenceError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: ReferenceError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('RegExp', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: RegExp) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Set', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Set<unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      if (typeof SharedArrayBuffer !== 'undefined') {
        it('SharedArrayBuffer', function () {
          @singleton
          class Foo {
            public constructor(private readonly test: SharedArrayBuffer) {
            }
          }
          assert.throws(() => container.get(Foo));
        });
      }

      it('String', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: String) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('string', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: string) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('SyntaxError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: SyntaxError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('TypeError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: TypeError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Uint8Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint8Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Uint8ClampedArray', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint8ClampedArray) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('Uint16Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint16Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
      it('Uint32Array', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: Uint32Array) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
      it('UriError', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: URIError) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('WeakMap', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: WeakMap<any, unknown>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });

      it('WeakSet', function () {
        @singleton
        class Foo {
          public constructor(private readonly test: WeakSet<any>) {
          }
        }
        assert.throws(() => container.get(Foo));
      });
    });

    describe('good', function () {
      it('@all()', function () {
        class Foo {
          public constructor(@all('test') public readonly test: string[]) {
          }
        }
        assert.deepStrictEqual(container.get(Foo).test, []);
      });
      it('@optional()', function () {
        class Foo {
          public constructor(@optional('test') public readonly test: string = null) {
          }
        }
        assert.strictEqual(container.get(Foo).test, null);
      });

      it('undef instance, with constructor default', function () {
        container.register(Registration.instance('test', undefined));
        class Foo {
          public constructor(@inject('test') public readonly test: string[] = []) {
          }
        }
        assert.deepStrictEqual(container.get(Foo).test, []);
      });

      it('can inject if registered', function () {
        container.register(Registration.instance(String, 'test'));
        @singleton
        class Foo {
          public constructor(public readonly test: string) {
          }
        }
        assert.deepStrictEqual(container.get(Foo).test, 'test');
      });
    });
  });

  describe('@newInstanceOf', function () {
    it('throws when there is no registration for interface', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      assert.throws(() => container.get(newInstanceOf(I)), `No registration for interface: 'I'`);
    });

    it('instantiates when there is an constructable registration for an interface', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      class Impl {}
      container.register(Registration.singleton(I, Impl));
      assert.instanceOf(container.get(newInstanceOf(I)), Impl);
    });

    it('jit-registers and instantiates when there is a default impl for an interface', function () {
      const container = DI.createContainer();
      class Impl {}
      const I = DI.createInterface('I', x => x.singleton(Impl));
      assert.instanceOf(container.get(newInstanceOf(I)), Impl);
    });

    it('does not register instance when retrieved through interface', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      class Impl {}
      container.register(Registration.singleton(I, Impl));
      assert.notStrictEqual(container.get(newInstanceOf(I)), container.get(I));
      assert.strictEqual(container.getAll(I).length, 1);
    });

    it('does not throw when there is factory registration for an interface', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      let iCallCount = 0;
      class IImpl {
        public constructor() {
          iCallCount++;
        }
      }
      container.registerFactory(I as unknown as Constructable, {
        Type: IImpl,
        construct(c: IContainer) {
          return c.getFactory(this.Type).construct(c);
        },
        registerTransformer() {
          return false;
        }
      });

      const instance1 = container.get(newInstanceOf(I));
      assert.strictEqual(iCallCount, 1);
      const instance2 = container.get(newInstanceOf(I));
      assert.strictEqual(iCallCount, 2);
      assert.notStrictEqual(instance1, instance2);
    });

    it('resolves dependencies from requestor', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      const IDep = DI.createInterface('IDep');
      let iCallCount = 0;
      class IImpl {
        public static get inject() {
          return [IDep];
        }
        public constructor() {
          iCallCount++;
        }
      }
      let parentDepCallCount = 0;
      let childDepCallCount = 0;
      container.registerFactory(I as unknown as Constructable, {
        Type: IImpl,
        construct(c: IContainer) {
          return c.getFactory(this.Type).construct(c);
        },
        registerTransformer() {
          return false;
        }
      });

      container.registerFactory(IDep as unknown as Constructable, {
        Type: class {
          public constructor() {
            parentDepCallCount++;
          }
        },
        construct(c: IContainer) {
          return c.getFactory(this.Type).construct(c);
        },
        registerTransformer() {/* empty */}
      });
      const childContainer = container.createChild();
      class DepImpl {
        public constructor() {
          childDepCallCount++;
        }
      }
      childContainer.register(Registration.singleton(IDep, DepImpl));
      childContainer.registerFactory(IDep as unknown as Constructable, {
        Type: DepImpl,
        construct(c: IContainer) {
          return c.getFactory(this.Type).construct(c);
        },
        registerTransformer() {/* empty */}
      });
      const instance = childContainer.get(newInstanceOf(I));
      assert.strictEqual(iCallCount, 1);
      assert.strictEqual(parentDepCallCount, 0);
      assert.strictEqual(childDepCallCount, 1);
      assert.instanceOf(instance, IImpl);
    });
  });

  describe('@newInstanceForScope', function () {
    it('jit-registers and instantiates when there is a default impl for an interface', function () {
      const container = DI.createContainer();
      class Impl {}
      const I = DI.createInterface('I', x => x.singleton(Impl));
      assert.instanceOf(container.get(newInstanceForScope(I)), Impl);
      assert.strictEqual(container.getAll(I).length, 2);
    });

    it('jit-registers resolver and instance in child', function () {
      const container = DI.createContainer();
      const child = container.createChild();
      class Impl {}
      const I = DI.createInterface('I', x => x.singleton(Impl));
      const instance = child.get(newInstanceForScope(I));
      assert.instanceOf(instance, Impl);
      assert.strictEqual(child.getAll(I).length, 1);
      assert.strictEqual(child.getAll(I)[0], instance);
      // has resolver, no instance
      // has resolver because createNewInstance/scope auto-registers a resolver
      // no instance because new instance forScope doesn't register on handler
      assert.strictEqual(container.has(I, false), true);
    });
    // the following test tests a more common, expected scenario,
    // where some instance is scoped to a child container,
    // instead of the container registering the interface itself.
    //
    // for the container that registers the interface itself,
    // the first registration is always a different resolver,
    // with the actual resolver that resolves the instance of the interface
    it('creates new instance once in child container', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      let iCallCount = 0;
      class IImpl {
        public constructor() {
          iCallCount++;
        }
      }
      container.register(Registration.singleton(I, IImpl));
      container.registerFactory(I as unknown as Constructable, {
        Type: IImpl,
        construct(c: IContainer) {
          return c.getFactory(this.Type).construct(c);
        },
        registerTransformer() {
          return false;
        }
      });
      const childContainer = container.createChild();
      const instance = childContainer.get(newInstanceForScope(I));
      assert.strictEqual(iCallCount, 1);
      assert.instanceOf(instance, IImpl);

      const instance2 = childContainer.get(I);
      assert.strictEqual(iCallCount, 1);
      assert.instanceOf(instance2, IImpl);
      assert.strictEqual(instance, instance2);
      assert.strictEqual(instance, childContainer.createChild().get(I));
    });
  });

  describe('@factory', function () {
    it('resolves different factories', function () {
      const container = DI.createContainer();
      const I = DI.createInterface('I');
      const resolver = factory(I);
      const factory1 = container.get(resolver);
      const factory2 = container.get(resolver);

      assert.notStrictEqual(factory1, factory2);
    });

    it('invokes new instance when calling the factory', function () {
      const container = DI.createContainer();
      const f  = container.get(factory(class MyClass {
        public constructor() {
          callCount++;
        }
      }));
      let callCount = 0;
      const instance1 = f();
      const instance2 = f();
      assert.strictEqual(callCount, 2);
      assert.notStrictEqual(instance1, instance2);
    });

    it('resolves with decorator usages', function () {
      const container = DI.createContainer();
      class MyClass {
        public constructor() {
          callCount++;
        }
      }
      class MyClassBuilder {
        public constructor(
          @factory(MyClass) public readonly myClassFactory: IResolvedFactory<MyClass>
        ) {}

        public build() {
          return this.myClassFactory();
        }
      }
      let callCount = 0;
      const builder = container.get(MyClassBuilder);
      const instance1 = builder.build();
      const instance2 = builder.build();
      assert.strictEqual(callCount, 2);
      assert.notStrictEqual(instance1, instance2);
    });

    it('passes the dynamic parameters', function () {
      const container = DI.createContainer();
      class MyClass {
        public params: unknown[];
        public constructor(...params: unknown[]) {
          callCount++;
          this.params = params;
        }
      }
      class MyClassBuilder {
        public constructor(
          @factory(MyClass) public readonly myClassFactory: IResolvedFactory<MyClass>
        ) {}

        public build(...args: unknown[]) {
          return this.myClassFactory(...args);
        }
      }
      let callCount = 0;
      const builder = container.get(MyClassBuilder);
      const instance1 = builder.build(1, 2, { a: 1, b: 2 });
      const instance2 = builder.build(3, 4, { a: 3, b: 4 });
      assert.strictEqual(callCount, 2);
      assert.notStrictEqual(instance1, instance2);
      assert.deepStrictEqual(instance1.params, [1, 2, { a: 1, b: 2 }]);
      assert.deepStrictEqual(instance2.params, [3, 4, { a: 3, b: 4 }]);
    });

    // guess we can add a test for factory resolving to a factory resolving to a factory
    // to see if things work smoothly... TODO?
  });

  describe('resolve', function () {
    it('works with resolve(all(...))', function () {
      let id = 0;
      const II = DI.createInterface<{ a: Model }>();
      class Model {
        id = ++id;
      }
      class A {
        a = resolve(all(II));
      }
      container.register(
        Registration.transient(II, class I1 {
          a = resolve(Model);
        }),
        Registration.transient(II, class I2 {
          a = resolve(newInstanceOf(Model));
        })
      );
      const { a } = container.get(A);

      assert.deepStrictEqual(a.map(a => a.a.id), [1, 2]);
    });

    it('works with a list of keys', function () {
      let i = 0;
      class Model { v = ++i; }
      class Base {
        a = resolve(Model, newInstanceOf(Model));
      }
      const { a: [{ v }, { v: v1 }] } = container.get(Base);
      assert.strictEqual(v, 1);
      assert.strictEqual(v1, 2);
    });

    it('works with resolve(transient(...))', function () {
      let id = 0;
      class Model { id = ++id; }
      const { a, b } = container.get(class A {
        a = resolve(transient(Model));
        b = resolve(transient(Model));
      });

      assert.deepStrictEqual([a.id, b.id], [1, 2]);
    });

    it('works with resolve(lazy(...))', function () {
      let id = 0;
      class Model { id = ++id; }
      const { a, b } = container.get(class A {
        a = resolve(lazy(Model));
        b = resolve(lazy(Model));
      });

      assert.deepStrictEqual([a().id, b().id], [1, 1]);
      assert.deepStrictEqual([a().id, b().id], [1, 1]);
    });

    it('works with resolve(optional(...))', function () {
      let id = 0;
      class Model { id = ++id; }
      const { a, b } = container.get(class A {
        a = resolve(optional(Model));
        b = resolve(optional(Model));
      });

      assert.deepStrictEqual([a?.id, b?.id], [undefined, undefined]);
    });

    it('works with resolve(newInstanceOf(...))', function () {
      let id = 0;
      class Model { id = ++id; }
      const { a, b } = container.get(class A {
        _ = resolve(Model);
        a = resolve(newInstanceOf(Model));
        b = resolve(newInstanceOf(Model));
      });

      assert.deepStrictEqual([a.id, b.id], [2, 3]);
      assert.strictEqual(container.getAll(Model).length, 1);
    });

    it('works with resolve(newInstanceForScope(...))', function () {
      let id = 0;
      class Model { id = ++id; }
      const { a, b } = container.get(class A {
        _ = resolve(Model);
        a = resolve(newInstanceForScope(Model));
        b = resolve(newInstanceForScope(Model));
      });

      assert.deepStrictEqual([a.id, b.id], [2, 3]);
      assert.strictEqual(container.getAll(Model).length, 3);
    });

    it('works with resolve(factory(...))', function () {
      let id = 0;
      class Model {
        id = ++id;
        args: number[];
        constructor(...args: number[]) {
          this.args = args;
        }
        get sum() {
          return this.id + this.args.reduce((c, i) => c + i, 0);
        }
      }
      const { a, b } = container.get(class A {
        a = resolve(factory(Model));
        b = resolve(factory(Model));
      });

      assert.deepStrictEqual([a(1, 2).sum, b(1, 2).sum], [4, 5]);
    });

    it('works with deeply nested resolve(...)', function () {
      let i = 0;
      class Address { n: number = ++i; }
      class Details {
        address1 = resolve(Address);
        address2 = resolve(newInstanceForScope(Address));
      }
      class Profile {
        details = resolve(Details);
      }
      class Parent {
        model = resolve(Profile);
      }
      class Child {
        parent = resolve(Parent);
      }
      const { parent } = container.get(Child);
      assert.strictEqual(parent.model.details.address1.n, 1);
      assert.strictEqual(parent.model.details.address2.n, 2);
      assert.strictEqual(parent.model.details, container.get(Details));
    });

    describe('with [inheritance]', function () {
      it('works for basic inheritance', function () {
        let i = 0;
        class Model { v = ++i; }
        class Base {
          a = resolve(Model);
        }
        const { a: { v } } = container.get(class extends Base {});
        assert.strictEqual(v, 1);
      });

      it('works with deeply nested resolve(...)', function () {
        let id = 0;
        class Model { id = ++id; }
        class Value {
          a = resolve(newInstanceOf(Model));
        }
        class V2 extends Value {
          a = resolve(newInstanceOf(Model));
        }
        class V3 extends V2 {
          a = resolve(newInstanceOf(Model));
        }
        const { a } = container.get(V3);

        assert.strictEqual(a.id, 3);
      });

      it('works with a list of keys', function () {
        let i = 0;
        class Model { v = ++i; }
        class Base {
          a = resolve(Model, newInstanceOf(Model));
        }
        const { a: [{ v }, { v: v1 }] } = container.get(class extends Base {});
        assert.strictEqual(v, 1);
        assert.strictEqual(v1, 2);
      });

      it('works with multiple all(...)', function () {
        let i = 0;
        let j = 0;
        class Model { v = ++i; }
        class Base {
          a = resolve(newInstanceForScope(Model), newInstanceForScope(Model));
        }
        const I = DI.createInterface<Base>();
        container.register(
          Registration.transient(I, class extends Base {}),
          Registration.transient(I, class extends Base {
            j = ++j;
          }),
        );
        container.invoke(class {
          b = resolve(all(I), all(I));
        });

        assert.strictEqual(container.getAll(Model).length, 8);
        assert.strictEqual(i, 8);
        assert.strictEqual(j, 2);
      });
    });
  });
});

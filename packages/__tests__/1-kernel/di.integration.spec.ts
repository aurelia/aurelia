import { DI, IContainer, inject, InterfaceSymbol, Registration, singleton } from '@aurelia/kernel';
import { assert, createSpy, ISpy } from '@aurelia/testing';

describe('DI.singleton', function () {
  describe('registerInRequester', function () {
    class Foo {
    }
    const fooSelfRegister = DI.singleton(Foo, { scoped: true });

    it('root', function () {
      const root = DI.createContainer();
      const foo1 = root.get(fooSelfRegister);
      const foo2 = root.get(fooSelfRegister);

      assert.strictEqual(foo1, foo2);
    });

    it('children', function () {
      const root = DI.createContainer();
      const child1 = root.createChild();
      const child2 = root.createChild();
      const foo1 = child1.get(fooSelfRegister);
      const foo2 = child2.get(fooSelfRegister);

      assert.notStrictEqual(foo1, foo2);
    });
  });
});

describe('DI.getDependencies', function () {
  it('string param', function () {
    @singleton
    class Foo {
      public constructor(public readonly test: string) {}
    }
    const actual = DI.getDependencies(Foo);
    assert.deepStrictEqual(actual, [String]);
  });

  it('class param', function () {
    class Bar {}
    @singleton
    class Foo {
      public constructor(public readonly test: Bar) {}
    }
    const actual = DI.getDependencies(Foo);
    assert.deepStrictEqual(actual, [Bar]);
  });
});

describe('DI.createInterface() -> container.get()', function () {
  let container: IContainer;

  interface ITransient {}
  class Transient implements ITransient {}
  let ITransient: InterfaceSymbol<ITransient>;

  interface ISingleton {}
  class Singleton implements ISingleton {}
  let ISingleton: InterfaceSymbol<ISingleton>;

  interface IInstance {}
  class Instance implements IInstance {}
  let IInstance: InterfaceSymbol<IInstance>;
  let instance: Instance;

  interface ICallback {}
  class Callback implements ICallback {}
  let ICallback: InterfaceSymbol<ICallback>;

  interface ICachedCallback {}
  class CachedCallback implements ICachedCallback {}
  let ICachedCallback: InterfaceSymbol<ICachedCallback>;
  const cachedCallback = 'cachedCallBack';
  let callbackCount = 0;
  function callbackToCache() {
    ++callbackCount;
    return new CachedCallback();
  }

  let callback: ISpy<() => ICallback>;
  let get: ISpy<IContainer['get']>;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    callbackCount = 0;
    container = DI.createContainer();
    ITransient = DI.createInterface<ITransient>('ITransient').withDefault(x => x.transient(Transient));
    ISingleton = DI.createInterface<ISingleton>('ISingleton').withDefault(x => x.singleton(Singleton));
    instance = new Instance();
    IInstance = DI.createInterface<IInstance>('IInstance').withDefault(x => x.instance(instance));
    callback = createSpy(() => new Callback());
    ICallback = DI.createInterface<ICallback>('ICallback').withDefault(x => x.callback(callback));
    ICachedCallback = DI.createInterface<ICachedCallback>('ICachedCallback')
      .withDefault(builder => builder.cachedCallback(callbackToCache));
    get = createSpy(container, 'get', true);
  });

  // eslint-disable-next-line mocha/no-hooks
  afterEach(function () {
    get.restore();
  });

  describe('leaf', function () {
    it(`transient registration returns a new instance each time`, function () {
      const actual1 = container.get(ITransient);
      assert.instanceOf(actual1, Transient, `actual1`);

      const actual2 = container.get(ITransient);
      assert.instanceOf(actual2, Transient, `actual2`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ITransient],
          [ITransient],
        ],
        `get.calls`,
      );
    });

    it(`singleton registration returns the same instance each time`, function () {
      const actual1 = container.get(ISingleton);
      assert.instanceOf(actual1, Singleton, `actual1`);

      const actual2 = container.get(ISingleton);
      assert.instanceOf(actual2, Singleton, `actual2`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ISingleton],
          [ISingleton],
        ],
        `get.calls`,
      );
    });

    it(`instance registration returns the same instance each time`, function () {
      const actual1 = container.get(IInstance);
      assert.instanceOf(actual1, Instance, `actual1`);

      const actual2 = container.get(IInstance);
      assert.instanceOf(actual2, Instance, `actual2`);

      assert.strictEqual(actual1, instance, `actual1`);
      assert.strictEqual(actual2, instance, `actual2`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IInstance],
          [IInstance],
        ],
        `get.calls`,
      );
    });

    it(`callback registration is invoked each time`, function () {
      const actual1 = container.get(ICallback);
      assert.instanceOf(actual1, Callback, `actual1`);

      const actual2 = container.get(ICallback);
      assert.instanceOf(actual2, Callback, `actual2`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        callback.calls,
        [
          [container, container, container.getResolver(ICallback)],
          [container, container, container.getResolver(ICallback)],
        ],
        `callback.calls`,
      );

      assert.deepStrictEqual(
        get.calls,
        [
          [ICallback],
          [ICallback],
        ],
        `get.calls`,
      );
    });

    it(`cachedCallback registration is invoked once`, function () {

      container.register(Registration.cachedCallback(cachedCallback, callbackToCache));
      const child = container.createChild();
      child.register(Registration.cachedCallback(cachedCallback, callbackToCache));
      const actual1 = container.get(cachedCallback);
      const actual2 = container.get(cachedCallback);

      assert.strictEqual(callbackCount, 1, `only called once`);
      assert.strictEqual(actual2, actual1, `getting from the same container`);

      const actual3 = child.get(cachedCallback);
      assert.notStrictEqual(actual3, actual1, `get from child that has new resolver`);
    });

    it(`cacheCallback multiple root containers`, function () {
      const container0 = DI.createContainer();
      const container1 = DI.createContainer();
      container0.register(Registration.cachedCallback(cachedCallback, callbackToCache));
      container1.register(Registration.cachedCallback(cachedCallback, callbackToCache));

      const actual11 = container0.get(cachedCallback);
      const actual12 = container0.get(cachedCallback);

      assert.strictEqual(callbackCount, 1, 'one callback');
      assert.strictEqual(actual11, actual12);

      const actual21 = container1.get(cachedCallback);
      const actual22 = container1.get(cachedCallback);

      assert.strictEqual(callbackCount, 2);
      assert.strictEqual(actual21, actual22);
    });

    it(`cacheCallback shared registration`, function () {
      const reg = Registration.cachedCallback(cachedCallback, callbackToCache);
      const container0 = DI.createContainer();
      const container1 = DI.createContainer();
      container0.register(reg);
      container1.register(reg);

      const actual11 = container0.get(cachedCallback);
      const actual12 = container0.get(cachedCallback);

      assert.strictEqual(callbackCount, 1);
      assert.strictEqual(actual11, actual12);

      const actual21 = container1.get(cachedCallback);
      const actual22 = container1.get(cachedCallback);

      assert.strictEqual(callbackCount, 1);
      assert.strictEqual(actual21, actual22);
      assert.strictEqual(actual11, actual21);
    });

    it(`cachedCallback registration on interface is invoked once`, function () {
      const actual1 = container.get(ICachedCallback);
      const actual2 = container.get(ICachedCallback);

      assert.strictEqual(callbackCount, 1, `only called once`);
      assert.strictEqual(actual2, actual1, `getting from the same container`);
    });

    it(`cacheCallback interface multiple root containers`, function () {
      const container0 = DI.createContainer();
      const container1 = DI.createContainer();
      const actual11 = container0.get(ICachedCallback);
      const actual12 = container0.get(ICachedCallback);

      assert.strictEqual(callbackCount, 1);
      assert.strictEqual(actual11, actual12);

      const actual21 = container1.get(ICachedCallback);
      const actual22 = container1.get(ICachedCallback);

      assert.strictEqual(callbackCount, 2);
      assert.strictEqual(actual21, actual22);
    });

    it(`InterfaceSymbol alias to transient registration returns a new instance each time`, function () {
      interface IAlias {}
      const IAlias = DI.createInterface<IAlias>('IAlias').withDefault(x => x.aliasTo(ITransient));

      const actual1 = container.get(IAlias);
      assert.instanceOf(actual1, Transient, `actual1`);

      const actual2 = container.get(IAlias);
      assert.instanceOf(actual2, Transient, `actual2`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IAlias],
          [ITransient],
          [IAlias],
          [ITransient],
        ],
        `get.calls`,
      );
    });

    it(`InterfaceSymbol alias to singleton registration returns the same instance each time`, function () {
      interface IAlias {}
      const IAlias = DI.createInterface<IAlias>('IAlias').withDefault(x => x.aliasTo(ISingleton));

      const actual1 = container.get(IAlias);
      assert.instanceOf(actual1, Singleton, `actual1`);

      const actual2 = container.get(IAlias);
      assert.instanceOf(actual2, Singleton, `actual2`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IAlias],
          [ISingleton],
          [IAlias],
          [ISingleton],
        ],
        `get.calls`,
      );
    });

    it(`InterfaceSymbol alias to instance registration returns the same instance each time`, function () {
      interface IAlias {}
      const IAlias = DI.createInterface<IAlias>('IAlias').withDefault(x => x.aliasTo(IInstance));

      const actual1 = container.get(IAlias);
      assert.instanceOf(actual1, Instance, `actual1`);

      const actual2 = container.get(IAlias);
      assert.instanceOf(actual2, Instance, `actual2`);

      assert.strictEqual(actual1, instance, `actual1`);
      assert.strictEqual(actual2, instance, `actual2`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IAlias],
          [IInstance],
          [IAlias],
          [IInstance],
        ],
        `get.calls`,
      );
    });

    // TODO: make test work
    it(`InterfaceSymbol alias to callback registration is invoked each time`, function () {
      interface IAlias {}
      const IAlias = DI.createInterface<IAlias>('IAlias').withDefault(x => x.aliasTo(ICallback));

      const actual1 = container.get(IAlias);
      assert.instanceOf(actual1, Callback, `actual1`);

      const actual2 = container.get(IAlias);
      assert.instanceOf(actual2, Callback, `actual2`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        callback.calls,
        [
          [container, container, container.getResolver(ICallback)],
          [container, container, container.getResolver(ICallback)],
        ],
        `callback.calls`,
      );

      assert.deepStrictEqual(
        get.calls,
        [
          [IAlias],
          [ICallback],
          [IAlias],
          [ICallback],
        ],
        `get.calls`,
      );
    });

    it(`string alias to transient registration returns a new instance each time`, function () {
      container.register(Registration.aliasTo(ITransient, 'alias'));

      const actual1 = container.get('alias');
      assert.instanceOf(actual1, Transient, `actual1`);

      const actual2 = container.get('alias');
      assert.instanceOf(actual2, Transient, `actual2`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        get.calls,
        [
          ['alias'],
          [ITransient],
          ['alias'],
          [ITransient],
        ],
        `get.calls`,
      );
    });

    it(`string alias to singleton registration returns the same instance each time`, function () {
      container.register(Registration.aliasTo(ISingleton, 'alias'));

      const actual1 = container.get('alias');
      assert.instanceOf(actual1, Singleton, `actual1`);

      const actual2 = container.get('alias');
      assert.instanceOf(actual2, Singleton, `actual2`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        get.calls,
        [
          ['alias'],
          [ISingleton],
          ['alias'],
          [ISingleton],
        ],
        `get.calls`,
      );
    });

    it(`string alias to instance registration returns the same instance each time`, function () {
      container.register(Registration.aliasTo(IInstance, 'alias'));

      const actual1 = container.get('alias');
      assert.instanceOf(actual1, Instance, `actual1`);

      const actual2 = container.get('alias');
      assert.instanceOf(actual2, Instance, `actual2`);

      assert.strictEqual(actual1, instance, `actual1`);
      assert.strictEqual(actual2, instance, `actual2`);

      assert.deepStrictEqual(
        get.calls,
        [
          ['alias'],
          [IInstance],
          ['alias'],
          [IInstance],
        ],
        `get.calls`,
      );
    });

    it(`string alias to callback registration is invoked each time`, function () {
      container.register(Registration.aliasTo(ICallback, 'alias'));

      const actual1 = container.get('alias');
      assert.instanceOf(actual1, Callback, `actual1`);

      const actual2 = container.get('alias');
      assert.instanceOf(actual2, Callback, `actual2`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.deepStrictEqual(
        callback.calls,
        [
          [container, container, container.getResolver(ICallback)],
          [container, container, container.getResolver(ICallback)],
        ],
        `callback.calls`,
      );

      assert.deepStrictEqual(
        get.calls,
        [
          ['alias'],
          [ICallback],
          ['alias'],
          [ICallback],
        ],
        `get.calls`,
      );
    });
  });

  // describe('parent without inject decorator', function () {
  //   function decorator(): ClassDecorator { return (target: any) => target; }
  //   interface IParent { dep: any; }
  //   let IParent: InterfaceSymbol<IParent>;

  //   function register(cls: any) {
  //     IParent = DI.createInterface<IParent>('IParent').withDefault(x => x.transient(cls));
  //   }

  //   it(`transient child registration throws`, function () {
  //     @decorator()
  //     class Parent implements IParent { constructor(public dep: ITransient) {} }
  //     register(Parent);

  //     assert.throws(() => container.get(IParent), /5/, `() => container.get(IParent)`);
  //   });

  //   it(`singleton child registration throws`, function () {
  //     @decorator()
  //     class Parent implements IParent { constructor(public dep: ISingleton) {} }
  //     register(Parent);

  //     assert.throws(() => container.get(IParent), /5/, `() => container.get(IParent)`);
  //   });

  //   it(`instance child registration throws`, function () {
  //     @decorator()
  //     class Parent implements IParent { constructor(public dep: IInstance) {} }
  //     register(Parent);

  //     assert.throws(() => container.get(IParent), /5/, `() => container.get(IParent)`);
  //   });

  //   it(`callback child registration throws`, function () {
  //     @decorator()
  //     class Parent implements IParent { constructor(public dep: ICallback) {} }
  //     register(Parent);

  //     assert.throws(() => container.get(IParent), /5/, `() => container.get(IParent)`);
  //   });
  // });

  describe('transient parent', function () {
    interface ITransientParent { dep: any }
    let ITransientParent: InterfaceSymbol<ITransientParent>;

    function register(cls: any) {
      ITransientParent = DI.createInterface<ITransientParent>('ITransientParent').withDefault(x => x.transient(cls));
    }

    it(`transient child registration returns a new instance each time`, function () {
      @inject(ITransient)
      class TransientParent implements ITransientParent { public constructor(public dep: ITransient) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      assert.instanceOf(actual1, TransientParent, `actual1`);
      assert.instanceOf(actual1.dep, Transient, `actual1.dep`);

      const actual2 = container.get(ITransientParent);
      assert.instanceOf(actual2, TransientParent, `actual2`);
      assert.instanceOf(actual2.dep, Transient, `actual2.dep`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.notStrictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ITransientParent],
          [ITransient],
          [ITransientParent],
          [ITransient],
        ],
        `get.calls`,
      );
    });

    it(`singleton child registration returns the same instance each time`, function () {
      @inject(ISingleton)
      class TransientParent implements ITransientParent { public constructor(public dep: ISingleton) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      assert.instanceOf(actual1, TransientParent, `actual1`);
      assert.instanceOf(actual1.dep, Singleton, `actual1.dep`);

      const actual2 = container.get(ITransientParent);
      assert.instanceOf(actual2, TransientParent, `actual2`);
      assert.instanceOf(actual2.dep, Singleton, `actual2.dep`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ITransientParent],
          [ISingleton],
          [ITransientParent],
          [ISingleton],
        ],
        `get.calls`,
      );
    });

    it(`instance child registration returns the same instance each time`, function () {
      @inject(IInstance)
      class TransientParent implements ITransientParent { public constructor(public dep: IInstance) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      assert.instanceOf(actual1, TransientParent, `actual1`);
      assert.instanceOf(actual1.dep, Instance, `actual1.dep`);

      const actual2 = container.get(ITransientParent);
      assert.instanceOf(actual2, TransientParent, `actual2`);
      assert.instanceOf(actual2.dep, Instance, `actual2.dep`);

      assert.notStrictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ITransientParent],
          [IInstance],
          [ITransientParent],
          [IInstance],
        ],
        `get.calls`,
      );
    });

    it(`callback child registration is invoked each time`, function () {
      @inject(ICallback)
      class TransientParent implements ITransientParent { public constructor(public dep: ICallback) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      assert.instanceOf(actual1, TransientParent, `actual1`);
      assert.instanceOf(actual1.dep, Callback, `actual1.dep`);

      const actual2 = container.get(ITransientParent);
      assert.instanceOf(actual2, TransientParent, `actual2`);
      assert.instanceOf(actual2.dep, Callback, `actual2.dep`);

      assert.notStrictEqual(actual1, actual2, `actual1`);
      assert.notStrictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        callback.calls,
        [
          [container, container, container.getResolver(ICallback)],
          [container, container, container.getResolver(ICallback)],
        ],
        `callback.calls`,
      );

      assert.deepStrictEqual(
        get.calls,
        [
          [ITransientParent],
          [ICallback],
          [ITransientParent],
          [ICallback],
        ],
        `get.calls`,
      );
    });
  });

  describe('singleton parent', function () {
    interface ISingletonParent { dep: any }
    let ISingletonParent: InterfaceSymbol<ISingletonParent>;

    function register(cls: any) {
      ISingletonParent = DI.createInterface<ISingletonParent>('ISingletonParent').withDefault(x => x.singleton(cls));
    }

    it(`transient child registration is reused by the singleton parent`, function () {
      @inject(ITransient)
      class SingletonParent implements ISingletonParent { public constructor(public dep: ITransient) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      assert.instanceOf(actual1, SingletonParent, `actual1`);
      assert.instanceOf(actual1.dep, Transient, `actual1.dep`);

      const actual2 = container.get(ISingletonParent);
      assert.instanceOf(actual2, SingletonParent, `actual2`);
      assert.instanceOf(actual2.dep, Transient, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ISingletonParent],
          [ITransient],
          [ISingletonParent],
        ],
        `get.calls`,
      );
    });

    it(`singleton registration is reused by the singleton parent`, function () {
      @inject(ISingleton)
      class SingletonParent implements ISingletonParent { public constructor(public dep: ISingleton) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      assert.instanceOf(actual1, SingletonParent, `actual1`);
      assert.instanceOf(actual1.dep, Singleton, `actual1.dep`);

      const actual2 = container.get(ISingletonParent);
      assert.instanceOf(actual2, SingletonParent, `actual2`);
      assert.instanceOf(actual2.dep, Singleton, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ISingletonParent],
          [ISingleton],
          [ISingletonParent],
        ],
        `get.calls`,
      );
    });

    it(`instance registration is reused by the singleton parent`, function () {
      @inject(IInstance)
      class SingletonParent implements ISingletonParent { public constructor(public dep: IInstance) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      assert.instanceOf(actual1, SingletonParent, `actual1`);
      assert.instanceOf(actual1.dep, Instance, `actual1.dep`);

      const actual2 = container.get(ISingletonParent);
      assert.instanceOf(actual2, SingletonParent, `actual2`);
      assert.instanceOf(actual2.dep, Instance, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [ISingletonParent],
          [IInstance],
          [ISingletonParent],
        ],
        `get.calls`,
      );
    });

    it(`callback registration is reused by the singleton parent`, function () {
      @inject(ICallback)
      class SingletonParent implements ISingletonParent { public constructor(public dep: ICallback) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      assert.instanceOf(actual1, SingletonParent, `actual1`);
      assert.instanceOf(actual1.dep, Callback, `actual1.dep`);

      const actual2 = container.get(ISingletonParent);
      assert.instanceOf(actual2, SingletonParent, `actual2`);
      assert.instanceOf(actual2.dep, Callback, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);
      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        callback.calls,
        [
          [container, container, container.getResolver(ICallback)],
        ],
        `callback.calls`,
      );

      assert.deepStrictEqual(
        get.calls,
        [
          [ISingletonParent],
          [ICallback],
          [ISingletonParent],
        ],
        `get.calls`,
      );
    });
  });

  describe('instance parent', function () {
    interface IInstanceParent { dep: any }
    let IInstanceParent: InterfaceSymbol<IInstanceParent>;
    let instanceParent: IInstanceParent;

    function register(cls: any) {
      instanceParent = container.get(cls);
      get.reset();
      IInstanceParent = DI.createInterface<IInstanceParent>('IInstanceParent').withDefault(x => x.instance(instanceParent));
    }

    it(`transient registration is reused by the instance parent`, function () {
      @inject(ITransient)
      class InstanceParent implements IInstanceParent { public constructor(public dep: ITransient) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      assert.instanceOf(actual1, InstanceParent, `actual1`);
      assert.instanceOf(actual1.dep, Transient, `actual1.dep`);

      const actual2 = container.get(IInstanceParent);
      assert.instanceOf(actual2, InstanceParent, `actual2`);
      assert.instanceOf(actual2.dep, Transient, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IInstanceParent],
          [IInstanceParent],
        ],
        `get.calls`,
      );
    });

    it(`singleton registration is reused by the instance parent`, function () {
      @inject(ISingleton)
      class InstanceParent implements IInstanceParent { public constructor(public dep: ISingleton) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      assert.instanceOf(actual1, InstanceParent, `actual1`);
      assert.instanceOf(actual1.dep, Singleton, `actual1.dep`);

      const actual2 = container.get(IInstanceParent);
      assert.instanceOf(actual2, InstanceParent, `actual2`);
      assert.instanceOf(actual2.dep, Singleton, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IInstanceParent],
          [IInstanceParent],
        ],
        `get.calls`,
      );
    });

    it(`instance registration is reused by the instance parent`, function () {
      @inject(IInstance)
      class InstanceParent implements IInstanceParent { public constructor(public dep: IInstance) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      assert.instanceOf(actual1, InstanceParent, `actual1`);
      assert.instanceOf(actual1.dep, Instance, `actual1.dep`);

      const actual2 = container.get(IInstanceParent);
      assert.instanceOf(actual2, InstanceParent, `actual2`);
      assert.instanceOf(actual2.dep, Instance, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);

      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        get.calls,
        [
          [IInstanceParent],
          [IInstanceParent],
        ],
        `get.calls`,
      );
    });

    it(`callback registration is reused by the instance parent`, function () {
      @inject(ICallback)
      class InstanceParent implements IInstanceParent { public constructor(public dep: ICallback) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      assert.instanceOf(actual1, InstanceParent, `actual1`);
      assert.instanceOf(actual1.dep, Callback, `actual1.dep`);

      const actual2 = container.get(IInstanceParent);
      assert.instanceOf(actual2, InstanceParent, `actual2`);
      assert.instanceOf(actual2.dep, Callback, `actual2.dep`);

      assert.strictEqual(actual1, actual2, `actual1`);
      assert.strictEqual(actual1.dep, actual2.dep, `actual1.dep`);

      assert.deepStrictEqual(
        callback.calls,
        [
          [container, container, container.getResolver(ICallback)],
        ],
        `callback.calls`,
      );

      assert.deepStrictEqual(
        get.calls,
        [
          [IInstanceParent],
          [IInstanceParent],
        ],
        `get.calls`,
      );
    });
  });
});

describe('defer registration', function () {
  class FakeCSSService {
    public constructor(public data: any) {}
  }

  class FakeCSSHandler {
    public register(container: IContainer, data) {
      container.register(
        Registration.instance(
          FakeCSSService,
          new FakeCSSService(data)
        )
      );
    }
  }

  it(`enables the handler class to provide registrations for data`, function () {
    const container = DI.createContainer();
    const data = {};

    container.register(
      Registration.singleton('.css', FakeCSSHandler)
    );

    container.register(
      Registration.defer('.css', data)
    );

    const service = container.get(FakeCSSService);

    assert.strictEqual(service.data, data);
  });

  it(`passes the params to the container's register method if no handler is found`, function () {
    const container = DI.createContainer();
    const data = {
      wasCalled: false,
      register() {
        this.wasCalled = true;
      }
    };

    container.register(
      Registration.defer('.css', data)
    );

    assert.strictEqual(data.wasCalled, true);
  });

  [
    {
      name: 'string',
      value: 'some string value'
    },
    {
      name: 'boolean',
      value: true
    },
    {
      name: 'number',
      value: 42
    }
  ].forEach(x => {
    it(`does not pass ${x.name} params to the container's register when no handler is found`, function () {
      const container = DI.createContainer();
      container.register(
        Registration.defer('.css', x.value)
      );
    });
  });

  // TODO: fix test setup for emitDecoratorMetadata
  // it('can inject dependencies based on TS metadata', function () {
  //   const deco: ClassDecorator = function (target) { return target; };

  //   class Foo {}

  //   @deco
  //   class Bar {
  //     public constructor(
  //       public readonly foo: Foo
  //     ) {}
  //   }

  //   const bar = DI.createContainer().get(Bar);

  //   assert.instanceOf(bar.foo, Foo);
  // });
});

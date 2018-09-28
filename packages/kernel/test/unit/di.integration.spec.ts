import { inject, DI, Registration, InterfaceSymbol, IContainer, Container } from "../../src";
import { expect } from "chai";
import { spy } from "sinon";

describe('DI.createInterface() -> container.get()', () => {
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
  let callback: ReturnType<typeof spy>;

  let get: ReturnType<typeof spy>;

  beforeEach(() => {
    container = DI.createContainer();
    ITransient = DI.createInterface<ITransient>().withDefault(x => x.transient(Transient));
    ISingleton = DI.createInterface<ISingleton>().withDefault(x => x.singleton(Singleton));
    instance = new Instance();
    IInstance = DI.createInterface<IInstance>().withDefault(x => x.instance(instance));
    callback = spy(() => new Callback());
    ICallback = DI.createInterface<ICallback>().withDefault(x => x.callback(callback));
    get = spy(container, 'get');
  });

  afterEach(() => {
    get.restore();
  });

  describe('leaf', () => {
    it(`transient registration returns a new instance each time`, () => {
      const actual1 = container.get(ITransient);
      expect(actual1).to.be.instanceof(Transient);

      const actual2 = container.get(ITransient);
      expect(actual2).to.be.instanceof(Transient);

      expect(actual1).not.to.equal(actual2);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`singleton registration returns the same instance each time`, () => {
      const actual1 = container.get(ISingleton);
      expect(actual1).to.be.instanceof(Singleton);

      const actual2 = container.get(ISingleton);
      expect(actual2).to.be.instanceof(Singleton);

      expect(actual1).to.equal(actual2);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`instance registration returns the same instance each time`, () => {
      const actual1 = container.get(IInstance);
      expect(actual1).to.be.instanceof(Instance);

      const actual2 = container.get(IInstance);
      expect(actual2).to.be.instanceof(Instance);

      expect(actual1).to.equal(instance);
      expect(actual2).to.equal(instance);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`callback registration is invoked each time`, () => {
      const actual1 = container.get(ICallback);
      expect(actual1).to.be.instanceof(Callback);

      const actual2 = container.get(ICallback);
      expect(actual2).to.be.instanceof(Callback);

      expect(callback.getCalls().length).to.equal(2);

      expect(actual1).not.to.equal(actual2);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`InterfaceSymbol alias to transient registration returns a new instance each time`, () => {
      interface IAlias{}
      const IAlias = DI.createInterface<IAlias>().withDefault(x => x.aliasTo(ITransient));

      const actual1 = container.get(IAlias);
      expect(actual1).to.be.instanceof(Transient);

      const actual2 = container.get(IAlias);
      expect(actual2).to.be.instanceof(Transient);

      expect(actual1).not.to.equal(actual2);
    });

    it(`InterfaceSymbol alias to singleton registration returns the same instance each time`, () => {
      interface IAlias{}
      const IAlias = DI.createInterface<IAlias>().withDefault(x => x.aliasTo(ISingleton));

      const actual1 = container.get(IAlias);
      expect(actual1).to.be.instanceof(Singleton);

      const actual2 = container.get(IAlias);
      expect(actual2).to.be.instanceof(Singleton);

      expect(actual1).to.equal(actual2);
    });

    it(`InterfaceSymbol alias to instance registration returns the same instance each time`, () => {
      interface IAlias{}
      const IAlias = DI.createInterface<IAlias>().withDefault(x => x.aliasTo(IInstance));

      const actual1 = container.get(IAlias);
      expect(actual1).to.be.instanceof(Instance);

      const actual2 = container.get(IAlias);
      expect(actual2).to.be.instanceof(Instance);

      expect(actual1).to.equal(instance);
      expect(actual2).to.equal(instance);
    });

    // TODO: make test work
    it(`InterfaceSymbol alias to callback registration is invoked each time`, () => {
      interface IAlias{}
      const IAlias = DI.createInterface<IAlias>().withDefault(x => x.aliasTo(ICallback));

      const actual1 = container.get(IAlias);
      expect(actual1).to.be.instanceof(Callback);

      const actual2 = container.get(IAlias);
      expect(actual2).to.be.instanceof(Callback);

      expect(callback.getCalls().length).to.equal(2);

      expect(actual1).not.to.equal(actual2);
    });

    it(`string alias to transient registration returns a new instance each time`, () => {
      container.register(Registration.alias(ITransient, 'alias'))

      const actual1 = container.get('alias');
      expect(actual1).to.be.instanceof(Transient);

      const actual2 = container.get('alias');
      expect(actual2).to.be.instanceof(Transient);

      expect(actual1).not.to.equal(actual2);
    });

    it(`string alias to singleton registration returns the same instance each time`, () => {
      container.register(Registration.alias(ISingleton, 'alias'))

      const actual1 = container.get('alias');
      expect(actual1).to.be.instanceof(Singleton);

      const actual2 = container.get('alias');
      expect(actual2).to.be.instanceof(Singleton);

      expect(actual1).to.equal(actual2);
    });

    it(`string alias to instance registration returns the same instance each time`, () => {
      container.register(Registration.alias(IInstance, 'alias'))

      const actual1 = container.get('alias');
      expect(actual1).to.be.instanceof(Instance);

      const actual2 = container.get('alias');
      expect(actual2).to.be.instanceof(Instance);

      expect(actual1).to.equal(instance);
      expect(actual2).to.equal(instance);
    });

    it(`string alias to callback registration is invoked each time`, () => {
      container.register(Registration.alias(ICallback, 'alias'))

      const actual1 = container.get('alias');
      expect(actual1).to.be.instanceof(Callback);

      const actual2 = container.get('alias');
      expect(actual2).to.be.instanceof(Callback);

      expect(callback.getCalls().length).to.equal(2);

      expect(actual1).not.to.equal(actual2);
    });
  });

  describe('parent without inject decorator', () => {
    function decorator(): ClassDecorator { return (target: any) => target };
    interface IParent { dep: any; }
    let IParent: InterfaceSymbol<IParent>;

    function register(cls: any) {
      IParent = DI.createInterface<IParent>().withDefault(x => x.transient(cls));
    }

    it(`transient child registration throws`, () => {
      @decorator()
      class Parent implements IParent { constructor(public dep: ITransient) {} }
      register(Parent);

      expect(() => container.get(IParent)).to.throw(/5/);
    });

    it(`singleton child registration throws`, () => {
      @decorator()
      class Parent implements IParent { constructor(public dep: ISingleton) {} }
      register(Parent);

      expect(() => container.get(IParent)).to.throw(/5/);
    });

    it(`instance child registration throws`, () => {
      @decorator()
      class Parent implements IParent { constructor(public dep: IInstance) {} }
      register(Parent);

      expect(() => container.get(IParent)).to.throw(/5/);
    });

    it(`callback child registration throws`, () => {
      @decorator()
      class Parent implements IParent { constructor(public dep: ICallback) {} }
      register(Parent);

      expect(() => container.get(IParent)).to.throw(/5/);
    });
  });

  describe('transient parent', () => {
    interface ITransientParent { dep: any; }
    let ITransientParent: InterfaceSymbol<ITransientParent>;

    function register(cls: any) {
      ITransientParent = DI.createInterface<ITransientParent>().withDefault(x => x.transient(cls));
    }

    it(`transient child registration returns a new instance each time`, () => {
      @inject(ITransient)
      class TransientParent implements ITransientParent { constructor(public dep: ITransient) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      expect(actual1).to.be.instanceof(TransientParent);
      expect(actual1.dep).to.be.instanceof(Transient);

      const actual2 = container.get(ITransientParent);
      expect(actual2).to.be.instanceof(TransientParent);
      expect(actual2.dep).to.be.instanceof(Transient);

      expect(actual1).not.to.equal(actual2);

      expect(actual1.dep).not.to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(4);
    });

    it(`singleton child registration returns the same instance each time`, () => {
      @inject(ISingleton)
      class TransientParent implements ITransientParent { constructor(public dep: ISingleton) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      expect(actual1).to.be.instanceof(TransientParent);
      expect(actual1.dep).to.be.instanceof(Singleton);

      const actual2 = container.get(ITransientParent);
      expect(actual2).to.be.instanceof(TransientParent);
      expect(actual2.dep).to.be.instanceof(Singleton);

      expect(actual1).not.to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(4);
    });

    it(`instance child registration returns the same instance each time`, () => {
      @inject(IInstance)
      class TransientParent implements ITransientParent { constructor(public dep: IInstance) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      expect(actual1).to.be.instanceof(TransientParent);
      expect(actual1.dep).to.be.instanceof(Instance);

      const actual2 = container.get(ITransientParent);
      expect(actual2).to.be.instanceof(TransientParent);
      expect(actual2.dep).to.be.instanceof(Instance);

      expect(actual1).not.to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(4);
    });

    it(`callback child registration is invoked each time`, () => {
      @inject(ICallback)
      class TransientParent implements ITransientParent { constructor(public dep: ICallback) {} }
      register(TransientParent);

      const actual1 = container.get(ITransientParent);
      expect(actual1).to.be.instanceof(TransientParent);
      expect(actual1.dep).to.be.instanceof(Callback);

      const actual2 = container.get(ITransientParent);
      expect(actual2).to.be.instanceof(TransientParent);
      expect(actual2.dep).to.be.instanceof(Callback);

      expect(callback.getCalls().length).to.equal(2);

      expect(actual1).not.to.equal(actual2);
      expect(actual1.dep).not.to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(4);
    });
  });

  describe('singleton parent', () => {
    interface ISingletonParent { dep: any; }
    let ISingletonParent: InterfaceSymbol<ISingletonParent>;

    function register(cls: any) {
      ISingletonParent = DI.createInterface<ISingletonParent>().withDefault(x => x.singleton(cls));
    }

    it(`transient child registration is reused by the singleton parent`, () => {
      @inject(ITransient)
      class SingletonParent implements ISingletonParent { constructor(public dep: ITransient) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      expect(actual1).to.be.instanceof(SingletonParent);
      expect(actual1.dep).to.be.instanceof(Transient);

      const actual2 = container.get(ISingletonParent);
      expect(actual2).to.be.instanceof(SingletonParent);
      expect(actual2.dep).to.be.instanceof(Transient);

      expect(actual1).to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(3);
    });

    it(`singleton registration is reused by the singleton parent`, () => {
      @inject(ISingleton)
      class SingletonParent implements ISingletonParent { constructor(public dep: ISingleton) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      expect(actual1).to.be.instanceof(SingletonParent);
      expect(actual1.dep).to.be.instanceof(Singleton);

      const actual2 = container.get(ISingletonParent);
      expect(actual2).to.be.instanceof(SingletonParent);
      expect(actual2.dep).to.be.instanceof(Singleton);

      expect(actual1).to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(3);
    });

    it(`instance registration is reused by the singleton parent`, () => {
      @inject(IInstance)
      class SingletonParent implements ISingletonParent { constructor(public dep: IInstance) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      expect(actual1).to.be.instanceof(SingletonParent);
      expect(actual1.dep).to.be.instanceof(Instance);

      const actual2 = container.get(ISingletonParent);
      expect(actual2).to.be.instanceof(SingletonParent);
      expect(actual2.dep).to.be.instanceof(Instance);

      expect(actual1).to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(3);
    });

    it(`callback registration is reused by the singleton parent`, () => {
      @inject(ICallback)
      class SingletonParent implements ISingletonParent { constructor(public dep: ICallback) {} }
      register(SingletonParent);

      const actual1 = container.get(ISingletonParent);
      expect(actual1).to.be.instanceof(SingletonParent);
      expect(actual1.dep).to.be.instanceof(Callback);

      const actual2 = container.get(ISingletonParent);
      expect(actual2).to.be.instanceof(SingletonParent);
      expect(actual2.dep).to.be.instanceof(Callback);

      expect(callback.getCalls().length).to.equal(1);

      expect(actual1).to.equal(actual2);
      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(3);
    });
  });

  describe('instance parent', () => {
    interface IInstanceParent { dep: any; }
    let IInstanceParent: InterfaceSymbol<IInstanceParent>;
    let instanceParent: IInstanceParent;

    function register(cls: any) {
      instanceParent = container.get(cls);
      get.resetHistory();
      IInstanceParent = DI.createInterface<IInstanceParent>().withDefault(x => x.instance(instanceParent));
    }

    it(`transient registration is reused by the instance parent`, () => {
      @inject(ITransient)
      class InstanceParent implements IInstanceParent { constructor(public dep: ITransient) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      expect(actual1).to.be.instanceof(InstanceParent);
      expect(actual1.dep).to.be.instanceof(Transient);

      const actual2 = container.get(IInstanceParent);
      expect(actual2).to.be.instanceof(InstanceParent);
      expect(actual2.dep).to.be.instanceof(Transient);

      expect(actual1).to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`singleton registration is reused by the instance parent`, () => {
      @inject(ISingleton)
      class InstanceParent implements IInstanceParent { constructor(public dep: ISingleton) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      expect(actual1).to.be.instanceof(InstanceParent);
      expect(actual1.dep).to.be.instanceof(Singleton);

      const actual2 = container.get(IInstanceParent);
      expect(actual2).to.be.instanceof(InstanceParent);
      expect(actual2.dep).to.be.instanceof(Singleton);

      expect(actual1).to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`instance registration is reused by the instance parent`, () => {
      @inject(IInstance)
      class InstanceParent implements IInstanceParent { constructor(public dep: IInstance) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      expect(actual1).to.be.instanceof(InstanceParent);
      expect(actual1.dep).to.be.instanceof(Instance);

      const actual2 = container.get(IInstanceParent);
      expect(actual2).to.be.instanceof(InstanceParent);
      expect(actual2.dep).to.be.instanceof(Instance);

      expect(actual1).to.equal(actual2);

      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(2);
    });

    it(`callback registration is reused by the instance parent`, () => {
      @inject(ICallback)
      class InstanceParent implements IInstanceParent { constructor(public dep: ICallback) {} }
      register(InstanceParent);

      const actual1 = container.get(IInstanceParent);
      expect(actual1).to.be.instanceof(InstanceParent);
      expect(actual1.dep).to.be.instanceof(Callback);

      const actual2 = container.get(IInstanceParent);
      expect(actual2).to.be.instanceof(InstanceParent);
      expect(actual2.dep).to.be.instanceof(Callback);

      expect(callback.getCalls().length).to.equal(1);

      expect(actual1).to.equal(actual2);
      expect(actual1.dep).to.equal(actual2.dep);

      expect(get.getCalls().length).to.equal(2);
    });
  });
});

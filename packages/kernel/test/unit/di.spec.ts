import { Resolver, Factory, fallbackInvoker } from './../../src/di';
import { spy } from 'sinon';
import { DI, Container, PLATFORM, IContainer, IDefaultableInterfaceSymbol, ResolverStrategy, inject, invokeWithDynamicDependencies, classInvokers, Registration } from "../../src";
import { expect } from "chai";
import { _ } from "./util";
import * as sinon from 'sinon';

function assertIsMutableArray(arr: any[], length: number): void {
  expect(Array.isArray(arr)).to.be.true;
  expect(arr instanceof Array).to.be.true;
  expect(arr).not.to.equal(PLATFORM.emptyArray);
  expect(arr.length).to.equal(length);
  arr.push(null);
  expect(arr.length).to.equal(length + 1);
  arr.pop();
  expect(arr.length).to.equal(length);
}

function decorator(): ClassDecorator { return (target: any) => target; }

describe(`The DI object`, () => {
  describe(`createContainer()`, () => {
    it(`returns an instance of Container`, () => {
      const actual = DI.createContainer();
      expect(actual).to.be.instanceof(Container);
    });

    it(`returns a new container every time`, () => {
      expect(DI.createContainer()).not.to.equal(DI.createContainer());
    });
  });

  describe(`getDesignParamTypes()`, () => {
    it(`returns PLATFORM.emptyArray if the class has no constructor or decorators`, () => {
      class Foo {}
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });
    it(`returns PLATFORM.emptyArray if the class has a decorator but no constructor`, () => {
      @decorator()
      class Foo {}
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class has no constructor args or decorators`, () => {
      class Foo { constructor() {} }
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class has constructor args but no decorators`, () => {
      class Bar {}
      class Foo { constructor(public bar: Bar) {} }
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class has constructor args and the decorator is applied via a function call`, () => {
      class Bar {}
      class Foo { constructor(public bar: Bar) {} }
      decorator()(Foo)
      const actual = DI.getDesignParamTypes(Foo);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class is declared as an anonymous variable, even if it has ctor args and decorator is applied properly`, () => {
      class Bar {}
      @decorator()
      const FooInline = class{ constructor(public bar: Bar) {} }
      const actual = DI.getDesignParamTypes(FooInline);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    it(`returns PLATFORM.emptyArray if the class is declared as a named variable, even if it has ctor args and decorator is applied properly`, () => {
      class Bar {}
      @decorator()
      const FooInline = class Foo{ constructor(public bar: Bar) {} }
      const actual = DI.getDesignParamTypes(FooInline);
      expect(actual).to.equal(PLATFORM.emptyArray);
    });

    describe(`returns an empty array if the class has a decorator but no constructor args`, () => {
      @decorator()
      class Foo { constructor() {} }

      it(_`${Foo}`, () => {
        const actual = DI.getDesignParamTypes(Foo);
        assertIsMutableArray(actual, 0);
      });


      it(_`${class{}}`, () => {
        let cls;
        function anonDecorator(): ClassDecorator { return (target: any) => cls = target; }
        @anonDecorator()
        class{ constructor() {} };
        const actual = DI.getDesignParamTypes(cls);
        assertIsMutableArray(actual, 0);
      });
    });

    describe(`falls back to Object for declarations that cannot be statically analyzed`, () => {
      interface argCtor{}
      for (const argCtor of <any[]>[
        class Bar{},
        function(){},
        ()=>{},
        class{},
        {},
        Error,
        Array,
        (class Bar{}).prototype,
        (class Bar{}).prototype.constructor
      ]) {
        @decorator()
        class FooDecoratorInvocation{ constructor(public arg: argCtor){} }

        it(_`${FooDecoratorInvocation} { constructor(${argCtor}) }`, () => {
          const actual = DI.getDesignParamTypes(FooDecoratorInvocation);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @(<any>decorator)
        class FooDecoratorNonInvocation{ constructor(public arg: argCtor){} }

        it(_`${FooDecoratorNonInvocation} { constructor(${argCtor}) }`, () => {
          const actual = DI.getDesignParamTypes(FooDecoratorInvocation);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });
      }
    });

    describe(`falls back to Object for mismatched declarations`, () => {

      // Technically we're testing TypeScript here, but it's still useful to have an in-place fixture to validate our assumptions
      // And also to have an alert mechanism for when the functionality in TypeScript changes, without having to read the changelogs

      // What we're verifying here is under which circumstances a function object will or won't be properly resolved as a
      // designParamType, and it seems like the presence of a same-name interface actually breaks this in some situations

      // Note: the order of declaration (interface first or other thing first) doesn't seem to matter here
      // But whether or not there is a direct type cast, does seem to matter in the case of AnonClass (note the negative assertion)

      // It's unclear whether the difference between AnonClass (which works) and AnonClassInterface (which doesn't work) is a bug in TS or not,
      // but it has ramifications we need to keep in mind.

      interface Bar {}
      class Bar{}

      interface AnonClass {}
      const AnonClass = class{};

      interface AnonClassInterface {}
      const AnonClassInterface: AnonClassInterface = class{};

      interface VarFunc {}
      const VarFunc = function(){};

      interface VarFuncInterface {}
      const VarFuncInterface: VarFuncInterface = function(){};

      interface Func {}
      function Func(){}

      interface Arrow {}
      const Arrow = () => {};

      interface ArrowInterface {}
      const ArrowInterface: ArrowInterface = () => {};

      describe(`decorator invocation`, () => {
        @decorator()
        class FooBar{ constructor(public arg: Bar){} }

        // Note: this is a negative assertion meant to make it easier to compare this describe with the one below
        it(_`NOT ${FooBar} { constructor(public ${Bar}) }`, () => {
          const actual = DI.getDesignParamTypes(FooBar);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Bar);
        });

        @decorator()
        class FooAnonClass{ constructor(public arg: AnonClass){} }

        // Note: this is a negative assertion meant to make it easier to compare this describe with the one below
        it(_`NOT ${FooAnonClass} { constructor(public ${AnonClass}) }`, () => {
          const actual = DI.getDesignParamTypes(FooAnonClass);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(AnonClass);
        });

        @decorator()
        class FooAnonClassInterface{ constructor(public arg: AnonClassInterface){} }

        // this one is particularly interesting..
        it(_`${FooAnonClassInterface} { constructor(public ${AnonClassInterface}) }`, () => {
          const actual = DI.getDesignParamTypes(FooAnonClassInterface);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooVarFunc{ constructor(public arg: VarFunc){} }

        it(_`${FooVarFunc} { constructor(public ${VarFunc}) }`, () => {
          const actual = DI.getDesignParamTypes(FooVarFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooVarFuncInterface{ constructor(public arg: VarFuncInterface){} }

        it(_`${FooVarFuncInterface} { constructor(public ${VarFuncInterface}) }`, () => {
          const actual = DI.getDesignParamTypes(FooVarFuncInterface);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooFunc{ constructor(public arg: Func){} }

        it(_`${FooFunc} { constructor(public ${Func}) }`, () => {
          const actual = DI.getDesignParamTypes(FooFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooArrow{ constructor(public arg: Arrow){} }

        it(_`${FooArrow} { constructor(public ${Arrow}) }`, () => {
          const actual = DI.getDesignParamTypes(FooArrow);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });

        @decorator()
        class FooArrowInterface{ constructor(public arg: ArrowInterface){} }

        it(_`${FooArrowInterface} { constructor(public ${ArrowInterface}) }`, () => {
          const actual = DI.getDesignParamTypes(FooArrowInterface);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Object);
        });
      });
    });

    describe(`returns the correct types for valid declarations`, () => {
      class Bar{}

      const AnonClass = class{};

      const VarFunc = function(){};

      function Func(){}

      const Arrow = () => {};

      describe(`decorator invocation`, () => {
        @decorator()
        class FooBar{ constructor(public arg: Bar){} }

        it(_`${FooBar} { constructor(public ${Bar}) }`, () => {
          const actual = DI.getDesignParamTypes(FooBar);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Bar);
        });

        @decorator()
        class FooAnonClass{ constructor(public arg: AnonClass){} }

        it(_`${FooAnonClass} { constructor(public ${AnonClass}) }`, () => {
          const actual = DI.getDesignParamTypes(FooAnonClass);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(AnonClass);
        });

        @decorator()
        class FooVarFunc{ constructor(public arg: VarFunc){} }

        it(_`${FooVarFunc} { constructor(public ${VarFunc}) }`, () => {
          const actual = DI.getDesignParamTypes(FooVarFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(VarFunc);
        });

        @decorator()
        class FooFunc{ constructor(public arg: Func){} }

        it(_`${FooFunc} { constructor(public ${Func}) }`, () => {
          const actual = DI.getDesignParamTypes(FooFunc);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Func);
        });

        @decorator()
        class FooArrow{ constructor(public arg: Arrow){} }

        it(_`${FooArrow} { constructor(public ${Arrow}) }`, () => {
          const actual = DI.getDesignParamTypes(FooArrow);
          assertIsMutableArray(actual, 1);
          expect(actual[0]).to.equal(Arrow);
        });
      });
    });
  });

  describe(`getDependencies()`, () => {
    let getDesignParamTypes: ReturnType<typeof spy>;

    beforeEach(() => {
      getDesignParamTypes = spy(DI, 'getDesignParamTypes');
    });
    afterEach(() => {
      getDesignParamTypes.restore();
    });

    it(`uses getDesignParamTypes() if the static inject property does not exist`, () => {
      class Bar {}
      @decorator()
      class Foo{ constructor(bar: Bar){} }
      const actual = DI.getDependencies(Foo);
      expect(getDesignParamTypes).to.have.been.calledWith(Foo);
      expect(actual).to.deep.equal([Bar]);
    });

    it(`uses getDesignParamTypes() if the static inject property is undefined`, () => {
      class Bar {}
      @decorator()
      class Foo{ static inject = undefined; constructor(bar: Bar){} }
      const actual = DI.getDependencies(Foo);
      expect(getDesignParamTypes).to.have.been.calledWith(Foo);
      expect(actual).to.deep.equal([Bar]);
    });

    it(`throws when inject is not an array`, () => {
      class Bar {}
      class Foo{ static inject = Bar; }
      expect(() => DI.getDependencies(Foo)).to.throw();
      expect(getDesignParamTypes).not.to.have.been.called;
    });

    for (const deps of [
      [class Bar{}],
      [class Bar{}, class Bar{}],
      [undefined],
      [null],
      [42]
    ]) {
      it(_`returns a copy of the inject array ${deps}`, () => {
        class Foo{ static inject = deps.slice(); }
        const actual = DI.getDependencies(Foo);
        expect(getDesignParamTypes).not.to.have.been.called;
        expect(actual).to.deep.equal(deps);
        expect(actual).not.to.equal(Foo.inject);
      });
    }

    for (const deps of [
      [class Bar{}],
      [class Bar{}, class Bar{}],
      [undefined],
      [null],
      [42]
    ]) {
      it(_`traverses the 2-layer prototype chain for inject array ${deps}`, () => {
        class Foo{ static inject = deps.slice(); }
        class Bar extends Foo{ static inject = deps.slice(); }
        const actual = DI.getDependencies(Bar);
        expect(getDesignParamTypes).not.to.have.been.called;
        expect(actual).to.deep.equal([...deps, ...deps]);
        expect(actual).not.to.equal(Foo.inject);
        expect(actual).not.to.equal(Bar.inject);
      });

      it(_`traverses the 3-layer prototype chain for inject array ${deps}`, () => {
        class Foo{ static inject = deps.slice(); }
        class Bar extends Foo{ static inject = deps.slice(); }
        class Baz extends Bar{ static inject = deps.slice(); }
        const actual = DI.getDependencies(Baz);
        expect(getDesignParamTypes).not.to.have.been.called;
        expect(actual).to.deep.equal([...deps, ...deps, ...deps]);
        expect(actual).not.to.equal(Foo.inject);
        expect(actual).not.to.equal(Bar.inject);
        expect(actual).not.to.equal(Baz.inject);
      });

      it(_`traverses the 1-layer + 2-layer prototype chain (with gap) for inject array ${deps}`, () => {
        class Foo{ static inject = deps.slice(); }
        class Bar extends Foo{ }
        class Baz extends Bar{ static inject = deps.slice(); }
        class Qux extends Baz{ static inject = deps.slice(); }
        const actual = DI.getDependencies(Qux);
        expect(getDesignParamTypes).not.to.have.been.called;
        expect(actual).to.deep.equal([...deps, ...deps, ...deps]);
        expect(actual).not.to.equal(Foo.inject);
        expect(actual).not.to.equal(Baz.inject);
        expect(actual).not.to.equal(Qux.inject);
      });
    }

  });

  describe(`createInterface()`, () => {
    it(`returns a function that has withDefault and noDefault functions`, () => {
      const sut = DI.createInterface();
      expect(typeof sut).to.equal('function');
      expect(typeof sut.withDefault).to.equal('function');
      expect(typeof sut.noDefault).to.equal('function');
    });

    it(`noDefault returns self`, () => {
      const sut = DI.createInterface();
      expect(sut.noDefault()).to.equal(sut);
    });

    it(`withDefault returns self with modified withDefault that throws`, () => {
      const sut = DI.createInterface();
      const sut2 = sut.withDefault(<any>null);
      expect(sut).to.equal(sut2);
      expect(() => sut.withDefault(<any>null)).to.throw;
    });

    describe(`withDefault returns self with register function that registers the appropriate resolver`, () => {
      let sut: IDefaultableInterfaceSymbol<any>;
      let container: IContainer;

      let registerResolver: ReturnType<typeof spy>;

      beforeEach(() => {
        sut = DI.createInterface();
        container = new Container();
        registerResolver = spy(container, 'registerResolver');
      });

      afterEach(() => {
        registerResolver.restore();
      });

      function matchResolver(key: any, strategy: any, state: any): sinon.SinonMatcher {
        return sinon.match(val => val.key === key && val.strategy === strategy && val.state === state);
      }

      it(`instance without key`, () => {
        const value = {};
        sut.withDefault(builder => builder.instance(value));
        (<any>sut).register(container);
        expect(registerResolver).to.have.been.calledWith(sut, matchResolver(sut, ResolverStrategy.instance, value));
      });

      it(`instance with key`, () => {
        const value = {};
        sut.withDefault(builder => builder.instance(value));
        (<any>sut).register(container, 'key');
        expect(registerResolver).to.have.been.calledWith('key', matchResolver('key', ResolverStrategy.instance, value));
      });

      it(`singleton without key`, () => {
        class Foo {}
        sut.withDefault(builder => builder.singleton(Foo));
        (<any>sut).register(container);
        expect(registerResolver).to.have.been.calledWith(sut, matchResolver(sut, ResolverStrategy.singleton, Foo));
      });

      it(`singleton with key`, () => {
        class Foo {}
        sut.withDefault(builder => builder.singleton(Foo));
        (<any>sut).register(container, 'key');
        expect(registerResolver).to.have.been.calledWith('key', matchResolver('key', ResolverStrategy.singleton, Foo));
      });

      it(`transient without key`, () => {
        class Foo {}
        sut.withDefault(builder => builder.transient(Foo));
        (<any>sut).register(container);
        expect(registerResolver).to.have.been.calledWith(sut, matchResolver(sut, ResolverStrategy.transient, Foo));
      });

      it(`transient with key`, () => {
        class Foo {}
        sut.withDefault(builder => builder.transient(Foo));
        (<any>sut).register(container, 'key');
        expect(registerResolver).to.have.been.calledWith('key', matchResolver('key', ResolverStrategy.transient, Foo));
      });

      it(`callback without key`, () => {
        const callback = () => {};
        sut.withDefault(builder => builder.callback(callback));
        (<any>sut).register(container);
        expect(registerResolver).to.have.been.calledWith(sut, matchResolver(sut, ResolverStrategy.callback, callback));
      });

      it(`callback with key`, () => {
        const callback = () => {};
        sut.withDefault(builder => builder.callback(callback));
        (<any>sut).register(container, 'key');
        expect(registerResolver).to.have.been.calledWith('key', matchResolver('key', ResolverStrategy.callback, callback));
      });

      it(`aliasTo without key`, () => {
        sut.withDefault(builder => builder.aliasTo('key2'));
        (<any>sut).register(container);
        expect(registerResolver).to.have.been.calledWith(sut, matchResolver(sut, ResolverStrategy.alias, 'key2'));
      });

      it(`aliasTo with key`, () => {
        sut.withDefault(builder => builder.aliasTo('key2'));
        (<any>sut).register(container, 'key1');
        expect(registerResolver).to.have.been.calledWith('key1', matchResolver('key1', ResolverStrategy.alias, 'key2'));
      });
    });
  });
});

describe(`The inject decorator`, () => {
  class Dep1{}
  class Dep2{}
  class Dep3{}

  it(`can decorate classes with explicit dependencies`, () => {
    @inject(Dep1, Dep2, Dep3)
    class Foo {}

    expect(Foo['inject']).to.deep.equal([Dep1, Dep2, Dep3]);
  });

  it(`can decorate classes with implicit dependencies`, () => {
    @inject()
    class Foo { constructor(dep1: Dep1, dep2: Dep2, dep3: Dep3){} }

    expect(Foo['inject']).to.deep.equal([Dep1, Dep2, Dep3]);
  });

  it(`can decorate constructor parameters explicitly`, () => {
    class Foo { constructor(@inject(Dep1)dep1, @inject(Dep2)dep2, @inject(Dep3)dep3){} }

    expect(Foo['inject']).to.deep.equal([Dep1, Dep2, Dep3]);
  });

  it(`can decorate constructor parameters implicitly`, () => {
    class Foo { constructor(@inject() dep1: Dep1, @inject() dep2: Dep2, @inject() dep3: Dep3){} }

    expect(Foo['inject']).to.deep.equal([Dep1, Dep2, Dep3]);
  });

  it(`can decorate properties explicitly`, () => {
    class Foo { @inject(Dep1)dep1; @inject(Dep2)dep2; @inject(Dep3)dep3; }

    expect(Foo['inject'].dep1).to.equal(Dep1);
    expect(Foo['inject'].dep2).to.equal(Dep2);
    expect(Foo['inject'].dep3).to.equal(Dep3);
  });

  it(`cannot decorate properties implicitly`, () => {
    class Foo { @inject()dep1: Dep1; @inject()dep2: Dep2; @inject()dep3: Dep3; }

    expect(Foo['inject'].dep1).to.be.undefined;
    expect(Foo['inject'].dep2).to.be.undefined;
    expect(Foo['inject'].dep3).to.be.undefined;
  });
});

describe(`The Resolver class`, () => {
  let container: IContainer;
  let registerResolver: ReturnType<typeof spy>;

  beforeEach(() => {
    container = new Container();
    registerResolver = spy(container, 'registerResolver');
  });

  afterEach(() => {
    registerResolver.restore();
  });

  describe(`register()`, () => {
    it(`registers the resolver to the container with the provided key`, () => {
      const sut = new Resolver('foo', 0, null);
      sut.register(container, 'bar');
      expect(registerResolver).to.have.been.calledWith('bar', sut);
    })

    it(`registers the resolver to the container with its own`, () => {
      const sut = new Resolver('foo', 0, null);
      sut.register(container);
      expect(registerResolver).to.have.been.calledWith('foo', sut);
    })
  });

  describe(`resolve()`, () => {
    it(`instance - returns state`, () => {
      const state = {};
      const sut = new Resolver('foo', ResolverStrategy.instance, state);
      const actual = sut.resolve(container, container);
      expect(actual).to.equal(state);
    });

    it(`singleton - returns an instance of the type and sets strategy to instance`, () => {
      class Foo {}
      const sut = new Resolver('foo', ResolverStrategy.singleton, Foo);
      const actual = sut.resolve(container, container);
      expect(actual).to.be.instanceof(Foo);

      const actual2 = sut.resolve(container, container);
      expect(actual2).to.equal(actual);
    });

    it(`transient - always returns a new instance of the type`, () => {
      class Foo {}
      const sut = new Resolver('foo', ResolverStrategy.transient, Foo);
      const actual1 = sut.resolve(container, container);
      expect(actual1).to.be.instanceof(Foo);

      const actual2 = sut.resolve(container, container);
      expect(actual2).to.be.instanceof(Foo);
      expect(actual2).not.to.equal(actual1);
    });

    it(`array - calls resolve() on the first item in the state array`, () => {
      const resolver = { resolve: spy() };
      const sut = new Resolver('foo', ResolverStrategy.array, [resolver]);
      sut.resolve(container, container);
      expect(resolver.resolve).to.have.been.calledWith(container, container);
    });

    it(`throws for unknown strategy`, () => {
      const sut = new Resolver('foo', -1, null);
      expect(() => sut.resolve(container, container)).to.throw(/6/);
    });
  });

  describe(`getFactory()`, () => {
    it(`returns a new singleton Factory if it does not exist`, () => {
      class Foo{}
      const sut = new Resolver(Foo, ResolverStrategy.singleton, Foo);
      const actual = sut.getFactory(container);
      expect(actual).to.be.instanceof(Factory);
      expect(actual.type).to.equal(Foo);;
    });

    it(`returns a new transient Factory if it does not exist`, () => {
      class Foo{}
      const sut = new Resolver(Foo, ResolverStrategy.transient, Foo);
      const actual = sut.getFactory(container);
      expect(actual).to.be.instanceof(Factory);
      expect(actual.type).to.equal(Foo);
    });

    it(`returns a null for instance strategy`, () => {
      class Foo{}
      const sut = new Resolver(Foo, ResolverStrategy.instance, Foo);
      const actual = sut.getFactory(container);
      expect(actual).to.be.null;
    });

    it(`returns a null for array strategy`, () => {
      class Foo{}
      const sut = new Resolver(Foo, ResolverStrategy.array, Foo);
      const actual = sut.getFactory(container);
      expect(actual).to.be.null;
    });

    it(`returns a null for alias strategy`, () => {
      class Foo{}
      const sut = new Resolver(Foo, ResolverStrategy.alias, Foo);
      const actual = sut.getFactory(container);
      expect(actual).to.be.null;
    });

    it(`returns a null for callback strategy`, () => {
      class Foo{}
      const sut = new Resolver(Foo, ResolverStrategy.callback, Foo);
      const actual = sut.getFactory(container);
      expect(actual).to.be.null;
    });
  });
});

describe(`The Factory class`, () => {

  describe(`create()`, () => {
    for (const count of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      it(`returns a new Factory with ${count} deps`, () => {
        class Bar{}
        class Foo{static inject=Array(count).map(c => Bar)}
        const actual = Factory.create(Foo);
        expect(actual).to.be.instanceof(Factory);
        expect(actual.type).to.equal(Foo);
        if (count < 6) {
          expect(actual['invoker']).to.equal(classInvokers[count]);
        } else {
          expect(actual['invoker']).to.equal(fallbackInvoker);
        }
        expect(actual['dependencies']).not.to.equal(Foo.inject);
        expect(actual['dependencies']).to.deep.equal(Foo.inject);
      });
    }
  });

  describe(`construct()`, () => {
    for (const staticCount of [0, 1, 2, 3, 4, 5, 6, 7]) {
      for (const dynamicCount of [0, 1, 2]) {
        const container = new Container();
        it(`instantiates a type with ${staticCount} static deps and ${dynamicCount} dynamic deps`, () => {
          class Bar{}
          class Foo{args:any[];constructor(...args:any[]){this.args=args}static inject=Array(staticCount).fill(Bar)}
          const sut = Factory.create(Foo);
          const dynamicDeps = dynamicCount ? Array(dynamicCount).fill({}) : undefined;

          const actual = sut.construct(container, dynamicDeps);

          for (let i = 0, ii = Foo.inject.length; i < ii; ++i) {
            expect(actual.args[i]).to.be.instanceof(Foo.inject[i]);
          }
          for (let i = 0, ii = dynamicDeps ? dynamicDeps.length : 0; i < ii; ++i) {
            expect(actual.args[Foo.inject.length+i]).to.equal(dynamicDeps[i]);
          }
        });
      }
    }
  });

  describe(`registerTransformer()`, () => {
    it(`registers the transformer`, () => {
      const container = new Container();
      class Foo{bar;baz}
      const sut = Factory.create(Foo);
      sut.registerTransformer(foo => Object.assign(foo, { bar: 1 }));
      sut.registerTransformer(foo => Object.assign(foo, { baz: 2 }));
      const foo = sut.construct(container);
      expect(foo.bar).to.equal(1);
      expect(foo.baz).to.equal(2);
      expect(foo).to.be.instanceof(Foo);
    });
  });

});

describe(`The Container class`, () => {
  let sut: IContainer;

  beforeEach(() => {
    sut = new Container();
  });

  describe(`register()`, () => {
    let register: ReturnType<typeof spy>;

    beforeEach(() => {
      register = spy();
    });

    it(_`calls register() on {register}`, () => {
      sut.register({register});
      expect(register).to.have.been.calledWith(sut);
    })

    it(_`calls register() on {register},{register}`, () => {
      sut.register({register},{register});
      expect(register).to.have.been.calledWith(sut);
      expect(register.getCalls().length).to.equal(2);
    })

    it(_`calls register() on [{register},{register}]`, () => {
      sut.register(<any>[{register},{register}]);
      expect(register).to.have.been.calledWith(sut);
      expect(register.getCalls().length).to.equal(2);
    })

    it(_`calls register() on {foo:{register}}`, () => {
      sut.register({foo:{register}});
      expect(register).to.have.been.calledWith(sut);
    })

    it(_`calls register() on {foo:{register}},{foo:{register}}`, () => {
      sut.register({foo:{register}},{foo:{register}});
      expect(register).to.have.been.calledWith(sut);
      expect(register.getCalls().length).to.equal(2);
    })

    it(_`calls register() on [{foo:{register}},{foo:{register}}]`, () => {
      sut.register(<any>[{foo:{register}},{foo:{register}}]);
      expect(register).to.have.been.calledWith(sut);
      expect(register.getCalls().length).to.equal(2);
    })

    it(_`calls register() on {register},{foo:{register}}`, () => {
      sut.register({register},{foo:{register}});
      expect(register).to.have.been.calledWith(sut);
      expect(register.getCalls().length).to.equal(2);
    })

    it(_`calls register() on [{register},{foo:{register}}]`, () => {
      sut.register(<any>[{register},{foo:{register}}]);
      expect(register).to.have.been.calledWith(sut);
      expect(register.getCalls().length).to.equal(2);
    })

    it(_`calls register() on [{register},{}]`, () => {
      sut.register(<any>[{register},{}]);
      expect(register).to.have.been.calledWith(sut);
    })

    it(_`calls register() on [{},{register}]`, () => {
      sut.register(<any>[{},{register}]);
      expect(register).to.have.been.calledWith(sut);
    })

    it(_`calls register() on [{foo:{register}},{foo:{}}]`, () => {
      sut.register(<any>[{foo:{register}},{foo:{}}]);
      expect(register).to.have.been.calledWith(sut);
    })

    it(_`calls register() on [{foo:{}},{foo:{register}}]`, () => {
      sut.register(<any>[{foo:{}},{foo:{register}}]);
      expect(register).to.have.been.calledWith(sut);
    })
  });

  describe(`registerResolver()`, () => {
    for (const key of [null, undefined, Object]) {
      it(_`throws on invalid key ${key}`, () => {
        expect(() => sut.registerResolver(key, <any>null)).to.throw(/5/);
      });
    }

    it(`registers the resolver if it does not exist yet`, () => {
      const key = {};
      const resolver = new Resolver(key, ResolverStrategy.instance, {});
      sut.registerResolver(key, resolver);
      const actual = sut.getResolver(key);
      expect(actual).to.equal(resolver);
    });

    it(`changes to array resolver if the key already exists`, () => {
      const key = {};
      const resolver1 = new Resolver(key, ResolverStrategy.instance, {});
      const resolver2 = new Resolver(key, ResolverStrategy.instance, {});
      sut.registerResolver(key, resolver1);
      const actual1 = sut.getResolver(key);
      expect(actual1).to.equal(resolver1);
      sut.registerResolver(key, resolver2);
      const actual2 = sut.getResolver(key);
      expect(actual2).not.to.equal(actual1);
      expect(actual2).not.to.equal(resolver1);
      expect(actual2).not.to.equal(resolver2);
      expect(actual2['strategy']).to.equal(ResolverStrategy.array);
      expect(actual2['state'][0]).to.equal(resolver1);
      expect(actual2['state'][1]).to.equal(resolver2);
    });

    it(`appends to the array resolver if the key already exists more than once`, () => {
      const key = {};
      const resolver1 = new Resolver(key, ResolverStrategy.instance, {});
      const resolver2 = new Resolver(key, ResolverStrategy.instance, {});
      const resolver3 = new Resolver(key, ResolverStrategy.instance, {});
      sut.registerResolver(key, resolver1);
      sut.registerResolver(key, resolver2);
      sut.registerResolver(key, resolver3);
      const actual1 = sut.getResolver(key);
      expect(actual1['strategy']).to.equal(ResolverStrategy.array);
      expect(actual1['state'][0]).to.equal(resolver1);
      expect(actual1['state'][1]).to.equal(resolver2);
      expect(actual1['state'][2]).to.equal(resolver3);
    });
  });

  describe(`registerTransformer()`, () => {
    for (const key of [null, undefined, Object]) {
      it(_`throws on invalid key ${key}`, () => {
        expect(() => sut.registerTransformer(key, <any>null)).to.throw(/5/);
      });
    }

    it(`registers the transformer if it does not exist yet`, () => {

    });

    it(`reuses the existing transformer if it exists`, () => {

    });
  });

  describe(`getResolver()`, () => {
    for (const key of [null, undefined, Object]) {
      it(_`throws on invalid key ${key}`, () => {
        expect(() => sut.getResolver(key, <any>null)).to.throw(/5/);
      });
    }

  });

  describe(`has()`, () => {
    for (const key of [null, undefined, Object]) {
      it(_`returns false for non-existing key ${key}`, () => {
        expect(sut.has(<any>key, false)).to.be.false;
      });
    }
    it(`returns true for existing key`, () => {
      const key = {};
      sut.registerResolver(key, new Resolver(key, ResolverStrategy.instance, {}));
      expect(sut.has(<any>key, false)).to.be.true;
    });
  });

  describe(`get()`, () => {
    for (const key of [null, undefined, Object]) {
      it(_`throws on invalid key ${key}`, () => {
        expect(() => sut.get(key)).to.throw(/5/);
      });
    }

  });

  describe(`getAll()`, () => {
    for (const key of [null, undefined, Object]) {
      it(_`throws on invalid key ${key}`, () => {
        expect(() => sut.getAll(key)).to.throw(/5/);
      });
    }

  });

  describe(`getFactory()`, () => {
    for (const count of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      sut = new Container(); // ensure the state is reset (beforeEach doesn't know about loops)

      it(`returns a new Factory with ${count} deps if it does not exist`, () => {
        class Bar{}
        class Foo{static inject=Array(count).map(c => Bar)}
        const actual = sut.getFactory(Foo);
        expect(actual).to.be.instanceof(Factory);
        expect(actual.type).to.equal(Foo);
        if (count < 6) {
          expect(actual['invoker']).to.equal(classInvokers[count]);
        } else {
          expect(actual['invoker']).to.equal(fallbackInvoker);
        }
        expect(actual['dependencies']).not.to.equal(Foo.inject);
        expect(actual['dependencies']).to.deep.equal(Foo.inject);
      });
    }

    it(`reuses the existing factory if it already exists`, () => {
      const create = spy(Factory, 'create');
      class Foo{}
      const actual = sut.getFactory(Foo);
      expect(actual).to.be.instanceof(Factory);
      const actual2 = sut.getFactory(Foo);
      expect(actual).to.equal(actual2);
      expect(create).to.have.been.calledOnce;
      create.restore();
    });
  });

  describe(`createChild()`, () => {
    it(`creates a child with same config and sut as parent`, () => {
      const actual = sut.createChild();
      expect(actual['configuration']).to.equal(sut['configuration']);
      expect(actual['parent']).to.equal(sut);
      expect(sut['parent']).to.be.null
    });

  });

  describe(`jitRegister()`, () => {

  });

});

describe(`The Registration object`, () => {

  it(`instance() returns the correct resolver`, () => {
    const value = {};
    const actual = Registration.instance('key', value);
    expect(actual['key']).to.equal('key');
    expect(actual['strategy']).to.equal(ResolverStrategy.instance);
    expect(actual['state']).to.equal(value);
  });

  it(`singleton() returns the correct resolver`, () => {
    class Foo {}
    const actual = Registration.singleton('key', Foo);
    expect(actual['key']).to.equal('key');
    expect(actual['strategy']).to.equal(ResolverStrategy.singleton);
    expect(actual['state']).to.equal(Foo);
  });

  it(`transient() returns the correct resolver`, () => {
    class Foo {}
    const actual = Registration.transient('key', Foo);
    expect(actual['key']).to.equal('key');
    expect(actual['strategy']).to.equal(ResolverStrategy.transient);
    expect(actual['state']).to.equal(Foo);
  });

  it(`callback() returns the correct resolver`, () => {
    const callback = () => {};
    const actual = Registration.callback('key', callback);
    expect(actual['key']).to.equal('key');
    expect(actual['strategy']).to.equal(ResolverStrategy.callback);
    expect(actual['state']).to.equal(callback);
  });

  it(`alias() returns the correct resolver`, () => {
    const actual = Registration.alias('key', 'key2');
    expect(actual['key']).to.equal('key2');
    expect(actual['strategy']).to.equal(ResolverStrategy.alias);
    expect(actual['state']).to.equal('key');
  });
});

describe(`The classInvokers object`, () => {
  const container = <IContainer><any>{ get(t){ return new t(); } }
  class Foo { args: any[]; constructor(...args: any[]){ this.args = args; } }

  class Dep1{}
  class Dep2{}
  class Dep3{}
  class Dep4{}
  class Dep5{}
  class Dep6{}

  it(`invoke() handles 0 deps`, () => {
    const actual = classInvokers[0].invoke(container, Foo, []);
    expect(actual.args.length).to.equal(0);
  });

  it(`invoke() handles 1 dep`, () => {
    const actual = classInvokers[1].invoke(container, Foo, [Dep1]);
    expect(actual.args.length).to.equal(1);
    expect(actual.args[0]).to.be.instanceof(Dep1);
  });

  it(`invoke() handles 2 deps`, () => {
    const actual = classInvokers[2].invoke(container, Foo, [Dep1, Dep2]);
    expect(actual.args.length).to.equal(2);
    expect(actual.args[0]).to.be.instanceof(Dep1);
    expect(actual.args[1]).to.be.instanceof(Dep2);
  });

  it(`invoke() handles 3 deps`, () => {
    const actual = classInvokers[3].invoke(container, Foo, [Dep1, Dep2, Dep3]);
    expect(actual.args.length).to.equal(3);
    expect(actual.args[0]).to.be.instanceof(Dep1);
    expect(actual.args[1]).to.be.instanceof(Dep2);
    expect(actual.args[2]).to.be.instanceof(Dep3);
  });

  it(`invoke() handles 4 deps`, () => {
    const actual = classInvokers[4].invoke(container, Foo, [Dep1, Dep2, Dep3, Dep4]);
    expect(actual.args.length).to.equal(4);
    expect(actual.args[0]).to.be.instanceof(Dep1);
    expect(actual.args[1]).to.be.instanceof(Dep2);
    expect(actual.args[2]).to.be.instanceof(Dep3);
    expect(actual.args[3]).to.be.instanceof(Dep4);
  });

  it(`invoke() handles 5 deps`, () => {
    const actual = classInvokers[5].invoke(container, Foo, [Dep1, Dep2, Dep3, Dep4, Dep5]);
    expect(actual.args.length).to.equal(5);
    expect(actual.args[0]).to.be.instanceof(Dep1);
    expect(actual.args[1]).to.be.instanceof(Dep2);
    expect(actual.args[2]).to.be.instanceof(Dep3);
    expect(actual.args[3]).to.be.instanceof(Dep4);
    expect(actual.args[4]).to.be.instanceof(Dep5);
  });

  it(`invoke() does not handle 6 deps`, () => {
    expect(() => classInvokers[6].invoke(container, Foo, [Dep1, Dep2, Dep3, Dep4, Dep5, Dep6])).to.throw(/undefined/);
  });

});

describe(`The invokeWithDynamicDependencies function`, () => {
  const container = <IContainer><any>{ get(t){ return 'static'+t; } }
  class Foo { args: any[]; constructor(...args: any[]){ this.args = args; } }

  const deps = [class Dep1{}, class Dep2{}, class Dep3{}];

  it(_`throws when staticDeps is null`, () => {
    expect(() => invokeWithDynamicDependencies(container, Foo, null, [])).to.throw();
  });

  it(_`throws when any of the staticDeps is null`, () => {
    expect(() => invokeWithDynamicDependencies(container, Foo, [null], [])).to.throw(/7/);
  });

  it(_`throws when any of the staticDeps is undefined`, () => {
    expect(() => invokeWithDynamicDependencies(container, Foo, [undefined], [])).to.throw(/7/);
  });

  it(_`throws when staticDeps is undefined`, () => {
    expect(() => invokeWithDynamicDependencies(container, Foo, undefined, [])).to.throw();
  });

  it(_`handles staticDeps is ${deps}`, () => {
    const actual = <Foo>invokeWithDynamicDependencies(container, Foo, deps, []);
    expect(actual.args).to.deep.equal(deps.map(d => 'static'+d));
  });

  it(`handles dynamicDeps is null`, () => {
    const actual = <Foo>invokeWithDynamicDependencies(container, Foo, [], null);
    expect(actual.args.length).to.equal(1);
    expect(actual.args[0]).to.be.null;
  });

  it(`handles dynamicDeps is undefined`, () => {
    const actual = <Foo>invokeWithDynamicDependencies(container, Foo, [], undefined);
    expect(actual.args.length).to.equal(0);
  });

  it(_`handles dynamicDeps is ${deps}`, () => {
    const actual = <Foo>invokeWithDynamicDependencies(container, Foo, [], deps);
    expect(actual.args).to.deep.equal(deps);
  });

  it(_`handles staticDeps is ${deps} and dynamicDeps is ${deps}`, () => {
    const actual = <Foo>invokeWithDynamicDependencies(container, Foo, deps, deps);
    expect(actual.args[0]).to.equal('static'+deps[0]);
    expect(actual.args[1]).to.equal('static'+deps[1]);
    expect(actual.args[2]).to.equal('static'+deps[2]);
    expect(actual.args[3]).to.equal(deps[0]);
    expect(actual.args[4]).to.equal(deps[1]);
    expect(actual.args[5]).to.equal(deps[2]);
  });
});

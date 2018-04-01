import { registerDependency, inject, autoinject, singleton, transient } from '../../../ioc/runtime/decorators';
import { InjectorBuilder } from '../../../ioc/runtime/injector';
import { IInjector } from '../../../ioc/runtime/interfaces';

describe('registerDependency', () => {
  interface IFoo {}
  class Foo implements IFoo {}
  const IFoo = registerDependency('IFoo');
  let foo: Foo;
  let builder: InjectorBuilder;
  beforeEach(() => {
    foo = new Foo();
    builder = InjectorBuilder.create();
  });

  it('should return a correctly working parameterDecorator when registered to an instance by name', () => {
    class Bar{public foo:Foo;constructor(@IFoo foo:Foo){this.foo=foo;}}
    builder.register("IFoo").toInstance(foo);
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo).toBe(foo);
  });

  it('should return a correctly working parameterDecorator when registered to a type by name', () => {
    class Bar{public foo:Foo;constructor(@IFoo foo:Foo){this.foo=foo;}}
    builder.register("IFoo").toType(Foo);
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo instanceof Foo).toBe(true);
  });

  it('should return a correctly working parameterDecorator when registered to an instance by reference', () => {
    class Bar{public foo:Foo;constructor(@IFoo foo:Foo){this.foo=foo;}}
    builder.register(IFoo).toInstance(foo);
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo).toBe(foo);
  });

  it('should return a correctly working parameterDecorator when registered to a type by reference', () => {
    class Bar{public foo:Foo;constructor(@IFoo foo:Foo){this.foo=foo;}}
    builder.register(IFoo).toType(Foo);
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo instanceof Foo).toBe(true);
  });
});

describe('inject', () => {
  class Foo {}
  let foo: Foo;
  let builder: InjectorBuilder;
  beforeEach(() => {
    foo = new Foo();
    builder = InjectorBuilder.create();
  });

  it('should ensure a correct registration when there are no type parameters', () => {
    @inject(Foo)
    class Bar{public foo:Foo;constructor(foo:any){this.foo=foo;}}
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo instanceof Foo).toBe(true);
  });

  it('should fail when absent', () => {
    class Bar{public foo:Foo;constructor(foo:any){this.foo=foo;}}
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo).toBeUndefined();
  });
});

describe('autoinject', () => {
  class Foo {}
  let foo: Foo;
  let builder: InjectorBuilder;
  beforeEach(() => {
    foo = new Foo();
    builder = InjectorBuilder.create();
  });

  it('should ensure a correct registration when there are type parameters', () => {
    @autoinject()
    class Bar{public foo:Foo;constructor(foo:Foo){this.foo=foo;}}
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo instanceof Foo).toBe(true);
  });

  it('should fail when absent', () => {
    class Bar{public foo:Foo;constructor(foo:Foo){this.foo=foo;}}
    const actual = builder.build().getInstance<Bar>(Bar);
    expect(actual.foo).toBeUndefined();
  });
});

describe('transient', () => {
  class Foo {}
  @transient()
  class Bar{public foo:Foo;constructor(foo:Foo){this.foo=foo;}}
  let foo: Foo;
  let builder: InjectorBuilder;
  beforeEach(() => {
    foo = new Foo();
    builder = InjectorBuilder.create();
  });

  it('should ensure a new instance is created each time', () => {
    const injector = builder.build();
    const actual1 = injector.getInstance<Bar>(Bar);
    const actual2 = injector.getInstance<Bar>(Bar);
    expect(actual1).not.toBe(actual2);
  });
});

describe('singleton', () => {
  class Foo {}
  @singleton()
  class Bar{public foo:Foo;constructor(foo:Foo){this.foo=foo;}}
  let foo: Foo;
  let builder: InjectorBuilder;
  beforeEach(() => {
    foo = new Foo();
    builder = InjectorBuilder.create();
  });

  it('should ensure the same instance is reused', () => {
    const injector = builder.build();
    const actual1 = injector.getInstance<Bar>(Bar);
    const actual2 = injector.getInstance<Bar>(Bar);
    expect(actual1).toBe(actual2);
  });
});

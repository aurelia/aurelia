import { DI, optional, resolve } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('1-kernel/di.exception.spec.ts', function () {
  it('reports AUR0012 for an unregistered interface without a default', function () {
    const container = DI.createContainer();

    interface Foo {}

    const Foo = DI.createInterface<Foo>('Foo');
    const expectedError = /AUR0012.*Foo/;

    class Bar {
      public readonly foo: Foo = resolve(Foo);
    }

    assert.throws(() => container.get(Foo), expectedError, 'throws once');
    assert.throws(() => container.get(Foo), expectedError, 'throws twice'); // regression test
    assert.throws(() => container.getResolver(Foo, true), expectedError, 'throws from auto-registering getResolver');
    assert.strictEqual(container.getResolver(Foo, false), null, 'does not throw when auto-registration is disabled');
    assert.throws(() => container.get(Bar), expectedError, 'throws on inject into');
  });

  it('cyclic dependency', function () {
    const container = DI.createContainer();
    interface IFoo {
      parent: IFoo | null;
    }
    const IFoo = DI.createInterface<IFoo>('IFoo', x => x.singleton(Foo));
    class Foo {
      public parent: IFoo = resolve(optional(IFoo));
    }

    let ex;
    try {
      container.get(IFoo);
    } catch (e) {
      ex = e;
    }

    assert.match(ex?.message, /AUR0003.*Foo/, 'container.get(IFoo) - cyclic dep');
    // assert.throws(() => container.get(IFoo), /.*Cycl*/, 'test');
  });
});

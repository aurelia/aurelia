import { DI, ignore, inject, resolve } from '@aurelia/kernel';
import { assert } from '@aurelia/testing';

describe('1-kernel/di.ignore.spec.ts', function () {
  it('resolve(ignore)', function () {
    class A { }
    class C { }
    class B {
      public a: A = resolve(ignore);
      public c: C = resolve(C);
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.strictEqual(b.a, undefined);
    assert.instanceOf(b.c, C);
  });

  it('inject(ignore)', function () {
    class A { }
    class C { }

    @inject(ignore, C)
    class B {
      public constructor(public a: A, public c: C) { }
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.strictEqual(b.a, undefined);
    assert.instanceOf(b.c, C);
  });

  it('inject = [ignore]', function () {
    class A { }
    class C { }

    class B {
      public static inject = [ignore, C];
      public constructor(public a: A, public c: C) { }
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.strictEqual(b.a, undefined);
    assert.instanceOf(b.c, C);
  });

  it('inject(ignore) - with optional param - null', function () {
    class A { }
    class C { }

    @inject(ignore, C)
    class B {
      public constructor(public a: A = null, public c: C) { }
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.strictEqual(b.a, null);
    assert.instanceOf(b.c, C);
  });

  it('inject = [ignore] - with optional param - null', function () {
    class A { }
    class C { }

    class B {
      public static inject = [ignore, C];
      public constructor(public a: A = null, public c: C) { }
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.strictEqual(b.a, null);
    assert.instanceOf(b.c, C);
  });

  it('inject(ignore) - with optional param - truthy', function () {
    class A { }
    class C { }

    @inject(ignore, C)
    class B {
      public constructor(public a: A = new A(), public c: C) { }
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.instanceOf(b.a, A);
    assert.instanceOf(b.c, C);
  });

  it('inject = [ignore] - with optional param - truthy', function () {
    class A { }
    class C { }

    class B {
      public static inject = [ignore, C];
      public constructor(public a: A = new A(), public c: C) { }
    }

    const container = DI.createContainer();
    container.register(A, C);

    const b = container.get(B);
    assert.instanceOf(b.a, A);
    assert.instanceOf(b.c, C);
  });
});

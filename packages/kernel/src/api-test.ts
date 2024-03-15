/* eslint-disable @typescript-eslint/no-unused-vars */
import { DI, inject } from './di';
import { all, lazy, optional, newInstanceOf, newInstanceForScope, factory, own, resource, allResources, optionalResource } from './di.resolvers';
import { resolve } from './di.container';

function test() {
  const d = DI.createContainer();
  const I = DI.createInterface<I>();
  interface I {
    c: number;
  }

  function testAll() {
    const instances = d.get(all(class Abc { public b: number = 5; }));
    instances.forEach(i => i.b);

    const ii = d.get(all(I));
    ii.forEach(i => i.c);

    // Not yet supported by TS, as the method-parameter decorator proposal is not in Stage 4 yet
    // class Def {
    //   public constructor(@all(I) private readonly i: I) {}
    // }

    @inject(all(I))
    class G {}
  }

  function testLazy() {
    const instance = d.get(lazy(class Abc { public b: number = 5; }));
    if (instance().b === 5) {
      // good
    }

    // Not yet supported by TS, as the method-parameter decorator proposal is not in Stage 4 yet
    // class Def {
    //   public constructor(@lazy(I) private readonly i: I) {}
    // }

    @inject(lazy(I))
    class G {
      private readonly foo = lazy(I);
      public i = resolve(lazy(I));
      public b: I = this.i();
    }
  }

  function testOptional() {
    const instance = d.get(optional(class Abc { public b: number = 5; }));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (instance.b === 5) {
      // good
    }

   // Not yet supported by TS, as the method-parameter decorator proposal is not in Stage 4 yet
    // class Def {
    //   public constructor(@optional(I) private readonly i: I) { }
    // }

    @inject(optional(I))
    class G {
      public i = resolve(optional(I));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      public b: I = this.i;
    }
  }

  function testNewInstance() {
    const instance = d.get(newInstanceOf(class Abc { public b: number = 5; }));
    if (instance.b === 5) {
      // good
    }
    const instance2 = d.get(newInstanceForScope(class Abc { public b: number = 5; }));
    if (instance2.b === 5) {
      // good
    }

    // Not yet supported by TS, as the method-parameter decorator proposal is not in Stage 4 yet
    // class Def {
    //   public constructor(
    //     @newInstanceOf(I) private readonly i: I,
    //     @newInstanceForScope(I) private readonly j: I,
    //   ) { }
    // }

    @inject(newInstanceOf(I))
    class G {
      public i = resolve(newInstanceOf(I));
      public ii: I = this.i;
      public j = resolve(newInstanceForScope(I));
      public jj: I = this.j;
    }
  }

  /* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, prefer-const */
  function testOwn() {
    const instance = d.get(own(I));

    // @ts-expect-error
    if (instance.c) {/*  */}
  }

  function testResource() {
    const d = DI.createContainer();
    const I = DI.createInterface<I>();
    interface I {
      c: number;
    }
    const instance = d.get(resource(I));

    if (instance.c) {/*  */}
  }

  function testOptionalResource() {
    const instance = d.get(optionalResource(I));

    // @ts-expect-error
    if (instance.c) {/*  */}
  }

  function testAllResources() {
    const instances = d.get(allResources(I));
    instances.forEach(i => i.c);
  }

  function testResolve() {
    class Abc { public a = 1; }
    class Def { public b = 2; }
    class Abc2 { public c = '3'; }
    const [{ a: _ }] = resolve(all(Abc));
    const [ [{ a: a_ }], [{ b: b_ }], [{ c: c_ }]] = resolve(all(Abc), all(Def), all(Abc2));
    let [{ a }, { b }, { c }, lazyDef, factoryAbc2, optionalAbc, newDef, newAbc] = resolve(Abc, Def, Abc2, lazy(Def), factory(Abc2), optional(Abc), newInstanceForScope(Def), newInstanceOf(Abc));
    a = 3; b = 4; c = '1';
    lazyDef().b = 5;
    factoryAbc2(1, 2, 3).c = '2';
    // @ts-expect-error
    if (optionalAbc.a) {/*  */}
    newDef.b = 4;
    newAbc.a = 2;

    const [ownAbc, resourceAbc, optionalResourceAbc, allResourceAbcs] = resolve(own(Abc), resource(Abc), optionalResource(Abc), allResources(Abc));
    // @ts-expect-error
    if (ownAbc.a) {/*  */}
    if (resourceAbc.a) {/*  */}
    // @ts-expect-error
    if (optionalResourceAbc.a) {/*  */}
    allResourceAbcs.forEach(a => a.a);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, prefer-const */
}

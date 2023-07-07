/* eslint-disable @typescript-eslint/no-unused-vars */
import { DI, all, inject, lazy, optional, newInstanceOf, newInstanceForScope, factory } from './di';
import { resolve } from './di.container';

function testAll() {
  const d = DI.createContainer();
  const I = DI.createInterface<I>();
  interface I {
    c: number;
  }
  const instances = d.get(all(class Abc { public b: number = 5; }));
  instances.forEach(i => i.b);

  const ii = d.get(all(I));
  ii.forEach(i => i.c);

  class Def {
    public constructor(@all(I) private readonly i: I) {}
  }

  @inject(all(I))
  class G {}
}

function testLazy() {
  const d = DI.createContainer();
  const I = DI.createInterface<I>();
  interface I {
    c: number;
  }
  const instance = d.get(lazy(class Abc { public b: number = 5; }));
  if (instance().b === 5) {
    // good
  }

  class Def {
    public constructor(@lazy(I) private readonly i: I) {}
  }

  @inject(lazy(I))
  class G {
    public i = resolve(lazy(I));
    public b: I = this.i();
  }
}

function testOptional() {
  const d = DI.createContainer();
  const I = DI.createInterface<I>();
  interface I {
    c: number;
  }
  const instance = d.get(optional(class Abc { public b: number = 5; }));
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (instance.b === 5) {
    // good
  }

  class Def {
    public constructor(@optional(I) private readonly i: I) { }
  }

  @inject(optional(I))
  class G {
    public i = resolve(optional(I));
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    public b: I = this.i;
  }
}

function testNewInstance() {
  const d = DI.createContainer();
  const I = DI.createInterface<I>();
  interface I {
    c: number;
  }
  const instance = d.get(newInstanceOf(class Abc { public b: number = 5; }));
  if (instance.b === 5) {
    // good
  }
  const instance2 = d.get(newInstanceForScope(class Abc { public b: number = 5; }));
  if (instance2.b === 5) {
    // good
  }

  class Def {
    public constructor(
      @newInstanceOf(I) private readonly i: I,
      @newInstanceForScope(I) private readonly j: I,
    ) { }
  }

  @inject(newInstanceOf(I))
  class G {
    public i = resolve(newInstanceOf(I));
    public ii: I = this.i;
    public j = resolve(newInstanceForScope(I));
    public jj: I = this.j;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, prefer-const */
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
}
/* eslint-enable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment, prefer-const */

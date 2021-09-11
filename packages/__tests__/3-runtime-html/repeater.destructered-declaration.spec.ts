/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Class,
} from '@aurelia/kernel';
import {
  Aurelia,
  bindingBehavior,
  BindingBehaviorInstance,
  CustomElement,
  IBinding,
  ICustomElementController,
  ICustomElementViewModel,
  IPlatform,
  LifecycleFlags,
  Scope,
  valueConverter,
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';
import {
  Person,
} from '../validation/_test-resources.js';

describe('3-runtime-html/repeater.destructured-declaration.spec.ts', function () {
  interface TestSetupContext<TApp> {
    template: string;
    registrations: any[];
    app: Class<TApp>;
  }
  const $it = createSpecFunction(testRepeatForCustomElement);
  async function testRepeatForCustomElement<TApp>(
    testFunction: TestFunction<TestExecutionContext<TApp>>,
    {
      template,
      registrations = [],
      app,
    }: Partial<TestSetupContext<TApp>>
  ) {
    const ctx = TestContext.create();
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;

    const au = new Aurelia(container);
    await au.register(...registrations, Mult, NoopBindingBehavior)
      .app({
        host,
        component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, app ?? class { })
      })
      .start();
    const component = au.root.controller.viewModel as any;

    await testFunction({ app: component, container, ctx, host, platform: container.get(IPlatform) });

    await au.stop();

    assert.strictEqual(host.textContent, '', `host.textContent`);

    ctx.doc.body.removeChild(host);
  }

  @valueConverter('mult')
  class Mult {
    public toView(value: number, multiplier: number = 2) {
      return value * multiplier;
    }
  }

  @bindingBehavior('noop')
  class NoopBindingBehavior implements BindingBehaviorInstance {
    public bind(_flags: LifecycleFlags, _scope: Scope, _binding: IBinding): void {
      return;
    }
    public unbind(_flags: LifecycleFlags, _scope: Scope, _binding: IBinding): void {
      return;
    }
  }

  async function changeAndAssert(ctx: TestExecutionContext<any>, change: () => void, expectedHtml: string) {
    change();
    await ctx.platform.domWriteQueue.yield();
    assert.html.innerEqual(ctx.host, expectedHtml);
  }

  {
    class App {
      public map: Map<string, number> = new Map<string, number>([['a', 1], ['b', 2], ['c', 3]]);
    }
    $it('[k,v] of Map<string, number>', async function (ctx: TestExecutionContext<App>) {
      let expected: string;
      assert.html.innerEqual(ctx.host, expected = '<div>a - 1</div><div>b - 2</div><div>c - 3</div>');
      let map = ctx.app.map;
      await changeAndAssert(ctx, () => map.set('d', 4), `${expected}<div>d - 4</div>`);
      await changeAndAssert(ctx, () => map.set('d', 44), `${expected}<div>d - 44</div>`);
      await changeAndAssert(ctx, () => map.delete('d'), expected);
      await changeAndAssert(ctx, () => map.clear(), '');
      await changeAndAssert(ctx, () => { map = ctx.app.map = new Map<string, number>([['e', 5], ['f', 6]]); }, expected = '<div>e - 5</div><div>f - 6</div>');
      await changeAndAssert(ctx, () => map.set('d', 4), `${expected}<div>d - 4</div>`);
      await changeAndAssert(ctx, () => map.set('d', 44), `${expected}<div>d - 44</div>`);
      await changeAndAssert(ctx, () => map.delete('d'), expected);
    }, { app: App, template: `<div repeat.for="[k,v] of map">\${k} - \${v}</div>` });
  }

  {
    class App {
      public arr: [number, number][] = [[1, 11], [2, 22], [3, 33],];
    }
    $it('[i1,i2] of [number, number][]', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>1 - 11</div><div>2 - 22</div><div>3 - 33</div>');
      let arr = ctx.app.arr;
      await changeAndAssert(ctx, () => arr.push([4, 44]), '<div>1 - 11</div><div>2 - 22</div><div>3 - 33</div><div>4 - 44</div>');
      await changeAndAssert(ctx, () => arr.pop(), '<div>1 - 11</div><div>2 - 22</div><div>3 - 33</div>');
      await changeAndAssert(ctx, () => arr.splice(1, 1, [5, 55]), '<div>1 - 11</div><div>5 - 55</div><div>3 - 33</div>');
      await changeAndAssert(ctx, () => arr.splice(0), '');
      await changeAndAssert(ctx, () => { arr = ctx.app.arr = [[6, 66], [7, 77]]; }, '<div>6 - 66</div><div>7 - 77</div>');
      await changeAndAssert(ctx, () => arr.push([4, 44]), '<div>6 - 66</div><div>7 - 77</div><div>4 - 44</div>');
      await changeAndAssert(ctx, () => arr.splice(1, 1, [5, 55]), '<div>6 - 66</div><div>5 - 55</div><div>4 - 44</div>');
      await changeAndAssert(ctx, () => arr.pop(), '<div>6 - 66</div><div>5 - 55</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2] of arr">\${i1} - \${i2}</div>` });
  }

  {
    class App {
      public arr: [number, number?][] = [[1, 11], [2, 22], [3,],];
    }

    $it('[i1,i2=number] of [number, number?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>1 - 11</div><div>2 - 22</div><div>3 - 42</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2=42] of arr">\${i1} - \${i2}</div>` });

    $it('[i1,i2=string] of [number, number?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>1 - 11</div><div>2 - 22</div><div>3 - nv</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2='nv'] of arr">\${i1} - \${i2}</div>` });

    $it('[i1,i2=bool] of [number, number?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>1 - 11</div><div>2 - 22</div><div>3 - false</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2=false] of arr">\${i1} - \${i2}</div>` });

    $it('[i1,i2={object}] of [number, number?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>1 - 11</div><div>2 - 22</div><div>3 - 42</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2={d:42}] of arr">\${i1} - \${i2.d || i2}</div>` });

    $it('[i1,i2=[array]] of [number, number?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>1 - 11</div><div>2 - 22</div><div>3 - 42</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2=[42]] of arr">\${i1} - \${i2[0] || i2}</div>` });
  }

  {
    class App {
      public arr: number[][] = [[1], [2, 3], [4, 5, 6], [7, 8, 9, 10]];
    }

    $it('[i,...r] of number[][]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1 - 0</div><div>2 - 1</div><div>4 - 2</div><div>7 - 3</div>');
    }, { app: App, template: `<div repeat.for="[i,...r] of arr">\${i} - \${r.length}</div>` });

    $it('[i1,i2,...r] of number[][]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1</div><div>2, 3</div><div>4, 5 and 1 more</div><div>7, 8 and 2 more</div>');
    }, { app: App, template: `<div repeat.for="[i1,i2,...r] of arr">\${i1}<template if.bind="i2">, \${i2}</template><template if.bind="r.length"> and \${r.length} more</template></div>` });
  }

  {
    class App {
      public arr: [number, number[]?][] = [[1], [2, [3]], [4], [5, [6]]];
    }

    $it('[i1,[i2]=[42]] of [number, number[]?][]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1 - 42</div><div>2 - 3</div><div>4 - 42</div><div>5 - 6</div>');
    }, { app: App, template: `<div repeat.for="[i1,[i2]=[42]] of arr">\${i1} - \${i2}</div>` });
  }

  {
    class App {
      public arr: any[][] = [
        [1, [2, [3, 4]]],
        [5, [6, [7, 8]]],
        [9, [10, [11, 12]]],
      ];
    }

    $it('[i1,[,[,i3]]] of any[][]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1 - 4</div><div>5 - 8</div><div>9 - 12</div>');
    }, { app: App, template: `<div repeat.for="[i1,[,[,i3]]] of arr">\${i1} - \${i3}</div>` });
  }

  {
    class App {
      public arr: Person[] = [
        new Person('p1', 1, { line1: 'l11', pin: 11000, city: 'c1' }),
        new Person('p2', 2, { line1: 'l21', pin: 22000, city: 'c2' }),
        new Person('p3', 3),
      ];
    }

    $it('{name,age} of Person[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>p1 - 1</div><div>p2 - 2</div><div>p3 - 3</div>');
    }, { app: App, template: `<div repeat.for="{name,age} of arr">\${name} - \${age}</div>` });

    $it('{name:n,age:a} of Person[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>p1 - 1</div><div>p2 - 2</div><div>p3 - 3</div>');
    }, { app: App, template: `<div repeat.for="{name:n,age:a} of arr">\${n} - \${a}</div>` });

    $it('{name:n,age:a,address:{line1:l1,city}} of Person[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>p1 - 1 - l11 - c1</div><div>p2 - 2 - l21 - c2</div><div>p3 - 3 - undefined - undefined</div>');
    }, { app: App, template: `<div repeat.for="{name:n,age:a,address:{line1:l1,city}} of arr">\${n} - \${a} - \${l1} - \${city}</div>` });

    $it('{name:n,...r} of Person[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>p1</div><div>p2 - c2</div><div>p3</div>');
    }, { app: App, template: `<div repeat.for="{name:n,...r} of arr">\${n}<template if.bind="r.age % 2 === 0"> - \${r.address.city}</template></div>` });

    $it('{name:n,address:{pin,...r}} of Person[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>p1 - c1</div><div>p2</div><div>p3</div>');
    }, { app: App, template: `<div repeat.for="{name:n,address:{pin,...r}} of arr">\${n}<template if.bind="pin.toString().startsWith('11')"> - \${r.city}</template></div>` });

    $it('{name:n,address:{city}={city:"unknown"}} of Person[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>p1 - c1</div><div>p2 - c2</div><div>p3 - atlantis</div>');
    }, { app: App, template: `<div repeat.for="{name:n,address:{city}={city:'atlantis'}} of arr">\${n} - \${city}</div>` });
  }

  {
    class App {
      public arr: any[] = [
        { a: 11, b: { c: 12, e: 13, f: 14 } },
        { a: 21, b: { c: 22, e: 23, } },
        { a: 31, b: { c: 32, e: 33, f: 34 } },
        { a: 41, b: { c: 42, e: 43, } },
      ];
    }

    $it('{a,b:{c:d,e,f=42}} of {a,b:{c,e,f}}[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 12 - 13 - 14</div><div>21 - 22 - 23 - 42</div><div>31 - 32 - 33 - 34</div><div>41 - 42 - 43 - 42</div>');
    }, { app: App, template: `<div repeat.for="{a,b:{c:d,e,f=42}} of arr">\${a} - \${d} - \${e} - \${f}</div>` });

    $it('{b:{c:d,e,f=42},a} of {a,b:{c,e,f}}[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 12 - 13 - 14</div><div>21 - 22 - 23 - 42</div><div>31 - 32 - 33 - 34</div><div>41 - 42 - 43 - 42</div>');
    }, { app: App, template: `<div repeat.for="{b:{c:d,e,f=42},a} of arr">\${a} - \${d} - \${e} - \${f}</div>` });
  }

  {
    class App implements ICustomElementViewModel {
      public readonly $controller?: ICustomElementController<this>;
      public arr: any[] = [
        { a: 11, b: 12, c: 13 },
        { a: 21, b: 22, },
        { a: 31, b: 32, c: 33 },
      ];
      public d = 42;
      public d1 = { d: 42, fn(x = 42) { return x; } };
      public d2 = [{ d: 42 }];
      public fn(x = 42) { return x; }
    }

    $it('{a:b,b:a} of {a,b,c?}[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 12</div><div>21 - 22</div><div>31 - 32</div>');
    }, { app: App, template: `<div repeat.for="{a:b,b:a} of arr">\${b} - \${a}</div>` });

    $it('{a:b,b} of {a,b,c?}[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>12 - undefined</div><div>22 - undefined</div><div>32 - undefined</div>');
    }, { app: App, template: `<div repeat.for="{a:b,b} of arr">\${b} - \${a}</div>` });

    // eslint-disable-next-line no-inner-declarations
    function* getDeclarations() {
      yield '{a,c=d}';
      yield '{a,c=d2[0].d}';
      yield '{a,c=d2[0][\'d\']}';
      yield '{a,c=fn()}';
      yield '{a,c=fn(42)}';
      yield '{a,c=fn(d)}';
      yield '{a,c=d1.fn()}';
      yield '{a,c=d1.fn(42)}';
      yield '{a,c=d1.fn(d)}';
    }

    for (const dec of getDeclarations()) {
      $it(`${dec} of {a,b,c?}[]`, function ({ host }: TestExecutionContext<App>) {
        assert.html.innerEqual(host, '<div>11 - 13</div><div>21 - 42</div><div>31 - 33</div>');
      }, { app: App, template: `<div repeat.for="${dec} of arr">\${a} - \${c}</div>` });
    }

    $it('{a,c=42|mult} of {a,b,c?}[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div>');
    }, { app: App, template: `<div repeat.for="{a,c=42|mult} of arr">\${a} - \${c}</div>` });

    $it('{a,c=42 & noop} of {a,b,c?}[]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 13</div><div>21 - 42</div><div>31 - 33</div>');
    }, { app: App, template: `<div repeat.for="{a,c=42 & noop} of arr">\${a} - \${c}</div>` });

    $it('initializer expression is not connected - {a,c=d|mult} of {a,b,c?}[]', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div>');
      const app = ctx.app;

      // change won't affect in this case, as the initializer expression is not connected
      await changeAndAssert(ctx, () => app.d = 43, '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div>');

      await changeAndAssert(ctx, () => app.arr.push({ a: 41, b: 42 }), '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div><div>41 - 86</div>');
      await changeAndAssert(
        ctx,
        () => {
          app.arr = [
            { a: 11, b: 12, c: 13 },
            { a: 21, b: 22, },
            { a: 31, b: 32, c: 33 },
            { a: 41, b: 42 },
          ];
        },
        '<div>11 - 13</div><div>21 - 86</div><div>31 - 33</div><div>41 - 86</div>');
    }, { app: App, template: `<div repeat.for="{a,c=d|mult} of arr">\${a} - \${c}</div>` });

    $it('initializer expression is not connected - {a,c=d|mult:m} of {a,b,c?}[]', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>11 - 13</div><div>21 - 126</div><div>31 - 33</div>');
      const app = ctx.app;

      // change won't affect in this case, as the initializer expression is not connected
      await changeAndAssert(ctx, () => { app.$controller.scope.overrideContext.m = 2; }, '<div>11 - 13</div><div>21 - 126</div><div>31 - 33</div>');

      await changeAndAssert(ctx, () => app.arr.push({ a: 41, b: 42 }), '<div>11 - 13</div><div>21 - 126</div><div>31 - 33</div><div>41 - 84</div>');
      await changeAndAssert(
        ctx,
        () => {
          app.arr = [
            { a: 11, b: 12, c: 13 },
            { a: 21, b: 22, },
            { a: 31, b: 32, c: 33 },
            { a: 41, b: 42 },
          ];
        },
        '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div><div>41 - 84</div>');
    }, { app: App, template: `<let m.bind="3"></let><div repeat.for="{a,c=d|mult:m} of arr">\${a} - \${c}</div>` });
  }

  {
    class App implements ICustomElementViewModel {
      public readonly $controller?: ICustomElementController<this>;
      public arr: [number, number, number?][] = [[11, 12, 13], [21, 22], [31, 32, 33],];
      public d = 42;
      public d1 = { d: 42, fn(x = 42) { return x; } };
      public d2 = [{ d: 42 }];
      public fn(x = 42) { return x; }
    }

    // eslint-disable-next-line no-inner-declarations
    function* getDeclarations() {
      yield '[a,,c=d]';
      yield '[a,,c=d2[0].d]';
      yield '[a,,c=d2[0][\'d\']]';
      yield '[a,,c=fn()]';
      yield '[a,,c=fn(42)]';
      yield '[a,,c=fn(d)]';
      yield '[a,,c=d1.fn()]';
      yield '[a,,c=d1.fn(42)]';
      yield '[a,,c=d1.fn(d)]';
    }

    for (const dec of getDeclarations()) {
      $it(`${dec} of {a,b,c?}[]`, function ({ host }: TestExecutionContext<App>) {
        assert.html.innerEqual(host, '<div>11 - 13</div><div>21 - 42</div><div>31 - 33</div>');
      }, { app: App, template: `<div repeat.for="${dec} of arr">\${a} - \${c}</div>` });
    }

    $it('[a,,c=42|mult] of [a,b,c?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div>');
    }, { app: App, template: `<div repeat.for="[a,,c=42|mult] of arr">\${a} - \${c}</div>` });

    $it('[a,,c=42 & noop] of [a,b,c?][]', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>11 - 13</div><div>21 - 42</div><div>31 - 33</div>');
    }, { app: App, template: `<div repeat.for="[a,,c=42 & noop] of arr">\${a} - \${c}</div>` });

    $it('initializer expression is not connected - [a,,c=d|mult] of [a,b,c?][]', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div>');
      const app = ctx.app;

      // change won't affect in this case, as the initializer expression is not connected
      await changeAndAssert(ctx, () => app.d = 43, '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div>');

      await changeAndAssert(ctx, () => app.arr.push([41, 42]), '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div><div>41 - 86</div>');
      await changeAndAssert(
        ctx,
        () => {
          app.arr = [
            [11, 12, 13],
            [21, 22,],
            [31, 32, 33],
            [41, 42],
          ];
        },
        '<div>11 - 13</div><div>21 - 86</div><div>31 - 33</div><div>41 - 86</div>');
    }, { app: App, template: `<div repeat.for="[a,,c=d|mult] of arr">\${a} - \${c}</div>` });

    $it('initializer expression is not connected - [a,,c=d|mult:m] of [a,b,c?][]', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>11 - 13</div><div>21 - 126</div><div>31 - 33</div>');
      const app = ctx.app;

      // change won't affect in this case, as the initializer expression is not connected
      await changeAndAssert(ctx, () => { app.$controller.scope.overrideContext.m = 2; }, '<div>11 - 13</div><div>21 - 126</div><div>31 - 33</div>');

      await changeAndAssert(ctx, () => app.arr.push([41, 42]), '<div>11 - 13</div><div>21 - 126</div><div>31 - 33</div><div>41 - 84</div>');
      await changeAndAssert(
        ctx,
        () => {
          app.arr = [
            [11, 12, 13],
            [21, 22,],
            [31, 32, 33],
            [41, 42],
          ];
        },
        '<div>11 - 13</div><div>21 - 84</div><div>31 - 33</div><div>41 - 84</div>');
    }, { app: App, template: `<let m.bind="3"></let><div repeat.for="[a,,c=d|mult:m] of arr">\${a} - \${c}</div>` });
  }

  {
    class App {
      public arr: any[][] = [
        [1, [2, { a: 1, b: 2 }]],
        [3, [4, { a: 2, b: 3, c: 4 }]],
        [9, [10, { a: 4, b: 5 }]],
      ];
    }

    $it('[a,[,{b,c=42}]] of any[][]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1 - 2 - 42</div><div>3 - 3 - 4</div><div>9 - 5 - 42</div>');
    }, { app: App, template: `<div repeat.for="[a,[,{b,c=42}]] of arr">\${a} - \${b} - \${c}</div>` });
  }

  {
    class App {
      public arr: any[] = [
        { a: 1, b: [2, 3] },
        { a: 2, b: [4, 5, 6], c: 4 },
        { a: 4, b: [7, 8, 9, 10] },
      ];
    }

    $it('{a, b:[,b], c = 42} of {a, b[], c}[]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1 - 3 - 42</div><div>2 - 5 - 4</div><div>4 - 8 - 42</div>');
    }, { app: App, template: `<div repeat.for="{a, b:[,b], c = 42} of arr">\${a} - \${b} - \${c}</div>` });
  }

  {
    class App {
      public map: Map<string, Person> = new Map([
        ['a', new Person('a', 1)],
        ['b', new Person('b', 2)],
      ]);
    }
    $it('change-handling on non-destructured object is operational - [k,p] of Map<string, Person>', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>a - a - 1</div><div>b - b - 2</div>');
      const map = ctx.app.map;
      // mutation of value
      await changeAndAssert(ctx, () => map.get('b').age = 42, '<div>a - a - 1</div><div>b - b - 42</div>');
      // mutation of map
      await changeAndAssert(ctx, () => map.set('b', new Person('c', 3)), '<div>a - a - 1</div><div>b - c - 3</div>');
    }, { app: App, template: `<div repeat.for="[k,p] of map">\${k} - \${p.name} - \${p.age}</div>` });

    $it('change-handling on destructured object is noop - [k,{name,age}] of Map<string, Person>', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>a - a - 1</div><div>b - b - 2</div>');
      const map = ctx.app.map;
      // mutation of value - noop
      await changeAndAssert(ctx, () => map.get('b').age = 42, '<div>a - a - 1</div><div>b - b - 2</div>');
      // mutation of map
      await changeAndAssert(ctx, () => map.set('b', new Person('c', 3)), '<div>a - a - 1</div><div>b - c - 3</div>');
    }, { app: App, template: `<div repeat.for="[k,{name,age}] of map">\${k} - \${name} - \${age}</div>` });
  }

  {
    class App {
      public map: Map<string, Person[]> = new Map([
        ['81', [new Person('81743d187e', 1)]],
        ['4b', [new Person('4bdcb4c20d', 84), new Person('4b65b7e361', 73)]],
        ['6b', [new Person('6ba7254daa', 74)]],
        ['85', [new Person('85112abda4', 61), new Person('851774ec0e', 33), new Person('853b9b43e5', 81)]],
      ]);
    }
    $it('change-handling on non-destructured array is operational - [k,ps] of Map<string, Person[]>', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>81: 817-1</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div>');
      const map = ctx.app.map;
      // mutation of value
      await changeAndAssert(
        ctx,
        () => map.get('81').push(new Person('81843d187e', 11)),
        '<div>81: 817-1 818-11</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div>'
      );
      // mutation of map
      await changeAndAssert(
        ctx,
        () => map.set('3a', [new Person('3adcb4c20d', 84)]),
        '<div>81: 817-1 818-11</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div><div>3a: 3ad-84</div>'
      );
    }, { app: App, template: `<div repeat.for="[k,ps] of map">\${k}:<template repeat.for="p of ps"> \${p.name.slice(0,3)}-\${p.age}</div>` });

    $it('change-handling on destructured object is noop - [k,[p1,p2,p3]] of Map<string, Person[]>', async function (ctx: TestExecutionContext<App>) {
      assert.html.innerEqual(ctx.host, '<div>81: 817-1</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div>');
      const map = ctx.app.map;
       // mutation of value - noop
       await changeAndAssert(
        ctx,
        () => map.get('81').push(new Person('81843d187e', 11)),
        '<div>81: 817-1</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div>'
      );
      // mutation of map
      await changeAndAssert(
        ctx,
        () => map.set('3a', [new Person('3adcb4c20d', 84)]),
        '<div>81: 817-1</div><div>4b: 4bd-84 4b6-73</div><div>6b: 6ba-74</div><div>85: 851-61 851-33 853-81</div><div>3a: 3ad-84</div>'
      );
    }, { app: App, template: `<div repeat.for="[k,[p1,p2,p3]] of map">\${k}:<template if.bind="p1"> \${p1.name.slice(0,3)}-\${p1.age}</template><template if.bind="p2"> \${p2.name.slice(0,3)}-\${p2.age}</template><template if.bind="p3"> \${p3.name.slice(0,3)}-\${p3.age}</template></div>` });
  }
});

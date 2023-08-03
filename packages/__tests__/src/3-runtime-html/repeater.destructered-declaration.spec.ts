import {
  Class,
} from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  IPlatform,
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

describe('3-runtime-html/repeater.destructered-declaration.spec.ts', function () {
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
    await au.register(...registrations)
      .app({
        host,
        component: CustomElement.define({ name: 'app', template }, app ?? class { })
      })
      .start();
    const component = au.root.controller.viewModel as any;

    await testFunction({ app: component, container, ctx, host, platform: container.get(IPlatform) });

    await au.stop();

    assert.strictEqual(host.textContent, '', `host.textContent`);

    ctx.doc.body.removeChild(host);
  }

  async function changeAndAssert(ctx: TestExecutionContext<any>, change: () => void, expectedHtml: string) {
    change();
    // await ctx.platform.domWriteQueue.yield();
    ctx.platform.domWriteQueue.flush();
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
  }
});

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
import { Person } from '../validation/_test-resources.js';

describe.only('3-runtime-html/repeater.destructured-declaration.spec.ts', function () {
  interface TestSetupContext<TApp> {
    template: string;
    registrations: any[];
    app: Class<TApp>;
  }
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
        component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, app ?? class { })
      })
      .start();
    const component = au.root.controller.viewModel as any;

    await testFunction({ app: component, container, ctx, host, platform: container.get(IPlatform) });

    await au.stop();

    assert.strictEqual(host.textContent, '', `host.textContent`);

    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testRepeatForCustomElement);

  {
    class App {
      public map: Map<string, number> = new Map<string, number>([['a', 1], ['b', 2], ['c', 3],]);
    }
    $it('[k,v] of Map<string, number>', function ({ host }: TestExecutionContext<App>) {
      assert.html.innerEqual(host, '<div>a - 1</div><div>b - 2</div><div>c - 3</div>');
    }, { app: App, template: `<div repeat.for="[k,v] of map">\${k} - \${v}</div>` });
  }

  {
    class App {
      public arr: [number, number][] = [[1, 11], [2, 22], [3, 33],];
    }
    $it('[i1,i2] of [number, number][]', function ({ host }) {
      assert.html.innerEqual(host, '<div>1 - 11</div><div>2 - 22</div><div>3 - 33</div>');
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
  }
});

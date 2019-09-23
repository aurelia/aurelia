import { Constructable, IContainer, PLATFORM } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  customElement,
  IDOM,
  ILifecycle,
  IObserverLocator,
  IRenderingEngine,
  view,
  ValueConverter,
} from '@aurelia/runtime';
import { RenderPlan } from '@aurelia/runtime-html';
import {
  assert,
  eachCartesianJoin,
  HTMLTestContext,
  TestContext,
  trimFull
} from '@aurelia/testing';

describe('[repeat.contextual-prop.spec.ts]', function () {

  interface IComposeIntegrationTestCase {
    title: string;
    template: string | HTMLElement;
    root?: Constructable;
    only?: boolean;
    resources?: any[];
    browserOnly?: boolean;
    testWillThrow?: boolean;
    assertFn(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
    assertFn_AfterDestroy?(ctx: HTMLTestContext, host: HTMLElement, comp: any): void | Promise<void>;
  }

  interface ISimpleRepeatContextualPropsTestCase {
    title: string;
    repeatExpression?: string;
    textExpression?: string;
    only?: boolean;
    testWillThrow?: boolean;
    getItems?(): any[] | Map<any, any> | Set<any>;
    mutate(collection: any[] | Map<any, any> | Set<any>, comp: any): void;
    expectation?(collection: any[] | Map<any, any> | Set<any>, comp: any): string;
  }

  // todo: enable tests that create new collection via value converter
  const simpleRepeatPropsTestCases: ISimpleRepeatContextualPropsTestCase[] = [
    {
      title: 'Basic - no mutations',
      mutate() {/* nothing */}
    },
    {
      title: 'Basic - no mutations - with [Identity] value converter',
      repeatExpression: 'item of items | identity',
      mutate() {/*  */}
    },
    {
      title: 'Basic - no mutations - with [Clone] value converter',
      repeatExpression: 'item of items | clone',
      mutate() {/*  */}
    },
    {
      title: 'Basic - with reverse()',
      mutate: (items: ITestModel[]) => items.reverse()
    },
    {
      title: 'Basic - with reverse() - with [Identity] value converter',
      repeatExpression: 'item of items | identity',
      mutate: (items: ITestModel[]) => items.reverse()
    },
    // {
    //   only: true,
    //   title: 'Basic - with reverse() - with [Clone] value converter',
    //   repeatExpression: 'item of items | clone',
    //   mutate: (items: ITestModel[]) => items.reverse(),
    //   // expectation: (items: ITestModel[]) => defaultExpectation(items.slice(0).reverse())
    // },
    {
      title: 'Basic - with sort()',
      mutate: (items: ITestModel[]) => items.sort(sortDesc)
    },
    {
      title: 'Basic - with sort() - with [Identity] value converter',
      repeatExpression: 'item of items | identity',
      mutate: (items: ITestModel[]) => items.sort(sortDesc)
    },
    // {
    //   only: true,
    //   title: 'Basic - with sort() - with [Clone] value converter',
    //   repeatExpression: 'item of items | clone',
    //   mutate: (items: ITestModel[]) => items.sort(sortDesc)
    // },
    {
      title: 'Basic - with push()',
      mutate(items: any[]) {
        for (let i = 0; 5 > i; ++i) {
          items.push({ name: `item - ${i}`, value: i });
        }
      }
    },
    {
      title: 'Basic - with splice()',
      mutate(items: any[]) {
        for (let i = 0; 5 > i; ++i) {
          const index = Math.floor(Math.random() * items.length);
          items.splice(index, 0, { name: `item - ${items.length}`, value: items.length });
        }
      }
    },
    {
      title: 'Basic - with pop()',
      mutate(items: any[]) {
        items.pop();
      }
    },
    {
      title: 'Basic - with shift()',
      mutate(items: any[]) {
        items.shift();
      }
    },
    {
      title: 'Basic - with unshift()',
      mutate(items: any[]) {
        items.unshift({ name: 'item - abcd', value: 100 });
      }
    },
    {
      title: 'Map basic - no mutations',
      repeatExpression: 'entry of items',
      textExpression: '[${entry[1].name}] -- ${$index} -- ${$even}',
      getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
      mutate() {/*  */}
    },
    {
      title: 'Map basic - with set()',
      repeatExpression: 'entry of items',
      textExpression: '[${entry[1].name}] -- ${$index} -- ${$even}',
      getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
      mutate(items: Map<string, ITestModel>) {
        for (let i = 10; 15 > i; ++i) {
          items.set(`item - ${i}`, { name: `item - ${i}`, value: i });
        }
      }
    },
    {
      title: 'Map basic - with set() - with [Identity] value converter',
      repeatExpression: 'entry of items | identity',
      textExpression: '[${entry[1].name}] -- ${$index} -- ${$even}',
      getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
      mutate(items: Map<string, ITestModel>) {
        for (let i = 10; 15 > i; ++i) {
          items.set(`item - ${i}`, { name: `item - ${i}`, value: i });
        }
      }
    },
    {
      title: 'Map basic - with delete()',
      repeatExpression: 'entry of items',
      textExpression: '[${entry[1].name}] -- ${$index} -- ${$even}',
      getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
      mutate(items: Map<string, ITestModel>) {
        for (let i = 0; 5 > i; ++i) {
          items.delete(`item - ${i}`);
        }
      }
    },
    {
      title: 'Map basic - with delete() - with [Identity] value converter',
      repeatExpression: 'entry of items | identity',
      textExpression: '[${entry[1].name}] -- ${$index} -- ${$even}',
      getItems: () => new Map(createItems(10).map((item) => [item.name, item])),
      mutate(items: Map<string, ITestModel>) {
        for (let i = 0; 5 > i; ++i) {
          items.delete(`item - ${i}`);
        }
      }
    },
    {
      title: 'Set basic - with add()',
      repeatExpression: 'item of items',
      textExpression: '[${item.name}] -- ${$index} -- ${$even}',
      getItems: () => new Set(createItems(10)),
      mutate(items: Set<ITestModel>) {
        for (let i = 0; 5 > i; ++i) {
          items.add({ name: `item - ${i + 10}`, value: i + 10 });
        }
      }
    },
  ];

  // Some tests are using, some aren't
  // but always register these
  const IdentityValueConverter = ValueConverter.define('identity', class {
    public toView(val: any): any {
      return val;
    }
  });
  const CloneValueConverter = ValueConverter.define('clone', class {
    public toView(val: any): any {
      return Array.isArray(val)
        ? val.slice(0)
        : val instanceof Map
          ? new Map(val)
          : val instanceof Set
            ? new Set(val)
            : val;
    }
  });

  for (const testCase of simpleRepeatPropsTestCases) {
    const {
      title,
      getItems = () => createItems(10),
      repeatExpression = 'item of items',
      textExpression = '[${item.name}] -- ${$index} -- ${$even}',
      only,
      mutate = PLATFORM.noop,
      expectation = defaultExpectation,
      testWillThrow
    } = testCase;
    const template = `<div repeat.for="${repeatExpression}">${textExpression}</div>`;
    class Root {
      public items = getItems();
    }
    const suit = (_title: string, fn: any) => only
      ? it.only(_title, fn)
      : it(_title, fn);

    suit(title, async function() {
      let body: HTMLElement;
      let host: HTMLElement;
      try {
        const ctx = TestContext.createHTMLTestContext();

        const App = CustomElement.define({ name: 'app', template }, Root);
        const au = new Aurelia(ctx.container);

        body = ctx.doc.body;
        host = body.appendChild(ctx.createElement('app'));
        ctx.container.register(
          IdentityValueConverter,
          CloneValueConverter
        );

        let didThrow = false;
        let component: Root;
        try {
          au.app({ host, component: App });
          await au.start().wait();
          component = au.root.viewModel as unknown as Root;
        } catch (ex) {
          didThrow = true;
          if (testWillThrow) {
            // dont try to assert anything on throw
            // just bails
            try {
              await au.stop().wait();
            } catch {/* and ignore all errors trying to stop */}
            return;
          }
          throw ex;
        }

        if (testWillThrow && !didThrow) {
          throw new Error('Expected test to throw, but did NOT');
        }

        await mutate(component.items, component);
        await waitForFrames(3);

        assert.strictEqual(host.textContent, expectation(component.items, component));

        await au.stop().wait();
      } finally {
        if (host) {
          host.remove();
        }
        if (body) {
          body.focus();
        }
        await waitForFrames(2);
      }
    });
  }

  interface ITestModel {
    name: string;
    value: number;
  }

  function createItems(count: number): ITestModel[] {
    return Array.from({ length: count }, (_, idx) => ({ name: `item - ${idx}`, value: idx }));
  }

  function defaultExpectation(items: any[] | Map<any, any> | Set<any>): string {
    if (Array.isArray(items)) {
      return items.map((item, idx) => `[${item.name}] -- ${idx} -- ${idx % 2 === 0}`).join('');
    }
    if (items instanceof Map) {
      return Array
        .from(items.entries())
        .map(([itemName, item], idx) => `[${itemName}] -- ${idx} -- ${idx % 2 === 0}`)
        .join('');
    }
    if (items instanceof Set) {
      return Array
        .from(items)
        .map((item: ITestModel, idx: number) => `[${item.name}] -- ${idx} -- ${idx % 2 === 0}`)
        .join('');
    }
    throw new Error('Invalid item types')
  }

  function sortDesc(item1: ITestModel, item2: ITestModel): -1 | 1 {
    return item1.value < item2.value ? 1 : -1;
  }
});

async function waitForFrames(frameCount: number): Promise<void> {
  while (frameCount-- > 0) {
    await new Promise(PLATFORM.requestAnimationFrame);
  }
}

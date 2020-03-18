import {
  IObserverLocator,
  IScheduler,
  LifecycleFlags,
  CustomElement,
  Aurelia,
  BindingStrategy,
  GetterObserver,
  SetterObserver,
  MapObserver,
  CustomSetterObserver,
  IDirtyChecker
} from '@aurelia/runtime';
import {
  Constructable
} from '@aurelia/kernel';
import {
  TestContext,
  assert,
  eachCartesianJoin,
  HTMLTestContext
} from '@aurelia/testing';

describe('simple Computed Observer test case', function () {
  this.afterEach(assert.isSchedulerEmpty);

  const testCases: ITestCase[] = [
    {
      title: 'basic scenario with array',
      template: '<input type=checkbox repeat.for="i of 10" model.bind=i checked.bind=selected >',
      ViewModel: class {
        public selected: any[] = [];
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: any[] };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox checked');

        component.selected.push(0);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true);

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.length, 0);

        component.selected.push(10);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true);

        component.selected = Array.from({ length: 10 }, (_, i) => i);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => el.checked), true);
      }
    },
    {
      title: 'basic scenario with Set',
      template: '<input type=checkbox repeat.for="i of 10" model.bind=i checked.bind=selected >',
      ViewModel: class {
        public selected: Set<any> = new Set();
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Set<any> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox checked');

        component.selected.add(0);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 0);

        component.selected.add(10);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Set(Array.from({ length: 10 }, (_, i) => i));
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Set(), all checked');
      }
    },
    {
      title: 'basic scenario with Map',
      template: '<input type=checkbox repeat.for="i of 10" model.bind=i checked.bind=selected >',
      ViewModel: class {
        public selected: Map<any, any> = new Map();
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Map<any, any> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox checked');

        component.selected.set(0, true);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 1);

        component.selected.set(10, true);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Map(Array.from({ length: 10 }, (_, i) => [i, true]));
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Set(), all checked');
      }
    },
    {
      title: 'mathcer scenario with Array',
      template: '<input type=checkbox repeat.for="i of items" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: any[] = [];

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: IAppItem[] };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox checked');

        component.selected.push({ name: 'item 0', value: 0 });
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.length, 0);

        component.selected.push({ name: 'item 10', value: 10 });
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = createItems(10);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new [], all checked');
      }
    },
    {
      title: 'mathcer scenario with Set',
      template: '<input type=checkbox repeat.for="i of items" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: Set<any> = new Set();

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Set<IAppItem> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox checked');

        component.selected.add({ name: 'item 0', value: 0 });
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 0);

        component.selected.add({ name: 'item 10', value: 10 });
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Set(createItems(10));
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Set, all checked');
      }
    },
    {
      title: 'mathcer scenario with Map',
      template: '<input type=checkbox repeat.for="i of items" model.bind=i checked.bind=selected matcher.bind="matchItems">',
      ViewModel: class {
        public items: any[] = createItems(10);
        public selected: Map<any, any> = new Map();

        public matchItems(itemA: IAppItem, itemB: IAppItem): boolean {
          return itemA.name === itemB.name;
        }
      },
      assertFn: (ctx, host, $component) => {
        const component = $component as IApp & { selected: Map<IAppItem, boolean> };
        const inputEls = Array.from(host.querySelectorAll('input'));
        assert.strictEqual(inputEls.length, 10);
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all checkbox checked');

        const firstItemValue = { name: 'item 0', value: 0 };
        component.selected.set(firstItemValue, true);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls[0].checked, true, 'first input is checked');

        simulateStateChange(ctx, inputEls[0], false);
        assert.strictEqual(component.selected.size, 1, 'unchecked');
        assert.strictEqual(component.selected.get(firstItemValue), false);

        component.selected.set({ name: 'item 10', value: 10 }, true);
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => !el.checked), true, 'all not checked');

        component.selected = new Map(Array.from(createItems(10), item => [item, true]));
        ctx.scheduler.getRenderTaskQueue().flush();
        assert.strictEqual(inputEls.every(el => el.checked), true, 'new Map, all checked');
      }
    }
  ];

  function simulateStateChange(ctx: HTMLTestContext, input: HTMLInputElement, checked: boolean): void {
    input.checked = checked;
    input.dispatchEvent(new ctx.CustomEvent('change', { bubbles: true }));
  }

  eachCartesianJoin(
    [testCases],
    (testCase, callIndex) => {
      const { title, template, ViewModel, assertFn, only } = testCase;
      // eslint-disable-next-line mocha/no-exclusive-tests
      const $it = (title_: string, fn: Mocha.Func) => only ? it.only(title_, fn) : it(title_, fn);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      $it(title, async function () {
        const { ctx, component, testHost, tearDown } = await createFixture<any>(
          template,
          ViewModel
        );
        await assertFn(ctx, testHost, component);
        // test cases could be sharing the same context document
        // so wait a bit before running the next test
        await tearDown();

        assert.isSchedulerEmpty();
      });
    }
  );

  interface ITestCase<T extends IApp = IApp> {
    title: string;
    template: string;
    ViewModel?: Constructable<T>;
    assertFn: AssertionFn;
    only?: boolean;
  }

  interface AssertionFn<T extends IApp = IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: HTMLTestContext, testHost: HTMLElement, component: T): void | Promise<void>;
  }

  interface IApp {
    [key: string]: any;
    selected: any[] | Set<any> | Map<any, any>;
  }

  interface IAppItem {
    name: string;
    value: number;
    isDone?: boolean;
  }

  function createItems(count: number): IAppItem[] {
    return Array.from({ length: count }, (_, i) => ({
      name: `item ${i}`,
      value: i,
    }));
  }

  async function createFixture<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator } = ctx;
    registrations = Array.from(new Set([...registrations]));
    container.register(...registrations);
    const testHost = ctx.doc.body.appendChild(ctx.createElement('div'));
    const appHost = testHost.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template, strategy: BindingStrategy.proxies }, $class);
    const component = new App();

    au.app({ host: appHost, component });
    await au.start().wait();

    return {
      ctx: ctx,
      au,
      container,
      lifecycle,
      testHost: testHost,
      appHost,
      component: component as T,
      observerLocator,
      tearDown: async () => {
        await au.stop().wait();
        testHost.remove();
      }
    };
  }
});

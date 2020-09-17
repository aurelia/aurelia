import {
  IScheduler,
  CustomElement,
  Aurelia,
  BindingStrategy,
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
  this.afterEach(function () {
    assert.isSchedulerEmpty(true);
  });

  interface IArrayIndexObserverTestCase<T extends IApp = IApp> {
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
    items: IAppItem[];
    itemNames: string[];
    readonly total: number;
  }

  interface IAppItem {
    name: string;
    value: number;
    isDone?: boolean;
  }

  class TestClass implements IApp {
    public items: IAppItem[] = Array.from({ length: 10 }, (_, idx) => {
      return { name: `i-${idx}`, value: idx + 1 };
    });

    public itemNames: string[] = this.items.map(i => i.name);

    public get total(): number {
      return this.items.reduce((total, item) => total + (item.value > 5 ? item.value : 0), 0);
    }
  }

  const computedObserverTestCases: IArrayIndexObserverTestCase[] = [
    {
      title: 'works in basic scenario',
      template: `<input value.bind="itemNames[0]" input.trigger="items[0].name = $event.target.value" />`,
      ViewModel: TestClass,
      assertFn: (ctx, host, component) => {
        const inputEl = host.querySelector('input');
        assert.strictEqual(inputEl.value, 'i-0');

        inputEl.value = '00';
        inputEl.dispatchEvent(new ctx.CustomEvent('input'));

        assert.strictEqual(component.itemNames[0], '00');
        assert.strictEqual(component.items[0].name, '00');

        const dirtyChecker = ctx.container.get(IDirtyChecker) as any;
        assert.strictEqual(dirtyChecker['tracked'].length, 0);
      }
    },
    {
      title: 'works in checkbox scenario',
      template: '<input type="checkbox" checked.bind="itemNames[0]" >',
      ViewModel: TestClass,
      assertFn: (ctx, host, component) => {
        const inputEl = host.querySelector('input');
        // only care about true boolean
        assert.strictEqual(inputEl.checked, false);

        component.itemNames.splice(0, 1, true as any);
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(inputEl.checked, true, 'should have been checked');

        inputEl.checked = false;
        inputEl.dispatchEvent(new ctx.CustomEvent('change'));

        assert.strictEqual(component.itemNames[0], false);

        const dirtyChecker = ctx.container.get(IDirtyChecker) as any;
        assert.strictEqual(dirtyChecker['tracked'].length, 0);
      }
    },
    {
      title: 'works in select scenario',
      template:
        `<select value.bind="itemNames[0]">
          <option repeat.for="item of items">\${item.name}
        `,
      ViewModel: TestClass,
      assertFn: (ctx, host, component) => {
        const selectEl = host.querySelector('select');
        assert.strictEqual(selectEl.value, 'i-0');
        assert.strictEqual(selectEl.options[0].selected, true);

        selectEl.options[1].selected = true;
        selectEl.dispatchEvent(new ctx.CustomEvent('change'));
        assert.strictEqual(component.itemNames[0], 'i-1');

        component.itemNames.splice(0, 1, 'i-2');
        assert.strictEqual(selectEl.value, 'i-1');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(selectEl.value, 'i-2');
      }
    },
    {
      title: 'works in repeat scenario',
      template:
        `<input
          repeat.for="itemName of itemNames"
          value.bind="itemNames[$index]"
          input.trigger="items[$index].name = itemNames[$index]"
        />`,
      ViewModel: TestClass,
      assertFn: (ctx, host, component) => {
        const inputEls = host.querySelectorAll('input');

        inputEls.forEach((inputEl, idx) => {
          assert.strictEqual(inputEl.value, `i-${idx}`);

          const newValue = `00-${idx}`;
          inputEl.value = newValue;
          inputEl.dispatchEvent(new ctx.CustomEvent('input'));

          assert.strictEqual(component.itemNames[idx], newValue);
          assert.strictEqual(component.items[idx].name, newValue);
        });

        const dirtyChecker = ctx.container.get(IDirtyChecker) as any;
        assert.strictEqual(dirtyChecker['tracked'].length, 0);
      }
    },
    {
      title: 'works in basic one way scenario without dirty checking',
      template: `\${itemNames[0]}`,
      ViewModel: TestClass,
      assertFn: (ctx, host, component) => {
        assert.html.textContent(host, 'i-0');
        const dirtyChecker = ctx.container.get(IDirtyChecker) as any;
        assert.strictEqual(dirtyChecker['tracked'].length, 0);

        component.itemNames.splice(0, 1, '00');
        assert.html.textContent(host, 'i-0');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.html.textContent(host, '00');
      }
    }
  ];

  eachCartesianJoin(
    [computedObserverTestCases],
    ({ only, title, template, ViewModel, assertFn }: IArrayIndexObserverTestCase) => {
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

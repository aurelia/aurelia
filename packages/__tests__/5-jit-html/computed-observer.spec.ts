import {
  createComputedObserver,
  RuntimeConfiguration,
  ObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  IObserverLocator,
  IDirtyChecker,
  ILifecycle,
  IScheduler,
  LifecycleFlags,
  CustomElement,
  Aurelia,
  BindingStrategy
} from '@aurelia/runtime';
import {
  RuntimeHtmlBrowserConfiguration
} from '@aurelia/runtime-html-browser'
import { Registration, Constructable } from '@aurelia/kernel';
import { TestContext, assert, eachCartesianJoin, HTMLTestContext } from '@aurelia/testing';



describe.only('simple Computed Observer test case', function() {

  interface IComputedObserverTestCase<T = any> {
    title: string;
    template: string;
    app?: Constructable<T>;
    assertFn: AssertionFn;
  }

  interface AssertionFn<T extends IApp = IApp> {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    (ctx: HTMLTestContext, testHost: HTMLElement, component: T): void | Promise<void>;
  }
  
  interface IApp {
    items: any[];
    readonly total: number;
  }

  class TestClass implements IApp {
    items = Array.from({ length: 10 }, (_, idx) => {
      return { name: `i-${idx}`, value: idx + 1 };
    });

    get total() {
      return this.items.reduce((total, item) => total + (item.value > 5 ? item.value : 0), 0);
    }
  }

  const computedObserverTestCases: IComputedObserverTestCase[] = [
    {
      title: 'works in basic scenario',
      template: '${total}',
      assertFn: (ctx, host, component) => {
        assert.strictEqual(host.textContent, '40');
        debugger
        component.items[0].value = 100;
        assert.strictEqual(host.textContent, '40');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '140');

        component.items.splice(1, 1, { name: 'item - 1', value: 100 });
        // todo: this scenario
        // component.items[1] = { name: 'item - 1', value: 100 };
        assert.strictEqual(host.textContent, '140');
        ctx.container.get(IScheduler).getRenderTaskQueue().flush();
        assert.strictEqual(host.textContent, '240');
      }
    }
  ];

  eachCartesianJoin(
    [computedObserverTestCases],
    ({ title, template, app = TestClass, assertFn }: IComputedObserverTestCase) => {
      it(title, async function () {
        const { ctx, component, testHost, dispose } = await setup<any>(
          template,
          app
        );
        await assertFn(ctx, testHost, component);
        // test cases could be sharing the same context document
        // so wait a bit before running the next test
        await dispose();
      });
    }
  );
      
  async function setup<T>(template: string | Node, $class: Constructable | null, ...registrations: any[]) {
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
      dispose: async () => {
        await au.stop().wait();
        testHost.remove();
      }
    };
  }
});

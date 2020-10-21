import {
  Class,
  IContainer,
} from '@aurelia/kernel';
import {
  Aurelia,
  Controller,
  CustomElement,
  customElement,
  IScheduler,
} from '@aurelia/runtime';
import {
  assert,
  HTMLTestContext,
  TestContext,
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util';

describe.only('runtime-html.integration', function () {

  async function runTest<TApp>(
    testFunction: TestFunction<IntegrationTestExecutionContext<TApp>>,
    {
      component,
      registrations,
    }: Partial<TestSetupContext<TApp>> = {}
  ) {
    const ctx = TestContext.createHTMLTestContext();

    const host = ctx.dom.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;

    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: TApp | null = null;
    let controller: Controller = null!;
    try {
      await au
        .register(
          ...registrations,
        )
        .app({ host, component })
        .start();
      app = au.root.controller.viewModel as TApp;
      controller = au.root.controller! as unknown as Controller;
    } catch (e) {
      error = e;
    }

    const testCtx = new IntegrationTestExecutionContext(ctx, container, host, app, controller, error);
    await testFunction(testCtx);

    if (error === null) {
      await au.stop();
      assert.html.innerEqual(host, '', 'post-detach innerHTML');
    }
    ctx.doc.body.removeChild(host);
  }

  class IntegrationTestExecutionContext<TApp extends unknown> implements TestExecutionContext<any> {
    private _scheduler: IScheduler;
    public constructor(
      public ctx: HTMLTestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: TApp | null,
      public controller: Controller,
      public error: Error | null,
    ) { }
    public get scheduler(): IScheduler { return this._scheduler ?? (this._scheduler = this.container.get(IScheduler)); }
  }

  interface TestSetupContext<TAppPrototype extends unknown> {
    component: Class<TAppPrototype>;
    registrations: any[];
  }
  const $it = createSpecFunction(runTest);

  class TestData<TApp> implements TestSetupContext<TApp> {
    public constructor(
      public readonly name: string,
      public readonly component: Class<TApp>,
      public readonly registrations: any[] = [],
      public readonly assert: (ctx: IntegrationTestExecutionContext<TApp>) => void | Promise<void>,
    ) { }
  }

  function* getTestData() {
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<div ref="container" id="cr">1</div><child ref="child" id="child"></child>' })
      class App {
        public readonly container: HTMLElement = void 0;
        public readonly child: HTMLElement;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<div ref="container" id="cc">2</div><grand-child ref="grandChild" id="grandChild"></grand-child>' })
      class Child {
        public readonly container: HTMLElement = void 0;
        public readonly grandChild: HTMLElement;
      }
      @customElement({ name: 'grand-child', isStrictBinding: true, template: '<div ref="container" id="cgc">3</div>' })
      class GrandChild {
        public readonly container: HTMLElement = void 0;
      }
      yield new TestData(
        'ref-binding',
        App,
        [Child, GrandChild],
        function (ctx: IntegrationTestExecutionContext<App>) {
          const app = ctx.app;
          const container = app.container;
          const host = ctx.host;
          assert.strictEqual(container, host.querySelector('#cr'));
          assert.html.textContent(container, '1');

          const childEl = host.querySelector('#child');
          assert.strictEqual(app.child, childEl);

          const childVm = CustomElement.for<Element, Child>(childEl).viewModel;
          const childContainer = childVm.container;
          assert.strictEqual(childEl.querySelector('#cc'), childContainer);
          assert.html.textContent(childContainer, '2');

          const grandChildEl = childEl.querySelector('#grandChild');
          assert.strictEqual(childVm.grandChild, grandChildEl);

          const grandChildVm = CustomElement.for<Element, GrandChild>(grandChildEl).viewModel;
          const grandChildContainer = grandChildVm.container;
          assert.strictEqual(grandChildEl.querySelector('#cgc'), grandChildContainer);
          assert.html.textContent(grandChildContainer, '3');
        }
      );
    }
  }

  for (const data of getTestData()) {
    $it(data.name, async function (ctx: IntegrationTestExecutionContext<any>) {
      await data.assert(ctx);
    }, data);
  }
});

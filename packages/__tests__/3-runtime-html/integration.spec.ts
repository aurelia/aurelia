import {
  Class,
  IContainer,
} from '@aurelia/kernel';
import {
  Aurelia,
  bindable,
  BindingMode,
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

describe('runtime-html.integration', function () {

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
        function (ctx) {
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
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<child value.from-view="value"></child><div id="cr">${value}</div>' })
      class App {
        public value: number = 1;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<grand-child value.from-view="value"></grand-child><div id="cc">${value}</div>' })
      class Child {
        @bindable public value: number;
      }
      @customElement({ name: 'grand-child', isStrictBinding: true, template: '<div id="cgc">${value}</div>' })
      class GrandChild {
        @bindable public value: number = 3;
      }
      yield new TestData(
        'from-view with change',
        App,
        [Child, GrandChild],
        async function (ctx) {
          const app = ctx.app;
          const host = ctx.host;
          const cgc = host.querySelector('#cgc');
          const cc = host.querySelector('#cc');
          const cr = host.querySelector('#cr');
          assert.html.textContent(cgc, '3');
          assert.html.textContent(cc, '3');
          assert.html.textContent(cr, '3');

          const childVm = CustomElement.for<Element, Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 3);
          assert.strictEqual(app.value, 3);

          const grandchildVm = CustomElement.for<Element, GrandChild>(host.querySelector('grand-child')).viewModel;
          grandchildVm.value = 42;
          await ctx.scheduler.yieldAll();

          assert.html.textContent(cgc, '42');
          assert.html.textContent(cc, '42');
          assert.html.textContent(cr, '42');

          assert.strictEqual(childVm.value, 42);
          assert.strictEqual(app.value, 42);
        }
      );
    }
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<child value.to-view="value"></child><div id="cr">${value}</div>' })
      class App {
        public value: number = 1;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<grand-child value.to-view="value"></grand-child><div id="cc">${value}</div>' })
      class Child {
        @bindable public value: number;
      }
      @customElement({ name: 'grand-child', isStrictBinding: true, template: '<div id="cgc">${value}</div>' })
      class GrandChild {
        @bindable public value: number = 3;
      }
      yield new TestData(
        'to-view with change',
        App,
        [Child, GrandChild],
        async function (ctx) {
          const app = ctx.app;
          const host = ctx.host;
          const cgc = host.querySelector('#cgc');
          const cc = host.querySelector('#cc');
          const cr = host.querySelector('#cr');
          assert.html.textContent(cgc, '1');
          assert.html.textContent(cc, '1');
          assert.html.textContent(cr, '1');

          const childVm = CustomElement.for<Element, Child>(host.querySelector('child')).viewModel;
          const grandchildVm = CustomElement.for<Element, GrandChild>(host.querySelector('grand-child')).viewModel;
          assert.strictEqual(grandchildVm.value, 1);
          assert.strictEqual(childVm.value, 1);

          app.value = 42;
          await ctx.scheduler.yieldAll();

          assert.html.textContent(cgc, '42');
          assert.html.textContent(cc, '42');
          assert.html.textContent(cr, '42');

          assert.strictEqual(grandchildVm.value, 42);
          assert.strictEqual(childVm.value, 42);
        }
      );
    }
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<child value.two-way="value"></child><div id="cr">${value}</div>' })
      class App {
        public value: number = 1;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<grand-child value.two-way="value"></grand-child><div id="cc">${value}</div>' })
      class Child {
        @bindable public value: number;
      }
      @customElement({ name: 'grand-child', isStrictBinding: true, template: '<div id="cgc">${value}</div>' })
      class GrandChild {
        @bindable public value: number = 3;
      }
      yield new TestData(
        'two-way with change',
        App,
        [Child, GrandChild],
        async function (ctx) {
          const app = ctx.app;
          const host = ctx.host;
          const cgc = host.querySelector('#cgc');
          const cc = host.querySelector('#cc');
          const cr = host.querySelector('#cr');
          assert.html.textContent(cgc, '1');
          assert.html.textContent(cc, '1');
          assert.html.textContent(cr, '1');

          const childVm = CustomElement.for<Element, Child>(host.querySelector('child')).viewModel;
          const grandchildVm = CustomElement.for<Element, GrandChild>(host.querySelector('grand-child')).viewModel;
          assert.strictEqual(grandchildVm.value, 1);
          assert.strictEqual(childVm.value, 1);

          grandchildVm.value = 42;
          await ctx.scheduler.yieldAll();

          assert.html.textContent(cgc, '42');
          assert.html.textContent(cc, '42');
          assert.html.textContent(cr, '42');

          assert.strictEqual(childVm.value, 42);
          assert.strictEqual(app.value, 42);

          childVm.value = 24;
          await ctx.scheduler.yieldAll();

          assert.html.textContent(cgc, '24');
          assert.html.textContent(cc, '24');
          assert.html.textContent(cr, '24');

          assert.strictEqual(grandchildVm.value, 24);
          assert.strictEqual(app.value, 24);
        }
      );
    }
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<child value.to-view="value"></child><div id="cr">${value}</div>' })
      class App {
        public value: number = 1;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<div id="cc">${value}</div>' })
      class Child {
        @bindable({ mode: BindingMode.fromView }) public value: number;
      }
      yield new TestData(
        'to-view (root) -> from-view (child)',
        App,
        [Child],
        async function (ctx) {
          const app = ctx.app;
          const host = ctx.host;
          const cc = host.querySelector('#cc');
          const cr = host.querySelector('#cr');
          assert.html.textContent(cc, '1', 'cc.text.1');
          assert.html.textContent(cr, '1', 'cr.text.1');

          const childVm = CustomElement.for<Element, Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 1, 'child.value.1');

          childVm.value = 42;
          await ctx.scheduler.yieldAll();
          assert.strictEqual(app.value, 1, 'app.value.2');
          assert.html.textContent(cc, '42', 'cc.text.2');
          assert.html.textContent(cr, '1', 'cr.text.2');

          app.value = 24;
          await ctx.scheduler.yieldAll();
          assert.strictEqual(childVm.value, 24, 'child.value.3');
          assert.html.textContent(cc, '24', 'cc.text.3');
          assert.html.textContent(cr, '24', 'cr.text.3');
        }
      );
    }
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<child value.from-view="value"></child><div id="cr">${value}</div>' })
      class App {
        public value: number;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<div id="cc">${value}</div>' })
      class Child {
        @bindable({ mode: BindingMode.toView }) public value: number = 2;
      }
      yield new TestData(
        'to-view (child) -> from-view (root)',
        App,
        [Child],
        async function (ctx) {
          const app = ctx.app;
          const host = ctx.host;
          const cc = host.querySelector('#cc');
          const cr = host.querySelector('#cr');
          assert.html.textContent(cc, '2', 'cc.text.1');
          assert.html.textContent(cr, '2', 'cr.text.1');
          assert.strictEqual(app.value, 2, 'app.value.1');

          app.value = 24;
          await ctx.scheduler.yieldAll();
          const childVm = CustomElement.for<Element, Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 2, 'child.value.2');
          assert.html.textContent(cc, '2', 'cc.text.2');
          assert.html.textContent(cr, '24', 'cr.text.2');

          childVm.value = 42;
          await ctx.scheduler.yieldAll();
          assert.strictEqual(app.value, 42, 'app.value.3');
          assert.html.textContent(cc, '42', 'cc.text.3');
          assert.html.textContent(cr, '42', 'cr.text.3');
        }
      );
    }
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<child value.two-way="value"></child><div id="cr">${value}</div>' })
      class App {
        public value: number = 1;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<grand-child if.bind="condition" value.two-way="value"></grand-child><div id="cc">${value}</div>' })
      class Child {
        @bindable public value: number;
        public condition: boolean = false;
      }
      @customElement({ name: 'grand-child', isStrictBinding: true, template: '<div id="cgc">${value}</div>' })
      class GrandChild {
        @bindable public value: number = 3;
      }
      yield new TestData(
        'property-binding with `if` + change',
        App,
        [Child, GrandChild],
        async function (ctx) {
          const app = ctx.app;
          const host = ctx.host;

          assert.strictEqual(host.querySelector('grand-child'), null);
          assert.strictEqual(host.querySelector('#cgc'), null);

          const cc = host.querySelector('#cc');
          const cr = host.querySelector('#cr');
          assert.html.textContent(cc, '1');
          assert.html.textContent(cr, '1');

          const childVm = CustomElement.for<Element, Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 1);

          childVm.condition = true;
          await ctx.scheduler.yieldAll();
          const grandchildVm = CustomElement.for<Element, GrandChild>(host.querySelector('grand-child')).viewModel;
          assert.strictEqual(grandchildVm.value, 1);
          const cgc = host.querySelector('#cgc');
          assert.html.textContent(cgc, '1');

          grandchildVm.value = 42;
          await ctx.scheduler.yieldAll();
          assert.html.textContent(cgc, '42');
          assert.html.textContent(cc, '42');
          assert.html.textContent(cr, '42');
          assert.strictEqual(childVm.value, 42);
          assert.strictEqual(app.value, 42);
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

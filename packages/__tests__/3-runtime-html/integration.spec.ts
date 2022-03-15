import {
  Class,
  IContainer,
} from '@aurelia/kernel';
import {
  BindingMode,
} from '@aurelia/runtime';
import {
  Aurelia,
  Controller,
  CustomElement,
  customElement,
  IPlatform,
  bindable,
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext,
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';

describe('runtime-html.integration', function () {

  async function runTest<TApp>(
    testFunction: TestFunction<IntegrationTestExecutionContext<TApp>>,
    {
      component,
      registrations,
    }: Partial<TestSetupContext<TApp>> = {}
  ) {
    const ctx = TestContext.create();

    const host = ctx.createElement('div');
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
      controller = au.root.controller as unknown as Controller;
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

  class IntegrationTestExecutionContext<TApp> implements TestExecutionContext<any> {
    private _platform: IPlatform;
    public constructor(
      public ctx: TestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: TApp | null,
      public controller: Controller,
      public error: Error | null,
    ) { }
    public get platform(): IPlatform { return this._platform ?? (this._platform = this.container.get(IPlatform)); }
  }

  interface TestSetupContext<TAppPrototype> {
    component: Class<TAppPrototype>;
    registrations: any[];
  }
  const $it = createSpecFunction(runTest);

  class TestData<TApp> implements TestSetupContext<TApp> {
    public constructor(
      public readonly name: string,
      public readonly component: Class<TApp>,
      public readonly registrations: any[] = [],
      public readonly verify: (ctx: IntegrationTestExecutionContext<TApp>) => void | Promise<void>,
    ) { }
  }

  function* getTestData() {
    {
      @customElement({ name: 'app', isStrictBinding: true, template: '<div ref="container" id="cr">1</div><child ref="child" id="child"></child><div ref="container2" id="cr2">11</div>' })
      class App {
        public readonly container: HTMLElement = void 0;
        public readonly child: HTMLElement;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '<div ref="container" id="cc">2</div><grand-child ref="grandChild" id="grandChild"></grand-child><div ref="container2" id="cc2">22</div>' })
      class Child {
        public readonly container: HTMLElement = void 0;
        public readonly grandChild: HTMLElement;
      }
      @customElement({ name: 'grand-child', isStrictBinding: true, template: '<div ref="container" id="cgc">3</div><div ref="container2" id="cgc2">33</div>' })
      class GrandChild {
        public readonly container: HTMLElement = void 0;
      }
      yield new TestData(
        // depending on TS config, explicitly uninitialized, and non-defined properties might or might not be same.
        'ref-binding with initialized, uninitialized, and non-defined properties',
        App,
        [Child, GrandChild],
        function (ctx) {
          const app = ctx.app;
          const container = app.container;
          const host = ctx.host;
          assert.strictEqual(container, host.querySelector('#cr'), '#cr');
          assert.strictEqual(app['container2'], host.querySelector('#cr2'), '#cr2');
          assert.html.textContent(container, '1');

          const childEl = host.querySelector('#child');
          assert.strictEqual(app.child, childEl);

          const childVm = CustomElement.for<Child>(childEl).viewModel;
          const childContainer = childVm.container;
          assert.strictEqual(childEl.querySelector('#cc'), childContainer, '#cc');
          assert.strictEqual(childVm['container2'], childEl.querySelector('#cc2'), '#cc2');
          assert.html.textContent(childContainer, '2');

          const grandChildEl = childEl.querySelector('#grandChild');
          assert.strictEqual(childVm.grandChild, grandChildEl, '#grandChild');

          const grandChildVm = CustomElement.for<GrandChild>(grandChildEl).viewModel;
          const grandChildContainer = grandChildVm.container;
          assert.strictEqual(grandChildEl.querySelector('#cgc'), grandChildContainer, '#cgc');
          assert.strictEqual(grandChildVm['container2'], grandChildEl.querySelector('#cgc2'), '#cgc2');
          assert.html.textContent(grandChildContainer, '3');
        }
      );
    }
    {
      @customElement({
        name: 'app',
        isStrictBinding: true,
        template: `
        <child view-model.ref="c1" id="c1"></child>
        <child view-model.ref="c2" id="c2"></child>
        <child view-model.ref="c3" id="c3"></child>`
      })
      class App {
        public readonly c1: Child = void 0;
        public readonly c2: Child;
      }
      @customElement({ name: 'child', isStrictBinding: true, template: '' })
      class Child {
        private static id = 1;
        public readonly id = Child.id++;
      }
      yield new TestData(
        // depending on TS config, explicitly uninitialized, and non-defined properties might or might not be same.
        'view-model.ref-binding with initialized, uninitialized, and non-defined properties',
        App,
        [Child],
        function (ctx) {
          const app = ctx.app;
          const c1 = app.c1;
          const c2 = app.c2;
          const c3 = app['c3'];
          assert.strictEqual(c1.id, 1);
          assert.instanceOf(c1, Child);
          assert.strictEqual(c2.id, 2);
          assert.instanceOf(c2, Child);
          assert.strictEqual(c3.id, 3);
          assert.instanceOf(c3, Child);
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

          const childVm = CustomElement.for<Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 3);
          assert.strictEqual(app.value, 3);

          const grandchildVm = CustomElement.for<GrandChild>(host.querySelector('grand-child')).viewModel;
          grandchildVm.value = 42;
          ctx.platform.domWriteQueue.flush();

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

          const childVm = CustomElement.for<Child>(host.querySelector('child')).viewModel;
          const grandchildVm = CustomElement.for<GrandChild>(host.querySelector('grand-child')).viewModel;
          assert.strictEqual(grandchildVm.value, 1);
          assert.strictEqual(childVm.value, 1);

          app.value = 42;
          ctx.platform.domWriteQueue.flush();

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

          const childVm = CustomElement.for<Child>(host.querySelector('child')).viewModel;
          const grandchildVm = CustomElement.for<GrandChild>(host.querySelector('grand-child')).viewModel;
          assert.strictEqual(grandchildVm.value, 1);
          assert.strictEqual(childVm.value, 1);

          grandchildVm.value = 42;
          ctx.platform.domWriteQueue.flush();

          assert.html.textContent(cgc, '42');
          assert.html.textContent(cc, '42');
          assert.html.textContent(cr, '42');

          assert.strictEqual(childVm.value, 42);
          assert.strictEqual(app.value, 42);

          childVm.value = 24;
          ctx.platform.domWriteQueue.flush();

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

          const childVm = CustomElement.for<Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 1, 'child.value.1');

          childVm.value = 42;
          ctx.platform.domWriteQueue.flush();
          assert.strictEqual(app.value, 1, 'app.value.2');
          assert.html.textContent(cc, '42', 'cc.text.2');
          assert.html.textContent(cr, '1', 'cr.text.2');

          app.value = 24;
          ctx.platform.domWriteQueue.flush();
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
          ctx.platform.domWriteQueue.flush();
          const childVm = CustomElement.for<Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 2, 'child.value.2');
          assert.html.textContent(cc, '2', 'cc.text.2');
          assert.html.textContent(cr, '24', 'cr.text.2');

          childVm.value = 42;
          ctx.platform.domWriteQueue.flush();
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

          const childVm = CustomElement.for<Child>(host.querySelector('child')).viewModel;
          assert.strictEqual(childVm.value, 1);

          childVm.condition = true;
          ctx.platform.domWriteQueue.flush();
          const grandchildVm = CustomElement.for<GrandChild>(host.querySelector('grand-child')).viewModel;
          assert.strictEqual(grandchildVm.value, 1);
          const cgc = host.querySelector('#cgc');
          assert.html.textContent(cgc, '1');

          grandchildVm.value = 42;
          ctx.platform.domWriteQueue.flush();
          assert.html.textContent(cgc, '42');
          assert.html.textContent(cc, '42');
          assert.html.textContent(cr, '42');
          assert.strictEqual(childVm.value, 42);
          assert.strictEqual(app.value, 42);
        }
      );
    }
    const templates = [
      `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <template repeat.for="i of 3">
                \${$parent.$parent.i + $parent.i + i}
              </template>
            </template>
          </template>
        </template>`,

      `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <let gp.bind="$parent"></let>
              <template repeat.for="i of 3">
                <let p.bind="$parent"></let>
                \${gp.i + p.i + i}
              </template>
            </template>
          </template>
        </template>`,

      `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <template repeat.for="i of 3">
                <let gp.bind="$parent.$parent" p.bind="$parent"></let>
                \${gp.i + p.i + i}
              </template>
            </template>
          </template>
        </template>`,

      `<template>
          <template repeat.for="i of 3">
            <template repeat.for="i of 3">
              <template repeat.for="i of 3">
                <let gp.bind="$parent.$parent" p.bind="$parent" k.bind="gp.i" j.bind="p.i"></let>
                \${k + j + i}
              </template>
            </template>
          </template>
        </template>`,

      // The following template is not supported; kept here for documentation purpose.
      // `<template>
      //     <template repeat.for="i of 3">
      //       <template repeat.for="i of 3">
      //         <template repeat.for="i of 3">
      //           <let p.bind="$parent" gp.bind="p.$parent"></let>
      //           \${gp.i + p.i + i}
      //         </template>
      //       </template>
      //     </template>
      //   </template>`,
    ];
    for (let i = 0, ii = templates.length; i < ii; i++) {
      @customElement({
        name: 'app',
        isStrictBinding: true,
        template: templates[i]
      })
      class App { }
      yield new TestData(
        `repeater + $parent - #${i + 1}`,
        App,
        [],
        function (ctx) {
          const host = ctx.host;
          assert.html.textContent(host, '0 1 2 1 2 3 2 3 4 1 2 3 2 3 4 3 4 5 2 3 4 3 4 5 4 5 6');
        }
      );
    }
  }

  for (const data of getTestData()) {
    $it(data.name, async function (ctx: IntegrationTestExecutionContext<any>) {
      await data.verify(ctx);
    }, data);
  }
});

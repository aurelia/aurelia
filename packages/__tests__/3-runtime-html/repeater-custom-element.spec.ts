/* eslint-disable no-template-curly-in-string */
import { Class } from '@aurelia/kernel';
import {
  LifecycleFlags
} from '@aurelia/runtime';
import {
  customElement,
  bindable,
  CustomElement,
  Aurelia,
  IPlatform,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
  getVisibleText,
  TestContext,
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';

const spec = 'repeater-custom-element';

describe(spec, function () {

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

  // repeater with custom element
  {
    @customElement({ name: 'foo', template: 'a' })
    class Foo { }
    class App {
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count"></foo>`,
    };
    $it('static child content', async function ({ app, platform, host }: TestExecutionContext<App>) {
      app.count = 3;
      const q = platform.domWriteQueue;
      await q.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '${prop}' })
    class Foo {
      @bindable public prop: unknown;
    }
    class App { }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template:
        `<template>
          <template repeat.for="i of 3">
            <foo prop.bind="i"></foo>
          </template>
        </template>`,
    };
    $it('dynamic child content', async function ({ platform, host }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.html.innerEqual(host, '<foo prop.bind="i" class="au">0</foo> <foo prop.bind="i" class="au">1</foo> <foo prop.bind="i" class="au">2</foo>', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '${prop}' })
    class Foo {
      @bindable public prop: unknown;
    }
    class App { }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template:
        `<let items.bind="[{p: 1}, {p: 2}, {p: 3}]"></let>
        <template repeat.for="item of items">
          <foo prop.bind="item.p"></foo>
        </template>`,
    };
    $it('let integration', async function ({ platform, host }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.html.innerEqual(host, '<foo prop.bind="item.p" class="au">1</foo> <foo prop.bind="item.p" class="au">2</foo> <foo prop.bind="item.p" class="au">3</foo>', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'bar', template: 'bar' })
    class Bar {
      private static id: number = 1;
      @bindable public id: number = Bar.id++;
    }
    @customElement({ name: 'foo', template: '${prop}' })
    class Foo {
      @bindable public prop: unknown;
    }
    class App { }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Bar, Foo],
      template:
        `<template>
          <template repeat.for="i of 2">
            <bar id.from-view="id"></bar>
            <foo prop.bind="id"></foo>
          </template>
        </template>`,
    };
    $it('from-view integration', async function ({ platform, host }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.html.innerEqual(host, '<bar id.from-view="id">bar</bar> <foo prop.bind="id" class="au">1</foo> <bar id.from-view="id">bar</bar> <foo prop.bind="id" class="au">2</foo>', `host.textContent`);
    }, setup);
  }

  // // repeater with custom element + inner bindable with different name than outer property
  // it('104.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo text.bind="theText" repeat.for="i of count"></foo></template>`, class {
  //     public theText = 'b';
  //   }, Foo);
  //   component.count = 3;
  //   component.theText = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with same name as outer property
  // it('105.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo text.bind="text" repeat.for="i of count"></foo></template>`, class {
  //     public text = 'b';
  //   }, Foo);
  //   component.count = 3;
  //   component.text = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with different name than outer property, reversed, undefined property
  // it('106.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);

  //   component.count = 3;
  //   component.theText = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'undefinedundefinedundefined', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with same name as outer property, reversed, undefined property
  // it('107.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo repeat.for="i of count" text.bind="text"></foo></template>`, null, Foo);
  //   component.count = 3;
  //   component.text = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'undefinedundefinedundefined', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with different name than outer property, reversed
  // it('108.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
  //   component.theText = 'a';
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with same name as outer property, reversed
  // it('109.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count" text.bind="theText"></foo></template>`, null, Foo);
  //   component.theText = 'a';
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element with repeater
  // it('110.', function () {
  //   @customElement({ name: 'foo', template: '<template><div repeat.for="item of todos">${item}</div></template>', instructions: [] })
  //   class Foo { @bindable public todos: any[]; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
  //   component.todos = ['a', 'b', 'c'];
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

  //   component.count = 1;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  //   component.count = 3;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  // });

  // // repeater with custom element with repeater, nested arrays
  // it('111.', function () {
  //   @customElement({ name: 'foo', template: '<template><div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div></template>', instructions: [] })
  //   class Foo { @bindable public todos: any[]; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count" todos.bind="todos"></foo></template>`, null, Foo);
  //   component.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']];
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);

  //   component.count = 1;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

  //   component.count = 3;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  // });

  // // repeater with custom element and children observer
  // it('112.', async function () {
  //   this.timeout(10000);
  //   let childrenCount = 0;
  //   let childrenChangedCount = 0;
  //   const FooEl = CustomElement.define({
  //     name: 'foo-el',
  //     template: `<template>\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt"></foo-el></template>`
  //   }, class {
  //     public static shadowOptions = { mode: 'open' };
  //     public static bindables = {
  //       cnt: { property: 'cnt', attribute: 'cnt' },
  //       max: { property: 'max', attribute: 'max' },
  //       cur: { property: 'cur', attribute: 'cur' },
  //       txt: { property: 'txt', attribute: 'txt' }
  //     };
  //     public $children;
  //     public attached() {
  //       childrenCount += this.$children.length;
  //     }
  //     public $childrenChanged() {
  //       childrenChangedCount++;
  //     }
  //   });
  //   const App = CustomElement.define({
  //     name: 'app',
  //     template: `<template><foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt" ref.bind="'foo'+i"></foo-el></template>`
  //   }, class {
  //     public static shadowOptions = { mode: 'open' };
  //     public cnt = 10;
  //     public max = 3;
  //     public txt = 'a';
  //     public $children;
  //   });
  //   const container = ctx.container;
  //   container.register(FooEl);
  //   const au = new Aurelia(container);
  //   const host = ctx.createElement('div');
  //   const component = new App();
  //   au.app({ host, component });

  //   au.start();

  //   assert.strictEqual(getVisibleText(au, host).length, 1110, `getVisibleText(au, host).length`);
  //   assert.strictEqual(getVisibleText(au, host), 'a'.repeat(1110), `getVisibleText(au, host)`);

  //   assert.strictEqual(childrenChangedCount, 0, `childrenChangedCount`);

  //   assert.strictEqual(childrenCount, 1100, `childrenCount`);
  //   assert.strictEqual(component['$children'].length, 10, `component['$children'].length`);

  //   component['cnt'] = 11;

  //   await Promise.resolve();

  //   // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
  //   if (typeof window !== 'undefined') {
  //     assert.strictEqual(component['$children'].length, 11, `component['$children'].length`);
  //     assert.strictEqual(childrenChangedCount, 110, `childrenChangedCount`);
  //     assert.strictEqual(childrenCount, 1100 + 110 * 2 + 11 * 2, `childrenCount`);
  //   }

  //   au.stop();
  //   assert.strictEqual(getVisibleText(au, host), '', `getVisibleText(au, host)`);
  // });

  // // repeater with custom element
  // it('203.', function () {
  //   @customElement({ name: 'foo', template: '<template>a</template>', instructions: [] })
  //   class Foo { }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo repeat.for="i of count & keyed"></foo></template>`, null, Foo);
  //   component.count = 3;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with different name than outer property
  // it('204.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo text.bind="theText" repeat.for="i of count & keyed"></foo></template>`, class {
  //     public theText = 'b';
  //   }, Foo);
  //   component.count = 3;
  //   component.theText = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with same name as outer property
  // it('205.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo text.bind="text" repeat.for="i of count & keyed"></foo></template>`, class {
  //     public text = 'b';
  //   }, Foo);
  //   component.count = 3;
  //   component.text = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with different name than outer property, reversed, undefined property
  // it('206.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo repeat.for="i of count & keyed" text.bind="theText"></foo></template>`, null, Foo);

  //   component.count = 3;
  //   component.theText = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'undefinedundefinedundefined', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with same name as outer property, reversed, undefined property
  // it('207.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text: string; }
  //   const { au, lifecycle, host, component } = setupAndStart(ctx, `<template><foo repeat.for="i of count & keyed" text.bind="text"></foo></template>`, null, Foo);
  //   component.count = 3;
  //   component.text = 'a';
  //   lifecycle.processFlushQueue(LifecycleFlags.none);

  //   assert.strictEqual(host.textContent, 'undefinedundefinedundefined', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with different name than outer property, reversed
  // it('208.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count & keyed" text.bind="theText"></foo></template>`, null, Foo);
  //   component.theText = 'a';
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element + inner bindable with same name as outer property, reversed
  // it('209.', function () {
  //   @customElement({ name: 'foo', template: '<template><div>${text}</div></template>', instructions: [] })
  //   class Foo { @bindable public text; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count & keyed" text.bind="theText"></foo></template>`, null, Foo);
  //   component.theText = 'a';
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'aaa', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  //   assert.strictEqual(host.textContent, '', `host.textContent`);
  // });

  // // repeater with custom element with repeater
  // it('210.', function () {
  //   @customElement({ name: 'foo', template: '<template><div repeat.for="item of todos & keyed">${item}</div></template>', instructions: [] })
  //   class Foo { @bindable public todos: any[]; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count & keyed" todos.bind="todos"></foo></template>`, null, Foo);
  //   component.todos = ['a', 'b', 'c'];
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

  //   component.count = 1;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abc', `host.textContent`);

  //   component.count = 3;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  // });

  // // repeater with custom element with repeater, nested arrays
  // it('211.', function () {
  //   @customElement({ name: 'foo', template: '<template><div repeat.for="innerTodos of todos & keyed"><div repeat.for="item of innerTodos & keyed">${item}</div></div></template>', instructions: [] })
  //   class Foo { @bindable public todos: any[]; }
  //   const { au, lifecycle, host, component } = createFixture(ctx, `<template><foo repeat.for="i of count & keyed" todos.bind="todos"></foo></template>`, null, Foo);
  //   component.todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']];
  //   component.count = 3;

  //   au.app({ host, component }).start();

  //   assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);

  //   component.count = 1;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

  //   component.count = 3;
  //   lifecycle.processFlushQueue(LifecycleFlags.none);
  //   assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);

  //   tearDown(au, lifecycle, host);
  // });

  // TODO: figure out why repeater in keyed mode gives different numbers
  // // repeater with custom element and children observer
  // it('212.', async function () {
  //   this.timeout(10000);
  //   let childrenCount = 0;
  //   let childrenChangedCount = 0;
  //   const FooEl = CustomElement.define({
  //     name: 'foo-el',
  //     template: `<template>\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt & keyed"></foo-el></template>`
  //   },                                         class {
  //     public static shadowOptions = { mode: 'open' };
  //     public static bindables = {
  //       cnt: { property: 'cnt', attribute: 'cnt' },
  //       max: { property: 'max', attribute: 'max' },
  //       cur: { property: 'cur', attribute: 'cur' },
  //       txt: { property: 'txt', attribute: 'txt' }
  //     };
  //     public $children;
  //     public attached() {
  //       childrenCount += this.$children.length;
  //     }
  //     public $childrenChanged() {
  //       childrenChangedCount++;
  //     }
  //   });
  //   const App = CustomElement.define({
  //     name: 'app',
  //     template: `<template><foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt & keyed" ref.bind="'foo'+i"></foo-el></template>`
  //   },                                       class {
  //     public static shadowOptions = { mode: 'open' };
  //     public cnt = 10;
  //     public max = 3;
  //     public txt = 'a';
  //     public $children;
  //   });
  //   const container = ctx.container;
  //   container.register(FooEl);
  //   const au = new Aurelia(container);
  //   const host = ctx.createElement('div');
  //   const component = new App();
  //   au.app({ host, component });

  //   au.start();

  //   assert.strictEqual(getVisibleText(au, host).length, 1110, `getVisibleText(au, host).length`);
  //   assert.strictEqual(getVisibleText(au, host), 'a'.repeat(1110), `getVisibleText(au, host)`);

  //   assert.strictEqual(childrenChangedCount, 0, `childrenChangedCount`);

  //   assert.strictEqual(childrenCount, 1100, `childrenCount`);
  //   assert.strictEqual(component['$children'].length, 10, `component['$children'].length`);

  //   component['cnt'] = 11;

  //   await Promise.resolve();

  //   // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
  //   if (typeof window !== 'undefined') {
  //     assert.strictEqual(component['$children'].length, 11, `component['$children'].length`);
  //     assert.strictEqual(childrenChangedCount, 110, `childrenChangedCount`);
  //     assert.strictEqual(childrenCount, 1100 + 110 * 2 + 11 * 2, `childrenCount`);
  //   }

  //   au.stop();
  //   assert.strictEqual(getVisibleText(au, host), '', `getVisibleText(au, host)`);
  // });

});

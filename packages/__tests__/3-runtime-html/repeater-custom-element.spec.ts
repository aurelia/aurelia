/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-template-curly-in-string */
import { Class } from '@aurelia/kernel';
import {
  customElement,
  bindable,
  CustomElement,
  Aurelia,
  IPlatform,
  ICustomElementViewModel,
  ICustomElementController,
} from '@aurelia/runtime-html';
import {
  assert,
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
      assert.strictEqual(host.textContent, '', `host.textContent`);
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
        `<let items.bind="[{p: 1}, {p: 2}, {p: 3}]"></let>` +
        `<template repeat.for="item of items">
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
            <let id.bind="null"></let>
            <bar id.from-view="id"></bar>
            <foo prop.bind="id"></foo>
          </template>
        </template>`,
    };
    $it('from-view integration', async function ({ platform, host }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.html.innerEqual(host, '<bar id.from-view="id" class="au">bar</bar> <foo prop.bind="id" class="au">1</foo> <bar id.from-view="id" class="au">bar</bar> <foo prop.bind="id" class="au">2</foo>', `host.textContent`);
    }, setup);
  }

  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public theText = 'b';
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo text.bind="theText" repeat.for="i of count"></foo>`,
    };

    $it('repeater with custom element + inner bindable with different name than outer property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.theText = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public text = 'b';
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo text.bind="text" repeat.for="i of count"></foo>`,
    };

    $it('repeater with custom element + inner bindable with same name as outer property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.text = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }

  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public theText: string;
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count" text.bind="theText"></foo>`,
    };
    $it('repeater with custom element + inner bindable with different name than outer property, reversed - uninitialized property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.theText = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public text: string;
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count" text.bind="text"></foo>`,
    };

    $it('repeater with custom element + inner bindable with same name as outer property, reversed - uninitialized property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.text = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text; }
    class App {
      public theText: string = 'a';
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count" text.bind="theText"></foo>`,
    };
    $it('repeater with custom element + inner bindable with different name than outer property, reversed - initialized property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text; }
    class App {
      public theText: string = 'a';
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count" text.bind="theText"></foo>`,
    };
    $it('repeater with custom element + inner bindable with same name as outer property, reversed - initialized property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div repeat.for="item of todos">${item}</div>', instructions: [] })
    class Foo { @bindable public todos: any[]; }
    class App {
      public todos = ['a', 'b', 'c'];
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count" todos.bind="todos"></foo>`,
    };
    $it('repeater with custom element with repeater', async function ({ platform, host, app }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

      app.count = 1;
      await q.yield();
      assert.strictEqual(host.textContent, 'abc', `host.textContent`);

      app.count = 3;
      await q.yield();
      assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div repeat.for="innerTodos of todos"><div repeat.for="item of innerTodos">${item}</div></div>', instructions: [] })
    class Foo { @bindable public todos: any[]; }
    class App {
      public todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']];
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count" todos.bind="todos"></foo>`,
    };

    $it('repeater with custom element with repeater, nested arrays', async function ({ platform, host, app }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);

      app.count = 1;
      await q.yield();
      assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

      app.count = 3;
      await q.yield();
      assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);
    }, setup);
  }
  {
    let childrenCount = 0;
    @customElement({
      name: 'foo-el',
      template: `\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt"></foo-el>`,
      shadowOptions: { mode: 'open' }
    })
    class FooEl implements ICustomElementViewModel {
      @bindable public cnt;
      @bindable public max;
      @bindable public cur;
      @bindable public txt;
      public $controller: ICustomElementController<this>;
      public attached() {
        childrenCount += this.$controller.children.length;
      }
    }
    @customElement({
      name: 'app',
      shadowOptions: { mode: 'open' }
    })
    class App implements ICustomElementViewModel {
      public cnt = 10;
      public max = 3;
      public txt = 'a';
      public $controller: ICustomElementController<this>;
    }

    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [FooEl],
      template: `<foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt" ref.bind="'foo'+i"></foo-el>`,
    };
    $it('repeater with custom element and children observer', async function ({ host, app }: TestExecutionContext<App>) {
      const content = getVisibleText(host, true);
      let expectedCount = 10 + 10 ** 2 + 10 ** 3;
      assert.strictEqual(content.length, expectedCount, `getVisibleText(au, host).length`);
      assert.strictEqual(content, 'a'.repeat(expectedCount), `getVisibleText(au, host)`);

      assert.strictEqual(childrenCount, expectedCount, `childrenCount #1`);
      assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length #1`);

      app.cnt = 11;

      await Promise.resolve();

      // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
      if (typeof window !== 'undefined') {
        expectedCount += 11 + 11 ** 2 + 11 ** 3;
        assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length #2`);
        assert.strictEqual(childrenCount, expectedCount, `childrenCount #2`);
      }
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: 'a', instructions: [] })
    class Foo { }

    class App {
      public count: number;
    }

    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed"></foo>`,
    };
    $it('repeater with custom element', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public theText = 'b';
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo text.bind="theText" repeat.for="i of count & keyed"></foo>`,
    };
    $it('repeater with custom element + inner bindable with different name than outer property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.theText = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public text = 'b';
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo text.bind="text" repeat.for="i of count & keyed"></foo>`,
    };
    $it('repeater with custom element + inner bindable with same name as outer property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.text = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public theText = 'b';
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed" text.bind="theText"></foo>`,
    };
    $it('repeater with custom element + inner bindable with different name than outer property, reversed, uninitialized property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.theText = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text: string; }
    class App {
      public text = 'b';
      public count: number;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed" text.bind="text"></foo>`,
    };
    $it('repeater with custom element + inner bindable with same name as outer property, reversed, uninitialized property', async function ({ platform, host, app }: TestExecutionContext<App>) {
      assert.strictEqual(host.textContent, '', `host.textContent`);
      app.count = 3;
      app.text = 'a';
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text; }
    class App {
      public theText = 'a';
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed" text.bind="theText"></foo>`,
    };
    $it('repeater with custom element + inner bindable with different name than outer property, reversed', async function ({ platform, host }: TestExecutionContext<App>) {
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div>${text}</div>', instructions: [] })
    class Foo { @bindable public text; }
    class App {
      public theText = 'a';
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed" text.bind="theText"></foo>`,
    };
    $it('repeater with custom element + inner bindable with same name as outer property, reversed', async function ({ platform, host, app }: TestExecutionContext<App>) {
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, 'aaa', `host.textContent`);
    }, setup);
  }
  {
    @customElement({ name: 'foo', template: '<div repeat.for="item of todos & keyed">${item}</div>', instructions: [] })
    class Foo { @bindable public todos: any[]; }
    class App {
      public todos = ['a', 'b', 'c'];
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed" todos.bind="todos"></foo>`,
    };
    $it('repeater with custom element with repeater', async function ({ platform, host, app }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

      app.count = 1;
      await q.yield();
      assert.strictEqual(host.textContent, 'abc', `host.textContent`);

      app.count = 3;
      await q.yield();
      assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);
    }, setup);
  }
  {

    @customElement({ name: 'foo', template: '<div repeat.for="innerTodos of todos & keyed"><div repeat.for="item of innerTodos & keyed">${item}</div></div>', instructions: [] })
    class Foo { @bindable public todos: any[]; }
    class App {
      public todos = [['a', 'b', 'c'], ['a', 'b', 'c'], ['a', 'b', 'c']];
      public count: number = 3;
    }
    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [Foo],
      template: `<foo repeat.for="i of count & keyed" todos.bind="todos"></foo>`,
    };

    $it('repeater with custom element with repeater, nested arrays', async function ({ platform, host, app }: TestExecutionContext<App>) {
      const q = platform.domWriteQueue;
      await q.yield();

      assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);

      app.count = 1;
      await q.yield();
      assert.strictEqual(host.textContent, 'abcabcabc', `host.textContent`);

      app.count = 3;
      await q.yield();
      assert.strictEqual(host.textContent, 'abcabcabcabcabcabcabcabcabc', `host.textContent`);
    }, setup);
  }
  // TODO: figure out why repeater in keyed mode gives different numbers
  {
    let childrenCount = 0;
    @customElement({
      name: 'foo-el',
      template: `\${txt}<foo-el if.bind="cur<max" cnt.bind="cnt" max.bind="max" cur.bind="cur+1" txt.bind="txt" repeat.for="i of cnt"></foo-el>`,
      shadowOptions: { mode: 'open' }
    })
    class FooEl implements ICustomElementViewModel {
      @bindable public cnt;
      @bindable public max;
      @bindable public cur;
      @bindable public txt;
      public $controller: ICustomElementController<this>;
      public attached() {
        childrenCount += this.$controller.children.length;
      }
    }
    @customElement({
      name: 'app',
      shadowOptions: { mode: 'open' }
    })
    class App implements ICustomElementViewModel {
      public cnt = 10;
      public max = 3;
      public txt = 'a';
      public $controller: ICustomElementController<this>;
    }

    const setup: Partial<TestSetupContext<App>> = {
      app: App,
      registrations: [FooEl],
      template: `<foo-el cnt.bind="cnt" max.bind="max" cur="0" txt.bind="txt" repeat.for="i of cnt" ref.bind="'foo'+i"></foo-el>`,
    };
    $it('repeater with custom element and children observer', async function ({ platform, host, app }: TestExecutionContext<App>) {
      const content = getVisibleText(host, true);

      let expectedCount = 10 + 10 ** 2 + 10 ** 3;
      assert.strictEqual(content.length, expectedCount, `getVisibleText(au, host).length`);
      assert.strictEqual(content, 'a'.repeat(expectedCount), `getVisibleText(au, host)`);

      assert.strictEqual(childrenCount, expectedCount, `childrenCount - #1`);
      assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length - #1`);

      app['cnt'] = 11;

      await Promise.resolve();

      // TODO: find out why this shadow dom mutation observer thing doesn't work correctly in jsdom
      if (typeof window !== 'undefined') {
        expectedCount += 11 + 11 ** 2 + 11 ** 3;
        assert.strictEqual(app.$controller.children.length, 1, `app['$children'].length - #2`);
        assert.strictEqual(childrenCount, expectedCount, `childrenCount - #2`);
      }
    }, setup);
  }
});

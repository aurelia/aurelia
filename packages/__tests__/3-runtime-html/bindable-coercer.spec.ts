/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Class, DI, Registration } from '@aurelia/kernel';
import { RuntimeHtmlConfigurationOptions, Aurelia, bindable, customElement, CustomElement, IPlatform, StandardConfiguration } from '@aurelia/runtime-html';
import { assert, PLATFORMRegistration, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util.js';

describe('bindable-coercer.spec.ts', function () {
  interface TestSetupContext<TApp> {
    template: string;
    registrations: any[];
    app: Class<TApp>;
  }
  const $it = createSpecFunction(testRepeatForCustomElement);
  async function testRepeatForCustomElement<TApp>(
    testFunction: TestFunction<TestExecutionContext<TApp>>,
    {
      template,
      registrations = [],
      app,
    }: Partial<TestSetupContext<TApp>>
  ) {
    const ctx = TestContext.create();
    // const container = (ctx as any)._container = DI.createContainer();
    // StandardConfiguration.customize((opt) => { opt.coerceBindables = true; }).register(container);
    // container.register(Registration.instance(TestContext, ctx));
    // if (container.has(IPlatform, true) === false) {
    //   container.register(PLATFORMRegistration);
    // }
    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    await au
      .register(
        MyEl,
        ...registrations
      )
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
  class Person {
    public static coerced: number = 0;
    public constructor(
      public readonly name: string,
      public readonly age: number,
    ) { }

    public static createFrom(value: unknown): Person {
      this.coerced++;
      if (typeof value === 'string') {
        try {
          const json = JSON.parse(value) as Person;
          return new Person(json.name, json.age);
        } catch {
          return new Person(value, null!);
        }
      }
      if (typeof value === 'number') {
        return new Person(null!, value);
      }
      return new Person(null!, null!);
    }
  }

  @customElement({ name: 'my-el', template: 'irrelevant' })
  class MyEl {
    @bindable({ type: Number }) public num: number;
    @bindable public str: string;
    @bindable public bool: boolean;
    @bindable public person: Person;
    @bindable public $any: any;
  }

  {
    class App {
      public readonly myEl!: MyEl;
    }
    $it('number - numeric string', function (ctx: TestExecutionContext<App>) {
      assert.strictEqual(ctx.app.myEl.num, 42);
    }, { app: App, template: `<my-el view-model.ref="myEl" num="42"></my-el>` });
  }
});

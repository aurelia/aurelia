import { IContainer } from '@aurelia/kernel';
import { Aurelia, CustomElement, IScheduler } from '@aurelia/runtime';
import { assert, HTMLTestContext, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util';

describe.only('au-slot', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
  }
  class AuSlotTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IScheduler;
    public constructor(
      public ctx: HTMLTestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: any,
    ) { }
    public get scheduler(): IScheduler { return this._scheduler ?? (this._scheduler = this.container.get(IScheduler)); }
  }

  async function testAuSlot(
    testFunction: TestFunction<AuSlotTestExecutionContext>,
    { template, registrations }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.createHTMLTestContext();

    const host = ctx.dom.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    await au
      .register(...registrations)
      .app({
        host,
        component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
      })
      .start()
      .wait();

    const app = au.root.viewModel;
    await testFunction(new AuSlotTestExecutionContext(ctx, container, host, app));

    await au.stop().wait();
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testAuSlot);

  class App {
    public readonly message: string = 'root';
  }

  $it(`shows fallback content`,
    function ({ host }) {
      assert.html.textContent(host, 'static default s1 s2');
    },
    {
      template: `<my-element></my-element>`,
      registrations: [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ]
    });

  $it(`shows projected content`,
    function ({ host }) {
      assert.html.textContent(host, 'static d p1 s2');
    },
    {
      template: `<my-element><div au-slot="default">d</div><div au-slot="s1">p1</div></my-element>`,
      registrations: [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ]
    });

  $it(`supports n-1 projections`,
    function ({ host }) {
      assert.html.innerEqual('my-element', `static default <div>p11</div><div>p12</div> <div>p2</div>`, 'my-element.innerHTML', host);
    },
    {
      template: `<my-element> <div au-slot="s1">p11</div> <div au-slot="s2">p2</div> <div au-slot="s1">p12</div> </my-element>`,
      registrations: [
        CustomElement.define({ name: 'my-element', isStrictBinding: true, template: `static <au-slot>default</au-slot> <au-slot name="s1">s1</au-slot> <au-slot name="s2">s2</au-slot>` }, class MyElement { }),
      ]
    });
});

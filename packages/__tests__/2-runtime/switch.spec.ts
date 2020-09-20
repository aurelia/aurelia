import { DI, IContainer, Registration } from '@aurelia/kernel';
import { Aurelia, CustomElement, IScheduler } from '@aurelia/runtime';
import { assert, HTMLTestContext, TestContext } from '@aurelia/testing';
import { createSpecFunction, TestExecutionContext, TestFunction } from '../util';

describe('switch', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
    initialStatus: Status;
  }
  class SwitchTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IScheduler;
    public constructor(
      public ctx: HTMLTestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public error: Error | null,
    ) { }
    public get scheduler(): IScheduler { return this._scheduler ?? (this._scheduler = this.container.get(IScheduler)); }
  }

  async function testSwitch(
    testFunction: TestFunction<SwitchTestExecutionContext>,
    { template, registrations = [], initialStatus = Status.received }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.createHTMLTestContext();

    const host = ctx.dom.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;
    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    try {
      await au
        .register(
          ...registrations,
          Registration.instance(InitialStatus, initialStatus)
        )
        .app({
          host,
          component: CustomElement.define({ name: 'app', isStrictBinding: true, template }, App)
        })
        .start()
        .wait();
      app = au.root.viewModel as App;
    } catch (e) {
      error = e;
    }

    await testFunction(new SwitchTestExecutionContext(ctx, container, host, app, error));

    if (error === null) {
      await au.stop().wait();
    }
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testSwitch);

  const enum Status {
    received = 'received',
    processing = 'processing',
    dispatched = 'dispatched',
    delivered = 'delivered',
  }
  const InitialStatus = DI.createInterface<Status>('InitialStatus').noDefault();

  class App {
    public constructor(
      @InitialStatus public status: Status,
    ) { }
  }

  class TestData implements TestSetupContext {
    public constructor(
      public readonly name: string,
      public readonly initialStatus: Status,
      public readonly template: string,
      public readonly registrations: any[],
      public readonly expectedInnerHtml: string,
      public readonly additionalAssertions: ((ctx: SwitchTestExecutionContext) => Promise<void> | void) | null = null,
    ) { }
  }

  function* getTestData() {
    const enumTemplate = `
    <template>
      <template switch.bind="status">
        <span case="received">Order received.</span>
        <span case="dispatched">On the way.</span>
        <span case="processing">Processing your order.</span>
        <span case="delivered">Delivered.</span>
        <span default-case>Not found.</span>
      </template>
    </template>`;

    yield new TestData(
      'works for simple switch-case',
      Status.processing,
      enumTemplate,
      [],
      '<span>Processing your order.</span>'
    );

    yield new TestData(
      'supports default-case',
      'foo' as unknown as Status,
      enumTemplate,
      [],
      '<span>Not found.</span>'
    );

    yield new TestData(
      'reacts to switch value change',
      Status.dispatched,
      enumTemplate,
      [],
      '<span>On the way.</span>',
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML');
      }
    );
  }

  for (const data of getTestData()) {
    $it(data.name,
      async function (ctx) {

        assert.strictEqual(ctx.error, null);
        assert.html.innerEqual(ctx.host, data.expectedInnerHtml, 'innerHTML');

        const additionalAssertions = data.additionalAssertions;
        if (additionalAssertions !== null) {
          await additionalAssertions(ctx);
        }
      },
      data);
  }
});

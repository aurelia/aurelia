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
    assert.html.innerEqual(host, '', 'post-detach innerHTML');
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testSwitch);

  const enum Status {
    received = 'received',
    processing = 'processing',
    dispatched = 'dispatched',
    delivered = 'delivered',
    unknown = 'unknown',
  }
  const InitialStatus = DI.createInterface<Status>('InitialStatus').noDefault();

  class App {
    public status1: Status = Status.received;
    public status2: Status = Status.processing;
    public statuses: Status[] = [Status.received, Status.processing];
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
      'reacts to switch value change',
      Status.dispatched,
      enumTemplate,
      [],
      '<span>On the way.</span>',
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');

        ctx.app.status = Status.unknown;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '', 'change innerHTML2');

        ctx.app.status = Status.received;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'change innerHTML1');
      }
    );

    const templateWithDefaultCase = `
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
      'supports default-case',
      Status.unknown,
      templateWithDefaultCase,
      [],
      '<span>Not found.</span>'
    );

    yield new TestData(
      'reacts to switch value change - default case',
      Status.dispatched,
      templateWithDefaultCase,
      [],
      '<span>On the way.</span>',
      async (ctx) => {
        ctx.app.status = Status.unknown;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Not found.</span>', 'change innerHTML');
      }
    );

    yield new TestData(
      'supports case.bind - #1',
      Status.processing,
      `
    <template>
      <template switch.bind="true">
        <span case.bind="status === 'received'">Order received.</span>
        <span case.bind="status === 'processing'">Processing your order.</span>
        <span case.bind="status === 'dispatched'">On the way.</span>
        <span case.bind="status === 'delivered'">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>Processing your order.</span>',
      async (ctx) => {
        ctx.app.status = Status.dispatched;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports case.bind - #2',
      Status.processing,
      `
    <template>
      <template switch.bind="status">
        <span case.bind="status1">Order received.</span>
        <span case.bind="status2">Processing your order.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>Processing your order.</span>',
      async (ctx) => {
        ctx.app.status = Status.dispatched;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');

        ctx.app.status1 = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'no-change innerHTML2');

        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'no-change innerHTML3');
      }
    );

    yield new TestData(
      'supports multi-case',
      Status.processing,
      `
    <template>
      <template switch.bind="status">
        <span case.bind="['received', 'processing']">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>Processing.</span>',
      async (ctx) => {
        ctx.app.status = Status.dispatched;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');

        ctx.app.status = Status.received;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML2');
      }
    );

    yield new TestData(
      'supports multi-case collection change - #1',
      Status.received,
      `
    <template>
      <template switch.bind="status">
        <span case.bind="statuses">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>Processing.</span>',
      async (ctx) => {
        ctx.app.status = Status.dispatched;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');

        ctx.app.statuses = [Status.dispatched];
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML2');
      }
    );

    yield new TestData(
      'supports multi-case collection change - #2',
      Status.dispatched,
      `
    <template>
      <template switch.bind="status">
        <span case.bind="statuses">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>On the way.</span>',
      async (ctx) => {
        // ctx.app.statuses.push(Status.dispatched);
        ctx.app.statuses = [ctx.app.status = Status.dispatched];
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports multi-case collection mutation',
      Status.dispatched,
      `
    <template>
      <template switch.bind="status">
        <span case.bind="statuses">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>On the way.</span>',
      async (ctx) => {
        ctx.app.statuses.push(ctx.app.status = Status.dispatched);
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML1');
      }
    );

    const fallThroughTemplate = `
      <template>
        <template switch.bind="status">
          <span case="received">Order received.</span>
          <span case="value.bind:'dispatched'; fall-through.bind:true">On the way.</span>
          <span case="value.bind:'processing'; fall-through.bind:true">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </template>
      </template>`;

    yield new TestData(
      'supports fall-through #1',
      Status.dispatched,
      fallThroughTemplate,
      [],
      '<span>On the way.</span><span>Processing your order.</span><span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports fall-through #2',
      Status.delivered,
      fallThroughTemplate,
      [],
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span><span>Delivered.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports fall-through #3',
      Status.delivered,
      `
    <template>
      <template switch.bind="true">
        <span case.bind="status === 'received'">Order received.</span>
        <span case="value.bind:status === 'processing'; fall-through.bind:true">Processing your order.</span>
        <span case="value.bind:status === 'dispatched'; fall-through.bind:true">On the way.</span>
        <span case.bind="status === 'delivered'">Delivered.</span>
      </template>
    </template>`,
      [],
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span><span>Processing your order.</span><span>Delivered.</span>', 'change innerHTML1');
      }
    );
    // valueConverter
    // bindingBehavior
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

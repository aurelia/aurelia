import {
  DI,
  IContainer,
  Registration,
} from '@aurelia/kernel';
import {
  Aurelia,
  bindable,
  bindingBehavior,
  BindingBehaviorInstance,
  customElement,
  CustomElement,
  IBinding,
  IScheduler,
  IScope,
  LifecycleFlags,
  valueConverter,
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

describe('switch', function () {
  interface TestSetupContext {
    template: string;
    registrations: any[];
    initialStatus: Status;
    initialStatusNum: StatusNum;
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
    {
      template,
      registrations = [],
      initialStatus = Status.unknown,
      initialStatusNum = StatusNum.unknown,
    }: Partial<TestSetupContext> = {}
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
          Registration.instance(InitialStatus, initialStatus),
          Registration.instance(InitialStatusNum, initialStatusNum),
          ToStatusStringValueConverter,
          NoopBindingBehavior,
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
    unknown = 'unknown',
    received = 'received',
    processing = 'processing',
    dispatched = 'dispatched',
    delivered = 'delivered',
  }

  const enum StatusNum {
    unknown = 0,
    received = 1,
    processing = 2,
    dispatched = 3,
    delivered = 4,
  }

  const InitialStatus = DI.createInterface<Status>('InitialStatus').noDefault();
  const InitialStatusNum = DI.createInterface<StatusNum>('InitialStatusNum').noDefault();

  @valueConverter('toStatusString')
  class ToStatusStringValueConverter {
    public toView(value: StatusNum): string {
      switch (value) {
        case StatusNum.received:
          return Status.received;
        case StatusNum.processing:
          return Status.processing;
        case StatusNum.dispatched:
          return Status.dispatched;
        case StatusNum.delivered:
          return Status.delivered;
        case StatusNum.unknown:
          return Status.unknown;
      }
    }
  }

  @bindingBehavior('noop')
  class NoopBindingBehavior implements BindingBehaviorInstance {
    public bind(_flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, _binding: IBinding): void {
      return;
    }
    public unbind(_flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, _binding: IBinding): void {
      return;
    }
  }

  class App {
    public status1: Status = Status.received;
    public status2: Status = Status.processing;
    public statuses: Status[] = [Status.received, Status.processing];
    public constructor(
      @InitialStatus public status: Status,
      @InitialStatusNum public statusNum: StatusNum,
    ) { }
  }

  class TestData implements TestSetupContext {
    public readonly initialStatus: Status;
    public readonly template: string;
    public readonly registrations: any[];
    public readonly initialStatusNum: StatusNum;
    public constructor(
      public readonly name: string,
      {
        initialStatus = Status.unknown,
        initialStatusNum = StatusNum.unknown,
        registrations = [],
        template,
      }: Partial<TestSetupContext>,
      public readonly expectedInnerHtml: string,
      public readonly additionalAssertions: ((ctx: SwitchTestExecutionContext) => Promise<void> | void) | null = null,
    ) {
      this.initialStatus = initialStatus;
      this.initialStatusNum = initialStatusNum;
      this.registrations = registrations;
      this.template = template;
    }
  }

  function* getTestData() {

    @customElement({ name: 'my-echo', template: `Echoed '\${message}'` })
    class MyEcho {
      @bindable public message: string;
    }

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
      {
        initialStatus: Status.processing,
        template: enumTemplate,
      },
      '<span>Processing your order.</span>'
    );

    yield new TestData(
      'reacts to switch value change',
      {
        initialStatus: Status.dispatched,
        template: enumTemplate
      },
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
      {
        initialStatus: Status.unknown,
        template: templateWithDefaultCase
      },
      '<span>Not found.</span>'
    );

    yield new TestData(
      'reacts to switch value change - default case',
      {
        initialStatus: Status.dispatched,
        template: templateWithDefaultCase,
      },
      '<span>On the way.</span>',
      async (ctx) => {
        ctx.app.status = Status.unknown;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Not found.</span>', 'change innerHTML');
      }
    );

    yield new TestData(
      'supports case.bind - #1',
      {
        initialStatus: Status.processing,
        template: `
    <template>
      <template switch.bind="true">
        <span case.bind="status === 'received'">Order received.</span>
        <span case.bind="status === 'processing'">Processing your order.</span>
        <span case.bind="status === 'dispatched'">On the way.</span>
        <span case.bind="status === 'delivered'">Delivered.</span>
      </template>
    </template>`,
      },
      '<span>Processing your order.</span>',
      async (ctx) => {
        ctx.app.status = Status.dispatched;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports case.bind - #2',
      {
        initialStatus: Status.processing,
        template: `
    <template>
      <template switch.bind="status">
        <span case.bind="status1">Order received.</span>
        <span case.bind="status2">Processing your order.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      },
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
      {
        initialStatus: Status.processing,
        template: `
    <template>
      <template switch.bind="status">
        <span case.bind="['received', 'processing']">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      },
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
      {
        initialStatus: Status.received,
        template: `
    <template>
      <template switch.bind="status">
        <span case.bind="statuses">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      },
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
      {
        initialStatus: Status.dispatched,
        template: `
    <template>
      <template switch.bind="status">
        <span case.bind="statuses">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      },
      '<span>On the way.</span>',
      async (ctx) => {
        ctx.app.statuses = [ctx.app.status = Status.dispatched];
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports multi-case collection mutation',
      {
        initialStatus: Status.dispatched,
        template: `
    <template>
      <template switch.bind="status">
        <span case.bind="statuses">Processing.</span>
        <span case="dispatched">On the way.</span>
        <span case="delivered">Delivered.</span>
      </template>
    </template>`,
      },
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
      {
        initialStatus: Status.dispatched,
        template: fallThroughTemplate,
      },
      '<span>On the way.</span> <span>Processing your order.</span> <span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports fall-through #2',
      {
        initialStatus: Status.delivered,
        template: fallThroughTemplate,
      },
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll(2);
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span> <span>Delivered.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports fall-through #3',
      {
        initialStatus: Status.delivered,
        template: `
    <template>
      <template switch.bind="true">
        <span case.bind="status === 'received'">Order received.</span>
        <span case="value.bind:status === 'processing'; fall-through.bind:true">Processing your order.</span>
        <span case="value.bind:status === 'dispatched'; fall-through.bind:true">On the way.</span>
        <span case.bind="status === 'delivered'">Delivered.</span>
      </template>
    </template>`,
      },
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span> <span>On the way.</span> <span>Delivered.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'supports non-case elements',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <template switch.bind="status">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
          <span>foobar</span>
          <span if.bind="true">foo</span><span else>bar</span>
          <span if.bind="false">foo</span><span else>bar</span>
          <span repeat.for="i of 3">\${i}</span>
          <my-echo message="awesome possum"></my-echo>
        </template>
      </template>`,
        registrations: [MyEcho],
      },
      '<span>Delivered.</span> <span>foobar</span> <span>foo</span> <span>bar</span> <span>0</span><span>1</span><span>2</span> <my-echo message="awesome possum" class="au">Echoed \'awesome possum\'</my-echo>',
    );

    yield new TestData(
      'works with value converter for switch expression',
      {
        initialStatusNum: StatusNum.delivered,
        template: `
      <template>
        <template switch.bind="statusNum | toStatusString">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </template>
      </template>`,
      },
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.statusNum = StatusNum.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'works with value converter for case expression',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <template switch.bind="status">
          <span case.bind="1 | toStatusString">Order received.</span>
          <span case.bind="3 | toStatusString">On the way.</span>
          <span case.bind="2 | toStatusString">Processing your order.</span>
          <span case.bind="4 | toStatusString">Delivered.</span>
        </template>
      </template>`,
      },
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'works with bindingBehavior for switch expression',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <template switch.bind="status & noop">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </template>
      </template>`,
      },
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'works with bindingBehavior for case expression',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <template switch.bind="status">
          <span case.bind="'received' & noop">Order received.</span>
          <span case.bind="'dispatched' & noop">On the way.</span>
          <span case.bind="'processing' & noop">Processing your order.</span>
          <span case.bind="'delivered' & noop">Delivered.</span>
        </template>
      </template>`,
      },
      '<span>Delivered.</span>',
      async (ctx) => {
        ctx.app.status = Status.processing;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'works with repeater - switch expression',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <div repeat.for="s of ['received', 'dispatched']">
          <template switch.bind="s">
            <span case="received">Order received.</span>
            <span case="dispatched">On the way.</span>
            <span case="processing">Processing your order.</span>
            <span case="delivered">Delivered.</span>
          </template>
        </div>
      </template>`,
      },
      '<div> <span>Order received.</span> </div><div> <span>On the way.</span> </div>',
    );

    yield new TestData(
      'supports nested switch',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <let day.bind="2"></let>
        <template switch.bind="status">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered" switch.bind="day">
            Expected to be delivered
            <template case.bind="1">tomorrow.</template>
            <template case.bind="2">in 2 days.</template>
            <template default-case>in few days.</template>
          </span>
        </template>
      </template>`,
      },
      '<span> Expected to be delivered in 2 days. </span>',
    );

    yield new TestData(
      'works with local template',
      {
        initialStatus: Status.delivered,
        template: `
      <template as-custom-element="foo-bar">
        <bindable property="status"></bindable>
        <div switch.bind="status">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </div>
      </template>

      <foo-bar status.bind="status"></foo-bar>
      `,
      },
      '<foo-bar status.bind="status" class="au"> <div> <span>Delivered.</span> </div> </foo-bar>',
    );

    yield new TestData(
      'works with au-slot[case]',
      {
        initialStatus: Status.received,
        template: `
      <template as-custom-element="foo-bar">
        <bindable property="status"></bindable>
        <div switch.bind="status">
          <au-slot name="s1" case="received">Order received.</au-slot>
          <au-slot name="s2" case="dispatched">On the way.</au-slot>
          <au-slot name="s3" case="processing">Processing your order.</au-slot>
          <au-slot name="s4" case="delivered">Delivered.</au-slot>
        </div>
      </template>

      <foo-bar status.bind="status">
        <span au-slot="s1">Projection</span>
      </foo-bar>
      `,
      },
      '<foo-bar status.bind="status" class="au"> <div> <span>Projection</span> </div> </foo-bar>',
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<foo-bar status.bind="status" class="au"> <div> Delivered. </div> </foo-bar>', 'change innerHTML1');
      }
    );

    yield new TestData(
      'works with case on CE',
      {
        initialStatus: Status.received,
        template: `
      <template>
        <template switch.bind="status">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <my-echo case="delivered" message="Delivered."></my-echo>
        </template>
      </template>`,
        registrations: [MyEcho]
      },
      '<span>Order received.</span>',
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<my-echo message="Delivered." class="au">Echoed \'Delivered.\'</my-echo>', 'change innerHTML1');
      }
    );

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

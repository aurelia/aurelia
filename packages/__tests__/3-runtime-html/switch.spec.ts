import {
  DI,
  IContainer,
  Registration,
} from '@aurelia/kernel';
import {
  Aurelia,
  AuSlot,
  bindable,
  bindingBehavior,
  BindingBehaviorInstance,
  Case,
  Controller,
  CustomAttribute,
  customElement,
  CustomElement,
  DefaultCase,
  IBinding,
  INode,
  IObserverLocator,
  IRenderLocation,
  IScope,
  IViewFactory,
  LifecycleFlags,
  Repeat,
  Switch,
  templateController,
  valueConverter,
  IScheduler,
} from '@aurelia/runtime';
import {
  assert,
  createSpy,
  HTMLTestContext,
  ISpy,
  TestContext
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction
} from '../util';

describe('switch', function () {

  @templateController('switch')
  class SwitchTestDouble extends Switch {
    public clearCalls() {
      for (const $case of this['cases']) {
        $case.clearCalls();
      }
      this['defaultCase']?.clearCalls();
    }
    public async wait(): Promise<void> {
      const promise = this.promise;
      await promise;
      if (this.promise !== promise) {
        await this.wait();
      }
    }
  }

  @templateController('case')
  class CaseTestDouble<T extends INode = Node> extends Case<T> {
    public isMatchCallCount: number = 0;
    public activateSpy: ISpy;
    public deactivateSpy: ISpy;

    public constructor(
      @IViewFactory factory: IViewFactory<T>,
      @IObserverLocator locator: IObserverLocator,
      @IRenderLocation location: IRenderLocation<T>,
    ) {
      super(factory, locator, location);
      const view = this['view'];
      this.activateSpy = createSpy(view, 'activate', true);
      this.deactivateSpy = createSpy(view, 'deactivate', true);
    }

    public isMatch(value: any, flags: LifecycleFlags): boolean {
      this.isMatchCallCount++;
      return super.isMatch(value, flags);
    }

    public clearCalls() {
      this.isMatchCallCount = 0;
      this.activateSpy.reset();
      this.deactivateSpy.reset();
    }
  }

  @templateController('default-case')
  class DefaultCaseTestDouble<T extends INode = Node> extends DefaultCase<T> {
    public activateSpy: ISpy;
    public deactivateSpy: ISpy;

    public constructor(
      @IViewFactory factory: IViewFactory<T>,
      @IObserverLocator locator: IObserverLocator,
      @IRenderLocation location: IRenderLocation<T>,
    ) {
      super(factory, locator, location);
      const view = this['view'];
      this.activateSpy = createSpy(view, 'activate', true);
      this.deactivateSpy = createSpy(view, 'deactivate', true);
    }

    public clearCalls() {
      this.activateSpy.reset();
      this.deactivateSpy.reset();
    }
  }

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
      public controller: Controller,
      public error: Error | null,
    ) { }
    public get scheduler(): IScheduler { return this._scheduler ?? (this._scheduler = this.container.get(IScheduler)); }
    public getSwitchTestDoubles(controller = this.controller) {
      return controller.children
        .reduce((acc: SwitchTestDouble[], c) => {
          const vm = c.viewModel;
          if (vm instanceof SwitchTestDouble) {
            acc.push(vm);
          }
          return acc;
        }, []);
    }

    public assertCalls($switch: SwitchTestDouble, expected: SwitchCallsExpectation, message: string = '') {
      const cases: CaseTestDouble[] = $switch['cases'];
      assert.strictEqual(cases.every((c) => c instanceof CaseTestDouble), true);
      assert.deepStrictEqual(cases.map((c) => c.isMatchCallCount), expected.isMatchCallCount, `${message} - isMatch`);
      assert.deepStrictEqual(cases.map((c) => c.activateSpy.calls.length), expected.activateCallCount, `${message} - activate`);
      assert.deepStrictEqual(cases.map((c) => c.deactivateSpy.calls.length), expected.deactivateCallCount, `${message} - deactivate`);

      const defaultCaseExpectation = expected.defaultCase;
      if (defaultCaseExpectation !== void 0) {
        const actual = $switch['defaultCase'] as DefaultCaseTestDouble;
        assert.instanceOf(actual, DefaultCaseTestDouble);
        assert.deepEqual(
          {
            activateCallCount: actual.activateSpy.calls.length,
            deactivateCallCount: actual.deactivateSpy.calls.length,
          },
          defaultCaseExpectation
        );
      } else {
        assert.strictEqual($switch['defaultCase'], void 0);
      }
    }
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

    // cleanup the OOTB registrations in favor of the test doubles
    const resolvers = container["resolvers"];
    const resourceResolvers = container["resourceResolvers"];
    const switchKey = CustomAttribute.keyFrom('switch');
    const caseKey = CustomAttribute.keyFrom('case');
    const dCaseKey = CustomAttribute.keyFrom('default-case');
    /* eslint-disable @typescript-eslint/no-dynamic-delete */
    delete resourceResolvers[switchKey];
    delete resourceResolvers[caseKey];
    delete resourceResolvers[dCaseKey];
    /* eslint-enable @typescript-eslint/no-dynamic-delete */
    resolvers.delete(switchKey);
    resolvers.delete(caseKey);
    resolvers.delete(dCaseKey);

    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    let controller: Controller = null!;
    try {
      await au
        .register(
          SwitchTestDouble,
          CaseTestDouble,
          DefaultCaseTestDouble,
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
      controller = au.root.controller! as unknown as Controller;
    } catch (e) {
      error = e;
    }

    await testFunction(new SwitchTestExecutionContext(ctx, container, host, app, controller, error));

    if (error === null) {
      await au.stop().wait();
      assert.html.innerEqual(host, '', 'post-detach innerHTML');
    }
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

  class SwitchCallsExpectation {
    public constructor(
      public readonly isMatchCallCount: number[],
      public readonly activateCallCount: number[],
      public readonly deactivateCallCount?: number[],
      public readonly defaultCase?: DefaultCaseCallsExpectation,
    ) {
      if (deactivateCallCount === void 0) {
        this.deactivateCallCount = new Array(activateCallCount.length).fill(0);
      }
    }
  }

  class DefaultCaseCallsExpectation {
    public constructor(
      public readonly activateCallCount: number,
      public readonly deactivateCallCount: number,
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
      public readonly expectedInnerHtml: string = '',
      public readonly switchExpectations: SwitchCallsExpectation[] = [],
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
      '<span>Processing your order.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 0],
          [0, 0, 1, 0],
        )
      ],
    );

    yield new TestData(
      'reacts to switch value change',
      {
        initialStatus: Status.dispatched,
        template: enumTemplate
      },
      '<span>On the way.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 0, 0],
          [0, 1, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 1, 0, 0],
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.app.status = Status.unknown;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 1],
          ),
          'change2'
        );

        $switch.clearCalls();
        ctx.app.status = Status.received;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'change innerHTML3');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0],
          ),
          'change3'
        );
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
      '<span>Not found.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          new DefaultCaseCallsExpectation(1, 0)
        )
      ],
    );

    yield new TestData(
      'reacts to switch value change - default case',
      {
        initialStatus: Status.dispatched,
        template: templateWithDefaultCase,
      },
      '<span>On the way.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 0, 0],
          new DefaultCaseCallsExpectation(0, 0)
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.unknown;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Not found.</span>', 'change1 innerHTML');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            new DefaultCaseCallsExpectation(1, 0)
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change2 innerHTML');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
            new DefaultCaseCallsExpectation(0, 1)
          ),
          'change2'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.dispatched;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
          ),
          'change'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 1, 0, 0],
          [0, 1, 0, 0],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.dispatched;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 1, 0, 0],
          )
        );

        $switch.clearCalls();
        ctx.app.status1 = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'no-change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          )
        );

        $switch.clearCalls();
        ctx.app.status = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'no-change innerHTML3');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 1, 0],
          )
        );
      }
    );

    yield new TestData(
      'supports case.bind - #3',
      {
        template: `
    <template>
      <let num.bind="9"></let>
      <template switch.bind="true">
        <span case.bind="num % 3 === 0 && num % 5 === 0">FizzBuzz</span>
        <span case.bind="num % 3 === 0">Fizz</span>
        <span case.bind="num % 5 === 0">Buzz</span>
      </template>
    </template>`,
      },
      '<span>Fizz</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 0],
          [0, 1, 0],
          [0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.controller.scope.overrideContext.num = 49;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [0, 1, 0],
            [0, 0, 0],
            [0, 1, 0],
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.controller.scope.overrideContext.num = 15;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>FizzBuzz</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1],
            [1, 0, 0],
            [0, 0, 0],
          ),
          'change2'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 0, 0],
          [1, 0, 0],
          [0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.dispatched;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 0],
            [0, 1, 0],
            [1, 0, 0],
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.app.status = Status.received;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
          ),
          'change2'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 0, 0],
          [1, 0, 0],
          [0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.dispatched;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 0],
            [0, 1, 0],
            [1, 0, 0],
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.app.statuses = [Status.dispatched];
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
          ),
          'change2'
        );
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
        <span default-case>Unknown.</span>
      </template>
    </template>`,
      },
      '<span>On the way.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 0],
          [0, 1, 0],
          [0, 0, 0],
          new DefaultCaseCallsExpectation(0, 0),
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.statuses = [Status.dispatched];
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
            new DefaultCaseCallsExpectation(0, 0),
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.app.status = Status.unknown;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Unknown.</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1],
            [0, 0, 0],
            [1, 0, 0],
            new DefaultCaseCallsExpectation(1, 0),
          ),
          'change2'
        );

        $switch.clearCalls();
        ctx.app.statuses = [ctx.app.status = Status.delivered];
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [2, 1, 1],
            [1, 0, 1],
            [0, 0, 1],
            new DefaultCaseCallsExpectation(0, 1),
          ),
          'change3'
        );
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
        <span default-case>Unknown.</span>
      </template>
    </template>`,
      },
      '<span>On the way.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 0],
          [0, 1, 0],
          [0, 0, 0],
          new DefaultCaseCallsExpectation(0, 0),
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.statuses.push(Status.dispatched);
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0],
            [1, 0, 0],
            [0, 1, 0],
            new DefaultCaseCallsExpectation(0, 0),
          ),
          'change1'
        );

        $switch.clearCalls();
        ctx.app.status = Status.unknown;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Unknown.</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1],
            [0, 0, 0],
            [1, 0, 0],
            new DefaultCaseCallsExpectation(1, 0),
          ),
          'change2'
        );

        $switch.clearCalls();
        ctx.app.statuses.push(ctx.app.status = Status.delivered);
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing.</span>', 'change innerHTML2');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [2, 1, 1],
            [1, 0, 1],
            [0, 0, 1],
            new DefaultCaseCallsExpectation(0, 1),
          ),
          'change3'
        );
      }
    );

    const fallThroughTemplate = `
      <template>
        <template switch.bind="status">
          <span case="received">Order received.</span>
          <span case="value:dispatched; fall-through.bind:true">On the way.</span>
          <span case="value.bind:'processing'; fall-through:true">Processing your order.</span>
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
      [
        new SwitchCallsExpectation(
          [1, 1, 0, 0],
          [0, 1, 1, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 0], // already activated; nothing to do.
            [0, 1, 1, 0],
          ),
          'change'
        );
      }
    );

    yield new TestData(
      'supports fall-through #2',
      {
        initialStatus: Status.delivered,
        template: fallThroughTemplate,
      },
      '<span>Delivered.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span> <span>Delivered.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
          ),
          'change'
        );
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
        <span case="value.bind:status === 'processing'; fall-through:true">Processing your order.</span>
        <span case="value.bind:status === 'dispatched'; fall-through.bind:true">On the way.</span>
        <span case.bind="status === 'delivered'">Delivered.</span>
      </template>
    </template>`,
      },
      '<span>Delivered.</span>',
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span> <span>On the way.</span> <span>Delivered.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [0, 1, 0, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
          ),
          'change'
        );
      }
    );

    yield new TestData(
      'works without case',
      {
        initialStatus: Status.processing,
        template: `
        <template>
          <div switch.bind="status">
            the curious case of \${status}
          </div>
        </template>`,
      },
      '<div> the curious case of processing </div>',
      [
        new SwitchCallsExpectation(
          [],
          [],
          [],
        )
      ],
      async (ctx) => {
        ctx.app.status = Status.delivered;
        await ctx.scheduler.yieldAll();
        assert.html.innerEqual(ctx.host, '<div> the curious case of delivered </div>', 'change innerHTML1');
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
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
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
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.statusNum = StatusNum.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ),
          'change'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ),
          'change'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ),
          'change'
        );
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
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.processing;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Processing your order.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
          ),
          'change'
        );
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
      [],
      (ctx) => {
        const switches = (ctx.controller.children[0].viewModel as Repeat)
          .views
          .map((v) => v.children[0].viewModel as SwitchTestDouble);
        const ii = switches.length;
        const switchExpectations = [
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0],
          ),
          new SwitchCallsExpectation(
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
          ),
        ];
        assert.strictEqual(ii, switchExpectations.length);
        for (let i = 0; i < ii; i++) {
          ctx.assertCalls(switches[i], switchExpectations[i]);
        }
      }
    );

    yield new TestData(
      '*[switch][repeat.for] works',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <div repeat.for="s of ['received', 'dispatched']" switch.bind="s">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </div>
      </template>`,
      },
      '<div> <span>Order received.</span> </div><div> <span>On the way.</span> </div>',
      [],
      (ctx) => {
        const switches = (ctx.controller.children[0].viewModel as Repeat)
          .views
          .map((v) => v.children[0].viewModel as SwitchTestDouble);
        const ii = switches.length;
        const switchExpectations = [
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0],
          ),
          new SwitchCallsExpectation(
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
          ),
        ];
        assert.strictEqual(ii, switchExpectations.length);
        for (let i = 0; i < ii; i++) {
          ctx.assertCalls(switches[i], switchExpectations[i]);
        }
      }
    );

    // tag: nonsense example
    yield new TestData(
      '*[switch][if] works',
      {
        initialStatus: Status.delivered,
        template: `
        <div if.bind="true" switch.bind="status">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </div>
        <div if.bind="false" switch.bind="status">
          <span case="received">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </div>
      `,
      },
      '<div> <span>Delivered.</span> </div>',
    );

    // tag: nonsense example
    yield new TestData(
      '*[case][if=true]',
      {
        initialStatus: Status.delivered,
        template: `
        <div switch.bind="status">
          <span case="processing">Processing your order.</span>
          <span case="delivered" if.bind="true">Delivered.</span>
        </div>`,
      },
      '<div> <span>Delivered.</span> </div>',
      [
        new SwitchCallsExpectation(
          [1, 1],
          [0, 1],
          [0, 0],
        ),
      ]
    );

    // tag: nonsense example
    yield new TestData(
      '*[case][if=false] leads to unexpected result',
      {
        initialStatus: Status.delivered,
        template: `
        <div switch.bind="status">
          <span case="processing">Processing your order.</span>
          <span if.bind="false" case="delivered">Delivered.</span>
        </div>`,
      },
      '<div> </div>',
      [
        new SwitchCallsExpectation(
          [1],
          [0],
          [0],
        ),
      ]
    );

    // tag: nonsense example
    yield new TestData(
      '*[if=false][case] leads to unexpected result',
      {
        initialStatus: Status.delivered,
        template: `
        <div switch.bind="status">
          <span case="processing">Processing your order.</span>
          <span case="delivered" if.bind="false">Delivered.</span>
        </div>`,
      },
      '<div> </div>',
      [
        new SwitchCallsExpectation(
          [1, 1],
          [0, 1],
          [0, 0],
        ),
      ]
    );

    // tag: nonsense example
    yield new TestData(
      '*[switch]>*[case][repeat.for] leads to unexpected result',
      {
        initialStatus: Status.delivered,
        template: `
      <template>
        <template switch.bind="status">
          <span case.bind="s" repeat.for="s of ['received','dispatched','processing','delivered',]">\${s}</span>
        </template>
        <template switch.bind="status">
          <span case.bind="s" repeat.for="s of ['delivered','received','dispatched','processing',]">\${s}</span>
        </template>
      </template>`,
      },
      '',
      [
        new SwitchCallsExpectation(
          [1],
          [0],
          [0],
        ),
        new SwitchCallsExpectation(
          [1],
          [0],
          [0],
        ),
      ]
    );

    // tag: nonsense example
    yield new TestData(
      '*[switch]>*[case][repeat.for] - static case - leads to unexpected result',
      {
        initialStatus: Status.received,
        template: `
      <template>
        <template switch.bind="status">
          <span case="processing">Processing your order.</span>
          <span case="received" repeat.for="i of 3">\${i}</span>
        </template>
      </template>`,
      },
      '<span>0</span><span>1</span><span>2</span>',
      [
        new SwitchCallsExpectation(
          [1, 1],
          [0, 1],
          [0, 0],
        ),
      ]
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
      [
        new SwitchCallsExpectation(
          [1, 1, 1, 1],
          [0, 0, 0, 1],
          [0, 0, 0, 0],
        )
      ],
      (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];
        const $switch2 = ctx.getSwitchTestDoubles(($switch['cases'][3] as CaseTestDouble).view as unknown as Controller)[0];
        ctx.assertCalls(
          $switch2,
          new SwitchCallsExpectation(
            [1, 1],
            [0, 1],
            [0, 0],
            new DefaultCaseCallsExpectation(0, 0)
          )
        );
      }
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
      [],
      (ctx) => {
        const fooBarController = ctx.controller.children[0];
        const $switch = ctx.getSwitchTestDoubles(fooBarController)[0];
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [0, 0, 0, 0],
          )
        );
      }
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
      [],
      async (ctx) => {
        const fooBarController = ctx.controller.children[0];
        const $switch = ctx.getSwitchTestDoubles(fooBarController)[0];
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0],
          )
        );

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<foo-bar status.bind="status" class="au"> <div> Delivered. </div> </foo-bar>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 0],
          )
        );
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
      [
        new SwitchCallsExpectation(
          [1, 0, 0, 0],
          [1, 0, 0, 0],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<my-echo message="Delivered." class="au">Echoed \'Delivered.\'</my-echo>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 0],
          ),
          'change'
        );
      }
    );

    yield new TestData(
      'slot integration - switch wrapped with au-slot',
      {
        initialStatus: Status.received,
        template: `
      <template as-custom-element="foo-bar">
        <au-slot name="s1"></au-slot>
      </template>

      <foo-bar>
        <template au-slot="s1">
          <template switch.bind="status">
            <span case="received">Order received.</span>
            <span case="dispatched">On the way.</span>
            <span case="processing">Processing your order.</span>
            <span case="delivered">Delivered.</span>
          </template>
        </template>
      </foo-bar>
      `,
      },
      '<foo-bar class="au"> <span>Order received.</span> </foo-bar>',
      [],
      async (ctx) => {
        const fooBarController = ctx.controller.children[0];
        const auSlot: AuSlot = fooBarController.children[0].viewModel as AuSlot;
        const $switch = ctx.getSwitchTestDoubles(auSlot.view as unknown as Controller)[0];
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0],
          )
        );

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<foo-bar class="au"> <span>Delivered.</span> </foo-bar>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 0],
          ),
          'change'
        );
      }
    );

    yield new TestData(
      '*[switch] native-html-element *[case] works',
      {
        initialStatus: Status.received,
        template: `
      <template>
        <template switch.bind="status">
          <div>
            <div>
              <span case="received">Order received.</span>
              <span case="dispatched">On the way.</span>
              <span case="processing">Processing your order.</span>
              <span case="delivered">Delivered.</span>
            </div>
          </div>
        </template>
      </template>`,
      },
      `<div> <div> <span>Order received.</span> </div> </div>`,
      [
        new SwitchCallsExpectation(
          [1, 0, 0, 0],
          [1, 0, 0, 0],
          [0, 0, 0, 0],
        )
      ]
    );

    yield new TestData(
      '*[switch]>CE>*[case] works',
      {
        initialStatus: Status.dispatched,
        template: `
      <template as-custom-element="foo-bar">
        foo bar
      </template>

      <template switch.bind="status">
        <foo-bar>
          <span case="dispatched">On the way.</span>
          <span case="delivered">Delivered.</span>
        </foo-bar>
      </template>`,
      },
      '<foo-bar class="au"> <span>On the way.</span> foo bar </foo-bar>',
      [
        new SwitchCallsExpectation(
          [1, 0],
          [1, 0],
          [0, 0],
        )
      ]
    );

    yield new TestData(
      '*[switch]>CE>CE>*[case] works',
      {
        initialStatus: Status.dispatched,
        template: `
      <template as-custom-element="foo-bar">
        foo bar
      </template>
      <template as-custom-element="fiz-baz">
        fiz baz
      </template>

      <template switch.bind="status">
        <foo-bar>
          <fiz-baz>
            <span case="dispatched">On the way.</span>
            <span case="delivered">Delivered.</span>
          </fiz-baz>
        </foo-bar>
      </template>`,
      },
      '<foo-bar class="au"> <fiz-baz class="au"> <span>On the way.</span> fiz baz </fiz-baz> foo bar </foo-bar>',
      [
        new SwitchCallsExpectation(
          [1, 0],
          [1, 0],
          [0, 0],
        )
      ]
    );

    yield new TestData(
      'works with case binding changed to array and back',
      {
        initialStatus: Status.received,
        template: `
      <template>
        <let s.bind="'received'"></let>
        <template switch.bind="status">
          <span case.bind="s">Order received.</span>
          <span case="dispatched">On the way.</span>
          <span case="processing">Processing your order.</span>
          <span case="delivered">Delivered.</span>
        </template>
      </template>`,
      },
      '<span>Order received.</span>',
      [
        new SwitchCallsExpectation(
          [1, 0, 0, 0],
          [1, 0, 0, 0],
          [0, 0, 0, 0],
        )
      ],
      async (ctx) => {
        const $switch = ctx.getSwitchTestDoubles()[0];

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 0],
          ),
          'change1'
        );

        const arr = [Status.received, Status.delivered];
        const observer = ctx.container.get(IObserverLocator).getArrayObserver(LifecycleFlags.none, arr);
        const addSpy = createSpy(observer, "addCollectionSubscriber", true);
        const removeSpy = createSpy(observer, "removeCollectionSubscriber", true);

        $switch.clearCalls();
        ctx.controller.scope.overrideContext.s = arr;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 1],
          ),
          'change2'
        );
        assert.strictEqual(addSpy.calls.length, 1, 'addCollectionSubscriber count');
        assert.strictEqual(addSpy.calls[0][0], $switch['cases'][0], 'addCollectionSubscriber arg');

        $switch.clearCalls();
        ctx.app.status = Status.dispatched;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>On the way.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 0, 0, 0],
          ),
          'change3'
        );

        const arr2 = [Status.received, Status.dispatched];
        const observer2 = ctx.container.get(IObserverLocator).getArrayObserver(LifecycleFlags.none, arr2);
        const addSpy2 = createSpy(observer2, "addCollectionSubscriber", true);
        const removeSpy2 = createSpy(observer2, "removeCollectionSubscriber", true);

        $switch.clearCalls();
        ctx.controller.scope.overrideContext.s = arr2;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 1, 0, 0],
          ),
          'change4'
        );
        assert.strictEqual(removeSpy.calls.length, 1, 'addCollectionSubscriber count');
        assert.strictEqual(removeSpy.calls[0][0], $switch['cases'][0], 'addCollectionSubscriber arg');
        assert.strictEqual(addSpy2.calls.length, 1, 'addCollectionSubscriber count #2');
        assert.strictEqual(addSpy2.calls[0][0], $switch['cases'][0], 'addCollectionSubscriber arg #2');

        $switch.clearCalls();
        ctx.app.status = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Delivered.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 1, 1, 1],
            [0, 0, 0, 1],
            [1, 0, 0, 0],
          ),
          'change5'
        );

        $switch.clearCalls();
        ctx.controller.scope.overrideContext.s = Status.delivered;
        await $switch.wait();
        assert.html.innerEqual(ctx.host, '<span>Order received.</span>', 'change innerHTML1');
        ctx.assertCalls(
          $switch,
          new SwitchCallsExpectation(
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 1],
          ),
          'change6'
        );
        assert.strictEqual(removeSpy2.calls.length, 1, 'addCollectionSubscriber count #2');
        assert.strictEqual(removeSpy2.calls[0][0], $switch['cases'][0], 'addCollectionSubscriber arg #2');
      }
    );
  }

  for (const data of getTestData()) {
    $it(data.name,
      async function (ctx) {

        assert.strictEqual(ctx.error, null);
        assert.html.innerEqual(ctx.host, data.expectedInnerHtml, 'innerHTML');

        const switches = ctx.getSwitchTestDoubles();
        const ii = switches.length;
        const switchExpectations = data.switchExpectations;
        assert.strictEqual(ii, switchExpectations.length);
        for (let i = 0; i < ii; i++) {
          ctx.assertCalls(switches[i], switchExpectations[i]);
        }

        const additionalAssertions = data.additionalAssertions;
        if (additionalAssertions !== null) {
          await additionalAssertions(ctx);
        }
      },
      data);
  }

  function* getNegativeTestData() {
    yield new TestData(
      'case without switch',
      {
        template: `
        <template as-custom-element="foo-bar">
          <span case="delivered">delivered</span>
        </template>
        <foo-bar></foo-bar>
        `,
      }
    );
    yield new TestData(
      '*[switch]>*[if]>*[case]',
      {
        template: `
      <template>
        <template switch.bind="status">
          <template if.bind="true">
            <span case="delivered">delivered</span>
          </template>
        </template>
      </template>`,
      }
    );

    yield new TestData(
      '*[switch]>*[repeat.for]>*[case]',
      {
        template: `
      <template>
        <template switch.bind="status">
          <template repeat.for="s of ['received','dispatched','processing','delivered',]">
            <span case.bind="s">\${s}</span>
          </template>
        </template>
      </template>`,
      },
    );

    yield new TestData(
      '*[switch]>*[repeat.for][case]',
      {
        template: `
      <template>
        <template switch.bind="status">
          <span repeat.for="s of ['received','dispatched','processing','delivered',]" case.bind="s">\${s}</span>
        </template>
      </template>`,
      },
    );

    yield new TestData(
      '*[switch]>*[au-slot]>*[case]',
      {
        template: `
      <template as-custom-element="foo-bar">
        <au-slot name="s1"></au-slot>
      </template>

      <foo-bar switch.bind="status">
        <template au-slot="s1">
          <span case="dispatched">On the way.</span>
          <span case="delivered">Delivered.</span>
        </template>
      </foo-bar>`,
      },
    );

    yield new TestData(
      '*[if=true][case]',
      {
        template: `
        <div switch.bind="status">
          <span case="processing">Processing your order.</span>
          <span if.bind="true" case="delivered">Delivered.</span>
        </div>`,
      }
    );

    yield new TestData(
      '*[else][case]',
      {
        initialStatus: Status.delivered,
        template: `
        <div switch.bind="status">
          <span if.bind="false" case="processing">Processing your order.</span>
          <span else case="delivered">Delivered.</span>
        </div>`,
      }
    );
  }
  for (const data of getNegativeTestData()) {
    $it(`${data.name} does not work`,
      function (ctx) {
        assert.match(ctx.error.message, /The parent switch not found; only `\*\[switch\] > \*\[case\|default-case\]` relation is supported\./);
      },
      data);
  }

  $it(`multiple default-cases throws error`,
    function (ctx) {
      assert.match(ctx.error.message, /Multiple 'default-case's are not allowed./);
    },
    {
      template: `
  <template>
    <template switch.bind="status">
      <span case.bind="statuses">Processing.</span>
      <span case="dispatched">On the way.</span>
      <span default-case>dc1.</span>
      <span default-case>dc2.</span>
    </template>
  </template>`
    });

  $it(`*[case][else] throws error`,
    function (ctx) {
      /**
       * ATM the error is thrown from Else#link as controller.children is undefined.
       * But probably it is not necessary to assert that exact error here.
       */
      assert.match(ctx.error.message, /.+/);
    },
    {
      initialStatus: Status.delivered,
      template: `
        <div switch.bind="status">
          <span if.bind="false" case="processing">Processing your order.</span>
          <span case="delivered" else>Delivered.</span>
        </div>`
    });
});

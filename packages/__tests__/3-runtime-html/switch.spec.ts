import {
  DefaultLogEvent,
  DI,
  IContainer,
  ILogger,
  ISink,
  LoggerConfiguration,
  LogLevel,
  pascalCase,
  Registration,
  sink,
} from '@aurelia/kernel';
import {
  BindingBehaviorInstance,
  IBinding,
  Scope,
} from '@aurelia/runtime';
import {
  AuSlot,
  Case,
  Controller,
  bindingBehavior,
  customElement,
  CustomElement,
  Repeat,
  Switch,
  Aurelia,
  IPlatform,
  ICustomElementViewModel,
  ICustomElementController,
  bindable,
  INode,
  valueConverter,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
  TestContext,
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';

describe('3-runtime-html/switch.spec.ts', function () {

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

  const InitialStatus = DI.createInterface<Status>('InitialStatus');
  const InitialStatusNum = DI.createInterface<StatusNum>('InitialStatusNum');

  class Config {
    public constructor(
      public hasPromise: boolean,
      public hasTimeout: boolean,
      public wait: () => Promise<void>,
    ) { }

    public toString(): string {
      return `{${this.hasPromise ? this.wait.toString() : 'noWait'}}`;
    }
  }

  const IConfig = DI.createInterface<Config>('Config', x => x.singleton(Config));

  function createComponentType(name: string, template: string, bindables: string[] = []) {
    @customElement({ name, template, bindables })
    class Component implements ICustomElementViewModel {
      private logger: ILogger;
      public readonly $controller: ICustomElementController<this>;
      @bindable
      private readonly ceId: unknown = null;
      public constructor(
        @IConfig private readonly config: Config,
        @ILogger private readonly $logger: ILogger,
        @INode node: INode,
      ) {
        const ceId = (node as HTMLElement).dataset.ceId;
        if (ceId) {
          (this.logger = $logger.scopeTo(`${name}-${ceId}`)).debug('ctor');
          delete (node as HTMLElement).dataset.ceId;
        }
      }

      public async binding(): Promise<void> {
        this.logger ??= this.ceId === null ? this.$logger.scopeTo(name) : this.$logger.scopeTo(`${name}-${this.ceId}`);
        if (this.config.hasPromise) {
          await this.config.wait();
        }

        this.logger.debug('binding');
      }

      public async bound(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait();
        }

        this.logger.debug('bound');
      }

      public async attaching(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait();
        }

        this.logger.debug('attaching');
      }

      public async attached(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait();
        }

        this.logger.debug('attached');
      }

      public async detaching(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait();
        }

        this.logger.debug('detaching');
      }

      public async unbinding(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait();
        }

        this.logger.debug('unbinding');
      }
    }

    Reflect.defineProperty(Component, 'name', {
      writable: false,
      enumerable: false,
      configurable: true,
      value: pascalCase(name),
    });

    return Component;
  }

  @sink({ handles: [LogLevel.debug] })
  class DebugLog implements ISink {
    public readonly log: string[] = [];
    public handleEvent(event: DefaultLogEvent): void {
      this.log.push(`${event.scope.join('.')}.${event.message}`);
    }
    public clear() {
      this.log.length = 0;
    }
  }

  interface TestSetupContext {
    template: string;
    registrations: any[];
    initialStatus: Status;
    initialStatusNum: StatusNum;
    expectedStopLog: string[];
    verifyStopCallsAsSet: boolean;
  }
  class SwitchTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IPlatform;
    private readonly _log: DebugLog;
    private changeId: number = 0;
    public constructor(
      public ctx: TestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public controller: Controller,
      public error: Error | null,
    ) {
      this._log = container.get(ILogger).sinks.find((s) => s instanceof DebugLog) as DebugLog;
    }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
    public get log() {
      return this._log.log;
    }
    public getSwitches(controller = this.controller) {
      return controller.children
        .reduce((acc: Switch[], c) => {
          const vm = c.viewModel;
          if (vm instanceof Switch) {
            acc.push(vm);
          }
          return acc;
        }, []);
    }
    public clear() {
      this._log.clear();
    }
    public async wait($switch: Switch): Promise<void> {
      const promise = $switch.promise;
      await promise;
      if ($switch.promise !== promise) {
        await this.wait($switch);
      }
    }

    public assertCalls(expected: (string | number)[], message: string = '') {
      assert.deepStrictEqual(this.log, this.transformCalls(expected), message);
    }

    public assertCallSet(expected: (string | number)[], message: string = '') {
      expected = this.transformCalls(expected);
      const actual = this.log;
      assert.strictEqual(actual.length, expected.length, `${message} - calls.length`);
      assert.strictEqual(actual.filter((c) => !expected.includes(c)).length, 0, `${message} - calls set equality \n actual:\t${actual} \n expected:\t ${expected}`);
    }

    public async assertChange($switch: Switch, act: () => void, expectedHtml: string, expectedLog: (string | number)[]) {
      this.clear();
      act();
      await this.wait($switch);
      const change = `change${++this.changeId}`;
      assert.html.innerEqual(this.host, expectedHtml, `${change} innerHTML`);
      this.assertCalls(expectedLog, change);
    }

    private transformCalls(calls: (string | number)[]) {
      let cases: Case[];
      const getCases = () => cases ?? (cases = this.getSwitches().flatMap((s) => s['cases']));
      return calls.map((item) => typeof item === 'string' ? item : `Case-#${getCases()[item - 1].id}.isMatch()`);
    }
  }

  async function testSwitch(
    testFunction: TestFunction<SwitchTestExecutionContext>,
    {
      template,
      registrations = [],
      initialStatus = Status.unknown,
      initialStatusNum = StatusNum.unknown,
      expectedStopLog,
      verifyStopCallsAsSet = false,
    }: Partial<TestSetupContext> = {}
  ) {
    const ctx = TestContext.create();

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const container = ctx.container;

    const au = new Aurelia(container);
    let error: Error | null = null;
    let app: App | null = null;
    let controller: Controller = null!;
    try {
      await au
        .register(
          LoggerConfiguration.create({ level: LogLevel.trace, sinks: [DebugLog] }),
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
        .start();
      app = au.root.controller.viewModel as App;
      controller = au.root.controller! as unknown as Controller;
    } catch (e) {
      error = e;
    }

    const testCtx = new SwitchTestExecutionContext(ctx, container, host, app, controller, error);
    await testFunction(testCtx);

    if (error === null) {
      testCtx.clear();
      await au.stop();
      assert.html.innerEqual(host, '', 'post-detach innerHTML');
      if (verifyStopCallsAsSet) {
        testCtx.assertCallSet(expectedStopLog);
      } else {
        testCtx.assertCalls(expectedStopLog, 'stop lifecycle calls');
      }
    }
    ctx.doc.body.removeChild(host);
  }
  const $it = createSpecFunction(testSwitch);

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
    public bind(_scope: Scope, _binding: IBinding): void {
      return;
    }
    public unbind(_scope: Scope, _binding: IBinding): void {
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

  function getActivationSequenceFor(name: string | string[], withCtor: boolean = false) {
    return typeof name === 'string'
      ? [...(withCtor ? [`${name}.ctor`] : []), `${name}.binding`, `${name}.bound`, `${name}.attaching`, `${name}.attached`]
      : [...(withCtor ? ['ctor'] : []), 'binding', 'bound', 'attaching', 'attached'].flatMap(x => name.map(n => `${n}.${x}`));
  }
  function getDeactivationSequenceFor(name: string | string[]) {
    return typeof name === 'string'
      ? [`${name}.detaching`, `${name}.unbinding`]
      : ['detaching', 'unbinding'].flatMap(x => name.map(n => `${n}.${x}`));
  }

  class TestData implements TestSetupContext {
    public readonly initialStatus: Status;
    public readonly template: string;
    public readonly registrations: any[];
    public readonly initialStatusNum: StatusNum;
    public readonly verifyStopCallsAsSet: boolean;
    public constructor(
      public readonly name: string,
      {
        initialStatus = Status.unknown,
        initialStatusNum = StatusNum.unknown,
        registrations = [],
        template,
        verifyStopCallsAsSet = false,
      }: Partial<TestSetupContext>,
      public readonly config: Config | null = null,
      public readonly expectedInnerHtml: string = '',
      public readonly expectedStartLog: (string | number)[],
      public readonly expectedStopLog: string[],
      public readonly additionalAssertions: ((ctx: SwitchTestExecutionContext) => Promise<void> | void) | null = null,
      public readonly only: boolean = false,
    ) {
      this.initialStatus = initialStatus;
      this.initialStatusNum = initialStatusNum;
      this.registrations = [
        Registration.instance(Config, config),
        createComponentType('case-host', '<au-slot>'),
        createComponentType('default-case-host', '<au-slot>'),
        ...registrations,
      ];
      this.template = template;
      this.verifyStopCallsAsSet = verifyStopCallsAsSet;
    }
  }

  function createWaiter(ms: number): () => Promise<void> {
    function wait(): Promise<void> {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, ms);
      });
    }

    wait.toString = function () {
      return `setTimeout(cb,${ms})`;
    };

    return wait;
  }
  function noop(): Promise<void> {
    return;
  }

  noop.toString = function () {
    return 'Promise.resolve()';
  };

  const configFactories = [
    function () {
      return new Config(false, false, noop);
    },
    function () {
      return new Config(true, false, noop);
    },
    function () {
      return new Config(true, true, createWaiter(0));
    },
    function () {
      return new Config(true, true, createWaiter(5));
    },
  ];

  function* getTestData() {
    function wrap(content: string, isDefault: boolean = false) {
      const host = isDefault ? 'default-case-host' : 'case-host';
      return `<${host} class="au">${content}</${host}>`;
    }
    for (const config of configFactories) {
      const MyEcho = createComponentType('my-echo', `Echoed '\${message}'`, ['message']);

      const enumTemplate = `
    <template>
      <template switch.bind="status">
        <case-host case="received"   ce-id="1">Order received.</case-host>
        <case-host case="dispatched" ce-id="2">On the way.</case-host>
        <case-host case="processing" ce-id="3">Processing your order.</case-host>
        <case-host case="delivered"  ce-id="4">Delivered.</case-host>
      </template>
    </template>`;

      yield new TestData(
        'works for simple switch-case',
        {
          initialStatus: Status.processing,
          template: enumTemplate,
        },
        config(),
        wrap('Processing your order.'),
        [1, 2, 3, ...getActivationSequenceFor('case-host-3')],
        getDeactivationSequenceFor('case-host-3'),
      );

      yield new TestData(
        'reacts to switch value change + deferred view-instantiation assertion',
        {
          initialStatus: Status.dispatched,
          template: `
          <template>
            <template switch.bind="status">
              <case-host case="received"   data-ce-id="1">Order received.</case-host>
              <case-host case="dispatched" data-ce-id="2">On the way.</case-host>
              <case-host case="processing" data-ce-id="3">Processing your order.</case-host>
              <case-host case="delivered"  data-ce-id="4">Delivered.</case-host>
            </template>
          </template>`
        },
        config(),
        wrap('On the way.'),
        [1, 2, ...getActivationSequenceFor('case-host-2', true)],
        getDeactivationSequenceFor('case-host-2'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.delivered; },
            wrap('Delivered.'),
            [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-4', true)]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.unknown; },
            '',
            [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-4')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.received; },
            wrap('Order received.'),
            [1, ...getActivationSequenceFor('case-host-1', true)]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.dispatched; },
            wrap('On the way.'),
            [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]
          );
        },
      );

      const templateWithDefaultCase = `
    <template>
      <template switch.bind="status">
        <case-host case="received"   ce-id="1">Order received.</case-host>
        <case-host case="dispatched" ce-id="2">On the way.</case-host>
        <case-host case="processing" ce-id="3">Processing your order.</case-host>
        <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Not found.</default-case-host>
      </template>
    </template>`;

      yield new TestData(
        'supports default-case',
        {
          initialStatus: Status.unknown,
          template: templateWithDefaultCase
        },
        config(),
        wrap('Not found.', true),
        [1, 2, 3, 4, ...getActivationSequenceFor('default-case-host-1')],
        getDeactivationSequenceFor('default-case-host-1'),
      );

      yield new TestData(
        'reacts to switch value change - default case',
        {
          initialStatus: Status.dispatched,
          template: templateWithDefaultCase,
        },
        config(),
        wrap('On the way.'),
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-4'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.unknown; },
            wrap('Not found.', true),
            [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('default-case-host-1')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.delivered; },
            wrap('Delivered.'),
            [1, 2, 3, 4, ...getDeactivationSequenceFor('default-case-host-1'), ...getActivationSequenceFor('case-host-4')]
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
        <case-host case.bind="status === 'received'"   ce-id="1">Order received.</case-host>
        <case-host case.bind="status === 'processing'" ce-id="2">Processing your order.</case-host>
        <case-host case.bind="status === 'dispatched'" ce-id="3">On the way.</case-host>
        <case-host case.bind="status === 'delivered'"  ce-id="4">Delivered.</case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('Processing your order.'),
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-3'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.dispatched; },
            wrap('On the way.'),
            [2, ...getDeactivationSequenceFor('case-host-2'), 3, ...getActivationSequenceFor('case-host-3')]
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
        <case-host case.bind="status1" ce-id="1">Order received.</case-host>
        <case-host case.bind="status2" ce-id="2">Processing your order.</case-host>
        <case-host case="dispatched"   ce-id="3">On the way.</case-host>
        <case-host case="delivered"    ce-id="4">Delivered.</case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('Processing your order.'),
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-1'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.dispatched; },
            wrap('On the way.'),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-3')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status1 = Status.processing; },
            wrap('On the way.'),
            [1]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.processing; },
            wrap('Order received.'),
            [1, ...getDeactivationSequenceFor('case-host-3'), ...getActivationSequenceFor('case-host-1')]
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
        <case-host case.bind="num % 3 === 0 && num % 5 === 0" ce-id="1">FizzBuzz</case-host>
        <case-host case.bind="num % 3 === 0" ce-id="2">Fizz</case-host>
        <case-host case.bind="num % 5 === 0" ce-id="3">Buzz</case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('Fizz'),
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-1'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.controller.scope.overrideContext.num = 49; },
            '',
            [2, ...getDeactivationSequenceFor('case-host-2')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.controller.scope.overrideContext.num = 15; },
            wrap('FizzBuzz'),
            [1, ...getActivationSequenceFor('case-host-1'), 2, 3]
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
        <case-host case.bind="['received', 'processing']" ce-id="1">Processing.</case-host>
        <case-host case="dispatched" ce-id="2">On the way.</case-host>
        <case-host case="delivered"  ce-id="3">Delivered.</case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('Processing.'),
        [1, ...getActivationSequenceFor('case-host-1')],
        getDeactivationSequenceFor('case-host-1'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.dispatched; },
            wrap('On the way.'),
            [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.received; },
            wrap('Processing.'),
            [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]
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
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('Processing.'),
        [1, ...getActivationSequenceFor('case-host-1')],
        getDeactivationSequenceFor('case-host-1'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.dispatched; },
            wrap('On the way.'),
            [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.statuses = [Status.dispatched]; },
            wrap('Processing.'),
            [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]
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
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Unknown.</default-case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('On the way.'),
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-1'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.statuses = [Status.dispatched]; },
            wrap('Processing.'),
            [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.unknown; },
            wrap('Unknown.', true),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('default-case-host-1')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.statuses = [ctx.app.status = Status.delivered]; },
            wrap('Processing.'),
            [1, 2, 3, ...getDeactivationSequenceFor('default-case-host-1'), ...getActivationSequenceFor('case-host-3'), 1, ...getDeactivationSequenceFor('case-host-3'), ...getActivationSequenceFor('case-host-1')]
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
        <case-host case.bind="statuses" ce-id="1">Processing.</case-host>
        <case-host case="dispatched"    ce-id="2">On the way.</case-host>
        <case-host case="delivered"     ce-id="3">Delivered.</case-host>
        <default-case-host default-case ce-id="1">Unknown.</default-case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('On the way.'),
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-1'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.statuses.push(Status.dispatched); },
            wrap('Processing.'),
            [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.unknown; },
            wrap('Unknown.', true),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('default-case-host-1')]
          );
          await ctx.assertChange(
            $switch,
            () => { ctx.app.statuses.push(ctx.app.status = Status.delivered); },
            wrap('Processing.'),
            [1, 2, 3, ...getDeactivationSequenceFor('default-case-host-1'), ...getActivationSequenceFor('case-host-3'), 1, ...getDeactivationSequenceFor('case-host-3'), ...getActivationSequenceFor('case-host-1')]
          );
        }
      );

      const fallThroughTemplate = `
      <template>
        <template switch.bind="status">
          <case-host case="received"                                   ce-id="1">Order received.</case-host>
          <case-host case="value:dispatched; fall-through.bind:true"   ce-id="2">On the way.</case-host>
          <case-host case="value.bind:'processing'; fall-through:true" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"                                  ce-id="4">Delivered.</case-host>
        </template>
      </template>`;

      yield new TestData(
        'supports fall-through #1',
        {
          initialStatus: Status.dispatched,
          template: fallThroughTemplate,
        },
        config(),
        `${wrap('On the way.')} ${wrap('Processing your order.')} ${wrap('Delivered.')}`,
        [1, 2, ...getActivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4'])],
        getDeactivationSequenceFor('case-host-4'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.delivered; },
            wrap('Delivered.'),
            [1, 2, 3, 4, ...getDeactivationSequenceFor(['case-host-2', 'case-host-3'])]
          );
        }
      );

      yield new TestData(
        'supports fall-through #2',
        {
          initialStatus: Status.delivered,
          template: fallThroughTemplate,
        },
        config(),
        wrap('Delivered.'),
        [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor(['case-host-3', 'case-host-4']),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.processing; },
            `${wrap('Processing your order.')} ${wrap('Delivered.')}`,
            [1, 2, 3, ...getActivationSequenceFor('case-host-3')],
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
        <case-host case.bind="status === 'received'"                                 ce-id="1">Order received.</case-host>
        <case-host case="value.bind:status === 'processing'; fall-through:true"      ce-id="2">Processing your order.</case-host>
        <case-host case="value.bind:status === 'dispatched'; fall-through.bind:true" ce-id="3">On the way.</case-host>
        <case-host case.bind="status === 'delivered'"                                ce-id="4">Delivered.</case-host>
      </template>
    </template>`,
        },
        config(),
        wrap('Delivered.'),
        [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4']),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.processing; },
            `${wrap('Processing your order.')} ${wrap('On the way.')} ${wrap('Delivered.')}`,
            [2, ...getActivationSequenceFor(['case-host-2', 'case-host-3']), 4]
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
        config(),
        '<div> the curious case of processing </div>',
        [],
        [],
        async (ctx) => {
          ctx.app.status = Status.delivered;
          ctx.platform.domWriteQueue.flush();
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
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
          <span>foobar</span>
          <span if.bind="true">foo</span><span else>bar</span>
          <span if.bind="false">foo</span><span else>bar</span>
          <span repeat.for="i of 3">\${i}</span>
          <my-echo message="awesome possum"></my-echo>
        </template>
      </template>`,
          registrations: [MyEcho],
        },
        config(),
        `${wrap('Delivered.')} <span>foobar</span> <span>foo</span> <span>bar</span> <span>0</span><span>1</span><span>2</span> <my-echo class="au">Echoed 'awesome possum'</my-echo>`,
        [...getActivationSequenceFor('my-echo'), 1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor(['case-host-4', 'my-echo']),
      );

      yield new TestData(
        'works with value converter for switch expression',
        {
          initialStatusNum: StatusNum.delivered,
          template: `
      <template>
        <template switch.bind="statusNum | toStatusString">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
        },
        config(),
        wrap('Delivered.'),
        [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor('case-host-3'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.statusNum = StatusNum.processing; },
            wrap('Processing your order.'),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]
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
          <case-host case.bind="1 | toStatusString" ce-id="1">Order received.</case-host>
          <case-host case.bind="3 | toStatusString" ce-id="2">On the way.</case-host>
          <case-host case.bind="2 | toStatusString" ce-id="3">Processing your order.</case-host>
          <case-host case.bind="4 | toStatusString" ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
        },
        config(),
        wrap('Delivered.'),
        [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor('case-host-3'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.processing; },
            wrap('Processing your order.'),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]
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
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
        },
        config(),
        wrap('Delivered.'),
        [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor('case-host-3'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.processing; },
            wrap('Processing your order.'),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]
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
          <case-host case.bind="'received' & noop"   ce-id="1">Order received.</case-host>
          <case-host case.bind="'dispatched' & noop" ce-id="2">On the way.</case-host>
          <case-host case.bind="'processing' & noop" ce-id="3">Processing your order.</case-host>
          <case-host case.bind="'delivered' & noop"  ce-id="4">Delivered.</case-host>
        </template>
      </template>`,
        },
        config(),
        wrap('Delivered.'),
        [1, 2, 3, 4, ...getActivationSequenceFor('case-host-4')],
        getDeactivationSequenceFor('case-host-3'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.processing; },
            wrap('Processing your order.'),
            [1, 2, 3, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-3')]
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
            <case-host case="received"   ce-id.bind="$index * 4 + 1">Order received.</case-host>
            <case-host case="dispatched" ce-id.bind="$index * 4 + 2">On the way.</case-host>
            <case-host case="processing" ce-id.bind="$index * 4 + 3">Processing your order.</case-host>
            <case-host case="delivered"  ce-id.bind="$index * 4 + 4">Delivered.</case-host>
          </template>
        </div>
      </template>`,
        },
        config(),
        `<div> ${wrap('Order received.')} </div><div> ${wrap('On the way.')} </div>`,
        null,
        getDeactivationSequenceFor(['case-host-1', 'case-host-6']),
        (ctx) => {
          const switches = (ctx.controller.children[0] as Controller<Repeat>).viewModel
            .views
            .map((v) => v.children[0].viewModel as Switch);
          ctx.assertCallSet([
            `Case-#${switches[0]['cases'][0].id}.isMatch()`,
            ...getActivationSequenceFor('case-host-1'),
            `Case-#${switches[1]['cases'][0].id}.isMatch()`,
            `Case-#${switches[1]['cases'][1].id}.isMatch()`,
            ...getActivationSequenceFor('case-host-6')
          ], 'post-start lifecycle calls');
        },
      );

      yield new TestData(
        '*[switch][repeat.for] works',
        {
          initialStatus: Status.delivered,
          template: `
      <template>
        <div repeat.for="s of ['received', 'dispatched']" switch.bind="s">
          <case-host case="received"   ce-id.bind="$index * 4 + 1">Order received.</case-host>
          <case-host case="dispatched" ce-id.bind="$index * 4 + 2">On the way.</case-host>
          <case-host case="processing" ce-id.bind="$index * 4 + 3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id.bind="$index * 4 + 4">Delivered.</case-host>
        </div>
      </template>`,
        },
        config(),
        `<div> ${wrap('Order received.')} </div><div> ${wrap('On the way.')} </div>`,
        null,
        getDeactivationSequenceFor(['case-host-1', 'case-host-6']),
        (ctx) => {
          const switches = (ctx.controller.children[0] as Controller<Repeat>).viewModel
            .views
            .map((v) => v.children[0].viewModel as Switch);
          ctx.assertCallSet([
            `Case-#${switches[0]['cases'][0].id}.isMatch()`,
            ...getActivationSequenceFor('case-host-1'),
            `Case-#${switches[1]['cases'][0].id}.isMatch()`,
            `Case-#${switches[1]['cases'][1].id}.isMatch()`,
            ...getActivationSequenceFor('case-host-6')
          ], 'post-start lifecycle calls');
        }
      );

      // tag: nonsense example
      yield new TestData(
        '*[switch][if] works',
        {
          initialStatus: Status.delivered,
          template: `
        <div if.bind="true" switch.bind="status">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </div>
        <div if.bind="false" switch.bind="status">
          <case-host case="received"   ce-id="5">Order received.</case-host>
          <case-host case="dispatched" ce-id="6">On the way.</case-host>
          <case-host case="processing" ce-id="7">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="8">Delivered.</case-host>
        </div>
      `,
        },
        config(),
        `<div> ${wrap('Delivered.')} </div>`,
        null,
        getDeactivationSequenceFor('case-host-4'),
      );

      // tag: nonsense example
      yield new TestData(
        '*[case][if=true]',
        {
          initialStatus: Status.delivered,
          template: `
        <div switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <case-host case="delivered" if.bind="true" ce-id="2">Delivered.</case-host>
        </div>`,
        },
        config(),
        `<div> ${wrap('Delivered.')} </div>`,
        [1, 2, ...getActivationSequenceFor('case-host-2')],
        getDeactivationSequenceFor('case-host-2')
      );

      // tag: nonsense example
      yield new TestData(
        '*[case][if=false] leads to unexpected result',
        {
          initialStatus: Status.delivered,
          template: `
        <div switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <span if.bind="false" case="delivered">Delivered.</span>
        </div>`,
        },
        config(),
        '<div> </div>',
        [1],
        []
      );

      // tag: nonsense example
      yield new TestData(
        '*[if=false][case] leads to unexpected result',
        {
          initialStatus: Status.delivered,
          template: `
        <div switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <case-host case="delivered" if.bind="false" ce-id="2">Delivered.</case-host>
        </div>`,
        },
        config(),
        '<div> </div>',
        [1, 2],
        []
      );

      // tag: nonsense example
      yield new TestData(
        '*[switch]>*[case][repeat.for] leads to unexpected result',
        {
          initialStatus: Status.delivered,
          template: `
      <template>
        <template switch.bind="status">
          <case-host case.bind="s" repeat.for="s of ['received','dispatched','processing','delivered',]" ce-id="1">\${s}</case-host>
        </template>
        <template switch.bind="status">
          <case-host case.bind="s" repeat.for="s of ['delivered','received','dispatched','processing',]" ce-id="2">\${s}</case-host>
        </template>
      </template>`,
        },
        config(),
        '',
        [1, 2],
        []
      );

      // tag: nonsense example
      yield new TestData(
        '*[switch]>*[case][repeat.for] - static case - leads to unexpected result',
        {
          initialStatus: Status.received,
          template: `
      <template>
        <template switch.bind="status">
          <case-host case="processing" ce-id="1">Processing your order.</case-host>
          <case-host case="received" repeat.for="i of 3" ce-id.bind="2+i">\${i}</case-host>
        </template>
      </template>`,
        },
        config(),
        `${wrap('0')}${wrap('1')}${wrap('2')}`,
        [1, 2, ...getActivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4'])],
        getDeactivationSequenceFor(['case-host-2', 'case-host-3', 'case-host-4'])
      );

      // yield new TestData(
      //   'supports nested switch',
      //   {
      //     initialStatus: Status.delivered,
      //     template: `
      // <template>
      //   <let day.bind="2"></let>
      //   <template switch.bind="status">
      //     <case-host case="received"   ce-id="1">Order received.</case-host>
      //     <case-host case="dispatched" ce-id="2">On the way.</case-host>
      //     <case-host case="processing" ce-id="3">Processing your order.</case-host>
      //     <case-host case="delivered"  ce-id="4">
      //       <template switch.bind="day">
      //         Expected to be delivered
      //         <case-host case.bind="1" ce-id="5">tomorrow.</case-host>
      //         <case-host case.bind="2" ce-id="6">in 2 days.</case-host>
      //         <case-host default-case  ce-id="7">in few days.</case-host>
      //       </template>
      //     </case-host>
      //   </template>
      // </template>`,
      //     verifyStopCallsAsSet: true,
      //   },
      //   config(),
      //   wrap(` Expected to be delivered ${wrap('in 2 days.')} `),
      //   null,
      //   getDeactivationSequenceFor(['case-host-4', 'case-host-6']),
      //   (ctx) => {
      //     const $switch = ctx.getSwitches()[0];
      //     const $switch2 = ctx.getSwitches(($switch['cases'][3] as Case).view as unknown as Controller)[0];
      //     ctx.assertCalls([
      //       1, 2, 3, 4, ...getActivationSequenceFor('case-host-4'),
      //       `Case-#${$switch2['cases'][0].id}.isMatch()`, `Case-#${$switch2['cases'][1].id}.isMatch()`, ...getActivationSequenceFor('case-host-6')
      //     ]);
      //   }
      // );

      yield new TestData(
        'works with local template',
        {
          initialStatus: Status.delivered,
          template: `
      <template as-custom-element="foo-bar">
        <bindable property="status"></bindable>
        <div switch.bind="status">
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <case-host case="delivered"  ce-id="4">Delivered.</case-host>
        </div>
      </template>

      <foo-bar status.bind="status"></foo-bar>
      `,
        },
        config(),
        `<foo-bar class="au"> <div> ${wrap('Delivered.')} </div> </foo-bar>`,
        null,
        getDeactivationSequenceFor('case-host-4'),
        (ctx) => {
          const fooBarController = ctx.controller.children[0];
          const $switch = ctx.getSwitches(fooBarController)[0];
          ctx.assertCalls([
            ...new Array(4).fill(0).map((_, i) => `Case-#${$switch['cases'][i].id}.isMatch()`),
            ...getActivationSequenceFor('case-host-4')
          ]);
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
        config(),
        '<foo-bar class="au"> <div> <span>Projection</span> </div> </foo-bar>',
        null,
        [],
        async (ctx) => {
          const fooBarController = ctx.controller.children[0];
          const $switch = ctx.getSwitches(fooBarController)[0];
          ctx.assertCalls([`Case-#${$switch['cases'][0].id}.isMatch()`]);

          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.delivered; },
            '<foo-bar class="au"> <div> Delivered. </div> </foo-bar>',
            new Array(4).fill(0).map((_, i) => `Case-#${$switch['cases'][i].id}.isMatch()`),
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
          <case-host case="received"   ce-id="1">Order received.</case-host>
          <case-host case="dispatched" ce-id="2">On the way.</case-host>
          <case-host case="processing" ce-id="3">Processing your order.</case-host>
          <my-echo case="delivered"    message="Delivered."></my-echo>
        </template>
      </template>`,
          registrations: [MyEcho]
        },
        config(),
        wrap('Order received.'),
        [1, ...getActivationSequenceFor('case-host-1')],
        getDeactivationSequenceFor('my-echo'),
        async (ctx) => {
          const $switch = ctx.getSwitches()[0];
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.delivered; },
            '<my-echo class="au">Echoed \'Delivered.\'</my-echo>',
            [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('my-echo')]
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
            <case-host case="received"   ce-id="1">Order received.</case-host>
            <case-host case="dispatched" ce-id="2">On the way.</case-host>
            <case-host case="processing" ce-id="3">Processing your order.</case-host>
            <case-host case="delivered"  ce-id="4">Delivered.</case-host>
          </template>
        </template>
      </foo-bar>
      `,
        },
        config(),
        `<foo-bar class="au"> ${wrap('Order received.')} </foo-bar>`,
        null,
        getDeactivationSequenceFor('case-host-4'),
        async (ctx) => {
          const fooBarController = ctx.controller.children[0];
          const auSlot: AuSlot = (fooBarController.children[0] as Controller<AuSlot>).viewModel;
          const $switch = ctx.getSwitches(auSlot.view as unknown as Controller)[0];
          ctx.assertCalls([`Case-#${$switch['cases'][0].id}.isMatch()`, ...getActivationSequenceFor('case-host-1')]);
          await ctx.assertChange(
            $switch,
            () => { ctx.app.status = Status.delivered; },
            `<foo-bar class="au"> ${wrap('Delivered.')} </foo-bar>`,
            [...new Array(4).fill(0).map((_, i) => `Case-#${$switch['cases'][i].id}.isMatch()`), ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-4')],
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
              <case-host case="received"   ce-id="1">Order received.</case-host>
              <case-host case="dispatched" ce-id="2">On the way.</case-host>
              <case-host case="processing" ce-id="3">Processing your order.</case-host>
              <case-host case="delivered"  ce-id="4">Delivered.</case-host>
            </div>
          </div>
        </template>
      </template>`,
        },
        config(),
        `<div> <div> ${wrap('Order received.')} </div> </div>`,
        [1, ...getActivationSequenceFor('case-host-1')],
        getDeactivationSequenceFor('case-host-1')
      );

      // tag: not supported
      // yield new TestData(
      //   '*[switch]>CE>*[case] produces some output',
      //   {
      //     initialStatus: Status.dispatched,
      //     template: `
      // <template as-custom-element="foo-bar">
      //   foo bar
      // </template>

      // <template switch.bind="status">
      //   <foo-bar>
      //     <case-host case="dispatched" ce-id="1">On the way.</case-host>
      //     <case-host case="delivered"  ce-id="2">Delivered.</case-host>
      //   </foo-bar>
      // </template>`,
      //   },
      //   config(),
      //   `<foo-bar class="au"> ${wrap('On the way.')} foo bar </foo-bar>`,
      //   [1, ...getActivationSequenceFor('case-host-1')],
      //   getDeactivationSequenceFor('case-host-1')
      // );

      // yield new TestData(
      //   '*[switch]>CE>CE>*[case] works',
      //   {
      //     initialStatus: Status.dispatched,
      //     template: `
      // <template as-custom-element="foo-bar">
      //   foo bar
      // </template>
      // <template as-custom-element="fiz-baz">
      //   fiz baz
      // </template>

      // <template switch.bind="status">
      //   <foo-bar>
      //     <fiz-baz>
      //       <case-host case="dispatched" ce-id="1">On the way.</case-host>
      //       <case-host case="delivered"  ce-id="2">Delivered.</case-host>
      //     </fiz-baz>
      //   </foo-bar>
      // </template>`,
      //   },
      //   config(),
      //   `<foo-bar class="au"> <fiz-baz class="au"> ${wrap('On the way.')} fiz baz </fiz-baz> foo bar </foo-bar>`,
      //   [1, ...getActivationSequenceFor('case-host-1')],
      //   getDeactivationSequenceFor('case-host-1')
      // );

      // yield new TestData(
      //   'works with case binding changed to array and back',
      //   {
      //     initialStatus: Status.received,
      //     template: `
      // <template>
      //   <let s.bind="'received'"></let>
      //   <template switch.bind="status">
      //     <case-host case.bind="s"     ce-id="1">Order received.</case-host>
      //     <case-host case="dispatched" ce-id="2">On the way.</case-host>
      //     <case-host case="processing" ce-id="3">Processing your order.</case-host>
      //     <case-host case="delivered"  ce-id="4">Delivered.</case-host>
      //   </template>
      // </template>`,
      //   },
      //   config(),
      //   wrap('Order received.'),
      //   [1, ...getActivationSequenceFor('case-host-1')],
      //   getDeactivationSequenceFor('case-host-1'),
      //   async (ctx) => {
      //     const $switch = ctx.getSwitches()[0];

      //     await ctx.assertChange(
      //       $switch,
      //       () => { ctx.app.status = Status.delivered; },
      //       wrap('Delivered.'),
      //       [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-4')]
      //     );

      //     const arr = [Status.received, Status.delivered];
      //     const observer = ctx.container.get(IObserverLocator).getArrayObserver(arr);
      //     const addSpy = createSpy(observer, "subscribe", true);
      //     const removeSpy = createSpy(observer, "unsubscribe", true);

      //     await ctx.assertChange(
      //       $switch,
      //       () => { ctx.controller.scope.overrideContext.s = arr; },
      //       wrap('Order received.'),
      //       [1, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-1')]
      //     );

      //     assert.strictEqual(addSpy.calls.length, 1, 'subscribe count');
      //     assert.strictEqual(addSpy.calls[0][0], $switch['cases'][0], 'subscribe arg');

      //     await ctx.assertChange(
      //       $switch,
      //       () => { ctx.app.status = Status.dispatched; },
      //       wrap('On the way.'),
      //       [1, 2, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-2')]
      //     );

      //     const arr2 = [Status.received, Status.dispatched];
      //     const observer2 = ctx.container.get(IObserverLocator).getArrayObserver(arr2);
      //     const addSpy2 = createSpy(observer2, "subscribe", true);
      //     const removeSpy2 = createSpy(observer2, "unsubscribe", true);

      //     await ctx.assertChange(
      //       $switch,
      //       () => { ctx.controller.scope.overrideContext.s = arr2; },
      //       wrap('Order received.'),
      //       [1, ...getDeactivationSequenceFor('case-host-2'), ...getActivationSequenceFor('case-host-1')]
      //     );
      //     assert.strictEqual(removeSpy.calls.length, 1, 'subscibe count');
      //     assert.strictEqual(removeSpy.calls[0][0], $switch['cases'][0], 'subscibe arg');
      //     assert.strictEqual(addSpy2.calls.length, 1, 'subscibe count #2');
      //     assert.strictEqual(addSpy2.calls[0][0], $switch['cases'][0], 'subscibe arg #2');

      //     await ctx.assertChange(
      //       $switch,
      //       () => { ctx.app.status = Status.delivered; },
      //       wrap('Delivered.'),
      //       [1, 2, 3, 4, ...getDeactivationSequenceFor('case-host-1'), ...getActivationSequenceFor('case-host-4')]
      //     );

      //     await ctx.assertChange(
      //       $switch,
      //       () => { ctx.controller.scope.overrideContext.s = Status.delivered; },
      //       wrap('Order received.'),
      //       [1, ...getDeactivationSequenceFor('case-host-4'), ...getActivationSequenceFor('case-host-1')]
      //     );
      //     assert.strictEqual(removeSpy2.calls.length, 1, 'subscibe count #2');
      //     assert.strictEqual(removeSpy2.calls[0][0], $switch['cases'][0], 'subscibe arg #2');
      //   }
      // );
    }
  }

  for (const data of getTestData()) {
    (data.only ? $it.only : $it)(data.name,
      async function (ctx) {

        assert.strictEqual(ctx.error, null);
        assert.html.innerEqual(ctx.host, data.expectedInnerHtml, 'innerHTML');

        if (data.expectedStartLog !== null) {
          ctx.assertCalls(data.expectedStartLog, 'start lifecycle calls');
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
          <case-host case="delivered">delivered</case-host>
        </template>
        <foo-bar></foo-bar>
        `,
      },
      new Config(false, false, noop),
      null!,
      null,
      null
    );
    yield new TestData(
      '*[switch]>*[if]>*[case]',
      {
        template: `
      <template>
        <template switch.bind="status">
          <template if.bind="true">
            <case-host case="delivered">delivered</case-host>
          </template>
        </template>
      </template>`,
      },
      new Config(false, false, noop),
      null!,
      null,
      null,
    );

    yield new TestData(
      '*[switch]>*[repeat.for]>*[case]',
      {
        template: `
      <template>
        <template switch.bind="status">
          <template repeat.for="s of ['received','dispatched','processing','delivered',]">
            <case-host case.bind="s">\${s}</case-host>
          </template>
        </template>
      </template>`,
      },
      new Config(false, false, noop),
      null!,
      null,
      null,
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
      new Config(false, false, noop),
      null!,
      null,
      null,
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
          <case-host case="dispatched">On the way.</case-host>
          <case-host case="delivered">Delivered.</case-host>
        </template>
      </foo-bar>`,
      },
      new Config(false, false, noop),
      null!,
      null,
      null,
    );

    yield new TestData(
      '*[if=true][case]',
      {
        template: `
        <div switch.bind="status">
          <case-host case="processing">Processing your order.</case-host>
          <span if.bind="true" case="delivered">Delivered.</span>
        </div>`,
      },
      new Config(false, false, noop),
      null!,
      null,
      null
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
      },
      new Config(false, false, noop),
      null!,
      null,
      null
    );
  }
  for (const data of getNegativeTestData()) {
    $it(`${data.name} does not work`,
      function (ctx) {
        // assert.match(ctx.error.message, /The parent switch not found; only `\*\[switch\] > \*\[case\|default-case\]` relation is supported\./);
        assert.match(ctx.error.message, /AUR0815/);
      },
      data);
  }

  $it(`multiple default-cases throws error`,
    function (ctx) {
      // assert.match(ctx.error.message, /Multiple 'default-case's are not allowed./);
      assert.match(ctx.error.message, /AUR0816/);
    },
    {
      template: `
  <template>
    <template switch.bind="status">
      <case-host case.bind="statuses">Processing.</case-host>
      <case-host case="dispatched">On the way.</case-host>
      <default-case-host default-case>dc1.</default-case-host>
      <default-case-host default-case>dc2.</default-case-host>
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
          <case-host case="delivered" else>Delivered.</case-host>
        </div>`
    }
  );

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('TODO: supports nested switches', async function () {
    // this already working, just need proper tests
    // the old tests are absolute beast in terms of modifiability + debuggability
    // will need to simplify them using LifeycleHooks or something similar
    await createFixture
      .html`
        <let day.bind="2"></let>
        <template switch.bind="status">
          <div case="received"   ce-id="1">Order received.<div>
          <div case="dispatched" ce-id="2">On the way.<div>
          <div case="processing" ce-id="3">Processing your order.<div>
          <div case="delivered"  ce-id="4" switch.bind="day">
            Expected to be delivered
            <div case.bind="1" ce-id="5">tomorrow.<div>
            <div case.bind="2" ce-id="6">in 2 days.<div>
            <div default-case  ce-id="7">in few days.<div>
          <div>
        </template>
      `
      .build().started;
  });
});

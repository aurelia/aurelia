/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
  optional,
  Task,
  TaskStatus,
} from '@aurelia/kernel';
import {
  bindingBehavior,
  BindingBehaviorInstance,
  Controller,
  customElement,
  CustomElement,
  IBinding,
  Scope,
  LifecycleFlags,
  Switch,
  Aurelia,
  IPlatform,
  ICustomElementViewModel,
  PromiseTemplateController,
  valueConverter,
  ValueConverter,
  If,
  ISyntheticView,
} from '@aurelia/runtime-html';
import {
  assert,
  generateCartesianProduct,
  TestContext,
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';

describe('promise template-controller', function () {

  const phost = 'pending-host';
  const fhost = 'fulfilled-host';
  const rhost = 'rejected-host';
  type PromiseWithId<TValue extends unknown = unknown> = Promise<TValue> & { id?: number };
  class Config {
    public constructor(
      public hasPromise: boolean,
      public wait: (name: string) => Promise<void> | void,
    ) { }

    public toString(): string {
      return `{${this.hasPromise ? this.wait.toString() : 'noWait'}}`;
    }
  }

  const configLookup = DI.createInterface<Map<string, Config>>();
  let nameIdMap: Map<string, number>;
  function createComponentType(name: string, template: string = '', bindables: string[] = []) {
    @customElement({ name, template, bindables, isStrictBinding: true })
    class Component {
      private readonly logger: ILogger;
      public constructor(
        @optional(Config) private readonly config: Config,
        @ILogger logger: ILogger,
        @IContainer container: IContainer,
      ) {
        let id = nameIdMap.get(name) ?? 1;
        this.logger = logger.scopeTo(`${name}-${id}`);
        nameIdMap.set(name, ++id);
        if (config == null) {
          const lookup = container.get(configLookup);
          this.config = lookup.get(name);
        }
      }

      public async binding(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait('binding');
        }

        this.logger.debug('binding');
      }

      public async bound(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait('bound');
        }

        this.logger.debug('bound');
      }

      public async attaching(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait('attaching');
        }

        this.logger.debug('attaching');
      }

      public async attached(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait('attached');
        }

        this.logger.debug('attached');
      }

      public async detaching(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait('detaching');
        }

        this.logger.debug('detaching');
      }

      public async unbinding(): Promise<void> {
        if (this.config.hasPromise) {
          await this.config.wait('unbinding');
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
      const scope = event.scope.join('.');
      if (scope.includes('-host')) {
        this.log.push(`${scope}.${event.message}`);
      }
    }
    public clear() {
      this.log.length = 0;
    }
  }

  interface TestSetupContext {
    template: string;
    registrations: any[];
    expectedStopLog: string[];
    verifyStopCallsAsSet: boolean;
    promise: Promise<unknown> | (() => Promise<unknown>) | null;
    delayPromise: DelayPromise | null;
  }
  class PromiseTestExecutionContext implements TestExecutionContext<any> {
    private _scheduler: IPlatform;
    private readonly _log: DebugLog;
    public constructor(
      public ctx: TestContext,
      public container: IContainer,
      public host: HTMLElement,
      public app: App | null,
      public controller: Controller,
      public error: Error | null,
    ) {
      this._log = (container.get(ILogger)['debugSinks'] as ISink[]).find((s) => s instanceof DebugLog) as DebugLog;
    }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
    public get log() {
      return this._log?.log ?? [];
    }
    public clear() {
      this._log?.clear();
    }

    public assertCalls(expected: string[], message: string = '') {
      assert.deepStrictEqual(this.log, expected, message);
    }

    public assertCallSet(expected: string[], message: string = '') {
      const actual = this.log;
      assert.strictEqual(actual.length, expected.length, `${message} - calls.length - ${actual}`);
      assert.strictEqual(actual.filter((c) => !expected.includes(c)).length, 0, `${message} - calls set equality - ${actual}`);
    }
  }

  enum DelayPromise {
    hydrating = 'hydrating',
    hydrated = 'hydrated',
    created = 'created',
    binding = 'binding',
  }

  const seedPromise = DI.createInterface<Promise<unknown>>();
  const delaySeedPromise = DI.createInterface<DelayPromise>();
  async function testPromise(
    testFunction: TestFunction<PromiseTestExecutionContext>,
    {
      template,
      registrations = [],
      expectedStopLog,
      verifyStopCallsAsSet = false,
      promise,
      delayPromise = null
    }: Partial<TestSetupContext> = {}
  ) {
    nameIdMap = new Map<string, number>();
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
          LoggerConfiguration.create({ level: LogLevel.trace, sinks: [DebugLog/* , ConsoleSink */] }),
          ...registrations,
          Promisify,
          Double,
          NoopBindingBehavior,
          typeof promise === 'function'
            ? Registration.callback(seedPromise, promise)
            : Registration.instance(seedPromise, promise),
          Registration.instance(delaySeedPromise, delayPromise),
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

    const testCtx = new PromiseTestExecutionContext(ctx, container, host, app, controller, error);
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
  const $it = createSpecFunction(testPromise);

  @valueConverter('promisify')
  class Promisify {
    public toView(value: unknown, resolve: boolean = true, ticks: number = 0): Promise<unknown> {
      if (ticks === 0) {
        return Object.assign(resolve ? Promise.resolve(value) : Promise.reject(new Error(String(value))), { id: 0 });
      }

      return Object.assign(
        createMultiTickPromise(ticks, () => resolve ? Promise.resolve(value) : Promise.reject(new Error(String(value))))(),
        { id: 0 }
      );
    }
  }

  @valueConverter('double')
  class Double {
    public fromView(value: unknown): unknown {
      return value instanceof Error
        ? (value.message = `${value.message} ${value.message}`, value)
        : `${value} ${value}`;
    }
  }

  @bindingBehavior('noop')
  class NoopBindingBehavior implements BindingBehaviorInstance {
    public bind(_flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, _binding: IBinding): void {
      return;
    }
    public unbind(_flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, _binding: IBinding): void {
      return;
    }
  }

  class App {
    public promise: PromiseWithId;
    public constructor(
      @IContainer private readonly container: IContainer,
      @delaySeedPromise private readonly delaySeedPromise: DelayPromise,
    ) {
      if (delaySeedPromise === null) {
        this.init();
      }
    }

    public hydrating(): void {
      if (this.delaySeedPromise !== DelayPromise.hydrating) { return; }
      this.init();
    }

    public hydrated(): void {
      if (this.delaySeedPromise !== DelayPromise.hydrated) { return; }
      this.init();
    }

    public created(): void {
      if (this.delaySeedPromise !== DelayPromise.created) { return; }
      this.init();
    }

    public binding(): void {
      if (this.delaySeedPromise !== DelayPromise.binding) { return; }
      this.init();
    }

    private init() {
      this.promise = this.container.get(seedPromise);
    }

    private updateError(err: Error) {
      err.message += '1';
      return err;
    }
  }

  function getActivationSequenceFor(name: string | string[]) {
    return typeof name === 'string'
      ? [`${name}.binding`, `${name}.bound`, `${name}.attaching`, `${name}.attached`]
      : ['binding', 'bound', 'attaching', 'attached'].flatMap(x => name.map(n => `${n}.${x}`));
  }
  function getDeactivationSequenceFor(name: string | string[]) {
    return typeof name === 'string'
      ? [`${name}.detaching`, `${name}.unbinding`]
      : ['detaching', 'unbinding'].flatMap(x => name.map(n => `${n}.${x}`));
  }

  class TestData implements TestSetupContext {
    public readonly template: string;
    public readonly registrations: any[];
    public readonly verifyStopCallsAsSet: boolean;
    public readonly name: string;
    public readonly delayPromise: DelayPromise | null;
    public constructor(
      name: string,
      public promise: Promise<unknown> | (() => Promise<unknown>) | null,
      {
        registrations = [],
        template,
        verifyStopCallsAsSet = false,
        delayPromise = null,
      }: Partial<TestSetupContext>,
      public readonly config: Config,
      public readonly expectedInnerHtml: string,
      public readonly expectedStartLog: string[],
      public readonly expectedStopLog: string[],
      public readonly additionalAssertions: ((ctx: PromiseTestExecutionContext) => Promise<void> | void) | null = null,
      public readonly only: boolean = false,
    ) {
      this.name = `${name} - config: ${String(config)} - delayPromise: ${delayPromise}`;
      this.registrations = [
        ...(config !== null ? [Registration.instance(Config, config)] : []),
        createComponentType(phost, `pending\${p.id}`, ['p']),
        createComponentType(fhost, `resolved with \${data}`, ['data']),
        createComponentType(rhost, `rejected with \${err.message}`, ['err']),
        ...registrations,
      ];
      this.template = template;
      this.verifyStopCallsAsSet = verifyStopCallsAsSet;
      this.delayPromise = delayPromise;
    }
  }

  function createWaiter(ms: number): (name: string) => Promise<void> {
    function wait(_name: string): Promise<void> {
      return new Promise(function (resolve) { setTimeout(resolve, ms); });
    }

    wait.toString = function () {
      return `setTimeout(cb,${JSON.stringify(ms)})`;
    };

    return wait;
  }
  function noop(): Promise<void> {
    return;
  }

  noop.toString = function () {
    return 'Promise.resolve()';
  };

  function createMultiTickPromise(ticks: number, cb: () => Promise<unknown>) {
    const wait = () => {
      if (ticks === 0) {
        return cb();
      }
      ticks--;
      return new Promise((r) => setTimeout(function () { r(wait()); }, 0));
    };
    return wait;
  }

  function createWaiterWithTicks(ticks: Record<string, number>): (name?: string) => Promise<void> | void {
    const lookup: Record<string, () => Promise<void> | void> = Object.create(null);
    for (const [key, numTicks] of Object.entries(ticks)) {
      const fn: (() => Promise<void> | void) & { ticks: number } = () => {
        if (fn.ticks === 0) {
          return;
        }
        fn.ticks--;
        return new Promise((r) => setTimeout(function () { void r(fn()); }, 0));
      };
      fn.ticks = numTicks;
      lookup[key] = fn;
    }
    const wait = (name: string) => {
      return lookup[name]?.() ?? Promise.resolve();
    };
    wait.toString = function () {
      return `waitWithTicks(cb,${JSON.stringify(ticks)})`;
    };

    return wait;
  }

  function* getTestData() {
    function wrap(content: string, type: 'p' | 'f' | 'r') {
      switch (type) {
        case 'p':
          return `<${phost} p.bind="promise" class="au">${content}</${phost}>`;
        case 'f':
          return `<${fhost} data.bind="data" class="au">${content}</${fhost}>`;
        case 'r':
          return `<${rhost} err.bind="err" class="au">${content}</${rhost}>`;
      }
    }

    const configFactories = [
      function () {
        return new Config(false, noop);
      },
      function () {
        return new Config(true, createWaiter(0));
      },
      function () {
        return new Config(true, createWaiter(5));
      },
    ];
    for (const [pattribute, fattribute, rattribute] of generateCartesianProduct([
      ['promise.bind', 'promise.resolve'],
      ['then.from-view', 'then'],
      ['catch.from-view', 'catch'],
    ])) {
      const template1 = `
    <template>
      <template ${pattribute}="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
      for (const delayPromise of [null, ...(Object.values(DelayPromise))]) {
        for (const config of configFactories) {
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'shows content as per promise status #1 - fulfilled',
              Object.assign(new Promise((r) => resolve = r), { id: 0 }),
              { delayPromise, template: template1, },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${fhost}-1`),
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const p = ctx.platform;
                // one tick to call back the fulfill delegate, and queue task
                await p.domWriteQueue.yield();
                // on the next tick wait the queued task
                await p.domWriteQueue.yield();
                assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'shows content as per promise status #1 - rejected',
              Object.assign(new Promise((_, r) => reject = r), { id: 0 }),
              { delayPromise, template: template1 },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const p = ctx.platform;
                await p.domWriteQueue.yield();
                await p.domWriteQueue.yield();
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
              }
            );
          }
          yield new TestData(
            'shows content for resolved promise',
            Promise.resolve(42),
            { delayPromise, template: template1 },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
          );
          yield new TestData(
            'shows content for rejected promise',
            () => Promise.reject(new Error('foo-bar')),
            { delayPromise, template: template1 },
            config(),
            wrap('rejected with foo-bar', 'r'),
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
          );
          yield new TestData(
            'reacts to change in promise value - fulfilled -> fulfilled',
            Promise.resolve(42),
            { delayPromise, template: template1 },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Promise.resolve(24);
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('resolved with 24', 'f'));
              ctx.assertCallSet([]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - fulfilled -> rejected',
            Promise.resolve(42),
            { delayPromise, template: template1 },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Promise.reject(new Error('foo-bar'));
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - fulfilled -> (pending -> fulfilled)',
            Promise.resolve(42),
            { delayPromise, template: template1 },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              let resolve: (value: unknown) => void;
              const promise: PromiseWithId = new Promise((r) => resolve = r);
              promise.id = 0;
              ctx.app.promise = promise;
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${phost}-1`)]);
              ctx.clear();

              resolve(84);
              await p.domWriteQueue.yield();
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - fulfilled -> (pending -> rejected)',
            Promise.resolve(42),
            { delayPromise, template: template1 },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              let reject: (value: unknown) => void;
              const promise: PromiseWithId = new Promise((_, r) => reject = r);
              promise.id = 0;
              ctx.app.promise = promise;
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${phost}-1`)]);
              ctx.clear();

              reject(new Error('foo-bar'));
              await p.domWriteQueue.yield();
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - rejected -> rejected',
            () => Promise.reject(new Error('foo-bar')),
            { delayPromise, template: template1 },
            config(),
            wrap('rejected with foo-bar', 'r'),
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Promise.reject(new Error('fizz-bazz'));
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('rejected with fizz-bazz', 'r'));
              ctx.assertCallSet([]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - rejected -> fulfilled',
            () => Promise.reject(new Error('foo-bar')),
            { delayPromise, template: template1 },
            config(),
            wrap('rejected with foo-bar', 'r'),
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Promise.resolve(42);
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - rejected -> (pending -> fulfilled)',
            () => Promise.reject(new Error('foo-bar')),
            { delayPromise, template: template1 },
            config(),
            wrap('rejected with foo-bar', 'r'),
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              let resolve: (value: unknown) => void;
              const promise: PromiseWithId = new Promise((r) => resolve = r);
              promise.id = 0;
              ctx.app.promise = promise;
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-1`), ...getActivationSequenceFor(`${phost}-1`)]);
              ctx.clear();

              resolve(84);
              await p.domWriteQueue.yield();
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - rejected -> (pending -> rejected)',
            () => Promise.reject(new Error('foo-bar')),
            { delayPromise, template: template1 },
            config(),
            wrap('rejected with foo-bar', 'r'),
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              let reject: (value: unknown) => void;
              const promise: PromiseWithId = new Promise((_, r) => reject = r);
              promise.id = 0;
              ctx.app.promise = promise;
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-1`), ...getActivationSequenceFor(`${phost}-1`)]);
              ctx.clear();

              reject(new Error('foo-bar'));
              await p.domWriteQueue.yield();
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - pending -> pending',
            Object.assign(new Promise(() => {/* noop */ }), { id: 0 }),
            { delayPromise, template: template1 },
            config(),
            wrap('pending0', 'p'),
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor(`${phost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Object.assign(new Promise(() => {/* noop */ }), { id: 1 });
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
              ctx.assertCallSet([]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - pending -> fulfilled',
            Object.assign(new Promise(() => {/* noop */ }), { id: 0 }),
            { delayPromise, template: template1 },
            config(),
            wrap('pending0', 'p'),
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Promise.resolve(42);
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - pending -> rejected',
            Object.assign(new Promise(() => {/* noop */ }), { id: 0 }),
            { delayPromise, template: template1 },
            config(),
            wrap('pending0', 'p'),
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              ctx.app.promise = Promise.reject(new Error('foo-bar'));
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - pending -> (pending -> fulfilled)',
            Object.assign(new Promise(() => {/* noop */ }), { id: 0 }),
            { delayPromise, template: template1 },
            config(),
            wrap('pending0', 'p'),
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              let resolve: (value: unknown) => void;
              ctx.app.promise = Object.assign(new Promise((r) => resolve = r), { id: 1 });
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
              ctx.assertCallSet([]);

              resolve(42);
              await p.domWriteQueue.yield();
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
            }
          );
          yield new TestData(
            'reacts to change in promise value - pending -> (pending -> rejected)',
            Object.assign(new Promise(() => {/* noop */ }), { id: 0 }),
            { delayPromise, template: template1 },
            config(),
            wrap('pending0', 'p'),
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const p = ctx.platform;
              let reject: (value: unknown) => void;
              ctx.app.promise = Object.assign(new Promise((_, r) => reject = r), { id: 1 });
              await p.domWriteQueue.yield();

              assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
              ctx.assertCallSet([]);

              reject(new Error('foo-bar'));
              await p.domWriteQueue.yield();
              await p.domWriteQueue.yield();
              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
            }
          );
          yield new TestData(
            'can be used in isolation without any of the child template controllers',
            new Promise(() => {/* noop */ }),
            { delayPromise, template: `<template><template ${pattribute}="promise">this is shown always</template></template>` },
            config(),
            'this is shown always',
            [],
            [],
          );
          const pTemplt =
            `<template>
        <template ${pattribute}="promise">
          <pending-host pending p.bind="promise"></pending-host>
        </template>
      </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>pending - resolved',
              Object.assign(new Promise((r) => resolve = r), { id: 0 }),
              { delayPromise, template: pTemplt },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              [],
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, '');
                ctx.assertCallSet(getDeactivationSequenceFor(`${phost}-1`));
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>pending - rejected',
              Object.assign(new Promise((_, r) => reject = r), { id: 0 }),
              { delayPromise, template: pTemplt },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              [],
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, '');
                ctx.assertCallSet(getDeactivationSequenceFor(`${phost}-1`));
              }
            );
          }
          const pfCombTemplt =
            `<template>
        <template ${pattribute}="promise">
          <pending-host pending p.bind="promise"></pending-host>
          <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        </template>
      </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>(pending+then) - resolved',
              Object.assign(new Promise((r) => resolve = r), { id: 0 }),
              { delayPromise, template: pfCombTemplt },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${fhost}-1`),
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>(pending+then) - rejected',
              Object.assign(new Promise((_, r) => reject = r), { id: 0 }),
              { delayPromise, template: pfCombTemplt },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              [],
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, '');
                ctx.assertCallSet(getDeactivationSequenceFor(`${phost}-1`));
              }
            );
          }
          const prCombTemplt =
            `<template>
        <template ${pattribute}="promise">
          <pending-host pending p.bind="promise"></pending-host>
          <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
        </template>
      </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>(pending+catch) - resolved',
              Object.assign(new Promise((r) => resolve = r), { id: 0 }),
              { delayPromise, template: prCombTemplt },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              [],
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, '');
                ctx.assertCallSet(getDeactivationSequenceFor(`${phost}-1`));
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>(pending+catch) - rejected',
              Object.assign(new Promise((_, r) => reject = r), { id: 0 }),
              { delayPromise, template: prCombTemplt },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
              }
            );
          }
          const fTemplt =
            `<template>
      <template ${pattribute}="promise">
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
      </template>
    </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>then - resolved',
              Object.assign(new Promise((r) => resolve = r), { id: 0 }),
              { delayPromise, template: fTemplt },
              config(),
              '',
              [],
              getDeactivationSequenceFor(`${fhost}-1`),
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                ctx.assertCallSet(getActivationSequenceFor(`${fhost}-1`));
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>then - rejected',
              Object.assign(new Promise((_, r) => reject = r), { id: 0 }),
              { delayPromise, template: fTemplt },
              config(),
              '',
              [],
              [],
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, '');
                ctx.assertCallSet([]);
              }
            );
          }
          const rTemplt =
            `<template>
      <template ${pattribute}="promise">
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>catch - resolved',
              new Promise((r) => resolve = r),
              { delayPromise, template: rTemplt },
              config(),
              '',
              [],
              [],
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, '');
                ctx.assertCallSet([]);
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>catch - rejected',
              new Promise((_, r) => reject = r),
              { delayPromise, template: rTemplt },
              config(),
              '',
              [],
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                ctx.assertCallSet(getActivationSequenceFor(`${rhost}-1`));
              }
            );
          }
          const frTemplt =
            `<template>
      <template ${pattribute}="promise">
        <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
        <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>then+catch - resolved',
              new Promise((r) => resolve = r),
              { delayPromise, template: frTemplt },
              config(),
              '',
              [],
              getDeactivationSequenceFor(`${fhost}-1`),
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
                ctx.assertCallSet(getActivationSequenceFor(`${fhost}-1`));
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'supports combination: promise>then+catch - rejected',
              new Promise((_, r) => reject = r),
              { delayPromise, template: frTemplt },
              config(),
              '',
              [],
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                reject(new Error('foo-bar'));
                const q = ctx.platform.domWriteQueue;
                await q.yield();
                await q.yield();
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
                ctx.assertCallSet(getActivationSequenceFor(`${rhost}-1`));
              }
            );
          }

          yield new TestData(
            'shows static elements',
            Promise.resolve(42),
            {
              delayPromise, template: `
        <template>
          <template ${pattribute}="promise">
            <div>foo</div>
          </template>
        </template>` },
            config(),
            '<div>foo</div>',
            [],
            [],
          );

          const template2 = `
    <template>
      <template ${pattribute}="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host1 then></fulfilled-host1>
        <rejected-host1 catch></rejected-host1>
      </template>
    </template>`;
          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              'shows content as per promise status #2 - fulfilled',
              Object.assign(new Promise((r) => resolve = r), { id: 0 }),
              {
                delayPromise, template: template2,
                registrations: [
                  createComponentType('fulfilled-host1', 'resolved'),
                  createComponentType('rejected-host1', 'rejected'),
                ]
              },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor('fulfilled-host1-1'),
              async (ctx) => {
                ctx.clear();
                resolve(42);
                const p = ctx.platform;
                // one tick to call back the fulfill delegate, and queue task
                await p.domWriteQueue.yield();
                // on the next tick wait the queued task
                await p.domWriteQueue.yield();
                assert.html.innerEqual(ctx.host, '<fulfilled-host1 class="au">resolved</fulfilled-host1>');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor('fulfilled-host1-1')]);
              }
            );
          }
          {
            let reject: (value: unknown) => void;
            yield new TestData(
              'shows content as per promise status #2 - rejected',
              Object.assign(new Promise((_, r) => reject = r), { id: 0 }),
              {
                delayPromise, template: template2,
                registrations: [
                  createComponentType('fulfilled-host1', 'resolved'),
                  createComponentType('rejected-host1', 'rejected'),
                ]
              },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor('rejected-host1-1'),
              async (ctx) => {
                ctx.clear();
                reject(new Error());
                const p = ctx.platform;
                // one tick to call back the fulfill delegate, and queue task
                await p.domWriteQueue.yield();
                // on the next tick wait the queued task
                await p.domWriteQueue.yield();
                assert.html.innerEqual(ctx.host, '<rejected-host1 class="au">rejected</rejected-host1>');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor('rejected-host1-1')]);
              }
            );
          }
          yield new TestData(
            'works in nested template - fulfilled>fulfilled',
            Promise.resolve({ json() { return Promise.resolve(42); } }),
            {
              delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <template ${fattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                </template>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>
            </template>`
            },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${fhost}-1`),
          );
          yield new TestData(
            'works in nested template - fulfilled>rejected',
            Promise.resolve({ json() { return Promise.reject(new Error('foo-bar')); } }),
            {
              delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <template ${fattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="updateError(err)"></rejected-host>
                </template>
                <rejected-host ${rattribute}="err1" err.bind="err1"></rejected-host>
              </template>
            </template>`
            },
            config(),
            '<rejected-host err.bind="updateError(err)" class="au">rejected with foo-bar1</rejected-host>',
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
          );
          yield new TestData(
            'works in nested template - rejected>fulfilled',
            () => Promise.reject({ json() { return Promise.resolve(42); } }),
            {
              delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data1" data.bind="data1"></fulfilled-host>
                <template ${rattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
                </template>
              </template>
            </template>`
            },
            config(),
            wrap('resolved with 42', 'f'),
            getActivationSequenceFor(`${fhost}-2`),
            getDeactivationSequenceFor(`${fhost}-2`),
          );
          yield new TestData(
            'works in nested template - rejected>rejected',
            () => Promise.reject({ json() { return Promise.reject(new Error('foo-bar')); } }),
            {
              delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data1" data.bind="data1"></fulfilled-host>
                <template ${rattribute}="response" ${pattribute}="response.json()">
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
                </template>
              </template>
            </template>`
            },
            config(),
            wrap('rejected with foo-bar', 'r'),
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${rhost}-1`),
          );

          for (const $resolve of [true, false]) {
            yield new TestData(
              `works with value converter on - settled promise - ${$resolve ? 'fulfilled' : 'rejected'}`,
              null,
              {
                delayPromise, template: `
            <template>
              <template ${pattribute}="42|promisify:${$resolve}">
                <pending-host pending></pending-host>
                <fulfilled-host ${fattribute}="data | double" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err | double" err.bind="err"></rejected-host>
              </template>
            </template>`
              },
              config(),
              $resolve ? wrap('resolved with 42 42', 'f') : wrap('rejected with 42 42', 'r'),
              getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
              getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            );

            yield new TestData(
              `works with value converter - longer running promise - ${$resolve ? 'fulfilled' : 'rejected'}`,
              null,
              {
                delayPromise, template: `
            <template>
              <template ${pattribute}="42|promisify:${$resolve}:10">
                <pending-host pending></pending-host>
                <fulfilled-host ${fattribute}="data | double" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err | double" err.bind="err"></rejected-host>
              </template>
            </template>`
              },
              config(),
              '<pending-host class="au">pendingundefined</pending-host>',
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                const q = ctx.platform.domWriteQueue;
                const tc = (ctx.app as ICustomElementViewModel).$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
                try {
                  await tc.value;
                } catch {
                  // ignore rejection
                }
                await q.yield();

                if ($resolve) {
                  assert.html.innerEqual(ctx.host, wrap('resolved with 42 42', 'f'), 'fulfilled');
                } else {
                  assert.html.innerEqual(ctx.host, wrap('rejected with 42 42', 'r'), 'rejected');
                }
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)]);
              },
            );

            yield new TestData(
              `works with binding behavior - settled promise - ${$resolve ? 'fulfilled' : 'rejected'}`,
              () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')),
              {
                delayPromise, template: `
            <template>
              <template ${pattribute}="promise & noop">
                <pending-host pending></pending-host>
                <fulfilled-host ${fattribute}="data & noop" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err & noop" err.bind="err"></rejected-host>
              </template>
            </template>`
              },
              config(),
              $resolve ? wrap('resolved with 42', 'f') : wrap('rejected with foo-bar', 'r'),
              getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
              getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            );

            yield new TestData(
              `works with binding behavior - longer running promise - ${$resolve ? 'fulfilled' : 'rejected'}`,
              () => Object.assign(
                createMultiTickPromise(20, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')))(),
                { id: 0 }
              ),
              {
                delayPromise, template: `
            <template>
              <template ${pattribute}="promise & noop">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data & noop" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err & noop" err.bind="err"></rejected-host>
              </template>
            </template>`
              },
              config(),
              wrap('pending0', 'p'),
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                const q = ctx.platform.domWriteQueue;
                const tc = (ctx.app as ICustomElementViewModel).$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
                try {
                  await tc.value;
                } catch {
                  // ignore rejection
                }
                await q.yield();

                if ($resolve) {
                  assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'), 'fulfilled');
                } else {
                  assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected');
                }
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)]);
              },
            );

            {
              const staticPart = '<my-el prop.bind="fooBar" class="au">Fizz Bazz</my-el>';
              let resolve: (value: unknown) => void;
              let reject: (value: unknown) => void;
              yield new TestData(
                `enables showing rest of the content although the promise is no settled - ${$resolve ? 'fulfilled' : 'rejected'}`,
                Object.assign(new Promise((rs, rj) => { resolve = rs; reject = rj; }), { id: 0 }),
                {
                  delayPromise, template: `
              <let foo-bar.bind="'Fizz Bazz'"></let>
              <my-el prop.bind="fooBar"></my-el>
              <template ${pattribute}="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>`,
                  registrations: [
                    CustomElement.define({ name: 'my-el', template: `\${prop}`, bindables: ['prop'] }, class MyEl { }),
                  ]
                },
                config(),
                `${staticPart} ${wrap('pending0', 'p')}`,
                getActivationSequenceFor(`${phost}-1`),
                getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
                async (ctx) => {
                  ctx.clear();
                  if ($resolve) {
                    resolve(42);
                  } else {
                    reject(new Error('foo-bar'));
                  }
                  const p = ctx.platform;
                  // one tick to call back the fulfill delegate, and queue task
                  await p.domWriteQueue.yield();
                  // on the next tick wait the queued task
                  await p.domWriteQueue.yield();
                  assert.html.innerEqual(ctx.host, `${staticPart} ${$resolve ? wrap('resolved with 42', 'f') : wrap('rejected with foo-bar', 'r')}`);
                  ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)]);
                }
              );
            }
          }

          yield new TestData(
            `[repeat.for] > [${pattribute}] works`,
            null,
            {
              // , ['forty-two', true], ['fizz-bazz', false]
              template: `
          <template>
            <let items.bind="[[42, true], ['foo-bar', false]]"></let>
            <template repeat.for="item of items">
              <template ${pattribute}="item[0] | promisify:item[1]">
                <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>
            </template>
          </template>`,
            },
            config(),
            `${wrap('resolved with 42', 'f')} ${wrap('rejected with foo-bar', 'r')}`, //  ${wrap('resolved with forty-two', 'f')} ${wrap('rejected with fizz-bazz', 'r')}
            getActivationSequenceFor([`${fhost}-1`, `${rhost}-2`/* , `${fhost}-3`, `${rhost}-4` */]),
            getDeactivationSequenceFor([`${fhost}-1`, `${rhost}-2`/* , `${fhost}-3`, `${rhost}-4` */]),
          );

          yield new TestData(
            `[repeat.for,${pattribute}] works`,
            null,
            {
              // , ['forty-two', true], ['fizz-bazz', false]
              template: `
          <template>
            <let items.bind="[[42, true], ['foo-bar', false]]"></let>
              <template repeat.for="item of items" ${pattribute}="item[0] | promisify:item[1]">
                <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </template>
          </template>`,
            },
            config(),
            `${wrap('resolved with 42', 'f')} ${wrap('rejected with foo-bar', 'r')}`, //  ${wrap('resolved with forty-two', 'f')} ${wrap('rejected with fizz-bazz', 'r')}
            getActivationSequenceFor([`${fhost}-1`, `${rhost}-2`/* , `${fhost}-3`), `${rhost}-4` */]),
            getDeactivationSequenceFor([`${fhost}-1`, `${rhost}-2`/* , `${fhost}-3`), `${rhost}-4` */]),
          );

          yield new TestData(
            `[then,repeat.for] works`,
            null,
            {
              delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:true">
              <fulfilled-host ${fattribute}="items" repeat.for="data of items" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
            },
            config(),
            `${wrap('resolved with 42', 'f')}${wrap('resolved with forty-two', 'f')}`,
            getActivationSequenceFor([`${fhost}-1`, `${fhost}-2`]),
            getDeactivationSequenceFor([`${fhost}-1`, `${fhost}-2`]),
          );

          yield new TestData(
            `[then] > [repeat.for] works`,
            null,
            {
              delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:true">
              <template ${fattribute}="items">
                <fulfilled-host repeat.for="data of items" data.bind="data"></fulfilled-host>
              </template>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
            },
            config(),
            `${wrap('resolved with 42', 'f')}${wrap('resolved with forty-two', 'f')}`,
            getActivationSequenceFor([`${fhost}-1`, `${fhost}-2`]),
            getDeactivationSequenceFor([`${fhost}-1`, `${fhost}-2`]),
          );
          {
            const registrations = [
              createComponentType('rej-host', `rejected with \${err}`, ['err']),
              ValueConverter.define(
                'parseError',
                class ParseError {
                  public toView(value: Error): string[] {
                    return value.message.split(',');
                  }
                }
              )
            ];
            yield new TestData(
              `[catch,repeat.for] works`,
              null,
              {
                delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:false">
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rej-host ${rattribute}="error" repeat.for="err of error | parseError" err.bind="err"></rej-host>
            </template>
          </template>`,
                registrations,
              },
              config(),
              '<rej-host err.bind="err" class="au">rejected with 42</rej-host><rej-host err.bind="err" class="au">rejected with forty-two</rej-host>',
              getActivationSequenceFor(['rej-host-1', 'rej-host-2']),
              getDeactivationSequenceFor(['rej-host-1', 'rej-host-2']),
            );
            yield new TestData(
              `[catch] > [repeat.for] works`,
              null,
              {
                delayPromise, template: `
          <template>
            <template ${pattribute}="[42, 'forty-two'] | promisify:false">
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <template ${rattribute}="error">
                <rej-host repeat.for="err of error | parseError" err.bind="err"></rej-host>
              </template>
            </template>
          </template>`,
                registrations,
              },
              config(),
              '<rej-host err.bind="err" class="au">rejected with 42</rej-host><rej-host err.bind="err" class="au">rejected with forty-two</rej-host>',
              getActivationSequenceFor(['rej-host-1', 'rej-host-2']),
              getDeactivationSequenceFor(['rej-host-1', 'rej-host-2']),
            );
          }

          yield new TestData(
            `[if,${pattribute}], [else,${pattribute}] works`,
            Promise.resolve(42),
            {
              delayPromise, template: `
          <let flag.bind="false"></let>
          <template if.bind="flag" ${pattribute}="42 | promisify:true">
            <pending-host pending></pending-host>
            <fulfilled-host ${fattribute}="data1" data.bind="data1"></fulfilled-host>
            <rejected-host ${rattribute}="err1" err.bind="err1"></rejected-host>
          </template>
          <template else ${pattribute}="'forty-two' | promisify:false:10">
            <pending-host pending></pending-host>
            <fulfilled-host ${fattribute}="data2" data.bind="data2"></fulfilled-host>
            <rejected-host ${rattribute}="err2" err.bind="err2"></rejected-host>
          </template>`,
            },
            config(),
            '<pending-host class="au">pendingundefined</pending-host>',
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor(`${fhost}-2`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const $if = controller.children.find((c) => c.viewModel instanceof If).viewModel as If;

              const ptc2 = $if.elseView.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
              try {
                await ptc2.value;
              } catch {
                // ignore rejection
              }
              await q.yield();

              assert.html.innerEqual(ctx.host, '<rejected-host err.bind="err2" class="au">rejected with forty-two</rejected-host>');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
              ctx.clear();

              controller.scope.overrideContext.flag = true;
              await $if['pending'];
              const ptc1 = $if.ifView.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
              try {
                await ptc1.value;
              } catch {
                // ignore rejection
              }
              await q.yield();

              assert.html.innerEqual(ctx.host, '<fulfilled-host data.bind="data1" class="au">resolved with 42</fulfilled-host>');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-1`), ...getActivationSequenceFor(`${fhost}-2`)]);
            },
          );

          yield new TestData(
            `[pending,if] works`,
            Object.assign(new Promise(() => {/* noop */ }), { id: 0 }),
            {
              delayPromise, template: `
          <let flag.bind="false"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise" if.bind="flag"></pending-host>
            <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
            <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
          </template>`,
            },
            config(),
            '',
            [],
            getDeactivationSequenceFor(`${phost}-1`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;

              controller.scope.overrideContext.flag = true;
              await ((tc['pending']['view'] as ISyntheticView).children.find((c) => c.viewModel instanceof If).viewModel as If)['pending'];
              await q.yield();

              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'));
              ctx.assertCallSet(getActivationSequenceFor(`${phost}-1`));
            },
          );

          yield new TestData(
            `[then,if] works- #1`,
            Object.assign(Promise.resolve(42), { id: 0 }),
            {
              delayPromise, template: `
          <let flag.bind="false"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <fulfilled-host ${fattribute}="data" if.bind="flag" data.bind="data"></fulfilled-host>
            <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
          </template>`,
            },
            config(),
            '',
            [],
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;

              controller.scope.overrideContext.flag = true;
              await ((tc['fulfilled']['view'] as ISyntheticView).children.find((c) => c.viewModel instanceof If).viewModel as If)['pending'];

              assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
              ctx.assertCallSet(getActivationSequenceFor(`${fhost}-1`));
            },
          );

          yield new TestData(
            `[then,if] works- #2`,
            Object.assign(Promise.resolve(24), { id: 0 }),
            {
              delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" if.bind="data === 42" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
            },
            config(),
            '',
            [],
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;
              const app = ctx.app;
              await (app.promise = Promise.resolve(42));
              await q.yield();

              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;

              controller.scope.overrideContext.flag = true;
              await ((tc['fulfilled']['view'] as ISyntheticView).children.find((c) => c.viewModel instanceof If).viewModel as If)['pending'];

              assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'));
              ctx.assertCallSet(getActivationSequenceFor(`${fhost}-1`));
            },
          );

          yield new TestData(
            `[catch,if] works- #1`,
            () => Object.assign(Promise.reject(new Error('foo-bar')), { id: 0 }),
            {
              delayPromise, template: `
          <let flag.bind="false"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
            <rejected-host ${rattribute}="err" if.bind="flag" err.bind="err"></rejected-host>
          </template>`,
            },
            config(),
            '',
            [],
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;

              controller.scope.overrideContext.flag = true;
              await ((tc['rejected']['view'] as ISyntheticView).children.find((c) => c.viewModel instanceof If).viewModel as If)['pending'];

              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet(getActivationSequenceFor(`${rhost}-1`));
            },
          );

          yield new TestData(
            `[catch,if] works- #2`,
            () => Object.assign(Promise.reject(new Error('foo')), { id: 0 }),
            {
              delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" if.bind="err.message === 'foo-bar'" err.bind="err"></rejected-host>
            </template>
          </template>`,
            },
            config(),
            '',
            [],
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;
              const app = ctx.app;
              try {
                await (app.promise = Promise.reject(new Error('foo-bar')));
              } catch {
                // ignore rejection
              }
              await q.yield();

              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;

              controller.scope.overrideContext.flag = true;
              await ((tc['rejected']['view'] as ISyntheticView).children.find((c) => c.viewModel instanceof If).viewModel as If)['pending'];

              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'));
              ctx.assertCallSet(getActivationSequenceFor(`${rhost}-1`));
            },
          );

          const waitSwitch: ($switch: Switch) => Promise<void> = async ($switch) => {
            const promise = $switch.promise;
            await promise;
            if ($switch.promise !== promise) {
              await waitSwitch($switch);
            }
          };

          // eslint-disable-next-line require-atomic-updates
          for (const $resolve of [true, false]) {

            yield new TestData(
              `[case,${pattribute}] works - ${$resolve ? 'fulfilled' : 'rejected'}`,
              () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')),
              {
                delayPromise, template: `
          <let status.bind="'unknown'"></let>
          <template switch.bind="status">
            <template case="unknown">Unknown</template>
            <template case="processing" ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <rejected-host ${rattribute}="err" if.bind="err.message === 'foo-bar'" err.bind="err"></rejected-host>
            </template>
          </template>`,
              },
              config(),
              'Unknown',
              [],
              getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                const q = ctx.platform.domWriteQueue;
                const app = ctx.app;
                const controller = (app as ICustomElementViewModel).$controller;
                controller.scope.overrideContext.status = 'processing';
                await waitSwitch(controller.children.find((c) => c.viewModel instanceof Switch).viewModel as Switch);

                try {
                  await app.promise;
                } catch {
                  // ignore rejection
                }
                await q.yield();

                assert.html.innerEqual(ctx.host, $resolve ? wrap('resolved with 42', 'f') : wrap('rejected with foo-bar', 'r'));
                ctx.assertCallSet(getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`));
              },
            );
          }

          yield new TestData(
            `[then,switch] works - #1`,
            Promise.resolve('foo'),
            {
              delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <template ${fattribute}="status" switch.bind="status">
                <fulfilled-host case='processing' data="processing"></fulfilled-host>
                <fulfilled-host default-case data="unknown"></fulfilled-host>
              </template>
              <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
            </template>
          </template>`,
            },
            config(),
            '<fulfilled-host data="unknown" class="au">resolved with unknown</fulfilled-host>',
            getActivationSequenceFor(`${fhost}-2`),
            getDeactivationSequenceFor(`${fhost}-1`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
              const $switch = tc['fulfilled'].view.children.find((c) => c.viewModel instanceof Switch).viewModel as Switch;

              await (app.promise = Promise.resolve('processing'));
              await q.yield();
              await waitSwitch($switch);

              assert.html.innerEqual(ctx.host, '<fulfilled-host data="processing" class="au">resolved with processing</fulfilled-host>');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-2`), ...getActivationSequenceFor(`${fhost}-1`)]);
            },
          );

          yield new TestData(
            `[then,switch] works - #2`,
            Promise.resolve('foo'),
            {
              delayPromise, template: `
          <let status.bind="'processing'"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <template then switch.bind="status">
              <fulfilled-host case='processing' data="processing"></fulfilled-host>
              <fulfilled-host default-case data="unknown"></fulfilled-host>
            </template>
            <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
          </template>`,
            },
            config(),
            '<fulfilled-host data="processing" class="au">resolved with processing</fulfilled-host>',
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor(`${fhost}-2`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
              const $switch = tc['fulfilled'].view.children.find((c) => c.viewModel instanceof Switch).viewModel as Switch;
              controller.scope.overrideContext.status = 'foo';
              await waitSwitch($switch);
              assert.html.innerEqual(ctx.host, '<fulfilled-host data="unknown" class="au">resolved with unknown</fulfilled-host>');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${fhost}-2`)]);
            }
          );

          yield new TestData(
            `[catch,switch] works - #1`,
            () => Promise.reject(new Error('foo')),
            {
              delayPromise, template: `
          <template>
            <template ${pattribute}="promise">
              <pending-host pending p.bind="promise"></pending-host>
              <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
              <template ${rattribute}="err" switch.bind="err.message">
                <rejected-host case='processing' err.bind="{message: 'processing'}"></rejected-host>
                <rejected-host default-case  err.bind="{message: 'unknown'}"></rejected-host>
              </template>
            </template>
          </template>`,
            },
            config(),
            '<rejected-host err.bind="{message: \'unknown\'}" class="au">rejected with unknown</rejected-host>',
            getActivationSequenceFor(`${rhost}-2`),
            getDeactivationSequenceFor(`${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
              const $switch = tc['rejected'].view.children.find((c) => c.viewModel instanceof Switch).viewModel as Switch;

              try {
                await (app.promise = Promise.reject(new Error('processing')));
              } catch {
                // ignore rejection
              }
              await q.yield();
              await waitSwitch($switch);

              assert.html.innerEqual(ctx.host, '<rejected-host err.bind="{message: \'processing\'}" class="au">rejected with processing</rejected-host>');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-2`), ...getActivationSequenceFor(`${rhost}-1`)]);
            },
          );

          yield new TestData(
            `[catch,switch] works - #2`,
            () => Promise.reject(new Error('foo')),
            {
              delayPromise, template: `
          <let status.bind="'processing'"></let>
          <template ${pattribute}="promise">
            <pending-host pending p.bind="promise"></pending-host>
            <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
            <template catch switch.bind="status">
              <rejected-host case='processing' err.bind="{message: 'processing'}"></rejected-host>
              <rejected-host default-case  err.bind="{message: 'unknown'}"></rejected-host>
            </template>
          </template>`,
            },
            config(),
            '<rejected-host err.bind="{message: \'processing\'}" class="au">rejected with processing</rejected-host>',
            getActivationSequenceFor(`${rhost}-1`),
            getDeactivationSequenceFor(`${rhost}-2`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              const controller = (app as ICustomElementViewModel).$controller;
              const tc = controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
              const $switch = tc['rejected'].view.children.find((c) => c.viewModel instanceof Switch).viewModel as Switch;
              controller.scope.overrideContext.status = 'foo';
              await waitSwitch($switch);
              assert.html.innerEqual(ctx.host, '<rejected-host err.bind="{message: \'unknown\'}" class="au">rejected with unknown</rejected-host>');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${rhost}-1`), ...getActivationSequenceFor(`${rhost}-2`)]);
            }
          );

          yield new TestData(
            `au-slot use-case`,
            () => Promise.reject(new Error('foo')),
            {
              delayPromise, template: `
          <foo-bar p.bind="42|promisify:true">
            <div au-slot>f1</div>
            <div au-slot="rejected">r1</div>
          </foo-bar>
          <foo-bar p.bind="'forty-two'|promisify:false">
            <div au-slot>f2</div>
            <div au-slot="rejected">r2</div>
          </foo-bar>
          <template as-custom-element="foo-bar">
            <bindable property="p"></bindable>
            <template ${pattribute}="p">
              <au-slot name="pending" pending></au-slot>
              <au-slot then></au-slot>
              <au-slot name="rejected" catch></au-slot>
            </template>
          </template>`,
            },
            config(),
            '<foo-bar p.bind="42|promisify:true" class="au"> <div>f1</div> </foo-bar> <foo-bar p.bind="\'forty-two\'|promisify:false" class="au"> <div>r2</div> </foo-bar>',
            [],
            [],
          );

          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              `*[promise]>div>*[pending|then|catch] works`,
              Object.assign(new Promise((r) => { resolve = r; }), { id: 0 }),
              {
                delayPromise, template: `
            <template>
              <template ${pattribute}="promise">
                <div>
                  <pending-host pending p.bind="promise"></pending-host>
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
                </div>
              </template>
            </template>`,
              },
              config(),
              `<div> ${wrap('pending0', 'p')} </div>`,
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                const q = ctx.platform.domWriteQueue;
                resolve(42);
                await q.yield();
                await q.yield();

                assert.html.innerEqual(ctx.host, `<div> ${wrap('resolved with 42', 'f')} </div>`, 'fulfilled');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);

                ctx.clear();
                ctx.app.promise = Promise.reject(new Error('foo-bar'));
                await q.yield();
                await q.yield();

                assert.html.innerEqual(ctx.host, `<div> ${wrap('rejected with foo-bar', 'r')} </div>`, 'rejected');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
              }
            );
          }

          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              `*[promise]>CE>*[pending|then|catch] produces output`,
              Object.assign(new Promise((r) => { resolve = r; }), { id: 0 }),
              {
                delayPromise, template: `
            <template as-custom-element="foo-bar">
              foo bar
            </template>
            <template ${pattribute}="promise">
              <foo-bar>
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
              </foo-bar>
            </template>`,
              },
              config(),
              `<foo-bar class="au"> ${wrap('pending0', 'p')} foo bar </foo-bar>`,
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                const q = ctx.platform.domWriteQueue;
                resolve(42);
                await q.yield();
                await q.yield();

                assert.html.innerEqual(ctx.host, `<foo-bar class="au"> ${wrap('resolved with 42', 'f')} foo bar </foo-bar>`, 'fulfilled');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);

                ctx.clear();
                ctx.app.promise = Promise.reject(new Error('foo-bar'));
                await q.yield();
                await q.yield();

                assert.html.innerEqual(ctx.host, `<foo-bar class="au"> ${wrap('rejected with foo-bar', 'r')} foo bar </foo-bar>`, 'rejected');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
              }
            );
          }

          {
            let resolve: (value: unknown) => void;
            yield new TestData(
              `*[promise]>CE>CE>*[pending|then|catch] produces output`,
              Object.assign(new Promise((r) => { resolve = r; }), { id: 0 }),
              {
                delayPromise, template: `
            <template as-custom-element="foo-bar">
              foo bar
            </template>
            <template as-custom-element="fiz-baz">
              fiz baz
            </template>
            <template ${pattribute}="promise">
              <foo-bar>
                <fiz-baz>
                  <pending-host pending p.bind="promise"></pending-host>
                  <fulfilled-host ${fattribute}="data" data.bind="data"></fulfilled-host>
                  <rejected-host ${rattribute}="err" err.bind="err"></rejected-host>
                </fiz-baz>
              </foo-bar>
            </template>`,
              },
              config(),
              `<foo-bar class="au"> <fiz-baz class="au"> ${wrap('pending0', 'p')} fiz baz </fiz-baz> foo bar </foo-bar>`,
              getActivationSequenceFor(`${phost}-1`),
              getDeactivationSequenceFor(`${rhost}-1`),
              async (ctx) => {
                ctx.clear();
                const q = ctx.platform.domWriteQueue;
                resolve(42);
                await q.yield();
                await q.yield();

                assert.html.innerEqual(ctx.host, `<foo-bar class="au"> <fiz-baz class="au"> ${wrap('resolved with 42', 'f')} fiz baz </fiz-baz> foo bar </foo-bar>`, 'fulfilled');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor(`${fhost}-1`)]);

                ctx.clear();
                ctx.app.promise = Promise.reject(new Error('foo-bar'));
                await q.yield();
                await q.yield();

                assert.html.innerEqual(ctx.host, `<foo-bar class="au"> <fiz-baz class="au"> ${wrap('rejected with foo-bar', 'r')} fiz baz </fiz-baz> foo bar </foo-bar>`, 'rejected');
                ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${rhost}-1`)]);
              }
            );
          }
        }
        // #region timings
        // eslint-disable-next-line require-atomic-updates
        for (const $resolve of [true, false]) {
          const getPromise = (ticks: number) => () => Object.assign(
            createMultiTickPromise(ticks, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')))(),
            { id: 0 }
          );
          yield new TestData(
            `pending activation duration < promise settlement duration - ${$resolve ? 'fulfilled' : 'rejected'}`,
            getPromise(6),
            {
              delayPromise, template: template1,
              registrations: [
                Registration.instance(configLookup, new Map<string, Config>([
                  [phost, new Config(true, createWaiterWithTicks({ binding: 1, bound: 1, attaching: 1, attached: 1 }))],
                  [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                ])),
              ],
            },
            null,
            wrap('pending0', 'p'),
            getActivationSequenceFor(`${phost}-1`),
            getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const q = ctx.platform.domWriteQueue;

              try {
                await ctx.app.promise;
              } catch (e) {
                // ignore rejection
              }
              await q.yield();

              if ($resolve) {
                assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'), 'fulfilled');
              } else {
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected');
              }
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)]);
            },
          );

          // These tests are more like sanity checks rather than asserting the lifecycle hooks invocation timings and sequence of those.
          // These rather assert that under varied configurations of promise and hook timings, the template controllers still work.
          for (const [name, promiseTick, config] of [
            ['pending activation duration == promise settlement duration', 4, { binding: 1, bound: 1, attaching: 1, attached: 1 }],
            ['pending "binding" duration == promise settlement duration', 2, { binding: 2 }],
            ['pending "binding" duration > promise settlement duration', 1, { binding: 2 }],
            ['pending "binding" duration > promise settlement duration (longer running promise and hook)', 4, { binding: 6 }],
            ['pending "binding+bound" duration > promise settlement duration', 2, { binding: 1, bound: 2 }],
            ['pending "binding+bound" duration > promise settlement duration (longer running promise and hook)', 4, { binding: 3, bound: 3 }],
            ['pending "binding+bound+attaching" duration > promise settlement duration', 2, { binding: 1, bound: 1, attaching: 1 }],
            ['pending "binding+bound+attaching" duration > promise settlement duration (longer running promise and hook)', 5, { binding: 2, bound: 2, attaching: 2 }],
            ['pending "binding+bound+attaching+attached" duration > promise settlement duration', 3, { binding: 1, bound: 1, attaching: 1, attached: 1 }],
            ['pending "binding+bound+attaching+attached" duration > promise settlement duration (longer running promise and hook)', 6, { binding: 2, bound: 2, attaching: 2, attached: 2 }],
          ] as const) {
            yield new TestData(
              `${name} - ${$resolve ? 'fulfilled' : 'rejected'}`,
              getPromise(promiseTick),
              {
                delayPromise, template: template1,
                registrations: [
                  Registration.instance(configLookup, new Map<string, Config>([
                    [phost, new Config(true, createWaiterWithTicks(config))],
                    [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                    [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  ])),
                ],
              },
              null,
              null,
              null,
              getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
              async (ctx) => {
                const app = ctx.app;
                // Note: If the ticks are close to each other, we cannot avoid a race condition for the purpose of deterministic tests.
                // Therefore, the expected logs are constructed dynamically to ensure certain level of confidence.
                const tc = (app as ICustomElementViewModel).$controller.children.find((c) => c.viewModel instanceof PromiseTemplateController).viewModel as PromiseTemplateController;
                const task = tc['preSettledTask'] as (Task<void | Promise<void>> | null);
                const logs = task.status === TaskStatus.running || task.status === TaskStatus.completed
                  ? [...getActivationSequenceFor(`${phost}-1`), ...getDeactivationSequenceFor(`${phost}-1`)]
                  : [];

                try {
                  await app.promise;
                } catch {
                  // ignore rejection
                }

                const q = ctx.platform.domWriteQueue;
                await q.yield();
                if ($resolve) {
                  assert.html.innerEqual(ctx.host, wrap('resolved with 42', 'f'), 'fulfilled');
                } else {
                  assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected');
                }
                ctx.assertCallSet([...logs, ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)], `calls mismatch; presettled task status: ${task.status}`);
              }
            );
          }

          yield new TestData(
            `change of promise in quick succession - final promise is settled - ${$resolve ? 'fulfilled' : 'rejected'}`,
            Promise.resolve(42),
            {
              delayPromise, template: template1,
              registrations: [
                Registration.instance(configLookup, new Map<string, Config>([
                  [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                ])),
              ],
            },
            null,
            wrap(`resolved with 42`, 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              app.promise = Object.assign(
                createMultiTickPromise(10, () => $resolve ? Promise.resolve(84) : Promise.reject(new Error('foo-bar')))(),
                { id: 0 }
              );

              const q = ctx.platform.domWriteQueue;
              await q.yield();
              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${phost}-1`)], `calls mismatch1`);
              ctx.clear();

              try {
                // interrupt
                await (app.promise = $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')));
              } catch {
                // ignore rejection
              }
              // wait for the next tick
              await q.yield();
              if ($resolve) {
                assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled');
              } else {
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected');
              }
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)], `calls mismatch2`);
            },
          );

          yield new TestData(
            `change of promise in quick succession - final promise is of shorter duration - ${$resolve ? 'fulfilled' : 'rejected'}`,
            Promise.resolve(42),
            {
              delayPromise, template: template1,
              registrations: [
                Registration.instance(configLookup, new Map<string, Config>([
                  [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [fhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [rhost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                ])),
              ],
            },
            null,
            wrap(`resolved with 42`, 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              app.promise = Object.assign(
                createMultiTickPromise(10, () => $resolve ? Promise.resolve(84) : Promise.reject(new Error('foo-bar')))(),
                { id: 0 }
              );

              const q = ctx.platform.domWriteQueue;
              await q.yield();
              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${phost}-1`)], `calls mismatch1`);
              ctx.clear();

              // interrupt
              const promise = app.promise = Object.assign(
                createMultiTickPromise(5, () => $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')))(),
                { id: 1 }
              );

              await q.queueTask(() => {
                assert.html.innerEqual(ctx.host, wrap('pending1', 'p'), 'pending1');
              }).result;
              ctx.assertCallSet([], `calls mismatch2`);
              ctx.clear();

              try {
                await promise;
              } catch {
                // ignore rejection
              }
              // wait for the next tick
              await q.yield();

              if ($resolve) {
                assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled');
              } else {
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected');
              }
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)], `calls mismatch2`);
            },
          );

          yield new TestData(
            `change of promise in quick succession - changed after previous promise is settled but the post-settlement activation is pending - ${$resolve ? 'fulfilled' : 'rejected'}`,
            Promise.resolve(42),
            {
              delayPromise, template: template1,
              registrations: [
                Registration.instance(configLookup, new Map<string, Config>([
                  [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [fhost, new Config(true, createWaiterWithTicks($resolve ? { binding: 1, bound: 2, attaching: 2, attached: 2 } : Object.create(null)))],
                  [rhost, new Config(true, createWaiterWithTicks($resolve ? Object.create(null) : { binding: 1, bound: 2, attaching: 2, attached: 2 }))],
                ])),
              ],
            },
            null,
            wrap(`resolved with 42`, 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              let promise = app.promise = Object.assign(
                createMultiTickPromise(10, () => $resolve ? Promise.resolve(84) : Promise.reject(new Error('foo-bar')))(),
                { id: 0 }
              );

              const q = ctx.platform.domWriteQueue;
              await q.yield();
              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${phost}-1`)], `calls mismatch1`);
              ctx.clear();

              try {
                await promise;
              } catch {
                // ignore rejection
              }

              // attempt interrupt
              promise = app.promise = Object.assign(
                createMultiTickPromise(20, () => $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')))(),
                { id: 1 }
              );

              await q.yield();
              assert.html.innerEqual(ctx.host, wrap('pending1', 'p'), 'pending1');
              ctx.assertCallSet([], `calls mismatch3`);
              ctx.clear();

              try {
                await promise;
              } catch {
                // ignore rejection
              }
              await q.yield();

              if ($resolve) {
                assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled 2');
              } else {
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected 2');
              }
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)], `calls mismatch4`);
            },
          );

          yield new TestData(
            `change of promise in quick succession - changed after the post-settlement activation is running - ${$resolve ? 'fulfilled' : 'rejected'}`,
            Promise.resolve(42),
            {
              delayPromise, template: template1,
              registrations: [
                Registration.instance(configLookup, new Map<string, Config>([
                  [phost, new Config(true, createWaiterWithTicks(Object.create(null)))],
                  [fhost, new Config(true, createWaiterWithTicks($resolve ? { binding: 1, bound: 2, attaching: 2, attached: 2 } : Object.create(null)))],
                  [rhost, new Config(true, createWaiterWithTicks($resolve ? Object.create(null) : { binding: 1, bound: 2, attaching: 2, attached: 2 }))],
                ])),
              ],
            },
            null,
            wrap(`resolved with 42`, 'f'),
            getActivationSequenceFor(`${fhost}-1`),
            getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
            async (ctx) => {
              ctx.clear();
              const app = ctx.app;
              let promise = app.promise = Object.assign(
                createMultiTickPromise(10, () => $resolve ? Promise.resolve(84) : Promise.reject(new Error('foo-bar')))(),
                { id: 0 }
              );

              const q = ctx.platform.domWriteQueue;
              await q.yield();
              assert.html.innerEqual(ctx.host, wrap('pending0', 'p'), 'pending0');
              ctx.assertCallSet([...getDeactivationSequenceFor(`${fhost}-1`), ...getActivationSequenceFor(`${phost}-1`)], `calls mismatch1`);
              ctx.clear();

              try {
                await promise;
              } catch {
                // ignore rejection
              }

              // run the post-settled task
              q.flush();
              promise = app.promise = Object.assign(
                createMultiTickPromise(20, () => $resolve ? Promise.resolve(4242) : Promise.reject(new Error('foo-bar foo-bar')))(),
                { id: 1 }
              );

              await q.yield();
              if ($resolve) {
                assert.html.innerEqual(ctx.host, wrap('resolved with 84', 'f'), 'fulfilled 1');
              } else {
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar', 'r'), 'rejected 1');
              }
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)], `calls mismatch2`);
              ctx.clear();

              await q.yield();
              assert.html.innerEqual(ctx.host, wrap('pending1', 'p'), 'pending1');
              ctx.assertCallSet([...getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`), ...getActivationSequenceFor(`${phost}-1`)], `calls mismatch3`);
              ctx.clear();

              try {
                await promise;
              } catch {
                // ignore rejection
              }
              await q.yield();

              if ($resolve) {
                assert.html.innerEqual(ctx.host, wrap('resolved with 4242', 'f'), 'fulfilled 2');
              } else {
                assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected 2');
              }
              ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)], `calls mismatch4`);
            },
          );
        }
        // #endregion
      }
    }
  }
  for (const data of getTestData()) {
    (data.only ? $it.only : $it)(data.name,
      async function (ctx) {

        await ctx.platform.domWriteQueue.yield();
        assert.strictEqual(ctx.error, null);
        if (data.expectedInnerHtml !== null) {
          assert.html.innerEqual(ctx.host, data.expectedInnerHtml, 'innerHTML');
        }

        if (data.expectedStartLog !== null) {
          ctx.assertCallSet(data.expectedStartLog, 'start lifecycle calls');
        }

        const additionalAssertions = data.additionalAssertions;
        if (additionalAssertions !== null) {
          await additionalAssertions(ctx);
        }
      },
      data);
  }

  // TODO negative test data
});

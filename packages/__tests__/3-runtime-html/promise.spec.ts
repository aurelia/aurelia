/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
  ConsoleSink,
  optional,
  Task,
  TaskStatus,
  resolveAll,
} from '@aurelia/kernel';
import {
  bindingBehavior,
  BindingBehaviorInstance,
  Case,
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
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext,
} from '@aurelia/testing';
import {
  createSpecFunction,
  TestExecutionContext,
  TestFunction,
} from '../util.js';

describe.only('promise template-controller', function () {

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
      this.log.push(`${event.scope.join('.')}.${event.message}`);
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
  }
  class PromiseTestExecutionContext implements TestExecutionContext<any> {
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
      this._log = (container.get(ILogger)['debugSinks'] as ISink[]).find((s) => s instanceof DebugLog) as DebugLog;
    }
    public get platform(): IPlatform { return this._scheduler ?? (this._scheduler = this.container.get(IPlatform)); }
    public get log() {
      return this._log?.log ?? [];
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
      this._log?.clear();
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
      assert.strictEqual(actual.length, expected.length, `${message} - calls.length - ${actual}`);
      assert.strictEqual(actual.filter((c) => !expected.includes(c)).length, 0, `${message} - calls set equality - ${actual}`);
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

  const seedPromise = DI.createInterface<Promise<unknown>>();
  async function testPromise(
    testFunction: TestFunction<PromiseTestExecutionContext>,
    {
      template,
      registrations = [],
      expectedStopLog,
      verifyStopCallsAsSet = false,
      promise,
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
          // NoopBindingBehavior,
          typeof promise === 'function'
            ? Registration.callback(seedPromise, promise)
            : Registration.instance(seedPromise, promise),
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
        return Object.assign(resolve ? Promise.resolve(value) : Promise.reject(new Error('foo-bar')), { id: 0 });
      }

      return Object.assign(
        createMultiTickPromise(ticks, () => resolve ? Promise.resolve(value) : Promise.reject(new Error('foo-bar')))(),
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

  // @bindingBehavior('noop')
  // class NoopBindingBehavior implements BindingBehaviorInstance {
  //   public bind(_flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, _binding: IBinding): void {
  //     return;
  //   }
  //   public unbind(_flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, _binding: IBinding): void {
  //     return;
  //   }
  // }

  class App {
    public constructor(
      @seedPromise public promise: PromiseWithId,
    ) { }
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
    public constructor(
      name: string,
      public promise: Promise<unknown> | (() => Promise<unknown>) | null,
      {
        registrations = [],
        template,
        verifyStopCallsAsSet = false,
      }: Partial<TestSetupContext>,
      public readonly config: Config | null = null,
      public readonly expectedInnerHtml: string = '',
      public readonly expectedStartLog: (string | number)[],
      public readonly expectedStopLog: string[],
      public readonly additionalAssertions: ((ctx: PromiseTestExecutionContext) => Promise<void> | void) | null = null,
      public readonly only: boolean = false,
    ) {
      this.name = config !== null ? `${name} - ${config.toString()}` : name;
      this.registrations = [
        ...(config !== null ? [Registration.instance(Config, config)] : []),
        createComponentType(phost, `pending\${p.id}`, ['p']),
        createComponentType(fhost, `resolved with \${data}`, ['data']),
        createComponentType(rhost, `rejected with \${err.message}`, ['err']),
        ...registrations,
      ];
      this.template = template;
      this.verifyStopCallsAsSet = verifyStopCallsAsSet;
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
    const template1 = `
    <template>
      <template promise.bind="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
        <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
    for (const config of configFactories) {
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'shows content as per promise status #1 - fulfilled',
          Object.assign(new Promise((r) => resolve = r), { id: 0 }),
          { template: template1 },
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
          { template: template1 },
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
        { template: template1 },
        config(),
        wrap('resolved with 42', 'f'),
        getActivationSequenceFor(`${fhost}-1`),
        getDeactivationSequenceFor(`${fhost}-1`),
      );
      yield new TestData(
        'shows content for rejected promise',
        Promise.reject(new Error('foo-bar')),
        { template: template1 },
        config(),
        wrap('rejected with foo-bar', 'r'),
        getActivationSequenceFor(`${rhost}-1`),
        getDeactivationSequenceFor(`${rhost}-1`),
      );
      yield new TestData(
        'reacts to change in promise value - fulfilled -> fulfilled',
        Promise.resolve(42),
        { template: template1 },
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
        { template: template1 },
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
        { template: template1 },
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
        { template: template1 },
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
        Promise.reject(new Error('foo-bar')),
        { template: template1 },
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
        Promise.reject(new Error('foo-bar')),
        { template: template1 },
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
        Promise.reject(new Error('foo-bar')),
        { template: template1 },
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
        Promise.reject(new Error('foo-bar')),
        { template: template1 },
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
        { template: template1 },
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
        { template: template1 },
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
        { template: template1 },
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
        { template: template1 },
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
        { template: template1 },
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
        { template: `<template><template promise.bind="promise">this is shown always</template></template>` },
        config(),
        'this is shown always',
        [],
        [],
      );
      const pTemplt =
        `<template>
        <template promise.bind="promise">
          <pending-host pending p.bind="promise"></pending-host>
        </template>
      </template>`;
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'supports combination: promise>pending - resolved',
          Object.assign(new Promise((r) => resolve = r), { id: 0 }),
          { template: pTemplt },
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
          { template: pTemplt },
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
        <template promise.bind="promise">
          <pending-host pending p.bind="promise"></pending-host>
          <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
        </template>
      </template>`;
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'supports combination: promise>(pending+then) - resolved',
          Object.assign(new Promise((r) => resolve = r), { id: 0 }),
          { template: pfCombTemplt },
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
          { template: pfCombTemplt },
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
        <template promise.bind="promise">
          <pending-host pending p.bind="promise"></pending-host>
          <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
        </template>
      </template>`;
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'supports combination: promise>(pending+catch) - resolved',
          Object.assign(new Promise((r) => resolve = r), { id: 0 }),
          { template: prCombTemplt },
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
          { template: prCombTemplt },
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
      <template promise.bind="promise">
        <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
      </template>
    </template>`;
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'supports combination: promise>then - resolved',
          Object.assign(new Promise((r) => resolve = r), { id: 0 }),
          { template: fTemplt },
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
          { template: fTemplt },
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
      <template promise.bind="promise">
        <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'supports combination: promise>catch - resolved',
          new Promise((r) => resolve = r),
          { template: rTemplt },
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
          { template: rTemplt },
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
      <template promise.bind="promise">
        <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
        <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
      {
        let resolve: (value: unknown) => void;
        yield new TestData(
          'supports combination: promise>then+catch - resolved',
          new Promise((r) => resolve = r),
          { template: frTemplt },
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
          { template: frTemplt },
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

      const template2 = `
    <template>
      <template promise.bind="promise">
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
            template: template2,
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
            template: template2,
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
          template: `
            <template>
              <template promise.bind="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <template then.from-view="response" promise.bind="response.json()">
                  <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
                </template>
                <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
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
          template: `
            <template>
              <template promise.bind="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <template then.from-view="response" promise.bind="response.json()">
                  <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
                  <rejected-host catch.from-view="err" err.bind="updateError(err)"></rejected-host>
                </template>
                <rejected-host catch.from-view="err1" err.bind="err1"></rejected-host>
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
        Promise.reject({ json() { return Promise.resolve(42); } }),
        {
          template: `
            <template>
              <template promise.bind="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host then.from-view="data1" data.bind="data1"></fulfilled-host>
                <template catch.from-view="response" promise.bind="response.json()">
                  <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
                  <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
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
        Promise.reject({ json() { return Promise.reject(new Error('foo-bar')); } }),
        {
          template: `
            <template>
              <template promise.bind="promise">
                <pending-host pending p.bind="promise"></pending-host>
                <fulfilled-host then.from-view="data1" data.bind="data1"></fulfilled-host>
                <template catch.from-view="response" promise.bind="response.json()">
                  <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
                  <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
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
          `works with value converter on - settled promise - ${$resolve}`,
          null,
          {
            template: `
            <template>
              <template promise.bind="42|promisify:${$resolve}">
                <pending-host pending></pending-host>
                <fulfilled-host then.from-view="data | double" data.bind="data"></fulfilled-host>
                <rejected-host catch.from-view="err | double" err.bind="err"></rejected-host>
              </template>
            </template>`
          },
          config(),
          $resolve ? wrap('resolved with 42 42', 'f') : wrap('rejected with foo-bar foo-bar', 'r'),
          getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
          getDeactivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`),
        );

        yield new TestData(
          `works with value converter - longer running promise - ${$resolve}`,
          null,
          {
            template: `
            <template>
              <template promise.bind="42|promisify:${$resolve}:10">
                <pending-host pending></pending-host>
                <fulfilled-host then.from-view="data | double" data.bind="data"></fulfilled-host>
                <rejected-host catch.from-view="err | double" err.bind="err"></rejected-host>
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
              assert.html.innerEqual(ctx.host, wrap('rejected with foo-bar foo-bar', 'r'), 'rejected');
            }
            ctx.assertCallSet([...getDeactivationSequenceFor(`${phost}-1`), ...getActivationSequenceFor($resolve ? `${fhost}-1` : `${rhost}-1`)]);
          },
        );
      }
      // TODO repeater
    }
    // #region timings
    for (const $resolve of [true, false]) {
      const getPromise = (ticks: number) => () => Object.assign(
        createMultiTickPromise(ticks, () => $resolve ? Promise.resolve(42) : Promise.reject(new Error('foo-bar')))(),
        { id: 0 }
      );
      yield new TestData(
        `pending activation duration < promise settlement duration - ${$resolve ? 'fulfilled' : 'rejected'}`,
        getPromise(6),
        {
          template: template1,
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
        ['pending activation duration == promise settlement duration',                                                          4, { binding: 1, bound: 1, attaching: 1, attached: 1 }],
        ['pending "binding" duration == promise settlement duration',                                                           2, { binding: 2 }],
        ['pending "binding" duration > promise settlement duration',                                                            1, { binding: 2 }],
        ['pending "binding" duration > promise settlement duration (longer running promise and hook)',                          4, { binding: 6 }],
        ['pending "binding+bound" duration > promise settlement duration',                                                      2, { binding: 1, bound: 2 }],
        ['pending "binding+bound" duration > promise settlement duration (longer running promise and hook)',                    4, { binding: 3, bound: 3 }],
        ['pending "binding+bound+attaching" duration > promise settlement duration',                                            2, { binding: 1, bound: 1, attaching: 1 }],
        ['pending "binding+bound+attaching" duration > promise settlement duration (longer running promise and hook)',          5, { binding: 2, bound: 2, attaching: 2 }],
        ['pending "binding+bound+attaching+attached" duration > promise settlement duration',                                   3, { binding: 1, bound: 1, attaching: 1, attached: 1 }],
        ['pending "binding+bound+attaching+attached" duration > promise settlement duration (longer running promise and hook)', 6, { binding: 2, bound: 2, attaching: 2, attached: 2 }],
      ] as const) {
        yield new TestData(
          `${name} - ${$resolve ? 'fulfilled' : 'rejected'}`,
          getPromise(promiseTick),
          {
            template: template1,
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
          template: template1,
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
          template: template1,
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
          template: template1,
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
          template: template1,
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

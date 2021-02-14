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
      public wait: (name: string) => Promise<void>,
    ) { }

    public toString(): string {
      return `{${this.hasPromise ? this.wait.toString() : 'noWait'}}`;
    }
  }

  let nameIdMap: Map<string, number>;
  function createComponentType(name: string, template: string = '', bindables: string[] = []) {
    @customElement({ name, template, bindables, isStrictBinding: true })
    class Component {
      private readonly logger: ILogger;
      public constructor(
        private readonly config: Config,
        @ILogger logger: ILogger,
      ) {
        let id = nameIdMap.get(name) ?? 1;
        this.logger = logger.scopeTo(`${name}-${id}`);
        nameIdMap.set(name, ++id);
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
    promise: Promise<unknown>;
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
          NoopBindingBehavior,
          Registration.instance(seedPromise, promise),
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
    public constructor(
      @seedPromise public promise: PromiseWithId,
    ) { }
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
      public promise: Promise<unknown>,
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
      this.name = `${name} - ${config.toString()}`;
      this.registrations = [
        Registration.instance(Config, config),
        createComponentType(phost, `pending\${p.id}`, ['p']),
        createComponentType(fhost, `resolved with \${data}`, ['data']),
        createComponentType(rhost, `rejected with \${err.message}`, ['err']),
        ...registrations,
      ];
      this.template = template;
      this.verifyStopCallsAsSet = verifyStopCallsAsSet;
    }
  }

  function createWaiter(ms: number | Record<string, number>): (name: string) => Promise<void> {
    function wait(name: string): Promise<void> {
      const waitMs = typeof ms === 'number' ? ms : ms[name];
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve();
        }, waitMs);
      });
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

    for (const config of configFactories) {

      const template1 = `
    <template>
      <template promise.bind="promise">
        <pending-host pending p.bind="promise"></pending-host>
        <fulfilled-host then.from-view="data" data.bind="data"></fulfilled-host>
        <rejected-host catch.from-view="err" err.bind="err"></rejected-host>
      </template>
    </template>`;
      {
        let resolve: (value: unknown) => void;
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        promise.id = 0;
        yield new TestData(
          'shows content as per promise status - fulfilled',
          promise,
          {
            template: template1,
          },
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        promise.id = 0;
        yield new TestData(
          'shows content as per promise status - rejected',
          promise,
          {
            template: template1,
          },
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
      {
        let promise: PromiseWithId = new Promise(() => {/* noop */ });
        promise.id = 0;
        yield new TestData(
          'reacts to change in promise value - pending -> pending',
          promise,
          { template: template1 },
          config(),
          wrap('pending0', 'p'),
          getActivationSequenceFor(`${phost}-1`),
          getDeactivationSequenceFor(`${phost}-1`),
          async (ctx) => {
            ctx.clear();
            const p = ctx.platform;
            promise = new Promise(() => {/* noop */ });
            promise.id = 1;
            ctx.app.promise = promise;
            await p.domWriteQueue.yield();

            assert.html.innerEqual(ctx.host, wrap('pending1', 'p'));
            ctx.assertCallSet([]);
          }
        );
      }
      {
        const promise: PromiseWithId = new Promise(() => {/* noop */ });
        promise.id = 0;
        yield new TestData(
          'reacts to change in promise value - pending -> fulfilled',
          promise,
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
      }
      {
        const promise: PromiseWithId = new Promise(() => {/* noop */ });
        promise.id = 0;
        yield new TestData(
          'reacts to change in promise value - pending -> rejected',
          promise,
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
      }
      {
        let promise: PromiseWithId = new Promise(() => {/* noop */ });
        promise.id = 0;
        yield new TestData(
          'reacts to change in promise value - pending -> (pending -> fulfilled)',
          promise,
          { template: template1 },
          config(),
          wrap('pending0', 'p'),
          getActivationSequenceFor(`${phost}-1`),
          getDeactivationSequenceFor(`${fhost}-1`),
          async (ctx) => {
            ctx.clear();
            const p = ctx.platform;
            let resolve: (value: unknown) => void;
            promise = new Promise((r) => resolve = r);
            promise.id = 1;
            ctx.app.promise = promise;
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
      }
      {
        let promise: PromiseWithId = new Promise(() => {/* noop */ });
        promise.id = 0;
        yield new TestData(
          'reacts to change in promise value - pending -> (pending -> rejected)',
          promise,
          { template: template1 },
          config(),
          wrap('pending0', 'p'),
          getActivationSequenceFor(`${phost}-1`),
          getDeactivationSequenceFor(`${rhost}-1`),
          async (ctx) => {
            ctx.clear();
            const p = ctx.platform;
            let reject: (value: unknown) => void;
            promise = new Promise((_, r) => reject = r);
            promise.id = 1;
            ctx.app.promise = promise;
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
      }
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
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>pending - resolved',
          promise,
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>pending - rejected',
          promise,
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
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>(pending+then) - resolved',
          promise,
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>(pending+then) - rejected',
          promise,
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
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>(pending+catch) - resolved',
          promise,
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>(pending+catch) - rejected',
          promise,
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
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>then - resolved',
          promise,
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        promise.id = 0;
        yield new TestData(
          'supports combination: promise>then - rejected',
          promise,
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
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        yield new TestData(
          'supports combination: promise>catch - resolved',
          promise,
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        yield new TestData(
          'supports combination: promise>catch - rejected',
          promise,
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
        const promise: PromiseWithId = new Promise((r) => resolve = r);
        yield new TestData(
          'supports combination: promise>then+catch - resolved',
          promise,
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
        const promise: PromiseWithId = new Promise((_, r) => reject = r);
        yield new TestData(
          'supports combination: promise>then+catch - rejected',
          promise,
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
    }
  }

  for (const data of getTestData()) {
    (data.only ? $it.only : $it)(data.name,
      async function (ctx) {

        await ctx.platform.domWriteQueue.yield();
        assert.strictEqual(ctx.error, null);
        assert.html.innerEqual(ctx.host, data.expectedInnerHtml, 'innerHTML');

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

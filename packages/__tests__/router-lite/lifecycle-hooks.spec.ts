import { DefaultLogEvent, DefaultLogger, DI, IContainer, ILogger, ISink, LogLevel, Registration } from '@aurelia/kernel';
import { IRouter, IRouteViewModel, IViewportInstruction, NavigationInstruction, Params, route, RouteNode, RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, customElement, ILifecycleHooks, lifecycleHooks, StandardConfiguration } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';

/**
 * Roughly the followings aspects are tested here:
 * - The invocation of the routing hooks, both instance and the global lifecycle hooks.
 * - The order of invocation.
 * - The preemption in the hooks (hooks returning `false`).
 * - The conflicting navigation instructions etc. (`hook1` redirects to `r1` where as the `hook2` redirects to `r2`).
 * - {Add new test aspects here if it is not already covered above.}
 *
 * Note that an extensive tests of the hooks are already done in the `hook-tests.spec.ts`.
 * However, that misses the `@lifeCycleHooks`. Hence, this spec focuses on that.
 */
describe('lifecycle hooks', function () {
  const IKnownScopes = DI.createInterface<string[]>();
  class EventLog implements ISink {
    public readonly log: string[] = [];
    public constructor(@IKnownScopes private readonly scopes: string[]) { }
    public handleEvent(event: DefaultLogEvent): void {
      if (!event.scope.some(x => this.scopes.includes(x))) return;
      this.log.push(event.toString());
    }
    public clear() {
      this.log.length = 0;
    }

    public assertLog(messagePatterns: RegExp[], message: string) {
      const log = this.log;
      const len = messagePatterns.length;
      for (let i = 0; i < len; i++) {
        assert.match(log[i], messagePatterns[i], `${message} - unexpected log at index${i}; actual log: ${JSON.stringify(log, undefined, 2)}`);
      }
    }

    public assertLogOrderInvariant(messagePatterns: RegExp[], offset: number, message: string) {
      const log = this.log;
      const len = messagePatterns.length;
      for (let i = offset; i < len; i++) {
        const item = log[i];
        assert.notEqual(
          messagePatterns.find(pattern => pattern.test(item)),
          undefined,
          `${message} - unexpected log at index${i}: ${item}; actual log: ${JSON.stringify(log, undefined, 2)}`
        );
      }
    }

    public static getInstance(container: IContainer): EventLog {
      const logger = container.get<DefaultLogger>(ILogger);
      const eventLog = (logger['traceSinks'] as ISink[]).find(x => x instanceof this);
      if (eventLog === undefined) throw new Error('Event log is not found');
      return eventLog as EventLog;
    }
  }

  async function createFixture(rootComponent: unknown, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      StandardConfiguration,
      TestRouterConfiguration.for(
        LogLevel.trace,
        [
          EventLog
          // uncomment the following line to see the logs in console - debug
          /* , ConsoleSink */
        ]),
      RouterConfiguration,
      ...registrations
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: rootComponent, host }).start();
    return { au, container, host };
  }

  async function log(hookName: string, rn: RouteNode, waitMs: number | null, logger: ILogger): Promise<void> {
    const component = (rn.instruction as IViewportInstruction).component;
    logger.trace(`${hookName} - start ${component}`);
    if (waitMs === null) {
      await Promise.resolve();
    } else {
      await new Promise(res => setTimeout(res, waitMs));
    }
    logger.trace(`${hookName} - end ${component}`);
  }

  type Hooks = 'canLoad' | 'load' | 'canUnload' | 'unload';

  abstract class AsyncBaseHook implements ILifecycleHooks<IRouteViewModel, Hooks> {
    public get waitMs(): Record<Hooks, number> | number | null { return null; }
    protected getWaitTime(hook: Hooks): number | null {
      const val = this.waitMs;
      if (val === null) return null;
      if (typeof val === 'number') return val;
      return val[hook] ?? null;
    }
    public constructor(
      @ILogger protected readonly logger: ILogger,
    ) {
      this.logger = logger.scopeTo(this.constructor.name);
    }
    public async canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean> {
      await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
      return true;
    }
    public async load(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<void> {
      await log('load', next, this.getWaitTime('load'), this.logger);
    }
    public async canUnload(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): Promise<boolean> {
      await log('canUnload', current ?? rn, this.getWaitTime('canUnload'), this.logger);
      return true;
    }
    public async unload(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): Promise<void> {
      await log('unload', current ?? rn, this.getWaitTime('unload'), this.logger);
    }
  }

  function createHookTimingConfiguration(option: Partial<Record<Hooks, number>> = {}) {
    return { canLoad: 1, load: 1, canUnload: 1, unload: 1, ...option };
  }

  // the simplified textbook example of authorization hook
  it('single global (auth) hook', async function () {

    interface IAuthenticationService extends AuthenticationService { }
    const IAuthenticationService = DI.createInterface<IAuthenticationService>('IAuthenticationService', x => x.singleton(AuthenticationService));
    class AuthenticationService {
      public hasClaim(type: string, value: string): boolean {
        return type === 'read' && value === 'foo';
      }
    }

    @lifecycleHooks()
    class AuthorizationHook implements ILifecycleHooks<IRouteViewModel, 'canLoad'> {
      public constructor(
        @IAuthenticationService private readonly authService: IAuthenticationService,
        @ILogger private readonly logger: ILogger,
      ) {
        this.logger = logger.scopeTo('AuthHook');
      }

      public canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
        this.logger.trace(`canLoad ${(next.instruction as IViewportInstruction).component}`);
        const claim = (next.data as { claim: { type: string; value: string } }).claim ?? null;
        if (claim === null) return true;
        return this.authService.hasClaim(claim.type, claim.value)
          ? true
          : 'forbidden';
      }
    }

    @customElement({ name: 'for-bidden', template: 'You shall not pass!' })
    class Forbidden { }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home { }

    @customElement({ name: 'foo-list', template: 'foo list' })
    class FooList { }

    @customElement({ name: 'foo-edit', template: 'foo edit' })
    class FooEdit { }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: FooList, data: { claim: { type: 'read', value: 'foo' } } },
        { path: 'foo/:id', component: FooEdit, data: { claim: { type: 'edit', value: 'foo' } } },
        { path: 'forbidden', component: Forbidden }
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Home,
      Forbidden,
      FooList,
      FooEdit,
      IAuthenticationService,
      AuthorizationHook,
      Registration.instance(IKnownScopes, ['AuthHook'])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([/AuthHook\] canLoad ''/], 'init');

    // round 2
    eventLog.clear();
    assert.strictEqual(await router.load('foo/404'), true);
    assert.html.textContent(host, 'You shall not pass!');
    eventLog.assertLog([/AuthHook\] canLoad 'foo\/404'/, /AuthHook\] canLoad 'forbidden'/], 'round#2');

    // round 3
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo list');
    eventLog.assertLog([/AuthHook\] canLoad 'foo'/], 'round#3');

    await au.stop();
  });

  it('multiple synchronous hooks - without preemption', async function () {
    abstract class BaseHook implements ILifecycleHooks<IRouteViewModel, 'canLoad' | 'load' | 'canUnload' | 'unload'> {
      public constructor(
        @ILogger private readonly logger: ILogger,
      ) {
        this.logger = logger.scopeTo(this.constructor.name);
      }
      public canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
        this.logger.trace(`canLoad ${(next.instruction as IViewportInstruction).component}`);
        return true;
      }
      public load(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.logger.trace(`load ${(next.instruction as IViewportInstruction).component}`);
      }
      public canUnload(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): boolean | Promise<boolean> {
        this.logger.trace(`canUnload ${((current ?? rn).instruction as IViewportInstruction).component}`);
        return true;
      }
      public unload(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): void | Promise<void> {
        this.logger.trace(`unload ${((current ?? rn).instruction as IViewportInstruction).component}`);
      }
    }
    @lifecycleHooks()
    class Hook1 extends BaseHook { }
    @lifecycleHooks()
    class Hook2 extends BaseHook { }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends BaseHook { }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends BaseHook { }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Home,
      Hook1,
      Hook2,
      Home,
      Foo,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad ''/,
      /Hook2\] canLoad ''/,
      /Home\] canLoad ''/,
      /Hook1\] load ''/,
      /Hook2\] load ''/,
      /Home\] load ''/,
    ], 'init');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload ''/,
      /Hook2\] canUnload ''/,
      /Home\] canUnload ''/,
      /Hook1\] canLoad 'foo'/,
      /Hook2\] canLoad 'foo'/,
      /Foo\] canLoad 'foo'/,
      /Hook1\] unload ''/,
      /Hook2\] unload ''/,
      /Home\] unload ''/,
      /Hook1\] load 'foo'/,
      /Hook2\] load 'foo'/,
      /Foo\] load 'foo'/,
    ], 'round#2');

    await au.stop();
  });

  it('multiple asynchronous hooks - same timing - without preemption', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseHook { }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseHook { }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Home,
      Hook1,
      Hook2,
      Home,
      Foo,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start ''/,
      /Hook1\] canLoad - end ''/,
      /Hook2\] canLoad - start ''/,
      /Hook2\] canLoad - end ''/,
      /Home\] canLoad - start ''/,
      /Home\] canLoad - end ''/,

      /Hook1\] load - start ''/,
      /Hook2\] load - start ''/,
      /Home\] load - start ''/,
      /Hook1\] load - end ''/,
      /Hook2\] load - end ''/,
      /Home\] load - end ''/,
    ], 'init');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload - start ''/,
      /Hook1\] canUnload - end ''/,
      /Hook2\] canUnload - start ''/,
      /Hook2\] canUnload - end ''/,
      /Home\] canUnload - start ''/,
      /Home\] canUnload - end ''/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
      /Foo\] canLoad - start 'foo'/,
      /Foo\] canLoad - end 'foo'/,

      /Hook1\] unload - start ''/,
      /Hook2\] unload - start ''/,
      /Home\] unload - start ''/,
      /Hook1\] unload - end ''/,
      /Hook2\] unload - end ''/,
      /Home\] unload - end ''/,

      /Hook1\] load - start 'foo'/,
      /Hook2\] load - start 'foo'/,
      /Foo\] load - start 'foo'/,
      /Hook1\] load - end 'foo'/,
      /Hook2\] load - end 'foo'/,
      /Foo\] load - end 'foo'/,
    ], 'round#2');

    await au.stop();
  });

  it('multiple asynchronous hooks - varied timing monotonically increasing - without preemption', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 2; } }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseHook { public get waitMs(): number { return 3; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseHook { public get waitMs(): number { return 3; } }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Home,
      Hook1,
      Hook2,
      Home,
      Foo,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start ''/,
      /Hook1\] canLoad - end ''/,
      /Hook2\] canLoad - start ''/,
      /Hook2\] canLoad - end ''/,
      /Home\] canLoad - start ''/,
      /Home\] canLoad - end ''/,

      /Hook1\] load - start ''/,
      /Hook2\] load - start ''/,
      /Home\] load - start ''/,
      /Hook1\] load - end ''/,
      /Hook2\] load - end ''/,
      /Home\] load - end ''/,
    ], 'init');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload - start ''/,
      /Hook1\] canUnload - end ''/,
      /Hook2\] canUnload - start ''/,
      /Hook2\] canUnload - end ''/,
      /Home\] canUnload - start ''/,
      /Home\] canUnload - end ''/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
      /Foo\] canLoad - start 'foo'/,
      /Foo\] canLoad - end 'foo'/,

      /Hook1\] unload - start ''/,
      /Hook2\] unload - start ''/,
      /Home\] unload - start ''/,
      /Hook1\] unload - end ''/,
      /Hook2\] unload - end ''/,
      /Home\] unload - end ''/,

      /Hook1\] load - start 'foo'/,
      /Hook2\] load - start 'foo'/,
      /Foo\] load - start 'foo'/,
      /Hook1\] load - end 'foo'/,
      /Hook2\] load - end 'foo'/,
      /Foo\] load - end 'foo'/,
    ], 'round#2');

    await au.stop();
  });

  it('multiple asynchronous hooks - varied timing monotonically decreasing - without preemption', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 3; } }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 2; } }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Home,
      Hook1,
      Hook2,
      Home,
      Foo,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start ''/,
      /Hook1\] canLoad - end ''/,
      /Hook2\] canLoad - start ''/,
      /Hook2\] canLoad - end ''/,
      /Home\] canLoad - start ''/,
      /Home\] canLoad - end ''/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] load - start ''/,
      /Hook2\] load - start ''/,
      /Home\] load - start ''/,
      /Home\] load - end ''/,
      /Hook2\] load - end ''/,
      /Hook1\] load - end ''/,
    ], 6, 'init - unload');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload - start ''/,
      /Hook1\] canUnload - end ''/,
      /Hook2\] canUnload - start ''/,
      /Hook2\] canUnload - end ''/,
      /Home\] canUnload - start ''/,
      /Home\] canUnload - end ''/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
      /Foo\] canLoad - start 'foo'/,
      /Foo\] canLoad - end 'foo'/,
    ], 'round#2');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unload - start ''/,
      /Hook2\] unload - start ''/,
      /Home\] unload - start ''/,
      /Home\] unload - end ''/,
      /Hook2\] unload - end ''/,
      /Hook1\] unload - end ''/,
    ], 12, 'round#2 - unload');
    eventLog.assertLogOrderInvariant([
      /Hook1\] load - start 'foo'/,
      /Hook2\] load - start 'foo'/,
      /Foo\] load - start 'foo'/,
      /Foo\] load - end 'foo'/,
      /Hook2\] load - end 'foo'/,
      /Hook1\] load - end 'foo'/,
    ], 18, 'round#2 - load');

    await au.stop();
  });

  it('multiple asynchronous hooks - first hook - canLoad preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        const component = (next.instruction as IViewportInstruction).component;
        const ret = component.toString() !== '\'foo\'';
        return ret;
      }
    }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Home,
      Hook1,
      Hook2,
      Home,
      Foo,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start ''/,
      /Hook1\] canLoad - end ''/,
      /Hook2\] canLoad - start ''/,
      /Hook2\] canLoad - end ''/,
      /Home\] canLoad - start ''/,
      /Home\] canLoad - end ''/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] load - start ''/,
      /Hook2\] load - start ''/,
      /Home\] load - start ''/,
      /Home\] load - end ''/,
      /Hook2\] load - end ''/,
      /Hook1\] load - end ''/,
    ], 6, 'init - unload');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), false);
    eventLog.assertLog([
      /Hook1\] canUnload - start ''/,
      /Hook1\] canUnload - end ''/,
      /Hook2\] canUnload - start ''/,
      /Hook2\] canUnload - end ''/,
      /Home\] canUnload - start ''/,
      /Home\] canUnload - end ''/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
    ], 'round#2');
    eventLog.assertLogOrderInvariant([], 8, 'round#2 - no-residue');
    await au.stop();
  });

  // #region some migrated tests from hook-tests.specs.ts, as the tests were sometimes overly complicated, and accounting for every ticks might be bit too much
  function* getHookTestData() {
    function assert1(eventLog: EventLog) {
      eventLog.assertLog([
        /A1\] canLoad - start 'a1'/,
        /B1\] canLoad - start 'b1'/,
        /B1\] canLoad - end 'b1'/,
        /A1\] canLoad - end 'a1'/,
        /A1\] load - start 'a1'/,
        /B1\] load - start 'b1'/,
        /A1\] load - end 'a1'/,
        /B1\] load - end 'b1'/,
      ], 'load');
      eventLog.assertLogOrderInvariant([
        /A2\] canLoad - start 'a2'/,
        /B2\] canLoad - start 'b2'/,
        /B2\] canLoad - end 'b2'/,
        /A2\] canLoad - end 'a2'/,
        /A2\] load - start 'a2'/,
        /B2\] load - start 'b2'/,
        /A2\] load - end 'a2'/,
        /B2\] load - end 'b2'/,
      ], 8, 'load part2');
    }
    yield {
      name: 'a1(canLoad:4)/a2+b1/b2',
      a1: createHookTimingConfiguration({ canLoad: 4 }),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration(),
      b2: createHookTimingConfiguration(),
      assert: assert1,
    };

    yield {
      name: 'a1(canLoad:8)/a2+b1/b2',
      a1: createHookTimingConfiguration({ canLoad: 8 }),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration(),
      b2: createHookTimingConfiguration(),
      assert: assert1,
    };

    function assert2(eventLog: EventLog) {
      eventLog.assertLog([
        /A1\] canLoad - start 'a1'/,
        /B1\] canLoad - start 'b1'/,
        /A1\] canLoad - end 'a1'/,
        /B1\] canLoad - end 'b1'/,
        /A1\] load - start 'a1'/,
        /B1\] load - start 'b1'/,
        /A1\] load - end 'a1'/,
        /B1\] load - end 'b1'/,
      ], 'load');
      eventLog.assertLogOrderInvariant([
        /A2\] canLoad - start 'a2'/,
        /B2\] canLoad - start 'b2'/,
        /B2\] canLoad - end 'b2'/,
        /A2\] canLoad - end 'a2'/,
        /A2\] load - start 'a2'/,
        /B2\] load - start 'b2'/,
        /A2\] load - end 'a2'/,
        /B2\] load - end 'b2'/,
      ], 8, 'load part2');
    }
    yield {
      name: 'a1/a2+b1(canLoad:2)/b2',
      a1: createHookTimingConfiguration(),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration({ canLoad: 2 }),
      b2: createHookTimingConfiguration(),
      assert: assert2,
    };
    yield {
      name: 'a1/a2+b1(canLoad:4)/b2',
      a1: createHookTimingConfiguration(),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration({ canLoad: 4 }),
      b2: createHookTimingConfiguration(),
      assert: assert2,
    };
    yield {
      name: 'a1/a2+b1(canLoad:8)/b2',
      a1: createHookTimingConfiguration(),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration({ canLoad: 8 }),
      b2: createHookTimingConfiguration(),
      assert: assert2,
    };
  }
  for (const { name, a1, a2, b1, b2, assert } of getHookTestData()) {
    it(`hook of one of the component takes significantly more time than others - no preemption - ${name}`, async function () {
      @customElement({ name: 'a2', template: null })
      class A2 extends AsyncBaseHook { public get waitMs(): Record<Hooks, number> { return a2; } }

      @route({ routes: [{ path: 'a2', component: A2 }] })
      @customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })
      class A1 extends AsyncBaseHook { public get waitMs(): Record<Hooks, number> { return a1; } }

      @customElement({ name: 'b2', template: null })
      class B2 extends AsyncBaseHook { public get waitMs(): Record<Hooks, number> { return b2; } }

      @route({ routes: [{ path: 'b2', component: B2 }] })
      @customElement({ name: 'b1', template: '<au-viewport></au-viewport>' })
      class B1 extends AsyncBaseHook { public get waitMs(): Record<Hooks, number> { return b1; } }

      @route({
        routes: [
          { path: 'a1', component: A1 },
          { path: 'b1', component: B1 },
        ]
      })
      @customElement({ name: 'root', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })
      class Root { }

      const { au, container } = await createFixture(Root,
        A1,
        A2,
        B1,
        B2,
        Registration.instance(IKnownScopes, [A1.name, A2.name, B1.name, B2.name])
      );
      const router = container.get(IRouter);
      const eventLog = EventLog.getInstance(container);
      eventLog.assertLog([], 'init');

      await router.load('a1@$0/a2+b1@$1/b2');

      assert(eventLog);

      await au.stop();
    });
  }
  // #endregion
});

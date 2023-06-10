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

import {
  Class,
  /* ConsoleSink, */
  DefaultLogEvent,
  DI,
  IContainer,
  ILogger,
  ISink,
  LogLevel,
  Registration,
} from '@aurelia/kernel';
import { IRouter, IRouteViewModel, IViewportInstruction, NavigationInstruction, Params, route, RouteNode, RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, CustomElement, customElement, IHydratedController, ILifecycleHooks, lifecycleHooks, StandardConfiguration } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from './_shared/configuration.js';
import { start } from './_shared/create-fixture.js';

describe('router-lite/lifecycle-hooks.spec.ts', function () {
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
        assert.match(log[i], messagePatterns[i], `${message} - unexpected log at index${i}: ${log[i]}; actual log: ${JSON.stringify(log, undefined, 2)}`);
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
      const eventLog = container.getAll(ISink).find(x => x instanceof this);
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

  async function log(hookName: string, rn: RouteNode | string, waitMs: number | null, logger: ILogger): Promise<void> {
    const component = rn instanceof RouteNode ? (rn.instruction as IViewportInstruction).component : rn;
    logger.trace(`${hookName} - start ${component}`);
    if (waitMs === null) {
      await Promise.resolve();
    } else {
      await new Promise(res => setTimeout(res, waitMs));
    }
    logger.trace(`${hookName} - end ${component}`);
  }

  type Hooks = 'canLoad' | 'loading' | 'canUnload' | 'unloading';

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
    public async canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
      await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
      return true;
    }
    public async loading(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<void> {
      await log('loading', next, this.getWaitTime('loading'), this.logger);
    }
    public async canUnload(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): Promise<boolean> {
      await log('canUnload', current ?? rn, this.getWaitTime('canUnload'), this.logger);
      return true;
    }
    public async unloading(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): Promise<void> {
      await log('unloading', current ?? rn, this.getWaitTime('unloading'), this.logger);
    }
  }

  abstract class BaseHook implements ILifecycleHooks<IRouteViewModel, 'canLoad' | 'loading' | 'canUnload' | 'unloading'> {
    public constructor(
      @ILogger private readonly logger: ILogger,
    ) {
      this.logger = logger.scopeTo(this.constructor.name);
    }
    public canLoad(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]> {
      this.logger.trace(`canLoad ${(next.instruction as IViewportInstruction).component}`);
      return true;
    }
    public loading(_vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): void | Promise<void> {
      this.logger.trace(`loading ${(next.instruction as IViewportInstruction).component}`);
    }
    public canUnload(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): boolean | Promise<boolean> {
      this.logger.trace(`canUnload ${((current ?? rn).instruction as IViewportInstruction).component}`);
      return true;
    }
    public unloading(vm: IRouteViewModel, rn: RouteNode, current?: RouteNode): void | Promise<void> {
      this.logger.trace(`unloading ${((current ?? rn).instruction as IViewportInstruction).component}`);
    }
  }

  abstract class AsyncBaseViewModel implements IRouteViewModel {
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
    public async canLoad(_params: Params, next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
      await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
      return true;
    }
    public async loading(_params: Params, next: RouteNode, _current: RouteNode): Promise<void> {
      await log('loading', next, this.getWaitTime('loading'), this.logger);
    }
    public async canUnload(rn: RouteNode, current?: RouteNode): Promise<boolean> {
      await log('canUnload', current ?? rn, this.getWaitTime('canUnload'), this.logger);
      return true;
    }
    public async unloading(rn: RouteNode, current?: RouteNode): Promise<void> {
      await log('unloading', current ?? rn, this.getWaitTime('unloading'), this.logger);
    }
  }

  function createHookTimingConfiguration(option: Partial<Record<Hooks, number>> = {}) {
    return { canLoad: 1, loading: 1, canUnload: 1, unloading: 1, ...option };
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
    eventLog.assertLog([/AuthHook\] canLoad 'home'/], 'init');

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

    await au.stop(true);
  });

  it('multiple synchronous hooks - without preemption', async function () {
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
      /Hook1\] canLoad 'home'/,
      /Hook2\] canLoad 'home'/,
      /Home\] canLoad 'home'/,
      /Hook1\] loading 'home'/,
      /Hook2\] loading 'home'/,
      /Home\] loading 'home'/,
    ], 'init');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload 'home'/,
      /Hook2\] canUnload 'home'/,
      /Home\] canUnload 'home'/,
      /Hook1\] canLoad 'foo'/,
      /Hook2\] canLoad 'foo'/,
      /Foo\] canLoad 'foo'/,
      /Hook1\] unloading 'home'/,
      /Hook2\] unloading 'home'/,
      /Home\] unloading 'home'/,
      /Hook1\] loading 'foo'/,
      /Hook2\] loading 'foo'/,
      /Foo\] loading 'foo'/,
    ], 'round#2');

    await au.stop(true);
  });

  it('multiple asynchronous hooks - same timing - without preemption', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,

      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Hook1\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Home\] loading - end 'home'/,
    ], 'init');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
      /Foo\] canLoad - start 'foo'/,
      /Foo\] canLoad - end 'foo'/,

      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Hook1\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Home\] unloading - end 'home'/,

      /Hook1\] loading - start 'foo'/,
      /Hook2\] loading - start 'foo'/,
      /Foo\] loading - start 'foo'/,
      /Hook1\] loading - end 'foo'/,
      /Hook2\] loading - end 'foo'/,
      /Foo\] loading - end 'foo'/,
    ], 'round#2');

    await au.stop(true);
  });

  it('multiple asynchronous hooks - varied timing monotonically increasing - without preemption', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 2; } }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 3; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 3; } }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,

      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Hook1\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Home\] loading - end 'home'/,
    ], 'init');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
      /Foo\] canLoad - start 'foo'/,
      /Foo\] canLoad - end 'foo'/,

      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Hook1\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Home\] unloading - end 'home'/,

      /Hook1\] loading - start 'foo'/,
      /Hook2\] loading - start 'foo'/,
      /Foo\] loading - start 'foo'/,
      /Hook1\] loading - end 'foo'/,
      /Hook2\] loading - end 'foo'/,
      /Foo\] loading - end 'foo'/,
    ], 'round#2');

    await au.stop(true);
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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - unloading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
      /Foo\] canLoad - start 'foo'/,
      /Foo\] canLoad - end 'foo'/,
    ], 'round#2');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Home\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Hook1\] unloading - end 'home'/,
    ], 12, 'round#2 - unloading');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'foo'/,
      /Hook2\] loading - start 'foo'/,
      /Foo\] loading - start 'foo'/,
      /Foo\] loading - end 'foo'/,
      /Hook2\] loading - end 'foo'/,
      /Hook1\] loading - end 'foo'/,
    ], 18, 'round#2 - loading');

    await au.stop(true);
  });

  // #region - preemption - first preemption always wins
  it('multiple asynchronous hooks - first canLoad hook preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canLoad(vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return !(vm instanceof Foo);
      }
    }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), false);
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
    ], 'round#2');
    assert.strictEqual(eventLog.log.length, 8);
    await au.stop(true);
  });

  it('multiple asynchronous hooks - second canLoad hook preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook {
      public get waitMs(): number { return 1; }
    }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canLoad(vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return !(vm instanceof Foo);
      }
    }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), false);
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,
    ], 'round#2');
    assert.strictEqual(eventLog.log.length, 10);
    await au.stop(true);
  });

  it('multiple asynchronous hooks - view-model canLoad hook preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }
    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel {
      public get waitMs(): number { return 1; }
      public async canLoad(params: Params, next: RouteNode, _current: RouteNode): Promise<boolean> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return !Number.isNaN(Number(params.id));
      }
    }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo/:id', component: Foo },
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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo/bar'), false, 'round#2-router#load');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo\/bar'/,
      /Hook1\] canLoad - end 'foo\/bar'/,
      /Hook2\] canLoad - start 'foo\/bar'/,
      /Hook2\] canLoad - end 'foo\/bar'/,
      /Foo\] canLoad - start 'foo\/bar'/,
      /Foo\] canLoad - end 'foo\/bar'/,
    ], 'round#2');
    assert.strictEqual(eventLog.log.length, 12);

    // round #3
    eventLog.clear();
    assert.strictEqual(await router.load('foo/123'), true, 'round#3-router#load');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo\/123'/,
      /Hook1\] canLoad - end 'foo\/123'/,
      /Hook2\] canLoad - start 'foo\/123'/,
      /Hook2\] canLoad - end 'foo\/123'/,
      /Foo\] canLoad - start 'foo\/123'/,
      /Foo\] canLoad - end 'foo\/123'/,
    ], 'round#3');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Home\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Hook1\] unloading - end 'home'/,
    ], 12, 'round#3 - unloading');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'foo\/123'/,
      /Hook2\] loading - start 'foo\/123'/,
      /Foo\] loading - start 'foo\/123'/,
      /Foo\] loading - end 'foo\/123'/,
      /Hook2\] loading - end 'foo\/123'/,
      /Hook1\] loading - end 'foo\/123'/,
    ], 18, 'round#3 - loading');
    assert.strictEqual(eventLog.log.length, 24);

    await au.stop(true);
  });

  it('multiple asynchronous hooks - first canLoad hook preempts with navigation instruction', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canLoad(vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return vm instanceof Foo ? 'bar' : true;
      }
    }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook {
      public get waitMs(): number { return 1; }
      public async canLoad(vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return vm instanceof Foo ? 'home' : true;
      }
    }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'ba-r', template: 'bar' })
    class Bar extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
        { path: 'bar', component: Bar },
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
      Bar,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name, Bar.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,

      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'bar'/,
      /Hook1\] canLoad - end 'bar'/,
      /Hook2\] canLoad - start 'bar'/,
      /Hook2\] canLoad - end 'bar'/,
      /Bar\] canLoad - start 'bar'/,
      /Bar\] canLoad - end 'bar'/,
    ], 'round#2');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Home\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Hook1\] unloading - end 'home'/,
    ], 14, 'round#2 - unloading');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'bar'/,
      /Hook2\] loading - start 'bar'/,
      /Bar\] loading - start 'bar'/,
      /Bar\] loading - end 'bar'/,
      /Hook2\] loading - end 'bar'/,
      /Hook1\] loading - end 'bar'/,
    ], 20, 'round#2 - loading');
    await au.stop(true);
  });

  it('multiple asynchronous hooks - second canLoad hook preempts with navigation instruction', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canLoad(vm: IRouteViewModel, _params: Params, next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return vm instanceof Foo ? 'bar' : true;
      }
    }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'ba-r', template: 'bar' })
    class Bar extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo', component: Foo },
        { path: 'bar', component: Bar },
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
      Bar,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name, Bar.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo'/,
      /Hook1\] canLoad - end 'foo'/,
      /Hook2\] canLoad - start 'foo'/,
      /Hook2\] canLoad - end 'foo'/,

      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'bar'/,
      /Hook1\] canLoad - end 'bar'/,
      /Hook2\] canLoad - start 'bar'/,
      /Hook2\] canLoad - end 'bar'/,
      /Bar\] canLoad - start 'bar'/,
      /Bar\] canLoad - end 'bar'/,
    ], 'round#2');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Home\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Hook1\] unloading - end 'home'/,
    ], 14, 'round#2 - unloading');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'bar'/,
      /Hook2\] loading - start 'bar'/,
      /Bar\] loading - start 'bar'/,
      /Bar\] loading - end 'bar'/,
      /Hook2\] loading - end 'bar'/,
      /Hook1\] loading - end 'bar'/,
    ], 20, 'round#2 - loading');
    await au.stop(true);
  });

  it('multiple asynchronous hooks - view-model canLoad hook preempts with navigation instruction', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }
    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel {
      public get waitMs(): number { return 1; }
      public async canLoad(params: Params, next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
        await log('canLoad', next, this.getWaitTime('canLoad'), this.logger);
        return Number.isNaN(Number(params.id)) ? 'bar' : true;
      }
    }
    @customElement({ name: 'ba-r', template: 'bar' })
    class Bar extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @route({
      routes: [
        { path: '', redirectTo: 'home' },
        { path: 'home', component: Home },
        { path: 'foo/:id', component: Foo },
        { path: 'bar', component: Bar },
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
      Bar,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Home.name, Foo.name, Bar.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');
    eventLog.assertLog([
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo/bar'), true, 'round#2-router#load');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'foo\/bar'/,
      /Hook1\] canLoad - end 'foo\/bar'/,
      /Hook2\] canLoad - start 'foo\/bar'/,
      /Hook2\] canLoad - end 'foo\/bar'/,
      /Foo\] canLoad - start 'foo\/bar'/,
      /Foo\] canLoad - end 'foo\/bar'/,

      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,

      /Hook1\] canLoad - start 'bar'/,
      /Hook1\] canLoad - end 'bar'/,
      /Hook2\] canLoad - start 'bar'/,
      /Hook2\] canLoad - end 'bar'/,
      /Bar\] canLoad - start 'bar'/,
      /Bar\] canLoad - end 'bar'/,
    ], 'round#2');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unloading - start 'home'/,
      /Hook2\] unloading - start 'home'/,
      /Home\] unloading - start 'home'/,
      /Home\] unloading - end 'home'/,
      /Hook2\] unloading - end 'home'/,
      /Hook1\] unloading - end 'home'/,
    ], 24, 'round#2 - unloading');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'bar'/,
      /Hook2\] loading - start 'bar'/,
      /Bar\] loading - start 'bar'/,
      /Bar\] loading - end 'bar'/,
      /Hook2\] loading - end 'bar'/,
      /Hook1\] loading - end 'bar'/,
    ], 30, 'round#2 - loading');
    assert.strictEqual(eventLog.log.length, 36);

    // round #3
    eventLog.clear();
    assert.strictEqual(await router.load('foo/123'), true, 'round#3-router#load');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'bar'/,
      /Hook1\] canUnload - end 'bar'/,
      /Hook2\] canUnload - start 'bar'/,
      /Hook2\] canUnload - end 'bar'/,
      /Bar\] canUnload - start 'bar'/,
      /Bar\] canUnload - end 'bar'/,

      /Hook1\] canLoad - start 'foo\/123'/,
      /Hook1\] canLoad - end 'foo\/123'/,
      /Hook2\] canLoad - start 'foo\/123'/,
      /Hook2\] canLoad - end 'foo\/123'/,
      /Foo\] canLoad - start 'foo\/123'/,
      /Foo\] canLoad - end 'foo\/123'/,
    ], 'round#3');
    eventLog.assertLogOrderInvariant([
      /Hook1\] unloading - start 'bar'/,
      /Hook2\] unloading - start 'bar'/,
      /Bar\] unloading - start 'bar'/,
      /Bar\] unloading - end 'bar'/,
      /Hook2\] unloading - end 'bar'/,
      /Hook1\] unloading - end 'bar'/,
    ], 12, 'round#3 - unloading');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'foo\/123'/,
      /Hook2\] loading - start 'foo\/123'/,
      /Foo\] loading - start 'foo\/123'/,
      /Foo\] loading - end 'foo\/123'/,
      /Hook2\] loading - end 'foo\/123'/,
      /Hook1\] loading - end 'foo\/123'/,
    ], 18, 'round#3 - load');
    assert.strictEqual(eventLog.log.length, 24);

    await au.stop(true);
  });

  it('multiple asynchronous hooks - first canUnload hook preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canUnload(vm: IRouteViewModel, _next: RouteNode, current: RouteNode): Promise<boolean> {
        await log('canUnload', current, this.getWaitTime('canUnload'), this.logger);
        return !(vm instanceof Home);
      }
    }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 1; } }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), false);
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
    ], 'round#2');
    assert.strictEqual(eventLog.log.length, 2);
    await au.stop(true);
  });

  it('multiple asynchronous hooks - second canUnload hook preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook {
      public get waitMs(): number { return 1; }
    }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook {
      public get waitMs(): Record<Hooks, number> { return createHookTimingConfiguration({ canLoad: 2 }); }
      public async canUnload(vm: IRouteViewModel, _next: RouteNode, current: RouteNode): Promise<boolean> {
        await log('canUnload', current, this.getWaitTime('canUnload'), this.logger);
        return !(vm instanceof Home);
      }
    }

    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel { public get waitMs(): number { return 1; } }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), false);
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
    ], 'round#2');
    assert.strictEqual(eventLog.log.length, 4);
    await au.stop(true);
  });

  it('multiple asynchronous hooks - view-model canUnload hook preempts with false', async function () {
    @lifecycleHooks()
    class Hook1 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @lifecycleHooks()
    class Hook2 extends AsyncBaseHook { public get waitMs(): number { return 1; } }
    @customElement({ name: 'ho-me', template: 'home' })
    class Home extends AsyncBaseViewModel {
      public get waitMs(): number { return 1; }
      public async canUnload(_next: RouteNode, current: RouteNode): Promise<boolean> {
        await log('canUnload', current, this.getWaitTime('canUnload'), this.logger);
        return false;
      }
    }
    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo extends AsyncBaseViewModel {
      public get waitMs(): number { return 1; }
    }

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
      /Hook1\] canLoad - start 'home'/,
      /Hook1\] canLoad - end 'home'/,
      /Hook2\] canLoad - start 'home'/,
      /Hook2\] canLoad - end 'home'/,
      /Home\] canLoad - start 'home'/,
      /Home\] canLoad - end 'home'/,
    ], 'init');
    eventLog.assertLogOrderInvariant([
      /Hook1\] loading - start 'home'/,
      /Hook2\] loading - start 'home'/,
      /Home\] loading - start 'home'/,
      /Home\] loading - end 'home'/,
      /Hook2\] loading - end 'home'/,
      /Hook1\] loading - end 'home'/,
    ], 6, 'init - loading');

    // round #2
    eventLog.clear();
    assert.strictEqual(await router.load('foo/bar'), false, 'round#2-router#load');
    eventLog.assertLog([
      /Hook1\] canUnload - start 'home'/,
      /Hook1\] canUnload - end 'home'/,
      /Hook2\] canUnload - start 'home'/,
      /Hook2\] canUnload - end 'home'/,
      /Home\] canUnload - start 'home'/,
      /Home\] canUnload - end 'home'/,
    ], 'round#2');
    assert.strictEqual(eventLog.log.length, 6);

    await au.stop(true);
  });
  // #endregion

  // #region some migrated tests from hook-tests.specs.ts, as the tests were sometimes overly complicated, and accounting for every ticks might be bit too much
  function* getHookTestData() {
    yield {
      name: 'a1(canLoad:4)/a2+b1/b2',
      a1: createHookTimingConfiguration({ canLoad: 4 }),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration(),
      b2: createHookTimingConfiguration(),
      assertLog(eventLog: EventLog) {
        // This cannot be reliably tested in both node and browsers, because node finishes b1 before a1 whereas the browsers don't. Hence, doing order invariant assertions.
        eventLog.assertLogOrderInvariant([
          /A1\] canLoad - start 'a1'/,
          /B1\] canLoad - start 'b1'/,
          /A1\] canLoad - end 'a1'/,
          /B1\] canLoad - end 'b1'/,
          /A1\] loading - start 'a1'/,
          /B1\] loading - start 'b1'/,
          /A1\] loading - end 'a1'/,
          /B1\] loading - end 'b1'/,

          /A2\] canLoad - start 'a2'/,
          /B2\] canLoad - start 'b2'/,
          /B2\] canLoad - end 'b2'/,
          /A2\] canLoad - end 'a2'/,
          /A2\] loading - start 'a2'/,
          /B2\] loading - start 'b2'/,
          /A2\] loading - end 'a2'/,
          /B2\] loading - end 'b2'/,
        ], 8, 'loading part2');
      }
    };

    yield {
      name: 'a1(canLoad:8)/a2+b1/b2',
      a1: createHookTimingConfiguration({ canLoad: 8 }),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration(),
      b2: createHookTimingConfiguration(),
      assertLog(eventLog: EventLog) {
        eventLog.assertLog([
          /A1\] canLoad - start 'a1'/,
          /B1\] canLoad - start 'b1'/,
          /B1\] canLoad - end 'b1'/,
          /A1\] canLoad - end 'a1'/,
          /A1\] loading - start 'a1'/,
          /B1\] loading - start 'b1'/,
          /A1\] loading - end 'a1'/,
          /B1\] loading - end 'b1'/,
        ], 'loading');
        eventLog.assertLogOrderInvariant([
          /A2\] canLoad - start 'a2'/,
          /B2\] canLoad - start 'b2'/,
          /B2\] canLoad - end 'b2'/,
          /A2\] canLoad - end 'a2'/,
          /A2\] loading - start 'a2'/,
          /B2\] loading - start 'b2'/,
          /A2\] loading - end 'a2'/,
          /B2\] loading - end 'b2'/,
        ], 8, 'loading part2');
      }
    };

    function assert2(eventLog: EventLog) {
      eventLog.assertLog([
        /A1\] canLoad - start 'a1'/,
        /B1\] canLoad - start 'b1'/,
        /A1\] canLoad - end 'a1'/,
        /B1\] canLoad - end 'b1'/,
        /A1\] loading - start 'a1'/,
        /B1\] loading - start 'b1'/,
        /A1\] loading - end 'a1'/,
        /B1\] loading - end 'b1'/,
      ], 'loading');
      eventLog.assertLogOrderInvariant([
        /A2\] canLoad - start 'a2'/,
        /B2\] canLoad - start 'b2'/,
        /B2\] canLoad - end 'b2'/,
        /A2\] canLoad - end 'a2'/,
        /A2\] loading - start 'a2'/,
        /B2\] loading - start 'b2'/,
        /A2\] loading - end 'a2'/,
        /B2\] loading - end 'b2'/,
      ], 8, 'loading part2');
    }
    yield {
      name: 'a1/a2+b1(canLoad:2)/b2',
      a1: createHookTimingConfiguration(),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration({ canLoad: 2 }),
      b2: createHookTimingConfiguration(),
      assertLog: assert2,
    };
    yield {
      name: 'a1/a2+b1(canLoad:4)/b2',
      a1: createHookTimingConfiguration(),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration({ canLoad: 4 }),
      b2: createHookTimingConfiguration(),
      assertLog: assert2,
    };
    yield {
      name: 'a1/a2+b1(canLoad:8)/b2',
      a1: createHookTimingConfiguration(),
      a2: createHookTimingConfiguration(),
      b1: createHookTimingConfiguration({ canLoad: 8 }),
      b2: createHookTimingConfiguration(),
      assertLog: assert2,
    };
  }
  for (const { name, a1, a2, b1, b2, assertLog } of getHookTestData()) {
    it(`parentsiblings-childsiblings - hook of one of the component takes significantly more time than others - no preemption - ${name}`, async function () {
      @customElement({ name: 'a2', template: null })
      class A2 extends AsyncBaseViewModel { public get waitMs(): Record<Hooks, number> { return a2; } }

      @route({ routes: [{ path: 'a2', component: A2 }] })
      @customElement({ name: 'a1', template: '<au-viewport></au-viewport>' })
      class A1 extends AsyncBaseViewModel { public get waitMs(): Record<Hooks, number> { return a1; } }

      @customElement({ name: 'b2', template: null })
      class B2 extends AsyncBaseViewModel { public get waitMs(): Record<Hooks, number> { return b2; } }

      @route({ routes: [{ path: 'b2', component: B2 }] })
      @customElement({ name: 'b1', template: '<au-viewport></au-viewport>' })
      class B1 extends AsyncBaseViewModel { public get waitMs(): Record<Hooks, number> { return b1; } }

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

      assertLog(eventLog);

      await au.stop(true);
    });
  }

  class SiblingHookTestData {
    public readonly name: string;
    public constructor(
      ticks: number,
      public readonly root: Class<unknown>,
      public readonly scopes: string[],
      public readonly assertStartLog: (eventLog: EventLog) => void,
      public readonly phases: [instruction: string, assertion: (eventLog: EventLog) => void][],
      public readonly assertStopLog: (eventLog: EventLog) => void,
    ) {
      this.name = `ticks: ${ticks} - ${Array.from(phases.map(x => x[0])).join(' -> ')}`;
    }
  }

  function* getSiblingHookTestData(): Generator<SiblingHookTestData> {
    abstract class AsyncBaseViewModel implements IRouteViewModel {
      private _ceName: string | null = null;
      private get ceName(): string {
        return this._ceName ??= CustomElement.getDefinition(this.constructor).name;
      }
      public constructor(
        @ILogger protected readonly logger: ILogger,
        private readonly ticks: number,
      ) {
        this.logger = logger.scopeTo(this.constructor.name);
      }

      public binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        return log('binding', this.ceName, this.ticks, this.logger);
      }
      public bound(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        return log('bound', this.ceName, this.ticks, this.logger);
      }
      public attaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        return log('attaching', this.ceName, this.ticks, this.logger);
      }
      public attached(_initiator: IHydratedController): void | Promise<void> {
        return log('attached', this.ceName, this.ticks, this.logger);
      }
      public detaching(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        return log('detaching', this.ceName, this.ticks, this.logger);
      }
      public unbinding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        return log('unbinding', this.ceName, this.ticks, this.logger);
      }
      public dispose(): void {
        this.logger.trace(`dispose - ${this.ceName}`);
      }

      public async canLoad(_params: Params, _next: RouteNode, _current: RouteNode): Promise<boolean | NavigationInstruction> {
        await log('canLoad', this.ceName, this.ticks, this.logger);
        return true;
      }
      public async loading(_params: Params, _next: RouteNode, _current: RouteNode): Promise<void> {
        await log('loading', this.ceName, this.ticks, this.logger);
      }
      public async canUnload(_rn: RouteNode, _current?: RouteNode): Promise<boolean> {
        await log('canUnload', this.ceName, this.ticks, this.logger);
        return true;
      }
      public async unloading(_rn: RouteNode, _current?: RouteNode): Promise<void> {
        await log('unloading', this.ceName, this.ticks, this.logger);
      }
    }

    function createRoot(ticks: number): [root: Class<unknown>, scopes: string[]] {
      abstract class Base extends AsyncBaseViewModel {
        public constructor(@ILogger logger: ILogger) {
          super(logger, ticks);
        }
      }
      @customElement({ name: 'a01', template: null })
      class A01 extends Base { }
      @customElement({ name: 'a02', template: null })
      class A02 extends Base { }
      @customElement({ name: 'a03', template: null })
      class A03 extends Base { }
      @customElement({ name: 'a04', template: null })
      class A04 extends Base { }

      @route({
        routes: [
          { path: 'a01', component: A01 },
          { path: 'a02', component: A02 },
          { path: 'a03', component: A03 },
          { path: 'a04', component: A04 },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<au-viewport name="$0"></au-viewport><au-viewport name="$1"></au-viewport>' })
      class Root extends Base { }
      return [Root, [Root.name, A01.name, A02.name, A03.name, A04.name]];
    }

    function assertStartLog(eventLog: EventLog) {
      eventLog.assertLog([
        /Root\] binding - start ro-ot/,
        /Root\] binding - end ro-ot/,
        /Root\] bound - start ro-ot/,
        /Root\] bound - end ro-ot/,
        /Root\] attaching - start ro-ot/,
        /Root\] attaching - end ro-ot/,
        /Root\] attached - start ro-ot/,
        /Root\] attached - end ro-ot/,
      ], 'start');
    }
    for (const ticks of [0, 1]) {
      const [root, scopes] = createRoot(ticks);

      // #region only vp $0 changes with every nav

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a03@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A03\] canUnload - end a03/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A03\] unloading - start a03/,
                /A03\] unloading - end a03/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase3');
            },
          ],
          [
            'a03@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A03\] detaching - start a03/,
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A03\] detaching - end a03/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A03\] unbinding - start a03/,
            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A03\] unbinding - end a03/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A03\] dispose - a03/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase1');
            },
          ],
          [
            'a03@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A03\] canUnload - end a03/,

                /A03\] unloading - start a03/,
                /A03\] unloading - end a03/,

                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,
              ], 'phase3');
            },
          ],
          [
            'a03@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A03\] detaching - start a03/,
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A03\] detaching - end a03/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A03\] unbinding - start a03/,
            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A03\] unbinding - end a03/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A03\] dispose - a03/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase3');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase3');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase1');
            },
          ],
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,
              ], 'phase3');
            },
          ],
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,
              ], 'phase2');
            },
          ],
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase3');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase2');
            },
          ],
          [
            'a02@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );
      // #endregion

      // #region only vp $1 changes with every nav

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a01@$0+a03@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A03\] canUnload - end a03/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A03\] unloading - start a03/,
                /A03\] unloading - end a03/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0+a03@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /A03\] detaching - start a03/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /A03\] detaching - end a03/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /A03\] unbinding - start a03/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /A03\] unbinding - end a03/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
            /A03\] dispose - a03/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase1');
            },
          ],
          [
            'a01@$0+a03@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A03\] canUnload - end a03/,

                /A03\] unloading - start a03/,
                /A03\] unloading - end a03/,

                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0+a03@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A03\] loading - start a03/,
                /A03\] loading - end a03/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /A03\] detaching - start a03/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /A03\] detaching - end a03/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /A03\] unbinding - start a03/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /A03\] unbinding - end a03/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
            /A03\] dispose - a03/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase1');
            },
          ],
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] canLoad - end a01/,

                /A01\] loading - start a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] loading - end a01/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] canLoad - end a01/,

                /A01\] loading - start a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] loading - end a01/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase2');
            },
          ],
          [
            'a01@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase3');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase4');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );
      // #endregion

      // #region both vp $0 and $1 change with every nav
      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 9, 'phase1.2');
            },
          ],
          [
            'a03@$0+a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A04\] canLoad - start a04/,
                /A03\] canLoad - end a03/,
                /A04\] canLoad - end a04/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A04\] loading - start a04/,
                /A03\] loading - end a03/,
                /A04\] loading - end a04/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 17, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A04\] canUnload - start a04/,
                /A03\] canUnload - end a03/,
                /A04\] canUnload - end a04/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A03\] unloading - start a03/,
                /A04\] unloading - start a04/,
                /A03\] unloading - end a03/,
                /A04\] unloading - end a04/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 17, 'phase3.2');
            },
          ],
          [
            'a03@$0+a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A04\] canLoad - start a04/,
                /A03\] canLoad - end a03/,
                /A04\] canLoad - end a04/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A04\] loading - start a04/,
                /A03\] loading - end a03/,
                /A04\] loading - end a04/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 17, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A03\] detaching - start a03/,
            /A04\] detaching - start a04/,
            /Root\] detaching - start ro-ot/,
            /A03\] detaching - end a03/,
            /A04\] detaching - end a04/,
            /Root\] detaching - end ro-ot/,

            /A03\] unbinding - start a03/,
            /A04\] unbinding - start a04/,
            /Root\] unbinding - start ro-ot/,
            /A03\] unbinding - end a03/,
            /A04\] unbinding - end a04/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A03\] dispose - a03/,
            /A04\] dispose - a04/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,

                /A02\] bound - start a02/,
                /A02\] bound - end a02/,

                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,

                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 4, 'phase1.2');
            },
          ],
          [
            'a03@$0+a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A04\] canLoad - start a04/,
                /A03\] canLoad - end a03/,
                /A04\] canLoad - end a04/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A04\] loading - start a04/,
                /A03\] loading - end a03/,
                /A04\] loading - end a04/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A04\] canUnload - start a04/,
                /A03\] canUnload - end a03/,
                /A04\] canUnload - end a04/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A03\] unloading - start a03/,
                /A04\] unloading - start a04/,
                /A03\] unloading - end a03/,
                /A04\] unloading - end a04/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,

                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a03@$0+a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A04\] canLoad - start a04/,
                /A03\] canLoad - end a03/,
                /A04\] canLoad - end a04/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A04\] loading - start a04/,
                /A03\] loading - end a03/,
                /A04\] loading - end a04/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A03\] detaching - start a03/,
            /A04\] detaching - start a04/,
            /Root\] detaching - start ro-ot/,
            /A03\] detaching - end a03/,
            /A04\] detaching - end a04/,
            /Root\] detaching - end ro-ot/,

            /A03\] unbinding - start a03/,
            /A04\] unbinding - start a04/,
            /Root\] unbinding - start ro-ot/,
            /A03\] unbinding - end a03/,
            /A04\] unbinding - end a04/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A03\] dispose - a03/,
            /A04\] dispose - a04/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 4, 'phase1.2');
            },
          ],
          [
            'a03@$0+a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A03\] canLoad - start a03/,
                /A04\] canLoad - start a04/,
                /A03\] canLoad - end a03/,
                /A04\] canLoad - end a04/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A03\] loading - start a03/,
                /A04\] loading - start a04/,
                /A03\] loading - end a03/,
                /A04\] loading - end a04/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A04\] canUnload - start a04/,
                /A03\] canUnload - end a03/,
                /A04\] canUnload - end a04/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A03\] unloading - start a03/,
                /A04\] unloading - start a04/,
                /A03\] unloading - end a03/,
                /A04\] unloading - end a04/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,

                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a03@$0+a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A03\] canLoad - start a03/,
                /A04\] canLoad - start a04/,
                /A03\] canLoad - end a03/,
                /A04\] canLoad - end a04/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A03\] loading - start a03/,
                /A04\] loading - start a04/,
                /A03\] loading - end a03/,
                /A04\] loading - end a04/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A03\] detaching - start a03/,
            /A04\] detaching - start a04/,
            /Root\] detaching - start ro-ot/,
            /A03\] detaching - end a03/,
            /A04\] detaching - end a04/,
            /Root\] detaching - end ro-ot/,

            /A03\] unbinding - start a03/,
            /A04\] unbinding - start a04/,
            /Root\] unbinding - start ro-ot/,
            /A03\] unbinding - end a03/,
            /A04\] unbinding - end a04/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A03\] dispose - a03/,
            /A04\] dispose - a04/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 8, 'phase1.2');
            },
          ],
          [
            'a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A04\] canLoad - start a04/,
                /A04\] canLoad - end a04/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A04\] loading - start a04/,
                /A04\] loading - end a04/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A04\] canUnload - start a04/,
                /A04\] canUnload - end a04/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A04\] unloading - start a04/,
                /A04\] unloading - end a04/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a04@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A04\] canLoad - start a04/,
                /A04\] canLoad - end a04/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A04\] loading - start a04/,
                /A04\] loading - end a04/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A04\] detaching - start a04/,
            /Root\] detaching - start ro-ot/,
            /A04\] detaching - end a04/,
            /Root\] detaching - end ro-ot/,

            /A04\] unbinding - start a04/,
            /Root\] unbinding - start ro-ot/,
            /A04\] unbinding - end a04/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A04\] dispose - a04/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 8, 'phase1.2');
            },
          ],
          [
            'a03@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A03\] loading - end a03/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A03\] canUnload - start a03/,
                /A03\] canUnload - end a03/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A03\] unloading - start a03/,
                /A03\] unloading - end a03/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A03\] detaching - start a03/,
                /A03\] detaching - end a03/,
                /A03\] unbinding - start a03/,
                /A03\] unbinding - end a03/,
                /A03\] dispose - a03/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a03@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A03\] canLoad - start a03/,
                /A03\] canLoad - end a03/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A03\] loading - start a03/,
                /A03\] loading - end a03/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A03\] binding - start a03/,
                /A03\] binding - end a03/,
                /A03\] bound - start a03/,
                /A03\] bound - end a03/,
                /A03\] attaching - start a03/,
                /A03\] attaching - end a03/,
                /A03\] attached - start a03/,
                /A03\] attached - end a03/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A03\] detaching - start a03/,
            /Root\] detaching - start ro-ot/,
            /A03\] detaching - end a03/,
            /Root\] detaching - end ro-ot/,

            /A03\] unbinding - start a03/,
            /Root\] unbinding - start ro-ot/,
            /A03\] unbinding - end a03/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A03\] dispose - a03/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 8, 'phase1.2');
            },
          ],
          [
            'a02@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - end a02/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A02\] loading - start a02/,
                /A01\] loading - start a01/,
                /A02\] loading - end a02/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 16, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A01\] canUnload - start a01/,
                /A02\] canUnload - end a02/,
                /A01\] canUnload - end a01/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A02\] unloading - start a02/,
                /A01\] unloading - start a01/,
                /A02\] unloading - end a02/,
                /A01\] unloading - end a01/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 16, 'phase3.2');
            },
          ],
          [
            'a02@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - end a02/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A02\] loading - start a02/,
                /A01\] loading - start a01/,
                /A02\] loading - end a02/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 16, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 4, 'phase1.2');
            },
          ],
          [
            'a02@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - end a02/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A02\] loading - start a02/,
                /A01\] loading - start a01/,
                /A02\] loading - end a02/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A01\] canUnload - start a01/,
                /A02\] canUnload - end a02/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] unloading - start a02/,
                /A01\] unloading - start a01/,
                /A02\] unloading - end a02/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a02@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - end a02/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A02\] loading - start a02/,
                /A01\] loading - start a01/,
                /A02\] loading - end a02/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase1');
            },
          ],
          [
            'a02@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - end a02/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A01\] loading - start a01/,
                /A02\] loading - end a02/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A01\] canUnload - start a01/,
                /A02\] canUnload - end a02/,
                /A01\] canUnload - end a01/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A01\] unloading - start a01/,
                /A02\] unloading - end a02/,
                /A01\] unloading - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a02@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - end a02/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A01\] loading - start a01/,
                /A02\] loading - end a02/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 8, 'phase1.2');
            },
          ],
          [
            'a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 8, 'phase1.2');
            },
          ],
          [
            'a02@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a02@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A02\] detaching - start a02/,
            /Root\] detaching - start ro-ot/,
            /A02\] detaching - end a02/,
            /Root\] detaching - end ro-ot/,

            /A02\] unbinding - start a02/,
            /Root\] unbinding - start ro-ot/,
            /A02\] unbinding - end a02/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A02\] dispose - a02/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase1.1');

              eventLog.assertLogOrderInvariant([
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 8, 'phase1.2');
            },
          ],
          [
            'a04@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A04\] canLoad - start a04/,
                /A01\] canLoad - start a01/,
                /A04\] canLoad - end a04/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A04\] loading - start a04/,
                /A01\] loading - start a01/,
                /A04\] loading - end a04/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 16, 'phase2.2');
            },
          ],
          [
            'a01@$0+a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A04\] canUnload - start a04/,
                /A01\] canUnload - start a01/,
                /A04\] canUnload - end a04/,
                /A01\] canUnload - end a01/,
                /A01\] canLoad - start a01/,
                /A02\] canLoad - start a02/,
                /A01\] canLoad - end a01/,
                /A02\] canLoad - end a02/,

                /A04\] unloading - start a04/,
                /A01\] unloading - start a01/,
                /A04\] unloading - end a04/,
                /A01\] unloading - end a01/,
                /A01\] loading - start a01/,
                /A02\] loading - start a02/,
                /A01\] loading - end a01/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 16, 'phase3.2');
            },
          ],
          [
            'a04@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A02\] canUnload - start a02/,
                /A01\] canUnload - end a01/,
                /A02\] canUnload - end a02/,
                /A04\] canLoad - start a04/,
                /A01\] canLoad - start a01/,
                /A04\] canLoad - end a04/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A02\] unloading - start a02/,
                /A01\] unloading - end a01/,
                /A02\] unloading - end a02/,
                /A04\] loading - start a04/,
                /A01\] loading - start a01/,
                /A04\] loading - end a04/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 16, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A04\] detaching - start a04/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A04\] detaching - end a04/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A04\] unbinding - start a04/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A04\] unbinding - end a04/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A04\] dispose - a04/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A02\] loading - start a02/,
                /A02\] loading - end a02/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 'phase1');
            },
          ],
          [
            'a04@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A04\] canLoad - start a04/,
                /A01\] canLoad - start a01/,
                /A04\] canLoad - end a04/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A04\] loading - start a04/,
                /A01\] loading - start a01/,
                /A04\] loading - end a04/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a02@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A04\] canUnload - start a04/,
                /A01\] canUnload - start a01/,
                /A04\] canUnload - end a04/,
                /A01\] canUnload - end a01/,
                /A02\] canLoad - start a02/,
                /A02\] canLoad - end a02/,

                /A04\] unloading - start a04/,
                /A01\] unloading - start a01/,
                /A04\] unloading - end a04/,
                /A01\] unloading - end a01/,
                /A02\] loading - start a02/,
                /A02\] loading - end a02/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A02\] binding - start a02/,
                /A02\] binding - end a02/,
                /A02\] bound - start a02/,
                /A02\] bound - end a02/,
                /A02\] attaching - start a02/,
                /A02\] attaching - end a02/,
                /A02\] attached - start a02/,
                /A02\] attached - end a02/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a04@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A02\] canUnload - start a02/,
                /A02\] canUnload - end a02/,
                /A04\] canLoad - start a04/,
                /A01\] canLoad - start a01/,
                /A04\] canLoad - end a04/,
                /A01\] canLoad - end a01/,

                /A02\] unloading - start a02/,
                /A02\] unloading - end a02/,
                /A04\] loading - start a04/,
                /A01\] loading - start a01/,
                /A04\] loading - end a04/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A02\] detaching - start a02/,
                /A02\] detaching - end a02/,
                /A02\] unbinding - start a02/,
                /A02\] unbinding - end a02/,
                /A02\] dispose - a02/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A04\] detaching - start a04/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A04\] detaching - end a04/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A04\] unbinding - start a04/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A04\] unbinding - end a04/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A04\] dispose - a04/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );

      yield new SiblingHookTestData(
        ticks,
        root,
        scopes,
        assertStartLog,
        [
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 'phase1');
            },
          ],
          [
            'a04@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A04\] canLoad - start a04/,
                /A01\] canLoad - start a01/,
                /A04\] canLoad - end a04/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A04\] loading - start a04/,
                /A01\] loading - start a01/,
                /A04\] loading - end a04/,
                /A01\] loading - end a01/,
              ], 'phase 2.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase2.2');
            },
          ],
          [
            'a01@$0',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A04\] canUnload - start a04/,
                /A01\] canUnload - start a01/,
                /A04\] canUnload - end a04/,
                /A01\] canUnload - end a01/,
                /A01\] canLoad - start a01/,
                /A01\] canLoad - end a01/,

                /A04\] unloading - start a04/,
                /A01\] unloading - start a01/,
                /A04\] unloading - end a04/,
                /A01\] unloading - end a01/,
                /A01\] loading - start a01/,
                /A01\] loading - end a01/,
              ], 'phase 3.1');

              eventLog.assertLogOrderInvariant([
                /A04\] detaching - start a04/,
                /A04\] detaching - end a04/,
                /A04\] unbinding - start a04/,
                /A04\] unbinding - end a04/,
                /A04\] dispose - a04/,

                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase3.2');
            },
          ],
          [
            'a04@$0+a01@$1',
            (eventLog: EventLog) => {
              eventLog.assertLog([
                /A01\] canUnload - start a01/,
                /A01\] canUnload - end a01/,
                /A04\] canLoad - start a04/,
                /A01\] canLoad - start a01/,
                /A04\] canLoad - end a04/,
                /A01\] canLoad - end a01/,

                /A01\] unloading - start a01/,
                /A01\] unloading - end a01/,
                /A04\] loading - start a04/,
                /A01\] loading - start a01/,
                /A04\] loading - end a04/,
                /A01\] loading - end a01/,
              ], 'phase 4.1');

              eventLog.assertLogOrderInvariant([
                /A01\] detaching - start a01/,
                /A01\] detaching - end a01/,
                /A01\] unbinding - start a01/,
                /A01\] unbinding - end a01/,
                /A01\] dispose - a01/,

                /A04\] binding - start a04/,
                /A04\] binding - end a04/,
                /A04\] bound - start a04/,
                /A04\] bound - end a04/,
                /A04\] attaching - start a04/,
                /A04\] attaching - end a04/,
                /A04\] attached - start a04/,
                /A04\] attached - end a04/,

                /A01\] binding - start a01/,
                /A01\] binding - end a01/,
                /A01\] bound - start a01/,
                /A01\] bound - end a01/,
                /A01\] attaching - start a01/,
                /A01\] attaching - end a01/,
                /A01\] attached - start a01/,
                /A01\] attached - end a01/,
              ], 12, 'phase4.2');
            },
          ],
        ],
        (eventLog: EventLog) => {
          eventLog.assertLog([
            /A04\] detaching - start a04/,
            /A01\] detaching - start a01/,
            /Root\] detaching - start ro-ot/,
            /A04\] detaching - end a04/,
            /A01\] detaching - end a01/,
            /Root\] detaching - end ro-ot/,

            /A04\] unbinding - start a04/,
            /A01\] unbinding - start a01/,
            /Root\] unbinding - start ro-ot/,
            /A04\] unbinding - end a04/,
            /A01\] unbinding - end a01/,
            /Root\] unbinding - end ro-ot/,

            /Root\] dispose - ro-ot/,
            /A04\] dispose - a04/,
            /A01\] dispose - a01/,
          ], 'stop');
        },
      );
      // #endregion
    }
  }
  for (const data of getSiblingHookTestData()) {
    it(`siblings - hook timing - ${data.name}`, async function () {
      const { au, container } = await createFixture(data.root,
        Registration.instance(IKnownScopes, data.scopes)
      );
      const router = container.get(IRouter);
      const eventLog = EventLog.getInstance(container);
      data.assertStartLog(eventLog);

      for (const [instruction, assertion] of data.phases) {
        eventLog.clear();
        await router.load(instruction);
        assertion(eventLog);
      }

      eventLog.clear();
      await au.stop(true);
      data.assertStopLog(eventLog);
    });
  }
  // #endregion

  it('navigate away -> false from canUnload -> navigate away with same path', async function () {
    @customElement({ name: 'c-one', template: `c1` })
    class ChildOne implements IRouteViewModel {
      public allowUnload: boolean = false;
      public canUnloadCalled: number = 0;
      public canUnload(): boolean {
        this.canUnloadCalled++;
        return this.allowUnload;
      }
    }
    @customElement({ name: 'c-two', template: `c2` })
    class ChildTwo implements IRouteViewModel {
      public allowUnload: boolean = false;
      public canUnloadCalled: number = 0;
      public canUnload(): boolean {
        this.canUnloadCalled++;
        return this.allowUnload;
      }
    }

    @route({
      routes: [
        {
          path: ['c1/:id?'],
          component: ChildOne,
        },
        {
          path: ['', 'c2/:id?'],
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'c2', 'content 1');

    let c2vm = CustomElement.for<ChildTwo>(host.querySelector('c-two')).viewModel;
    assert.strictEqual(await router.load('c1/42'), false, 'expected unsuccessful load 1');
    assert.strictEqual(c2vm.canUnloadCalled, 1, 'c2vm.canUnloadCalled 1');
    assert.strictEqual(await router.load('c1/42'), false, 'expected unsuccessful load 2');
    assert.strictEqual(c2vm.canUnloadCalled, 2, 'c2vm.canUnloadCalled 2');

    c2vm.allowUnload = true;
    assert.strictEqual(await router.load('c1/42'), true, 'expected successful load 1');
    assert.strictEqual(c2vm.canUnloadCalled, 3, 'c2vm.canUnloadCalled 3');
    assert.html.textContent(host, 'c1', 'content 2');

    const c1vm = CustomElement.for<ChildTwo>(host.querySelector('c-one')).viewModel;
    assert.strictEqual(await router.load('c2/42'), false, 'expected unsuccessful load 3');
    assert.strictEqual(c1vm.canUnloadCalled, 1, 'c1vm.canUnloadCalled 1');
    assert.strictEqual(await router.load('c2/42'), false, 'expected unsuccessful load 4');
    assert.strictEqual(c1vm.canUnloadCalled, 2, 'c1vm.canUnloadCalled 2');

    c1vm.allowUnload = true;
    assert.strictEqual(await router.load('c2/42'), true, 'expected successful load 2');
    assert.strictEqual(c1vm.canUnloadCalled, 3, 'c1vm.canUnloadCalled 3');
    assert.html.textContent(host, 'c2', 'content 3');

    // round#2
    c2vm = CustomElement.for<ChildTwo>(host.querySelector('c-two')).viewModel;
    c2vm.allowUnload = false;
    assert.strictEqual(await router.load('c2/43'), false, 'expected unsuccessful load 5');
    assert.strictEqual(c2vm.canUnloadCalled, 1, 'c2vm.canUnloadCalled 3');
    assert.strictEqual(await router.load('c1/43'), false, 'expected unsuccessful load 6');
    assert.strictEqual(c2vm.canUnloadCalled, 2, 'c2vm.canUnloadCalled 4');

    c2vm.allowUnload = true;
    assert.strictEqual(await router.load('c1/42'), true, 'expected successful load 3');
    assert.strictEqual(c2vm.canUnloadCalled, 3, 'c1vm.canUnloadCalled 5');
    assert.html.textContent(host, 'c1', 'content 4');

    await au.stop(true);
  });

  it('lifecycle hooks as dependencies are supported', async function () {
    @lifecycleHooks()
    class Hook1 extends BaseHook { }
    @lifecycleHooks()
    class Hook2 extends BaseHook { }
    @lifecycleHooks()
    class Hook3 extends BaseHook { }
    @customElement({ name: 'c-one', template: `c1`, dependencies: [Hook1, Hook3] })
    class ChildOne { }
    @customElement({ name: 'c-two', template: `c2`, dependencies: [Hook2] })
    class ChildTwo { }

    @route({
      routes: [
        {
          path: ['c1'],
          component: ChildOne,
        },
        {
          path: ['c2'],
          component: ChildTwo,
        },
      ],
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await createFixture(Root,
      Registration.instance(IKnownScopes, [Hook1.name, Hook2.name, Hook3.name])
    );
    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);

    // round#1
    await router.load('c1');
    assert.html.textContent(host, 'c1');
    eventLog.assertLog([
      /Hook1\] canLoad 'c1'/,
      /Hook3\] canLoad 'c1'/,
      /Hook1\] loading 'c1'/,
      /Hook3\] loading 'c1'/,
    ], 'round#1');

    // round #2
    eventLog.clear();
    await router.load('c2');
    assert.html.textContent(host, 'c2');
    eventLog.assertLog([
      /Hook1\] canUnload 'c1'/,
      /Hook3\] canUnload 'c1'/,
      /Hook2\] canLoad 'c2'/,
      /Hook1\] unloading 'c1'/,
      /Hook3\] unloading 'c1'/,
      /Hook2\] loading 'c2'/,
    ], 'round#2');

    await au.stop(true);
  });
});

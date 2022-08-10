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

    public static getInstance(container: IContainer): EventLog {
      const logger = container.get<DefaultLogger>(ILogger);
      const eventLog = (logger['traceSinks'] as ISink[]).find(x => x instanceof this);
      if (eventLog === undefined) throw new Error('Event log is not found');
      return eventLog as EventLog;
    }
  }

  // the simplified textbook (overused) example of auth hook
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

    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      StandardConfiguration,
      TestRouterConfiguration.for(LogLevel.trace, [EventLog]),
      RouterConfiguration,
      Home,
      Forbidden,
      FooList,
      FooEdit,
      IAuthenticationService,
      AuthorizationHook,
      Registration.instance(IKnownScopes, ['AuthHook'])
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: Root, host }).start();

    const router = container.get(IRouter);
    const eventLog = EventLog.getInstance(container);
    assert.html.textContent(host, 'home');

    assert.strictEqual(eventLog.log.length, 1);
    assert.match(eventLog.log[0], /AuthHook\] canLoad ''/);

    // round 2
    eventLog.clear();
    assert.strictEqual(await router.load('foo/404'), true);
    assert.html.textContent(host, 'You shall not pass!');
    assert.strictEqual(eventLog.log.length, 2);
    assert.match(eventLog.log[0], /AuthHook\] canLoad 'foo\/404'/);
    assert.match(eventLog.log[1], /AuthHook\] canLoad 'forbidden'/);

    // round 3
    eventLog.clear();
    assert.strictEqual(await router.load('foo'), true);
    assert.html.textContent(host, 'foo list');
    assert.strictEqual(eventLog.log.length, 1);
    assert.match(eventLog.log[0], /AuthHook\] canLoad 'foo'/);

    await au.stop();
  });
});

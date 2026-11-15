import { Constructable } from '@aurelia/kernel';
import { INavigationModel, IRouteContext, IRouter, IRouterEvents, route, RouteType } from '@aurelia/router';
import { tasksSettled } from '@aurelia/runtime';
import { customElement, ILocation } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation } from '@aurelia/testing';

import { start } from './_shared/create-fixture.js';
import { isNode } from '../util.js';

describe('router/lazy-routes.spec.ts', function () {

  @customElement({ name: 'ho-me', template: 'home' })
  class Home { }

  function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (err: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  /** Stand-in for `component: () => import('./x')` - a factory producing a module-like object on demand. */
  function lazyFactory<T extends Constructable>(load: () => Promise<{ default: T }> | { default: T } | T): RouteType {
    return load as unknown as RouteType;
  }

  /** Records unhandled promise rejections while `run` executes (plus a few macrotasks afterwards). */
  async function collectUnhandledRejections(run: () => void | Promise<void>): Promise<unknown[]> {
    const errors: unknown[] = [];
    if (isNode()) {
      const listener = (reason: unknown) => { errors.push(reason); };
      process.on('unhandledRejection', listener);
      try {
        await run();
        await new Promise(r => setTimeout(r, 10));
      } finally {
        process.removeListener('unhandledRejection', listener);
      }
    } else {
      const listener = (event: PromiseRejectionEvent) => {
        errors.push(event.reason);
        event.preventDefault();
      };
      window.addEventListener('unhandledrejection', listener);
      try {
        await run();
        await new Promise(r => setTimeout(r, 10));
      } finally {
        window.removeEventListener('unhandledrejection', listener);
      }
    }
    return errors;
  }

  it('does not call lazy factories at startup and loads them on first match #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }

    let adminCalls = 0;
    let reportsCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
        { path: 'reports', component: lazyFactory(reports) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');
    assert.strictEqual(reportsCalls, 0, 'reports factory called at startup');

    assert.strictEqual(await router.load('admin'), true, 'router.load(\'admin\')');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'after navigation to admin');
    assert.strictEqual(adminCalls, 1, 'admin factory call count');
    assert.strictEqual(reportsCalls, 0, 'reports factory call count');

    await au.stop(true);
  });

  it('does not block startup on a lazy route whose module never resolves #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }

    let adminCalls = 0;
    let reportsCalls = 0;
    const admin = () => { ++adminCalls; return new Promise<{ default: typeof Admin }>(() => { /* never resolves */ }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
        { path: 'reports', component: lazyFactory(reports) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');
    assert.strictEqual(reportsCalls, 0, 'reports factory called at startup');

    assert.strictEqual(await router.load('reports'), true, 'router.load(\'reports\')');
    await tasksSettled();
    assert.html.textContent(host, 'reports', 'after navigation to reports');
    assert.strictEqual(reportsCalls, 1, 'reports factory call count');
    assert.strictEqual(adminCalls, 0, 'admin factory call count');

    await au.stop(true);
  });

  it('fails only that navigation and retries the import when a lazy chunk rejects #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }

    let adminCalls = 0;
    const attempts: { resolve: (m: { default: typeof Admin }) => void; reject: (e: unknown) => void }[] = [];
    const admin = () => {
      ++adminCalls;
      const d = deferred<{ default: typeof Admin }>();
      attempts.push(d);
      return d.promise;
    };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);
    const location = container.get(ILocation) as unknown as MockBrowserHistoryLocation;
    const navErrors: unknown[] = [];
    container.get(IRouterEvents).subscribe('au:router:navigation-error', e => { navErrors.push(e); });

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');

    const chunkError = new Error('failed to load chunk');
    const unhandled = await collectUnhandledRejections(async () => {
      const pending = router.load('admin');
      // wait till the navigation reaches the lazy factory
      while (attempts.length === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
      const pathBefore = location.path;
      attempts[0].reject(chunkError);

      const error = await pending.then(() => null, err => err);
      assert.strictEqual(error, chunkError, 'router.load rejected with the chunk error');
      assert.html.textContent(host, 'home', 'home stays rendered');
      assert.strictEqual(location.path, pathBefore, 'url is unchanged');
      assert.strictEqual(navErrors.length, 1, 'navigation-error event published');
    });
    assert.deepStrictEqual(unhandled, [], 'unhandled rejections');

    // the failed import is retried by the next navigation
    const pending = router.load('admin');
    while (attempts.length < 2) {
      await new Promise(r => setTimeout(r, 0));
    }
    attempts[1].resolve({ default: Admin });
    assert.strictEqual(await pending, true, 'router.load(\'admin\') after retry');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'after retry');
    assert.strictEqual(adminCalls, 2, 'admin factory call count');

    await au.stop(true);
  });

  it('calls the factory only once for concurrent and repeated navigations #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }

    let adminCalls = 0;
    const d = deferred<{ default: typeof Admin }>();
    const admin = () => { ++adminCalls; return d.promise; };

    @route({
      routes: [
        { path: ['', 'home'], component: Home },
        { path: 'admin', component: lazyFactory(admin) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');

    const pending1 = router.load('admin');
    while (adminCalls === 0) {
      await new Promise(r => setTimeout(r, 0));
    }
    // second navigation to the same route while the import is still pending
    const pending2 = router.load('admin');
    d.resolve({ default: Admin });

    assert.strictEqual(await pending1, true, 'first navigation');
    assert.strictEqual(await pending2, true, 'second navigation');
    assert.strictEqual(adminCalls, 1, 'admin factory call count');

    // and again after the module is loaded
    await router.load('home');
    assert.html.textContent(host, 'home', 'navigated back to home');
    assert.strictEqual(await router.load('admin'), true, 'third navigation');
    assert.html.textContent(host, 'admin', 'admin rendered again');
    assert.strictEqual(adminCalls, 1, 'admin factory call count after repeated navigation');

    await au.stop(true);
  });

  it('loads nested lazy routes when navigating to a deep path #2553', async function () {
    @customElement({ name: 'us-ers', template: 'users' })
    class Users { }
    @customElement({ name: 'gro-ups', template: 'groups' })
    class Groups { }

    let usersCalls = 0;
    let groupsCalls = 0;
    const users = () => { ++usersCalls; return Promise.resolve({ default: Users }); };
    const groups = () => { ++groupsCalls; return Promise.resolve({ default: Groups }); };

    @route({
      routes: [
        { path: 'users', component: lazyFactory(users) },
        { path: 'groups', component: lazyFactory(groups) },
      ]
    })
    @customElement({ name: 'ad-min', template: 'admin <au-viewport></au-viewport>' })
    class Admin { }

    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }

    let adminCalls = 0;
    let reportsCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
        { path: 'reports', component: lazyFactory(reports) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');
    assert.strictEqual(reportsCalls, 0, 'reports factory called at startup');

    assert.strictEqual(await router.load('admin/users'), true, 'router.load(\'admin/users\')');
    await tasksSettled();
    assert.html.textContent(host, 'admin users', 'admin -> users rendered');
    assert.strictEqual(adminCalls, 1, 'admin factory call count');
    assert.strictEqual(usersCalls, 1, 'users factory call count');
    assert.strictEqual(groupsCalls, 0, 'groups factory call count');
    assert.strictEqual(reportsCalls, 0, 'reports factory call count');

    await au.stop(true);
  });

  for (const transitionPlan of ['none', 'invoke-lifecycles'] as const) {
    for (const failureMode of ['throw', 'reject'] as const) {
      it(`handles a lazy child ${failureMode} under an active parent (${transitionPlan}) #2556`, async function () {
        @customElement({ name: 'us-ers', template: 'users' })
        class Users { }
        @customElement({ name: 'rep-orts', template: 'reports' })
        class Reports { }

        const entered = deferred<void>();
        const chunk = deferred<{ default: typeof Users }>();
        const chunkError = new Error('failed child chunk');
        let attempts = 0;
        @route({ transitionPlan, routes: [
          { path: 'users', component: lazyFactory(() => {
            if (++attempts > 1) return Users;
            entered.resolve();
            if (failureMode === 'throw') throw chunkError;
            return chunk.promise;
          }) },
          { path: 'reports', component: Reports },
        ] })
        @customElement({ name: 'ad-min', template: '<section data-admin>admin <au-viewport></au-viewport></section>' })
        class Admin { }

        @route({ routes: [{ path: '', component: Home }, { path: 'admin', component: Admin }] })
        @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
        class Root { }

        const { host, au, container } = await start({ appRoot: Root });
        const router = container.get(IRouter);
        const outcome: { status: string; error?: unknown } = { status: 'pending' };
        const navErrors: unknown[] = [];
        const subscription = container.get(IRouterEvents).subscribe('au:router:navigation-error', e => { navErrors.push(e); });
        let pending: Promise<void> | undefined;
        try {
          await router.load('admin');
          assert.html.textContent(host, 'admin', 'parent is already active');
          const parentElement = host.querySelector('[data-admin]');
          const unhandled = await collectUnhandledRejections(async () => {
            pending = Promise.resolve(router.load('admin/users')).then(
              () => { outcome.status = 'resolved'; },
              error => { outcome.status = 'rejected'; outcome.error = error; },
            );
            await entered.promise;
            if (failureMode === 'reject') chunk.reject(chunkError);
            // Drain bounded turns so a missing error boundary fails an assertion instead of hanging this test.
            for (let i = 0; i < 4; ++i) await new Promise(resolve => setTimeout(resolve, 0));
          });
          assert.deepStrictEqual(
            { outcome: { ...outcome }, navigationErrors: navErrors.length, unhandled },
            { outcome: { status: 'rejected', error: chunkError }, navigationErrors: 1, unhandled: [] },
            'the child import failure must settle router.load and reach the navigation error boundary',
          );
          assert.html.textContent(host, 'admin', 'parent stays rendered');

          // The router's existing error policy must leave ordinary navigation and a later import retry usable.
          await tasksSettled();
          assert.strictEqual(await router.load('admin/reports'), true);
          assert.html.textContent(host, 'admin reports');
          assert.strictEqual(await router.load('admin/users'), true);
          assert.html.textContent(host, 'admin users');
          assert.strictEqual(attempts, 2);
          assert.strictEqual(host.querySelector('[data-admin]'), parentElement, 'the active layout is retained');
          assert.strictEqual(navErrors.length, 1, 'subsequent navigations succeed');
        } finally {
          entered.resolve();
          chunk.resolve({ default: Users });
          // A broken error boundary leaves the batch paused. Reject only for fixture cleanup, after recording the result.
          if (pending !== void 0 && outcome.status === 'pending') {
            (router.currentTr as unknown as { _handleError(error: unknown): void })._handleError(chunkError);
          }
          await pending;
          await tasksSettled();
          subscription.dispose();
          await au.stop(true);
        }
      });
    }
  }

  it('lists lazy routes in the navigation model from the parent config without loading them #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }
    @customElement({ name: 'sec-ret', template: 'secret' })
    class Secret { }

    let adminCalls = 0;
    let reportsCalls = 0;
    let secretCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };
    const secret = () => { ++secretCalls; return Promise.resolve({ default: Secret }); };

    @route({
      routes: [
        { path: ['', 'home'], component: Home },
        { id: 'admin-id', path: 'admin', title: 'Admin', data: { icon: 'lock' }, component: lazyFactory(admin) },
        { path: 'reports', title: 'Reports', component: lazyFactory(reports) },
        { path: 'secret', nav: false, component: lazyFactory(secret) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');

    const navModel = router.routeTree.root.context.routeConfigContext.navigationModel as INavigationModel;
    const navRoutes = navModel.routes;
    const adminRoute = navRoutes.find(x => x.id === 'admin-id');
    const reportsRoute = navRoutes.find(x => x.id === 'reports');
    assert.notStrictEqual(adminRoute, void 0, 'admin route in nav model');
    assert.strictEqual(adminRoute!.title, 'Admin', 'admin title');
    assert.deepStrictEqual(adminRoute!.path, ['admin'], 'admin path');
    assert.deepStrictEqual(adminRoute!.data, { icon: 'lock' }, 'admin data');
    assert.notStrictEqual(reportsRoute, void 0, 'reports route in nav model');
    assert.strictEqual(reportsRoute!.title, 'Reports', 'reports title');
    assert.strictEqual(navRoutes.find(x => x.id === 'secret'), void 0, 'nav:false route excluded');

    assert.strictEqual(adminCalls, 0, 'admin factory called');
    assert.strictEqual(reportsCalls, 0, 'reports factory called');
    assert.strictEqual(secretCalls, 0, 'secret factory called');

    await navModel.resolve();
    assert.strictEqual(adminCalls, 0, 'admin factory called by resolve()');
    assert.strictEqual(reportsCalls, 0, 'reports factory called by resolve()');
    assert.strictEqual(secretCalls, 0, 'secret factory called by resolve()');

    assert.strictEqual(await router.load('admin-id'), true, 'router.load(\'admin-id\')');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'admin rendered');
    assert.strictEqual(adminRoute!.isActive, true, 'admin nav entry is active');

    await au.stop(true);
  });

  it('navigates to a lazy route by id #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }

    let adminCalls = 0;
    let reportsCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };

    @route({
      routes: [
        { path: '', component: Home },
        { id: 'admin-id', path: 'admin', component: lazyFactory(admin) },
        { path: 'reports', component: lazyFactory(reports) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');
    assert.strictEqual(reportsCalls, 0, 'reports factory called at startup');

    assert.strictEqual(await router.load('admin-id'), true, 'router.load(\'admin-id\')');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'admin rendered');
    assert.strictEqual(adminCalls, 1, 'admin factory call count');
    assert.strictEqual(reportsCalls, 0, 'reports factory call count');

    await au.stop(true);
  });

  it('uses a lazy route as fallback resolved by id #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'miss-ing', template: 'missing' })
    class Missing { }

    let adminCalls = 0;
    let missingCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const missing = () => { ++missingCalls; return Promise.resolve({ default: Missing }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
        { id: 'missing-id', path: 'missing', component: lazyFactory(missing) },
      ],
      fallback: 'missing-id',
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');
    assert.strictEqual(missingCalls, 0, 'missing factory called at startup');

    assert.strictEqual(await router.load('non-existing'), true, 'router.load(\'non-existing\')');
    await tasksSettled();
    assert.html.textContent(host, 'missing', 'fallback rendered');
    assert.strictEqual(missingCalls, 1, 'missing factory call count');
    assert.strictEqual(adminCalls, 0, 'admin factory call count');

    await au.stop(true);
  });

  it('generates paths for lazy routes and navigates by component type #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }

    let adminCalls = 0;
    let reportsCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };

    @route({
      routes: [
        { path: '', component: Home },
        { id: 'admin-id', path: 'admin', component: lazyFactory(admin) },
        { path: 'reports', component: lazyFactory(reports) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called at startup');

    const path = await router.generatePath('admin-id');
    assert.strictEqual(path, 'admin', 'generatePath(\'admin-id\')');
    assert.strictEqual(adminCalls, 0, 'admin factory called by generatePath');
    assert.strictEqual(reportsCalls, 0, 'reports factory called by generatePath');

    // the component type of a lazy route is only known after its module is loaded, so loading by type
    // resolves the pending lazy routes to find the match
    assert.strictEqual(await router.load(Admin), true, 'router.load(Admin)');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'admin rendered');
    assert.strictEqual(adminCalls, 1, 'admin factory call count');
    assert.strictEqual(reportsCalls, 1, 'reports factory call count');

    await au.stop(true);
  });

  it('resolves a type-bound load link to its configured path before publishing it #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }

    let adminCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<a load.bind="adminType"></a><au-viewport></au-viewport>' })
    class Root {
      private readonly adminType = Admin;
    }

    const { host, au, container } = await start({ appRoot: Root });

    // Unlike an ID/path link, an opaque factory's type-to-path mapping requires discovery.
    // Resolving that mapping does not navigate, and the later click reuses the loaded module.
    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 1, 'the factory supplies the type-to-path mapping');
    assert.match(host.querySelector('a')!.getAttribute('href')!, /\/admin$/);

    const navEnd = new Promise<void>(r => {
      const sub = container.get(IRouterEvents).subscribe('au:router:navigation-end', () => {
        sub.dispose();
        r();
      });
    });
    (host.querySelector('a') as HTMLAnchorElement).click();
    await navEnd;
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'after clicking the link');
    assert.strictEqual(adminCalls, 1, 'admin factory call count');

    await au.stop(true);
  });

  for (const behavior of ['native href', 'active state'] as const) {
    it(`keeps a lazy type-bound link's ${behavior} consistent with a parent route-id link #2556`, async function () {
      @customElement({ name: 'ad-min', template: 'admin' })
      class Admin { }

      @route({ routes: [
        { path: '', component: Home },
        { id: 'admin-id', path: 'admin', component: lazyFactory(() => Promise.resolve({ default: Admin })) },
      ] })
      @customElement({
        name: 'ro-ot',
        template: `<a data-type load.bind="adminType"></a><a data-id load.bind="{ component: 'admin-id' }"></a><au-viewport></au-viewport>`,
      })
      class Root { public readonly adminType = Admin; }

      const { host, au, container } = await start({ appRoot: Root, activeClass: 'selected' });
      try {
        const typeLink = host.querySelector('[data-type]') as HTMLAnchorElement;
        const idLink = host.querySelector('[data-id]') as HTMLAnchorElement;
        assert.match(idLink.getAttribute('href')!, /\/admin$/, 'parent-id native URL control');
        if (behavior === 'native href') {
          assert.strictEqual(typeLink.getAttribute('href'), idLink.getAttribute('href'), 'native/modified clicks use the configured path');
        } else {
          await container.get(IRouter).load('admin-id');
          await tasksSettled();
          assert.html.textContent(host, 'admin', 'route loaded');
          assert.strictEqual(idLink.classList.contains('selected'), true, 'parent-id active control');
          assert.strictEqual(typeLink.classList.contains('selected'), true, 'type link becomes active after its lazy route loads');
        }
      } finally {
        await au.stop(true);
      }
    });
  }

  it('isActive does not load a pending lazy route for a component type #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }

    let adminCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);
    const ctx = container.get(IRouteContext);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(router.isActive(Admin, ctx), false, 'isActive(Admin) before loading');
    assert.strictEqual(adminCalls, 0, 'admin factory called by isActive');

    assert.strictEqual(await router.load('admin'), true, 'router.load(\'admin\')');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'admin rendered');
    assert.strictEqual(router.isActive(Admin, ctx), true, 'isActive(Admin) after loading');

    await au.stop(true);
  });

  it('updates the navigation model entry from the lazy component route config once loaded #2553', async function () {
    @route({ title: 'About us', data: { icon: 'info' } })
    @customElement({ name: 'ab-out', template: 'about' })
    class About { }
    @route({ title: 'Secret', nav: false })
    @customElement({ name: 'sec-ret', template: 'secret' })
    class Secret { }

    @route({
      routes: [
        { path: ['', 'home'], component: Home },
        { path: 'about', component: lazyFactory(() => Promise.resolve({ default: About })) },
        { path: 'secret', component: lazyFactory(() => Promise.resolve({ default: Secret })) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);
    const navModel = router.routeTree.root.context.routeConfigContext.navigationModel as INavigationModel;
    const routes = navModel.routes;

    assert.deepStrictEqual(routes.map(x => x.id), ['', 'about', 'secret'], 'nav entries before loading');
    const aboutRoute = routes[1];
    assert.strictEqual(aboutRoute.title, null, 'about title before loading');

    assert.strictEqual(await router.load('about'), true, 'router.load(\'about\')');
    await tasksSettled();
    assert.html.textContent(host, 'about', 'about rendered');
    assert.strictEqual(navModel.routes, routes, 'routes array is kept (observers stay attached)');
    assert.deepStrictEqual(routes.map(x => x.id), ['', 'about', 'secret'], 'nav entries after loading about');
    assert.strictEqual(routes[1], aboutRoute, 'about entry is updated in place');
    assert.strictEqual(aboutRoute.title, 'About us', 'about title after loading');
    assert.deepStrictEqual(aboutRoute.data, { icon: 'info' }, 'about data after loading');
    assert.strictEqual(aboutRoute.isActive, true, 'about is active');

    assert.strictEqual(await router.load('secret'), true, 'router.load(\'secret\')');
    await tasksSettled();
    assert.html.textContent(host, 'secret', 'secret rendered');
    assert.deepStrictEqual(routes.map(x => x.id), ['', 'about'], 'nav:false from the component removes the entry once loaded');

    await au.stop(true);
  });

  it('navigates by component type when an unrelated lazy chunk fails #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'bro-ken', template: 'broken' })
    class Broken { }

    const chunkError = new Error('failed to load chunk');
    let brokenCalls = 0;

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'broken', component: lazyFactory(() => { ++brokenCalls; return Promise.reject(chunkError); }) },
        { path: 'admin', component: lazyFactory(() => Promise.resolve({ default: Admin })) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.strictEqual(await router.load(Admin), true, 'router.load(Admin)');
    await tasksSettled();
    assert.html.textContent(host, 'admin', 'admin rendered');
    assert.strictEqual(brokenCalls, 1, 'broken factory call count');

    // the type is not found in any loaded route, so the chunk failure is what the caller sees
    let error: unknown = null;
    try {
      await router.load(Broken);
    } catch (e) {
      error = e;
    }
    assert.strictEqual(error, chunkError, 'router.load(Broken) rejects with the chunk error');
    assert.strictEqual(brokenCalls, 2, 'broken factory is retried');
    assert.html.textContent(host, 'admin', 'admin still rendered');

    await au.stop(true);
  });

  it('observes mixed sibling factory failures while discovering another component type', async function () {
    @customElement({ name: 'report-page', template: 'reports' })
    class Reports { }

    const asyncError = new Error('async chunk failure');
    const syncError = new Error('sync factory failure');
    const calls: string[] = [];
    @route({
      routes: [
        { path: '', component: Home },
        { path: 'async-failure', component: lazyFactory(() => { calls.push('async'); return Promise.reject(asyncError); }) },
        { path: 'sync-failure', component: lazyFactory(() => { calls.push('sync'); throw syncError; }) },
        { path: 'reports', component: lazyFactory(() => { calls.push('reports'); return Reports; }) },
      ],
    })
    @customElement({ name: 'mixed-lazy-root', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);
    try {
      assert.deepStrictEqual(calls, [], 'startup leaves all factories untouched');
      const unhandled = await collectUnhandledRejections(async () => {
        // A later synchronous throw must not abandon the earlier rejected
        // promise or prevent discovery of the requested component.
        assert.strictEqual(await router.load(Reports), true);
        await tasksSettled();
      });
      assert.deepStrictEqual(calls, ['async', 'sync', 'reports']);
      assert.deepStrictEqual(unhandled, []);
      assert.html.textContent(host, 'reports');
    } finally {
      await au.stop(true);
    }
  });

  it('shares a pending factory between overlapping component-type path requests', async function () {
    @customElement({ name: 'report-page', template: 'reports' })
    class Reports { }

    const chunk = deferred<{ default: typeof Reports }>();
    let calls = 0;
    @route({
      routes: [
        { path: '', component: Home },
        { path: 'reports', component: lazyFactory(() => { ++calls; return chunk.promise; }) },
      ],
    })
    @customElement({ name: 'shared-lazy-root', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);
    try {
      assert.strictEqual(calls, 0);
      // Unlike queued navigations, these public path requests overlap while
      // the module is unresolved and must share the same factory invocation.
      const first = router.generatePath(Reports);
      const second = router.generatePath(Reports);
      assert.instanceOf(first, Promise);
      assert.instanceOf(second, Promise);
      assert.strictEqual(calls, 1);
      chunk.resolve({ default: Reports });
      assert.deepStrictEqual(await Promise.all([first, second]), ['reports', 'reports']);
      assert.html.textContent(host, 'home', 'path generation does not navigate');

      assert.strictEqual(await router.load('reports'), true);
      await tasksSettled();
      assert.html.textContent(host, 'reports');
      assert.strictEqual(calls, 1, 'navigation reuses the already loaded route');
    } finally {
      chunk.resolve({ default: Reports });
      await au.stop(true);
    }
  });

  it('supports synchronous component factories #2553', async function () {
    @customElement({ name: 'ab-out', template: 'about' })
    class About { }

    let aboutCalls = 0;
    const about = () => { ++aboutCalls; return About; };

    @route({
      routes: [
        { path: ['', 'home'], component: Home },
        { path: 'about', component: lazyFactory(about) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container } = await start({ appRoot: Root });
    const router = container.get(IRouter);

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(aboutCalls, 0, 'about factory called at startup');

    assert.strictEqual(await router.load('about'), true, 'router.load(\'about\')');
    assert.html.textContent(host, 'about', 'about rendered');
    assert.strictEqual(aboutCalls, 1, 'about factory call count');

    await router.load('home');
    assert.strictEqual(await router.load('about'), true, 'second navigation');
    assert.html.textContent(host, 'about', 'about rendered again');
    assert.strictEqual(aboutCalls, 1, 'about factory call count after repeated navigation');

    await au.stop(true);
  });

  it('loads all lazy routes eagerly when useEagerLoading is true #2553', async function () {
    @customElement({ name: 'ad-min', template: 'admin' })
    class Admin { }
    @customElement({ name: 'rep-orts', template: 'reports' })
    class Reports { }

    let adminCalls = 0;
    let reportsCalls = 0;
    const admin = () => { ++adminCalls; return Promise.resolve({ default: Admin }); };
    const reports = () => { ++reportsCalls; return Promise.resolve({ default: Reports }); };

    @route({
      routes: [
        { path: '', component: Home },
        { path: 'admin', component: lazyFactory(admin) },
        { path: 'reports', component: lazyFactory(reports) },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au } = await start({ appRoot: Root, useEagerLoading: true });

    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 1, 'admin factory called at startup');
    assert.strictEqual(reportsCalls, 1, 'reports factory called at startup');

    await au.stop(true);
  });
});

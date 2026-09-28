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

  it('renders a load attribute bound to a lazy component type without loading it #2553', async function () {
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

    // binding the link must not throw nor invoke the factory; the component type is only known after loading
    assert.html.textContent(host, 'home', 'init');
    assert.strictEqual(adminCalls, 0, 'admin factory called while rendering the link');

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

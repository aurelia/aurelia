import { LogLevel, LoggerConfiguration, Registration } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import { Aurelia, customElement, IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { ILocationManager, IRouter, route, RouterConfiguration, ServerLocationManager } from '@aurelia/router';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('router/url-location.spec.ts', function () {
  for (const repeatedBase of [false, true]) {
    for (const mode of ['browser-path', 'browser-hash', 'server-path'] as const) {
      it(`${mode}: startup preserves a route ${repeatedBase ? 'beginning with the deployment name' : 'outside the deployment-name collision'}`, async function () {
        const initial = mode === 'browser-hash'
          ? `/app/#/${repeatedBase ? 'app/' : ''}items`
          : `/app/${repeatedBase ? 'app/' : ''}items`;
        const fixture = createFixture(initial, mode);
        try {
          await fixture.au.start();
          assert.html.textContent(fixture.host, repeatedBase ? 'app-items' : 'items');
        } finally {
          await fixture.au.stop(true);
        }
      });
    }

    for (const useHash of [false, true]) {
      it(`${useHash ? 'hashchange' : 'popstate'} uses the same route identity as a direct entry (${repeatedBase ? 'repeated base' : 'control'})`, async function () {
        const mode = useHash ? 'browser-hash' : 'browser-path';
        const fixture = createFixture(useHash ? '/app/#/' : '/app/', mode);
        try {
          await fixture.au.start();
          fixture.history.pushState({}, '', `https://example.test/app/${useHash ? '#/' : ''}${repeatedBase ? 'app/' : ''}items`);
          // Exercise the location manager's real event ingress. Only browser history is substituted.
          fixture.container.get(ILocationManager).handleEvent(useHash
            ? new fixture.ctx.wnd.HashChangeEvent('hashchange')
            : new fixture.ctx.wnd.PopStateEvent('popstate', { state: null }));
          await tasksSettled();
          assert.html.textContent(fixture.host, repeatedBase ? 'app-items' : 'items');
        } finally {
          await fixture.au.stop(true);
        }
      });
    }
  }

  it('retains public base-qualified load input as a compatibility control', async function () {
    const fixture = createFixture('/app/', 'browser-path');
    try {
      await fixture.au.start();
      await fixture.container.get(IRouter).load('/app/app/items');
      assert.html.textContent(fixture.host, 'app-items');
    } finally {
      await fixture.au.stop(true);
    }
  });

  for (const useHash of [false, true]) {
    it(`restores a page's earlier query after browser Back (${useHash ? 'hash' : 'path'})`, async function () {
      const fixture = createFixture(useHash ? '/app/#/' : '/app/', useHash ? 'browser-hash' : 'browser-path');
      try {
        await fixture.au.start();
        const router = fixture.container.get(IRouter);
        // Pagination/filter state can change without changing the route's component.
        await router.load('items', { queryParams: { page: '1' }, historyStrategy: 'push' });
        await router.load('items', { queryParams: { page: '2' }, historyStrategy: 'push' });
        assert.strictEqual(router.routeTree.queryParams.get('page'), '2', 'API navigation control');
        fixture.history.back();
        fixture.container.get(ILocationManager).handleEvent(useHash
          ? new fixture.ctx.wnd.HashChangeEvent('hashchange')
          : new fixture.ctx.wnd.PopStateEvent('popstate', { state: fixture.history.state }));
        await tasksSettled();
        assert.strictEqual(router.routeTree.queryParams.get('page'), '1', 'restored browser URL owns the query');
      } finally {
        await fixture.au.stop(true);
      }
    });
  }
});

function createFixture(initial: string, mode: 'browser-path' | 'browser-hash' | 'server-path') {
  @customElement({ name: 'location-home', template: '' })
  class Home {}
  @customElement({ name: 'location-items', template: 'items' })
  class Items {}
  @customElement({ name: 'location-app-items', template: 'app-items' })
  class AppItems {}
  @route({ routes: [
    { path: '', component: Home },
    { path: 'items', component: Items },
    { path: 'app/items', component: AppItems },
  ] })
  @customElement({ name: 'location-root', template: '<au-viewport></au-viewport>' })
  class Root {}

  const ctx = TestContext.create();
  const { container } = ctx;
  const history = new MockBrowserHistoryLocation();
  history.replaceState({}, '', new URL(initial, 'https://example.test').href);
  // URL supplies the browser's field boundaries; the stock mock loses information in nested hashes.
  const location = {
    get pathname() { return new URL(history.path).pathname; },
    get search() { return new URL(history.path).search; },
    get hash() { return new URL(history.path).hash; },
  };
  container.register(
    LoggerConfiguration.create({ level: LogLevel.fatal }),
    Registration.instance(IWindow, {
      document: { baseURI: 'https://example.test/app/' },
      addEventListener: ctx.wnd.addEventListener.bind(ctx.wnd),
      removeEventListener: ctx.wnd.removeEventListener.bind(ctx.wnd),
    }),
    Registration.instance(IHistory, history),
    Registration.instance(ILocation, location),
    RouterConfiguration.customize({ basePath: '/app/', useUrlFragmentHash: mode === 'browser-hash', historyStrategy: 'replace' }),
  );
  if (mode === 'server-path') {
    container.register(Registration.instance(ILocationManager, new ServerLocationManager(initial, '/app/')));
  }
  const host = ctx.createElement('div');
  const au = new Aurelia(container).app({ component: Root, host });
  return { au, host, container, history, ctx };
}

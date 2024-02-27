import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.redirect.spec.ts', function () {
  function getModifiedRouter(container: IContainer) {
    const router = container.get(IRouter) as IRouter;
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
    router.viewer.history = mockBrowserHistoryLocation as any;
    router.viewer.location = mockBrowserHistoryLocation as any;
    return router;
  }

  type NavigationStateCallback = (type: 'push' | 'replace', data: any, title: string, path: string) => void;
  function spyNavigationStates(router: IRouter, spy: NavigationStateCallback) {
    let _pushState;
    let _replaceState;
    if (spy) {
      _pushState = router.viewer.location.pushState;
      router.viewer.location.pushState = function (data, title, path) {
        spy('push', data, title, path);
        _pushState.call(router.viewer.location, data, title, path);
      };
      _replaceState = router.viewer.location.replaceState;
      router.viewer.location.replaceState = function (data, title, path) {
        spy('replace', data, title, path);
        _replaceState.call(router.viewer.location, data, title, path);
      };
    }
    return { _pushState, _replaceState };
  }
  function unspyNavigationStates(router, _push, _replace) {
    if (_push) {
      router.viewer.location.pushState = _push;
      router.viewer.location.replaceState = _replace;
    }
  }

  async function $setup(config?: IRouterOptions, dependencies: any[] = [], routes: IRoute[] = [], stateSpy: NavigationStateCallback = void 0) {
    const ctx = TestContext.create();

    const { container, platform } = ctx;

    const App = CustomElement.define({
      name: 'app',
      template: '<au-viewport name="app"></au-viewport>',
      dependencies
    }, class {
      public static routes: IRoute[] = routes;
    });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);

    const au = new Aurelia(container)
      .register(
        RouterConfiguration.customize(config ?? {}),
        App)
      .app({ host: host, component: App });

    const router = getModifiedRouter(container);
    const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

    await au.start();

    async function $teardown() {
      unspyNavigationStates(router, _pushState, _replaceState);
      RouterConfiguration.customize();
      await au.stop(true);
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    return { ctx, container, platform, host, au, router, $teardown, App };
  }

  this.timeout(30000);

  const routes = [
    { path: ['', 'home'], component: 'defaultpage' },
    { path: 'route-zero', component: 'zero' },
    { path: 'route-one', component: 'one' },
    { path: 'route-two', component: 'two' },
    { id: 'zero-id', path: 'route-zero-id', component: 'zero' },
  ];

  const DefaultPage = CustomElement.define({ name: 'defaultpage', template: '!root!' });
  const Zero = CustomElement.define({ name: 'zero', template: '!zero!' });
  const One = CustomElement.define({ name: 'one', template: '!one!<au-viewport name="one-vp"></au-viewport>' });
  const Two = CustomElement.define({ name: 'two', template: '!two!', }, class { public canLoad() { return 'route-zero'; } });
  const Three = CustomElement.define({ name: 'three', template: '!three!', }, class { public canLoad() { return 'zero'; } });
  const Four = CustomElement.define({ name: 'four', template: '!four!', }, class { public canLoad() { return 'zero-id'; } });

  const tests = [
    { load: '/', result: '!root!', path: '/', },
    { load: '/home', result: '!root!', path: '/home', },
    { load: '/route-two', result: '!zero!', path: '/route-zero', },
    { load: '/route-one/route-two', result: '!one!!zero!', path: '/route-one/route-zero', },
    { load: '/route-one/route-one/route-two', result: '!one!!one!!zero!', path: '/route-one/route-one/route-zero', },

    { load: '/route-two/route-one', result: '!zero!', path: '/route-zero', },
    { load: '/route-one/route-two/route-one', result: '!one!!zero!', path: '/route-one/route-zero', },
    { load: '/route-one/route-one/route-two/route-one', result: '!one!!one!!zero!', path: '/route-one/route-one/route-zero', },

    { load: '/three', result: '!zero!', path: '/zero', },
    { load: '/route-one/three', result: '!one!!zero!', path: '/route-one/zero', },
    { load: '/route-one/route-one/three', result: '!one!!one!!zero!', path: '/route-one/route-one/zero', },

    { load: '/three/route-one', result: '!zero!', path: '/zero', },
    { load: '/route-one/three/route-one', result: '!one!!zero!', path: '/route-one/zero', },
    { load: '/route-one/route-one/three/route-one', result: '!one!!one!!zero!', path: '/route-one/route-one/zero', },

    { load: '/route-two', result: '!zero!', path: '/route-zero', },
    { load: '/one/route-two', result: '!one!!zero!', path: '/one/route-zero', },
    { load: '/one/one/route-two', result: '!one!!one!!zero!', path: '/one/one/route-zero', },

    { load: '/route-two/one', result: '!zero!', path: '/route-zero', },
    { load: '/one/route-two/one', result: '!one!!zero!', path: '/one/route-zero', },
    { load: '/one/one/route-two/one', result: '!one!!one!!zero!', path: '/one/one/route-zero', },

    { load: '/three', result: '!zero!', path: '/zero', },
    { load: '/one/three', result: '!one!!zero!', path: '/one/zero', },
    { load: '/one/one/three', result: '!one!!one!!zero!', path: '/one/one/zero', },

    { load: '/three/one', result: '!zero!', path: '/zero', },
    { load: '/one/three/one', result: '!one!!zero!', path: '/one/zero', },
    { load: '/one/one/three/one', result: '!one!!one!!zero!', path: '/one/one/zero', },

    { load: '/four', result: '!zero!', path: '/route-zero-id', },
    { load: '/route-one/four', result: '!one!!zero!', path: '/route-one/route-zero-id', },
    { load: '/route-one/one/four', result: '!one!!one!!zero!', path: '/route-one/one/route-zero-id', },

    { load: '/four/one', result: '!zero!', path: '/route-zero-id', },
    { load: '/route-one/four/one', result: '!one!!zero!', path: '/route-one/route-zero-id', },
    { load: '/route-one/one/four/one', result: '!one!!one!!zero!', path: '/route-one/one/route-zero-id', },
  ];

  const routerConfigs: IRouterOptions[] = [
    {
      useUrlFragmentHash: true,
    },
    {
      useUrlFragmentHash: false,
    }
  ];

  for (const routerConfig of routerConfigs) {
    describe(`with router config ${JSON.stringify(routerConfig)}`, function () {
      let locationPath: string;
      const locationCallback = (type, data, title, path) => {
        if (routerConfig.useUrlFragmentHash) {
          locationPath = path.replace('#', '');
        } else {
          locationPath = path;
        }
        for (const start of ['blank', '/context.html', '/debug.html']) {
          if (locationPath.startsWith(start)) {
            locationPath = locationPath.slice(start.length);
          }
        }
        // if (routerConfig.useUrlFragmentHash) {
        //   locationPath = path.replace('#', '');
        // } else if (path.startsWith('blank/')) {
        //   locationPath = path.slice(5);
        // } else if (path.startsWith('/context.html/')) {
        //   locationPath = path.slice(13);
        // } else {
        //   locationPath = path;
        // }
      };
      for (const test of tests) {
        it(`to route in canLoad (${test.load})`, async function () {
          const { platform, host, router, $teardown } = await $setup(routerConfig, [DefaultPage, Zero, One, Two, Three, Four], routes, locationCallback);

          // 0) Default root page
          assert.strictEqual(host.textContent, '!root!', '0) root default page');
          assert.strictEqual(locationPath, '/', '0) root path');

          // 1) The default root page will be loaded at the beginning, so we do "minus" to clear the page/content.
          await $load('-', router, platform);
          // await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, '', `1) ${test.load} -`);
          assert.strictEqual(locationPath, '/', `1) ${test.load} - path`);

          // 2) Load the wanted page
          await $load(test.load, router, platform);
          // await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, test.result, `2) ${test.load}`);
          assert.strictEqual(locationPath, test.path, `2) ${test.load} path`);

          // 3) Unload
          await $load('-', router, platform);
          // await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, '', `3) ${test.load} -`);
          assert.strictEqual(locationPath, '/', `3) ${test.load} - path`);

          // 4) reload
          await $load(test.load, router, platform);
          // await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, test.result, `4) ${test.load}`);
          assert.strictEqual(locationPath, test.path, `4) ${test.load} path`);

          // 5. back to (3) empty
          await $goBack(router, platform);
          assert.strictEqual(host.textContent, '', `5) back to empty content (-)`);
          assert.strictEqual(locationPath, '/', `5) back to empty page (-)`);
          // 6. back to (2) the page
          await $goBack(router, platform);
          assert.strictEqual(host.textContent, test.result, `6) back to ${test.load} content`);
          assert.strictEqual(locationPath, test.path, `6) back to ${test.load} path`);
          // 7. back to (1) empty
          await $goBack(router, platform);
          assert.strictEqual(host.textContent, '', `7) back to empty content (-)`);
          assert.strictEqual(locationPath, '/', `7) back to empty page (-)`);
          // 8. back to the root page (0)
          await $goBack(router, platform);
          assert.strictEqual(host.textContent, '!root!', '8) back to root default content');
          assert.strictEqual(locationPath, '/', '8) back to root default path');

          await $teardown();
        });
      }
    });
  }
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

const $goBack = async (router: IRouter, platform: IPlatform) => {
  await router.viewer.history.back();
  platform.domWriteQueue.flush();
  await platform.domWriteQueue.yield();
};

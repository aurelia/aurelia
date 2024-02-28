import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('router/router.fast-switch.spec.ts', function () {
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

  async function $setup(
    config?: IRouterOptions,
    dependencies: any[] = [],
    routes: IRoute[] = [],
    stateSpy: NavigationStateCallback = void 0,
  ) {
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

  describe('no duplicate content', function () {
    this.timeout(30000);

    const routes = [
      { path: ['', 'home'], component: 'defaultpage' },
      { path: 'route-one', component: 'one' },
      { path: 'route-two', component: 'two' },
    ];

    const DefaultPage = CustomElement.define({ name: 'defaultpage', template: '!root!' }, class {
      async loading() {
        return new Promise(resolve => setTimeout(resolve, 20));
      }
    });
    const One = CustomElement.define({ name: 'one', template: '!one!' }, class {
      async loading() {
        return new Promise(resolve => setTimeout(resolve, 20));
      }
    });
    const Two = CustomElement.define({ name: 'two', template: '!two!', }, class {
      async loading() {
        return new Promise(resolve => setTimeout(resolve, 20));
      }
    });

    const routerConfigs: IRouterOptions[] = [
      {
        useUrlFragmentHash: true,
      },
      {
        useUrlFragmentHash: false,
      }
    ];

    for (const routerConfig of routerConfigs) {
      it(`Ensure no duplication with load (${JSON.stringify(routerConfig)})`, async function () {
        const { platform, host, router, $teardown } = await $setup(routerConfig, [DefaultPage, One, Two], routes);

        try {
          // 0) Default root page
          assert.strictEqual(host.textContent, '!root!', '0) root default page');

          // 2) Go to one
          await $load('/route-one', router, platform);
          await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, '!one!', `2) /route-one`);

          // 3) Go to two
          await $load('/route-two', router, platform);
          await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, '!two!', `3) /route-two -`);

          // 4) Ok, let's flood
          const proms: Promise<boolean | void>[] = [];
          for (let i = 0; i < 10; i++) {
            proms.push(router.load('/route-one').catch(console.log));
            proms.push(router.load('/route-two').catch(console.log));
          }
          await Promise.all(proms);

          while ((router as any).isProcessingNav) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          assert.ok(host.textContent === '!one!' || host.textContent === '!two!', `${host.textContent} != !one! or !two!`);
        } finally {
          await $teardown();
        }

      });

      it(`Ensure no duplication with back/forward (${JSON.stringify(routerConfig)})`, async function () {
        const { platform, host, router, $teardown } = await $setup(routerConfig, [DefaultPage, One, Two], routes);

        try {
          // 0) Default root page
          assert.strictEqual(host.textContent, '!root!', '0) root default page');

          // 2) Go to one
          await $load('/route-one', router, platform);
          await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, '!one!', `2) /route-one`);

          // 3) Go to two
          await $load('/route-two', router, platform);
          await platform.domWriteQueue.yield();
          assert.strictEqual(host.textContent, '!two!', `3) /route-two -`);

          for (let i = 0; i < 98; i++) {
            if (i % 2 === 0) {
              await $goBack(router);
              await $goBack(router);
            } else {
              await $goForward(router);
              await $goForward(router);
            }
          }
          await $goForward(router);
          await $goForward(router);

          while ((router as any).isProcessingNav) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          assert.ok(host.textContent === '!one!' || host.textContent === '!two!', `${host.textContent} != !one! or !two!`);
        } finally {
          await $teardown();
        }
      });
    }
  });
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

const $goBack = async (router: IRouter, platform?: IPlatform) => {
  await router.viewer.history.back();
  if (platform) {
    platform.domWriteQueue.flush();
    await platform.domWriteQueue.yield();
  }
};

const $goForward = async (router: IRouter, platform?: IPlatform) => {
  await router.viewer.history.forward();
  if (platform) {
    platform.domWriteQueue.flush();
    await platform.domWriteQueue.yield();
  }
};

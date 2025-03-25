import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.link-click-defaults.spec.ts', function () {
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

  const GrandChild = CustomElement.define({
    name: 'grandchild',
    template: '!grandchild!',
  }, class GrandChild {
    loading() {
      return new Promise((resolve) => {
        setTimeout(() => resolve(0), 100);
      });
    }
  });

  const Child = CustomElement.define({
    name: 'child',
    template: '!child!<au-viewport></au-viewport>',
  }, class Child {
    static routes: IRoute[] = [
      {
        path: '',
        component: Promise.resolve({ GrandChild }),
      },
      {
        path: 'grandchild',
        component: Promise.resolve({ GrandChild }),
      },
    ];
  });

  const Parent = CustomElement.define({
    name: 'parent',
    template: '!parent!<au-viewport></au-viewport>',
  }, class Parent {
    static routes: IRoute[] = [
      {
        path: 'child',
        component: Promise.resolve({ Child }),
      },
    ];
  });

  const tests = [
    { load: '/parent/child', result: '!parent!!child!!grandchild!', },
  ];

  const Nav = CustomElement.define({
    name: 'nav', template: `
    <style>.active { background-color: gold; }</style>

    ${tests.map(test => `<a load="${test.load}">${test.load}).</a>`).join('\n')}

    <au-viewport name="nav-vp"></au-viewport>
  `,
  }, class Nav {
    static routes: IRoute[] = [
      {
        path: 'parent',
        component: Promise.resolve({ Parent }),
      },
    ];
  });

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`can load all components, including defaults, for link "${test.load}"`, async function () {
      const { platform, host, router, $teardown } = await $setup({}, [Nav, Parent, Child, GrandChild]);

      await $load('/nav', router, platform);
      await platform.domQueue.yield();

      const links = host.getElementsByTagName('A') as unknown as HTMLElement[];
      const link = links[i];
      link.click();
      await platform.domQueue.yield();

      await new Promise((resolve) => { setTimeout(() => resolve(0), 200); });

      assert.includes(host.textContent, test.result, test.load);
      for (const l of links) {
        assert.strictEqual(l.classList.contains('active'), l === link, `${l.innerText}: ${l.classList.contains('active')}`);
      }

      await $teardown();
    });
  }
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domQueue.flush();
};

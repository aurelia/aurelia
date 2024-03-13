import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.viewport-scope.spec.ts', function () {
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

  this.timeout(5000);

  const part = '<au-viewport-scope><a load="my-one">One</a><a load="my-two">Two</a>:<au-viewport default="my-zero"></au-viewport></au-viewport-scope>';
  const Siblings = CustomElement.define({ name: 'my-siblings', template: `!my-siblings!${part}|${part}` }, class { });
  const Zero = CustomElement.define({ name: 'my-zero', template: '!my-zero!' }, class { });
  const One = CustomElement.define({ name: 'my-one', template: '!my-one!' }, class { });
  const Two = CustomElement.define({ name: 'my-two', template: '!my-two!' }, class { });

  const appDependencies = [Siblings, Zero, One, Two];

  // let locationPath: string;
  // let browserTitle: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const locationCallback = (type, data, title, path) => {
    // console.log(type, data, title, path);
    // locationPath = path;
    // browserTitle = title;
  };

  const tests = [
    { anchor: 0, result: '!my-siblings!OneTwo:!my-one!|OneTwo:', url: 'my-siblings/my-one', title: '', name: 'first my-one' },
    { anchor: 1, result: '!my-siblings!OneTwo:!my-two!|OneTwo:', url: 'my-siblings/my-two', title: '', name: 'first my-two' },
    { anchor: 2, result: '!my-siblings!OneTwo:|OneTwo:!my-one!', url: 'my-siblings/my-two', title: '', name: 'second my-one' },
    { anchor: 3, result: '!my-siblings!OneTwo:|OneTwo:!my-two!', url: 'my-siblings/my-two', title: '', name: 'second my-two' },
  ];

  for (let j = 0; j < tests.length; j++) {
    const test = tests[j];
    // eslint-disable-next-line mocha/no-skipped-tests
    it.skip(`to load sibling routes ${test.name}`, async function () {
      const { platform, host, router, $teardown } = await $setup({}, appDependencies, [], locationCallback);

      await $load('/my-siblings', router, platform);
      await platform.domWriteQueue.yield();

      (host.getElementsByTagName('A')[test.anchor] as HTMLElement).click();
      await platform.domWriteQueue.yield();

      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      // // assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
      // // assert.strictEqual(browserTitle, test.title, 'browser.title');

      await $teardown();
    });
  }
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

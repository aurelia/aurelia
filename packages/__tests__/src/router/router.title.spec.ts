import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, ITitleOptions, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.title.spec.ts', function () {
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

  const Parent = CustomElement.define({ name: 'my-parent', template: '!my-parent!<au-viewport name="parent"></au-viewport>' }, class {
    public static title: string = 'TheParent';
    public static routes: IRoute[] = [
      { path: 'child-config', instructions: [{ component: 'my-child', viewport: 'parent' }], title: 'TheChildConfig' },
    ];
  });
  const Parent2 = CustomElement.define({ name: 'my-parent2', template: '!my-parent2!<au-viewport name="parent2"></au-viewport>' }, class {
    public static routes: IRoute[] = [
      { path: 'child-config', instructions: [{ component: 'my-child', viewport: 'parent2' }], title: 'TheChildConfig' },
    ];
  });
  const Child = CustomElement.define({ name: 'my-child', template: `!my-child\${param ? ":" + param : ""}!<au-viewport name="child"></au-viewport>` }, class {
    public static title = (vm) => `TheChild${vm.param !== void 0 ? `(${vm.param})` : ''}`;
    public param: string;
    public loading(params) {
      if (params.id !== void 0) {
        this.param = params.id;
      }
    }
  });
  const Child2 = CustomElement.define({ name: 'my-child2', template: `!my-child2\${param ? ":" + param : ""}!<au-viewport name="child2"></au-viewport>` }, class {
    public static parameters: string[] = ['id'];
    public static title = (vm) => `TheChild2${vm.param !== void 0 ? `(${vm.param})` : ''}`;
    public param: string;
    public loading(params) {
      if (params.id !== void 0) {
        this.param = params.id;
      }
    }
  });

  const titleConfigs: (ITitleOptions | string)[] = [
    `\${componentTitles}\${appTitleSeparator}Aurelia2`,
    { appTitle: `Test\${appTitleSeparator}\${componentTitles}`, appTitleSeparator: ' : ', componentTitleOrder: 'top-down', componentTitleSeparator: ' + ', useComponentNames: true },
    { componentTitleOrder: 'bottom-up', componentTitleSeparator: ' < ', useComponentNames: true, componentPrefix: 'my-' },
    { useComponentNames: false },
    { transformTitle: (title, instruction) => title.length === 0 ? '' : instruction.route == null ? `C:${title}` : `R:${title}` },
    { useComponentNames: false, transformTitle: (title, instruction) => title.length === 0 ? '' : instruction.route == null ? `C:${title}` : `R:${title}` },
  ];

  const tests = [
    { path: '/parent-config', result: '!my-parent!', url: 'parent-config', },
    { path: '/my-parent2@default', result: '!my-parent2!', url: 'my-parent2', },

    { path: '/parent-config/child-config', result: '!my-parent!!my-child!', url: 'parent-config/child-config', },
    { path: '/my-parent2@default/my-child2@parent2', result: '!my-parent2!!my-child2!', url: 'my-parent2/my-child2', },

    { path: '/parent-config/my-child2@parent', result: '!my-parent!!my-child2!', url: 'parent-config/my-child2@parent', }, // Specific config
    { path: '/my-parent2@default/child-config', result: '!my-parent2!!my-child!', url: 'my-parent2/child-config', },

    { path: '/parent-config/abc', result: '!my-parent!!my-child:abc!', url: 'parent-config/abc', },
    { path: '/my-parent2@default/my-child2(abc)@parent2', result: '!my-parent2!!my-child2:abc!', url: 'my-parent2/my-child2(abc)', },
  ];

  const titles = [
    [
      'TheParentConfig | Aurelia2',
      'My parent2 | Aurelia2',

      'TheParentConfigChildConfig | Aurelia2',
      'My parent2 > TheChild2 | Aurelia2',

      'TheParentConfigChild2@ParentConfig | Aurelia2',
      'My parent2 > TheChildConfig | Aurelia2',

      'TheParentConfig(abc)Config | Aurelia2',
      'My parent2 > TheChild2(abc) | Aurelia2',
    ],
    [
      'Test : TheParentConfig',
      'Test : My parent2',

      'Test : TheParentConfigChildConfig',
      'Test : My parent2 + TheChild2',

      'Test : TheParentConfigChild2@ParentConfig',
      'Test : My parent2 + TheChildConfig',

      'Test : TheParentConfig(abc)Config',
      'Test : My parent2 + TheChild2(abc)',
    ],
    [
      'TheParentConfig | Aurelia',
      'Parent2 | Aurelia',

      'TheParentConfigChildConfig | Aurelia',
      'TheChild2 < Parent2 | Aurelia',

      'TheParentConfigChild2@ParentConfig | Aurelia',
      'TheChildConfig < Parent2 | Aurelia',

      'TheParentConfig(abc)Config | Aurelia',
      'TheChild2(abc) < Parent2 | Aurelia',
    ],
    [
      'TheParentConfig | Aurelia',
      'Aurelia',

      'TheParentConfigChildConfig | Aurelia',
      'TheChild2 | Aurelia',

      'TheParentConfigChild2@ParentConfig | Aurelia',
      'TheChildConfig | Aurelia',

      'TheParentConfig(abc)Config | Aurelia',
      'TheChild2(abc) | Aurelia',
    ],
    [
      'R:TheParentConfig | Aurelia',
      'C:My parent2 | Aurelia',

      'R:TheParentConfigChildConfig | Aurelia',
      'C:My parent2 > C:TheChild2 | Aurelia',

      'R:TheParentConfigChild2@ParentConfig | Aurelia',
      'C:My parent2 > R:TheChildConfig | Aurelia',

      'R:TheParentConfig(abc)Config | Aurelia',
      'C:My parent2 > C:TheChild2(abc) | Aurelia',
    ],
    [
      'R:TheParentConfig | Aurelia',
      'Aurelia',

      'R:TheParentConfigChildConfig | Aurelia',
      'C:TheChild2 | Aurelia',

      'R:TheParentConfigChild2@ParentConfig | Aurelia',
      'R:TheChildConfig | Aurelia',

      'R:TheParentConfig(abc)Config | Aurelia',
      'C:TheChild2(abc) | Aurelia',
    ],
  ];

  const appDependencies = [Parent, Parent2, Child, Child2];
  const appRoutes: IRoute[] = [
    { path: 'parent-config', component: 'my-parent', viewport: 'default', title: 'TheParentConfig' },
    { path: 'parent-config/:id', instructions: [{ component: 'my-parent', viewport: 'default', children: [{ component: 'my-child', viewport: 'parent' }] }], title: (instruction) => `TheParentConfig(${instruction.parameters.get(instruction.scope.router, 'id') ?? ':id'})Config` },
    { path: 'parent-config/child-config', instructions: [{ component: 'my-parent', viewport: 'default', children: [{ component: 'my-child', viewport: 'parent' }] }], title: 'TheParentConfigChildConfig' },
    { path: 'parent-config/child2', instructions: [{ component: 'my-parent', viewport: 'default', children: [{ component: 'my-child2', viewport: 'parent' }] }], title: 'TheParentConfigChild2Config' },
    { path: 'parent-config/my-child2@parent', instructions: [{ component: 'my-parent', viewport: 'default', children: [{ component: 'my-child2', viewport: 'parent' }] }], title: 'TheParentConfigChild2@ParentConfig' },
  ];

  let locationPath: string;
  let browserTitle: string;
  const locationCallback = (type, data, title, path) => {
    // console.log(type, data, title, path);
    locationPath = path;
    browserTitle = title;
  };
  for (let i = 0; i < titleConfigs.length; i++) {
    const config = titleConfigs[i];
    for (let j = 0; j < tests.length; j++) {
      const test = tests[j];
      it(`to load route ${test.path} (${JSON.stringify(config)}) => ${test.url}, "${titles[i][j]}"`, async function () {
        const { platform, host, router, $teardown } = await $setup({ title: config }, appDependencies, appRoutes, locationCallback);

        await $load(test.path, router, platform);
        assert.strictEqual(host.textContent, test.result, `host.textContent`);
        assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
        assert.strictEqual(browserTitle, titles[i][j], 'browser.title');

        await $teardown();
      });
    }
  }
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

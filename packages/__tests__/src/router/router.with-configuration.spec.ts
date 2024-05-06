import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, RouterConfiguration, RoutingInstruction } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.with-configuration.spec.ts', function () {
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

  function $removeViewport(instructions) {
    if (Array.isArray(instructions)) {
      for (const instruction of instructions) {
        instruction.viewport = null;
        instruction.viewportName = null;
        if (Array.isArray(instruction.nextScopeInstructions)) {
          $removeViewport(instruction.nextScopeInstructions);
        }
      }
    }
  }

  const Parent = CustomElement.define({ name: 'parent', template: '!parent!<au-viewport name="parent"></au-viewport>' }, class {
    public static routes: IRoute[] = [
      { path: 'child-config', instructions: [{ component: 'child', viewport: 'parent' }], title: 'ChildConfig' },
    ];
  });
  const Parent2 = CustomElement.define({ name: 'parent2', template: '!parent2!<au-viewport name="parent2"></au-viewport>' }, class {
    public static routes: IRoute[] = [
      { path: 'child-config', instructions: [{ component: 'child', viewport: 'parent2' }], title: 'ChildConfig' },
      // { path: ':id', instructions: [{ component: 'child', viewport: 'parent' }] },
    ];
  });
  const Child = CustomElement.define({ name: 'child', template: `!child\${param ? ":" + param : ""}!<au-viewport name="child"></au-viewport>` }, class {
    public static routes: IRoute[] = [
      { path: 'grandchild-config', instructions: [{ component: 'grandchild', viewport: 'child' }], title: 'GrandchildConfig' },
    ];
    public param: string;
    public loading(params) {
      if (params.id !== void 0) {
        this.param = params.id;
      }
    }
  });
  const Child2 = CustomElement.define({ name: 'child2', template: `!child2\${param ? ":" + param : ""}!<au-viewport name="child2"></au-viewport>` }, class {
    public static routes: IRoute[] = [
      { path: 'grandchild-config', instructions: [{ component: 'grandchild', viewport: 'child2' }], title: 'GrandchildConfig' },
    ];
    public static parameters = ['id'];
    public static title = (vm: InstanceType<typeof Child2>) => vm.param !== void 0 ? vm.param : 'Child2';
    public param: string;
    public loading(params) {
      if (params.id !== void 0) {
        this.param = params.id;
      }
    }
  });

  const Grandchild = CustomElement.define({ name: 'grandchild', template: '!grandchild!' });
  const Grandchild2 = CustomElement.define({ name: 'grandchild2', template: '!grandchild2!' }, class { public static title: string = 'TheGrandchild2'; });

  const tests = [
    { path: '/parent-config', result: '!parent!', url: 'parent-config', title: 'ParentConfig | Aurelia' },
    { path: '/parent2@default', result: '!parent2!', url: 'parent2', title: 'Parent2 | Aurelia' },

    { path: '/parent-config/child-config', result: '!parent!!child!', url: 'parent-config/child-config', title: 'ParentConfigChildConfig | Aurelia' },
    { path: '/parent2@default/child2@parent2', result: '!parent2!!child2!', url: 'parent2/child2', title: 'Parent2 > Child2 | Aurelia' },

    { path: '/parent-config/child2@parent', result: '!parent!!child2!', url: 'parent-config/child2@parent', title: 'ParentConfigChild2@ParentConfig | Aurelia' }, // Specific config
    { path: '/parent2@default/child-config', result: '!parent2!!child!', url: 'parent2/child-config', title: 'Parent2 > ChildConfig | Aurelia' },

    { path: '/parent-config/child-config/grandchild-config', result: '!parent!!child!!grandchild!', url: 'parent-config/child-config/grandchild-config', title: 'ParentConfigChildConfig > GrandchildConfig | Aurelia' },
    { path: '/parent2@default/child2@parent2/grandchild2@child2', result: '!parent2!!child2!!grandchild2!', url: 'parent2/child2/grandchild2', title: 'Parent2 > Child2 > TheGrandchild2 | Aurelia' },

    { path: '/parent-config/child-config/grandchild2@child', result: '!parent!!child!!grandchild2!', url: 'parent-config/child-config/grandchild2', title: 'ParentConfigChildConfig > TheGrandchild2 | Aurelia' },
    { path: '/parent2@default/child2@parent2/grandchild-config', result: '!parent2!!child2!!grandchild!', url: 'parent2/child2/grandchild-config', title: 'Parent2 > Child2 > GrandchildConfig | Aurelia' },

    { path: '/parent-config/child2@parent/grandchild-config', result: '!parent!!child2!!grandchild!', url: 'parent-config/child2@parent/grandchild-config', title: 'ParentConfigChild2@ParentConfig > GrandchildConfig | Aurelia' }, // Specific config
    { path: '/parent2@default/child-config/grandchild2@child', result: '!parent2!!child!!grandchild2!', url: 'parent2/child-config/grandchild2', title: 'Parent2 > ChildConfig > TheGrandchild2 | Aurelia' },

    { path: '/parent-config/child2@parent/grandchild2@child2', result: '!parent!!child2!!grandchild2!', url: 'parent-config/child2@parent/grandchild2', title: 'ParentConfigChild2@ParentConfig > TheGrandchild2 | Aurelia' }, // Specific config
    { path: '/parent2@default/child-config/grandchild-config', result: '!parent2!!child!!grandchild!', url: 'parent2/child-config/grandchild-config', title: 'Parent2 > ChildConfig > GrandchildConfig | Aurelia' },

    { path: '/parent-config/abc', result: '!parent!!child:abc!', url: 'parent-config/abc', title: 'ParentConfigabcConfig | Aurelia' },
    { path: '/parent2@default/child2(abc)@parent2', result: '!parent2!!child2:abc!', url: 'parent2/child2(abc)', title: 'Parent2 > abc | Aurelia' },

    // { path: '/parent-config/child2(abc)@parent', result: '!parent!!child2:abc!' },
    // { path: '/parent2@default/abc', result: '!parent2!!child:abc!' },

    { path: '/parent-config/abc/grandchild-config', result: '!parent!!child:abc!!grandchild!', url: 'parent-config/abc/grandchild-config', title: 'ParentConfigabcConfig > GrandchildConfig | Aurelia' },
    { path: '/parent2@default/child2(abc)@parent2/grandchild2@child2', result: '!parent2!!child2:abc!!grandchild2!', url: 'parent2/child2(abc)/grandchild2', title: 'Parent2 > abc > TheGrandchild2 | Aurelia' },

    { path: '/parent-config/abc/grandchild2@child', result: '!parent!!child:abc!!grandchild2!', url: 'parent-config/abc/grandchild2', title: 'ParentConfigabcConfig > TheGrandchild2 | Aurelia' },
    { path: '/parent2@default/child2(abc)@parent2/grandchild-config', result: '!parent2!!child2:abc!!grandchild!', url: 'parent2/child2(abc)/grandchild-config', title: 'Parent2 > abc > GrandchildConfig | Aurelia' },

    // { path: '/parent-config/child2(abc)@parent/grandchild-config', result: '!parent!!child2:abc!!grandchild!' },
    // { path: '/parent2@default/abc/grandchild2@child', result: '!parent2!!child:abc!!grandchild2!' },

    // { path: '/parent-config/child2(abc)@parent/grandchild2@child2', result: '!parent!!child2:abc!!grandchild2!' },
    // { path: '/parent2@default/abc/grandchild-config', result: '!parent2!!child:abc!!grandchild!' },
  ];
  const appDependencies = [Parent, Parent2, Child, Child2, Grandchild, Grandchild2];
  const appRoutes: IRoute[] = [
    { path: 'parent-config', component: 'parent', viewport: 'default', title: 'ParentConfig' },
    { path: 'parent-config/:id', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child', viewport: 'parent' }] }], title: (instruction: RoutingInstruction) => `ParentConfig${instruction.parameters.get(instruction.scope.router, 'id') ?? ':id'}Config` },
    { path: 'parent-config/child-config', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child', viewport: 'parent' }] }], title: 'ParentConfigChildConfig' },
    { path: 'parent-config/child2', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent' }] }], title: 'ParentConfigChild2Config' },
    { path: 'parent-config/child2@parent', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent' }] }], title: 'ParentConfigChild2@ParentConfig' },
    // { path: 'parent-config/child2(abc)', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent', parameters: { id: '$id' } }] }] },
    // { path: 'parent-config/child2(abc)@parent', instructions: [{ component: 'parent', viewport: 'default', children: [{ component: 'child2', viewport: 'parent', parameters: { id: '$id' } }] }] },
  ];

  let locationPath: string;
  let browserTitle: string;
  const locationCallback = (type, data, title, path) => {
    // console.log(type, data, title, path);
    locationPath = path;
    browserTitle = title;
  };
  for (const test of tests) {
    it(`to load route ${test.path} => ${test.url}`, async function () {
      const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

      await $load(test.path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
      assert.strictEqual(browserTitle, test.title, 'browser.title');

      await $teardown();
    });
  }
  it(`to load above routes in sequence`, async function () {
    const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

    for (const test of tests) {
      await $load(test.path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
      assert.strictEqual(browserTitle, test.title, 'browser.title');
    }
    await $teardown();
  });

  for (const test of tests) {
    const path = test.path.replace(/@\w+/g, '');
    const url = test.url.replace(/@\w+/g, '');
    const title = test.title.replace(/@Parent/g, '');
    it(`to load route ${path} => ${url}`, async function () {
      const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

      await $load(path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${url}`, 'location.path');
      assert.strictEqual(browserTitle, title, 'browser.title');

      await $teardown();
    });
  }
  it(`to load above routes in sequence`, async function () {
    const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

    for (const test of tests) {
      const path = test.path.replace(/@\w+/g, '');
      const url = test.url.replace(/@\w+/g, '');
      const title = test.title.replace(/@Parent/g, '');
      await $load(path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${url}`, 'location.path');
      assert.strictEqual(browserTitle, title, 'browser.title');
    }
    await $teardown();
  });

  let removedViewports = false;
  for (const test of tests) {
    it(`to load route (without viewports) ${test.path} => ${test.url}`, async function () {
      const { platform, host, router, $teardown, App } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

      if (!removedViewports) {
        removedViewports = true;
        for (const type of [App, Parent, Parent2, Child, Child2]) {
          for (const route of type.routes) {
            $removeViewport(route.instructions);
          }
        }
      }

      await $load(test.path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
      assert.strictEqual(browserTitle, test.title, 'browser.title');

      await $teardown();
    });
  }

  it(`to load above routes (without viewports) in sequence`, async function () {
    const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

    for (const test of tests) {
      await $load(test.path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
      assert.strictEqual(browserTitle, test.title, 'browser.title');
    }
    await $teardown();
  });

  for (const test of tests) {
    const path = test.path.replace(/@\w+/g, '');
    const url = test.url.replace(/@\w+/g, '');
    const title = test.title.replace(/@Parent/g, '');
    it(`to load route (without viewports) ${path} => ${url}`, async function () {
      const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

      await $load(path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${url}`, 'location.path');
      assert.strictEqual(browserTitle, title, 'browser.title');

      await $teardown();
    });
  }
  it(`to load above routes (without viewports) in sequence`, async function () {
    const { platform, host, router, $teardown } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

    for (const test of tests) {
      const path = test.path.replace(/@\w+/g, '');
      const url = test.url.replace(/@\w+/g, '');
      const title = test.title.replace(/@Parent/g, '');
      await $load(path, router, platform);
      assert.strictEqual(host.textContent, test.result, `host.textContent`);
      assert.strictEqual(locationPath, `#/${url}`, 'location.path');
      assert.strictEqual(browserTitle, title, 'browser.title');
    }
    await $teardown();
  });
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

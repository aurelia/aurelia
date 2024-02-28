import { IContainer } from '@aurelia/kernel';
import { IRouter, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.fallback.spec.ts', function () {
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

  this.timeout(5000);

  async function $setup(App, config?, stateSpy?) {
    const ctx = TestContext.create();

    const { container, platform } = ctx;

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
      await au.stop(true);
      ctx.doc.body.removeChild(host);

      au.dispose();
    }

    return { ctx, container, platform, host, au, router, $teardown };
  }

  const configs = [
    { fallbackAction: 'process-children' },
    { fallbackAction: 'abort' }
  ];
  const fallbackActions = [
    '',
    'process-children',
    'abort'
  ];

  for (const config of configs) {
    for (const fallbackAction of fallbackActions) {
      const names = ['parent', 'child', 'grandchild'];
      const dependencies = [];
      for (let i = 0, ii = names.length; i < ii; i++) {
        const name = names[i];
        const fallback = i < ii - 1 ? names[i + 1] : null;
        const viewport = fallback ? `<au-viewport name="${name}" fallback="${fallback}" ${fallbackAction.length ? `fallback-action="${fallbackAction}"` : ''}></au-viewport>` : '';
        const template = `!${name}\${param ? ":" + param : ""}!${viewport}`;
        dependencies.push(CustomElement.define({ name, template }, class {
          public static parameters = ['id'];
          public param: string;
          public loading(params) {
            if (params.id !== void 0) {
              this.param = params.id;
            }
          }
        }));
      }

      const App = CustomElement.define({
        name: 'app',
        template: `<au-viewport fallback="parent"  ${fallbackAction.length ? `fallback-action="${fallbackAction}"` : ''}></au-viewport>`,
        dependencies
      });

      const tests = (fallbackAction === 'abort' || (fallbackAction === '' && config.fallbackAction === 'abort'))
        ? [
          { path: 'parent(a)@default', result: '!parent:a!', url: 'a' },
          { path: 'b@default', result: '!parent:b@default!', url: 'b@default' },
          { path: 'parent(c)@default/child(d)@parent', result: '!parent:c!!child:d!', url: 'c/d' },
          { path: 'e@default/f@parent', result: '!parent:e@default/f@parent!', url: 'e@default/f@parent' },
          { path: 'parent(g)@default/child(h)@parent/grandchild(i)@child', result: '!parent:g!!child:h!!grandchild:i!', url: 'g/h/i' },
          { path: 'j@default/k@parent/l@child', result: '!parent:j@default/k@parent/l@child!', url: 'j@default/k@parent/l@child' },
        ]
        : [
          { path: 'parent(a)@default', result: '!parent:a!', url: 'a' },
          { path: 'b@default', result: '!parent:b!', url: 'b' },
          { path: 'parent(c)@default/child(d)@parent', result: '!parent:c!!child:d!', url: 'c/d' },
          { path: 'e@default/f@parent', result: '!parent:e!!child:f!', url: 'e/f' },
          { path: 'parent(g)@default/child(h)@parent/grandchild(i)@child', result: '!parent:g!!child:h!!grandchild:i!', url: 'g/h/i' },
          { path: 'j@default/k@parent/l@child', result: '!parent:j!!child:k!!grandchild:l!', url: 'j/k/l' },
        ];

      for (const test of tests) {
        it(`to load route with fallback action "${fallbackAction}" ${test.path} => ${test.url}`, async function () {
          let locationPath: string;
          const { platform, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
            locationPath = path;
          });
          await $load(test.path, router, platform);
          assert.strictEqual(host.textContent, test.result, `host.textContent`);
          assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
          await $teardown();
        });
      }
      it(`to load above routes in sequence with fallback action "${fallbackAction}"`, async function () {
        let locationPath: string;
        const { platform, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
          locationPath = path;
        });
        for (const test of tests) {
          await $load(test.path, router, platform);
          assert.strictEqual(host.textContent, test.result, `host.textContent`);
          assert.strictEqual(locationPath, `#/${test.url}`, 'location.path');
        }
        await $teardown();
      });

      for (const test of tests) {
        const path = test.path.replace(/@\w+/g, '');
        const result = test.result.replace(/@\w+/g, '');
        const url = test.url.replace(/@\w+/g, '');
        it(`to load route with fallback action "${fallbackAction}" ${path} => ${url}`, async function () {
          let locationPath: string;
          const { platform, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
            locationPath = path;
          });
          await $load(path, router, platform);
          assert.strictEqual(host.textContent, result, `host.textContent`);
          assert.strictEqual(locationPath, `#/${url}`, 'location.path');
          await $teardown();
        });
      }

      it(`to load above routes in sequence with fallback action "${fallbackAction}"`, async function () {
        let locationPath: string;
        const { platform, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
          locationPath = path;
        });
        for (const test of tests) {
          const path = test.path.replace(/@\w+/g, '');
          const result = test.result.replace(/@\w+/g, '');
          const url = test.url.replace(/@\w+/g, '');
          await $load(path, router, platform);
          assert.strictEqual(host.textContent, result, `host.textContent`);
          assert.strictEqual(locationPath, `#/${url}`, 'location.path');
        }
        await $teardown();
      });
    }
  }
});

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

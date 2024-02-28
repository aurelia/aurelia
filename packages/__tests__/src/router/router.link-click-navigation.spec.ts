import { IContainer } from '@aurelia/kernel';
import { IRoute, IRouter, IRouterOptions, RouterConfiguration } from '@aurelia/router';
import { Aurelia, CustomElement, IPlatform } from '@aurelia/runtime-html';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('router/router.link-click-navigation.spec.ts', function () {
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
    { id: 'route-one', path: 'route-one', component: 'one-route' },
    { id: 'route-two', path: 'route-two/:id', component: 'two-route' },
    { id: 'zero-id', path: 'route-zero-id', component: 'zero' },
  ];

  const Nav = CustomElement.define({
    name: 'nav', template: `
    <style>.active { background-color: gold; }</style>

    <a load="one">one</a>
    <a load="two(123)">two(123)</a>
    <a load="two(456)">two(456)</a>
    <a load="route-one">route-one</a>
    <a load="route-two/123">route-two/123</a>
    <a load="route-two/456">route-two/456</a>

    <au-viewport name="nav-vp"></au-viewport>
  `,
  });

  const NavBind = CustomElement.define({
    name: 'nav-bind', template: `
    <style>.active { background-color: gold; }</style>

    <a load.bind="{ component: 'one' }">bind: { component: 'one' }</a>
    <a load.bind="{ component: 'two', parameters: { id: 123 }}">bind: { component: 'two', parameters: { id: 123 }}</a>
    <a load.bind="{ component: 'two', parameters: { id: 456 }}">bind: { component: 'two', parameters: { id: 456 }}</a>
    <a load.bind="{ id: 'route-one' }">bind: { id: 'route-one' }</a>
    <a load.bind="{ id: 'route-two', parameters: { id: 123 }}">bind: { id: 'route-two', parameters: { id: 123 }}</a>
    <a load.bind="{ id: 'route-two', parameters: { id: 456 }}">bind: { id: 'route-two', parameters: { id: 456 }}</a>

    <au-viewport name="nav-vp"></au-viewport>
  `,
  });

  const NavAttributes = CustomElement.define({
    name: 'nav-attributes', template: `
    <style>.active { background-color: gold; }</style>

    <a load="component: one">attributes: component: one</a>
    <a load="component: two; parameters.bind: { id: 123 };">attributes: component: two; parameters.bind: { id: 123 };</a>
    <a load="component: two; parameters.bind: { id: 456 };">attributes: component: two; parameters.bind: { id: 456 };</a>
    <a load="id: route-one">attributes: { id: route-one }</a>
    <a load="id: route-two; parameters.bind: { id: 123 };">attributes: id: route-two; parameters.bind: { id: 123 };</a>
    <a load="id: route-two; parameters.bind: { id: 456 };">attributes: id: route-two; parameters.bind: { id: 456 };</a>

    <au-viewport name="nav-vp"></au-viewport>
  `,
  });

  const One = CustomElement.define({ name: 'one', template: '!one!' });
  const Two = CustomElement.define({ name: 'two', template: '!two${id}!' }, class {
    public static parameters = ['id'];
    public id: string;
    public loading(params) { if (params.id != null) { this.id = `:${params.id}`; } }
  });
  const OneRoute = CustomElement.define({ name: 'one-route', template: '!one-route!' });
  const TwoRoute = CustomElement.define({ name: 'two-route', template: '!two-route${id}!' }, class {
    public static parameters = ['id'];
    public id: string;
    public loading(params) { if (params.id != null) { this.id = `:${params.id}`; } }
  });

  const tests = [
    { load: 'one', result: '!one!', },
    { load: 'two(123)', result: '!two:123!', },
    { load: 'two(456)', result: '!two:456!', },
    { load: 'route-one', result: '!one-route!', },
    { load: 'route-two/123', result: '!two-route:123!', },
    { load: 'route-two/456', result: '!two-route:456!', },
  ];

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    it(`for "${test.load}"`, async function () {
      const { platform, host, router, $teardown } = await $setup({}, [Nav, One, Two, OneRoute, TwoRoute], routes);

      await $load('/nav', router, platform);
      await platform.domWriteQueue.yield();

      const links = host.getElementsByTagName('A') as unknown as HTMLElement[];
      const link = links[i];
      link.click();
      await platform.domWriteQueue.yield();

      assert.includes(host.textContent, test.result, test.load);
      for (const l of links) {
        assert.strictEqual(l.classList.contains('active'), l === link, `${l.innerText}: ${l.classList.contains('active')}`);
      }

      await $teardown();
    });
  }

  const bindTests = [
    { load: 'bind: one', result: '!one!', },
    { load: 'bind: two(123)', result: '!two:123!', },
    { load: 'bind: two(456)', result: '!two:456!', },
    { load: 'bind: route-one', result: '!one-route!', },
    { load: 'bind: route-two/123', result: '!two-route:123!', },
    { load: 'bind: route-two/456', result: '!two-route:456!', },
  ];

  for (let i = 0; i < bindTests.length; i++) {
    const test = bindTests[i];
    it(`for "${test.load}"`, async function () {
      const { platform, host, router, $teardown } = await $setup({}, [NavBind, One, Two, OneRoute, TwoRoute], routes);

      await $load('/nav-bind', router, platform);
      await platform.domWriteQueue.yield();

      const links = host.getElementsByTagName('A') as unknown as HTMLElement[];
      const link = links[i];
      link.click();
      await platform.domWriteQueue.yield();

      assert.includes(host.textContent, test.result, test.load);
      for (const l of links) {
        assert.strictEqual(l.classList.contains('active'), l === link, `${l.innerText}: ${l.classList.contains('active')}`);
      }

      await $teardown();
    });
  }

  const attributesTests = [
    { load: 'attributes: one', result: '!one!', },
    { load: 'attributes: two(123)', result: '!two:123!', },
    { load: 'attributes: two(456)', result: '!two:456!', },
    { load: 'attributes: route-one', result: '!one-route!', },
    { load: 'attributes: route-two/123', result: '!two-route:123!', },
    { load: 'attributes: route-two/456', result: '!two-route:456!', },
  ];

  for (let i = 0; i < attributesTests.length; i++) {
    const test = attributesTests[i];
    it(`for "${test.load}"`, async function () {
      const { platform, host, router, $teardown } = await $setup({}, [NavAttributes, One, Two, OneRoute, TwoRoute], routes);

      await $load('/nav-attributes', router, platform);
      await platform.domWriteQueue.yield();

      const links = host.getElementsByTagName('A') as unknown as HTMLElement[];
      const link = links[i];
      link.click();
      await platform.domWriteQueue.yield();

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
  platform.domWriteQueue.flush();
};

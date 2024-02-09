import { IContainer } from '@aurelia/kernel';
import { IRouter, RouterConfiguration, IRoute, ITitleOptions, RoutingInstruction, routes, Viewport, IRouterOptions } from '@aurelia/router';
import { CustomElement, customElement, IPlatform, Aurelia, lifecycleHooks } from '@aurelia/runtime-html';
import { assert, MockBrowserHistoryLocation, TestContext } from '@aurelia/testing';

describe('router/router.spec.ts', function () {
  function getModifiedRouter(container: IContainer) {
    const router = container.get(IRouter) as IRouter;
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
    router.viewer.history = mockBrowserHistoryLocation as any;
    router.viewer.location = mockBrowserHistoryLocation as any;
    return router;
  }

  function spyNavigationStates(router: IRouter, spy) {
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

  async function createFixture(config?, App?, stateSpy?) {
    const ctx = TestContext.create();
    const { container, platform } = ctx;

    if (App === void 0) {
      App = CustomElement.define({ name: 'app', template: '<template>left<au-viewport name="left"></au-viewport>right<au-viewport name="right"></au-viewport></template>' });
    }
    const Foo = CustomElement.define({ name: 'foo', template: '<template>Viewport: foo <a href="baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' });
    const Bar = CustomElement.define({ name: 'bar', template: `<template>Viewport: bar Parameter id: [\${id}] Parameter name: [\${name}] <au-viewport name="bar"></au-viewport></template>` }, class {
      public static parameters = ['id', 'name'];
      public id = 'no id';
      public name = 'no name';

      // public static inject = [IRouter];
      // public constructor(private readonly router: IRouter) { }
      // public created() {
      //   console.log('created', 'closest viewport', this.router.getClosestViewport(this));
      // }
      // public canLoad() {
      //   console.log('canLoad', 'closest viewport', this.router.getClosestViewport(this));
      //   return true;
      // }
      public loading(params) {
        // console.log('load', 'closest viewport', this.router.getClosestViewport(this));
        if (params.id) { this.id = params.id; }
        if (params.name) { this.name = params.name; }
      }
      // public binding() {
      //   console.log('binding', 'closest viewport', this.router.getClosestViewport(this));
      // }
    });
    const Baz = CustomElement.define({ name: 'baz', template: `<template>Viewport: baz Parameter id: [\${id}] <au-viewport name="baz"></au-viewport></template>` }, class {
      public static parameters = ['id'];
      public id = 'no id';
      public loading(params) { if (params.id) { this.id = params.id; } }
    });
    const Qux = CustomElement.define({ name: 'qux', template: '<template>Viewport: qux<au-viewport name="qux"></au-viewport></template>' }, class {
      public canLoad() { return true; }
      public canUnload() {
        if (quxCantUnload > 0) {
          quxCantUnload--;
          return false;
        } else {
          return true;
        }
      }
      public loading() { return true; }
      public unloading() { return true; }
    });
    const Quux = CustomElement.define({ name: 'quux', template: '<template>Viewport: quux<au-viewport name="quux" scope></au-viewport></template>' });
    const Corge = CustomElement.define({ name: 'corge', template: '<template>Viewport: corge<au-viewport name="corge" used-by="baz"></au-viewport>Viewport: dummy<au-viewport name="dummy"></au-viewport></template>' });

    const Uier = CustomElement.define({ name: 'uier', template: '<template>Viewport: uier</template>' }, class {
      public async canLoad() {
        await wait(500);
        return true;
      }
    });

    const Grault = CustomElement.define(
      {
        name: 'grault', template: '<template><input type="checkbox" checked.two-way="toggle">toggle<div if.bind="toggle">Viewport: grault<au-viewport name="grault" stateful used-by="garply,corge" default="garply"></au-viewport></div></template>'
      },
      class {
        public toggle = false;
      });
    const Garply = CustomElement.define(
      {
        name: 'garply', template: '<template>garply<input checked.two-way="text">text</template>'
      },
      class {
        public text;
      });
    const Waldo = CustomElement.define(
      {
        name: 'waldo', template: '<template>Viewport: waldo<au-viewport name="waldo" stateful used-by="grault,foo" default="grault"></au-viewport></div></template>'
      },
      class { });
    const Plugh = CustomElement.define(
      {
        name: 'plugh', template: `<template>Parameter: \${param} Entry: \${entry}</template>`
      },
      class {
        public param: number;
        public entry: number = 0;
        public reloadBehavior: string = plughReloadBehavior;
        public loading(params) {
          console.log('plugh.load', this.entry, this.reloadBehavior, plughReloadBehavior);
          this.param = +params[0];
          this.entry++;
          this.reloadBehavior = plughReloadBehavior;
        }
      });

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host as any);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(
        RouterConfiguration.customize(config ?? {}),
        App)
      .app({ host: host, component: App });

    const router = getModifiedRouter(container);
    const { _pushState, _replaceState } = spyNavigationStates(router, stateSpy);

    container.register(Foo, Bar, Baz, Qux, Quux, Corge, Uier, Grault, Garply, Waldo, Plugh);

    await au.start();

    async function tearDown() {
      unspyNavigationStates(router, _pushState, _replaceState);
      await au.stop(true);
      ctx.doc.body.removeChild(host);
    }

    return { au, container, platform, host, router, ctx, tearDown };
  }

  async function $setup(config?: IRouterOptions, dependencies: any[] = [], routes: IRoute[] = [], stateSpy?) {
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

  it('can be created', async function () {
    this.timeout(5000);

    const { router, tearDown } = await createFixture();

    await tearDown();
  });

  it('loads viewports left and right', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    assert.includes(host.textContent, 'left', `host.textContent`);
    assert.includes(host.textContent, 'right', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo in left', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'foo', `host.textContent`);

    await tearDown();
  });

  it.skip('queues navigations', async function () {
    this.timeout(40000);

    const { platform, host, router, tearDown } = await createFixture();

    router.load('uier@left').catch((error) => { throw error; });
    const last = router.load('bar@left');
    // Depending on browser/node, there can be 1 or 2 in the queue here
    assert.notStrictEqual(router['navigator'].queued, 0, `router.navigator.queued`);
    await last;
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('clears viewport', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'foo', `host.textContent`);
    await $load('-@left', router, platform);
    assert.notIncludes(host.textContent, 'foo', `host.textContent`);

    await tearDown();
  });

  it('clears all viewports', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    await $load('bar@right', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    await $load('-', router, platform);
    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('replaces foo in left', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    const historyLength = router.viewer.history.length;
    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'foo', `host.textContent`);
    assert.strictEqual(router.viewer.history.length, historyLength + 1, `router.viewer.history.length, actual after foo: ${router.viewer.history.length}`);

    await router.load('bar@left', { replace: true });

    assert.includes(host.textContent, 'bar', `host.textContent`);
    assert.strictEqual(router.viewer.history.length, historyLength + 1, `router.viewer.history.length, actual after bar: ${router.viewer.history.length}`);

    await tearDown();
  });

  it('navigates to bar in right', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar@right', router, platform);
    assert.includes(host.textContent, 'bar', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $load('bar@right', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('reloads state when refresh method is called', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $load('bar@right', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.refresh();
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $load('bar@left', router, platform);
    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.back();

    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.forward();

    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates back and forward with two viewports', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await $load('bar@right', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.back();

    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await router.forward();

    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left+bar@right', router, platform);
    assert.includes(host.textContent, 'foo', `host.textContent`);
    assert.includes(host.textContent, 'bar', `host.textContent`);

    await tearDown();
  });

  it('cancels if not canUnload', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    quxCantUnload = 1;

    await $load('baz@left+qux@right', router, platform);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);

    await $load('foo@left+bar@right', router, platform);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);

    await tearDown();
  });

  it('cancels if not child canUnload', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    quxCantUnload = 1;

    await $load('foo@left/qux@foo+uier@right', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: uier', `host.textContent`);

    await $load('bar@left+baz@right', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: uier', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: baz', `host.textContent`);

    await tearDown();
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(15000);

    const { platform, host, router, tearDown } = await createFixture();

    // await $load('foo@left+bar@right+baz@foo+qux@bar', router, platform);
    await $load('foo@left/baz@foo+bar@right/qux@bar', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: qux', `host.textContent`);

    await tearDown();
  });

  it('handles anchor click', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture({ useHref: true });

    await $load('foo@left', router, platform);
    assert.includes(host.textContent, 'foo', `host.textContent`);

    (host.getElementsByTagName('SPAN')[0] as HTMLElement).parentElement.click();

    await platform.domWriteQueue.yield();

    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

    await tearDown();
  });

  it('handles anchor click with load', async function () {
    this.timeout(5000);

    const tests = [
      { bind: false, value: 'id-name(1)', result: 1 },
      { bind: true, value: "'id-name(2)'", result: 2 },
      { bind: true, value: "{ component: 'id-name', parameters: '3' }", result: 3 },
      { bind: true, value: "{ component: IdName, parameters: '4' }", result: 4 },
    ];

    const IdName = CustomElement.define({ name: 'id-name', template: `|id-name| Parameter id: [\${id}] Parameter name: [\${name}]` }, class {
      public static parameters = ['id', 'name'];
      public id = 'no id';
      public name = 'no name';
      public loading(params) {
        if (params.id) { this.id = params.id; }
        if (params.name) { this.name = params.name; }
      }
    });
    @routes([{ path: 'a-route-decorator', component: 'my-decorated-component' }])
    @customElement({
      name: 'app',
      dependencies: [IdName],
      template: `
      ${tests.map(test => `<a load${test.bind ? '.bind' : ''}="${test.value}">${test.value}</a>`).join('<br>')}
      <br>
      <au-viewport></au-viewport>
      `}) class App {
      // Wish the following two lines weren't necessary
      public constructor() { this['IdName'] = IdName; }
    }

    const { host, router, container, tearDown, platform } = await createFixture({ useHref: false }, App);

    container.register(IdName);

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];

      (host.getElementsByTagName('A')[i] as HTMLElement).click();

      await platform.domWriteQueue.yield();

      assert.includes(host.textContent, '|id-name|', `host.textContent`);
      assert.includes(host.textContent, `Parameter id: [${test.result}]`, `host.textContent`);

      await router.back();
      assert.notIncludes(host.textContent, '|id-name|', `host.textContent`);
    }

    await tearDown();
  });

  it('understands used-by', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('corge@left', router, platform);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

    await $load('corge@left/baz', router, platform);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

    await tearDown();
  });

  it('does not update fullStatePath on wrong history entry', async function () {
    this.timeout(40000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('foo@left', router, platform);
    await $load('bar@left', router, platform);
    await $load('baz@left', router, platform);

    await tearDown();
  });

  it('parses parameters after component', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar(123)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $load('bar(456)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await tearDown();
  });

  it('parses named parameters after component', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar(id=123)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $load('bar(id=456)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await tearDown();
  });

  it('parses parameters after component individually', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar(123)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $load('bar(456)@right', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    await tearDown();
  });

  it('parses parameters without viewport', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('corge@left/baz(123)', router, platform);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await tearDown();
  });

  it('parses named parameters without viewport', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('corge@left/baz(id=123)', router, platform);

    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await tearDown();
  });

  it('parses multiple parameters after component', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar(123,OneTwoThree)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', `host.textContent`);

    await $load('bar(456,FourFiveSix)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await tearDown();
  });

  it('parses multiple name parameters after component', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar(id=123,name=OneTwoThree)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [OneTwoThree]', `host.textContent`);

    await $load('bar(name=FourFiveSix,id=456)@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await tearDown();
  });

  it('parses querystring', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('bar@left?id=123', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [123]', `host.textContent`);

    await $load('bar@left?id=456&name=FourFiveSix', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    await tearDown();
  });

  it('overrides querystring with parameter', async function () {
    this.timeout(5000);

    let locationPath: string;
    let browserTitle: string;
    const locationCallback = (type, data, title, path) => {
      // console.log(type, data, title, path);
      locationPath = path;
      browserTitle = title;
    };

    const { platform, host, router, tearDown } = await createFixture(void 0, void 0, locationCallback);

    let url = 'bar(456)@left?id=123';
    await $load(url, router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);

    url = 'bar(456,FourFiveSix)@left?id=123&name=OneTwoThree';
    await $load(url, router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [456]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [FourFiveSix]', `host.textContent`);

    url = 'bar(name=SevenEightNine,id=789)@left?id=123&name=OneTwoThree';
    await $load(url, router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.includes(host.textContent, 'Parameter id: [789]', `host.textContent`);
    assert.includes(host.textContent, 'Parameter name: [SevenEightNine]', `host.textContent`);

    await tearDown();
  });

  it('uses default reload behavior', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('plugh(123)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

    await $load('plugh(123)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

    await $load('plugh(456)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

    await $load('plugh(456)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

    await tearDown();
  });

  it('uses overriding reload behavior', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    plughReloadBehavior = 'default';
    // This should default
    await $load('plugh(123)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

    let component = (router.getEndpoint('Viewport', 'left') as Viewport).getContent().componentInstance;
    component.reloadBehavior = 'reload';
    // This should reload
    await $load('plugh(123)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 2', `host.textContent`);

    component.reloadBehavior = 'refresh';
    // This should refresh
    await $load('plugh(456)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);
    component = (router.getEndpoint('Viewport', 'left') as Viewport).getContent().componentInstance;

    component.reloadBehavior = 'default';
    // This should default
    await $load('plugh(456)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 456', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 1', `host.textContent`);

    component.reloadBehavior = 'reload';
    // This should reload
    await $load('plugh(123)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 2', `host.textContent`);

    component.reloadBehavior = 'disallow';
    // This should disallow
    await $load('plugh(456)@left', router, platform);
    assert.includes(host.textContent, 'Parameter: 123', `host.textContent`);
    assert.includes(host.textContent, 'Entry: 2', `host.textContent`);

    await tearDown();
  });

  it.skip('loads default when added by if condition becoming true', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('grault@left', router, platform);
    assert.includes(host.textContent, 'toggle', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();

    await platform.domWriteQueue.yield();

    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();

    await platform.domWriteQueue.yield();

    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();

    await platform.domWriteQueue.yield();

    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    await tearDown();
  });

  // if (PLATFORM.isBrowserLike) {
  // TODO: figure out why this works in nodejs locally but not in CI and fix it
  it.skip('keeps input when stateful', async function () {
    this.timeout(15000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('grault@left', router, platform);
    assert.includes(host.textContent, 'toggle', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();

    await platform.domWriteQueue.yield();

    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await platform.domWriteQueue.yield();

    // NOT going to work since it loads non-stateful parent grault
    await $load('grault@left/corge@grault', router, platform);

    assert.notIncludes(host.textContent, 'garply', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: corge', `host.textContent`);

    await $load('grault@left/garply@grault', router, platform);

    assert.notIncludes(host.textContent, 'Viewport: corge', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', `(host as any).getElementsByTagName('INPUT')[1].value`);

    await tearDown();
  });
  // }
  it.skip('keeps input when grandparent stateful', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('waldo@left', router, platform);
    assert.includes(host.textContent, 'Viewport: waldo', `host.textContent`);
    assert.includes(host.textContent, 'toggle', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.notIncludes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[0].click();

    await platform.domWriteQueue.yield();

    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    (host as any).getElementsByTagName('INPUT')[1].value = 'asdf';

    await $load('waldo@left/foo@waldo', router, platform);

    assert.notIncludes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);

    await $load('waldo@left/grault@waldo', router, platform);

    assert.notIncludes(host.textContent, 'Viewport: corge', `host.textContent`);
    assert.includes(host.textContent, 'Viewport: grault', `host.textContent`);
    assert.includes(host.textContent, 'garply', `host.textContent`);

    assert.strictEqual((host as any).getElementsByTagName('INPUT')[1].value, 'asdf', `(host as any).getElementsByTagName('INPUT')[1].value`);

    await tearDown();
  });

  it.skip('keeps children\'s custom element\'s input when navigation history stateful', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown, container } = await createFixture({ statefulHistoryLength: 2 });

    const GrandGrandChild = CustomElement.define({ name: 'grandgrandchild', template: '|grandgrandchild|<input>' }, null);
    const GrandChild = CustomElement.define({ name: 'grandchild', template: '|grandchild|<input> <grandgrandchild></grandgrandchild>', dependencies: [GrandGrandChild] }, null);
    const Child = CustomElement.define({ name: 'child', template: '|child|<input> <input type="checkbox" checked.bind="toggle"> <div if.bind="toggle"><input> <au-viewport name="child"></au-viewport></div>', dependencies: [GrandChild] }, class { public toggle = true; });
    const ChildSibling = CustomElement.define({ name: 'sibling', template: '|sibling|' }, null);
    const Parent = CustomElement.define({ name: 'parent', template: '<br><br>|parent|<input> <au-viewport name="parent"></au-viewport>', dependencies: [Child, ChildSibling] }, null);
    container.register(Parent);

    const values = ['parent', 'child', false, 'child-hidden', 'grandchild', 'grandgrandchild'];

    await $load('parent@left/child@parent/grandchild@child', router, platform);

    assert.includes(host.textContent, '|parent|', `host.textContent`);
    assert.includes(host.textContent, '|child|', `host.textContent`);
    assert.includes(host.textContent, '|grandchild|', `host.textContent`);
    assert.includes(host.textContent, '|grandgrandchild|', `host.textContent`);

    let inputs = host.getElementsByTagName('INPUT') as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < inputs.length; i++) {
      if (typeof values[i] === 'string') {
        inputs[i].value = values[i] as string;
      }
    }
    for (let i = 0; i < inputs.length; i++) {
      if (typeof values[i] === 'string') {
        assert.strictEqual(inputs[i].value, values[i], `host.getElementsByTagName('INPUT')[${i}].value`);
      }
    }

    await $load('parent@left/sibling@parent', router, platform);

    assert.includes(host.textContent, '|parent|', `host.textContent`);
    assert.includes(host.textContent, '|sibling|', `host.textContent`);
    assert.notIncludes(host.textContent, '|child|', `host.textContent`);
    assert.notIncludes(host.textContent, '|grandchild|', `host.textContent`);
    assert.notIncludes(host.textContent, '|grandgrandchild|', `host.textContent`);

    await router.back();

    assert.includes(host.textContent, '|parent|', `host.textContent`);
    assert.includes(host.textContent, '|child|', `host.textContent`);
    assert.includes(host.textContent, '|grandchild|', `host.textContent`);
    assert.includes(host.textContent, '|grandgrandchild|', `host.textContent`);
    assert.notIncludes(host.textContent, '|sibling|', `host.textContent`);

    inputs = inputs = host.getElementsByTagName('INPUT') as HTMLCollectionOf<HTMLInputElement>;
    for (let i = 0; i < inputs.length; i++) {
      if (typeof values[i] === 'string') {
        assert.strictEqual(inputs[i].value, values[i], `host.getElementsByTagName('INPUT')[${i}].value`);
      }
    }

    await tearDown();
  });

  // TODO: Fix scoped viewports!
  it.skip('loads scoped viewport', async function () {
    this.timeout(5000);

    const { platform, host, router, tearDown } = await createFixture();

    await $load('quux@left', router, platform);
    assert.includes(host.textContent, 'Viewport: quux', `host.textContent`);

    await $load('quux@quux!', router, platform);
    assert.includes(host.textContent, 'Viewport: quux', `host.textContent`);

    await $load('quux@left/foo@quux!', router, platform);
    assert.includes(host.textContent, 'Viewport: foo', `host.textContent`);

    (host.getElementsByTagName('SPAN')[0] as HTMLElement).click();

    await platform.domWriteQueue.yield();

    assert.includes(host.textContent, 'Viewport: baz', `host.textContent`);

    await $load('bar@left', router, platform);
    assert.includes(host.textContent, 'Viewport: bar', `host.textContent`);
    assert.notIncludes(host.textContent, 'Viewport: quux', `host.textContent`);

    await tearDown();
  });

  describe('local deps', function () {
    this.timeout(5000);

    async function $setup(dependencies: any[] = [], stateSpy?) {
      const ctx = TestContext.create();

      const { container, platform } = ctx;

      const App = CustomElement.define({ name: 'app', template: '<au-viewport></au-viewport>', dependencies }, null);

      const host = ctx.doc.createElement('div');
      ctx.doc.body.appendChild(host as any);
      const component = new App();

      const au = ctx.wnd['au'] = new Aurelia(container)
        .register(RouterConfiguration)
        .app({ host: host, component: App });

      const router = container.get(IRouter);
      const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
      mockBrowserHistoryLocation.changeCallback = async (ev) => { router.viewer.handlePopStateEvent(ev); };
      router.viewer.history = mockBrowserHistoryLocation as any;
      router.viewer.location = mockBrowserHistoryLocation as any;

      await au.start();

      async function $teardown() {
        await au.stop(true);
        ctx.doc.body.removeChild(host);

        au.dispose();
      }

      return { ctx, container, platform, host, component, au, router, $teardown };
    }

    it('verify that the test isn\'t broken', async function () {
      const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
      const Global = CustomElement.define({ name: 'global', template: 'global' }, null);
      const { platform, container, host, router, $teardown } = await $setup([Local]);

      container.register(Global);

      await $load('global', router, platform);

      assert.match(host.textContent, /.*global.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep', async function () {
      const Local = CustomElement.define({ name: 'local', template: 'local' }, null);
      const { platform, host, router, $teardown } = await $setup([Local]);

      await $load('local', router, platform);

      assert.match(host.textContent, /.*local.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - nested', async function () {
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2' }, class { });
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Local2] }, null);
      const { platform, host, router, $teardown } = await $setup([Local1]);

      await $load('local1/local2', router, platform);

      assert.match(host.textContent, /.*local1.*local2.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #1', async function () {
      const Global3 = CustomElement.define({ name: 'global3', template: 'global3' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="global3"></au-viewport>' }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { platform, host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global3);

      await $load('local1/local2/global3', router, platform);

      assert.match(host.textContent, /.*local1.*local2.*global3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #2', async function () {
      const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
      const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="global2"></au-viewport>' }, null);
      const { platform, host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global2);

      await $load('local1/global2/local3', router, platform);

      assert.match(host.textContent, /.*local1.*global2.*local3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #3', async function () {
      const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { platform, host, router, container, $teardown } = await $setup();
      container.register(Global1);

      await $load('global1/local2/local3', router, platform);

      assert.match(host.textContent, /.*global1.*local2.*local3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - double nested - case #4', async function () {
      const Local3 = CustomElement.define({ name: 'local3', template: 'local3' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two" used-by="local3"></au-viewport>', dependencies: [Local3] }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one" used-by="local2"></au-viewport>', dependencies: [Local2] }, null);
      const { platform, host, router, $teardown } = await $setup([Local1]);

      await $load('local1/local2/local3', router, platform);

      assert.match(host.textContent, /.*local1.*local2.*local3.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #1', async function () {
      const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
      const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { platform, host, router, $teardown } = await $setup([Local1, Local2]);

      await $load('local1@default/conflict@one', router, platform);

      assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

      await $load('local2@default/conflict@two', router, platform);

      assert.match(host.textContent, /.*local2.*conflict2.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #2', async function () {
      const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
      const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { platform, host, router, container, $teardown } = await $setup();
      container.register(Global1, Global2);

      await $load('global1@default/conflict@one', router, platform);

      assert.match(host.textContent, /.*global1.*conflict1.*/, `host.textContent`);

      await $load('global2@default/conflict@two', router, platform);

      assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

      await $teardown();
    });

    it('navigates to locally registered dep - conflicting scoped siblings - case #3', async function () {
      const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1' }, null);
      const Local1 = CustomElement.define({ name: 'local1', template: 'local1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
      const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2' }, null);
      const Global2 = CustomElement.define({ name: 'global2', template: 'global2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
      const { platform, host, router, container, $teardown } = await $setup([Local1]);
      container.register(Global2);

      await $load('local1@default/conflict@one', router, platform);

      assert.match(host.textContent, /.*local1.*conflict1.*/, `host.textContent`);

      await $load('global2@default/conflict@two', router, platform);

      assert.match(host.textContent, /.*global2.*conflict2.*/, `host.textContent`);

      await $teardown();
    });

    describe('navigates to locally registered dep recursively', function () {
      interface RouteSpec {
        segments: string[];
        texts: string[];
      }
      const routeSpecs: RouteSpec[] = [
        {
          segments: ['global1', 'conflict'],
          texts: ['global1', 'conflict1']
        },
        {
          // note: custom elements always have themselves registered in their own $context, so should be able to navigate to self without registering anywhere
          segments: ['global1', 'conflict', 'conflict'],
          texts: ['global1', 'conflict1', 'conflict1']
        },
        {
          segments: ['local2', 'conflict'],
          texts: ['local2', 'conflict2']
        },
        {
          segments: ['local2', 'conflict', 'conflict'],
          texts: ['local2', 'conflict2', 'conflict2']
        },
        {
          segments: ['local2', 'global1', 'conflict'],
          texts: ['local2', 'global1', 'conflict1']
        },
        {
          segments: ['local2', 'global1', 'conflict', 'conflict'],
          texts: ['local2', 'global1', 'conflict1', 'conflict1']
        },
        {
          segments: ['local2', 'local2', 'conflict', 'conflict'],
          texts: ['local2', 'local2', 'conflict2', 'conflict2']
        },
        {
          segments: ['local2', 'conflict', 'global1', 'conflict'],
          texts: ['local2', 'conflict2', 'global1', 'conflict1']
        },
        {
          segments: ['local2', 'conflict', 'local2', 'conflict'],
          texts: ['local2', 'conflict2', 'local2', 'conflict2']
        }
      ];

      for (const routeSpec of routeSpecs) {
        const { segments, texts } = routeSpec;
        const path = segments.join('/');
        const expectedText = new RegExp(`.*${texts.join('.*')}.*`);

        it(`path: ${path}, expectedText: ${expectedText}`, async function () {
          const Conflict1 = CustomElement.define({ name: 'conflict', template: 'conflict1<au-viewport></au-viewport>' }, null);
          const Global1 = CustomElement.define({ name: 'global1', template: 'global1<au-viewport name="one"></au-viewport>', dependencies: [Conflict1] }, null);
          const Conflict2 = CustomElement.define({ name: 'conflict', template: 'conflict2<au-viewport></au-viewport>' }, null);
          const Local2 = CustomElement.define({ name: 'local2', template: 'local2<au-viewport name="two"></au-viewport>', dependencies: [Conflict2] }, null);
          const { platform, host, router, container, $teardown } = await $setup([Local2]);
          container.register(Global1);

          await $load(path, router, platform);

          assert.match(host.textContent, expectedText, `host.textContent`);

          await $teardown();
        });
      }
    });
  });

  describe('can define fallback component', function () {
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

    const configs = [{ fallbackAction: 'process-children' }, { fallbackAction: 'abort' }];
    const fallbackActions = ['', 'process-children', 'abort'];
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
            const { platform, container, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
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
          const { platform, container, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
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
            const { platform, container, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
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
          const { platform, container, host, router, $teardown } = await $setup(App, config, (type, data, title, path) => {
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

  describe('can use configuration', function () {
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
      public static title = (vm) => vm.param !== void 0 ? vm.param : 'Child2';
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
      const { platform, host, router, $teardown, App } = await $setup(void 0, appDependencies, appRoutes, locationCallback);

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

  describe('can use title configuration', function () {
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

  describe('can use lifecycleHooks', function () {
    this.timeout(5000);

    function _elements(config, calledHooks) {
      @lifecycleHooks()
      class Hooks {
        name = 'Hooks';
        canLoad(vm) { calledHooks.push(`${this.name}:${vm.name}:canLoad`); return config.Hooks_canLoad; }
        loading(vm) { calledHooks.push(`${this.name}:${vm.name}:loading`); }
        canUnload(vm) { calledHooks.push(`${this.name}:${vm.name}:canUnload`); return config.Hooks_canUnload; }
        unloading(vm) { calledHooks.push(`${this.name}:${vm.name}:unloading`); }
      }

      const One = CustomElement.define({ name: 'my-one', template: '!my-one!<au-viewport></au-viewport>', dependencies: [Hooks] },
        class {
          name = 'my-one';
          canLoad() { calledHooks.push(`VM:${this.name}:canLoad`); return config.One_canLoad; }
          loading() { calledHooks.push(`VM:${this.name}:loading`); }
          canUnload() { calledHooks.push(`VM:${this.name}:canUnload`); return config.One_canUnload; }
          unloading() { calledHooks.push(`VM:${this.name}:unloading`); }
          binding() { calledHooks.push(`VM:${this.name}:binding`); }
        });
      const Two = CustomElement.define({ name: 'my-two', template: '!my-two!', dependencies: [Hooks] },
        class {
          name = 'my-two';
          canLoad() { calledHooks.push(`VM:${this.name}:canLoad`); return config.Two_canLoad; }
          loading() { calledHooks.push(`VM:${this.name}:loading`); }
          canUnload() { calledHooks.push(`VM:${this.name}:canUnload`); return config.Two_canUnload; }
          unloading() { calledHooks.push(`VM:${this.name}:unloading`); }
          binding() { calledHooks.push(`VM:${this.name}:binding`); }
        });
      return { Hooks, One, Two };
    }

    const configs = [
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: false, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: false, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: false, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: false, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: false, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: false },
    ];

    function _falses($config: typeof configs[0]) {
      const falses = [];
      for (const [key, value] of Object.entries($config)) {
        if (!value) {
          falses.push(key);
        }
      }
      return falses.join(', ');
    }

    for (const config of configs) {
      const calledHooks = [];
      const { Hooks, One, Two } = _elements(config, calledHooks);

      function _expected($config: typeof config) {
        let oneLoaded = false;
        let twoChecked = false;
        let twoLoaded = false;
        const expected = [];

        expected.push('Hooks:my-one:canLoad');
        if (!$config.Hooks_canLoad) {
          expected.push('Hooks:my-two:canLoad');
          return expected;
        }

        expected.push('VM:my-one:canLoad');
        if ($config.One_canLoad) {
          expected.push('Hooks:my-one:loading', 'VM:my-one:loading', 'VM:my-one:binding');
          oneLoaded = true;

          expected.push('Hooks:my-one:canUnload');

          if (!$config.Hooks_canUnload) {
            expected.push('Hooks:my-one:canUnload');
            return expected;
          }

          expected.push('VM:my-one:canUnload');
          if (!$config.One_canUnload) {
            expected.push('Hooks:my-one:canUnload');
            expected.push('VM:my-one:canUnload');
            return expected;
          }

          expected.push('Hooks:my-two:canLoad');
          if ($config.Hooks_canLoad) {

            expected.push('VM:my-two:canLoad');
            twoChecked = true;
            if ($config.Two_canLoad) {
              expected.push('Hooks:my-one:unloading', 'VM:my-one:unloading');
              // one = false;

              expected.push('Hooks:my-two:loading', 'VM:my-two:loading', 'VM:my-two:binding');
              twoLoaded = true;

              expected.push('Hooks:my-two:canUnload');
              if ($config.Hooks_canUnload) {
                expected.push('VM:my-two:canUnload');
                if ($config.Two_canUnload) {
                  expected.push('Hooks:my-two:unloading', 'VM:my-two:unloading');
                  // two = false;
                }
              }
            }
          }
        }

        if (!oneLoaded && !twoChecked) {
          expected.push('Hooks:my-two:canLoad');
          if ($config.Hooks_canLoad) {
            expected.push('VM:my-two:canLoad');
            if ($config.Two_canLoad) {
              expected.push('Hooks:my-two:loading', 'VM:my-two:loading', 'VM:my-two:binding');
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              twoLoaded = true;

              expected.push('Hooks:my-two:canUnload');
              if ($config.Hooks_canUnload) {
                expected.push('VM:my-two:canUnload');
                if ($config.Two_canUnload) {
                  expected.push('Hooks:my-two:unloading', 'VM:my-two:unloading');
                  // two = false;
                }
              }
            }
          }
        }

        return expected;
      }

      it(`with hook and vm (falses: ${_falses(config)})`, async function () {
        const { platform, router, $teardown } = await $setup({}, [Hooks, One, Two]);

        const expected = _expected(config);

        await $load('/my-one', router, platform);
        await platform.domWriteQueue.yield();

        await $load('/my-two', router, platform);
        await platform.domWriteQueue.yield();

        await $load('-', router, platform);
        await platform.domWriteQueue.yield();

        assert.strictEqual(calledHooks.join('|'), expected.join('|'), `calledHooks`);

        await $teardown();
      });
    }

    for (const config of configs) {
      const calledHooks = [];
      const { Hooks, One, Two } = _elements(config, calledHooks);

      function _expected(config) {
        const expected = ['Hooks:my-one:canLoad'];
        if (!config.Hooks_canLoad) return expected;
        expected.push('VM:my-one:canLoad');
        if (!config.One_canLoad) return expected;
        expected.push('Hooks:my-one:loading', 'VM:my-one:loading', 'VM:my-one:binding', 'Hooks:my-two:canLoad');
        if (!config.Hooks_canLoad) return expected;
        expected.push('VM:my-two:canLoad');
        if (!config.Two_canLoad) {
          expected.push('Hooks:my-one:canUnload', 'VM:my-one:canUnload', 'Hooks:my-one:unloading', 'VM:my-one:unloading');
          return expected;
        }
        expected.push('Hooks:my-two:loading', 'VM:my-two:loading', 'VM:my-two:binding');

        expected.push('Hooks:my-two:canUnload');
        if (!config.Hooks_canUnload) return expected;
        expected.push('VM:my-two:canUnload');
        if (!config.Two_canUnload) return expected;
        expected.push('Hooks:my-one:canUnload');
        if (!config.Hooks_canUnload) return expected;
        expected.push('VM:my-one:canUnload');
        if (!config.One_canUnload) return expected;
        expected.push('Hooks:my-two:unloading', 'VM:my-two:unloading', 'Hooks:my-one:unloading', 'VM:my-one:unloading');
        return expected;
      }

      it(`in parent-child with hook and vm (falses: ${_falses(config)})`, async function () {
        const { platform, router, $teardown } = await $setup({}, [Hooks, One, Two]);

        await $load('/my-one/my-two', router, platform);
        await platform.domWriteQueue.yield();

        await $load('-', router, platform);
        await platform.domWriteQueue.yield();

        const expected = _expected(config);

        assert.strictEqual(calledHooks.join('|'), expected.join('|'), `calledHooks`);

        await $teardown();
      });
    }
  });

  describe('can use async lifecycleHooks', function () {
    this.timeout(30000);

    function _elements(config, calledHooks) {
      @lifecycleHooks()
      class Hooks {
        public name = 'Hooks';
        public async canLoad(vm) { calledHooks.push(`${this.name}:${vm.name}:canLoad`); /* return config.Hooks_canLoad; */ return new Promise((res) => { setTimeout(() => res(config.Hooks_canLoad), 100); }); }
        public async loading(vm) { calledHooks.push(`${this.name}:${vm.name}:loading`); return new Promise((res) => { setTimeout(() => res(void 0), 75); }); }
        public async canUnload(vm) { calledHooks.push(`${this.name}:${vm.name}:canUnload`); /* return config.Hooks_canUnload; */ return new Promise((res) => { setTimeout(() => res(config.Hooks_canUnload), 100); }); }
        public async unloading(vm) { calledHooks.push(`${this.name}:${vm.name}:unloading`); return new Promise((res) => { setTimeout(() => res(void 0), 75); }); }

        // TODO: Put these in once core supports them
        // public binding(vm) { calledHooks.push(`${this.name}:${vm.name}:binding`); }
        // public bound(vm) { calledHooks.push(`${this.name}:${vm.name}:bound`); }
        // public attaching(vm) { calledHooks.push(`${this.name}:${vm.name}:attaching`); }
        // public attached(vm) { calledHooks.push(`${this.name}:${vm.name}:attached`); }
      }

      const One = CustomElement.define({ name: 'my-one', template: '!my-one!<au-viewport></au-viewport>', dependencies: [Hooks] },
        class {
          public name = 'my-one';
          public canLoad() { calledHooks.push(`VM:${this.name}:canLoad`); /* return config.One_canLoad; */ return new Promise((res) => { setTimeout(() => res(config.One_canLoad), 100); }); }
          public loading() { calledHooks.push(`VM:${this.name}:loading`); return new Promise((res) => { setTimeout(() => res(void 0), 50); }); }
          public canUnload() { calledHooks.push(`VM:${this.name}:canUnload`); /* return config.One_canUnload; */ return new Promise((res) => { setTimeout(() => res(config.One_canUnload), 100); }); }
          public unloading() { calledHooks.push(`VM:${this.name}:unloading`); return new Promise((res) => { setTimeout(() => res(void 0), 50); }); }
          public binding() { calledHooks.push(`VM:${this.name}:binding`); }
        });
      const Two = CustomElement.define({ name: 'my-two', template: '!my-two!', dependencies: [Hooks] },
        class {
          public name = 'my-two';
          public canLoad() { calledHooks.push(`VM:${this.name}:canLoad`); /* return config.Two_canLoad; */ return new Promise((res) => { setTimeout(() => res(config.Two_canLoad), 100); }); }
          public loading() { calledHooks.push(`VM:${this.name}:loading`); return new Promise((res) => { setTimeout(() => res(void 0), 50); }); }
          public canUnload() { calledHooks.push(`VM:${this.name}:canUnload`); /* return config.Two_canUnload; */ return new Promise((res) => { setTimeout(() => res(config.Two_canUnload), 100); }); }
          public unloading() { calledHooks.push(`VM:${this.name}:unloading`); return new Promise((res) => { setTimeout(() => res(void 0), 50); }); }
          public binding() { calledHooks.push(`VM:${this.name}:binding`); }
        });
      return { Hooks, One, Two };
    }

    const configs = [
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: false, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: false, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: false, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: false, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: false, Two_canLoad: true, Two_canUnload: true },
      { Hooks_canLoad: true, Hooks_canUnload: true, One_canLoad: true, One_canUnload: true, Two_canLoad: true, Two_canUnload: false },
    ];

    function _falses(config) {
      const falses = [];
      for (const [key, value] of Object.entries(config)) {
        if (!value) {
          falses.push(key);
        }
      }
      return falses.join(', ');
    }

    for (const config of configs) {
      const calledHooks = [];
      const { Hooks, One, Two } = _elements(config, calledHooks);

      function _expected(config) {
        let oneLoaded = false;
        let twoChecked = false;
        let twoLoaded = false;
        const expected = [];

        expected.push('Hooks:my-one:canLoad');
        if (!config.Hooks_canLoad) {
          expected.push('Hooks:my-two:canLoad');
          return expected;
        }

        expected.push('VM:my-one:canLoad');
        if (config.One_canLoad) {
          expected.push('Hooks:my-one:loading', 'VM:my-one:loading', 'VM:my-one:binding');
          oneLoaded = true;

          expected.push('Hooks:my-one:canUnload');

          if (!config.Hooks_canUnload) {
            expected.push('Hooks:my-one:canUnload');
            return expected;
          }

          expected.push('VM:my-one:canUnload');
          if (!config.One_canUnload) {
            expected.push('Hooks:my-one:canUnload');
            expected.push('VM:my-one:canUnload');
            return expected;
          }

          expected.push('Hooks:my-two:canLoad');
          if (config.Hooks_canLoad) {

            expected.push('VM:my-two:canLoad');
            twoChecked = true;
            if (config.Two_canLoad) {
              expected.push('Hooks:my-one:unloading', 'VM:my-one:unloading');
              // one = false;

              expected.push('Hooks:my-two:loading', 'VM:my-two:loading', 'VM:my-two:binding');
              twoLoaded = true;

              expected.push('Hooks:my-two:canUnload');
              if (config.Hooks_canUnload) {
                expected.push('VM:my-two:canUnload');
                if (config.Two_canUnload) {
                  expected.push('Hooks:my-two:unloading', 'VM:my-two:unloading');
                  // two = false;
                }
              }
            }
          }
        }

        if (!oneLoaded && !twoChecked) {
          expected.push('Hooks:my-two:canLoad');
          if (config.Hooks_canLoad) {
            expected.push('VM:my-two:canLoad');
            if (config.Two_canLoad) {
              expected.push('Hooks:my-two:loading', 'VM:my-two:loading', 'VM:my-two:binding');
              twoLoaded = true;

              expected.push('Hooks:my-two:canUnload');
              if (config.Hooks_canUnload) {
                expected.push('VM:my-two:canUnload');
                if (config.Two_canUnload) {
                  expected.push('Hooks:my-two:unloading', 'VM:my-two:unloading');
                  // two = false;
                }
              }
            }
          }
        }

        return expected;
      }
      it(`with hook and vm (falses: ${_falses(config)})`, async function () {
        const { platform, host, router, $teardown } = await $setup({}, [Hooks, One, Two]);

        const expected = _expected(config);

        await $load('/my-one', router, platform);
        await platform.domWriteQueue.yield();

        await $load('/my-two', router, platform);
        await platform.domWriteQueue.yield();

        await $load('-', router, platform);
        await platform.domWriteQueue.yield();

        assert.strictEqual(calledHooks.join('|'), expected.join('|'), `calledHooks`);

        await $teardown();
      });
    }

    for (const config of configs) {
      const calledHooks = [];
      const { Hooks, One, Two } = _elements(config, calledHooks);

      function _expected(config) {
        const expected = ['Hooks:my-one:canLoad'];
        if (!config.Hooks_canLoad) return expected;
        expected.push('VM:my-one:canLoad');
        if (!config.One_canLoad) return expected;
        expected.push('Hooks:my-one:loading', 'VM:my-one:loading', 'VM:my-one:binding', 'Hooks:my-two:canLoad');
        if (!config.Hooks_canLoad) return expected;
        expected.push('VM:my-two:canLoad');
        if (!config.Two_canLoad) {
          expected.push('Hooks:my-one:canUnload', 'VM:my-one:canUnload', 'Hooks:my-one:unloading', 'VM:my-one:unloading');
          return expected;
        }
        expected.push('Hooks:my-two:loading', 'VM:my-two:loading', 'VM:my-two:binding');

        expected.push('Hooks:my-two:canUnload');
        if (!config.Hooks_canUnload) return expected;
        expected.push('VM:my-two:canUnload');
        if (!config.Two_canUnload) return expected;
        expected.push('Hooks:my-one:canUnload');
        if (!config.Hooks_canUnload) return expected;
        expected.push('VM:my-one:canUnload');
        if (!config.One_canUnload) return expected;
        expected.push('Hooks:my-two:unloading', 'VM:my-two:unloading', 'Hooks:my-one:unloading', 'VM:my-one:unloading');
        return expected;
      }

      it(`in parent-child with hook and vm (falses: ${_falses(config)})`, async function () {
        const { platform, host, router, $teardown } = await $setup({}, [Hooks, One, Two]);

        await $load('/my-one/my-two', router, platform);
        await platform.domWriteQueue.yield();

        await $load('-', router, platform);
        await platform.domWriteQueue.yield();

        const expected = _expected(config);

        assert.strictEqual(calledHooks.join('|'), expected.join('|'), `calledHooks`);

        await $teardown();
      });
    }
  });
  describe('can redirect', function () {
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
            await platform.domWriteQueue.yield();
            assert.strictEqual(host.textContent, '', `1) ${test.load} -`);
            assert.strictEqual(locationPath, '/', `1) ${test.load} - path`);

            // 2) Load the wanted page
            await $load(test.load, router, platform);
            await platform.domWriteQueue.yield();
            assert.strictEqual(host.textContent, test.result, `2) ${test.load}`);
            assert.strictEqual(locationPath, test.path, `2) ${test.load} path`);

            // 3) Unload
            await $load('-', router, platform);
            await platform.domWriteQueue.yield();
            assert.strictEqual(host.textContent, '', `3) ${test.load} -`);
            assert.strictEqual(locationPath, '/', `3) ${test.load} - path`);

            // 4) reload
            await $load(test.load, router, platform);
            await platform.domWriteQueue.yield();
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

  describe('can activate links', function () {
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

  describe('can use viewport scope', function () {
    this.timeout(5000);

    const part = '<au-viewport-scope><a load="my-one">One</a><a load="my-two">Two</a>:<au-viewport default="my-zero"></au-viewport></au-viewport-scope>';
    const Siblings = CustomElement.define({ name: 'my-siblings', template: `!my-siblings!${part}|${part}` }, class { });
    const Zero = CustomElement.define({ name: 'my-zero', template: '!my-zero!' }, class { });
    const One = CustomElement.define({ name: 'my-one', template: '!my-one!' }, class { });
    const Two = CustomElement.define({ name: 'my-two', template: '!my-two!' }, class { });

    const appDependencies = [Siblings, Zero, One, Two];

    let locationPath: string;
    let browserTitle: string;
    const locationCallback = (type, data, title, path) => {
      // console.log(type, data, title, path);
      locationPath = path;
      browserTitle = title;
    };

    const tests = [
      { anchor: 0, result: '!my-siblings!OneTwo:!my-one!|OneTwo:', url: 'my-siblings/my-one', title: '', name: 'first my-one' },
      { anchor: 1, result: '!my-siblings!OneTwo:!my-two!|OneTwo:', url: 'my-siblings/my-two', title: '', name: 'first my-two' },
      { anchor: 2, result: '!my-siblings!OneTwo:|OneTwo:!my-one!', url: 'my-siblings/my-two', title: '', name: 'second my-one' },
      { anchor: 3, result: '!my-siblings!OneTwo:|OneTwo:!my-two!', url: 'my-siblings/my-two', title: '', name: 'second my-two' },
    ];

    for (let j = 0; j < tests.length; j++) {
      const test = tests[j];
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
});

let quxCantUnload = 0;
let plughReloadBehavior = 'default';

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

const $goBack = async (router: IRouter, platform: IPlatform) => {
  await router.viewer.history.back();
  platform.domWriteQueue.flush();
  await platform.domWriteQueue.yield();
};

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

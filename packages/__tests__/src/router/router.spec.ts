import { IContainer } from '@aurelia/kernel';
import { IRouter, RouterConfiguration, routes, Viewport } from '@aurelia/router';
import { CustomElement, customElement, IPlatform, Aurelia } from '@aurelia/runtime-html';
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

  it('can be created', async function () {
    this.timeout(5000);

    const { tearDown } = await createFixture();

    await tearDown();
  });

  it('loads viewports left and right', async function () {
    this.timeout(5000);

    const { host, tearDown } = await createFixture();

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

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('queues navigations', async function () {
    this.timeout(40000);

    const { host, router, tearDown } = await createFixture();

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

    const { platform, router, tearDown } = await createFixture();

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

    // let locationPath: string;
    // let browserTitle: string;
    // const locationCallback = (type, data, title, path) => {
    //   // console.log(type, data, title, path);
    //   locationPath = path;
    //   browserTitle = title;
    // };

    const { platform, host, router, tearDown } = await createFixture(void 0, void 0);

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

  // eslint-disable-next-line mocha/no-skipped-tests
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

  // if (PLATFORM.isBrowserLike)
  // TODO: figure out why this works in nodejs locally but not in CI and fix it
  // eslint-disable-next-line mocha/no-skipped-tests
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

  // eslint-disable-next-line mocha/no-skipped-tests
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

  // todo
  // eslint-disable-next-line mocha/no-skipped-tests
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
  // eslint-disable-next-line mocha/no-skipped-tests
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
});

let quxCantUnload = 0;
let plughReloadBehavior = 'default';

const $load = async (path: string, router: IRouter, platform: IPlatform) => {
  await router.load(path);
  platform.domWriteQueue.flush();
};

const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

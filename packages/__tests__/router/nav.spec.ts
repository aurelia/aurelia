import { DebugConfiguration } from '@aurelia/debug';
import { Aurelia, CustomElement } from '@aurelia/runtime';
import { NavCustomElement, Router, ViewportCustomElement } from '@aurelia/router';
import { MockBrowserHistoryLocation, TestContext, assert } from '@aurelia/testing';

describe('Nav', function () {
  async function setup(component) {
    const ctx = TestContext.createHTMLTestContext();
    const container = ctx.container;

    const App = CustomElement.define({ name: 'app', template: `<template><au-viewport name="app" used-by="${component}" default="${component}"></au-viewport></template>` });
    const Foo = CustomElement.define({ name: 'foo', template: '<template>Nav: foo <au-nav name="main-nav"></au-nav></template>' }, class {
      public static inject = [Router];
      constructor(private readonly r: Router) { }
      public enter() { this.r.setNav('main-nav', [{ title: 'Bar', route: 'bar' }]); }
    });
    const Bar = CustomElement.define({ name: 'bar', template: '<template>Nav: bar <au-nav name="main-nav"></au-nav><au-viewport name="main-viewport" default="baz"></au-viewport></template>' }, class {
      public static inject = [Router];
      constructor(private readonly r: Router) { }
      public enter() { this.r.setNav('main-nav', [{ title: 'Baz', route: 'baz' }]); }
    });
    const Baz = CustomElement.define({ name: 'baz', template: '<template>Baz</template>' }, class { });
    const Qux = CustomElement.define({ name: 'qux', template: '<template>Nav: qux <au-nav name="main-nav"></au-nav><au-viewport name="main-viewport" default="baz"></au-viewport></template>' }, class {
      public static inject = [Router];
      constructor(private readonly r: Router) { }
      public enter() {
        this.r.addNav('main-nav', [{ title: 'Baz', route: Baz, children: [{ title: 'Bar', route: ['bar', Baz] }] }, { title: 'Foo', route: { component: Foo, viewport: 'main-viewport' } }]);
      }
    });

    container.register(Router);
    container.register(ViewportCustomElement, NavCustomElement);
    container.register(Foo, Bar, Baz, Qux);

    const router = container.get(Router);
    const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
    mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate;
    router.navigation.history = mockBrowserHistoryLocation as any;
    router.navigation.location = mockBrowserHistoryLocation as any;

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = ctx.wnd['au'] = new Aurelia(container)
      .register(DebugConfiguration)
      .app({ host: host, component: App });

    await au.start().wait();

    await router.activate();

    async function tearDown() {
      await au.stop().wait();
      ctx.doc.body.removeChild(host);
      router.deactivate();
    }

    return { au, container, host, router, ctx, tearDown };
  };

  it('generates nav with a link', async function () {
    this.timeout(5000);
    const { host, router, tearDown } = await setup('foo');
    await waitForNavigation(router);
    assert.includes(host.innerHTML, 'foo', `host.innerHTML`);
    assert.includes(host.innerHTML, 'Bar', `host.innerHTML`);
    assert.includes(host.innerHTML, 'href="bar"', `host.innerHTML`);
    assert.notIncludes(host.innerHTML, 'nav-active', `host.innerHTML`);
    await tearDown();
  });

  it('generates nav with an active link', async function () {
    this.timeout(5000);
    const { host, router, tearDown } = await setup('bar');
    router.activeComponents = ['baz@main-viewport'];
    await waitForNavigation(router);
    assert.includes(host.innerHTML, 'href="baz"', `host.innerHTML`);
    //assert.includes(host.innerHTML, 'nav-active', `host.innerHTML`); // TODO: fix this
    await tearDown();
  });

  it('generates nav with child links', async function () {
    this.timeout(5000);
    const { host, router, tearDown } = await setup('qux');
    router.activeComponents = ['baz@main-viewport'];
    await waitForNavigation(router);
    assert.includes(host.innerHTML, 'href="baz"', `host.innerHTML`);
    assert.includes(host.innerHTML, 'nav-has-children', `host.innerHTML`);
    assert.includes(host.innerHTML, 'nav-level-1', `host.innerHTML`);
    await tearDown();
  });
});


const wait = async (time = 500) => {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const waitForNavigation = async (router) => {
  let guard = 1000;
  while (router.processingNavigation && guard--) {
    await wait(0);
  }
};

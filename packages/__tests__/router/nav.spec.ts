import { DebugConfiguration } from '@aurelia/debug';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { Aurelia, CustomElementResource, IDOM } from '@aurelia/runtime';
import { NavCustomElement, Router, ViewportCustomElement } from '@aurelia/router';
import { MockBrowserHistoryLocation, HTMLTestContext, TestContext, assert } from '@aurelia/testing';

describe('Nav', function () {
  const setup = async (component): Promise<{ au; container; host; router }> => {
    const container = BasicConfiguration.createContainer();

    const App = CustomElementResource.define({ name: 'app', template: `<template><au-viewport name="app" used-by="${component}" default="${component}"></au-viewport></template>` });
    const Foo = CustomElementResource.define({ name: 'foo', template: '<template>Nav: foo <au-nav name="main-nav"></au-nav></template>' }, class {
      public static inject = [Router];
      constructor(private readonly r: Router) { }
      public enter() { this.r.setNav('main-nav', [{ title: 'Bar', route: 'bar' }]); }
    });
    const Bar = CustomElementResource.define({ name: 'bar', template: '<template>Nav: bar <au-nav name="main-nav"></au-nav><au-viewport name="main-viewport" default="baz"></au-viewport></template>' }, class {
      public static inject = [Router];
      constructor(private readonly r: Router) { }
      public enter() { this.r.setNav('main-nav', [{ title: 'Baz', route: 'baz' }]); }
    });
    const Baz = CustomElementResource.define({ name: 'baz', template: '<template>Baz</template>' }, class { });
    const Qux = CustomElementResource.define({ name: 'qux', template: '<template>Nav: qux <au-nav name="main-nav"></au-nav><au-viewport name="main-viewport" default="baz"></au-viewport></template>' }, class {
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
    mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
    router.historyBrowser.history = mockBrowserHistoryLocation as any;
    router.historyBrowser.location = mockBrowserHistoryLocation as any;

    const host = ctx.doc.createElement('div');
    ctx.doc.body.appendChild(host);

    const au = window['au'] = new Aurelia(container)
      .register(DebugConfiguration)
      .app({ host: host, component: App })
      .start();

    await router.activate();
    return { au, container, host, router };
  };

  const teardown = async (host, router) => {
    ctx.doc.body.removeChild(host);
    router.deactivate();
  };

  let ctx: HTMLTestContext;

  beforeEach(function () {
    ctx = TestContext.createHTMLTestContext();
  });

  it('generates nav with a link', async function () {
    this.timeout(5000);
    const { host, router } = await setup('foo');
    await waitForNavigation(router);
    assert.includes(host.innerHTML, 'foo', `host.innerHTML`);
    assert.includes(host.innerHTML, 'Bar', `host.innerHTML`);
    assert.includes(host.innerHTML, 'href="bar"', `host.innerHTML`);
    assert.notIncludes(host.innerHTML, 'nav-active', `host.innerHTML`);
    await teardown(host, router);
  });

  it('generates nav with an active link', async function () {
    this.timeout(5000);
    const { host, router } = await setup('bar');
    router.activeComponents = ['baz@main-viewport'];
    await waitForNavigation(router);
    assert.includes(host.innerHTML, 'href="baz"', `host.innerHTML`);
    //assert.includes(host.innerHTML, 'nav-active', `host.innerHTML`); // TODO: fix this
    await teardown(host, router);
  });

  it('generates nav with child links', async function () {
    this.timeout(5000);
    const { host, router } = await setup('qux');
    router.activeComponents = ['baz@main-viewport'];
    await waitForNavigation(router);
    assert.includes(host.innerHTML, 'href="baz"', `host.innerHTML`);
    assert.includes(host.innerHTML, 'nav-has-children', `host.innerHTML`);
    assert.includes(host.innerHTML, 'nav-level-1', `host.innerHTML`);
    await teardown(host, router);
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

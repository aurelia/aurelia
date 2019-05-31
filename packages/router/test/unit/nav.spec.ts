import { expect } from 'chai';
import { DebugConfiguration } from '../../../debug/src/index';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
import { Aurelia, CustomElementResource, IDOM } from '../../../runtime/src/index';
import { NavCustomElement, Router, RouterConfiguration, ViewportCustomElement } from '../../src/index';
import { MockBrowserHistoryLocation } from '../mock/browser-history-location.mock';
import { registerComponent } from './utils';

describe('Nav', function () {
  it('generates nav with a link', async function () {
    this.timeout(30000);
    const { host, router } = await setup('foo');
    await waitForNavigation(router);
    expect(host.innerHTML).to.contain('foo');
    expect(host.innerHTML).to.contain('Bar');
    expect(host.innerHTML).to.contain('href="bar"');
    expect(host.innerHTML).to.not.contain('nav-active');
    await teardown(host, router);
  });

  it('generates nav with an active link', async function () {
    this.timeout(30000);
    const { host, router } = await setup('bar');
    router.activeComponents = ['baz@main-viewport'];
    await waitForNavigation(router);
    expect(host.innerHTML).to.contain('href="baz"');
    expect(host.innerHTML).to.contain('nav-active');
    await teardown(host, router);
  });

  it('generates nav with child links', async function () {
    this.timeout(30000);
    const { host, router } = await setup('qux');
    router.activeComponents = ['baz@main-viewport'];
    await waitForNavigation(router);
    expect(host.innerHTML).to.contain('href="baz"');
    expect(host.innerHTML).to.contain('nav-has-children');
    expect(host.innerHTML).to.contain('nav-level-1');
    await teardown(host, router);
  });
});

const setup = async (component): Promise<{ au; container; host; router }> => {
  const container = BasicConfiguration.createContainer();

  const App = (CustomElementResource as any).define({ name: 'app', template: `<template><au-viewport name="app" used-by="${component}" default="${component}"></au-viewport></template>` });
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
      this.r.addNav('main-nav', [{ title: 'Baz', route: Baz, children: [{ title: 'Bar', route: ['bar', Baz] }] }, { title: 'Foo', route: { component: Foo, viewport: 'main-viewport' } }] as any);
    }
  });

  // container.register(Router as any);
  container.register(ViewportCustomElement as any, NavCustomElement as any);
  registerComponent(container, Foo, Bar, Baz, Qux);

  // const router = container.get(Router);
  // const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  // mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
  // router.historyBrowser.history = mockBrowserHistoryLocation as any;
  // router.historyBrowser.location = mockBrowserHistoryLocation as any;

  const host = document.createElement('div');
  document.body.appendChild(host as any);

  const au = window['au'] = new Aurelia(container)
    .register(DebugConfiguration, RouterConfiguration)
    .app({ host: host, component: App })
    .start();

  const router = container.get(Router);
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.navigation.handlePopstate as any;
  router.navigation.history = mockBrowserHistoryLocation as any;
  router.navigation.location = mockBrowserHistoryLocation as any;

  await router.activate();
  return { au, container, host, router };
};

const teardown = async (host, router) => {
  document.body.removeChild(host);
  router.deactivate();
};

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

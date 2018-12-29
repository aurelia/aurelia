import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { expect } from 'chai';
import { HTMLJitConfiguration } from '../../../jit-html/src/index';
import { Router, ViewportCustomElement } from '../../src/index';
import { MockBrowserHistoryLocation } from '../mock/browser-history-location.mock';

describe('Router', () => {
  it('can be created', function () {
    this.timeout(30000);
    const sut = new Router(null);
  });

  it('loads viewports left and right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();
    expect(host.textContent).to.contain('left');
    expect(host.textContent).to.contain('right');
    await teardown(host, router, -1);
  });

  it('navigates to foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('foo');

    await teardown(host, router, 1);
  });

  it('clears viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('foo');
    router.goto('-@left');
    await waitForNavigation(router);
    expect(host.textContent).to.not.contain('foo');

    await teardown(host, router, 1);
  });

  it('clears all viewports', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    router.goto('bar@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    router.goto('-');
    await waitForNavigation(router);
    expect(host.textContent).to.not.contain('Viewport foo');
    expect(host.textContent).to.not.contain('Viewport bar');

    await teardown(host, router, 1);
  });

  it('queues navigations', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    router.goto('/bar@left');
    expect(router.pendingNavigations.length).to.equal(1);
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  it('replaces foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    const historyLength = router.historyBrowser.history.length;
    router.goto('foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('foo');
    expect(router.historyBrowser.history.length).to.equal(historyLength + 1);

    router.replace('bar@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('bar');
    expect(router.historyBrowser.history.length).to.equal(historyLength + 1);

    await teardown(host, router, 1);
  });

  it('navigates to bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/bar@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 2);
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/bar@left');
    await waitForNavigation(router);
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    router.back();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.forward();
    await waitForNavigation(router);
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  it('navigates back and forward with two viewports', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/bar@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    router.back();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.forward();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 4);
  });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left+bar@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('foo');
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
  });

  it('cancels if not canLeave', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/baz@left+qux@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');

    router.goto('/foo@left+bar@right');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    await teardown(host, router, 2);
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left+bar@right+baz@foo+qux@bar');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');

    await teardown(host, router, 1);
  });

  it('handles anchor click', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('foo');

    (host as any).getElementsByTagName('SPAN')[0].click();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');

    await teardown(host, router, 1);
  });

  it('loads scoped viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/quux@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: quux');

    router.goto('/quux@quux!');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: quux');

    router.goto('/quux@left/foo@quux!');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: foo');

    (host as any).getElementsByTagName('SPAN')[0].click();
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');

    router.goto('/bar@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.not.contain('Viewport: quux');

    await teardown(host, router, 1);
  });

  it('understands used-by', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/corge@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: corge');

    router.goto('/baz');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');

    await teardown(host, router, 1);
  });
});

let quxCantLeave = 2;

const setup = async (): Promise<{ au; container; host; router }> => {
  const container = HTMLJitConfiguration.createContainer();
  const App = CustomElementResource.define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' }, class {});
  const Foo = CustomElementResource.define({ name: 'foo', template: '<template>Viewport: foo <a href="#/baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' }, class {});
  const Bar = CustomElementResource.define({ name: 'bar', template: '<template>Viewport: bar<au-viewport name="bar"></au-viewport></template>' }, class {});
  const Baz = CustomElementResource.define({ name: 'baz', template: '<template>Viewport: baz<au-viewport name="baz"></au-viewport></template>' }, class {});
  const Qux = CustomElementResource.define({ name: 'qux', template: '<template>Viewport: qux<au-viewport name="qux"></au-viewport></template>' }, class {
    public canEnter() { return true; }
    public canLeave() { if (quxCantLeave > 0) { quxCantLeave--; return false; } else { return true; } }
    public enter() { return true; }
    public leave() { return true; }
  });
  const Quux = (CustomElementResource as any).define({ name: 'quux', template: '<template>Viewport: quux<au-viewport name="quux" scope></au-viewport></template>' });
  const Corge = (CustomElementResource as any).define({ name: 'corge', template: '<template>Viewport: corge<au-viewport name="corge" used-by="baz"></au-viewport></template>' });
  container.register(ViewportCustomElement as any);
  container.register(Foo, Bar, Baz, Qux, Quux, Corge);
  const au = new Aurelia(container as any);
  const host = document.createElement('div');
  document.body.appendChild(host as any);
  const component = new App();
  au.app({ component, host });
  au.start();

  container.register(Router as any);
  const router = container.get(Router);
  const mockBrowserHistoryLocation = new MockBrowserHistoryLocation();
  mockBrowserHistoryLocation.changeCallback = router.historyBrowser.pathChanged;
  router.historyBrowser.history = mockBrowserHistoryLocation as any;
  router.historyBrowser.location = mockBrowserHistoryLocation as any;
  router.activate();
  await Promise.resolve();
  return { au, container, host, router };
};

const teardown = async (host, router, count) => {
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

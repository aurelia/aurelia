import { Aurelia, CustomElementResource } from '@aurelia/runtime';
import { expect } from 'chai';
import { BasicConfiguration } from '../../../jit-html-browser/src/index';
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

  it('does not update fullStatePath on wrong history entry', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    router.goto('/foo@left');
    router.goto('/bar@left');
    router.goto('/baz@left');

    await teardown(host, router, 4);
  });

  it('parses parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    router.goto('/bar@left=456');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await teardown(host, router, 1);
  });

  it('parses named parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left=id=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    router.goto('/bar@left=id=456');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await teardown(host, router, 1);
  });

  it('parses parameters after viewport individually', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    router.goto('/bar@right=456');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');
    expect(host.textContent).to.contain('Parameter id: [456]');

    await teardown(host, router, 1);
  });

  it('parses parameters without viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/corge@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: corge');

    router.goto('/baz=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await teardown(host, router, 1);
  });

  it('parses named parameters without viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/corge@left');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: corge');

    router.goto('/baz=id=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Parameter id: [123]');

    await teardown(host, router, 1);
  });

  it('parses multiple parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left=123&OneTwoThree');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');
    expect(host.textContent).to.contain('Parameter name: [OneTwoThree]');

    router.goto('/bar@left=456&FourFiveSix');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await teardown(host, router, 1);
  });

  it('parses multiple name parameters after viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left=id=123&name=OneTwoThree');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');
    expect(host.textContent).to.contain('Parameter name: [OneTwoThree]');

    router.goto('/bar@left=name=FourFiveSix&id=456');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await teardown(host, router, 1);
  });

  it('parses querystring', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left?id=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [123]');

    router.goto('/bar@left?id=456&name=FourFiveSix');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    await teardown(host, router, 1);
  });

  it('overrides querystring with parameter', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/bar@left=456?id=123');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');

    router.goto('/bar@left=456&FourFiveSix?id=123&name=OneTwoThree');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [456]');
    expect(host.textContent).to.contain('Parameter name: [FourFiveSix]');

    router.goto('/bar@left=name=SevenEightNine&id=789?id=123&name=OneTwoThree');
    await waitForNavigation(router);
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Parameter id: [789]');
    expect(host.textContent).to.contain('Parameter name: [SevenEightNine]');

    await teardown(host, router, 1);
  });

});

let quxCantLeave = 2;

const setup = async (): Promise<{ au; container; host; router }> => {
  const container = BasicConfiguration.createContainer();
  const App = (CustomElementResource as any).define({ name: 'app', template: '<template><au-viewport name="left"></au-viewport><au-viewport name="right"></au-viewport></template>' });
  const Foo = (CustomElementResource as any).define({ name: 'foo', template: '<template>Viewport: foo <a href="#/baz@foo"><span>baz</span></a><au-viewport name="foo"></au-viewport></template>' });
  const Bar = CustomElementResource.define({ name: 'bar', template: '<template>Viewport: bar Parameter id: [${id}] Parameter name: [${name}] <au-viewport name="bar"></au-viewport></template>' }, class {
    public static parameters = ['id', 'name'];
    public id = 'no id';
    public name = 'no name';
    public enter(params) { if (params.id) { this.id = params.id; } if (params.name) { this.name = params.name; } }
  });
  const Baz = CustomElementResource.define({ name: 'baz', template: '<template>Viewport: baz Parameter id: [${id}] <au-viewport name="baz"></au-viewport></template>' }, class {
    public static parameters = ['id'];
    public id = 'no id';
    public enter(params) { if (params.id) { this.id = params.id; } }
  });
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

import { ViewportCustomElement } from './../../test/e2e/modules/src/components/viewport';
import { Router } from '../../src/index';
import { expect } from 'chai';
import { DI } from '../../../kernel/src';
import { CustomElementResource, Aurelia, DOM } from '../../../runtime/src';
import { BasicConfiguration } from '../../../jit/src';

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
    // Promise.resolve().then(() => done());
  });

  it('navigates to foo in left', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');

    await teardown(host, router, 1);
    // Promise.resolve().then(() => done());
  });

  it('clears viewport', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    await freshState(router, 1);
    expect(host.textContent).to.not.contain('foo');

    await teardown(host, router, 1);
    // Promise.resolve().then(() => done());
  });

  it('navigates to bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/right:bar');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
    // Promise.resolve().then(() => done());
  });

  it('navigates to foo in left then bar in right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/right:bar');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    await teardown(host, router, 2);
    // Promise.resolve().then(() => done());
  });

  it('navigates back and forward with one viewport', async function () {
    this.timeout(40000);
    const { host, router } = await setup();

    await wait();

    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    router.goto('/left:bar');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.not.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');

    router.back();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.not.contain('Viewport: bar');

    // router.forward();
    // await Promise.resolve();
    // await Promise.resolve();
    // expect(host.textContent).to.not.contain('Viewport: foo');
    // expect(host.textContent).to.contain('Viewport: bar');

    await wait();

    await teardown(host, router, 4);
    // Promise.resolve().then(() => done());
  });

  // it('navigates back and forward with two viewports', async function () {
  //   this.timeout(30000);
  //   const { host, router } = await setup();

  //   router.goto('/left:foo');
  //   await Promise.resolve();
  //   await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.not.contain('Viewport: bar');

  //   router.goto('/right:bar');
  //   await Promise.resolve();
  //   await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.contain('Viewport: bar');

  //   router.back();
  //   await Promise.resolve();
  //   await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.not.contain('Viewport: bar');

  //   router.forward();
  //   await Promise.resolve();
  //   await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: foo');
  //   expect(host.textContent).to.contain('Viewport: bar');

  //   await teardown(host, router, 4);
  //   // Promise.resolve().then(() => done());
  // });

  it('navigates to foo/bar in left/right', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/left:foo/right:bar');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    expect(host.textContent).to.contain('bar');

    await teardown(host, router, 1);
    // Promise.resolve().then(() => done());
  });

  // it('cancels if not canLeave', async function () {
  //   this.timeout(30000);
  //   const { host, router } = await setup();

  //   router.goto('/left:baz/right:qux');
  //   await Promise.resolve();
  //   await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: baz');
  //   expect(host.textContent).to.contain('Viewport: qux');
  //   router.goto('/left:foo/right:bar');
  //   await Promise.resolve();
  //   await Promise.resolve();
  //   expect(host.textContent).to.contain('Viewport: baz');
  //   expect(host.textContent).to.contain('Viewport: qux');
  //   expect(host.textContent).to.not.contain('Viewport: foo');
  //   expect(host.textContent).to.not.contain('Viewport: bar');

  //   await teardown(host, router, 2);
  //   // Promise.resolve().then(() => done());
  // });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/left:foo/right:bar/foo:baz/bar:qux');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: foo');
    expect(host.textContent).to.contain('Viewport: bar');
    expect(host.textContent).to.contain('Viewport: baz');
    expect(host.textContent).to.contain('Viewport: qux');

    await teardown(host, router, 1);
    // Promise.resolve().then(() => done());
  });

  it('handles anchor click', async function () {
    this.timeout(30000);
    const { host, router } = await setup();

    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');

    (<any>host).getElementsByTagName('SPAN')[0].click();
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('Viewport: baz');

    await teardown(host, router, 1);
    // Promise.resolve().then(() => done());
  });

});

let quxCantLeave = 2;

let setup = async (): Promise<{ au, container, host, router }> => {
  const container = DI.createContainer();
  container.register(<any>BasicConfiguration);
  const App = (<any>CustomElementResource).define({ name: 'app', template: '<template><viewport name="left"></viewport><viewport name="right"></viewport></template>' });
  const Foo = (<any>CustomElementResource).define({ name: 'foo', template: '<template>foo <a href="#/foo:baz"><span>baz</span></a><viewport name="foo"></viewport></template>' });
  const Bar = (<any>CustomElementResource).define({ name: 'bar', template: '<template>bar<viewport name="bar"></viewport></template>' });
  const Baz = (<any>CustomElementResource).define({ name: 'baz', template: '<template>baz<viewport name="baz"></viewport></template>' });
  const Qux = (<any>CustomElementResource).define({ name: 'qux', template: '<template>qux<viewport name="qux"></viewport></template>' }, class {
    canEnter() { return true; }
    canLeave() { if (quxCantLeave > 0) { quxCantLeave--; return false; } else { return true; } }
    enter() { return true; }
    leave() { return true; }
  });
  container.register(<any>ViewportCustomElement);
  container.register(Foo, Bar, Baz, Qux);
  const au = new Aurelia(<any>container);
  const host = DOM.createElement('div');
  document.body.appendChild(<any>host);
  const component = new App();
  au.app({ component, host });
  au.start();
  container.register(<any>Router);
  const router = container.get(Router);
  router.activate();
  await Promise.resolve();
  return { au, container, host, router }
}

let teardown = async (host, router, count) => {
  await freshState(router, count);
  document.body.removeChild(host);
  router.deactivate();
}

let throttleCounter = 0;
let freshState = async (router, count) => {
  throttleCounter += (count * 2) + 2;
  router.goto('/left:-/right:-');
  await Promise.resolve();
  if (throttleCounter >= 9) {
    await wait();
  }
}
let wait = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 10000);
    throttleCounter = 0;
  });
}

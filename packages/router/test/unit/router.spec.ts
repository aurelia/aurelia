import { ViewportCustomElement } from './../../test/e2e/modules/src/components/viewport';
import { Router } from '../../src/index';
import { expect } from 'chai';
import { DI } from '../../../kernel/src';
import { CustomElementResource, Aurelia, DOM } from '../../../runtime/src';
import { BasicConfiguration } from '../../../jit/src';

describe('Router', () => {
  it('can be created', () => {
    const sut = new Router(null);
  });

  it('loads viewports left and right', async () => {
    const { host, router } = setup();
    expect(host.textContent).to.contain('left');
    expect(host.textContent).to.contain('right');
  });

  it('navigates to foo in left', async () => {
    const { host, router } = setup();
    router.activate();
    await Promise.resolve();
    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    await freshState(router);
  });

  it('clears viewport', async () => {
    const { host, router } = setup();
    router.activate();
    await Promise.resolve();
    router.goto('/left:foo');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    await freshState(router);
    expect(host.textContent).to.not.contain('foo');
  });

  it('navigates to bar in right', async () => {
    const { host, router } = setup();
    router.activate();
    await Promise.resolve();
    router.goto('/right:bar');
    await Promise.resolve();
    await Promise.resolve();
    console.log(host.textContent);
    expect(host.textContent).to.contain('bar');
    await freshState(router);
  });

  it('navigates to foo/bar in left/right', async () => {
    const { host, router } = setup();
    router.activate();
    await Promise.resolve();
    router.goto('/left:foo/right:bar');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    expect(host.textContent).to.contain('bar');
    await freshState(router);
  });

  it('navigates to foo/bar in left/right containing baz/qux respectively', async () => {
    const { host, router } = setup();
    router.activate();
    await Promise.resolve();
    router.goto('/left:foo/right:bar/foo:baz/bar:qux');
    await Promise.resolve();
    await Promise.resolve();
    expect(host.textContent).to.contain('foo');
    expect(host.textContent).to.contain('bar');
    expect(host.textContent).to.contain('baz');
    expect(host.textContent).to.contain('qux');
    await freshState(router);
  });
});

function setup() {
  const container = DI.createContainer();
  container.register(<any>BasicConfiguration);
  const App = (<any>CustomElementResource).define({ name: 'app', template: '<template><viewport name="left"></viewport><viewport name="right"></viewport></template>' });
  const Foo = (<any>CustomElementResource).define({ name: 'foo', template: '<template>foo<viewport name="foo"></viewport></template>' });
  const Bar = (<any>CustomElementResource).define({ name: 'bar', template: '<template>bar<viewport name="bar"></viewport></template>' });
  const Baz = (<any>CustomElementResource).define({ name: 'baz', template: '<template>baz<viewport name="baz"></viewport></template>' });
  const Qux = (<any>CustomElementResource).define({ name: 'qux', template: '<template>qux<viewport name="qux"></viewport></template>' });
  container.register(<any>ViewportCustomElement);
  container.register(Foo, Bar, Baz, Qux);
  const au = new Aurelia(<any>container);
  const host = DOM.createElement('div');
  const component = new App();
  au.app({ component, host });
  au.start();
  container.register(<any>Router);
  const router = container.get(Router);
  return { au, container, host, router }
}

let freshState = async (router) => {
  router.goto('left:-/right:-');
  await Promise.resolve();
  await Promise.resolve();
}

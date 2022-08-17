import { Class, LogLevel } from '@aurelia/kernel';
import { route, RouterConfiguration } from '@aurelia/router-lite';
import { Aurelia, bindable, customElement, IPlatform } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';
import { TestRouterConfiguration } from '../_shared/configuration.js';

describe('load custom-attribute', function () {

  async function start<TAppRoot>(appRoot: Class<TAppRoot>, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(
      TestRouterConfiguration.for(LogLevel.warn),
      RouterConfiguration,
      ...registrations,
    );

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: appRoot, host }).start();
    const rootVm = au.root.controller.viewModel as TAppRoot;
    return { host, au, container, rootVm };
  }

  function assertAnchors(anchors: HTMLAnchorElement[] | NodeListOf<HTMLAnchorElement>, expected: { href: string; active?: boolean }[], message: string = ''): void {
    const len = anchors.length;
    assert.strictEqual(len, expected.length, `${message} length`);
    for (let i = 0; i < len; i++) {
      const anchor = anchors[i];
      const item = expected[i];
      assert.strictEqual(anchor.href.endsWith(item.href), true, `${message} - #${i} href - actual: ${anchor.href} - expected: ${item.href}`);
      assert.strictEqual(anchor.classList.contains('active'), !!item.active, `${message} - #${i} active`);
    }
  }

  it('active status works correctly', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `
    <a load="route:foo; params.bind:{id: 1}; active.bind:active1" active.class="active1"></a>
    <a load="route:foo/2; active.bind:active2" active.class="active2"></a>
    <au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start(Root, Foo);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    const anchors = host.querySelectorAll('a');
    const a1 = { href: 'foo/1', active: false };
    const a2 = { href: 'foo/2', active: false };
    assertAnchors(anchors, [a1, a2], 'round#1');

    anchors[1].click();
    await queue.yield();
    a2.active = true;
    assertAnchors(anchors, [a1, a2], 'round#2');

    anchors[0].click();
    await queue.yield();
    a1.active = true;
    a2.active = false;
    assertAnchors(anchors, [a1, a2], 'round#3');

    await au.stop();
  });

  it('un-configured parameters are added to the querystring', async function () {
    @customElement({ name: 'fo-o', template: '' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: 'foo/:id', component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start(Root, Foo);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    const anchor = host.querySelector('a');
    assert.match(anchor.href, /foo\/3\?a=2/);
    await au.stop();
  });

  it('the most matched path is generated', async function () {
    @customElement({ name: 'fo-o', template: 'foo' })
    class Foo { }

    @route({
      routes: [
        { id: 'foo', path: ['foo/:id', 'foo/:id/bar/:a', 'bar/fizz'], component: Foo }
      ]
    })
    @customElement({
      name: 'ro-ot',
      template: `<a load="route:foo; params.bind:{id: 3, a: 2};"></a><a load="route:foo; params.bind:{id: 3, b: 2};"></a><a load="bar/fizz"></a><au-viewport></au-viewport>`
    })
    class Root { }

    const { au, host, container } = await start(Root, Foo);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /foo\/3\/bar\/2/);
    assert.match(hrefs[1], /foo\/3\?b=2/); // this one ensures the rejection of non-monotonically increment in the parameter consumption
    assert.match(hrefs[2], /bar\/fizz/);

    anchors[2].click();
    await queue.yield();
    assert.html.textContent(host, 'foo');

    await au.stop();
  });

  it.only('allow navigating to route defined in parent context', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id}` })
    class Product {
      @bindable id: unknown;
    }

    @customElement({ name: 'pro-ducts', template: `<a id="a1" load="route:product; params.bind:{id: 1}">p1</a>` })
    class Products { }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start(Root, Products, Product);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1/);

    await au.stop();
  });
});

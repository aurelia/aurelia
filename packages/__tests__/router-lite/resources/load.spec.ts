import { Params, route, RouteNode } from '@aurelia/router-lite';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('load custom-attribute', function () {

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

  it('allow navigating to route defined in parent context using ../ prefix', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="../product/1"></a><a load="../product/2"></a> products` })
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

    assert.html.textContent(host, 'products');
    const anchors = Array.from(host.querySelectorAll('a'));
    const hrefs = anchors.map(a => a.href);
    assert.match(hrefs[0], /product\/1$/);
    assert.match(hrefs[1], /product\/2$/);

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'product 1');
    // go back
    const back = host.querySelector<HTMLAnchorElement>('a');
    assert.match(back.href, /products$/);
    back.click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    // 2nd round
    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'product 2');
    // go back
    host.querySelector<HTMLAnchorElement>('a').click();
    await queue.yield();
    assert.html.textContent(host, 'products');

    await au.stop();
  });
});

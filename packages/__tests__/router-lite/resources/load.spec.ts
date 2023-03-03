import { IRouteContext, Params, route, RouteNode } from '@aurelia/router-lite';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('router-lite/resources/load.spec.ts', function () {

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

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
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

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
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

    const { au, host, container } = await start({ appRoot: Root, registrations: [Foo] });
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

    const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
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

  it('allow navigating to route defined in parent context using explicit routing context', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a load="route:products; context.bind:rtCtx.parent"></a>` })
    class Product {
      id: unknown;
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        this.rtCtx = next.context;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a load="route:product/1; context.bind:rtCtx.parent"></a><a load="route:product; params.bind:{id: 2}; context.bind:rtCtx.parent"></a> products` })
    class Products {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'products', path: ['', 'products'], component: Products },
        { id: 'product', path: 'product/:id', component: Product },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [Products, Product] });
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

  it('allow navigating to route defined in grand-parent context using ../../ prefix', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="../../l12"></a>` })
    class L21 { }
    @customElement({ name: 'l-22', template: `l22 <a load="../../l11"></a>` })
    class L22 { }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    await au.stop();
  });

  it('allow navigating to route defined in grand-parent context using explicit routing context', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:l12; context.bind:rtCtx.parent.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a load="route:l11; context.bind:rtCtx.parent.parent"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l22', path: ['', 'l22'], component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22] });
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l22');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21');

    await au.stop();
  });

  it('allow explicitly binding the routing context to null to perform navigation from root', async function () {
    @customElement({ name: 'l-21', template: `l21 <a load="route:l22; context.bind:rtCtx.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a load="route:l12; context.bind:null"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-23', template: `l23 <a load="route:l24; context.bind:rtCtx.parent"></a>` })
    class L23 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-24', template: `l24 <a load="route:l11; context.bind:null"></a>` })
    class L24 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }

    @route({
      routes: [
        { id: 'l21', path: ['', 'l21'], component: L21 },
        { id: 'l22', path: 'l22', component: L22 },
      ]
    })
    @customElement({ name: 'l-11', template: `l11 <au-viewport></au-viewport>` })
    class L11 { }

    @route({
      routes: [
        { id: 'l23', path: ['', 'l23'], component: L23 },
        { id: 'l24', path: 'l24', component: L24 },
      ]
    })
    @customElement({ name: 'l-12', template: `l12 <au-viewport></au-viewport>` })
    class L12 { }

    @route({
      routes: [
        { id: 'l11', path: ['', 'l11'], component: L11 },
        { id: 'l12', path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, registrations: [L11, L12, L21, L22, L23, L24] });
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();
    assert.html.textContent(host, 'l11 l21', 'init');

    // l21 -> l22
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l22', '#2 l21 -> l22');

    // l22 -> l12
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l23', '#3 l22 -> l12');

    // l23 -> l24
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l12 l24', '#4 l23 -> l24');

    // l24 -> l11
    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'l11 l21', '#5 l24 -> l11');

    await au.stop();
  });

  it('adds hash correctly to the href when useUrlFragmentHash is set', async function () {
    @customElement({ name: 'ce-one', template: `ce1` })
    class CeOne { }

    @customElement({ name: 'ce-two', template: `ce2` })
    class CeTwo { }

    @customElement({
      name: 'ro-ot',
      template: `
      <a load="#ce-one"></a>
      <a load="#ce-two"></a>
      <a load="ce-two"></a>
      <au-viewport></au-viewport>
      `
    })
    @route({
      routes: [
        {
          path: 'ce-one',
          component: CeOne,
        },
        {
          path: 'ce-two',
          component: CeTwo,
        },
      ]
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, useHash: true, registrations: [CeOne, CeTwo] });
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));
    assert.deepStrictEqual(anchors.map(a => a.getAttribute('href')), ['#ce-one', '#ce-two', '#ce-two']);

    anchors[1].click();
    await queue.yield();
    assert.html.textContent(host, 'ce2');

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'ce1');

    anchors[2].click();
    await queue.yield();
    assert.html.textContent(host, 'ce2');

    await au.stop();
  });
});

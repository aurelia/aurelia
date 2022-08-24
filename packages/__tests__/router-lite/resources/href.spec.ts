import { IRouteContext, Params, route, RouteNode } from '@aurelia/router-lite';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('href custom-attribute', function () {

  it('allow navigating to route defined in parent context using ../ prefix', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a href="../products"></a>` })
    class Product {
      id: unknown;
      public canLoad(params: Params, _next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a href="../product/1"></a><a href="../product/2"></a> products` })
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

  it('allow navigating to route defined in parent context using explicit routing context', async function () {
    @customElement({ name: 'pro-duct', template: `product \${id} <a href="value:products; context.bind:rtCtx.parent"></a>` })
    class Product {
      id: unknown;
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.id = params.id;
        this.rtCtx = next.context;
        return true;
      }
    }

    @customElement({ name: 'pro-ducts', template: `<a href="value:product/1; context.bind:rtCtx.parent"></a><a href="value:product/2; context.bind:rtCtx.parent"></a> products` })
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

    const { au, host, container } = await start(Root, Products, Product);
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    assert.html.textContent(host, 'products');
    host.querySelector('a').click();
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
    @customElement({ name: 'l-21', template: `l21 \${id} <a href="../../l12"></a>` })
    class L21 { }
    @customElement({ name: 'l-22', template: `l22 \${id} <a href="../../l11"></a>` })
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

    const { au, host, container } = await start(Root, L11, L12, L21, L22);
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
    @customElement({ name: 'l-21', template: `l21 <a href="value:l12; context.bind:rtCtx.parent.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a href="value:l11; context.bind:rtCtx.parent.parent"></a>` })
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

    const { au, host, container } = await start(Root, L11, L12, L21, L22);
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
    @customElement({ name: 'l-21', template: `l21 <a href="value:l22; context.bind:rtCtx.parent"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a href="value:l12; context.bind:null"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-23', template: `l23 <a href="value:l24; context.bind:rtCtx.parent"></a>` })
    class L23 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-24', template: `l24 <a href="value:l11; context.bind:null"></a>` })
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

    const { au, host, container } = await start(Root, L11, L12, L21, L22, L23, L24);
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
});

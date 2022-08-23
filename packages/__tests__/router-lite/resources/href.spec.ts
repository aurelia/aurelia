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
});

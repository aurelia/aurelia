import { IRouteContext, IRouteViewModel, Params, route, RouteNode } from '@aurelia/router-lite';
import { customElement, IPlatform } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from '../_shared/create-fixture.js';

describe('router-lite/resources/href.spec.ts', function () {

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

    await au.stop(true);
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

    await au.stop(true);
  });

  // slightly more complex use-case
  it('cross children navigation with multiple hierarchical routing configuration', async function () {
    @customElement({ name: 'l-21', template: `l21 <a href="../l22"></a>` })
    class L21 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-22', template: `l22 <a href="../../l12"></a>` })
    class L22 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-23', template: `l23 <a href="../l24"></a>` })
    class L23 {
      private rtCtx: IRouteContext;
      public canLoad(params: Params, next: RouteNode, _current: RouteNode): boolean {
        this.rtCtx = next.context;
        return true;
      }
    }
    @customElement({ name: 'l-24', template: `l24 <a href="../../l11"></a>` })
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

    await au.stop(true);
  });

  it('adds hash correctly to the href when useUrlFragmentHash is set', async function () {
    @customElement({ name: 'ce-one', template: `ce1` })
    class CeOne { }

    @customElement({ name: 'ce-two', template: `ce2` })
    class CeTwo { }

    @customElement({ name: 'ce-three-child', template: `ce3child` })
    class CeThreeChild { }

    @customElement({ name: 'ce-three', template: `ce3 <a id="ce3a1" href="../ce-one"></a> <a id="ce3a2" href="ce-three-child"></a> <au-viewport></au-viewport>` })
    @route({
      routes: [
        {
          path: 'ce-three-child',
          component: CeThreeChild,
        },
      ]
    })
    class CeThree { }

    @customElement({
      name: 'ro-ot',
      template: `
      <a href="#ce-one"></a>
      <a href="#ce-two"></a>
      <a href="ce-two"></a>
      <a href="./ce-three"></a>
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
        {
          path: 'ce-three',
          component: CeThree,
        },
      ]
    })
    class Root { }

    const { au, host, container } = await start({ appRoot: Root, useHash: true, registrations: [CeOne, CeTwo, CeThree] });
    const queue = container.get(IPlatform).domWriteQueue;
    await queue.yield();

    const anchors = Array.from(host.querySelectorAll('a'));
    assert.deepStrictEqual(anchors.map(a => a.getAttribute('href')), ['#ce-one', '#ce-two', '#ce-two', './ce-three']);

    anchors[1].click();
    await queue.yield();
    assert.html.textContent(host, 'ce2');

    anchors[0].click();
    await queue.yield();
    assert.html.textContent(host, 'ce1');

    anchors[2].click();
    await queue.yield();
    assert.html.textContent(host, 'ce2');

    anchors[3].click();
    await queue.yield();
    assert.html.textContent(host, 'ce3');

    let anchor = host.querySelector<HTMLAnchorElement>('a#ce3a1');
    assert.strictEqual(anchor.getAttribute('href'), '../ce-one');
    anchor.click();
    await queue.yield();
    assert.html.textContent(host, 'ce1');

    anchors[3].click();
    await queue.yield();
    assert.html.textContent(host, 'ce3');

    anchor = host.querySelector<HTMLAnchorElement>('a#ce3a2');
    assert.strictEqual(anchor.getAttribute('href'), 'ce-three-child');
    anchor.click();
    await queue.yield();
    assert.html.textContent(host, 'ce3 ce3child');

    await au.stop(true);
  });

  it('supports routing instruction with parenthesized parameters', async function () {
    @route('c1/:id1/:id2?')
    @customElement({ name: 'c-1', template: 'c1 ${id1} ${id2}' })
    class C1 implements IRouteViewModel {
      private id1: string;
      private id2: string;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id1 = params.id1;
        this.id2 = params.id2;
      }
    }

    @route({ routes: [{ id: 'c1', component: C1 }] })
    @customElement({ name: 'ro-ot', template: '<a href="c1(id1=1)"></a> <a href="c1(id1=2,id2=3)"></a> <au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root });
    const queue = container.get(IPlatform).domWriteQueue;

    assert.html.textContent(host, '', 'init');

    host.querySelector('a').click();
    await queue.yield();
    assert.html.textContent(host, 'c1 1', 'round#1');

    host.querySelector<HTMLAnchorElement>('a:nth-of-type(2)').click();
    await queue.yield();
    assert.html.textContent(host, 'c1 2 3', 'round#2');

    await au.stop(true);
  });
});

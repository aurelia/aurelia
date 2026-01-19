import { IRouter, IRouteViewModel, Params, route, RouteNode } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
import { tasksSettled } from '@aurelia/runtime';

/**
 * These tests assert the specific utilities satisfied by the eager loading in the router.
 */
describe('router/eager-loading.spec.ts', function () {
  const useEagerLoading = true;

  // issue #2273
  it('enables navigating to parent/child route when parent is configured with paths: ["parent", "parent/:id"]', async function () {

    @route('child/:id')
    @customElement({ name: 'chi-ld', template: 'child ${id}' })
    class Child implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ id: 'parent', path: ['parent', 'parent/:id'], routes: [Child] })
    @customElement({ name: 'par-ent', template: 'parent ${id} <au-viewport></au-viewport>' })
    class Parent implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ routes: [Parent] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'init');

    await router.load('parent/child/123');
    assert.html.textContent(host, 'parent child 123', 'after navigation to parent/child route');

    await router.load('parent/456/child/789');
    assert.html.textContent(host, 'parent 456 child 789', 'after navigation to parent/456/child/789 route');

    await au.stop(true);
  });

  // issue #2273
  it('enables navigating to parent/child route when parent is configured with paths: ["parent/:id?"]', async function () {

    @route('child/:id')
    @customElement({ name: 'chi-ld', template: 'child ${id}' })
    class Child implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ id: 'parent', path: ['parent/:id?'], routes: [Child] })
    @customElement({ name: 'par-ent', template: 'parent ${id} <au-viewport></au-viewport>' })
    class Parent implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ routes: [Parent] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'init');

    await router.load('parent/child/123');
    assert.html.textContent(host, 'parent child 123', 'after navigation to parent/child route');

    await router.load('parent/456/child/789');
    assert.html.textContent(host, 'parent 456 child 789', 'after navigation to parent/456/child/789 route');

    await au.stop(true);
  });

  it('enables navigating to parent/child1@vp1+child2@vp2 route when parent is configured with multiple viewports', async function () {

    @route('child1/:id')
    @customElement({ name: 'chi-ld-one', template: 'child1 ${id}' })
    class Child1 implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route('child2/:id')
    @customElement({ name: 'chi-ld-two', template: 'child2 ${id}' })
    class Child2 implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({
      id: 'parent', path: 'parent/:id?',
      routes: [Child1, Child2],
    })
    @customElement({ name: 'par-ent', template: 'parent ${id} <au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
    class Parent implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ routes: [Parent] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'init');

    await router.load('parent/(child1/123+child2/456)');
    assert.html.textContent(host, 'parent child1 123 child2 456', 'round#1');

    await router.load('parent/789/(child1/321@vp2+child2/654@vp1)');
    assert.html.textContent(host, 'parent 789 child2 654 child1 321', 'round#2');

    await au.stop(true);
  });

  it('enables navigating to parent/child/grandchild route when ancestors are configured with paths: ["ancestor/:id?"]', async function () {
    @route('grandchild/:id?')
    @customElement({ name: 'grand-child', template: 'grandchild ${id}' })
    class GrandChild implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ path: 'child/:id?', routes: [GrandChild] })
    @customElement({ name: 'chi-ld', template: 'child ${id} <au-viewport></au-viewport>' })
    class Child implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ id: 'parent', path: 'parent/:id?', routes: [Child] })
    @customElement({ name: 'par-ent', template: 'parent ${id} <au-viewport></au-viewport>' })
    class Parent implements IRouteViewModel {
      public id: string | undefined;
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id;
      }
    }

    @route({ routes: [Parent] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'init');

    await router.load('parent/child/grandchild');
    assert.html.textContent(host, 'parent child grandchild', 'after navigation to parent/child/grandchild route');

    await router.load('parent/child/grandchild/789');
    assert.html.textContent(host, 'parent child grandchild 789', 'after navigation to parent/child/grandchild/789 route');

    await router.load('parent/child/456/grandchild');
    assert.html.textContent(host, 'parent child 456 grandchild', 'after navigation to parent/child/456/grandchild route');

    await router.load('parent/child/456/grandchild/789');
    assert.html.textContent(host, 'parent child 456 grandchild 789', 'after navigation to parent/child/456/grandchild/789 route');

    await router.load('parent/123/child/grandchild');
    assert.html.textContent(host, 'parent 123 child grandchild', 'after navigation to parent/123/child/grandchild route');

    await router.load('parent/123/child/grandchild/789');
    assert.html.textContent(host, 'parent 123 child grandchild 789', 'after navigation to parent/123/child/grandchild/789 route');

    await router.load('parent/123/child/456/grandchild');
    assert.html.textContent(host, 'parent 123 child 456 grandchild', 'after navigation to parent/123/child/456/grandchild route');

    await router.load('parent/123/child/456/grandchild/789');
    assert.html.textContent(host, 'parent 123 child 456 grandchild 789', 'after navigation to parent/123/child/456/grandchild/789 route');

    await au.stop(true);
  });

  it('enables multi-level navigation with sibling viewports', async function () {

    @route('grandchild-one/:id?')
    @customElement({ name: 'grandchild-one', template: 'grandchild-one ${id}' })
    class GrandchildOne implements IRouteViewModel {
      public id: string = '';
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id ?? '';
      }
    }

    @route('grandchild-two/:id?')
    @customElement({ name: 'grandchild-two', template: 'grandchild-two ${id}' })
    class GrandchildTwo implements IRouteViewModel {
      public id: string = '';
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id ?? '';
      }
    }

    @route({ path: 'child-one/:id?', routes: [GrandchildOne, GrandchildTwo] })
    @customElement({ name: 'child-one', template: 'child-one ${id} <au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
    class ChildOne implements IRouteViewModel {
      public id: string = '';
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id ?? '';
      }
    }

    @route({ path: 'child-two/:id?', routes: [GrandchildOne, GrandchildTwo] })
    @customElement({ name: 'child-two', template: 'child-two ${id} <au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
    class ChildTwo implements IRouteViewModel {
      public id: string = '';
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id ?? '';
      }
    }

    @route({ id: 'parent', path: 'parent/:id?', routes: [ChildOne, ChildTwo] })
    @customElement({ name: 'parent-host', template: 'parent ${id} <au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
    class Parent implements IRouteViewModel {
      public id: string = '';
      public loading(params: Params, _next: RouteNode, _current: RouteNode): void | Promise<void> {
        this.id = params.id ?? '';
      }
    }

    @route({ routes: [Parent] })
    @customElement({ name: 'root-host', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'init');

    await router.load('parent/(child-one/(grandchild-one+grandchild-two)+child-two/(grandchild-one+grandchild-two))');
    assert.html.textContent(host, 'parent child-one grandchild-one grandchild-two child-two grandchild-one grandchild-two', 'round#1 optional parameters omitted');

    await router.load('parent/alpha/(child-two/beta@vp1/(grandchild-one/111@vp2+grandchild-two/222@vp1)+child-one/gamma@vp2/(grandchild-one/333@vp2+grandchild-two/444@vp1))');
    assert.html.textContent(host, 'parent alpha child-two beta grandchild-two 222 grandchild-one 111 child-one gamma grandchild-two 444 grandchild-one 333', 'round#2 children swapped between viewports');

    await router.load('parent/(child-two/(grandchild-one/777+grandchild-two)+child-one/delta/(grandchild-two+grandchild-one/888))');
    assert.html.textContent(host, 'parent child-two grandchild-one 777 grandchild-two child-one delta grandchild-two grandchild-one 888', 'round#3 mixed optional params');

    await au.stop(true);
  });

  describe('default viewport content', function () {
    it('renders default component immediately when using default attribute on viewport', async function () {
      @customElement({ name: 'ce-one', template: 'ce1' })
      class CeOne { }

      @customElement({ name: 'ce-two', template: 'ce2' })
      class CeTwo { }

      @route({
        routes: [
          { path: 'ce-one', component: CeOne },
          { path: 'ce-two', component: CeTwo },
        ]
      })
      @customElement({
        name: 'ro-ot',
        template: '<au-viewport default="ce-one"></au-viewport>'
      })
      class Root { }

      const { au, container, host } = await start({ appRoot: Root, useEagerLoading });
      const router = container.get(IRouter);

      await tasksSettled();
      assert.html.textContent(host, 'ce1', 'initial - default component loaded');

      await router.load('ce-two');
      await tasksSettled();
      assert.html.textContent(host, 'ce2', 'after navigation to ce-two');

      await router.load('ce-one');
      await tasksSettled();
      assert.html.textContent(host, 'ce1', 'after navigation back to ce-one');

      await au.stop(true);
    });

    it('renders nested default components in hierarchical routing', async function () {
      @customElement({ name: 'gc-1', template: 'gc1' })
      class GC1 { }

      @route({
        routes: [
          { path: 'gc-1', component: GC1 },
        ]
      })
      @customElement({ name: 'c-1', template: 'c1 <au-viewport default="gc-1"></au-viewport>' })
      class C1 { }

      @route({
        routes: [
          { path: 'c1', component: C1 },
        ]
      })
      @customElement({ name: 'ro-ot', template: '<au-viewport default="c1"></au-viewport>' })
      class Root { }

      const { au, host } = await start({ appRoot: Root, useEagerLoading });

      await tasksSettled();
      assert.html.textContent(host, 'c1 gc1', 'initial - nested defaults loaded');

      await au.stop(true);
    });

    it('renders default components in sibling viewports', async function () {
      @customElement({ name: 'ce-one', template: 'ce1' })
      class CeOne { }

      @customElement({ name: 'ce-two', template: 'ce2' })
      class CeTwo { }

      @route({
        routes: [
          { path: 'ce-one', component: CeOne },
          { path: 'ce-two', component: CeTwo },
        ]
      })
      @customElement({
        name: 'ro-ot',
        template: '<au-viewport name="vp1" default="ce-one"></au-viewport> <au-viewport name="vp2" default="ce-two"></au-viewport>'
      })
      class Root { }

      const { au, host } = await start({ appRoot: Root, useEagerLoading });

      await tasksSettled();
      assert.html.textContent(host, 'ce1 ce2', 'initial - both defaults loaded');

      await au.stop(true);
    });
  });

  it('href navigation works with ancestor paths using ../ prefix', async function () {
    @customElement({ name: 'l-21', template: 'l21 <a href="../../l12"></a>' })
    class L21 { }

    @customElement({ name: 'l-22', template: 'l22 <a href="../../l11"></a>' })
    class L22 { }

    @route({
      routes: [
        { path: 'l21', component: L21 },
      ]
    })
    @customElement({ name: 'l-11', template: 'l11 <au-viewport default="l21"></au-viewport>' })
    class L11 { }

    @route({
      routes: [
        { path: 'l22', component: L22 },
      ]
    })
    @customElement({ name: 'l-12', template: 'l12 <au-viewport default="l22"></au-viewport>' })
    class L12 { }

    @route({
      routes: [
        { path: 'l11', component: L11 },
        { path: 'l12', component: L12 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport default="l11"></au-viewport>' })
    class Root { }

    const { au, host } = await start({ appRoot: Root, useEagerLoading });
    await tasksSettled();

    assert.html.textContent(host, 'l11 l21', 'initial - eager loaded with defaults');

    host.querySelector('a')!.click();
    await tasksSettled();
    assert.html.textContent(host, 'l12 l22', 'after clicking link to l12');

    host.querySelector('a')!.click();
    await tasksSettled();
    assert.html.textContent(host, 'l11 l21', 'after clicking link back to l11');

    await au.stop(true);
  });

});

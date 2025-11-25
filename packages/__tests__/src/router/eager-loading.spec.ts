import { IRouter, IRouteViewModel, Params, route, RouteNode } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

/**
 * These tests assert the specific utilities satisfied by the eager loading in the router.
 */
describe('router/eager-loading.spec.ts', function () {

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

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading: true });
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

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading: true });
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
    @customElement({ name: 'par-ent', template: 'parent <au-viewport name="vp1"></au-viewport> <au-viewport name="vp2"></au-viewport>' })
    class Parent { }

    @route({ routes: [Parent] })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading: true });
    const router = container.get(IRouter);

    assert.html.textContent(host, '', 'init');

    await router.load('parent/(child1/123+child2/456)');
    assert.html.textContent(host, 'parent child1 123 child2 456', 'round#1');

    await router.load('parent/789/(child1/321@vp2+child2/654@vp1)');
    assert.html.textContent(host, 'parent child2 654 child1 321', 'round#2');

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

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading: true });
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

    const { au, container, host } = await start({ appRoot: Root, useEagerLoading: true });
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

});

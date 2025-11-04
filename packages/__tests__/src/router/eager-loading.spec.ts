import { IRouter, IRouteViewModel, Params, route, RouteNode } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

/**
 * These tests assert the specific utilities satisfied by the eager loading in the router.
 */
describe('router/eager-loading.spec.ts', function () {

  // issue #2273
  it('enables navigating to parent/child route works when parent is configured with paths: ["parent", "parent/:id"]', async function () {

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
  it('enables navigating to parent/child route works when parent is configured with paths: ["parent/:id?"]', async function () {

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

  it('enables navigating to parent/child1@vp1+child2@vp2 route works when parent is configured with multiple viewports', async function () {

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
});

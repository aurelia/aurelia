import { IRouter, IRouteViewModel, Params, route, RouteNode } from '@aurelia/router';
import { customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/eager-loading.spec.ts', function () {

  // issue #2273
  it('navigating to parent/child route works when parent is configured with paths: ["parent", "parent/:id"]', async function () {

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

    await au.stop(true);
  });
});

/* eslint-disable @typescript-eslint/await-thenable */
import { resolve } from '@aurelia/kernel';
import { IRouteContext, IRouter, IRouteViewModel, NavigationInstruction, Params, route, RouteContext, RouteNode } from '@aurelia/router-lite';
import { CustomElement, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router-lite/generate-path.spec.ts', function () {

  abstract class AbstractVm implements IRouteViewModel {
    public readonly routeContext: IRouteContext = resolve(IRouteContext);
    private readonly _router: IRouter = resolve(IRouter);
    public generateRelativePath(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[], context?: RouteContext): string | Promise<string> {
      return this._router.generatePath(instructionOrInstructions, context ?? this);
    }

    protected params: Params;
    public loading(params: Params, _next: RouteNode, _current: RouteNode | null): void | Promise<void> {
      this.params = structuredClone(params);
    }
  }

  it('flat hierarchy', async function () {
    @customElement({ name: 'c-1', template: 'c1' })
    class C1 extends AbstractVm { }

    @customElement({ name: 'c-2', template: 'c2' })
    class C2 extends AbstractVm { }

    @customElement({ name: 'c-3', template: 'c3 ${params.id}' })
    class C3 extends AbstractVm { }

    @route({
      routes: [
        { path: ['', 'c1'], component: C1 },
        C2,
        { id: 'bar', path: 'foo/:id', component: C3 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container, rootVm } = await start({ appRoot: Root, registrations: [C1, C2, C3] });

    assert.html.textContent(host, 'c1', 'init');

    const router = container.get(IRouter);

    // round#1
    let expected = 'c-2';
    let path = await router.generatePath(C2);
    assert.strictEqual(path, expected, 'round#1 - generatePath(C2)');

    path = await router.generatePath(C2, rootVm);
    assert.strictEqual(path, expected, 'round#1 - generatePath(C2, rootVm)');

    path = await router.generatePath('c-2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\')');

    path = await router.generatePath('c-2', rootVm);
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', rootVm)');

    const c1 = CustomElement.for<C1>(host.querySelector('c-1')!).viewModel;
    path = await c1.generateRelativePath('../c-2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'../c-2\', C1)');

    path = await c1.generateRelativePath('c-2', c1.routeContext.parent);
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', C1)');

    await router.load(path);
    assert.html.textContent(host, 'c2', 'round#1 - load(path)');

    // round#2
    expected = 'foo/1';
    path = await router.generatePath({ component: C3, params: { id: 1 } });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } })');

    path = await router.generatePath({ component: C3, params: { id: 1 } }, rootVm);
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } }, rootVm)');

    path = await router.generatePath({ component: 'bar', params: { id: 1 } });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } })');

    path = await router.generatePath({ component: 'bar', params: { id: 1 } }, rootVm);
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, rootVm)');

    const c2 = CustomElement.for<C1>(host.querySelector('c-2')!).viewModel;
    path = await c2.generateRelativePath({ component: '../bar', params: { id: 1 } });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'../bar\', params: { id: 1 } }, C2)');

    path = await c2.generateRelativePath({ component: 'bar', params: { id: 1 } }, c2.routeContext.parent);
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, C2)');

    await router.load(path);
    assert.html.textContent(host, 'c3 1', 'round#2 - load(path)');

    // round#3
    expected = '';
    path = await router.generatePath(C1);
    assert.strictEqual(path, expected, 'round#3 - generatePath(C1)');

    path = await router.generatePath(C1, rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath(C1, rootVm)');

    path = await router.generatePath('');
    assert.strictEqual(path, expected, 'round#3 - generatePath(\'\')');

    path = await router.generatePath('', rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath(\'\', rootVm)');

    path = await router.generatePath({ component: C1 });
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 })');

    path = await router.generatePath({ component: C1 }, rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 }, rootVm)');

    path = await router.generatePath({ component: '' });
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' })');

    path = await router.generatePath({ component: '' }, rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' }, rootVm)');

    await router.load(path);
    assert.html.textContent(host, 'c1', 'round#3 - load(path)');

    await au.stop(true);
  });

  it.only('multi-level hierarchy', async function () {
    @customElement({ name: 'c-1', template: 'c1' })
    class C1 extends AbstractVm { }

    @customElement({ name: 'c-2', template: 'c2' })
    class C2 extends AbstractVm { }

    @route({ id: 'c3', path: 'foo/:id' })
    @customElement({ name: 'c-3', template: 'c3 ${params.id}' })
    class C3 extends AbstractVm { }

    @route({ id: 'c4', path: ['bar/:id1/:id2', 'fizz/:id3/:id4?', 'buzz/:id5/*rest'] })
    @customElement({
      name: 'c-4', template: `c4
      <template switch.bind="view">
        <template case="v1">\${params.id1} \${params.id2}</template>
        <template case="v2">\${params.id3} \${params.id4}</template>
        <template case="v3">\${params.id5} \${params.rest}</template>
      </template>` })
    class C4 extends AbstractVm {
      private view: 'v1' | 'v2' | 'v3';
      public async loading(params: Params, _next: RouteNode, _current: RouteNode | null): Promise<void> {
        await super.loading(params, _next, _current);
        this.view = params.id1 != null
          ? 'v1'
          : params.id3 != null
            ? 'v2'
            : 'v3';
      }
    }

    @route({
      routes: [
        { path: ['', 'c1'], component: C1 },
        C3,
      ]
    })
    @customElement({ name: 'p-1', template: 'p1 <au-viewport></au-viewport>' })
    class P1 extends AbstractVm { }

    @route({
      routes: [
        { path: ['', 'c2'], component: C2 },
        C4,
      ]
    })
    @customElement({ name: 'p-2', template: 'p2 <au-viewport></au-viewport>' })
    class P2 extends AbstractVm { }

    @route({
      routes: [
        { id: 'p1', path: ['', 'p1'], component: P1 },
        { id: 'p2', path: 'p2', component: P2 },
      ]
    })
    @customElement({ name: 'ro-ot', template: '<au-viewport></au-viewport>' })
    class Root { }

    const { host, au, container, rootVm } = await start({ appRoot: Root, registrations: [C1, C2, C3, C4, P1, P2] });

    assert.html.textContent(host, 'p1 c1', 'init');

    const router = container.get(IRouter);

    // round#1
    let expected = 'p2';
    let path = await router.generatePath(P2);
    assert.strictEqual(path, expected, 'round#1 - generatePath(P2)');

    path = await router.generatePath(P2, rootVm);
    assert.strictEqual(path, expected, 'round#1 - generatePath(P2, rootVm)');

    path = await router.generatePath('p2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\')');

    path = await router.generatePath('p2', rootVm);
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', rootVm)');

    const p1 = CustomElement.for<P1>(host.querySelector('p-1')!).viewModel;
    path = await p1.generateRelativePath('../p2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'../p2\', P1)');

    path = await p1.generateRelativePath('p2', p1.routeContext.parent);
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', P1)');

    const c1 = CustomElement.for<C1>(host.querySelector('c-1')!).viewModel;
    path = await c1.generateRelativePath('../../p2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'../../p2\', C1)');

    path = await c1.generateRelativePath('p2', c1.routeContext.parent.parent);
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'p2\', C1)');

    await router.load(path);
    assert.html.textContent(host, 'p2 c2', 'round#1 - load(path)');

    // round#2
    expected = 'p1/foo/1';
    path = await router.generatePath({ component: 'p1', children: [{ component: 'c3', params: { id: 1 } }] });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'p1\', children: [{ component: \'c3\', params: { id: 1 } }] })');

    // const c2 = CustomElement.for<C2>(host.querySelector('c-2')!).viewModel;
    // path = c2.generateRelativePath({ component: 'p1', children: [{ component: 'c3', params: { id: 1 } }] }, c2.routeContext.parent.parent);
    // assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'p1\', children: [{ component: \'c3\', params: { id: 1 } }] })');

    await au.stop(true);
  });

  // flat hierarchy with sibling viewports
  // multi-level hierarchy with sibling viewports

});

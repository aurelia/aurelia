import { IRouter, IRouteViewModel, NavigationInstruction, Params, route, RouteNode } from '@aurelia/router-lite';
import { CustomElement, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';
import { resolve } from '@aurelia/kernel';

describe.only('router-lite/generate-path.spec.ts', function () {
  abstract class AbstractVm {
    private readonly _router: IRouter = resolve(IRouter);
    public generateRelativePath(instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[]): string {
      return this._router.generatePath(instructionOrInstructions, this);
    }
  }
  it('flat hierarchy', async function () {
    @customElement({ name: 'c-1', template: 'c1' })
    class C1 extends AbstractVm { }

    @customElement({ name: 'c-2', template: 'c2' })
    class C2 extends AbstractVm { }

    @customElement({ name: 'c-3', template: 'c3 ${id}' })
    class C3 extends AbstractVm implements IRouteViewModel {
      private id: string;
      public loading(params: Params, _next: RouteNode, _current: RouteNode | null): void | Promise<void> {
        this.id = params.id;
      }
    }

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
    let path = router.generatePath(C2);
    assert.strictEqual(path, expected, 'round#1 - generatePath(C2)');

    path = router.generatePath(C2, rootVm);
    assert.strictEqual(path, expected, 'round#1 - generatePath(C2, rootVm)');

    path = router.generatePath('c-2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\')');

    path = router.generatePath('c-2', rootVm);
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'c-2\', rootVm)');

    path = CustomElement.for<C1>(host.querySelector('c-1')!).viewModel.generateRelativePath('../c-2');
    assert.strictEqual(path, expected, 'round#1 - generatePath(\'../c-2\', C1)');

    await router.load(path);
    assert.html.textContent(host, 'c2', 'round#1 - load(path)');

    // round#2
    expected = 'foo/1';
    path = router.generatePath({ component: C3, params: { id: 1 } });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } })');

    path = router.generatePath({ component: C3, params: { id: 1 } }, rootVm);
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: C3, params: { id: 1 } }, rootVm)');

    path = router.generatePath({ component: 'bar', params: { id: 1 } });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } })');

    path = router.generatePath({ component: 'bar', params: { id: 1 } }, rootVm);
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'bar\', params: { id: 1 } }, rootVm)');

    path = CustomElement.for<C1>(host.querySelector('c-2')!).viewModel.generateRelativePath({ component: '../bar', params: { id: 1 } });
    assert.strictEqual(path, expected, 'round#2 - generatePath({ component: \'../bar\', params: { id: 1 } }, C2)');

    await router.load(path);
    assert.html.textContent(host, 'c3 1', 'round#2 - load(path)');

    // round#3
    expected = '';
    path = router.generatePath(C1);
    assert.strictEqual(path, expected, 'round#3 - generatePath(C1)');

    path = router.generatePath(C1, rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath(C1, rootVm)');

    path = router.generatePath('');
    assert.strictEqual(path, expected, 'round#3 - generatePath(\'\')');

    path = router.generatePath('', rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath(\'\', rootVm)');

    path = router.generatePath({ component: C1 });
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 })');

    path = router.generatePath({ component: C1 }, rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: C1 }, rootVm)');

    path = router.generatePath({ component: '' });
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' })');

    path = router.generatePath({ component: '' }, rootVm);
    assert.strictEqual(path, expected, 'round#3 - generatePath({ component: \'c-1\' }, rootVm)');

    await router.load(path);
    assert.html.textContent(host, 'c1', 'round#3 - load(path)');

    await au.stop(true);
  });
});

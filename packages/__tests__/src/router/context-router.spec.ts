import { lazy, optional, resolve } from '@aurelia/kernel';
import { IContextRouter, route } from '@aurelia/router';
import { CustomElement, customElement } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';
import { start } from './_shared/create-fixture.js';

describe('router/context-router.spec.ts', function () {

  abstract class BaseViewModel {
    public readonly lazyContextRouter: () => IContextRouter = resolve(lazy(IContextRouter));
    public readonly contextRouter?: IContextRouter = resolve(optional(IContextRouter));
  }

  it('captures context and enables context-specific routing', async function () {

    @customElement({ name: 'gc-11', template: 'gc-11' })
    class Gc11 extends BaseViewModel { }

    @customElement({ name: 'gc-12', template: 'gc-12' })
    class Gc12 extends BaseViewModel { }

    @customElement({ name: 'gc-13', template: 'gc-13' })
    class Gc13 extends BaseViewModel { }

    @customElement({ name: 'gc-14', template: 'gc-14' })
    class Gc14 extends BaseViewModel { }

    @route({
      path: 'c1',
      routes: [
        { path: 'gc1', component: Gc11 },
        { path: 'gc2', component: Gc12 },
      ]
    })
    @customElement({ name: 'c-11', template: 'c-11 <au-viewport></au-viewport>' })
    class C11 extends BaseViewModel { }

    @route({
      path: 'c2',
      routes: [
        { path: 'gc1', component: Gc13 },
        { path: 'gc2', component: Gc14 },
      ]
    })
    @customElement({ name: 'c-12', template: 'c-12 <au-viewport></au-viewport>' })
    class C12 extends BaseViewModel { }

    @route({ routes: [C11, C12] })
    @customElement({ name: 'ro-ot', template: 'root <au-viewport></au-viewport>' })
    class Root extends BaseViewModel { }

    const { au, host, rootVm } = await start({ appRoot: Root });

    assert.equal(rootVm.contextRouter, null, 'For app-root context router should have been resolved only via lazy injection.');

    await rootVm.lazyContextRouter().load('c1/gc1');
    assert.html.textContent(host, 'root c-11 gc-11', 'round#1');

    let childVm = CustomElement.for<C11>(host.querySelector('c-11')!).viewModel;
    await childVm.contextRouter.load('gc2');
    assert.html.textContent(host, 'root c-11 gc-12', 'round#2');

    let grandChildVm = CustomElement.for<Gc12>(host.querySelector('gc-12')!).viewModel;
    await grandChildVm.contextRouter.load('../gc1');
    assert.html.textContent(host, 'root c-11 gc-11', 'round#3');

    grandChildVm = CustomElement.for<Gc11>(host.querySelector('gc-11')!).viewModel;
    await grandChildVm.contextRouter.load('../../c2/gc2');
    assert.html.textContent(host, 'root c-12 gc-14', 'round#4');

    childVm = CustomElement.for<C12>(host.querySelector('c-12')!).viewModel;
    await childVm.contextRouter.load('gc1');
    assert.html.textContent(host, 'root c-12 gc-13', 'round#5');

    await au.stop(true);
  });
});

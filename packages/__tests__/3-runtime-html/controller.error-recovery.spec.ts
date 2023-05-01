import { Class } from '@aurelia/kernel';
import { Aurelia, ICustomElementController, ICustomElementViewModel, IHydratedController, customElement } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

describe('3-runtime-html/controller.error-recovery.spec.ts', function () {
  async function start<TAppRoot>(appRoot: Class<TAppRoot>, ...registrations: any[]) {
    const ctx = TestContext.create();
    const { container } = ctx;

    container.register(...registrations);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    let startUpError: unknown = null;
    try {
      await au.app({ component: appRoot, host }).start();
    } catch (e) {
      startUpError = e;
    }
    const rootVm = au.root.controller.viewModel as TAppRoot;
    return { host, au, container, rootVm, startUpError };
  }

  it('Aurelia instance with error on binding can be stopped  - root', async function () {
    @customElement({ name: 'ro-ot', template: '' })
    class Root implements ICustomElementViewModel {
      binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        throw new Error('Synthetic test error');
      }
    }

    const { startUpError, au } = await start(Root);

    assert.instanceOf(startUpError, Error);

    let stopError: unknown = null;
    try {
      await au.stop(true);
    } catch (e) {
      stopError = e;
    }

    assert.strictEqual(stopError, null);
  });

  it('Aurelia instance with error on binding can be stopped - children CE', async function () {
    @customElement({ name: 'c-1', template: '' })
    class C1 implements ICustomElementViewModel {
      binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        throw new Error('Synthetic test error');
      }
    }

    @customElement({ name: 'ro-ot', template: '<c-1></c-1>' })
    class Root { }

    const { startUpError, au } = await start(Root, C1);

    assert.instanceOf(startUpError, Error);

    let stopError: unknown = null;
    try {
      await au.stop(true);
    } catch (e) {
      stopError = e;
    }

    assert.strictEqual(stopError, null);
  });

  it('Aurelia instance with error on binding can be stopped - if.bind', async function () {
    @customElement({ name: 'c-1', template: 'c1' })
    class C1 { }

    @customElement({ name: 'c-2', template: '' })
    class C2 implements ICustomElementViewModel {
      binding(_initiator: IHydratedController, _parent: IHydratedController): void | Promise<void> {
        throw new Error('Synthetic test error');
      }
    }

    @customElement({ name: 'ro-ot', template: '<c-1 if.bind="showC1"></c-1><c-2 else></c-2>' })
    class Root implements ICustomElementViewModel {
      public showC1: boolean = true;
      public readonly $controller!: ICustomElementController<this>;
    }

    const { au, rootVm, host } = await start(Root, C1, C2);

    assert.html.textContent(host, 'c1');
    try {
      rootVm.showC1 = false;
      assert.fail('expected error');
    } catch (e) {
      assert.instanceOf(e, Error, 'swap');
    }

    assert.html.textContent(host, '');

    rootVm.showC1 = true;
    assert.html.textContent(host, 'c1');

    let error: unknown = null;
    try {
      await au.stop(true);
    } catch (e) {
      error = e;
    }

    assert.strictEqual(error, null, 'stop');
  });
});

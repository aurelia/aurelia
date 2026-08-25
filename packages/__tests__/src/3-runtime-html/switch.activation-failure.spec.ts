import { DI, resolve } from '@aurelia/kernel';
import { Aurelia, customElement, ICustomElementController, ICustomElementViewModel, Switch } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('3-runtime-html/switch.activation-failure.spec.ts', function () {

  interface IPromiseManager {
    createPromise(): Promise<void>;
    reject(err: unknown): void;
    currentPromise: Promise<void> | null;
  }
  const IPromiseManager = DI.createInterface<IPromiseManager>('IPromiseManager', x => x.singleton(PromiseManager));

  class PromiseManager implements IPromiseManager {
    private _reject: ((err: unknown) => void) | null = null;
    private _currentPromise: Promise<void> | null = null;
    public get currentPromise(): Promise<void> | null { return this._currentPromise; }

    public createPromise(): Promise<void> {
      return this._currentPromise = new Promise<void>((_, rej) => { this._reject = rej; });
    }

    public reject(err: unknown): void {
      this._reject?.(err);
    }
  }

  it('recovers when case activation fails and switch value changes again', async function () {
    @customElement({ name: 'c-a', template: 'A' })
    class CaseA implements ICustomElementViewModel {
      private readonly promiseManager = resolve(IPromiseManager);

      public binding(): void | Promise<void> {
        return this.promiseManager.createPromise();
      }
    }

    @customElement({ name: 'c-b', template: 'B' })
    class CaseB implements ICustomElementViewModel {}

    @customElement({
      name: 'app',
      template: `<div switch.bind="value"><c-a case="a"></c-a><c-b case="b"></c-b></div>`,
      dependencies: [CaseA, CaseB],
    })
    class App {
      public value: string = 'b';
      public readonly $controller!: ICustomElementController;
    }

    const ctx = TestContext.create();
    const container = ctx.container;
    container.register(IPromiseManager);

    const au = new Aurelia(container);
    const host = ctx.createElement('div');

    await au.app({ component: App, host }).start();

    const app = au.root.controller.viewModel as App;
    const promiseManager = container.get(IPromiseManager);

    // Get the Switch VM
    const appCtrl = au.root.controller;
    let switchVm: Switch | undefined;
    for (const child of appCtrl.children ?? []) {
      if (child.viewModel instanceof Switch) {
        switchVm = child.viewModel;
        break;
      }
    }

    // Initial state: showing case B
    assert.html.textContent(host, 'B', 'initial state');

    // Switch to case A (which has async binding that will be rejected)
    app.value = 'a';

    // Let the switch start processing (microtask)
    await Promise.resolve();

    // Reject the activation promise while activation is in progress
    promiseManager.reject(new Error('Synthetic activation failure'));

    // Wait for rejection to be processed and switch queue to settle
    await Promise.allSettled([promiseManager.currentPromise, switchVm?.promise]);
    await Promise.resolve();

    // Now switch to case B - this should work
    app.value = 'b';

    // Wait for the switch queue to complete
    await Promise.allSettled([switchVm?.promise]);
    await Promise.resolve();

    // Should show B again
    assert.html.textContent(host, 'B', 'after recovery');

    await au.stop();
  });
});

import { DI, resolve } from '@aurelia/kernel';
import { Aurelia, customElement, ICustomElementController, ICustomElementViewModel, Switch } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('3-runtime-html/switch.activation-failure.spec.ts', function () {

  interface IPromiseManager {
    createPromise(): Promise<void>;
    reject(err: unknown): void;
  }
  const IPromiseManager = DI.createInterface<IPromiseManager>('IPromiseManager', x => x.singleton(PromiseManager));

  class PromiseManager implements IPromiseManager {
    private _reject: ((err: unknown) => void) | null = null;

    public createPromise(): Promise<void> {
      return new Promise<void>((_, rej) => { this._reject = rej; });
    }

    public reject(err: unknown): void {
      this._reject?.(err);
    }
  }

  it('keeps a failed case activation terminal for the switch queue', async function () {
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
    const activationError = new Error('Synthetic activation failure');
    promiseManager.reject(activationError);

    let reportedError: unknown;
    try {
      await switchVm?.promise;
    } catch (error) {
      reportedError = error;
    }
    assert.strictEqual(reportedError, activationError);

    // A later value change remains behind the rejected queue.
    app.value = 'b';
    await Promise.resolve();

    let repeatedError: unknown;
    try {
      await switchVm?.promise;
    } catch (error) {
      repeatedError = error;
    }
    assert.strictEqual(repeatedError, activationError);

    host.remove();
  });
});

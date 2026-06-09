import { configureTaskQueue, queueTask, tasksSettled } from '@aurelia/runtime';
import { Aurelia, customElement, type ICustomElementController, type ICustomElementViewModel } from '@aurelia/runtime-html';
import { assert, TestContext } from '@aurelia/testing';

describe('3-runtime-html/task-queue-yield.integration.spec.ts', function () {
  it('settles to the latest input state when input occurs between yielded flush chunks', async function () {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    const previousOptions = configureTaskQueue({
      flushBudget: 0,
    });

    @customElement({ name: 'app', template: '<input value.bind="message"><span>${message}</span>' })
    class App implements ICustomElementViewModel {
      public $controller!: ICustomElementController<this>;
      public message: string = 'one';
      public input!: HTMLInputElement;
      public span!: HTMLSpanElement;

      public created() {
        this.input = this.$controller.nodes.firstChild as HTMLInputElement;
        this.span = this.$controller.nodes.lastChild as HTMLSpanElement;
      }
    }

    try {
      const component = new App();
      au.app({ host, component });

      await au.start();
      assert.strictEqual(component.input.value, 'one', 'input precondition');
      assert.strictEqual(component.span.textContent, 'one', 'text precondition');

      queueTask(() => {
        component.message = 'two';
      });

      await Promise.resolve();
      component.input.value = 'typed';
      component.input.dispatchEvent(new ctx.CustomEvent('input'));
      await tasksSettled();

      assert.strictEqual(component.message, 'typed', 'source should keep the input value');
      assert.strictEqual(component.input.value, 'typed', 'input should not be overwritten by an older queued write');
      assert.strictEqual(component.span.textContent, 'typed', 'text binding should settle to the latest source value');

      await au.stop();
    } finally {
      configureTaskQueue(previousOptions);
    }
  });

  it('does not apply queued layout property writes while the controller is deactivating', async function () {
    const ctx = TestContext.create();
    const au = new Aurelia(ctx.container);
    const host = ctx.createElement('div');
    let resolveDetaching: (() => void) | undefined;
    let stopPromise: void | Promise<void> | undefined;
    const previousOptions = configureTaskQueue({
      flushBudget: 0,
    });

    @customElement({ name: 'app', template: '<input value.bind="message">' })
    class App implements ICustomElementViewModel {
      public $controller!: ICustomElementController<this>;
      public message: string = 'one';
      public input!: HTMLInputElement;

      public created() {
        this.input = this.$controller.nodes.firstChild as HTMLInputElement;
      }

      public detaching() {
        return new Promise<void>(resolve => {
          resolveDetaching = resolve;
        });
      }
    }

    try {
      const component = new App();
      au.app({ host, component });

      await au.start();
      assert.strictEqual(component.input.value, 'one', 'precondition');

      queueTask(() => {
        component.message = 'two';
      });

      await Promise.resolve();
      stopPromise = au.stop();
      await wait(20);

      assert.strictEqual(component.input.value, 'one', 'queued update should not write while deactivating');

      resolveDetaching?.();
      await stopPromise;
      await tasksSettled();
    } finally {
      resolveDetaching?.();
      await stopPromise;
      configureTaskQueue(previousOptions);
    }
  });
});

function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

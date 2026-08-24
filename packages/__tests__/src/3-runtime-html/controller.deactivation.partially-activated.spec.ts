import {
  customElement,
  type ICustomElementController,
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

class Deferred<T = void> {
  public readonly promise: Promise<T>;
  public resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason?: unknown) => void;

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

type ActivationPhase = 'binding' | 'bound' | 'attaching' | 'attached';

describe('3-runtime-html/controller.deactivation.partially-activated.spec.ts', function () {
  for (const pendingPhase of ['binding', 'bound', 'attaching', 'attached'] as const) {
    it(`cancels activation while ${pendingPhase} is pending`, async function () {
      let child!: Child;
      let phase: ActivationPhase | null = null;
      let gate = new Deferred();
      const calls: string[] = [];

      @customElement({ name: `pending-${pendingPhase}-child`, template: 'child' })
      class Child {
        public readonly $controller!: ICustomElementController<this>;

        public constructor() {
          child = this;
        }

        public binding(): void | Promise<void> {
          return this.runPhase('binding');
        }

        public bound(): void | Promise<void> {
          return this.runPhase('bound');
        }

        public attaching(): void | Promise<void> {
          return this.runPhase('attaching');
        }

        public attached(): void | Promise<void> {
          return this.runPhase('attached');
        }

        public detaching(): void {
          calls.push('detaching');
        }

        public unbinding(): void {
          calls.push('unbinding');
        }

        private runPhase(current: ActivationPhase): void | Promise<void> {
          calls.push(`${current}:enter`);
          if (phase === current) {
            return gate.promise.then(() => { calls.push(`${current}:leave`); });
          }
          calls.push(`${current}:leave`);
        }
      }

      const fixture = createFixture(
        `<pending-${pendingPhase}-child></pending-${pendingPhase}-child>`,
        class {},
        [Child],
      );
      await fixture.started;

      const parent = fixture.au.root.controller;
      await child.$controller.deactivate(child.$controller, parent);
      assert.strictEqual(child.$controller.isActive, false);

      calls.length = 0;
      phase = pendingPhase;
      gate = new Deferred();

      const activation = child.$controller.activate(
        child.$controller,
        parent,
        parent.scope,
      );
      assert.instanceOf(activation, Promise);
      const phaseOrder: readonly ActivationPhase[] = ['binding', 'bound', 'attaching', 'attached'];
      const priorCalls = phaseOrder
        .slice(0, phaseOrder.indexOf(pendingPhase))
        .flatMap(current => [`${current}:enter`, `${current}:leave`]);
      assert.deepStrictEqual(calls, [...priorCalls, `${pendingPhase}:enter`]);

      const cancellation = child.$controller.deactivate(child.$controller, parent);
      assert.strictEqual(cancellation, activation);
      assert.strictEqual(child.$controller.isActive, false);

      gate.resolve();
      await activation;

      assert.strictEqual(child.$controller.isActive, false);
      assert.strictEqual(child.$controller.isBound, false);
      assert.strictEqual(fixture.appHost.textContent, '');
      assert.deepStrictEqual(calls, [
        ...priorCalls,
        `${pendingPhase}:enter`,
        `${pendingPhase}:leave`,
        ...(
          pendingPhase === 'binding'
            ? ['unbinding']
            : ['detaching', 'unbinding']
        ),
      ]);

      await fixture.tearDown();
    });
  }

  it('reports an activation error that occurs during cancellation', async function () {
    const gate = new Deferred();
    const error = new Error('attaching failed during cancellation');
    let child!: Child;
    let shouldWait = false;

    @customElement({ name: 'failing-cancelled-activation-child', template: 'child' })
    class Child {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): void | Promise<void> {
        return shouldWait ? gate.promise : void 0;
      }
    }

    const fixture = createFixture(
      '<failing-cancelled-activation-child></failing-cancelled-activation-child>',
      class {},
      [Child],
    );
    await fixture.started;

    const parent = fixture.au.root.controller;
    await child.$controller.deactivate(child.$controller, parent);
    shouldWait = true;

    const activation = child.$controller.activate(child.$controller, parent, parent.scope) as Promise<void>;
    assert.instanceOf(activation, Promise);
    assert.strictEqual(child.$controller.deactivate(child.$controller, parent), activation);

    gate.reject(error);
    let reportedError: unknown;
    try {
      await activation;
    } catch (reason) {
      reportedError = reason;
    }
    assert.strictEqual(reportedError, error);

    Object.defineProperty(fixture, 'torn', { configurable: true, value: true });
    fixture.testHost.remove();
  });
});

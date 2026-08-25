import {
  CustomElement,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
} from '@aurelia/testing';

class Deferred {
  public readonly promise: Promise<void>;
  public resolve!: () => void;
  public reject!: (reason: unknown) => void;

  public constructor() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

describe('3-runtime-html/controller.descendant-rejection.spec.ts', function () {
  it('keeps a descendant rejection on the initiator boundary without a host-unhandled duplicate', async function () {
    const activation = new Deferred();
    const error = new Error('descendant activation failed');
    const Child = CustomElement.define({ name: 'rejecting-descendant', template: 'child' }, class {
      public attaching(): Promise<void> {
        return activation.promise;
      }
    });
    const fixture = createFixture(
      '<rejecting-descendant></rejecting-descendant>',
      class App {},
      [Child],
      false,
    );
    const unhandled = observeUnhandledRejections();

    try {
      const hookFailure = captureRejection(activation.promise);
      const start = fixture.start();
      assert.instanceOf(start, Promise);
      const startFailure = captureRejection(start as Promise<void>);

      activation.reject(error);

      assert.strictEqual(await hookFailure, error, 'the application hook Promise keeps its original rejection');
      assert.strictEqual(await startFailure, error, 'the initiator reports the original descendant error');
      await waitForUnhandledRejection();
      assert.deepStrictEqual(unhandled.reasons, []);
      assert.strictEqual(fixture.torn, true);
    } finally {
      unhandled.dispose();
    }
  });

  it('does not host-report a descendant rejection recovered by a value-driven if swap', async function () {
    const activation = new Deferred();
    const deactivationStarted = new Deferred();
    const error = new Error('value-driven descendant activation failed');
    const Child = CustomElement.define({ name: 'recovering-descendant', template: 'child' }, class {
      public attaching(): Promise<void> {
        return activation.promise;
      }
      public detaching(): void {
        deactivationStarted.resolve();
      }
    });
    const fixture = createFixture(
      '<recovering-descendant if.bind="show"></recovering-descendant><span else>fallback</span>',
      class App { public show = false; },
      [Child],
    );
    const unhandled = observeUnhandledRejections();

    try {
      const hookFailure = captureRejection(activation.promise);
      fixture.component.show = true;
      activation.reject(error);

      assert.strictEqual(await hookFailure, error);
      await deactivationStarted.promise;
      fixture.component.show = false;
      assert.strictEqual(
        await waitForMicrotasks(() => fixture.appHost.textContent === 'fallback'),
        true,
        'the owning if remains reusable after cleaning up the failed descendant',
      );

      await waitForUnhandledRejection();
      assert.deepStrictEqual(unhandled.reasons, []);
      await fixture.stop(true);
    } finally {
      unhandled.dispose();
    }
  });

  it('keeps a descendant deactivation rejection on the stop boundary without a host-unhandled duplicate', async function () {
    const deactivation = new Deferred();
    const error = new Error('descendant deactivation failed');
    const Child = CustomElement.define({ name: 'rejecting-detaching-descendant', template: 'child' }, class {
      public detaching(): Promise<void> {
        return deactivation.promise;
      }
    });
    const fixture = createFixture(
      '<rejecting-detaching-descendant></rejecting-detaching-descendant>',
      class App {},
      [Child],
    );
    const unhandled = observeUnhandledRejections();

    try {
      const hookFailure = captureRejection(deactivation.promise);
      const stop = fixture.stop(true);
      assert.instanceOf(stop, Promise);
      const stopFailure = captureRejection(stop as Promise<void>);

      deactivation.reject(error);

      assert.strictEqual(await hookFailure, error, 'the application hook Promise keeps its original rejection');
      assert.strictEqual(await stopFailure, error, 'the stop initiator reports the original descendant error');
      await waitForUnhandledRejection();
      assert.deepStrictEqual(unhandled.reasons, []);
    } finally {
      unhandled.dispose();
      fixture.testHost.remove();
    }
  });
});

function observeUnhandledRejections(): { readonly reasons: unknown[]; readonly dispose: () => void } {
  const reasons: unknown[] = [];
  let dispose: () => void;

  if (typeof process !== 'undefined' && typeof process.on === 'function') {
    const handler = (reason: unknown): void => { reasons.push(reason); };
    process.on('unhandledRejection', handler);
    dispose = () => { process.off('unhandledRejection', handler); };
  } else {
    const handler = (event: PromiseRejectionEvent): void => {
      reasons.push(event.reason);
      event.preventDefault();
    };
    addEventListener('unhandledrejection', handler);
    dispose = () => { removeEventListener('unhandledrejection', handler); };
  }

  return { reasons, dispose };
}

async function captureRejection(promise: Promise<void>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  assert.fail('Expected promise to reject');
}

async function waitForMicrotasks(predicate: () => boolean): Promise<boolean> {
  for (let i = 0; i < 20 && !predicate(); ++i) {
    await Promise.resolve();
  }
  return predicate();
}

function waitForUnhandledRejection(): Promise<void> {
  // Chrome reports unhandled rejections on a later host turn than Node.
  return new Promise(resolve => setTimeout(resolve, 50));
}

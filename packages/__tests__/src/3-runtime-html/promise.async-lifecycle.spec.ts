import { Aurelia, CustomElement } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { assert, createFixture, TestContext } from '@aurelia/testing';

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

function waitForUnhandledRejection(): Promise<void> {
  // Chrome reports unhandled rejections on a later host turn than Node.
  return new Promise(resolve => setTimeout(resolve, 50));
}

describe('3-runtime-html/promise.async-lifecycle.spec.ts', function () {
  for (const settle of ['resolve', 'reject'] as const) {
    it(`ignores a promise that settles (${settle}) after the app is stopped and disposed`, async function () {
      const deferred = new Deferred<number>();
      const ctx = TestContext.create();
      const host = ctx.doc.createElement('div');
      ctx.doc.body.appendChild(host);
      const App = CustomElement.define({
        name: 'app-root',
        template: '<div promise.bind="p"><i pending>pending</i><b then.from-view="v">${v}</b><u catch>failed</u></div>',
      }, class { public p = deferred.promise; });
      const au = new Aurelia(ctx.container).app({ host, component: App });
      const unhandled = observeUnhandledRejections();

      try {
        await au.start();
        await tasksSettled();
        assert.html.textContent(host, 'pending');

        await au.stop(true);
        if (settle === 'resolve') {
          deferred.resolve(42);
        } else {
          deferred.reject(new Error('late failure'));
        }
        await waitForUnhandledRejection();

        assert.deepStrictEqual(unhandled.reasons, []);
        assert.html.textContent(host, '');
      } finally {
        unhandled.dispose();
        host.remove();
      }
    });
  }

  it('shows the fulfilled branch once when the promise settles while a cached if hides it', async function () {
    const deferred = new Deferred<number>();
    let attached = 0;
    const Fulfilled = CustomElement.define({
      name: 'fulfilled-value',
      template: '${value}',
      bindables: ['value'],
    }, class {
      public attached(): void { ++attached; }
    });
    const unhandled = observeUnhandledRejections();
    const { component, assertText, stop } = createFixture(
      '<div if.bind="show" promise.bind="p"><i pending>pending</i><fulfilled-value then.from-view="v" value.bind="v"></fulfilled-value></div>',
      class { public show = true; public p = deferred.promise; },
      [Fulfilled],
    );

    try {
      await tasksSettled();
      assertText('pending');

      component.show = false;
      await tasksSettled();
      deferred.resolve(42);
      await waitForUnhandledRejection();
      assertText('');

      component.show = true;
      await tasksSettled();
      await waitForUnhandledRejection();
      assertText('42');
      assert.strictEqual(attached, 1, 'the fulfilled view is activated once');
      assert.deepStrictEqual(unhandled.reasons, []);
    } finally {
      unhandled.dispose();
      await stop(true);
    }
  });

  for (const settle of ['resolve', 'reject'] as const) {
    it(`settles (${settle}) only through the current attachment after a hide and show while pending`, async function () {
      const deferred = new Deferred<number>();
      let attached = 0;
      const Settled = CustomElement.define({
        name: 'settled-view',
        template: '${value}',
        bindables: ['value'],
      }, class {
        public attached(): void { ++attached; }
      });
      const unhandled = observeUnhandledRejections();
      const { component, assertText, stop } = createFixture(
        '<div if.bind="show" promise.bind="p"><i pending>pending</i>'
          + '<settled-view then.from-view="v" value.bind="v"></settled-view>'
          + '<settled-view catch.from-view="e" value.bind="e.message"></settled-view></div>',
        class { public show = true; public p = deferred.promise; },
        [Settled],
      );

      try {
        await tasksSettled();
        assertText('pending');

        component.show = false;
        await tasksSettled();
        component.show = true;
        await tasksSettled();
        assertText('pending');

        if (settle === 'resolve') {
          deferred.resolve(42);
        } else {
          deferred.reject(new Error('failed'));
        }
        await waitForUnhandledRejection();
        await tasksSettled();

        assertText(settle === 'resolve' ? '42' : 'failed');
        assert.strictEqual(attached, 1, 'the settled view is activated once');
        assert.deepStrictEqual(unhandled.reasons, []);
      } finally {
        unhandled.dispose();
        await stop(true);
      }
    });
  }
  it('does not activate the settled branch when the pending branch was still attaching at detach', async function () {
    const deferred = new Deferred<number>();
    const gate = new Deferred();
    let fulfilledAttached = 0;
    const PendingView = CustomElement.define({ name: 'pending-view', template: 'pending' }, class {
      public attaching(): Promise<void> { return gate.promise; }
    });
    const FulfilledView = CustomElement.define({ name: 'fulfilled-view', template: '${value}', bindables: ['value'] }, class {
      public attached(): void { ++fulfilledAttached; }
    });
    const unhandled = observeUnhandledRejections();
    const { component, assertText, stop } = createFixture(
      '<div if.bind="show" promise.bind="p"><pending-view pending></pending-view>'
        + '<fulfilled-view then.from-view="v" value.bind="v"></fulfilled-view></div>',
      class { public show = true; public p = deferred.promise; },
      [PendingView, FulfilledView],
    );

    try {
      // The pending view is still attaching when the promise settles, so the fulfilled view waits for it.
      deferred.resolve(42);
      await waitForUnhandledRejection();
      component.show = false;
      gate.resolve();
      await waitForUnhandledRejection();
      await tasksSettled();

      assertText('');
      assert.strictEqual(fulfilledAttached, 0, 'the hidden fulfilled view is not activated');

      component.show = true;
      await tasksSettled();
      await waitForUnhandledRejection();
      assertText('42');
      assert.strictEqual(fulfilledAttached, 1);
      assert.deepStrictEqual(unhandled.reasons, []);
    } finally {
      unhandled.dispose();
      await stop(true);
    }
  });
  it('does not report a rejection when it detaches before a swap has run', async function () {
    const first = new Deferred<number>();
    const second = new Deferred<number>();
    const unhandled = observeUnhandledRejections();
    const { component, assertText, stop } = createFixture(
      '<div if.bind="show" promise.bind="p"><i pending>pending</i><b then.from-view="v">${v}</b></div>',
      class { public show = true; public p = first.promise; },
    );

    try {
      await tasksSettled();
      assertText('pending');

      component.p = second.promise;
      component.show = false;
      second.resolve(2);
      await waitForUnhandledRejection();
      await tasksSettled();
      assertText('');
      assert.deepStrictEqual(unhandled.reasons, []);

      component.show = true;
      await tasksSettled();
      await waitForUnhandledRejection();
      assertText('2');
    } finally {
      unhandled.dispose();
      await stop(true);
    }
  });
});

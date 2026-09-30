import { Registration } from '@aurelia/kernel';
import { tasksSettled } from '@aurelia/runtime';
import {
  AppTask,
  BindingBehavior,
  CustomElement,
  IErrorHandler,
  IListenerBindingOptions,
  ValueConverter,
  type ErrorInfo,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
  TestContext,
} from '@aurelia/testing';

class Deferred<T = void> {
  public readonly promise: Promise<T>;
  public resolve!: (value: T | PromiseLike<T>) => void;
  public reject!: (reason: unknown) => void;

  public constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

interface IRecordedError {
  readonly error: unknown;
  readonly phase: string;
  readonly controller: string | null;
  readonly handled: boolean;
}

function createRecordingHandler() {
  const calls: IRecordedError[] = [];
  return {
    calls,
    handleError(error: unknown, info: ErrorInfo): void {
      calls.push({
        error,
        phase: info.phase,
        controller: info.controller?.viewModel?.constructor.name ?? null,
        handled: info.handled,
      });
    },
  };
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

async function waitForMicrotasks(predicate: () => boolean): Promise<boolean> {
  for (let i = 0; i < 50 && !predicate(); ++i) {
    await Promise.resolve();
  }
  return predicate();
}

const OkEl = CustomElement.define({ name: 'ok-el', template: 'ok' }, class OkEl { });

describe('3-runtime-html/error-boundary.spec.ts', function () {

  describe('without a boundary', function () {
    it('A: a synchronous binding failure throws out of start()', function () {
      const error = new Error('boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'content' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<boom></boom><ok-el></ok-el>',
        class App { },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        false,
      );

      try {
        void fixture.start();
        assert.fail('start should have thrown');
      } catch (e) {
        assert.strictEqual(e, error);
      }
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'binding', controller: 'Boom', handled: false },
      ]);
    });

    it('B: an async if swap failure reports to IErrorHandler and console.error without an unhandled rejection', async function () {
      const activation = new Deferred();
      const torn = new Deferred();
      const error = new Error('async swap failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'boom' }, class Boom {
        public attaching(): Promise<void> { return activation.promise; }
        public detaching(): void { torn.resolve(); }
      });
      const handler = createRecordingHandler();
      const consoleErrors: unknown[] = [];
      const originalConsoleError = console.error;
      console.error = (...args: unknown[]) => { consoleErrors.push(args); };
      const unhandled = observeUnhandledRejections();
      try {
        const fixture = createFixture(
          '<boom if.bind="show"></boom><ok-el></ok-el>',
          class App { public show = false; },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        fixture.component.show = true;
        activation.reject(error);
        await torn.promise;
        await waitForMicrotasks(() => consoleErrors.length > 0);

        assert.deepStrictEqual(consoleErrors, [[error]]);
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'attaching', controller: 'Boom', handled: false },
        ]);
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
        await fixture.stop(true);
      } finally {
        console.error = originalConsoleError;
        unhandled.dispose();
      }
    });

    it('C: a synchronous if swap failure escapes the assignment but still reports', async function () {
      const error = new Error('sync swap failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'boom' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<boom if.bind="show"></boom><ok-el></ok-el>',
        class App { public show = false; },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
      );
      const unhandled = observeUnhandledRejections();
      try {
        assert.throws(() => { fixture.component.show = true; });
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'binding', controller: 'Boom', handled: false },
        ]);
        await fixture.stop(true);
      } finally {
        unhandled.dispose();
      }
    });

    it('D: a queued binding re-evaluation error reports with phase task and keeps the console channel', async function () {
      const error = new Error('re-evaluation failed');
      const BoomVc = ValueConverter.define('boomVc', class BoomVc {
        public toView(value: unknown): unknown {
          if (value === 'boom') { throw error; }
          return value;
        }
      });
      const handler = createRecordingHandler();
      const consoleErrors: unknown[] = [];
      const originalConsoleError = console.error;
      console.error = (...args: unknown[]) => { consoleErrors.push(args); };
      const fixture = createFixture(
        '<div>${msg | boomVc}</div><ok-el></ok-el>',
        class App { public msg = 'ok'; },
        [OkEl, BoomVc, Registration.instance(IErrorHandler, handler)],
      );
      const unhandled = observeUnhandledRejections();
      try {
        await fixture.started;
        fixture.component.msg = 'boom';
        await waitForMicrotasks(() => consoleErrors.length > 0);

        assert.deepStrictEqual(consoleErrors, [[error]]);
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'task', controller: 'App', handled: false },
        ]);
        // the previous content stays in place
        assert.html.textContent(fixture.appHost, 'okok');
        await fixture.stop(true);
      } finally {
        console.error = originalConsoleError;
        unhandled.dispose();
      }
    });

    it('C2: a throwing constructor in a newly created if branch escapes the assignment but still reports', async function () {
      const error = new Error('branch constructor');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public constructor() { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<boom if.bind="show"></boom><ok-el></ok-el>',
        class App { public show = false; },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.throws(() => { fixture.component.show = true; });
      assert.deepStrictEqual(handler.calls.map(c => [c.error, c.handled]), [[error, false]]);
      await fixture.stop(true);
    });

    it('E: a synchronous repeat push failure escapes push() but still reports', async function () {
      const error = new Error('repeat failure');
      let fail = false;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { if (fail) { throw error; } }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<boom repeat.for="i of items"></boom><ok-el></ok-el>',
        class App { public items = [1]; },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
      );
      const unhandled = observeUnhandledRejections();
      try {
        await fixture.started;
        fail = true;
        assert.throws(() => { fixture.component.items.push(2); });
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'binding', controller: 'Boom', handled: false },
        ]);
        await fixture.stop(true);
      } finally {
        unhandled.dispose();
      }
    });
    it('F: a throwing app task reports with phase task and still rejects start()', async function () {
      const error = new Error('activating task failure');
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<ok-el></ok-el>',
        class App { },
        [OkEl, Registration.instance(IErrorHandler, handler), AppTask.activating(() => { throw error; })],
        false,
      );
      const caught = await Promise.resolve().then(() => fixture.start()).then(() => null, (e: unknown) => e);
      assert.strictEqual(caught, error);
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'task', controller: null, handled: false },
      ]);
    });

    it('G: a rejecting app task reports with phase task and still rejects stop()', async function () {
      const error = new Error('deactivating task failure');
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<ok-el></ok-el>',
        class App { },
        [OkEl, Registration.instance(IErrorHandler, handler), AppTask.deactivating(() => Promise.reject(error))],
      );
      await fixture.started;
      const caught = await Promise.resolve().then(() => fixture.stop(true)).then(() => null, (e: unknown) => e);
      assert.strictEqual(caught, error);
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'task', controller: null, handled: false },
      ]);
    });

    it('H: a listener error still reports when the app replaces onError', async function () {
      const error = new Error('custom onError');
      const handler = createRecordingHandler();
      const seen: unknown[] = [];
      const fixture = createFixture(
        `<button click.trigger="go()">go</button>`,
        class App { public go(): void { throw error; } },
        [
          Registration.instance(IErrorHandler, handler),
          Registration.instance(IListenerBindingOptions, { prevent: false, onError: (_e: Event, err: unknown) => { seen.push(err); } }),
        ],
      );
      await fixture.started;
      fixture.appHost.querySelector('button')!.click();
      assert.deepStrictEqual(seen, [error]);
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'event', controller: 'App', handled: false },
      ]);
      await fixture.stop(true);
    });
    for (const deferred of [false, true]) {
      it(`I: a child that fails while the app hydrates reports and rejects ${deferred ? 'start() after an async app task' : 'start()'}`, async function () {
        const error = new Error('created boom');
        const Kid = CustomElement.define({ name: 'kid', template: 'k' }, class Kid {
          public created(): void { throw error; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          '<kid></kid>',
          class App { },
          [
            Kid,
            Registration.instance(IErrorHandler, handler),
            ...(deferred ? [AppTask.hydrating(() => Promise.resolve())] : []),
          ],
          false,
        );
        const caught = await Promise.resolve().then(() => fixture.start()).then(() => null, (e: unknown) => e);
        assert.strictEqual(caught, error);
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'attaching', controller: 'App', handled: false },
        ]);
      });
    }

    it('J: reports every rejecting app task in a slot, not only the first', async function () {
      const first = new Error('first task failure');
      const second = new Error('second task failure');
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<ok-el></ok-el>',
        class App { },
        [
          OkEl,
          Registration.instance(IErrorHandler, handler),
          AppTask.activating(() => Promise.reject(first)),
          AppTask.activating(() => Promise.reject(second)),
        ],
        false,
      );
      const unhandled = observeUnhandledRejections();
      try {
        const caught = await Promise.resolve().then(() => fixture.start()).then(() => null, (e: unknown) => e);
        assert.strictEqual(caught, first);
        await waitForMicrotasks(() => handler.calls.length === 2);
        assert.deepStrictEqual(handler.calls, [
          { error: first, phase: 'task', controller: null, handled: false },
          { error: second, phase: 'task', controller: null, handled: false },
        ]);
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
      } finally {
        unhandled.dispose();
      }
    });
  });

  describe('with a boundary', function () {
    it('catches a synchronous initial failure, renders the fallback and keeps siblings', async function () {
      const error = new Error('boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'content' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom>
          <template au-slot="fallback">FB</template>
        </error-boundary><ok-el></ok-el>`,
        class App { },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
      );

      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FBok');
      assert.strictEqual(fixture.appHost.querySelector('boom'), null, 'failed content nodes removed');
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'binding', controller: 'Boom', handled: true },
      ]);
      await fixture.stop(true);
    });

    it('catches an async initial failure after it settles', async function () {
      const gate = new Deferred();
      const error = new Error('async boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'content' }, class Boom {
        public attaching(): Promise<void> { return gate.promise; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom>
          <template au-slot="fallback">FB</template>
        </error-boundary><ok-el></ok-el>`,
        class App { },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        false,
      );
      const start = fixture.start() as Promise<void>;
      gate.reject(error);
      await start;
      assert.html.textContent(fixture.appHost, 'FBok');
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'attaching', controller: 'Boom', handled: true },
      ]);
      await fixture.stop(true);
    });

    for (const phase of ['binding', 'bound', 'attaching', 'attached'] as const) {
      it(`reports phase '${phase}' for a synchronous ${phase} failure`, async function () {
        const error = new Error(`${phase} failed`);
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public [phase](): void { throw error; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary><boom></boom><template au-slot="fallback">FB</template></error-boundary>`,
          class App { },
          [Boom, Registration.instance(IErrorHandler, handler)],
        );

        await fixture.started;
        assert.html.textContent(fixture.appHost, 'FB');
        assert.deepStrictEqual(handler.calls, [
          { error, phase, controller: 'Boom', handled: true },
        ]);
        await fixture.stop(true);
      });

      it(`reports phase '${phase}' for an asynchronous ${phase} failure`, async function () {
        const gate = new Deferred();
        const error = new Error(`async ${phase} failed`);
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public [phase](): Promise<void> { return gate.promise; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary><boom></boom><template au-slot="fallback">FB</template></error-boundary>`,
          class App { },
          [Boom, Registration.instance(IErrorHandler, handler)],
          false,
        );
        const start = fixture.start() as Promise<void>;
        gate.reject(error);
        await start;
        assert.html.textContent(fixture.appHost, 'FB');
        assert.deepStrictEqual(handler.calls, [
          { error, phase, controller: 'Boom', handled: true },
        ]);
        await fixture.stop(true);
      });
    }

    it('reports a non-Error thrown value with the boundary controller and attaching phase', async function () {
      const thrown: unknown = 'string failure';
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw thrown; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary><boom></boom><template au-slot="fallback">FB</template></error-boundary>`,
        class App { },
        [Boom, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');
      assert.deepStrictEqual(handler.calls, [
        { error: 'string failure', phase: 'attaching', controller: 'ErrorBoundary', handled: true },
      ]);
      await fixture.stop(true);
    });

    it('exposes $host.error to the fallback and propagates error.from-view', async function () {
      const error = new Error('show me');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public attached(): void { throw error; }
      });
      const fixture = createFixture(
        `<error-boundary error.from-view="captured">
          <boom></boom>
          <template au-slot="fallback"><p>err: \${$host.error.message}</p></template>
        </error-boundary>`,
        class App { public captured: unknown = null; },
        [Boom],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'err: show me');
      assert.strictEqual(fixture.component.captured, error);
      await fixture.stop(true);
    });

    it('renders nothing but still reports when the fallback slot is missing', async function () {
      const error = new Error('boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary><boom></boom></error-boundary><ok-el></ok-el>`,
        class App { },
        [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'ok');
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'binding', controller: 'Boom', handled: true },
      ]);
      await fixture.stop(true);
    });

    it('isolates an inner failure to the inner boundary', async function () {
      const error = new Error('inner boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const fixture = createFixture(
        `<error-boundary>
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback">inner-fb</template>
          </error-boundary>
          <ok-el></ok-el>
          <template au-slot="fallback">outer-fb</template>
        </error-boundary>`,
        class App { },
        [Boom, OkEl],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'inner-fbok');
      await fixture.stop(true);
    });

    it('propagates an inner fallback failure to the outer boundary (initial)', async function () {
      const error = new Error('inner');
      const error2 = new Error('inner fallback');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const Boom2 = CustomElement.define({ name: 'boom-2', template: 'y' }, class Boom2 {
        public attached(): void { throw error2; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback"><boom-2></boom-2></template>
          </error-boundary>
          <template au-slot="fallback">outer-fb</template>
        </error-boundary>`,
        class App { },
        [Boom, Boom2, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'outer-fb');
      assert.strictEqual(handler.calls.length, 2);
      assert.strictEqual(handler.calls[0].error, error);
      assert.strictEqual(handler.calls[0].handled, true);
      assert.strictEqual(handler.calls[1].error, error2);
      assert.strictEqual(handler.calls[1].phase, 'attached');
      assert.strictEqual(handler.calls[1].handled, true);
      await fixture.stop(true);
    });

    it('propagates an inner fallback failure to the outer boundary (runtime)', async function () {
      const error = new Error('inner runtime');
      const error2 = new Error('inner fallback runtime');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public attaching(): void { throw error; }
      });
      const Boom2 = CustomElement.define({ name: 'boom-2', template: 'y' }, class Boom2 {
        public attached(): void { throw error2; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <div if.bind="show">
            <error-boundary>
              <boom></boom>
              <template au-slot="fallback"><boom-2></boom-2></template>
            </error-boundary>
          </div>
          <template au-slot="fallback">outer-fb</template>
        </error-boundary>`,
        class App { public show = false; },
        [Boom, Boom2, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      fixture.component.show = true;
      await tasksSettled();
      await waitForMicrotasks(() => fixture.appHost.textContent === 'outer-fb');
      assert.html.textContent(fixture.appHost, 'outer-fb');
      await fixture.stop(true);
    });

    it('reset() builds fresh component instances and can succeed', async function () {
      const error = new Error('boom once');
      let fail = true;
      let constructed = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'fresh content' }, class Boom {
        public constructor() { ++constructed; }
        public binding(): void { if (fail) { throw error; } }
      });
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom>
          <template au-slot="fallback">FB <button click.trigger="$host.reset()">retry</button></template>
        </error-boundary>`,
        class App { },
        [Boom],
      );
      await fixture.started;
      assert.strictEqual(constructed, 1);
      assert.html.textContent(fixture.appHost, 'FB retry');

      fail = false;
      fixture.appHost.querySelector('button')!.click();
      await tasksSettled();
      assert.strictEqual(constructed, 2, 'a fresh instance was created');
      assert.html.textContent(fixture.appHost, 'fresh content');
      await fixture.stop(true);
    });

    it('reset() can fail again and re-shows the fallback', async function () {
      const errors = [new Error('boom first'), new Error('boom again')];
      let constructed = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public constructor() { ++constructed; }
        public binding(): void { throw errors[constructed - 1]; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom>
          <template au-slot="fallback">FB <button click.trigger="$host.reset()">retry</button></template>
        </error-boundary>`,
        class App { },
        [Boom, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      fixture.appHost.querySelector('button')!.click();
      await tasksSettled();
      await waitForMicrotasks(() => fixture.appHost.textContent === 'FB retry');
      assert.strictEqual(constructed, 2);
      assert.html.textContent(fixture.appHost, 'FB retry');
      assert.strictEqual(handler.calls.length, 2);
      await fixture.stop(true);
    });

    it('reset() escalates a fallback that throws while being rebuilt to the outer boundary', async function () {
      const contentError = new Error('content fails');
      const fallbackError = new Error('fallback fails on rebuild');
      let fallbackBuilds = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw contentError; }
      });
      const Fb = CustomElement.define({ name: 'fb', template: 'FB' }, class Fb {
        public constructor() {
          if (++fallbackBuilds > 1) {
            throw fallbackError;
          }
        }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <template au-slot="fallback">OUTER</template>
          <error-boundary component.ref="inner">
            <boom></boom>
            <template au-slot="fallback"><fb></fb></template>
          </error-boundary>
        </error-boundary>`,
        class App { public inner!: { reset(): void | Promise<void> }; },
        [Boom, Fb, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');

      let result: void | Promise<void>;
      assert.doesNotThrow(() => { result = fixture.component.inner.reset(); });
      await result;
      await tasksSettled();
      await waitForMicrotasks(() => fixture.appHost.textContent === 'OUTER');
      assert.html.textContent(fixture.appHost, 'OUTER');
      assert.deepStrictEqual(
        handler.calls.filter(c => c.error === fallbackError).map(c => c.handled),
        [true],
        'the outer boundary handled the fallback failure',
      );
      await fixture.stop(true);
    });

    it('reports a dispose failure of the leftover fallback when a boundary re-attaches', async function () {
      const error = new Error('boom');
      const disposeError = new Error('dispose fails');
      let fail = true;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { if (fail) { throw error; } }
      });
      const BadDispose = CustomElement.define({ name: 'bad-dispose', template: 'FB' }, class BadDispose {
        public dispose(): void { throw disposeError; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback"><bad-dispose></bad-dispose></template>
          </error-boundary>
        </div>`,
        class App { public show = true; },
        [Boom, BadDispose, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');

      fixture.component.show = false;
      await tasksSettled();
      fail = false;
      fixture.component.show = true;
      await tasksSettled();
      assert.html.textContent(fixture.appHost, 'x');
      assert.deepStrictEqual(
        handler.calls.filter(c => c.error === disposeError),
        [{ error: disposeError, phase: 'detaching', controller: 'ErrorBoundary', handled: true }],
      );
      await fixture.stop(true);
    });

    it('reset-key change auto-resets while in fallback, and is inert while content is healthy', async function () {
      const error = new Error('boom');
      let fail = true;
      let constructed = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'content' }, class Boom {
        public constructor() { ++constructed; }
        public bound(): void { if (fail) { throw error; } }
      });
      const fixture = createFixture(
        `<error-boundary reset-key.bind="key">
          <boom></boom>
          <template au-slot="fallback">FB</template>
        </error-boundary>`,
        class App { public key = 0; },
        [Boom],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');
      assert.strictEqual(constructed, 1);

      fail = false;
      fixture.component.key = 1;
      await tasksSettled();
      await waitForMicrotasks(() => fixture.appHost.textContent === 'content');
      assert.strictEqual(constructed, 2);
      assert.html.textContent(fixture.appHost, 'content');

      // healthy content: a key change must not rebuild
      fixture.component.key = 2;
      await tasksSettled();
      assert.strictEqual(constructed, 2);
      assert.html.textContent(fixture.appHost, 'content');
      await fixture.stop(true);
    });

    describe('post-activation template controller failures', function () {
      it('if swap: synchronous throw is caught and the fallback renders', async function () {
        const error = new Error('if sync');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { throw error; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <boom if.bind="show"></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary><ok-el></ok-el>`,
          class App { public show = false; },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        const unhandled = observeUnhandledRejections();
        try {
          await fixture.started;
          fixture.component.show = true;
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FBok');
          assert.html.textContent(fixture.appHost, 'FBok');
          assert.deepStrictEqual(handler.calls, [
            { error, phase: 'binding', controller: 'Boom', handled: true },
          ]);
          await waitForUnhandledRejection();
          assert.deepStrictEqual(unhandled.reasons, []);
          await fixture.stop(true);
        } finally {
          unhandled.dispose();
        }
      });

      it('if swap: asynchronous rejection is caught and the fallback renders', async function () {
        const gate = new Deferred();
        const error = new Error('if async');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public attaching(): Promise<void> { return gate.promise; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <boom if.bind="show"></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary><ok-el></ok-el>`,
          class App { public show = false; },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        const unhandled = observeUnhandledRejections();
        try {
          await fixture.started;
          fixture.component.show = true;
          gate.reject(error);
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FBok');
          assert.html.textContent(fixture.appHost, 'FBok');
          assert.deepStrictEqual(handler.calls, [
            { error, phase: 'attaching', controller: 'Boom', handled: true },
          ]);
          await waitForUnhandledRejection();
          assert.deepStrictEqual(unhandled.reasons, []);
          await fixture.stop(true);
        } finally {
          unhandled.dispose();
        }
      });

      it('if swap: an async rejection still fails over when the failed view\'s teardown also throws', async function () {
        const gate = new Deferred();
        const error = new Error('if async');
        const teardownError = new Error('if teardown');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public attaching(): Promise<void> { return gate.promise; }
          public detaching(): void { throw teardownError; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <boom if.bind="show"></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary><ok-el></ok-el>`,
          class App { public show = false; },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        const unhandled = observeUnhandledRejections();
        try {
          await fixture.started;
          fixture.component.show = true;
          gate.reject(error);
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FBok');
          assert.html.textContent(fixture.appHost, 'FBok');
          assert.deepStrictEqual(handler.calls.slice(0, 2), [
            { error, phase: 'attaching', controller: 'Boom', handled: true },
            { error: teardownError, phase: 'detaching', controller: 'Boom', handled: true },
          ]);
          await waitForUnhandledRejection();
          assert.deepStrictEqual(unhandled.reasons, []);
          await fixture.stop(true);
        } finally {
          unhandled.dispose();
        }
      });

      it('if swap: an async rejection still fails over when disposing the uncached view throws', async function () {
        const gate = new Deferred();
        const error = new Error('if async');
        const disposeError = new Error('if dispose');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public attaching(): Promise<void> { return gate.promise; }
          public dispose(): void { throw disposeError; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <boom if="value.bind: show; cache: false"></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary><ok-el></ok-el>`,
          class App { public show = false; },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        const unhandled = observeUnhandledRejections();
        try {
          await fixture.started;
          fixture.component.show = true;
          gate.reject(error);
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FBok');
          assert.html.textContent(fixture.appHost, 'FBok');
          assert.deepStrictEqual(handler.calls[0], { error, phase: 'attaching', controller: 'Boom', handled: true });
          assert.includes(handler.calls.map(c => c.error), disposeError);
          await waitForUnhandledRejection();
          assert.deepStrictEqual(unhandled.reasons, []);
          await fixture.stop(true);
        } finally {
          unhandled.dispose();
        }
      });

      it('else branch: failure swapping to else is caught', async function () {
        const error = new Error('else boom');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { throw error; }
        });
        const fixture = createFixture(
          `<error-boundary>
            <ok-el if.bind="show"></ok-el><boom else></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public show = true; },
          [Boom, OkEl],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'ok');
        fixture.component.show = false;
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
        assert.html.textContent(fixture.appHost, 'FB');
        await fixture.stop(true);
      });

      it('repeat: push failure is caught', async function () {
        const error = new Error('repeat boom');
        let fail = false;
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { if (fail) { throw error; } }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <boom repeat.for="i of items"></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public items = [1]; },
          [Boom, Registration.instance(IErrorHandler, handler)],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'x');
        fail = true;
        fixture.component.items.push(2);
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
        assert.html.textContent(fixture.appHost, 'FB');
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'binding', controller: 'Boom', handled: true },
        ]);
        await fixture.stop(true);
      });

      it('switch: case change failure is caught', async function () {
        const error = new Error('case boom');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { throw error; }
        });
        const fixture = createFixture(
          `<error-boundary>
            <div switch.bind="v"><ok-el case="a"></ok-el><boom case="b"></boom></div>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public v = 'a'; },
          [Boom, OkEl],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'ok');
        fixture.component.v = 'b';
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
        assert.html.textContent(fixture.appHost, 'FB');
        await fixture.stop(true);
      });

      it('switch: an async case rejection still fails over when the failed view\'s teardown also throws', async function () {
        const gate = new Deferred();
        const error = new Error('case async');
        const teardownError = new Error('case teardown');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public attaching(): Promise<void> { return gate.promise; }
          public detaching(): void { throw teardownError; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <div switch.bind="v"><ok-el case="a"></ok-el><boom case="b"></boom></div>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public v = 'a'; },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        const unhandled = observeUnhandledRejections();
        try {
          await fixture.started;
          fixture.component.v = 'b';
          gate.reject(error);
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
          assert.html.textContent(fixture.appHost, 'FB');
          assert.deepStrictEqual(handler.calls.slice(0, 2), [
            { error, phase: 'attaching', controller: 'Boom', handled: true },
            { error: teardownError, phase: 'detaching', controller: 'Boom', handled: true },
          ]);
          await waitForUnhandledRejection();
          assert.deepStrictEqual(unhandled.reasons, []);
          await fixture.stop(true);
        } finally {
          unhandled.dispose();
        }
      });

      it('au-compose: component change failure is caught', async function () {
        const error = new Error('compose boom');
        const OkComp = CustomElement.define({ name: 'ok-comp', template: 'okc' }, class OkComp { });
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { throw error; }
        });
        const fixture = createFixture(
          `<error-boundary>
            <au-compose component.bind="comp"></au-compose>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public comp: unknown = OkComp; },
          [Boom, OkComp],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'okc');
        fixture.component.comp = Boom;
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
        assert.html.textContent(fixture.appHost, 'FB');
        await fixture.stop(true);
      });

      it('au-compose: an async component change failure fails over once and disposes the failed composition', async function () {
        const error = new Error('compose async');
        let disposed = 0;
        const OkComp = CustomElement.define({ name: 'ok-comp', template: 'okc' }, class OkComp { });
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): Promise<void> { return Promise.reject(error); }
          public dispose(): void { ++disposed; }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <au-compose component.bind="comp"></au-compose>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public comp: unknown = OkComp; },
          [Boom, OkComp, Registration.instance(IErrorHandler, handler)],
        );
        const unhandled = observeUnhandledRejections();
        try {
          await fixture.started;
          fixture.component.comp = Boom;
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
          assert.html.textContent(fixture.appHost, 'FB');
          assert.deepStrictEqual(
            handler.calls.map(c => [c.error, c.handled]),
            [[error, true]],
          );
          assert.strictEqual(disposed, 1);
          await waitForUnhandledRejection();
          assert.deepStrictEqual(unhandled.reasons, []);
          await fixture.stop(true);
        } finally {
          unhandled.dispose();
        }
      });

      it('promise: fulfilled view failure is caught', async function () {
        const error = new Error('promise boom');
        const gate = new Deferred<string>();
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { throw error; }
        });
        const fixture = createFixture(
          `<error-boundary>
            <div promise.bind="p"><template pending>pending</template><boom then></boom></div>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public p = gate.promise; },
          [Boom],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'pending');
        gate.resolve('v');
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
        assert.html.textContent(fixture.appHost, 'FB');
        await fixture.stop(true);
      });

      for (const hook of ['constructor', 'created'] as const) {
        const defineBoom = (error: Error) => CustomElement.define(
          { name: 'boom', template: 'x' },
          hook === 'constructor'
            ? class Boom { public constructor() { throw error; } }
            : class Boom { public created(): void { throw error; } },
        );

        it(`if swap: a throwing ${hook} in the newly created branch is caught`, async function () {
          const error = new Error(`if ${hook}`);
          const handler = createRecordingHandler();
          const fixture = createFixture(
            `<error-boundary>
              <boom if.bind="show"></boom>
              <template au-slot="fallback">FB</template>
            </error-boundary><ok-el></ok-el>`,
            class App { public show = false; },
            [defineBoom(error), OkEl, Registration.instance(IErrorHandler, handler)],
          );
          await fixture.started;
          assert.doesNotThrow(() => { fixture.component.show = true; });
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FBok');
          assert.html.textContent(fixture.appHost, 'FBok');
          assert.deepStrictEqual(handler.calls.map(c => [c.error, c.handled]), [[error, true]]);
          await fixture.stop(true);
        });

        it(`switch: a throwing ${hook} in the newly created case is caught`, async function () {
          const error = new Error(`case ${hook}`);
          const handler = createRecordingHandler();
          const fixture = createFixture(
            `<error-boundary>
              <div switch.bind="v"><ok-el case="a"></ok-el><boom case="b"></boom></div>
              <template au-slot="fallback">FB</template>
            </error-boundary>`,
            class App { public v = 'a'; },
            [defineBoom(error), OkEl, Registration.instance(IErrorHandler, handler)],
          );
          await fixture.started;
          fixture.component.v = 'b';
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
          assert.html.textContent(fixture.appHost, 'FB');
          assert.deepStrictEqual(handler.calls.map(c => [c.error, c.handled]), [[error, true]]);
          await fixture.stop(true);
        });

        it(`promise: a throwing ${hook} in the newly created branch is caught`, async function () {
          const error = new Error(`then ${hook}`);
          const gate = new Deferred<string>();
          const handler = createRecordingHandler();
          const fixture = createFixture(
            `<error-boundary>
              <div promise.bind="p"><template pending>pending</template><boom then></boom></div>
              <template au-slot="fallback">FB</template>
            </error-boundary>`,
            class App { public p = gate.promise; },
            [defineBoom(error), Registration.instance(IErrorHandler, handler)],
          );
          await fixture.started;
          gate.resolve('v');
          await tasksSettled();
          await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
          assert.html.textContent(fixture.appHost, 'FB');
          assert.deepStrictEqual(handler.calls.map(c => [c.error, c.handled]), [[error, true]]);
          await fixture.stop(true);
        });
      }

      it('portal: target change callback failure is caught', async function () {
        const error = new Error('portal boom');
        const fixture = createFixture(
          `<error-boundary>
            <div id="t1"></div><div id="t2"></div>
            <div portal="target.bind: t; activating.bind: onActivating">p</div>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App {
            public t: unknown;
            public onActivating = (target: unknown): void => {
              if ((target as Element).id === 't2') { throw error; }
            };
          },
        );
        await fixture.started;
        const host = fixture.appHost;
        (fixture.component as { t: unknown }).t = host.querySelector('#t1');
        await tasksSettled();
        (fixture.component as { t: unknown }).t = host.querySelector('#t2');
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'FB');
        assert.html.textContent(fixture.appHost, 'FB');
        await fixture.stop(true);
      });

      it('with: initial failure inside with.bind is caught', async function () {
        const error = new Error('with boom');
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public binding(): void { throw error; }
        });
        const fixture = createFixture(
          `<error-boundary>
            <div with.bind="data"><boom></boom></div>
            <template au-slot="fallback">FB</template>
          </error-boundary>`,
          class App { public data = {}; },
          [Boom],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'FB');
        await fixture.stop(true);
      });
    });

    it('does not activate the fallback when the boundary is deactivated while content activation is pending', async function () {
      const gate = new Deferred();
      const error = new Error('late activation failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public attaching(): Promise<void> { return gate.promise; }
      });
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary>
        </div><ok-el></ok-el>`,
        class App { public show = true; },
        [Boom, OkEl],
        false,
      );
      const unhandled = observeUnhandledRejections();
      try {
        const start = fixture.start() as Promise<void>;
        for (let i = 0; i < 20; ++i) { await Promise.resolve(); }
        fixture.component.show = false;
        gate.reject(error);
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'ok');
        assert.html.textContent(fixture.appHost, 'ok');
        // the if teardown awaited the boundary's own teardown: no content nodes remain
        assert.strictEqual(fixture.appHost.querySelector('boom'), null);
        await start;
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
        await fixture.stop(true);
      } finally {
        unhandled.dispose();
      }
    });

    it('waits for a slow sibling to settle before showing the fallback', async function () {
      const boomGate = new Deferred();
      const slowGate = new Deferred();
      const error = new Error('sibling boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public attaching(): Promise<void> { return boomGate.promise; }
      });
      const Slow = CustomElement.define({ name: 'slow-el', template: 'slow' }, class Slow {
        public attaching(): Promise<void> { return slowGate.promise; }
      });
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom><slow-el></slow-el>
          <template au-slot="fallback">FB</template>
        </error-boundary><ok-el></ok-el>`,
        class App { },
        [Boom, Slow, OkEl],
      );
      const unhandled = observeUnhandledRejections();
      try {
        boomGate.reject(error);
        // the failover tears the content down, but the view deactivation waits
        // for the sibling's pending activation, so the fallback cannot mount yet
        for (let i = 0; i < 20; ++i) { await Promise.resolve(); }
        assert.strictEqual(fixture.appHost.textContent !== 'FBok', true, 'fallback is not mounted while the sibling is pending');

        slowGate.resolve();
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'FBok');
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
        await fixture.stop(true);
      } finally {
        unhandled.dispose();
      }
    });

    it('reports a binding that fails to unbind during forced cleanup against its owning controller', async function () {
      const attachError = new Error('attached fails');
      const detachError = new Error('detaching fails');
      const unbindError = new Error('unbind fails');
      const BadUnbind = BindingBehavior.define('badUnbind', class {
        public unbind(): void { throw unbindError; }
      });
      const Boom = CustomElement.define({ name: 'boom', template: '${label & badUnbind}' }, class Boom {
        public label = 'x';
        public attached(): void { throw attachError; }
        public detaching(): void { throw detachError; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary><boom></boom><template au-slot="fallback">FB</template></error-boundary>`,
        class App { },
        [Boom, BadUnbind, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      await tasksSettled();
      assert.html.textContent(fixture.appHost, 'FB');
      assert.deepStrictEqual(
        handler.calls.filter(c => c.error === unbindError),
        [{ error: unbindError, phase: 'unbinding', controller: 'Boom', handled: true }],
      );
      await fixture.stop(true);
    });

    it('reports teardown errors during failover as handled and still shows the fallback', async function () {
      const gate = new Deferred();
      const error = new Error('boom');
      const teardownError = new Error('teardown boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public bound(): Promise<void> { return gate.promise; }
      });
      const BadTeardown = CustomElement.define({ name: 'bad-teardown', template: 't' }, class BadTeardown {
        public unbinding(): void { throw teardownError; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom><bad-teardown></bad-teardown>
          <template au-slot="fallback">FB</template>
        </error-boundary>`,
        class App { },
        [Boom, BadTeardown, Registration.instance(IErrorHandler, handler)],
        false,
      );
      const start = fixture.start() as Promise<void>;
      // bad-teardown has activated by the time the async bound() rejects, so
      // failover teardown actually runs its unbinding hook.
      gate.reject(error);
      await start;
      assert.html.textContent(fixture.appHost, 'FB');
      assert.strictEqual(handler.calls.length, 2);
      assert.strictEqual(handler.calls[0].error, error);
      assert.strictEqual(handler.calls[0].handled, true);
      assert.strictEqual(handler.calls[1].error, teardownError);
      assert.strictEqual(handler.calls[1].handled, true);
      await fixture.stop(true);
    });

    it('au.stop() resolves after a caught failure and deactivates the fallback', async function () {
      const error = new Error('boom');
      let detached = 0;
      let unbound = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const FbTrack = CustomElement.define({ name: 'fb-track', template: 'FB' }, class FbTrack {
        public detaching(): void { ++detached; }
        public unbinding(): void { ++unbound; }
      });
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom>
          <template au-slot="fallback"><fb-track></fb-track></template>
        </error-boundary>`,
        class App { },
        [Boom, FbTrack],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');
      await fixture.stop(true);
      assert.strictEqual(detached, 1);
      assert.strictEqual(unbound, 1);
      assert.html.textContent(fixture.appHost, '');
    });

    it('reports listener errors with phase event and still dispatches au-event-error', async function () {
      const error = new Error('listener boom');
      const handler = createRecordingHandler();
      const ctx = TestContext.create();
      const auErrors: unknown[] = [];
      ctx.platform.window.addEventListener('au-event-error', (e: Event) => {
        auErrors.push((e as CustomEvent).detail.error);
        e.preventDefault();
      });
      const fixture = createFixture(
        `<error-boundary>
          <button click.trigger="go()">go</button>
          <template au-slot="fallback">FB</template>
        </error-boundary>`,
        class App {
          public go(): void { throw error; }
        },
        [Registration.instance(IErrorHandler, handler)],
        true,
        ctx,
      );
      await fixture.started;
      fixture.appHost.querySelector('button')!.click();
      await Promise.resolve();
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'event', controller: null, handled: false },
      ]);
      assert.deepStrictEqual(auErrors, [error]);
      // event errors are not contained: content is still showing
      assert.html.textContent(fixture.appHost, 'go');
      await fixture.stop(true);
    });

    it('a throwing IErrorHandler does not break failover', async function () {
      const error = new Error('boom');
      const handlerError = new Error('handler exploded');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const consoleErrors: unknown[] = [];
      const originalConsoleError = console.error;
      console.error = (...args: unknown[]) => { consoleErrors.push(args); };
      try {
        const fixture = createFixture(
          `<error-boundary><boom></boom><template au-slot="fallback">FB</template></error-boundary>`,
          class App { },
          [Boom, Registration.instance(IErrorHandler, {
            handleError(): void { throw handlerError; },
          })],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'FB');
        assert.deepStrictEqual(consoleErrors, [[handlerError]]);
        await fixture.stop(true);
      } finally {
        console.error = originalConsoleError;
      }
    });

    it('builds fresh content when a detached boundary re-attaches from fallback', async function () {
      const error = new Error('boom');
      let fail = true;
      let constructed = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public constructor() { ++constructed; }
        public binding(): void { if (fail) { throw error; } }
      });
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary error.from-view="ebError">
            <boom></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary>
        </div>`,
        class App { public show = true; public ebError: unknown = null; },
        [Boom],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');
      assert.strictEqual(constructed, 1);

      fixture.component.show = false;
      await tasksSettled();
      assert.html.textContent(fixture.appHost, '');

      fail = false;
      fixture.component.show = true;
      await tasksSettled();
      // fresh content was constructed and activated; the fallback is gone
      assert.strictEqual(constructed, 2);
      assert.html.textContent(fixture.appHost, 'x');
      assert.strictEqual(fixture.component.ebError, null);
      await fixture.stop(true);
    });

    it('reactivates the same content view when a healthy boundary detaches and re-attaches', async function () {
      let constructed = 0;
      const Kid = CustomElement.define({ name: 'kid', template: 'k' }, class Kid {
        public constructor() { ++constructed; }
      });
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary>
            <kid></kid>
            <template au-slot="fallback">FB</template>
          </error-boundary>
        </div>`,
        class App { public show = true; },
        [Kid],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'k');

      fixture.component.show = false;
      await tasksSettled();
      fixture.component.show = true;
      await tasksSettled();
      // the cached view is reactivated: same component instances, same content
      assert.strictEqual(constructed, 1);
      assert.html.textContent(fixture.appHost, 'k');
      await fixture.stop(true);
    });

    it('removes the boundary DOM synchronously on detach after a settled failover', async function () {
      const error = new Error('boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary>
        </div>`,
        class App { public show = true; },
        [Boom],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'FB');
      // give the failover tail a chance to release `_pending`
      await tasksSettled();

      fixture.component.show = false;
      // detaching must be synchronous once the failover tail settled
      assert.html.textContent(fixture.appHost, '');
      await fixture.stop(true);
    });

    it('removes the boundary DOM synchronously on detach after a settled reset', async function () {
      const error = new Error('boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback">FB <button click.trigger="$host.reset()">retry</button></template>
          </error-boundary>
        </div>`,
        class App { public show = true; },
        [Boom],
      );
      await fixture.started;
      fixture.appHost.querySelector('button')!.click();
      await tasksSettled();
      assert.html.textContent(fixture.appHost, 'FB retry');

      fixture.component.show = false;
      assert.html.textContent(fixture.appHost, '');
      await fixture.stop(true);
    });

    it('handles a slow sibling that also rejects during failover', async function () {
      const boomGate = new Deferred();
      const slowGate = new Deferred();
      const error = new Error('sibling boom');
      const lateError = new Error('late sibling failure');
      let valueChangedCount = 0;
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public attaching(): Promise<void> { return boomGate.promise; }
      });
      const Slow = CustomElement.define({ name: 'slow-el', template: 'slow', bindables: ['value'] }, class Slow {
        public attaching(): Promise<void> { return slowGate.promise; }
        public valueChanged(): void { ++valueChangedCount; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom><slow-el value.bind="x"></slow-el>
          <template au-slot="fallback">FB</template>
        </error-boundary><ok-el></ok-el>`,
        class App { public x = 1; },
        [Boom, Slow, OkEl, Registration.instance(IErrorHandler, handler)],
        false,
      );
      const unhandled = observeUnhandledRejections();
      try {
        const start = fixture.start() as Promise<void>;
        for (let i = 0; i < 20; ++i) { await Promise.resolve(); }
        boomGate.reject(error);
        for (let i = 0; i < 10; ++i) { await Promise.resolve(); }
        // the sibling's pending activation also fails while teardown waits on it
        slowGate.reject(lateError);
        await start;
        await tasksSettled();
        assert.html.textContent(fixture.appHost, 'FBok');
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'attaching', controller: 'Boom', handled: true },
          { error: lateError, phase: 'attaching', controller: 'Slow', handled: true },
        ]);
        // the forced teardown unbound the subtree: the value.bind subscription
        // on the app scope must be gone, so changing x reaches nothing
        const afterTeardown = valueChangedCount;
        fixture.component.x = 2;
        await tasksSettled();
        assert.strictEqual(valueChangedCount, afterTeardown);
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
        await fixture.stop(true);
      } finally {
        unhandled.dispose();
      }
    });

    it('does not activate a fallback that rejects after the boundary detached', async function () {
      const fbGate = new Deferred();
      const error = new Error('content boom');
      const fbError = new Error('fallback boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const FbBoom = CustomElement.define({ name: 'fb-boom', template: 'f' }, class FbBoom {
        public attaching(): Promise<void> { return fbGate.promise; }
      });
      const fixture = createFixture(
        `<div if.bind="show">
          <error-boundary>
            <boom></boom>
            <template au-slot="fallback"><fb-boom></fb-boom></template>
          </error-boundary>
        </div><ok-el></ok-el>`,
        class App { public show = true; },
        [Boom, FbBoom, OkEl],
        false,
      );
      const unhandled = observeUnhandledRejections();
      const consoleErrors: unknown[] = [];
      const originalConsoleError = console.error;
      console.error = (...args: unknown[]) => { consoleErrors.push(args); };
      try {
        const start = fixture.start() as Promise<void>;
        for (let i = 0; i < 20; ++i) { await Promise.resolve(); }
        // the boundary detaches while its fallback activation is pending
        fixture.component.show = false;
        fbGate.reject(fbError);
        await tasksSettled();
        await waitForMicrotasks(() => fixture.appHost.textContent === 'ok');
        assert.html.textContent(fixture.appHost, 'ok');
        // the deferred detach tore the fallback down: no stray nodes remain
        assert.strictEqual(fixture.appHost.querySelector('fb-boom'), null);
        await start;
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
        // the stale failure was only notified to the handler; nothing hit the console
        assert.deepStrictEqual(consoleErrors, []);
        await fixture.stop(true);
      } finally {
        console.error = originalConsoleError;
        unhandled.dispose();
      }
    });

    it('only reports a stale inner fallback failure instead of failing over an outer boundary', async function () {
      const fbGate = new Deferred();
      const error = new Error('inner content boom');
      const fbError = new Error('inner fallback boom');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const FbBoom = CustomElement.define({ name: 'fb-boom', template: 'f' }, class FbBoom {
        public attaching(): Promise<void> { return fbGate.promise; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary>
          <ok-el></ok-el>
          <div if.bind="show">
            <error-boundary>
              <boom></boom>
              <template au-slot="fallback"><fb-boom></fb-boom></template>
            </error-boundary>
          </div>
          <template au-slot="fallback">OUTER-FB</template>
        </error-boundary>`,
        class App { public show = true; },
        [Boom, FbBoom, OkEl, Registration.instance(IErrorHandler, handler)],
        false,
      );
      const unhandled = observeUnhandledRejections();
      try {
        const start = fixture.start() as Promise<void>;
        for (let i = 0; i < 20; ++i) { await Promise.resolve(); }
        // detach the inner boundary while its fallback activation is pending
        fixture.component.show = false;
        fbGate.reject(fbError);
        await start;
        await tasksSettled();
        // the outer boundary's healthy content is untouched: no failover
        assert.html.textContent(fixture.appHost, 'ok');
        assert.strictEqual(fixture.appHost.querySelector('fb-boom'), null);
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'binding', controller: 'Boom', handled: true },
          { error: fbError, phase: 'attaching', controller: 'FbBoom', handled: false },
        ]);
        await waitForUnhandledRejection();
        assert.deepStrictEqual(unhandled.reasons, []);
        await fixture.stop(true);
      } finally {
        unhandled.dispose();
      }
    });

    it('settles a second deactivate after a rejected deactivation', async function () {
      const deactivation = new Deferred();
      const error = new Error('descendant deactivation failed');
      const Child = CustomElement.define({ name: 'rejecting-detaching-descendant', template: 'child' }, class {
        public detaching(): Promise<void> { return deactivation.promise; }
      });
      const fixture = createFixture(
        '<rejecting-detaching-descendant></rejecting-detaching-descendant>',
        class App {},
        [Child],
      );
      await fixture.started;
      const stop = fixture.stop(true) as Promise<void>;
      deactivation.reject(error);
      await assert.rejects(() => stop, error.message);
      // the controller stays deactivating; a second deactivate must settle
      const controller = fixture.au.root.controller;
      const second = controller.deactivate(controller, null);
      assert.strictEqual(second, void 0);
    });

    it('reports a recurring error object again after reset(), with its new origin', async function () {
      // A memoized rejection hands every attempt the same error object.
      const error = new Error('cached failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): Promise<void> { return Promise.reject(error); }
      });
      const handler = createRecordingHandler();
      const origins: unknown[] = [];
      const fixture = createFixture(
        `<error-boundary>
          <boom></boom>
          <template au-slot="fallback">FB <button click.trigger="$host.reset()">retry</button></template>
        </error-boundary>`,
        class App { },
        [Boom, Registration.instance(IErrorHandler, {
          handleError(err: unknown, info: ErrorInfo): void {
            origins.push(info.controller);
            handler.handleError(err, info);
          },
        })],
      );
      await fixture.started;
      fixture.appHost.querySelector('button')!.click();
      await tasksSettled();
      await waitForMicrotasks(() => handler.calls.length === 2);
      assert.html.textContent(fixture.appHost, 'FB retry');
      assert.deepStrictEqual(
        handler.calls.map(c => [c.error, c.phase, c.controller, c.handled]),
        [[error, 'binding', 'Boom', true], [error, 'binding', 'Boom', true]],
      );
      assert.notStrictEqual(origins[1], origins[0], 'the second report points at the fresh controller');
      await fixture.stop(true);
    });

    it('keeps each origin when concurrent failures reject with one error object', async function () {
      const error = new Error('memoized rejection');
      const gate = new Deferred();
      const BoomA = CustomElement.define({ name: 'boom-a', template: 'x' }, class BoomA {
        public binding(): Promise<void> { return gate.promise; }
      });
      const BoomB = CustomElement.define({ name: 'boom-b', template: 'x' }, class BoomB {
        public binding(): Promise<void> { return gate.promise; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary><boom-a></boom-a><template au-slot="fallback">A</template></error-boundary>` +
        `<error-boundary><boom-b></boom-b><template au-slot="fallback">B</template></error-boundary>`,
        class App { },
        [BoomA, BoomB, Registration.instance(IErrorHandler, handler)],
      );
      gate.reject(error);
      await fixture.started;
      await tasksSettled();
      assert.html.textContent(fixture.appHost, 'AB');
      assert.deepStrictEqual(
        [...handler.calls].sort((a, b) => String(a.controller).localeCompare(String(b.controller))),
        [
          { error, phase: 'binding', controller: 'BoomA', handled: true },
          { error, phase: 'binding', controller: 'BoomB', handled: true },
        ],
      );
      await fixture.stop(true);
    });

    it('reports the same error object once per sibling boundary that catches it', async function () {
      const error = new Error('shared failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        `<error-boundary><boom></boom><template au-slot="fallback">A</template></error-boundary>` +
        `<error-boundary><boom></boom><template au-slot="fallback">B</template></error-boundary>`,
        class App { },
        [Boom, Registration.instance(IErrorHandler, handler)],
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'AB');
      assert.strictEqual(handler.calls.length, 2);
      await fixture.stop(true);
    });

    for (const hook of ['constructor', 'created'] as const) {
      it(`catches a throwing ${hook} while the content view is created`, async function () {
        const error = new Error(`${hook} boom`);
        const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
          public constructor() {
            if (hook === 'constructor') { throw error; }
          }
          public created(): void {
            if (hook === 'created') { throw error; }
          }
        });
        const handler = createRecordingHandler();
        const fixture = createFixture(
          `<error-boundary>
            <boom></boom>
            <template au-slot="fallback">FB</template>
          </error-boundary><ok-el></ok-el>`,
          class App { },
          [Boom, OkEl, Registration.instance(IErrorHandler, handler)],
        );
        await fixture.started;
        assert.html.textContent(fixture.appHost, 'FBok');
        assert.strictEqual(handler.calls.length, 1);
        assert.strictEqual(handler.calls[0].error, error);
        assert.strictEqual(handler.calls[0].handled, true);
        await fixture.stop(true);
      });
    }

    it('reports the same error object again each time a listener throws it', async function () {
      const error = new Error('shared listener failure');
      const handler = createRecordingHandler();
      const ctx = TestContext.create();
      const preventAuEventError = (e: Event) => { e.preventDefault(); };
      ctx.platform.window.addEventListener('au-event-error', preventAuEventError);
      try {
        const fixture = createFixture(
          `<button click.trigger="go()">go</button>`,
          class App {
            public go(): void { throw error; }
          },
          [Registration.instance(IErrorHandler, handler)],
          true,
          ctx,
        );
        await fixture.started;
        const button = fixture.appHost.querySelector('button')!;
        // Both clicks run in the same turn: they are still separate failures.
        button.click();
        button.click();
        await Promise.resolve();
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'event', controller: 'App', handled: false },
          { error, phase: 'event', controller: 'App', handled: false },
        ]);
        await fixture.stop(true);
      } finally {
        ctx.platform.window.removeEventListener('au-event-error', preventAuEventError);
      }
    });

    it('reports a template controller failure once when it escapes through a listener', async function () {
      const error = new Error('swap from click');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const ctx = TestContext.create();
      const preventAuEventError = (e: Event) => { e.preventDefault(); };
      ctx.platform.window.addEventListener('au-event-error', preventAuEventError);
      try {
        const fixture = createFixture(
          `<button click.trigger="show = true">go</button><boom if.bind="show"></boom>`,
          class App { public show = false; },
          [Boom, Registration.instance(IErrorHandler, handler)],
          true,
          ctx,
        );
        await fixture.started;
        fixture.appHost.querySelector('button')!.click();
        await Promise.resolve();
        assert.deepStrictEqual(handler.calls, [
          { error, phase: 'binding', controller: 'Boom', handled: false },
        ]);
        await fixture.stop(true);
      } finally {
        ctx.platform.window.removeEventListener('au-event-error', preventAuEventError);
      }
    });

    it('reports a listener-escaping failure once when another is caught while it unwinds', async function () {
      const outer = new Error('outer swap failure');
      const inner = new Error('inner swap failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw outer; }
      });
      const Bang = CustomElement.define({ name: 'bang', template: 'x' }, class Bang {
        public binding(): void { throw inner; }
      });
      const handler = createRecordingHandler();
      const ctx = TestContext.create();
      const preventAuEventError = (e: Event) => { e.preventDefault(); };
      ctx.platform.window.addEventListener('au-event-error', preventAuEventError);
      try {
        const fixture = createFixture(
          `<button click.trigger="go()">go</button><boom if.bind="a"></boom><bang if.bind="b"></bang>`,
          class App {
            public a = false;
            public b = false;
            public go(): void {
              try {
                this.a = true;
              } finally {
                try { this.b = true; } catch { /* the inner failure is handled here */ }
              }
            }
          },
          [Boom, Bang, Registration.instance(IErrorHandler, handler)],
          true,
          ctx,
        );
        await fixture.started;
        fixture.appHost.querySelector('button')!.click();
        await Promise.resolve();
        assert.deepStrictEqual(handler.calls, [
          { error: outer, phase: 'binding', controller: 'Boom', handled: false },
          { error: inner, phase: 'binding', controller: 'Bang', handled: false },
        ]);
        await fixture.stop(true);
      } finally {
        ctx.platform.window.removeEventListener('au-event-error', preventAuEventError);
      }
    });

    it('reports each caught template controller failure of the same error object in one turn', async function () {
      const error = new Error('shared swap failure');
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        public binding(): void { throw error; }
      });
      const handler = createRecordingHandler();
      const fixture = createFixture(
        '<boom if.bind="a"></boom><boom if.bind="b"></boom>',
        class App { public a = false; public b = false; },
        [Boom, Registration.instance(IErrorHandler, handler)],
      );
      assert.throws(() => { fixture.component.a = true; });
      assert.throws(() => { fixture.component.b = true; });
      assert.deepStrictEqual(handler.calls, [
        { error, phase: 'binding', controller: 'Boom', handled: false },
        { error, phase: 'binding', controller: 'Boom', handled: false },
      ]);
      await fixture.stop(true);
    });

    it('reports a primitive thrown by a listener-driven template controller swap once', async function () {
      const Boom = CustomElement.define({ name: 'boom', template: 'x' }, class Boom {
        // eslint-disable-next-line no-throw-literal
        public binding(): void { throw 'primitive boom'; }
      });
      const handler = createRecordingHandler();
      const ctx = TestContext.create();
      const preventAuEventError = (e: Event) => { e.preventDefault(); };
      ctx.platform.window.addEventListener('au-event-error', preventAuEventError);
      try {
        const fixture = createFixture(
          `<button click.trigger="show = true">go</button><boom if.bind="show"></boom>`,
          class App { public show = false; },
          [Boom, Registration.instance(IErrorHandler, handler)],
          true,
          ctx,
        );
        await fixture.started;
        fixture.appHost.querySelector('button')!.click();
        await Promise.resolve();
        assert.deepStrictEqual(
          handler.calls.map(c => [c.error, c.phase, c.handled]),
          [['primitive boom', 'attaching', false]],
        );
        await fixture.stop(true);
      } finally {
        ctx.platform.window.removeEventListener('au-event-error', preventAuEventError);
      }
    });

    it('reports errors from rate-limited binding callbacks with phase task', async function () {
      const error = new Error('debounced boom');
      const handler = createRecordingHandler();
      const unhandled = observeUnhandledRejections();
      const originalConsoleError = console.error;
      console.error = () => { /* the queue keeps logging the rethrown error */ };
      try {
        const fixture = createFixture(
          `<button click.trigger="go() & debounce:5">go</button>`,
          class App {
            public go(): void { throw error; }
          },
          [Registration.instance(IErrorHandler, handler)],
        );
        await fixture.started;
        fixture.appHost.querySelector('button')!.click();
        await new Promise(resolve => setTimeout(resolve, 30));
        await tasksSettled().catch(() => { /* the task rethrows */ });
        assert.deepStrictEqual(
          handler.calls.map(c => [c.error, c.phase, c.controller, c.handled]),
          [[error, 'task', 'App', false]],
        );
        await fixture.stop(true);
      } finally {
        console.error = originalConsoleError;
        unhandled.dispose();
      }
    });

    it('binds content against the declaring scope inside a repeat', async function () {
      const fixture = createFixture(
        `<div repeat.for="item of items"><error-boundary>\${item}-\${$index};</error-boundary></div>`,
        class App { public items = ['a', 'b']; },
      );
      await fixture.started;
      assert.html.textContent(fixture.appHost, 'a-0;b-1;');
      await fixture.stop(true);
    });
  });
});

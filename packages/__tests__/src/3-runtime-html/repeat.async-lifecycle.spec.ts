import {
  Aurelia,
  CustomElement,
  ISSRContext,
  customElement,
  type IHydratedController,
  type IHydratedParentController,
  type ISSRScope,
  Repeat,
} from '@aurelia/runtime-html';
import { IContainer, Registration, resolve, type IResolver } from '@aurelia/kernel';
import { createIndexMap, tasksSettled } from '@aurelia/runtime';
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

function findRepeat(root: IHydratedController): Repeat {
  let repeat: Repeat | undefined;
  root.accept(controller => {
    if (controller.viewModel instanceof Repeat) {
      repeat = controller.viewModel;
      return true;
    }
  });
  assert.notStrictEqual(repeat, void 0);
  return repeat!;
}

describe('3-runtime-html/repeat.async-lifecycle.spec.ts', function () {
  describe('single-writer and latest-generation reconciliation', function () {
    it('serializes consecutive mutations while ordinary rows are detaching', async function () {
      const gates = new Map<number, Deferred>();
      const detaching: number[] = [];
      let shouldBlock = true;

      @customElement({ name: 'async-repeat-row', template: '${value}', bindables: ['value'] })
      class AsyncRow {
        public value!: number;

        public detaching(): void | Promise<void> {
          detaching.push(this.value);
          if (!shouldBlock) {
            return;
          }
          const gate = new Deferred();
          gates.set(this.value, gate);
          return gate.promise;
        }
      }

      const fixture = createFixture(
        '<async-repeat-row repeat.for="item of items" value.bind="item"></async-repeat-row>',
        class { public items = [0, 1, 2]; },
        [AsyncRow],
      );
      const { appHost, assertText, component } = fixture;
      const repeat = findRepeat(fixture.au.root.controller);
      const internals = repeat as unknown as { _isReconciling: boolean };
      assertText('012');

      component.items.splice(0, 1);
      component.items.splice(0, 1);

      assert.deepStrictEqual(detaching, [0]);
      assert.strictEqual(gates.has(1), false);

      gates.get(0)!.resolve();
      await waitFor(() => gates.has(1));
      assert.deepStrictEqual(detaching, [0, 1]);

      gates.get(1)!.resolve();
      await waitFor(() => appHost.textContent === '2' && !internals._isReconciling);
      assertText('2');

      shouldBlock = false;
      component.items.push(3);
      assertText('23');

      await fixture.tearDown();
    });

    it('serializes consecutive removals of repeated au-compose rows', async function () {
      const gates = new Map<number, Deferred>();
      const detaching: number[] = [];
      let shouldBlock = true;

      @customElement({ name: 'composed-repeat-row', template: '${value}' })
      class ComposedRow {
        public value!: number;

        public activate(value: number): void {
          this.value = value;
        }

        public detaching(): void | Promise<void> {
          detaching.push(this.value);
          if (!shouldBlock) {
            return;
          }
          const gate = new Deferred();
          gates.set(this.value, gate);
          return gate.promise;
        }
      }

      const fixture = createFixture(
        '<au-compose repeat.for="item of items" component.bind="row" model.bind="item"></au-compose>',
        class {
          public items = [0, 1, 2];
          public readonly row = ComposedRow;
        },
        [ComposedRow],
      );
      const { appHost, assertText, component } = fixture;
      assertText('012');

      component.items.splice(0, 1);
      component.items.splice(0, 1);

      assert.deepStrictEqual(detaching, [0]);
      assert.strictEqual(gates.has(1), false);

      gates.get(0)!.resolve();
      await waitFor(() => gates.has(1));
      gates.get(1)!.resolve();
      await waitFor(() => appHost.textContent === '2');

      assert.deepStrictEqual(detaching, [0, 1]);
      assertText('2');

      shouldBlock = false;
      await fixture.tearDown();
    });

    it('owns an async generation queued from a synchronous row teardown', async function () {
      const gate = new Deferred();

      @customElement({ name: 'sync-queues-async-repeat-row', template: '${value}', bindables: ['value'] })
      class SyncQueuesAsyncRow {
        public value!: number;

        public attaching(): void | Promise<void> {
          return this.value === 2 ? gate.promise : void 0;
        }

        public detaching(): void {
          if (this.value === 0) {
            fixture.component.items.push(2);
          }
        }
      }

      class App { public items = [0, 1]; }

      const fixture = createFixture(
        '<sync-queues-async-repeat-row repeat.for="item of items" value.bind="item"></sync-queues-async-repeat-row>',
        App,
        [SyncQueuesAsyncRow],
      );
      const repeat = findRepeat(fixture.au.root.controller);
      const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

      fixture.component.items.shift();
      const reconciliation = internals._reconciliation?.promise;
      if (!(reconciliation instanceof Promise)) {
        throw new Error('Expected an asynchronous reconciliation');
      }
      let settled = false;
      void reconciliation.then(
        () => { settled = true; },
        () => { settled = true; },
      );
      await Promise.resolve();
      assert.strictEqual(settled, false);
      fixture.assertText('12');

      gate.resolve();
      await reconciliation;
      fixture.assertText('12');
      await fixture.tearDown();
    });

    it('recovers asynchronously when a synchronous row teardown queues a newer generation and fails', async function () {
      const gate = new Deferred();
      const teardownError = new Error('synchronous row teardown failed');

      @customElement({ name: 'sync-failure-queues-async-row', template: '${value}', bindables: ['value'] })
      class SyncFailureQueuesAsyncRow {
        public value!: number;

        public attaching(): void | Promise<void> {
          return this.value === 2 ? gate.promise : void 0;
        }

        public detaching(): void {
          if (this.value === 0) {
            fixture.component.items.push(2);
            throw teardownError;
          }
        }
      }

      class App { public items = [0, 1]; }

      const fixture = createFixture(
        '<sync-failure-queues-async-row repeat.for="item of items" value.bind="item"></sync-failure-queues-async-row>',
        App,
        [SyncFailureQueuesAsyncRow],
      );
      const repeat = findRepeat(fixture.au.root.controller);
      const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

      fixture.component.items.shift();
      const reconciliation = internals._reconciliation?.promise;
      if (!(reconciliation instanceof Promise)) {
        throw new Error('Expected an asynchronous reconciliation');
      }

      gate.resolve();
      await assert.rejects(() => reconciliation, teardownError);
      fixture.assertText('12');
      await fixture.tearDown();
    });

    it('observes a replacement collection and its mutations while teardown is pending', async function () {
      const gate = new Deferred();
      let block = true;

      @customElement({ name: 'replacement-repeat-row', template: '${value}', bindables: ['value'] })
      class ReplacementRow {
        public value!: number;

        public detaching(): void | Promise<void> {
          if (block && this.value === 0) {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<replacement-repeat-row repeat.for="item of items" value.bind="item"></replacement-repeat-row>',
        class { public items = [0, 1]; },
        [ReplacementRow],
      );

      const oldItems = fixture.component.items;
      const newItems = [2, 3];
      oldItems.splice(0, 1);
      fixture.component.items = newItems;
      await tasksSettled();
      oldItems.push(9);
      newItems.push(4);
      await tasksSettled();
      assert.strictEqual(fixture.appHost.textContent, '01');

      gate.resolve();
      await waitFor(() => fixture.appHost.textContent === '234');
      fixture.assertText('234');

      oldItems.push(10);
      await tasksSettled();
      fixture.assertText('234');
      newItems.push(5);
      fixture.assertText('2345');

      block = false;
      await fixture.tearDown();
    });

    it('recomputes keyed reorder, deletion, and insertion from the latest desired state', async function () {
      const gate = new Deferred();
      let block = true;

      @customElement({ name: 'keyed-repeat-row', template: '${item.name}', bindables: ['item'] })
      class KeyedRow {
        public item!: { id: number; name: string };

        public detaching(): void | Promise<void> {
          if (block && this.item.id === 1) {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<keyed-repeat-row repeat.for="item of items; key: id" item.bind="item"></keyed-repeat-row>',
        class {
          public items = [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
            { id: 3, name: 'C' },
          ];
        },
        [KeyedRow],
      );

      fixture.component.items.splice(0, 1);
      fixture.component.items = [
        { id: 3, name: 'C2' },
        { id: 4, name: 'D' },
        { id: 2, name: 'B2' },
      ];
      await tasksSettled();
      assert.strictEqual(fixture.appHost.textContent, 'ABC');

      gate.resolve();
      await waitFor(() => fixture.appHost.textContent === 'C2DB2');
      fixture.assertText('C2DB2');

      block = false;
      await fixture.tearDown();
    });

    for (const [label, keySyntax] of [
      ['static', 'key: id'],
      ['expression', 'key.bind: item.id'],
    ] as const) {
      it(`preserves duplicate keyed row identity with a ${label} key`, async function () {
        const gate = new Deferred();
        const detaching: string[] = [];
        let nextInstanceId = 0;
        let block = true;

        @customElement({
          name: `duplicate-${label}-key-row`,
          template: '${instanceId}:${item.label}|',
          bindables: ['item'],
        })
        class DuplicateKeyRow {
          public readonly instanceId = ++nextInstanceId;
          public item!: { id: number; label: string };

          public detaching(): void | Promise<void> {
            detaching.push(this.item.label);
            if (block && this.item.id === 2) {
              return gate.promise;
            }
          }
        }

        const a = { id: 1, label: 'A' };
        const b = { id: 1, label: 'B' };
        const c = { id: 2, label: 'C' };
        const d = { id: 3, label: 'D' };
        const fixture = createFixture(
          `<duplicate-${label}-key-row repeat.for="item of items; ${keySyntax}" item.bind="item"></duplicate-${label}-key-row>`,
          class { public items = [a, b, c]; },
          [DuplicateKeyRow],
        );
        fixture.assertText('1:A|2:B|3:C|');

        fixture.component.items.pop();
        fixture.component.items = [b, a, d];
        await tasksSettled();
        fixture.assertText('1:A|2:B|3:C|');

        gate.resolve();
        await waitFor(() => fixture.appHost.textContent === '1:B|2:A|4:D|');
        fixture.assertText('1:B|2:A|4:D|');
        assert.strictEqual(nextInstanceId, 4);
        assert.deepStrictEqual(detaching, ['C']);

        block = false;
        await fixture.tearDown();
      });
    }

    it('keeps object-binding-pattern locals coherent across a queued replacement', async function () {
      const gate = new Deferred();
      let block = true;

      @customElement({ name: 'pattern-repeat-row', template: '${id}:${name}', bindables: ['id', 'name'] })
      class PatternRow {
        public id!: number;
        public name!: string;

        public detaching(): void | Promise<void> {
          if (block && this.id === 1) {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<pattern-repeat-row repeat.for="{ id, name } of items; key: id" id.bind="id" name.bind="name"></pattern-repeat-row>',
        class {
          public items = [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
          ];
        },
        [PatternRow],
      );

      fixture.component.items.shift();
      fixture.component.items = [
        { id: 2, name: 'B2' },
        { id: 3, name: 'C' },
      ];
      await tasksSettled();
      assert.strictEqual(fixture.appHost.textContent, '1:A2:B');

      gate.resolve();
      await waitFor(() => fixture.appHost.textContent === '2:B23:C');
      fixture.assertText('2:B23:C');

      block = false;
      await fixture.tearDown();
    });

    it('recovers after a queued key expression throws', async function () {
      const gate = new Deferred();
      const keyError = new Error('repeat key failed');
      let block = true;

      @customElement({ name: 'throwing-key-repeat-row', template: '${item.label}', bindables: ['item'] })
      class ThrowingKeyRow {
        public item!: { readonly id: number; readonly label: string };

        public detaching(): void | Promise<void> {
          if (block && this.item.id === 1) {
            return gate.promise;
          }
        }
      }

      const first = { id: 1, label: 'A' };
      const second = { id: 2, label: 'B' };
      const invalid = {
        get id(): number { throw keyError; },
        label: 'invalid',
      };
      const fixture = createFixture(
        '<throwing-key-repeat-row repeat.for="item of items; key.bind: item.id" item.bind="item"></throwing-key-repeat-row>',
        class { public items = [first, second]; },
        [ThrowingKeyRow],
      );
      const repeat = findRepeat(fixture.au.root.controller);
      const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

      fixture.component.items.shift();
      fixture.component.items = [invalid];
      await tasksSettled();
      const reconciliation = internals._reconciliation?.promise;
      assert.instanceOf(reconciliation, Promise);
      const rejected = assert.rejects(() => reconciliation!, keyError);

      gate.resolve();
      await rejected;
      fixture.assertText('B');

      fixture.component.items = [{ id: 3, label: 'C' }];
      await tasksSettled();
      fixture.assertText('C');

      block = false;
      await fixture.tearDown();
    });

    it('recovers after an active object-binding projection throws', async function () {
      const gate = new Deferred();
      const projectionError = new Error('repeat projection failed');
      let block = true;

      @customElement({ name: 'throwing-pattern-repeat-row', template: '${id}:${name}', bindables: ['id', 'name'] })
      class ThrowingPatternRow {
        public id!: number;
        public name!: string;

        public detaching(): void | Promise<void> {
          if (block && this.id === 1) {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<throwing-pattern-repeat-row repeat.for="{ id, name } of items; key: id" id.bind="id" name.bind="name"></throwing-pattern-repeat-row>',
        class {
          public items: { readonly id: number; readonly name: string }[] = [
            { id: 1, name: 'A' },
            { id: 2, name: 'B' },
          ];
        },
        [ThrowingPatternRow],
      );
      const repeat = findRepeat(fixture.au.root.controller);
      const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };
      const invalid = {
        id: 2,
        get name(): string { throw projectionError; },
      };

      fixture.component.items.shift();
      fixture.component.items = [invalid];
      await tasksSettled();
      const reconciliation = internals._reconciliation?.promise;
      assert.instanceOf(reconciliation, Promise);
      const rejected = assert.rejects(() => reconciliation!, projectionError);

      gate.resolve();
      await rejected;
      fixture.assertText('2:B');

      fixture.component.items = [{ id: 2, name: 'B2' }];
      await tasksSettled();
      fixture.assertText('2:B2');

      block = false;
      await fixture.tearDown();
    });

    it('composes queued Set delete, re-add, and clear mutations while a row is detaching', async function () {
      const gate = new Deferred();
      const detaching: number[] = [];
      let block = true;

      @customElement({ name: 'set-repeat-row', template: '${value}', bindables: ['value'] })
      class SetRow {
        public value!: number;

        public detaching(): void | Promise<void> {
          detaching.push(this.value);
          if (block && this.value === 0) {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<set-repeat-row repeat.for="item of items" value.bind="item"></set-repeat-row>',
        class { public items = new Set([0, 1, 2]); },
        [SetRow],
      );

      fixture.component.items.delete(0);
      fixture.component.items.delete(1);
      fixture.component.items.add(1);
      fixture.component.items.clear();
      fixture.component.items.add(3);
      gate.resolve();

      await waitFor(() => fixture.appHost.textContent === '3');
      fixture.assertText('3');
      assert.deepStrictEqual(detaching, [0, 1, 2]);
      block = false;
      await fixture.tearDown();
    });

    it('composes queued Map replacement and clear mutations while a row is detaching', async function () {
      const gate = new Deferred();
      const detaching: string[] = [];
      let block = true;

      @customElement({ name: 'map-repeat-row', template: '${entry[0]}:${entry[1]}', bindables: ['entry'] })
      class MapRow {
        public entry!: [string, number];

        public detaching(): void | Promise<void> {
          detaching.push(this.entry[0]);
          if (block && this.entry[0] === 'c') {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<map-repeat-row repeat.for="entry of items" entry.bind="entry"></map-repeat-row>',
        class { public items = new Map<string, number>([['a', 1], ['b', 2], ['c', 3]]); },
        [MapRow],
      );

      fixture.component.items.delete('c');
      fixture.component.items.set('a', 10);
      fixture.component.items.clear();
      fixture.component.items.set('d', 4);
      gate.resolve();

      await waitFor(() => fixture.appHost.textContent === 'd:4');
      fixture.assertText('d:4');
      assert.deepStrictEqual(detaching, ['c', 'a', 'b']);
      block = false;
      await fixture.tearDown();
    });

    it('recomputes a queued numeric range from the latest value', async function () {
      const gate = new Deferred();
      let block = true;

      @customElement({ name: 'number-repeat-row', template: '${value}', bindables: ['value'] })
      class NumberRow {
        public value!: number;

        public detaching(): void | Promise<void> {
          if (block && this.value === 2) {
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<number-repeat-row repeat.for="item of items" value.bind="item"></number-repeat-row>',
        class { public items = 3; },
        [NumberRow],
      );

      fixture.component.items = 2;
      await tasksSettled();
      fixture.component.items = 4;
      await tasksSettled();
      assert.strictEqual(fixture.appHost.textContent, '012');
      gate.resolve();

      await waitFor(() => fixture.appHost.textContent === '0123');
      fixture.assertText('0123');
      block = false;
      await fixture.tearDown();
    });

    describe('failure and quiescence', function () {
      it('waits for all rejected row teardowns, keeps the first error, and remains reusable', async function () {
        const first = new Deferred();
        const second = new Deferred();
        const firstError = new Error('first row failed');
        const secondError = new Error('second row failed');
        const disposed: number[] = [];
        let rejectRows = true;

        @customElement({ name: 'rejecting-repeat-row', template: '${value}', bindables: ['value'] })
        class RejectingRow {
          public value!: number;

          public detaching(): void | Promise<void> {
            if (!rejectRows) {
              return;
            }
            return this.value === 1 ? first.promise : second.promise;
          }

          public dispose(): void {
            disposed.push(this.value);
          }
        }

        const fixture = createFixture(
          '<rejecting-repeat-row repeat.for="item of items" value.bind="item"></rejecting-repeat-row>',
          class { public items = [0, 1, 2]; },
          [RejectingRow],
        );
        const { appHost, assertText, component } = fixture;
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as {
          _reconciliation?: { promise?: Promise<void> };
        };

        component.items.splice(1, 2);
        const reconciliation = internals._reconciliation?.promise;
        if (!(reconciliation instanceof Promise)) {
          throw new Error('Expected an asynchronous reconciliation');
        }
        second.reject(secondError);
        await Promise.resolve();
        await Promise.resolve();
        let settled = false;
        void reconciliation.then(
          () => { settled = true; },
          () => { settled = true; },
        );
        assert.strictEqual(settled, false);

        first.reject(firstError);
        await assert.rejects(() => reconciliation, firstError);
        await waitFor(() => appHost.textContent === '0');

        assert.deepStrictEqual(disposed.sort(), [1, 2]);
        assertText('0');

        rejectRows = false;
        component.items.push(3);
        assertText('03');

        await fixture.tearDown();
      });

      it('drains a queued desired generation before reporting a teardown failure', async function () {
        const gate = new Deferred();
        const teardownError = new Error('row teardown failed');
        const disposed: number[] = [];

        @customElement({ name: 'queued-failure-repeat-row', template: '${value}', bindables: ['value'] })
        class QueuedFailureRow {
          public value!: number;

          public detaching(): void | Promise<void> {
            return this.value === 1 ? gate.promise : void 0;
          }

          public dispose(): void {
            disposed.push(this.value);
          }
        }

        const fixture = createFixture(
          '<queued-failure-repeat-row repeat.for="item of items" value.bind="item"></queued-failure-repeat-row>',
          class { public items = [0, 1, 2]; },
          [QueuedFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as {
          _factory: {
            setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
            create(parent?: unknown): { dispose(): void };
          };
          _reconciliation?: { promise?: Promise<void> };
        };
        internals._factory.setCacheSize('*', false);

        const failedView = repeat!.views[1];
        fixture.component.items.splice(1, 1);
        const reconciliation = internals._reconciliation?.promise;
        assert.instanceOf(reconciliation, Promise);
        fixture.component.items.push(3);

        gate.reject(teardownError);
        await assert.rejects(() => reconciliation!, teardownError);
        await waitFor(() => fixture.appHost.textContent === '023');
        fixture.assertText('023');
        assert.deepStrictEqual(disposed, [1]);
        const nextView = internals._factory.create(repeat!.$controller);
        assert.notStrictEqual(nextView, failedView, 'a disposed failed view must not remain in the factory cache');
        nextView.dispose();

        fixture.component.items.push(4);
        fixture.assertText('0234');
        await fixture.tearDown();
      });

      it('keeps the original failure when the queued recovery generation throws synchronously', async function () {
        const teardownGate = new Deferred();
        const teardownError = new Error('row teardown failed');
        const recoveryError = new Error('queued row activation failed');
        let failRecovery = true;

        @customElement({ name: 'sync-recovery-failure-row', template: '${value}', bindables: ['value'] })
        class SyncRecoveryFailureRow {
          public value!: number;

          public attaching(): void {
            if (failRecovery && this.value === 2) {
              throw recoveryError;
            }
          }

          public detaching(): void | Promise<void> {
            return this.value === 0 ? teardownGate.promise : void 0;
          }
        }

        const fixture = createFixture(
          '<sync-recovery-failure-row repeat.for="item of items" value.bind="item"></sync-recovery-failure-row>',
          class { public items = [0, 1]; },
          [SyncRecoveryFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

        fixture.component.items.shift();
        const reconciliation = internals._reconciliation?.promise;
        assert.instanceOf(reconciliation, Promise);
        fixture.component.items.push(2);

        teardownGate.reject(teardownError);
        await assert.rejects(() => reconciliation!, teardownError);

        failRecovery = false;
        fixture.component.items.push(3);
        fixture.assertText('123');
        await fixture.tearDown();
      });

      it('keeps the original failure when the queued recovery generation rejects asynchronously', async function () {
        const teardownGate = new Deferred();
        const recoveryGate = new Deferred();
        const teardownError = new Error('row teardown failed');
        const recoveryError = new Error('queued row activation failed');
        const attaching: number[] = [];
        let failRecovery = true;

        @customElement({ name: 'async-recovery-failure-row', template: '${value}', bindables: ['value'] })
        class AsyncRecoveryFailureRow {
          public value!: number;

          public attaching(): void | Promise<void> {
            attaching.push(this.value);
            return failRecovery && this.value === 2 ? recoveryGate.promise : void 0;
          }

          public detaching(): void | Promise<void> {
            return this.value === 0 ? teardownGate.promise : void 0;
          }
        }

        const fixture = createFixture(
          '<async-recovery-failure-row repeat.for="item of items" value.bind="item"></async-recovery-failure-row>',
          class { public items = [0, 1]; },
          [AsyncRecoveryFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

        fixture.component.items.shift();
        const reconciliation = internals._reconciliation?.promise;
        assert.instanceOf(reconciliation, Promise);
        fixture.component.items.push(2);

        teardownGate.reject(teardownError);
        await waitFor(() => attaching.includes(2));
        recoveryGate.reject(recoveryError);
        await assert.rejects(() => reconciliation!, teardownError);

        failRecovery = false;
        fixture.component.items.push(3);
        fixture.assertText('123');
        await fixture.tearDown();
      });

      for (const completionMode of ['throws', 'resolves', 'rejects'] as const) {
        it(`preserves a synchronous teardown failure when replacement activation ${completionMode}`, async function () {
          const activationGate = new Deferred();
          const teardownError = new Error('removed row teardown failed');
          const activationError = new Error('replacement row activation failed');
          let fail = true;

          @customElement({ name: `replacement-${completionMode}-row`, template: '${value}', bindables: ['value'] })
          class ReplacementRow {
            public value!: number;

            public attaching(): void | Promise<void> {
              if (!fail || this.value !== 1) {
                return;
              }
              if (completionMode === 'throws') {
                throw activationError;
              }
              return activationGate.promise;
            }

            public detaching(): void {
              if (fail && this.value === 0) {
                throw teardownError;
              }
            }
          }

          const fixture = createFixture(
            `<replacement-${completionMode}-row repeat.for="item of items" value.bind="item"></replacement-${completionMode}-row>`,
            class { public items = [0]; },
            [ReplacementRow],
          );
          const repeat = findRepeat(fixture.au.root.controller);
          const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

          if (completionMode === 'throws') {
            assert.throws(() => fixture.component.items.splice(0, 1, 1), teardownError);
          } else {
            fixture.component.items.splice(0, 1, 1);
            const reconciliation = internals._reconciliation?.promise;
            assert.instanceOf(reconciliation, Promise);
            if (completionMode === 'resolves') {
              activationGate.resolve();
            } else {
              activationGate.reject(activationError);
            }
            await assert.rejects(() => reconciliation!, teardownError);
          }

          fail = false;
          fixture.component.items.push(2);
          fixture.assertText('12');
          await fixture.tearDown();
        });
      }

      it('cleans remaining rows when owner teardown races a rejected reconciliation', async function () {
        const gate = new Deferred();
        const teardownError = new Error('pending row failed');
        const detaching: number[] = [];

        @customElement({ name: 'owner-failure-repeat-row', template: '${value}', bindables: ['value'] })
        class OwnerFailureRow {
          public value!: number;

          public detaching(): void | Promise<void> {
            detaching.push(this.value);
            return this.value === 0 ? gate.promise : void 0;
          }
        }

        const fixture = createFixture(
          '<owner-failure-repeat-row repeat.for="item of items" value.bind="item"></owner-failure-repeat-row>',
          class { public items = [0, 1]; },
          [OwnerFailureRow],
        );
        fixture.component.items.shift();
        const stop = Promise.resolve(fixture.stop(true));
        gate.reject(teardownError);

        await assert.rejects(() => stop, teardownError);
        assert.deepStrictEqual(detaching, [0, 1]);
        assert.strictEqual(fixture.appHost.textContent, '');
      });

      it('aggregates reconciliation and owner-cleanup failures in causal order', async function () {
        const gate = new Deferred();
        const reconciliationError = new Error('reconciliation failed');
        const cleanupError = new Error('owner cleanup failed');

        @customElement({ name: 'owner-double-failure-row', template: '${value}', bindables: ['value'] })
        class OwnerDoubleFailureRow {
          public value!: number;

          public detaching(): void | Promise<void> {
            if (this.value === 0) {
              return gate.promise;
            }
          }
        }

        const fixture = createFixture(
          '<owner-double-failure-row repeat.for="item of items" value.bind="item"></owner-double-failure-row>',
          class { public items = [0, 1]; },
          [OwnerDoubleFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        fixture.component.items.shift();
        const remainingView = repeat.views[0];
        const deactivate = remainingView.deactivate;
        (remainingView as unknown as { deactivate(): void }).deactivate = () => { throw cleanupError; };
        const teardown = Promise.resolve(repeat.detaching(
          repeat.$controller,
          repeat.$controller.parent as IHydratedParentController,
        ));
        gate.reject(reconciliationError);

        await assert.rejects(
          () => teardown,
          error => error instanceof AggregateError
            && error.errors[0] === reconciliationError
            && error.errors[1] === cleanupError,
        );
        (remainingView as unknown as { deactivate: typeof deactivate }).deactivate = deactivate;
        repeat.views = [];
        await fixture.tearDown();
      });

      it('quiesces dynamic insertions after a synchronous row activation failure and retries the row', async function () {
        const gate = new Deferred();
        const activationError = new Error('sync inserted row failed');
        const attaching: number[] = [];
        let fail = true;

        @customElement({ name: 'sync-insert-failure-row', template: '${value}', bindables: ['value'] })
        class SyncInsertFailureRow {
          public value!: number;

          public attaching(): void | Promise<void> {
            attaching.push(this.value);
            if (!fail) {
              return;
            }
            if (this.value === 1) {
              throw activationError;
            }
            return this.value === 2 ? gate.promise : void 0;
          }
        }

        const fixture = createFixture(
          '<sync-insert-failure-row repeat.for="item of items" value.bind="item"></sync-insert-failure-row>',
          class { public items = [0]; },
          [SyncInsertFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

        fixture.component.items.push(1, 2);
        const reconciliation = internals._reconciliation?.promise;
        if (!(reconciliation instanceof Promise)) {
          throw new Error('Expected an asynchronous reconciliation');
        }
        assert.deepStrictEqual(attaching, [0, 2, 1]);
        let settled = false;
        void reconciliation.then(
          () => { settled = true; },
          () => { settled = true; },
        );
        await Promise.resolve();
        assert.strictEqual(settled, false);

        gate.resolve();
        await assert.rejects(() => reconciliation, activationError);
        fixture.assertText('02');

        fail = false;
        fixture.component.items.push(3);
        fixture.assertText('0123');
        await fixture.tearDown();
      });

      it('orders dynamic async insertion failures by row and retries both rows', async function () {
        const first = new Deferred();
        const second = new Deferred();
        const firstError = new Error('first inserted row failed');
        const secondError = new Error('second inserted row failed');
        let fail = true;

        @customElement({ name: 'async-insert-failure-row', template: '${value}', bindables: ['value'] })
        class AsyncInsertFailureRow {
          public value!: number;

          public attaching(): void | Promise<void> {
            if (!fail) {
              return;
            }
            return this.value === 1
              ? first.promise
              : this.value === 2
                ? second.promise
                : void 0;
          }
        }

        const fixture = createFixture(
          '<async-insert-failure-row repeat.for="item of items" value.bind="item"></async-insert-failure-row>',
          class { public items = [0]; },
          [AsyncInsertFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

        fixture.component.items.push(1, 2);
        const reconciliation = internals._reconciliation?.promise;
        if (!(reconciliation instanceof Promise)) {
          throw new Error('Expected an asynchronous reconciliation');
        }
        second.reject(secondError);
        await Promise.resolve();
        await Promise.resolve();
        let settled = false;
        void reconciliation.then(
          () => { settled = true; },
          () => { settled = true; },
        );
        assert.strictEqual(settled, false);

        first.reject(firstError);
        await assert.rejects(() => reconciliation, firstError);
        fixture.assertText('0');

        fail = false;
        fixture.component.items.push(3);
        fixture.assertText('0123');
        await fixture.tearDown();
      });

      it('continues synchronous row teardown when failed-view disposal also throws', async function () {
        const sibling = new Deferred();
        const lifecycleError = new Error('row lifecycle failed');
        const cleanupError = new Error('row disposal failed');
        const detaching: number[] = [];

        @customElement({ name: 'sync-dispose-failure-row', template: '${value}', bindables: ['value'] })
        class SyncDisposeFailureRow {
          public value!: number;

          public detaching(): void | Promise<void> {
            detaching.push(this.value);
            if (this.value === 1) {
              throw lifecycleError;
            }
            return this.value === 2 ? sibling.promise : void 0;
          }

          public dispose(): void {
            if (this.value === 1) {
              throw cleanupError;
            }
          }
        }

        const fixture = createFixture(
          '<sync-dispose-failure-row repeat.for="item of items" value.bind="item"></sync-dispose-failure-row>',
          class { public items = [0, 1, 2]; },
          [SyncDisposeFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

        fixture.component.items.splice(1, 2);
        const reconciliation = internals._reconciliation?.promise;
        if (!(reconciliation instanceof Promise)) {
          throw new Error('Expected an asynchronous reconciliation');
        }
        assert.deepStrictEqual(detaching, [1, 2]);
        sibling.resolve();

        await assert.rejects(() => reconciliation!, lifecycleError);
        fixture.assertText('0');
        await fixture.tearDown();
      });

      it('quiesces asynchronous siblings when failed-view disposal throws', async function () {
        const first = new Deferred();
        const second = new Deferred();
        const lifecycleError = new Error('async row lifecycle failed');
        const cleanupError = new Error('async row disposal failed');

        @customElement({ name: 'async-dispose-failure-row', template: '${value}', bindables: ['value'] })
        class AsyncDisposeFailureRow {
          public value!: number;

          public detaching(): void | Promise<void> {
            return this.value === 1 ? first.promise : second.promise;
          }

          public dispose(): void {
            if (this.value === 1) {
              throw cleanupError;
            }
          }
        }

        const fixture = createFixture(
          '<async-dispose-failure-row repeat.for="item of items" value.bind="item"></async-dispose-failure-row>',
          class { public items = [0, 1, 2]; },
          [AsyncDisposeFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as { _reconciliation?: { promise?: Promise<void> } };

        fixture.component.items.splice(1, 2);
        const reconciliation = internals._reconciliation?.promise;
        if (!(reconciliation instanceof Promise)) {
          throw new Error('Expected an asynchronous reconciliation');
        }
        first.reject(lifecycleError);
        await Promise.resolve();
        await Promise.resolve();
        let settled = false;
        void reconciliation.then(
          () => { settled = true; },
          () => { settled = true; },
        );
        assert.strictEqual(settled, false);

        second.resolve();
        await assert.rejects(() => reconciliation, lifecycleError);
        fixture.assertText('0');
        await fixture.tearDown();
      });

      for (const lifecycleFails of [false, true]) {
        it(`${lifecycleFails ? 'aggregates lifecycle and cleanup failures' : 'reports cleanup failure'} after adopted rows quiesce`, async function () {
          const lowerGate = new Deferred();
          const higherGate = new Deferred();
          const lifecycleError = new Error('lower adopted row teardown failed');
          const lowerCleanupError = new Error('lower adopted row cleanup failed');
          const higherCleanupError = new Error('higher adopted row cleanup failed');
          const cleanupCalls: number[] = [];
          let isClient = false;
          let clientApp!: App;

          @customElement({
            name: `adopted-cleanup-${lifecycleFails ? 'aggregate' : 'only'}-row`,
            template: '${value}',
            bindables: ['value'],
          })
          class AdoptedCleanupFailureRow {
            public value!: number;
            private readonly container = resolve(IContainer);
            private registered = false;

            public attaching(): void {
              if (!isClient || this.registered) {
                return;
              }
              this.registered = true;
              const cleanupError = this.value === 0 ? lowerCleanupError : higherCleanupError;
              this.container.registerResolver(Symbol(), {
                $isResolver: true,
                resolve: () => void 0,
                dispose: () => {
                  cleanupCalls.push(this.value);
                  throw cleanupError;
                },
              } satisfies IResolver, true);
            }

            public detaching(): void | Promise<void> {
              return isClient
                ? this.value === 0 ? lowerGate.promise : higherGate.promise
                : void 0;
            }
          }

          const elementName = `adopted-cleanup-${lifecycleFails ? 'aggregate' : 'only'}-row`;
          const appName = `adopted-cleanup-${lifecycleFails ? 'aggregate' : 'only'}-app`;
          class App {
            public items = [0, 1];

            public constructor() {
              if (isClient) {
                clientApp = this;
              }
            }
          }
          const AppElement = CustomElement.define({
            name: appName,
            template: `<${elementName} repeat.for="item of items" value.bind="item"></${elementName}>`,
          }, App);

          const serverCtx = TestContext.create();
          serverCtx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
          const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement(appName));
          const serverAu = new Aurelia(serverCtx.container).register(AdoptedCleanupFailureRow).app({
            host: serverHost,
            component: AppElement,
          });
          let serverMarkup: string;
          try {
            await serverAu.start();
            serverMarkup = serverHost.innerHTML;
          } finally {
            await serverAu.stop(true);
            serverAu.dispose();
            serverHost.remove();
          }
          isClient = true;
          const clientCtx = TestContext.create();
          const clientHost = clientCtx.doc.body.appendChild(clientCtx.createElement(appName));
          clientHost.innerHTML = serverMarkup;
          const ssrScope: ISSRScope = {
            name: appName,
            children: [{
              type: 'repeat',
              views: [0, 1].map(() => ({
                // Each repeated view owns its instruction marker and CE host.
                nodeCount: 2,
                children: [{ name: elementName, children: [] }],
              })),
            }],
          };
          const clientAu = new Aurelia(clientCtx.container).register(AdoptedCleanupFailureRow);
          const root = await clientAu.hydrate({
            host: clientHost,
            component: AppElement,
            ssrScope,
          });
          const repeat = findRepeat(root.controller);
          const internals = repeat as unknown as {
            _reconciliation?: { promise?: Promise<void> };
          };

          clientApp.items.splice(0, 2);
          const reconciliation = internals._reconciliation?.promise;
          assert.instanceOf(reconciliation, Promise);

          higherGate.resolve();
          await waitFor(() => cleanupCalls.length === 1);
          assert.deepStrictEqual(cleanupCalls, [1], 'higher row cleanup runs while the lower row remains pending');
          if (lifecycleFails) {
            lowerGate.reject(lifecycleError);
            await assert.rejects(
              () => reconciliation!,
              error => error instanceof AggregateError
                && error.errors[0] === lifecycleError
                && error.errors[1] === lowerCleanupError,
            );
          } else {
            lowerGate.resolve();
            await assert.rejects(() => reconciliation!, lowerCleanupError);
          }

          assert.deepStrictEqual(cleanupCalls, [1, 0], 'both adopted rows complete cleanup before rejection');
          assert.strictEqual(clientHost.textContent, '');
          await root.deactivate();
          root.dispose();
          clientAu.dispose();
          clientHost.remove();
        });
      }

    });

    it('composes three-stage and generated IndexMaps without losing provenance', async function () {
      const fixture = createFixture(
        '<div repeat.for="item of items">${item}</div>',
        class { public items = [0]; },
      );
      const repeat = findRepeat(fixture.au.root.controller);
      // Arbitrary generated IndexMaps cannot be driven deterministically through
      // collection observers. Exercise the private queue seam so provenance
      // composition is covered without turning that seam into public API.
      const internals = repeat as unknown as {
        _reconciliation?: { needsReconcile: boolean; queuedIndexMap?: ReturnType<typeof createIndexMap> };
        _queueReconcile(indexMap: ReturnType<typeof createIndexMap>): void;
      };
      const compose = (
        previous: ReturnType<typeof createIndexMap>,
        current: ReturnType<typeof createIndexMap>,
      ): ReturnType<typeof createIndexMap> => {
        internals._reconciliation = { needsReconcile: true, queuedIndexMap: previous };
        internals._queueReconcile(current);
        return internals._reconciliation!.queuedIndexMap!;
      };

      // S0 [A, B, C, D] -> S1 [C, X, A, D] -> S2 [D, X, C, Y]
      // -> S3 [C, Z]. X and Y are inserted and deleted within the queued
      // generations, so they must not become deletions from S0.
      const stage1 = createIndexMap(4);
      stage1[0] = 2;
      stage1[1] = -2;
      stage1[2] = 0;
      stage1[3] = 3;
      stage1.deletedIndices.push(1);
      stage1.deletedItems.push('B');

      const stage2 = createIndexMap(4);
      stage2[0] = 3;
      stage2[1] = 1;
      stage2[2] = 0;
      stage2[3] = -2;
      stage2.deletedIndices.push(2);
      stage2.deletedItems.push('A');

      const stage3 = createIndexMap(2);
      stage3[0] = 2;
      stage3[1] = -2;
      stage3.deletedIndices.push(0, 1, 3);
      stage3.deletedItems.push('D', 'X', 'Y');

      const threeStage = compose(compose(stage1, stage2), stage3);
      assert.deepStrictEqual(Array.from(threeStage), [2, -2]);
      assert.deepStrictEqual(threeStage.deletedIndices, [1, 0, 3]);
      assert.deepStrictEqual(threeStage.deletedItems, ['B', 'A', 'D']);
      assert.strictEqual(threeStage.isIndexMap, true);

      for (let seed = 0; seed < 32; ++seed) {
        const originalLength = 5 + seed;
        const stage1: number[] = [];
        for (let i = 0; i < originalLength; ++i) {
          if ((i + seed) % 3 !== 0) {
            stage1.push(i);
          }
          if (i === seed % originalLength) {
            stage1.push(-1 - seed);
          }
        }
        const previous = createIndexMap(stage1.length);
        const retainedOriginals = new Set<number>();
        for (let i = 0; i < stage1.length; ++i) {
          const token = stage1[i];
          previous[i] = token < 0 ? -2 : token;
          if (token >= 0) {
            retainedOriginals.add(token);
          }
        }
        for (let i = 0; i < originalLength; ++i) {
          if (!retainedOriginals.has(i)) {
            previous.deletedIndices.push(i);
            previous.deletedItems.push(i);
          }
        }

        const stage2Indices: number[] = [];
        for (let i = 0; i < stage1.length; ++i) {
          if ((i + seed) % 2 === 0) {
            stage2Indices.push(i);
          }
        }
        stage2Indices.splice(seed % (stage2Indices.length + 1), 0, -1);
        const current = createIndexMap(stage2Indices.length);
        const retainedStage1 = new Set<number>();
        for (let i = 0; i < stage2Indices.length; ++i) {
          const source = stage2Indices[i];
          current[i] = source < 0 ? -2 : source;
          if (source >= 0) {
            retainedStage1.add(source);
          }
        }
        for (let i = 0; i < stage1.length; ++i) {
          if (!retainedStage1.has(i)) {
            current.deletedIndices.push(i);
            current.deletedItems.push(stage1[i]);
          }
        }

        const composed = compose(previous, current);
        const expectedMap = stage2Indices.map(source => source < 0 || stage1[source] < 0 ? -2 : stage1[source]);
        assert.deepStrictEqual(Array.from(composed), expectedMap, `map seed ${seed}`);
        const expectedDeleted = [
          ...previous.deletedIndices,
          ...current.deletedIndices
            .map(index => stage1[index])
            .filter(index => index >= 0),
        ];
        assert.deepStrictEqual(composed.deletedIndices, expectedDeleted, `deletions seed ${seed}`);
      }

      const previous = createIndexMap(1);
      previous[0] = 0;
      for (let i = 0; i < 70_000; ++i) {
        previous.deletedIndices.push(i + 1);
        previous.deletedItems.push(i + 1);
      }
      const current = createIndexMap(1);
      current[0] = 0;
      const composed = compose(previous, current);
      assert.strictEqual(composed.deletedIndices.length, 70_000);
      internals._reconciliation = void 0;
      await fixture.tearDown();
    });

  });

  describe('ownership and restart', function () {
    it('queues collection changes behind async activation of an SSR-adopted row', async function () {
      const gate = new Deferred();
      let isClient = false;
      let clientApp!: App;

      @customElement({ name: 'ssr-pending-repeat-row', template: '${value}', bindables: ['value'] })
      class SsrPendingRow {
        public value!: number;

        public attaching(): void | Promise<void> {
          return isClient && this.value === 0 ? gate.promise : void 0;
        }
      }

      class App {
        public items = [0];

        public constructor() {
          if (isClient) {
            clientApp = this;
          }
        }
      }

      const AppElement = CustomElement.define({
        name: 'ssr-pending-repeat-app',
        template: '<ssr-pending-repeat-row repeat.for="item of items" value.bind="item"></ssr-pending-repeat-row>',
      }, App);

      const serverCtx = TestContext.create();
      serverCtx.container.register(Registration.instance(ISSRContext, { preserveMarkers: true }));
      const serverHost = serverCtx.doc.body.appendChild(serverCtx.createElement('ssr-pending-repeat-app'));
      const serverAu = new Aurelia(serverCtx.container).register(SsrPendingRow).app({
        host: serverHost,
        component: AppElement,
      });
      let serverMarkup: string;
      try {
        await serverAu.start();
        serverMarkup = serverHost.innerHTML;
      } finally {
        await serverAu.stop(true);
        serverAu.dispose();
        serverHost.remove();
      }

      isClient = true;
      const clientCtx = TestContext.create();
      const clientHost = clientCtx.doc.body.appendChild(clientCtx.createElement('ssr-pending-repeat-app'));
      clientHost.innerHTML = serverMarkup;
      const adoptedRow = clientHost.querySelector('ssr-pending-repeat-row');
      assert.notStrictEqual(adoptedRow, null);
      const ssrScope: ISSRScope = {
        name: 'ssr-pending-repeat-app',
        children: [{
          type: 'repeat',
          views: [{
            nodeCount: 1,
            children: [{ name: 'ssr-pending-repeat-row', children: [] }],
          }],
        }],
      };
      const clientAu = new Aurelia(clientCtx.container).register(SsrPendingRow);
      const hydration = Promise.resolve(clientAu.hydrate({
        host: clientHost,
        component: AppElement,
        ssrScope,
      }));
      let settled = false;
      void hydration.then(
        () => { settled = true; },
        () => { settled = true; },
      );

      clientApp.items.push(1);
      await Promise.resolve();
      assert.strictEqual(settled, false);
      assert.strictEqual(clientHost.querySelector('ssr-pending-repeat-row'), adoptedRow);
      assert.strictEqual(clientHost.textContent, '0');

      gate.resolve();
      const root = await hydration;
      assert.strictEqual(clientHost.querySelector('ssr-pending-repeat-row'), adoptedRow);
      assert.strictEqual(clientHost.textContent, '01');

      await root.deactivate();
      root.dispose();
      clientAu.dispose();
      clientHost.remove();
    });

    it('lets reentrant owner teardown join a still-synchronous reconciliation', async function () {
      let stopping = false;
      let stop: Promise<void> | undefined;

      @customElement({ name: 'reentrant-stop-repeat-row', template: '${value}', bindables: ['value'] })
      class ReentrantStopRow {
        public value!: number;

        public detaching(): void {
          if (this.value === 0 && !stopping) {
            stopping = true;
            stop = Promise.resolve(fixture.stop(true));
          }
        }
      }

      class App { public items = [0, 1]; }

      const fixture = createFixture(
        '<reentrant-stop-repeat-row repeat.for="item of items" value.bind="item"></reentrant-stop-repeat-row>',
        App,
        [ReentrantStopRow],
      );
      fixture.component.items.shift();

      assert.instanceOf(stop, Promise);
      await stop;
      assert.strictEqual(fixture.appHost.textContent, '');
    });

    it('rejects reentrant owner teardown when the synchronous reconciliation fails', async function () {
      const lifecycleError = new Error('reentrant row teardown failed');
      let stopping = false;
      let stop: Promise<void> | undefined;

      @customElement({ name: 'reentrant-failing-stop-row', template: '${value}', bindables: ['value'] })
      class ReentrantFailingStopRow {
        public value!: number;

        public detaching(): void {
          if (this.value === 0 && !stopping) {
            stopping = true;
            stop = Promise.resolve(fixture.stop(true));
            void stop.catch(() => { /* observed below */ });
            throw lifecycleError;
          }
        }
      }

      class App { public items = [0, 1]; }

      const fixture = createFixture(
        '<reentrant-failing-stop-row repeat.for="item of items" value.bind="item"></reentrant-failing-stop-row>',
        App,
        [ReentrantFailingStopRow],
      );
      assert.throws(() => fixture.component.items.shift(), lifecycleError);

      assert.instanceOf(stop, Promise);
      await assert.rejects(() => stop!, lifecycleError);
      assert.strictEqual(fixture.appHost.textContent, '');
      fixture.testHost.remove();
      fixture.au.dispose();
    });

    it('preflights live operations owned by a dynamic controller', async function () {
      const gate = new Deferred();

      @customElement({ name: 'live-repeat-disposal-child', template: 'child' })
      class Child {
        public detaching(): Promise<void> {
          return gate.promise;
        }
      }

      const fixture = createFixture(
        '<live-repeat-disposal-child repeat.for="item of items"></live-repeat-disposal-child>',
        class { public items = [0]; },
        [Child],
      );
      await fixture.started;
      const root = fixture.au.root.controller;
      const repeat = findRepeat(root);
      const view = repeat.views[0];
      const drain = view.deactivate(view, repeat.$controller) as Promise<void>;

      assert.throws(() => root.dispose(), /AUR0510:.*lifecycle operation is running/i);
      assert.strictEqual(root.isActive, true);
      assert.notStrictEqual(root.viewModel, null);
      assert.notStrictEqual(view.nodes, null);

      gate.resolve();
      await drain;
      await fixture.tearDown();
    });

    it('disposes adopted-provenance and later ordinary rows together on owner teardown', async function () {
      const gate = new Deferred();
      const disposed: number[] = [];

      @customElement({ name: 'adopted-repeat-row', template: '${value}', bindables: ['value'] })
      class AdoptedRepeatRow {
        public value!: number;

        public detaching(): void | Promise<void> {
          return this.value === 1 ? gate.promise : void 0;
        }

        public dispose(): void {
          disposed.push(this.value);
        }
      }

      const fixture = createFixture(
        '<adopted-repeat-row repeat.for="item of items" value.bind="item"></adopted-repeat-row>',
        class { public items = [0, 1]; },
        [AdoptedRepeatRow],
      );
      const repeat = findRepeat(fixture.au.root.controller);
      // adoptSSRViews is covered by the SSR integration suite. Mark the initial
      // real views with the same provenance here so this test can isolate mixed
      // owner teardown without reconstructing the server compiler pipeline.
      (repeat as unknown as { _adoptedViews: Set<unknown> })._adoptedViews = new Set(repeat.views);
      fixture.assertText('01');
      fixture.component.items.push(2);
      fixture.assertText('012');

      fixture.component.items.shift();
      assert.deepStrictEqual(disposed, [0], 'a synchronously removed adopted row is disposed immediately');

      fixture.component.items.shift();
      const reconciliation = (repeat as unknown as { _reconciliation?: { promise?: Promise<void> } })
        ._reconciliation?.promise;
      assert.instanceOf(reconciliation, Promise);
      assert.deepStrictEqual(disposed, [0], 'an asynchronously removed adopted row remains owned until it settles');
      gate.resolve();
      await reconciliation;
      assert.deepStrictEqual(disposed, [0, 1]);

      await fixture.stop(true);
      assert.deepStrictEqual(disposed.sort(), [0, 1, 2]);
      assert.strictEqual(fixture.appHost.textContent, '');
    });

    it('lets owner teardown dominate a queued desired collection', async function () {
      const gate = new Deferred();
      const attaching: number[] = [];
      const detaching: number[] = [];
      let blockFirstRemoval = true;

      @customElement({ name: 'stopping-repeat-row', template: '${value}', bindables: ['value'] })
      class StoppingRow {
        public value!: number;

        public attaching(): void {
          attaching.push(this.value);
        }

        public detaching(): void | Promise<void> {
          detaching.push(this.value);
          if (blockFirstRemoval && this.value === 0) {
            blockFirstRemoval = false;
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<stopping-repeat-row repeat.for="item of items" value.bind="item"></stopping-repeat-row>',
        class { public items = [0, 1, 2]; },
        [StoppingRow],
      );
      await fixture.started;

      fixture.component.items.shift();
      fixture.component.items.push(3);
      let stopped = false;
      const stop = Promise.resolve(fixture.stop(true)).then(() => { stopped = true; });

      await Promise.resolve();
      assert.strictEqual(stopped, false);
      assert.deepStrictEqual(attaching, [0, 1, 2]);

      gate.resolve();
      await stop;

      assert.strictEqual(attaching.includes(3), false);
      assert.deepStrictEqual(detaching, [0, 1, 2]);
      assert.strictEqual(fixture.appHost.textContent, '');
    });

    it('preserves initial attachment ownership and duplicate row identity', async function () {
      const item = { label: 'same' };
      const gate = new Deferred();
      let nextId = 0;

      @customElement({ name: 'attaching-duplicate-row', template: '${id}' })
      class DuplicateRow {
        public readonly id = ++nextId;

        public attaching(): void | Promise<void> {
          return this.id === 1 ? gate.promise : void 0;
        }
      }

      const fixture = createFixture(
        '<attaching-duplicate-row repeat.for="item of items"></attaching-duplicate-row>',
        class { public items = [item, item, item]; },
        [DuplicateRow],
        false,
      );
      const start = fixture.start();
      fixture.component.items.shift();
      fixture.component.items.shift();

      let started = false;
      void Promise.resolve(start).then(
        () => { started = true; },
        () => { started = true; },
      );
      await Promise.resolve();
      assert.strictEqual(started, false);

      gate.resolve();
      await start;
      fixture.assertText('3');

      await fixture.tearDown();
    });

    it('disposes the previous row graph before rebuilding on owner restart', async function () {
      const constructed: number[] = [];
      const disposed: number[] = [];
      let nextId = 0;

      @customElement({ name: 'restart-disposal-repeat-row', template: '${item}', bindables: ['item'] })
      class RestartRow {
        public item!: number;
        private readonly id = ++nextId;

        public constructor() {
          constructed.push(this.id);
        }

        public dispose(): void {
          disposed.push(this.id);
        }
      }

      const fixture = createFixture(
        '<restart-disposal-repeat-row repeat.for="item of items" item.bind="item"></restart-disposal-repeat-row>',
        class App { public items = [1]; },
        [RestartRow],
      );
      await fixture.started;
      assert.deepStrictEqual(constructed, [1]);

      await fixture.stop(false);
      assert.deepStrictEqual(disposed, [], 'stop(false) retains the settled row graph until restart');

      await fixture.au.start();
      assert.deepStrictEqual(constructed, [1, 2]);
      assert.deepStrictEqual(disposed, [1], 'restart disposes the row graph it replaces');
      fixture.assertText('1');

      await fixture.stop(true);
      assert.deepStrictEqual(disposed, [1, 2], 'final disposal owns only the rebuilt row graph');
    });

    it('quiesces an initial row activation failure before rolling back Repeat', async function () {
      const first = new Deferred();
      const second = new Deferred();
      const firstError = new Error('first repeated row failed');
      const secondError = new Error('second repeated row failed');
      let fail = true;

      @customElement({ name: 'rejecting-attaching-repeat-row', template: '${value}', bindables: ['value'] })
      class RejectingAttachingRow {
        public value!: number;

        public attaching(): void | Promise<void> {
          if (!fail) {
            return;
          }
          return this.value === 0 ? first.promise : second.promise;
        }
      }

      const fixture = createFixture(
        '<rejecting-attaching-repeat-row repeat.for="item of items" value.bind="item"></rejecting-attaching-repeat-row>',
        class { public items = [0, 1]; },
        [RejectingAttachingRow],
        false,
      );
      const start = fixture.start() as Promise<void>;
      let settled = false;
      void start.then(
        () => { settled = true; },
        () => { settled = true; },
      );

      second.reject(secondError);
      await Promise.resolve();
      await Promise.resolve();
      assert.strictEqual(settled, false);

      first.reject(firstError);
      await assert.rejects(() => start, firstError);
      assert.strictEqual(fixture.appHost.textContent, '');

      fail = false;
      await fixture.start();
      fixture.assertText('01');
      await fixture.tearDown();
    });

    it('quiesces async siblings after a synchronous initial row activation failure', async function () {
      const sibling = new Deferred();
      const activationError = new Error('synchronous initial row failed');
      let fail = true;

      @customElement({ name: 'sync-rejecting-initial-row', template: '${value}', bindables: ['value'] })
      class SyncRejectingInitialRow {
        public value!: number;

        public attaching(): void | Promise<void> {
          if (!fail) {
            return;
          }
          if (this.value === 0) {
            throw activationError;
          }
          return sibling.promise;
        }
      }

      const fixture = createFixture(
        '<sync-rejecting-initial-row repeat.for="item of items" value.bind="item"></sync-rejecting-initial-row>',
        class { public items = [0, 1]; },
        [SyncRejectingInitialRow],
        false,
      );
      const start = fixture.start() as Promise<void>;
      let settled = false;
      void start.then(
        () => { settled = true; },
        () => { settled = true; },
      );

      await Promise.resolve();
      assert.strictEqual(settled, false);
      sibling.resolve();
      await assert.rejects(() => start, activationError);
      assert.strictEqual(fixture.appHost.textContent, '');

      fail = false;
      await fixture.start();
      fixture.assertText('01');
      await fixture.tearDown();
    });

  });

  describe('synchronous fast path', function () {
    it('keeps fully synchronous mutations inline without a reconciliation promise', async function () {
      const fixture = createFixture(
        '<div repeat.for="item of items">${item}</div>',
        class { public items = [0, 1, 2]; },
      );
      const repeat = findRepeat(fixture.au.root.controller);
      const internals = repeat as unknown as {
        _isReconciling: boolean;
        _reconciliation?: unknown;
      };

      fixture.component.items.shift();
      fixture.assertText('12');
      assert.strictEqual(internals._isReconciling, false);
      assert.strictEqual(internals._reconciliation, void 0);

      fixture.component.items.unshift(3, 4);
      fixture.assertText('3412');
      assert.strictEqual(internals._isReconciling, false);
      assert.strictEqual(internals._reconciliation, void 0);
      await fixture.tearDown();
    });
  });
});

async function waitFor(condition: () => boolean): Promise<void> {
  for (let i = 0; i < 30; ++i) {
    if (condition()) {
      return;
    }
    await Promise.resolve();
  }
  assert.fail('condition did not become true');
}

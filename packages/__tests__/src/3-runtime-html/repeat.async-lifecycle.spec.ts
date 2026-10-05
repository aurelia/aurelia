import {
  Aurelia,
  CustomElement,
  ISSRContext,
  customElement,
  type IHydratedController,
  type ISSRScope,
  Repeat,
} from '@aurelia/runtime-html';
import { Registration } from '@aurelia/kernel';
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

function abandonTerminalFixture(fixture: { readonly testHost: HTMLElement }): void {
  Object.defineProperty(fixture, 'torn', { configurable: true, value: true });
  fixture.testHost.remove();
}

async function captureFailure(action: () => void | Promise<void>): Promise<unknown> {
  try {
    await action();
  } catch (error) {
    return error;
  }
  assert.fail('Expected operation to fail');
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

    describe('failure reporting', function () {
      it('waits for accepted row teardowns and reports the first row error', async function () {
        const first = new Deferred();
        const second = new Deferred();
        const firstError = new Error('first row failed');
        const secondError = new Error('second row failed');
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
        }

        const fixture = createFixture(
          '<rejecting-repeat-row repeat.for="item of items" value.bind="item"></rejecting-repeat-row>',
          class { public items = [0, 1, 2]; },
          [RejectingRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);
        const internals = repeat as unknown as {
          _reconciliation?: { promise?: Promise<void> };
        };

        fixture.component.items.splice(1, 2);
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

        rejectRows = false;
        await fixture.tearDown();
      });

      it('waits for inserted row activations and reports the first row error', async function () {
        const first = new Deferred();
        const second = new Deferred();
        const firstError = new Error('first inserted row failed');
        const secondError = new Error('second inserted row failed');

        @customElement({ name: 'rejecting-inserted-repeat-row', template: '${value}', bindables: ['value'] })
        class RejectingInsertedRow {
          public value!: number;

          public attaching(): void | Promise<void> {
            if (this.value === 1) {
              return first.promise;
            }
            if (this.value === 2) {
              return second.promise;
            }
          }
        }

        const fixture = createFixture(
          '<rejecting-inserted-repeat-row repeat.for="item of items" value.bind="item"></rejecting-inserted-repeat-row>',
          class { public items = [0]; },
          [RejectingInsertedRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);

        fixture.component.items.push(1, 2);
        const reconciliation = (repeat as unknown as { _reconciliation?: { promise?: Promise<void> } })
          ._reconciliation?.promise;
        if (!(reconciliation instanceof Promise)) {
          assert.fail('Expected inserted rows to publish an active reconciliation');
        }

        second.reject(secondError);
        await Promise.resolve();
        let settled = false;
        void reconciliation.then(
          () => { settled = true; },
          () => { settled = true; },
        );
        await Promise.resolve();
        assert.strictEqual(settled, false);

        first.reject(firstError);
        await assert.rejects(() => reconciliation, firstError);
        abandonTerminalFixture(fixture);
      });

      it('reports a synchronous failure from the latest queued generation', async function () {
        const detaching = new Deferred();
        const keyError = new Error('queued repeat key failed');

        @customElement({ name: 'queued-key-failure-row', template: '${item.label}', bindables: ['item'] })
        class QueuedKeyFailureRow {
          public item!: { readonly id: number; readonly label: string };

          public detaching(): void | Promise<void> {
            return this.item.id === 0 ? detaching.promise : void 0;
          }
        }

        const fixture = createFixture(
          '<queued-key-failure-row repeat.for="item of items; key.bind: item.id" item.bind="item"></queued-key-failure-row>',
          class {
            public items: { readonly id: number; readonly label: string }[] = [{ id: 0, label: 'initial' }];
          },
          [QueuedKeyFailureRow],
        );
        const repeat = findRepeat(fixture.au.root.controller);

        fixture.component.items.splice(0, 1);
        const reconciliation = (repeat as unknown as { _reconciliation?: { promise?: Promise<void> } })
          ._reconciliation?.promise;
        assert.instanceOf(reconciliation, Promise);

        fixture.component.items = [{
          get id(): number { throw keyError; },
          label: 'invalid',
        }];
        await tasksSettled();

        detaching.resolve();
        await assert.rejects(() => reconciliation!, keyError);
        abandonTerminalFixture(fixture);
      });

      it('reports a reentrant teardown failure to the mutation and owner stop', async function () {
        const lifecycleError = new Error('reentrant repeat teardown failed');
        let stop: Promise<void> | undefined;
        let laterDetachingCalls = 0;

        @customElement({ name: 'reentrant-failing-repeat-row', template: '${value}', bindables: ['value'] })
        class ReentrantFailingRow {
          public value!: number;

          public detaching(): void {
            if (this.value === 0) {
              stop = Promise.resolve(fixture.stop(true));
              void stop.catch(() => { /* asserted below */ });
              throw lifecycleError;
            }
            ++laterDetachingCalls;
          }
        }

        const fixture = createFixture(
          '<reentrant-failing-repeat-row repeat.for="item of items" value.bind="item"></reentrant-failing-repeat-row>',
          class { public items = [0, 1]; },
          [ReentrantFailingRow],
        );

        assert.throws(() => fixture.component.items.splice(0, 2), lifecycleError);
        assert.instanceOf(stop, Promise);
        await assert.rejects(() => stop!, lifecycleError);
        assert.strictEqual(laterDetachingCalls, 0, 'a synchronous error stops later row work');
        abandonTerminalFixture(fixture);
      });

      it('reports a row disposal failure while rebuilding after stop(false)', async function () {
        const disposalError = new Error('retained repeat row disposal failed');

        @customElement({ name: 'failing-restart-disposal-row', template: '${value}', bindables: ['value'] })
        class FailingRestartDisposalRow {
          public value!: number;

          public dispose(): never {
            throw disposalError;
          }
        }

        const fixture = createFixture(
          '<failing-restart-disposal-row repeat.for="item of items" value.bind="item"></failing-restart-disposal-row>',
          class { public items = [0]; },
          [FailingRestartDisposalRow],
        );
        await fixture.started;
        await fixture.stop(false);
        // A changed item cannot reuse the retained row, so restart disposes it.
        fixture.component.items = [1];

        assert.strictEqual(await captureFailure(() => fixture.au.start()), disposalError);
        abandonTerminalFixture(fixture);
      });

      it('stops inserting rows after a synchronous activation failure', async function () {
        const activationError = new Error('inserted repeat row failed synchronously');
        const attaching: number[] = [];

        @customElement({ name: 'sync-failing-inserted-row', template: '${value}', bindables: ['value'] })
        class SyncFailingInsertedRow {
          public value!: number;

          public attaching(): void {
            attaching.push(this.value);
            if (this.value === 2) {
              throw activationError;
            }
          }
        }

        const fixture = createFixture(
          '<sync-failing-inserted-row repeat.for="item of items" value.bind="item"></sync-failing-inserted-row>',
          class { public items = [0]; },
          [SyncFailingInsertedRow],
        );
        attaching.length = 0;

        assert.throws(() => fixture.component.items.push(1, 2, 3), activationError);
        assert.deepStrictEqual(attaching, [3, 2]);
        abandonTerminalFixture(fixture);
      });
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

    it('reuses retained rows for unchanged items on owner restart', async function () {
      const disposed: string[] = [];

      @customElement({ name: 'restart-reuse-repeat-row', template: '${item.label}', bindables: ['item'] })
      class RestartRow {
        public item!: { label: string };

        public dispose(): void {
          disposed.push(this.item.label);
        }
      }

      const a = { label: 'a' };
      const b = { label: 'b' };
      const c = { label: 'c' };
      const fixture = createFixture(
        '<restart-reuse-repeat-row repeat.for="item of items" item.bind="item"></restart-reuse-repeat-row>',
        class App { public items = [a, b, c]; },
        [RestartRow],
      );
      await fixture.started;
      const repeat = findRepeat(fixture.au.root.controller);
      const [viewA, , viewC] = repeat.views;

      await fixture.stop(false);
      assert.deepStrictEqual(disposed, [], 'stop(false) retains the settled row graph until restart');

      // Restart with an unchanged item at each end and a new one in between.
      fixture.component.items = [a, { label: 'x' }, c, { label: 'y' }];
      await fixture.au.start();
      assert.deepStrictEqual(disposed, ['b'], 'only the row whose item changed is disposed');
      assert.strictEqual(repeat.views[0], viewA);
      assert.strictEqual(repeat.views[2], viewC);
      fixture.assertText('axcy');

      await fixture.stop(true);
      assert.deepStrictEqual(disposed.sort(), ['a', 'b', 'c', 'x', 'y'], 'final disposal owns the rebuilt row graph');
    });

    it('reuses a retained row only at the same position', async function () {
      const fixture = createFixture(
        '<div repeat.for="item of items; key: id">${item.id}</div>',
        class App { public items = [{ id: 1 }, { id: 2 }, { id: 3 }]; },
      );
      await fixture.started;
      const repeat = findRepeat(fixture.au.root.controller);
      const before = repeat.views.slice();

      await fixture.stop(false);
      fixture.component.items.reverse();
      // Same key, different object: identity decides reuse, not the key.
      fixture.component.items[2] = { id: 1 };
      await fixture.au.start();

      fixture.assertText('321');
      assert.notStrictEqual(repeat.views[0], before[2], 'a moved item does not take its old row along');
      assert.strictEqual(repeat.views[1], before[1], 'the unmoved middle item keeps its row');
      assert.notStrictEqual(repeat.views[2], before[0]);

      await fixture.stop(true);
    });

    it('keeps row component state when a cached if shows the list again', async function () {
      let created = 0;

      @customElement({ name: 'stateful-repeat-row', template: '${item}:${clicks}', bindables: ['item'] })
      class StatefulRow {
        public item!: string;
        public clicks = 0;

        public constructor() {
          ++created;
        }
      }

      const fixture = createFixture(
        '<div if.bind="show"><stateful-repeat-row repeat.for="item of items" item.bind="item" data-index.bind="$index" data-last.bind="$last"></stateful-repeat-row></div>',
        class App { public show = true; public items = ['a', 'b', 'c']; },
        [StatefulRow],
      );
      await fixture.started;
      const rowVm = (index: number) => CustomElement.for<StatefulRow>(fixture.getAllBy('stateful-repeat-row')[index]).viewModel;
      rowVm(1).clicks = 2;
      await tasksSettled();
      fixture.assertText('a:0b:2c:0');

      for (let i = 0; i < 3; ++i) {
        fixture.component.show = false;
        await tasksSettled();
        fixture.assertText('');
        fixture.component.show = true;
        await tasksSettled();
      }
      assert.strictEqual(created, 3, 'toggling visibility creates no rows');
      fixture.assertText('a:0b:2c:0');

      fixture.component.show = false;
      await tasksSettled();
      fixture.component.items.push('d');
      fixture.component.show = true;
      await tasksSettled();
      assert.strictEqual(created, 4, 'only the appended item gets a new row');
      fixture.assertText('a:0b:2c:0d:0');
      const rows = fixture.getAllBy('stateful-repeat-row');
      assert.deepStrictEqual(rows.map(row => row.getAttribute('data-index')), ['0', '1', '2', '3']);
      assert.deepStrictEqual(rows.map(row => row.getAttribute('data-last')), ['false', 'false', 'false', 'true'], 'contextual properties are refreshed on reused rows');

      await fixture.tearDown();
    });

    it('does not move retained rows to shifted items', async function () {
      let created = 0;

      @customElement({ name: 'shifted-repeat-row', template: '${item}', bindables: ['item'] })
      class ShiftedRow {
        public item!: number;

        public constructor() {
          ++created;
        }
      }

      const fixture = createFixture(
        '<div if.bind="show"><shifted-repeat-row repeat.for="item of items" item.bind="item"></shifted-repeat-row></div>',
        class App { public show = true; public items = [0, 1, 2]; },
        [ShiftedRow],
      );
      await fixture.started;

      fixture.component.show = false;
      await tasksSettled();
      fixture.component.items.shift();
      fixture.component.show = true;
      await tasksSettled();

      fixture.assertText('12');
      assert.strictEqual(created, 5, 'shifted items do not reuse rows from other positions');
      await fixture.tearDown();
    });

    it('disposes adopted rows and reuses ordinary rows on owner restart', async function () {
      const disposed: number[] = [];

      @customElement({ name: 'adopted-restart-repeat-row', template: '${value}', bindables: ['value'] })
      class AdoptedRestartRow {
        public value!: number;

        public dispose(): void {
          disposed.push(this.value);
        }
      }

      const fixture = createFixture(
        '<adopted-restart-repeat-row repeat.for="item of items" value.bind="item"></adopted-restart-repeat-row>',
        class { public items = [0, 1]; },
        [AdoptedRestartRow],
      );
      await fixture.started;
      const repeat = findRepeat(fixture.au.root.controller);
      // See 'disposes adopted-provenance and later ordinary rows together on owner teardown'.
      (repeat as unknown as { _adoptedViews: Set<unknown> })._adoptedViews = new Set(repeat.views);
      fixture.component.items.push(2);
      fixture.assertText('012');
      const ordinary = repeat.views[2];

      await fixture.stop(false);
      await fixture.au.start();

      assert.deepStrictEqual(disposed, [0, 1], 'adopted rows are never reused');
      assert.strictEqual(repeat.views[2], ordinary, 'the ordinary row is reused');
      assert.strictEqual((repeat as unknown as { _adoptedViews?: Set<unknown> })._adoptedViews, void 0);
      fixture.assertText('012');

      await fixture.stop(true);
      assert.deepStrictEqual(disposed.sort(), [0, 0, 1, 1, 2]);
    });

    it('reuses the rows that survived an owner teardown during reconciliation', async function () {
      const gate = new Deferred();
      let created = 0;
      let blockFirstRemoval = true;

      @customElement({ name: 'interrupted-restart-repeat-row', template: '${value}', bindables: ['value'] })
      class InterruptedRow {
        public value!: number;

        public constructor() {
          ++created;
        }

        public detaching(): void | Promise<void> {
          if (blockFirstRemoval && this.value === 0) {
            blockFirstRemoval = false;
            return gate.promise;
          }
        }
      }

      const fixture = createFixture(
        '<interrupted-restart-repeat-row repeat.for="item of items" value.bind="item"></interrupted-restart-repeat-row>',
        class { public items = [0, 1, 2]; },
        [InterruptedRow],
      );
      await fixture.started;
      const repeat = findRepeat(fixture.au.root.controller);
      const [, viewOne, viewTwo] = repeat.views;

      fixture.component.items.shift();
      fixture.component.items.push(3);
      const stop = fixture.stop(false);
      gate.resolve();
      await stop;
      assert.strictEqual(created, 3, 'owner teardown dominates the queued insertion');

      await fixture.au.start();
      fixture.assertText('123');
      assert.strictEqual(repeat.views[0], viewOne);
      assert.strictEqual(repeat.views[1], viewTwo);
      assert.strictEqual(created, 4, 'only the item the teardown skipped gets a new row');

      await fixture.stop(true);
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

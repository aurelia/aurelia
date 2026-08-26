import { tasksSettled } from '@aurelia/runtime';
import { CustomElement } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

class Deferred {
  public readonly promise: Promise<void>;
  public resolve!: () => void;
  public reject!: (reason?: unknown) => void;

  public constructor() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

describe('3-runtime-html/if-view-lifecycle.spec.ts', function () {
  it('disposes every uncached if and else view exactly once across restart', async function () {
    const counts = {
      ifCreated: 0,
      ifDisposed: 0,
      elseCreated: 0,
      elseDisposed: 0,
    };
    const IfBranch = CustomElement.define({ name: 'uncached-if-branch', template: 'if' }, class {
      public constructor() { counts.ifCreated++; }
      public dispose(): void { counts.ifDisposed++; }
    });
    const ElseBranch = CustomElement.define({ name: 'uncached-else-branch', template: 'else' }, class {
      public constructor() { counts.elseCreated++; }
      public dispose(): void { counts.elseDisposed++; }
    });
    const fixture = createFixture(
      '<uncached-if-branch if="value.bind: show; cache: false"></uncached-if-branch>'
      + '<uncached-else-branch else></uncached-else-branch>',
      class App { public show = true; },
      [IfBranch, ElseBranch],
    );
    await fixture.started;

    assert.deepStrictEqual(counts, { ifCreated: 1, ifDisposed: 0, elseCreated: 0, elseDisposed: 0 });

    fixture.component.show = false;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 1, ifDisposed: 1, elseCreated: 1, elseDisposed: 0 });

    fixture.component.show = true;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 1, elseCreated: 1, elseDisposed: 1 });

    fixture.component.show = false;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 2, elseDisposed: 1 });

    await fixture.stop(false);
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 2, elseDisposed: 1 });

    await fixture.au.start();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 3, elseDisposed: 2 });

    await fixture.stop(true);
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 3, elseDisposed: 3 });
  });

  it('waits for outgoing async detachment before disposal and replacement activation', async function () {
    const detaching = new Deferred();
    const replacementAttached = new Deferred();
    const events: string[] = [];
    const IfBranch = CustomElement.define({ name: 'async-uncached-if-branch', template: 'if' }, class {
      public detaching(): Promise<void> {
        events.push('if:detaching');
        return detaching.promise.then(() => { events.push('if:detached'); });
      }
      public dispose(): void { events.push('if:dispose'); }
    });
    const ElseBranch = CustomElement.define({ name: 'async-uncached-else-branch', template: 'else' }, class {
      public constructor() { events.push('else:create'); }
      public attaching(): void {
        events.push('else:attaching');
        replacementAttached.resolve();
      }
    });
    const fixture = createFixture(
      '<async-uncached-if-branch if="value.bind: show; cache: false"></async-uncached-if-branch>'
      + '<async-uncached-else-branch else></async-uncached-else-branch>',
      class App { public show = true; },
      [IfBranch, ElseBranch],
    );
    await fixture.started;

    fixture.component.show = false;
    fixture.component.show = true;
    fixture.component.show = false;
    assert.deepStrictEqual(events, ['if:detaching']);
    assert.strictEqual(fixture.appHost.textContent, 'if');

    detaching.resolve();
    await replacementAttached.promise;
    assert.deepStrictEqual(events, [
      'if:detaching',
      'if:detached',
      'if:dispose',
      'else:create',
      'else:attaching',
    ]);
    assert.strictEqual(fixture.appHost.textContent, 'else');

    await fixture.stop(true);
  });

  it('keeps cached views reusable until final disposal', async function () {
    const counts = {
      ifCreated: 0,
      ifDisposed: 0,
      elseCreated: 0,
      elseDisposed: 0,
    };
    const IfBranch = CustomElement.define({ name: 'cached-if-branch', template: 'if' }, class {
      public constructor() { counts.ifCreated++; }
      public dispose(): void { counts.ifDisposed++; }
    });
    const ElseBranch = CustomElement.define({ name: 'cached-else-branch', template: 'else' }, class {
      public constructor() { counts.elseCreated++; }
      public dispose(): void { counts.elseDisposed++; }
    });
    const fixture = createFixture(
      '<cached-if-branch if.bind="show"></cached-if-branch><cached-else-branch else></cached-else-branch>',
      class App { public show = true; },
      [IfBranch, ElseBranch],
    );
    await fixture.started;

    fixture.component.show = false;
    await tasksSettled();
    fixture.component.show = true;
    await tasksSettled();
    fixture.component.show = false;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 1, ifDisposed: 0, elseCreated: 1, elseDisposed: 0 });

    await fixture.stop(false);
    await fixture.au.start();
    assert.deepStrictEqual(counts, { ifCreated: 1, ifDisposed: 0, elseCreated: 1, elseDisposed: 0 });

    await fixture.stop(true);
    assert.deepStrictEqual(counts, { ifCreated: 1, ifDisposed: 1, elseCreated: 1, elseDisposed: 1 });
  });

  it('disposes dormant views when caching is disabled before selection or restart', async function () {
    const counts = {
      ifCreated: 0,
      ifDisposed: 0,
      elseCreated: 0,
      elseDisposed: 0,
    };
    const IfBranch = CustomElement.define({ name: 'dormant-if-branch', template: 'if' }, class {
      public constructor() { counts.ifCreated++; }
      public dispose(): void { counts.ifDisposed++; }
    });
    const ElseBranch = CustomElement.define({ name: 'dormant-else-branch', template: 'else' }, class {
      public constructor() { counts.elseCreated++; }
      public dispose(): void { counts.elseDisposed++; }
    });
    const fixture = createFixture(
      '<dormant-if-branch if="value.bind: show; cache.bind: cache"></dormant-if-branch>'
      + '<dormant-else-branch else></dormant-else-branch>',
      class App {
        public show = true;
        public cache = true;
      },
      [IfBranch, ElseBranch],
    );
    await fixture.started;

    fixture.component.show = false;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 1, ifDisposed: 0, elseCreated: 1, elseDisposed: 0 });

    fixture.component.cache = false;
    await tasksSettled();
    fixture.component.show = true;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 1, elseCreated: 1, elseDisposed: 1 });

    fixture.component.cache = true;
    await tasksSettled();
    fixture.component.show = false;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 1, elseCreated: 2, elseDisposed: 1 });

    fixture.component.show = true;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 1, elseCreated: 2, elseDisposed: 1 });

    fixture.component.cache = false;
    await tasksSettled();
    fixture.component.show = false;
    await tasksSettled();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 3, elseDisposed: 2 });

    await fixture.stop(false);
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 3, elseDisposed: 2 });

    await fixture.au.start();
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 4, elseDisposed: 3 });

    await fixture.stop(true);
    assert.deepStrictEqual(counts, { ifCreated: 2, ifDisposed: 2, elseCreated: 4, elseDisposed: 4 });
  });

  it('disposes nested uncached ownership when its outer view retires', async function () {
    let created = 0;
    let disposed = 0;
    const Leaf = CustomElement.define({ name: 'nested-uncached-leaf', template: 'leaf' }, class {
      public constructor() { created++; }
      public dispose(): void { disposed++; }
    });
    const fixture = createFixture(
      '<div if="value.bind: outer; cache: false">'
      + '<nested-uncached-leaf if.bind="inner"></nested-uncached-leaf>'
      + '</div>',
      class App {
        public outer = true;
        public inner = true;
      },
      [Leaf],
    );
    await fixture.started;
    assert.deepStrictEqual({ created, disposed }, { created: 1, disposed: 0 });

    fixture.component.outer = false;
    await tasksSettled();
    assert.deepStrictEqual({ created, disposed }, { created: 1, disposed: 1 });

    fixture.component.outer = true;
    await tasksSettled();
    assert.deepStrictEqual({ created, disposed }, { created: 2, disposed: 1 });

    await fixture.stop(true);
    assert.deepStrictEqual({ created, disposed }, { created: 2, disposed: 2 });
  });

  it('waits for rejected activation cleanup before disposing and entering uncached else', async function () {
    const activation = new Deferred();
    const cleanupStarted = new Deferred();
    const cleanup = new Deferred();
    const fallbackReattached = new Deferred();
    let rejectingCreated = 0;
    let rejectingDisposed = 0;
    let fallbackCreated = 0;
    let fallbackDisposed = 0;
    let fallbackAttaches = 0;

    const RejectingBranch = CustomElement.define({ name: 'uncached-rejecting-branch', template: 'rejecting' }, class {
      public constructor() { rejectingCreated++; }
      public attaching(): Promise<void> { return activation.promise; }
      public detaching(): Promise<void> {
        cleanupStarted.resolve();
        return cleanup.promise;
      }
      public dispose(): void { rejectingDisposed++; }
    });
    const FallbackBranch = CustomElement.define({ name: 'uncached-fallback-branch', template: 'fallback' }, class {
      public constructor() { fallbackCreated++; }
      public attaching(): void {
        if (++fallbackAttaches === 2) {
          fallbackReattached.resolve();
        }
      }
      public dispose(): void { fallbackDisposed++; }
    });
    const fixture = createFixture(
      '<uncached-rejecting-branch if="value.bind: show; cache: false"></uncached-rejecting-branch>'
      + '<uncached-fallback-branch else></uncached-fallback-branch>',
      class App { public show = false; },
      [RejectingBranch, FallbackBranch],
    );
    await fixture.started;
    assert.deepStrictEqual(
      { rejectingCreated, rejectingDisposed, fallbackCreated, fallbackDisposed },
      { rejectingCreated: 0, rejectingDisposed: 0, fallbackCreated: 1, fallbackDisposed: 0 },
    );

    fixture.component.show = true;
    assert.deepStrictEqual(
      { rejectingCreated, rejectingDisposed, fallbackCreated, fallbackDisposed },
      { rejectingCreated: 1, rejectingDisposed: 0, fallbackCreated: 1, fallbackDisposed: 1 },
    );

    activation.reject(new Error('expected activation rejection'));
    await cleanupStarted.promise;
    fixture.component.show = false;
    await Promise.resolve();
    assert.deepStrictEqual(
      { rejectingCreated, rejectingDisposed, fallbackCreated, fallbackDisposed },
      { rejectingCreated: 1, rejectingDisposed: 0, fallbackCreated: 1, fallbackDisposed: 1 },
    );

    cleanup.resolve();
    await fallbackReattached.promise;
    assert.deepStrictEqual(
      { rejectingCreated, rejectingDisposed, fallbackCreated, fallbackDisposed },
      { rejectingCreated: 1, rejectingDisposed: 1, fallbackCreated: 2, fallbackDisposed: 1 },
    );

    await fixture.stop(true);
    assert.deepStrictEqual(
      { rejectingCreated, rejectingDisposed, fallbackCreated, fallbackDisposed },
      { rejectingCreated: 1, rejectingDisposed: 1, fallbackCreated: 2, fallbackDisposed: 2 },
    );
  });
});

import {
  customElement,
  If,
  Switch,
  type ICustomElementController,
} from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
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

describe('3-runtime-html/dynamic-owner.lifecycle.spec.ts', function () {
  it('rejects initial switch case activation and quiesces rollback before start settles', async function () {
    const attaching = new Deferred();
    const detaching = new Deferred();
    const error = new Error('initial switch case attaching failed');
    let child!: ActiveCase;
    let detachingCalls = 0;
    let unbindingCalls = 0;

    @customElement({ name: 'initial-active-case', template: 'active case' })
    class ActiveCase {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        return attaching.promise;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<div switch.bind="value"><initial-active-case case="active"></initial-active-case></div>',
      class {
        public readonly value = 'active';
      },
      [ActiveCase],
      false,
    );
    const start = fixture.start() as Promise<void>;
    let settled = false;
    void start.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    assert.ok(child, 'the initially active case enters its attaching hook');
    attaching.reject(error);
    const rollbackStarted = await waitForMicrotasks(() => detachingCalls > 0);
    const settledBeforeRollbackDrain = settled;
    detaching.resolve();

    assert.strictEqual(rollbackStarted, true, 'the active case enters rollback');
    assert.strictEqual(settledBeforeRollbackDrain, false, 'start waits for asynchronous case rollback');
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(unbindingCalls, 0);

    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(fixture.appHost.querySelector('initial-active-case'), null);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('keeps a retiring switch case visible to controller disposal preflight', async function () {
    const detaching = new Deferred();
    let detachingCalls = 0;
    let retiringCase!: RetiringCase;

    @customElement({ name: 'retiring-switch-case', template: 'A' })
    class RetiringCase {
      public constructor() {
        retiringCase = this;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }
    }

    @customElement({ name: 'replacement-switch-case', template: 'B' })
    class ReplacementCase {}

    const fixture = createFixture(
      '<div switch.bind="value">'
      + '<retiring-switch-case case="a"></retiring-switch-case>'
      + '<replacement-switch-case case="b"></replacement-switch-case>'
      + '</div>',
      class App {
        public value = 'a';
      },
      [RetiringCase, ReplacementCase],
    );
    await fixture.started;

    let switchVm!: Switch;
    fixture.au.root.controller.accept(controller => {
      if (controller.viewModel instanceof Switch) {
        switchVm = controller.viewModel;
        return true;
      }
    });

    fixture.component.value = 'b';
    assert.strictEqual(await waitForMicrotasks(() => detachingCalls === 1), true);
    const transition = switchVm.promise;
    assert.instanceOf(transition, Promise);

    const root = fixture.au.root.controller;
    let retiringVisible = false;
    root.accept(controller => {
      if (controller.viewModel === retiringCase) {
        retiringVisible = true;
        return true;
      }
    });
    assert.strictEqual(retiringVisible, true);
    assert.throws(() => root.dispose(), /AUR0510:.*lifecycle operation is running/i);
    assert.strictEqual(root.isActive, true);
    assert.notStrictEqual(root.viewModel, null);

    detaching.resolve();
    await transition;
    assert.strictEqual(fixture.appHost.textContent, 'B');
    retiringVisible = false;
    root.accept(controller => {
      if (controller.viewModel === retiringCase) {
        retiringVisible = true;
        return true;
      }
    });
    assert.strictEqual(retiringVisible, false, 'settled inactive cases remain hidden from traversal');
    await fixture.tearDown();
  });

  for (const failureKind of ['synchronous', 'asynchronous'] as const) {
    it(`removes a retiring switch case after ${failureKind} deactivation failure`, async function () {
      const error = new Error(`${failureKind} switch case deactivation failed`);
      let retiringCase!: RetiringCase;

      @customElement({ name: `${failureKind}-retiring-switch-case`, template: 'A' })
      class RetiringCase {
        public constructor() {
          retiringCase = this;
        }

        public detaching(): void | Promise<void> {
          if (failureKind === 'synchronous') {
            throw error;
          }
          return Promise.reject(error);
        }
      }

      @customElement({ name: `${failureKind}-replacement-switch-case`, template: 'B' })
      class ReplacementCase {}

      const fixture = createFixture(
        '<div switch.bind="value">'
        + `<${failureKind}-retiring-switch-case case="a"></${failureKind}-retiring-switch-case>`
        + `<${failureKind}-replacement-switch-case case="b"></${failureKind}-replacement-switch-case>`
        + '</div>',
        class App { public value = 'a'; },
        [RetiringCase, ReplacementCase],
      );
      await fixture.started;

      let switchVm!: Switch;
      const root = fixture.au.root.controller;
      root.accept(controller => {
        if (controller.viewModel instanceof Switch) {
          switchVm = controller.viewModel;
          return true;
        }
      });

      if (failureKind === 'synchronous') {
        assert.throws(() => { fixture.component.value = 'b'; }, error);
      } else {
        fixture.component.value = 'b';
        const transitionStarted = await waitForMicrotasks(() => switchVm.promise instanceof Promise);
        assert.strictEqual(transitionStarted, true);
        await assert.rejects(() => switchVm.promise as Promise<void>, error);
      }

      let retiringVisible = false;
      root.accept(controller => {
        if (controller.viewModel === retiringCase) {
          retiringVisible = true;
          return true;
        }
      });
      assert.strictEqual(retiringVisible, false, 'a failed case is removed from retirement traversal');

      const stop = fixture.stop(true);
      if (failureKind === 'asynchronous') {
        // The rejected Switch tail remains the owner-visible transition result;
        // stop joins it, completes structural cleanup, then reports that cause.
        await assert.rejects(() => stop as Promise<void>, error);
        fixture.testHost.remove();
        fixture.au.dispose();
      } else {
        await stop;
      }
      assert.strictEqual(fixture.appHost.textContent, '');
    });
  }

  it('does not admit case collection changes after switch teardown starts', async function () {
    const detaching = new Deferred();
    let detachingCalls = 0;

    @customElement({ name: 'tearing-down-switch-case', template: 'active' })
    class ActiveCase {
      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }
    }

    const fixture = createFixture(
      '<div switch.bind="value">'
      + '<tearing-down-switch-case case.bind="caseValues"></tearing-down-switch-case>'
      + '</div>',
      class App {
        public value = 'a';
        public caseValues = ['a'];
      },
      [ActiveCase],
    );
    await fixture.started;

    let switchVm!: Switch;
    fixture.au.root.controller.accept(controller => {
      if (controller.viewModel instanceof Switch) {
        switchVm = controller.viewModel;
        return true;
      }
    });

    const stop = fixture.stop();
    assert.instanceOf(stop, Promise);
    assert.strictEqual(detachingCalls, 1);

    fixture.component.caseValues.splice(0, 1, 'b');
    await tasksSettled();
    assert.strictEqual(switchVm.promise, void 0, 'the collection notification must not create a post-teardown tail');
    assert.strictEqual(detachingCalls, 1, 'the active case remains owned by the original teardown');

    detaching.resolve();
    await stop;
    await fixture.tearDown();
  });

  it('rejects initial with view activation and quiesces rollback before start settles', async function () {
    const attaching = new Deferred();
    const detaching = new Deferred();
    const error = new Error('initial with child attaching failed');
    let child!: WithChild;
    let childHost!: HTMLElement;
    let detachingCalls = 0;
    let unbindingCalls = 0;

    @customElement({ name: 'initial-with-child', template: 'with child' })
    class WithChild {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        childHost = this.$controller.host!;
        return attaching.promise;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<initial-with-child with.bind="context"></initial-with-child>',
      class {
        public readonly context = {};
      },
      [WithChild],
      false,
    );
    const start = fixture.start() as Promise<void>;
    let settled = false;
    void start.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    assert.ok(child, 'the initial with view enters its attaching hook');
    assert.strictEqual(childHost.isConnected, true);

    attaching.reject(error);
    const rollbackStarted = await waitForMicrotasks(() => detachingCalls > 0);
    const settledBeforeRollbackDrain = settled;
    detaching.resolve();

    assert.strictEqual(rollbackStarted, true, 'the with view enters rollback');
    assert.strictEqual(settledBeforeRollbackDrain, false, 'start waits for asynchronous with view rollback');
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(unbindingCalls, 0);

    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(childHost.isConnected, false);
    assert.strictEqual(fixture.appHost.querySelector('initial-with-child'), null);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('rejects initial portal view activation and quiesces rollback before start settles', async function () {
    const attaching = new Deferred();
    const detaching = new Deferred();
    const error = new Error('initial portal child attaching failed');
    let child!: PortalChild;
    let childHost!: HTMLElement;
    let detachingCalls = 0;
    let unbindingCalls = 0;

    @customElement({ name: 'initial-portal-child', template: 'portal child' })
    class PortalChild {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        childHost = this.$controller.host!;
        return attaching.promise;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<div id="initial-portal-target"></div>'
      + '<initial-portal-child portal="target: #initial-portal-target"></initial-portal-child>',
      class {},
      [PortalChild],
      false,
    );
    const start = fixture.start() as Promise<void>;
    let settled = false;
    void start.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    assert.ok(child, 'the initial portal view enters its attaching hook');
    assert.strictEqual(childHost.isConnected, true);
    assert.strictEqual(
      fixture.appHost.querySelector('#initial-portal-target initial-portal-child'),
      childHost,
      'the child is moved into the portal target before its attaching hook settles',
    );

    attaching.reject(error);
    const rollbackStarted = await waitForMicrotasks(() => detachingCalls > 0);
    const settledBeforeRollbackDrain = settled;
    detaching.resolve();

    assert.strictEqual(rollbackStarted, true, 'the portal view enters rollback');
    assert.strictEqual(settledBeforeRollbackDrain, false, 'start waits for asynchronous portal rollback');
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(unbindingCalls, 0);

    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(childHost.isConnected, false);
    assert.strictEqual(fixture.appHost.querySelector('initial-portal-child'), null);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('rejects initial projected view activation and quiesces au-slot rollback before start settles', async function () {
    const attaching = new Deferred();
    const detaching = new Deferred();
    const error = new Error('initial projected child attaching failed');
    let child!: ProjectedChild;
    let childHost!: HTMLElement;
    let detachingCalls = 0;
    let unbindingCalls = 0;

    @customElement({ name: 'initial-slot-owner', template: '<au-slot></au-slot>' })
    class SlotOwner {}

    @customElement({ name: 'initial-projected-child', template: 'projected child' })
    class ProjectedChild {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        childHost = this.$controller.host!;
        return attaching.promise;
      }

      public detaching(): Promise<void> {
        ++detachingCalls;
        return detaching.promise;
      }

      public unbinding(): void {
        ++unbindingCalls;
      }
    }

    const fixture = createFixture(
      '<initial-slot-owner><initial-projected-child></initial-projected-child></initial-slot-owner>',
      class {},
      [SlotOwner, ProjectedChild],
      false,
    );
    const start = fixture.start() as Promise<void>;
    let settled = false;
    void start.then(
      () => { settled = true; },
      () => { settled = true; },
    );

    assert.ok(child, 'the initial projected view enters its attaching hook');
    assert.strictEqual(childHost.isConnected, true);

    attaching.reject(error);
    const rollbackStarted = await waitForMicrotasks(() => detachingCalls > 0);
    const settledBeforeRollbackDrain = settled;
    detaching.resolve();

    assert.strictEqual(rollbackStarted, true, 'the projected view enters rollback through au-slot');
    assert.strictEqual(settledBeforeRollbackDrain, false, 'start waits for asynchronous projected-view rollback');
    assert.strictEqual(detachingCalls, 1);
    assert.strictEqual(unbindingCalls, 0);

    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(unbindingCalls, 1);
    assert.strictEqual(childHost.isConnected, false);
    assert.strictEqual(fixture.appHost.querySelector('initial-projected-child'), null);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('rejects an initial if branch async attaching failure', async function () {
    const error = new Error('initial if branch attaching failed');
    let child!: IfBranch;

    @customElement({ name: 'initial-if-branch', template: 'if branch' })
    class IfBranch {
      public readonly $controller!: ICustomElementController<this>;

      public constructor() {
        child = this;
      }

      public attaching(): Promise<void> {
        return Promise.reject(error);
      }
    }

    const fixture = createFixture(
      '<initial-if-branch if.bind="show"></initial-if-branch>',
      class {
        public readonly show = true;
      },
      [IfBranch],
      false,
    );

    const start = fixture.start() as Promise<void>;
    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(fixture.au.isRunning, false);
    assert.strictEqual(child.$controller.isActive, false);
    assert.strictEqual(child.$controller.isBound, false);
    assert.strictEqual(fixture.appHost.querySelector('initial-if-branch'), null);
    assert.strictEqual(fixture.appHost.textContent, '');

    await fixture.tearDown();
  });

  it('recovers a later if swap after its branch activation rejects', async function () {
    const attaching = new Deferred();
    const error = new Error('later if branch attaching failed');
    let shouldFail = true;

    @customElement({ name: 'recovering-if-branch', template: 'if branch' })
    class IfBranch {
      public attaching(): void | Promise<void> {
        if (shouldFail) {
          shouldFail = false;
          return attaching.promise;
        }
      }
    }

    const fixture = createFixture(
      '<recovering-if-branch if.bind="show"></recovering-if-branch>',
      class App {
        public show = false;
      },
      [IfBranch],
    );
    await fixture.started;

    let ifVm!: If;
    fixture.au.root.controller.accept(controller => {
      if (controller.viewModel instanceof If) {
        ifVm = controller.viewModel;
        return true;
      }
    });

    fixture.component.show = true;
    const failedSwap = (ifVm as unknown as { pending: Promise<void> }).pending;
    assert.instanceOf(failedSwap, Promise);
    attaching.reject(error);
    await failedSwap;

    assert.strictEqual(fixture.appHost.querySelector('recovering-if-branch'), null);

    fixture.component.show = false;
    await (ifVm as unknown as { pending?: Promise<void> }).pending;
    fixture.component.show = true;
    await (ifVm as unknown as { pending?: Promise<void> }).pending;

    assert.strictEqual(fixture.appHost.textContent, 'if branch');
    await fixture.tearDown();
  });

  for (const branch of ['pending', 'then', 'catch'] as const) {
    it(`preflights a live ${branch} view owned by the promise template controller`, async function () {
      const promise = new Deferred<unknown>();
      const detaching = new Deferred();
      let child!: Child;
      let detachingCalls = 0;

      @customElement({ name: `live-${branch}-promise-disposal-child`, template: 'child' })
      class Child {
        public readonly $controller!: ICustomElementController<this>;

        public constructor() {
          child = this;
        }

        public detaching(): Promise<void> {
          ++detachingCalls;
          return detaching.promise;
        }
      }

      const branches = (['pending', 'then', 'catch'] as const).map(name => name === branch
        ? `<live-${branch}-promise-disposal-child ${name}></live-${branch}-promise-disposal-child>`
        : `<span ${name}>${name}</span>`
      ).join('');
      const fixture = createFixture(
        `<div promise.resolve="promise">${branches}</div>`,
        class App { public promise: Promise<unknown> = promise.promise; },
        [Child],
      );
      await fixture.started;
      if (branch === 'then') {
        promise.resolve('fulfilled');
      } else if (branch === 'catch') {
        promise.reject(new Error('rejected'));
      }
      await tasksSettled();

      const root = fixture.au.root.controller;
      // Drive retirement through the Promise scheduler, then hold the branch's
      // real detaching hook so disposal preflight must discover the retiring view.
      if (branch === 'pending') {
        promise.resolve('fulfilled');
      } else {
        fixture.component.promise = new Promise<unknown>(() => { /* intentionally unsettled */ });
      }
      assert.strictEqual(await waitForMicrotasks(() => detachingCalls === 1), true);

      assert.throws(() => root.dispose(), /AUR0510:.*lifecycle operation is running/i);
      assert.strictEqual(root.isActive, true);
      assert.notStrictEqual(root.viewModel, null);
      assert.notStrictEqual(child.$controller.viewModel, null);

      detaching.resolve();
      await tasksSettled();
      await fixture.tearDown();
    });
  }
});

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

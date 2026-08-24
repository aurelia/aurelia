import {
  customElement,
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
  it('reports an initial switch case activation failure', async function () {
    const error = new Error('initial switch case attaching failed');

    @customElement({ name: 'initial-active-case', template: 'active case' })
    class ActiveCase {
      public attaching(): Promise<void> {
        return Promise.reject(error);
      }
    }

    const fixture = createFixture(
      '<div switch.bind="value"><initial-active-case case="active"></initial-active-case></div>',
      class { public readonly value = 'active'; },
      [ActiveCase],
      false,
    );

    const start = fixture.start() as Promise<void>;
    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(fixture.torn, true);
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

  it('joins a pending case transition before switch teardown', async function () {
    const detaching = new Deferred();
    let retiringDetachingCalls = 0;
    let replacementAttachingCalls = 0;

    @customElement({ name: 'pending-switch-retiring-case', template: 'A' })
    class RetiringCase {
      public detaching(): Promise<void> {
        ++retiringDetachingCalls;
        return detaching.promise;
      }
    }

    @customElement({ name: 'pending-switch-replacement-case', template: 'B' })
    class ReplacementCase {
      public attaching(): void {
        ++replacementAttachingCalls;
      }
    }

    const fixture = createFixture(
      '<div switch.bind="value">'
      + '<pending-switch-retiring-case case="a"></pending-switch-retiring-case>'
      + '<pending-switch-replacement-case case="b"></pending-switch-replacement-case>'
      + '</div>',
      class App { public value = 'a'; },
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
    assert.strictEqual(await waitForMicrotasks(() => retiringDetachingCalls === 1), true);
    const transition = switchVm.promise;
    assert.instanceOf(transition, Promise);

    const stop = fixture.stop(true);
    assert.instanceOf(stop, Promise);
    assert.strictEqual(replacementAttachingCalls, 0);

    detaching.resolve();
    await transition;
    await stop;

    assert.strictEqual(replacementAttachingCalls, 0);
    assert.strictEqual(fixture.appHost.textContent, '');
  });

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

  it('reports an initial if branch activation failure', async function () {
    const error = new Error('initial if branch attaching failed');

    @customElement({ name: 'initial-if-branch', template: 'if branch' })
    class IfBranch {
      public attaching(): Promise<void> {
        return Promise.reject(error);
      }
    }

    const fixture = createFixture(
      '<initial-if-branch if.bind="show"></initial-if-branch>',
      class { public readonly show = true; },
      [IfBranch],
      false,
    );

    const start = fixture.start() as Promise<void>;
    assert.strictEqual(await captureRejection(start), error);
    assert.strictEqual(fixture.torn, true);
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

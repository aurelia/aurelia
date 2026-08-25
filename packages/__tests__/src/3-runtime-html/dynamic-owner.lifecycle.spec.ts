import {
  customElement,
  Switch,
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

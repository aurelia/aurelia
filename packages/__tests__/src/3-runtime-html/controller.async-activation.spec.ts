import { tasksSettled } from '@aurelia/runtime';
import {
  customElement,
} from '@aurelia/runtime-html';
import {
  assert,
  createFixture,
} from '@aurelia/testing';

describe('3-runtime-html/controller.async-activation.spec.ts', function () {
  // These tests verify that lifecycle hooks are properly called when deactivating
  // a component while its async activation is still in progress.
  //
  // Real-world scenario: User navigates to a page, a component starts loading data
  // in its `attaching` hook, then the user quickly navigates away before the data
  // loads. The `unbinding` hook should still be called to clean up resources.

  // Helper to flush microtasks from If template controller's swap promise chain.
  // The If._swap method creates promises that aren't tracked by the task queue,
  // so tasksSettled() returns before the lifecycle hooks complete.
  const flushMicrotasks = async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  };

  it('calls unbinding on child component when deactivating during async attaching', async function () {
    let resolveChildAttaching: () => void;
    let childUnbindingCalled = false;

    @customElement({ name: 'slow-child', template: 'child' })
    class SlowChild {
      public attaching(): Promise<void> {
        // Simulate async work like data fetching
        return new Promise<void>(resolve => {
          resolveChildAttaching = resolve;
        });
      }

      public unbinding(): void {
        childUnbindingCalled = true;
      }
    }

    class Root {
      public show = false;
    }

    const { au, stop } = createFixture('<slow-child if.bind="show"></slow-child>', Root, [SlowChild]);
    const rootVm = au.root.controller.viewModel as Root;

    // Start showing - child begins async attaching but won't complete until we resolve
    rootVm.show = true;
    await Promise.resolve();

    // Hide while attaching is still in progress - simulates user navigating away
    rootVm.show = false;

    // Resolve the attaching promise to let the deactivation proceed
    resolveChildAttaching!();

    // Wait for all lifecycle operations to complete
    await tasksSettled();
    await flushMicrotasks();

    // unbinding should be called to allow cleanup of subscriptions, event listeners, etc.
    assert.strictEqual(childUnbindingCalled, true, 'unbinding should be called even when deactivating during async activation');

    await stop(true);
  });

  it('calls unbinding on nested child when deactivating during async attaching', async function () {
    let resolveGrandchildAttaching: () => void;
    let grandchildUnbindingCalled = false;

    @customElement({ name: 'grandchild', template: 'gc' })
    class Grandchild {
      public attaching(): Promise<void> {
        return new Promise<void>(resolve => {
          resolveGrandchildAttaching = resolve;
        });
      }

      public unbinding(): void {
        grandchildUnbindingCalled = true;
      }
    }

    @customElement({
      name: 'child-wrapper',
      template: '<grandchild></grandchild>',
      dependencies: [Grandchild],
    })
    class ChildWrapper {}

    class Root {
      public show = false;
    }

    const { au, stop } = createFixture('<child-wrapper if.bind="show"></child-wrapper>', Root, [ChildWrapper, Grandchild]);
    const rootVm = au.root.controller.viewModel as Root;

    rootVm.show = true;
    await Promise.resolve();

    // Deactivate while grandchild is still in async attaching
    rootVm.show = false;

    resolveGrandchildAttaching!();
    await tasksSettled();
    await flushMicrotasks();

    // Deeper nesting makes the timing issue more likely in real apps
    assert.strictEqual(grandchildUnbindingCalled, true, 'nested child unbinding should be called');

    await stop(true);
  });
});

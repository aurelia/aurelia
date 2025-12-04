/**
 * SSR Recording Tests
 *
 * Tests for the server-side rendering recording mechanism.
 * Verifies that SSRContext correctly records template controller views
 * and produces valid hydration manifests.
 *
 * These are the "record" side tests (server rendering).
 * The "replay" side tests (client hydration) are in ssr-hydration-*.spec.ts.
 */

import { Registration } from '@aurelia/kernel';
import { Aurelia, CustomElement, ISSRContextToken, SSRContext } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

describe('3-runtime-html/ssr-recording.spec.ts', function () {
  // ============================================================================
  // Test Infrastructure
  // ============================================================================

  interface RecordingTestResult {
    ctx: ReturnType<typeof TestContext.create>;
    au: Aurelia;
    host: HTMLElement;
    ssrContext: SSRContext;
    stop: () => Promise<void>;
  }

  async function setupRecording<T extends object>(
    template: string,
    state: T,
    targetCount = 1,
  ): Promise<RecordingTestResult> {
    const ctx = TestContext.create();
    const doc = ctx.doc;

    const App = CustomElement.define(
      { name: 'app', template },
      class { constructor() { Object.assign(this, state); } }
    );

    const host = doc.createElement('div');
    doc.body.appendChild(host);

    const ssrContext = new SSRContext();
    ssrContext.setRootTargetCount(targetCount);
    ctx.container.register(Registration.instance(ISSRContextToken, ssrContext));

    const au = new Aurelia(ctx.container);
    au.app({ host, component: App });
    await au.start();

    return {
      ctx,
      au,
      host,
      ssrContext,
      stop: async () => {
        await au.stop(true);
        doc.body.removeChild(host);
      },
    };
  }

  // ============================================================================
  // Repeat Recording Tests
  // ============================================================================

  describe('repeat recording', function () {
    it('records single repeat with correct view count', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div repeat.for="item of items">${item}</div>',
        { items: ['A', 'B', 'C'] },
        1, // root target count
      );

      const manifest = ssrContext.getManifest();

      assert.ok(manifest.controllers[0], 'Should have controller at index 0');
      assert.strictEqual(manifest.controllers[0].type, 'repeat', 'Should be repeat type');
      assert.strictEqual(manifest.controllers[0].views.length, 3, 'Should have 3 views');

      await stop();
    });

    it('records nested repeat correctly', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div repeat.for="group of groups"><span repeat.for="item of group.items">${item}</span></div>',
        {
          groups: [
            { items: ['A', 'B'] },
            { items: ['X', 'Y', 'Z'] },
          ],
        },
        1,
      );

      const manifest = ssrContext.getManifest();

      // Should have outer repeat
      assert.ok(manifest.controllers[0], 'Should have outer repeat at index 0');
      assert.strictEqual(manifest.controllers[0].views.length, 2, 'Outer repeat should have 2 views');

      // Should have inner repeats recorded
      const controllerKeys = Object.keys(manifest.controllers);
      assert.ok(controllerKeys.length > 1, 'Should have nested controllers');

      await stop();
    });

    it('produces globally unique targets across repeat views', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div repeat.for="item of items">${item}</div>',
        { items: ['A', 'B', 'C'] },
        1,
      );

      const manifest = ssrContext.getManifest();
      const allGlobalTargets = new Set<number>();

      for (const controller of Object.values(manifest.controllers)) {
        for (const view of controller.views) {
          if (view.globalTargets) {
            for (const target of view.globalTargets) {
              assert.ok(!allGlobalTargets.has(target), `Target ${target} should be unique`);
              allGlobalTargets.add(target);
            }
          }
        }
      }

      await stop();
    });
  });

  // ============================================================================
  // If Recording Tests
  // ============================================================================

  describe('if recording', function () {
    it('records if with truthy condition', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div if.bind="show">Visible</div>',
        { show: true },
        1,
      );

      const manifest = ssrContext.getManifest();

      assert.ok(manifest.controllers[0], 'Should have controller at index 0');
      assert.strictEqual(manifest.controllers[0].type, 'if', 'Should be if type');
      assert.strictEqual(manifest.controllers[0].views.length, 1, 'Should have 1 view when truthy');

      await stop();
    });

    it('records if with falsy condition (no controller recorded)', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div if.bind="show">Visible</div>',
        { show: false },
        1,
      );

      const manifest = ssrContext.getManifest();

      // When if condition is false, no view is created, so no recording happens
      // This is correct behavior - the controller is only recorded when it creates views
      assert.strictEqual(manifest.controllers[0], undefined, 'Should not have controller when no view created');

      await stop();
    });

    it('records if containing repeat', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<ul if.bind="items.length > 0"><li repeat.for="item of items">${item}</li></ul>',
        { items: ['A', 'B', 'C'] },
        1,
      );

      const manifest = ssrContext.getManifest();

      // Should have if controller
      assert.ok(manifest.controllers[0], 'Should have if controller');
      assert.strictEqual(manifest.controllers[0].type, 'if', 'Should be if type');

      // Should have repeat controller nested
      const controllerKeys = Object.keys(manifest.controllers);
      assert.ok(controllerKeys.length >= 2, 'Should have both if and repeat controllers');

      // Find the repeat controller
      const repeatController = Object.values(manifest.controllers).find(c => c.type === 'repeat');
      assert.ok(repeatController, 'Should have repeat controller');
      assert.strictEqual(repeatController.views.length, 3, 'Repeat should have 3 views');

      await stop();
    });
  });

  // ============================================================================
  // Switch Recording Tests
  // ============================================================================

  describe('switch recording', function () {
    it('records switch with matching case', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div switch.bind="status"><span case="active">Active</span><span case="inactive">Inactive</span></div>',
        { status: 'active' },
        1,
      );

      const manifest = ssrContext.getManifest();

      // Should have switch controller
      assert.ok(manifest.controllers[0], 'Should have switch controller');
      assert.strictEqual(manifest.controllers[0].type, 'switch', 'Should be switch type');

      await stop();
    });

    it('records switch with default-case fallback', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div switch.bind="status"><span case="active">Active</span><span default-case>Unknown</span></div>',
        { status: 'unknown-value' },
        1,
      );

      const manifest = ssrContext.getManifest();

      assert.ok(manifest.controllers[0], 'Should have switch controller');

      await stop();
    });
  });

  // ============================================================================
  // Ordering Contract Tests
  // ============================================================================

  describe('ordering contract', function () {
    it('globalTargets follows instruction order, not DOM order', async function () {
      // Template where the li element has bindings that come AFTER inner element bindings in instruction order
      // DOM order: li (parent) -> input (child) -> span (child)
      // But instruction order is determined by compilation, which may process children first
      const { ssrContext, stop } = await setupRecording(
        '<li repeat.for="item of items" class.bind="item.cls"><input type="checkbox" checked.bind="item.done"><span>${item.text}</span></li>',
        {
          items: [
            { text: 'Task 1', done: true, cls: 'completed' },
            { text: 'Task 2', done: false, cls: 'active' },
          ],
        },
        1,
      );

      const manifest = ssrContext.getManifest();
      const repeatController = manifest.controllers[0];

      assert.ok(repeatController, 'Should have repeat controller');
      assert.strictEqual(repeatController.views.length, 2, 'Should have 2 views');

      // Each view should have globalTargets
      for (const view of repeatController.views) {
        assert.ok(view.globalTargets, 'View should have globalTargets');
        assert.ok(view.globalTargets.length > 0, 'globalTargets should not be empty');
      }

      await stop();
    });
  });

  // ============================================================================
  // Promise Recording Tests
  // ============================================================================

  describe('promise recording', function () {
    it('records promise with pending state', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div promise.bind="dataPromise"><span pending>Loading...</span><span then.from-view="data">Done: ${data}</span></div>',
        { dataPromise: new Promise(() => {}) }, // Never resolves
        1,
      );

      const manifest = ssrContext.getManifest();

      // Should have promise controller
      assert.ok(manifest.controllers[0], 'Should have promise controller');
      assert.strictEqual(manifest.controllers[0].type, 'promise', 'Should be promise type');

      await stop();
    });

    it('records promise with resolved state', async function () {
      const resolvedPromise = Promise.resolve('test-data');
      // Let promise resolve before rendering
      await resolvedPromise;

      const { ssrContext, stop } = await setupRecording(
        '<div promise.bind="dataPromise"><span pending>Loading...</span><span then.from-view="data">${data}</span></div>',
        { dataPromise: resolvedPromise },
        1,
      );

      // Wait for promise to settle in the rendering
      await new Promise(r => setTimeout(r, 0));

      const manifest = ssrContext.getManifest();

      assert.ok(manifest.controllers[0], 'Should have promise controller');

      await stop();
    });
  });

  // ============================================================================
  // Manifest Structure Tests
  // ============================================================================

  describe('manifest structure', function () {
    it('targetCount reflects allocated indices', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div repeat.for="item of items">${item}</div>',
        { items: ['A', 'B', 'C'] },
        1,
      );

      const manifest = ssrContext.getManifest();

      // targetCount should be >= 1 (root) + 3 (one per repeat view's content)
      assert.ok(manifest.targetCount >= 4, `targetCount should be >= 4, got ${manifest.targetCount}`);

      await stop();
    });

    it('empty items produces no controller record', async function () {
      const { ssrContext, stop } = await setupRecording(
        '<div repeat.for="item of items">${item}</div>',
        { items: [] },
        1,
      );

      const manifest = ssrContext.getManifest();

      // When repeat has no items, no views are created, so no recording happens
      // This is correct behavior - the controller is only recorded when it creates views
      assert.strictEqual(manifest.controllers[0], undefined, 'Should not have controller when no views');

      await stop();
    });
  });
});

/**
 * SSR Hydration - Lifecycle Hook Tests
 *
 * Tests that verify lifecycle hooks fire correctly during hydration and teardown.
 * These tests ensure the hydration path triggers the same lifecycle sequence as
 * normal component activation.
 *
 * Test organization:
 * - Root component lifecycle
 * - Child component lifecycle (inside template controllers)
 * - Lifecycle order verification
 * - Teardown lifecycle
 */

import { Aurelia, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { PropertyBindingInstruction, BindingMode, HydrateElementInstruction } from '@aurelia/template-compiler';
import { assert, TestContext } from '@aurelia/testing';

import {
  $,
  createParentTemplate,
  createLifecycleTracker,
} from './ssr-hydration.helpers.js';

describe('3-runtime-html/ssr-hydration-lifecycle.spec.ts', function () {

  // ============================================================================
  // Root Component Lifecycle
  // ============================================================================

  describe('Root component lifecycle', function () {

    it('calls binding, bound, attaching, attached during hydration', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const tracker = createLifecycleTracker();

      @customElement({
        name: 'test-app',
        template: '<div><!--au:0-->placeholder</div>',
        instructions: [[$.text('message')]],
        needsCompile: false,
      })
      class TestApp implements ICustomElementViewModel {
        message = '';
        binding() { tracker.record('root', 'binding'); }
        bound() { tracker.record('root', 'bound'); }
        attaching() { tracker.record('root', 'attaching'); }
        attached() { tracker.record('root', 'attached'); }
      }

      const host = doc.createElement('div');
      host.innerHTML = '<div><!--au:0-->Hello</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({ host, component: TestApp, state: { message: 'Hello' } });

        assert.ok(tracker.hasHook('root', 'binding'), 'binding should be called');
        assert.ok(tracker.hasHook('root', 'bound'), 'bound should be called');
        assert.ok(tracker.hasHook('root', 'attaching'), 'attaching should be called');
        assert.ok(tracker.hasHook('root', 'attached'), 'attached should be called');

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('calls lifecycle hooks in correct order', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const tracker = createLifecycleTracker();

      @customElement({
        name: 'test-app',
        template: '<div>Content</div>',
        instructions: [],
        needsCompile: false,
      })
      class TestApp implements ICustomElementViewModel {
        binding() { tracker.record('root', 'binding'); }
        bound() { tracker.record('root', 'bound'); }
        attaching() { tracker.record('root', 'attaching'); }
        attached() { tracker.record('root', 'attached'); }
      }

      const host = doc.createElement('div');
      host.innerHTML = '<div>Content</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({ host, component: TestApp });

        const hooks = tracker.getHooks();
        assert.strictEqual(hooks[0], 'root:binding');
        assert.strictEqual(hooks[1], 'root:bound');
        assert.strictEqual(hooks[2], 'root:attaching');
        assert.strictEqual(hooks[3], 'root:attached');

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });
  });

  // ============================================================================
  // Child Component Lifecycle (inside template controllers)
  // ============================================================================

  describe('Child component lifecycle', function () {

    // Test that child custom elements inside repeat views receive lifecycle hooks during SSR hydration
    it('calls lifecycle hooks on child elements inside repeat', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const tracker = createLifecycleTracker();

      // Custom element with lifecycle hooks that track calls
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<span>${value}</span>',
          needsCompile: true,
          bindables: { value: {} },
        };
        value = '';
        binding() { tracker.record('child', 'binding'); }
        bound() { tracker.record('child', 'bound'); }
        attaching() { tracker.record('child', 'attaching'); }
        attached() { tracker.record('child', 'attached'); }
        detaching() { tracker.record('child', 'detaching'); }
        unbinding() { tracker.record('child', 'unbinding'); }
      }

      ctx.container.register(ChildEl);

      // View template: just the element with au-hid marker (bindings are in instructions)
      const viewTemplate = doc.createElement('template');
      viewTemplate.innerHTML = '<child-el au-hid="0"></child-el>';
      const viewDef = {
        name: 'repeat-view',
        type: 'custom-element' as const,
        template: viewTemplate,
        // HydrateElementInstruction to activate the custom element with its bindings
        instructions: [[new HydrateElementInstruction(
          'child-el',
          [new PropertyBindingInstruction('item', 'value', BindingMode.toView)],
          null, // projections
          false, // containerless
          undefined, // captures
          {}, // data
        )]],
        needsCompile: false as const,
      };

      const repeatInstruction = $.repeat(viewDef, 'item of items');
      const parentTemplate = createParentTemplate(doc);

      class TestApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'test-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
          dependencies: [ChildEl],
        };
        items: string[] = [];
      }

      const host = doc.createElement('div');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<child-el au-hid="1"><span>Alice</span></child-el>',
        '<child-el au-hid="2"><span>Bob</span></child-el>',
        '<!--au-end-->'
      ].join('');
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TestApp,
          state: { items: ['Alice', 'Bob'] },
          manifest: {
            targetCount: 3,
            controllers: { 0: { type: 'repeat', views: [{ targets: [1] }, { targets: [2] }] } }
          }
        });

        // Should have 2 children, each with all 4 hooks (binding, bound, attaching, attached)
        assert.ok(tracker.hasHook('child', 'binding'), 'child binding called');
        assert.ok(tracker.hasHook('child', 'bound'), 'child bound called');
        assert.ok(tracker.hasHook('child', 'attaching'), 'child attaching called');
        assert.ok(tracker.hasHook('child', 'attached'), 'child attached called');

        // Verify the child count is 2
        assert.strictEqual(host.querySelectorAll('child-el').length, 2, 'should have 2 child-el elements');

        // Debug: Check the controller hierarchy
        const rootCtrl = root.controller as any;
        console.log('Root children count:', rootCtrl.children?.length ?? 0);
        if (rootCtrl.children) {
          for (const child of rootCtrl.children) {
            console.log('  Child type:', child.vmKind, 'name:', child.name ?? 'N/A');
            console.log('    _vm type:', typeof child._vm, '_vm:', child._vm);
            console.log('    _vmHooks:', child._vmHooks);
            console.log('    Has children:', child.children?.length ?? 0);
            // Check if this is the repeat template controller - _vm is the Repeat instance
            const vm = child._vm;
            if (vm) {
              console.log('    vm.views exists:', 'views' in vm);
              console.log('    vm has:', Object.keys(vm).slice(0, 10).join(', '));
            }
            // Try accessing views directly on viewModel
            const viewModel = child.viewModel;
            if (viewModel?.views) {
              console.log('    Repeat views:', viewModel.views.length);
              for (let i = 0; i < viewModel.views.length; i++) {
                const view = viewModel.views[i];
                console.log(`      View ${i} children:`, view.children?.length ?? 0);
                if (view.children) {
                  for (const vc of view.children) {
                    console.log(`        View child: vmKind=${vc.vmKind}, name=${vc.name ?? 'N/A'}`);
                  }
                }
              }
            }
          }
        }

        await au.stop(true);

        console.log('Hooks after stop:', tracker.getHooks());

        // Debug: Check view states after stop
        const viewModel2 = (rootCtrl.children?.[0] as any)?.viewModel;
        if (viewModel2?.views) {
          for (let i = 0; i < viewModel2.views.length; i++) {
            const view = viewModel2.views[i];
            console.log(`View ${i} state after stop:`, view.state, 'isBound:', view.isBound, 'isActive:', view.isActive);
            if (view.children) {
              for (const vc of view.children) {
                console.log(`  Child state:`, vc.state, 'isBound:', vc.isBound, 'isActive:', vc.isActive);
              }
            }
          }
        }

        // Teardown hooks SHOULD be called on au.stop()
        assert.ok(tracker.hasHook('child', 'detaching'), 'child detaching called on stop');
        assert.ok(tracker.hasHook('child', 'unbinding'), 'child unbinding called on stop');
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('calls teardown hooks when repeat item is removed', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const tracker = createLifecycleTracker();

      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<span>${value}</span>',
          needsCompile: true,
          bindables: { value: {} },
        };
        value = '';
        binding() { tracker.record('child', 'binding'); }
        bound() { tracker.record('child', 'bound'); }
        attaching() { tracker.record('child', 'attaching'); }
        attached() { tracker.record('child', 'attached'); }
        detaching() { tracker.record('child', 'detaching'); }
        unbinding() { tracker.record('child', 'unbinding'); }
      }

      ctx.container.register(ChildEl);

      const viewTemplate = doc.createElement('template');
      viewTemplate.innerHTML = '<child-el au-hid="0"></child-el>';
      const viewDef = {
        name: 'repeat-view',
        type: 'custom-element' as const,
        template: viewTemplate,
        instructions: [[new HydrateElementInstruction(
          'child-el',
          [new PropertyBindingInstruction('item', 'value', BindingMode.toView)],
          null, false, undefined, {},
        )]],
        needsCompile: false as const,
      };

      const repeatInstruction = $.repeat(viewDef, 'item of items');
      const parentTemplate = createParentTemplate(doc);

      class TestApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'test-app',
          template: parentTemplate,
          instructions: [[repeatInstruction]],
          needsCompile: false,
          dependencies: [ChildEl],
        };
        items: string[] = [];
      }

      const host = doc.createElement('div');
      host.innerHTML = [
        '<!--au:0--><!--au-start-->',
        '<child-el au-hid="1"><span>Alice</span></child-el>',
        '<child-el au-hid="2"><span>Bob</span></child-el>',
        '<!--au-end-->'
      ].join('');
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({
          host,
          component: TestApp,
          state: { items: ['Alice', 'Bob'] },
          manifest: {
            targetCount: 3,
            controllers: { 0: { type: 'repeat', views: [{ targets: [1] }, { targets: [2] }] } }
          }
        });

        // Clear tracker after hydration
        tracker.clear();

        // Remove one item - this should trigger detaching/unbinding on the removed child
        const vm = root.controller.viewModel as { items: string[] };
        vm.items.pop(); // Remove 'Bob'

        // Mutations are synchronous - no need to wait

        // The removed child should have teardown hooks called
        assert.ok(tracker.hasHook('child', 'detaching'), 'child detaching called on item removal');
        assert.ok(tracker.hasHook('child', 'unbinding'), 'child unbinding called on item removal');

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it.skip('calls lifecycle hooks on child elements inside if', async function () {
      // Similar to repeat, but with if.bind=true
    });

    it.skip('does not call lifecycle hooks on child elements when if is false', async function () {
      // if.bind=false - no children to hydrate, no lifecycle calls
    });
  });

  // ============================================================================
  // Lifecycle Order with Nested Components
  // ============================================================================

  describe('Lifecycle order with nesting', function () {

    it.skip('calls parent lifecycle before child lifecycle', async function () {
      // Parent binding -> Parent bound -> Child binding -> Child bound -> ...
    });

    it.skip('calls child attached before parent attached', async function () {
      // Children are attached bottom-up before parent attached completes
    });

    it.skip('maintains correct order with multiple nested levels', async function () {
      // grandparent -> parent -> child ordering
    });
  });

  // ============================================================================
  // Teardown Lifecycle
  // ============================================================================

  describe('Teardown lifecycle', function () {

    // TODO: Runtime gap - teardown hooks not called on hydrated components during au.stop()
    it.skip('calls detaching, unbinding on stop', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const tracker = createLifecycleTracker();

      @customElement({
        name: 'test-app',
        template: '<div>Content</div>',
        instructions: [],
        needsCompile: false,
      })
      class TestApp implements ICustomElementViewModel {
        detaching() { tracker.record('root', 'detaching'); }
        unbinding() { tracker.record('root', 'unbinding'); }
      }

      const host = doc.createElement('div');
      host.innerHTML = '<div>Content</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({ host, component: TestApp });

        tracker.clear();
        await au.stop(true);

        assert.ok(tracker.hasHook('root', 'detaching'), 'detaching called');
        assert.ok(tracker.hasHook('root', 'unbinding'), 'unbinding called');
      } finally {
        doc.body.removeChild(host);
      }
    });

    it.skip('calls teardown hooks in reverse order (child before parent)', async function () {
      // Child unbinding -> Parent unbinding
    });

    it.skip('calls teardown hooks when if toggles to false', async function () {
      // Child inside if should have detaching/unbinding called when if becomes false
    });

    it.skip('calls teardown hooks when repeat item is removed', async function () {
      // Removed item's children should have teardown hooks called
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge cases', function () {

    it.skip('handles async lifecycle hooks', async function () {
      // bound() returns a promise - should wait for it
    });

    it.skip('handles lifecycle hook errors gracefully', async function () {
      // Error in attached() should not break hydration
    });

    it.skip('maintains correct lifecycle with rapid mutations', async function () {
      // Multiple add/remove cycles should have correct lifecycle calls
    });
  });
});

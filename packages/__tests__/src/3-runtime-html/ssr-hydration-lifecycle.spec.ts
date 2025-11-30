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
import { IInstruction } from '@aurelia/template-compiler';
import { assert, TestContext } from '@aurelia/testing';

import {
  $, M,
  createViewDef,
  createParentTemplate,
  createRepeatComponent,
} from './ssr-hydration.helpers.js';

describe('3-runtime-html/ssr-hydration-lifecycle.spec.ts', function () {

  // ============================================================================
  // Lifecycle Tracking Utilities
  // ============================================================================

  interface LifecycleCall {
    hook: string;
    component: string;
    timestamp: number;
  }

  function createLifecycleTracker() {
    const calls: LifecycleCall[] = [];
    let counter = 0;

    return {
      calls,
      record: (component: string, hook: string) => {
        calls.push({ component, hook, timestamp: counter++ });
      },
      getHooks: () => calls.map(c => `${c.component}:${c.hook}`),
      hasHook: (component: string, hook: string) =>
        calls.some(c => c.component === component && c.hook === hook),
      clear: () => {
        calls.length = 0;
        counter = 0;
      }
    };
  }

  // ============================================================================
  // Root Component Lifecycle
  // ============================================================================

  describe('Root component lifecycle', function () {

    it.skip('calls binding, bound, attaching, attached during hydration', async function () {
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

    it.skip('calls lifecycle hooks in correct order', async function () {
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

    it.skip('calls lifecycle hooks on child elements inside repeat', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const tracker = createLifecycleTracker();

      @customElement({
        name: 'child-el',
        template: '<span>${value}</span>',
      })
      class ChildEl implements ICustomElementViewModel {
        value = '';
        binding() { tracker.record('child', 'binding'); }
        bound() { tracker.record('child', 'bound'); }
        attaching() { tracker.record('child', 'attaching'); }
        attached() { tracker.record('child', 'attached'); }
        detaching() { tracker.record('child', 'detaching'); }
        unbinding() { tracker.record('child', 'unbinding'); }
      }

      const viewDef = createViewDef(doc, '<div au-hid="0"><child-el au-hid="1"></child-el></div>', [[$.prop('item', 'value')]]);
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
        '<div au-hid="1"><child-el au-hid="2"><span>Alice</span></child-el></div>',
        '<div au-hid="3"><child-el au-hid="4"><span>Bob</span></child-el></div>',
        '<!--au-end-->'
      ].join('');
      doc.body.appendChild(host);

      try {
        ctx.container.register(ChildEl);
        const au = new Aurelia(ctx.container);
        await au.hydrate({
          host,
          component: TestApp,
          state: { items: ['Alice', 'Bob'] },
          manifest: {
            targetCount: 5,
            controllers: { 0: { type: 'repeat', views: [{ targets: [1, 2] }, { targets: [3, 4] }] } }
          }
        });

        // Should have 2 children, each with all 4 hooks
        assert.ok(tracker.hasHook('child', 'binding'), 'child binding called');
        assert.ok(tracker.hasHook('child', 'bound'), 'child bound called');
        assert.ok(tracker.hasHook('child', 'attaching'), 'child attaching called');
        assert.ok(tracker.hasHook('child', 'attached'), 'child attached called');

        await au.stop(true);

        assert.ok(tracker.hasHook('child', 'detaching'), 'child detaching called on stop');
        assert.ok(tracker.hasHook('child', 'unbinding'), 'child unbinding called on stop');
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

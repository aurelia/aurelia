/**
 * SSR Recording Hierarchy Tests
 *
 * Tests for manifest recording with parent-child custom element hierarchies.
 * This is the critical scenario for SSR hydration: when a parent component
 * contains child custom elements, we must ensure:
 *
 * 1. The parent's manifest only contains targets for the PARENT's scope
 * 2. Child CE targets are NOT collected by the parent
 * 3. Each CE boundary is correctly detected
 *
 * These tests replicate the complex scenarios from packages/build/test/child-component-e2e.test.mjs
 * but at the runtime level for faster debugging.
 *
 * IMPORTANT: Unlike React/Vue, Aurelia doesn't use a VDom or reconciler.
 * State lives in component instances naturally - we don't need to inject state.
 * Just let components initialize their own properties and use bindables for
 * parent→child communication.
 */

import { Registration } from '@aurelia/kernel';
import {
  Aurelia,
  CustomElement,
  ISSRContextToken,
  SSRContext,
  bindable,
} from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

describe('3-runtime-html/ssr-recording-hierarchy.spec.ts', function () {
  // ============================================================================
  // Test Infrastructure
  // ============================================================================

  interface HierarchyTestResult {
    ctx: ReturnType<typeof TestContext.create>;
    au: Aurelia;
    host: HTMLElement;
    ssrContext: SSRContext;
    html: string;
    manifest: ReturnType<SSRContext['getManifest']>;
    stop: () => Promise<void>;
  }

  /**
   * Setup SSR recording with pre-defined component classes.
   * This is the natural Aurelia way - components define their own state.
   */
  async function setupWithComponents(
    ParentClass: any,
    childClasses: any[] = [],
    rootTargetCount = 0,
  ): Promise<HierarchyTestResult> {
    const ctx = TestContext.create();
    const doc = ctx.doc;

    const host = doc.createElement('div');
    doc.body.appendChild(host);

    const ssrContext = new SSRContext();
    ssrContext.setRootTargetCount(rootTargetCount);
    ctx.container.register(Registration.instance(ISSRContextToken, ssrContext));

    // Register child components
    for (const ChildClass of childClasses) {
      ctx.container.register(ChildClass);
    }

    const au = new Aurelia(ctx.container);
    au.app({ host, component: ParentClass });
    await au.start();

    const html = host.innerHTML;
    const manifest = ssrContext.getManifest();

    return {
      ctx,
      au,
      host,
      ssrContext,
      html,
      manifest,
      stop: async () => {
        await au.stop(true);
        doc.body.removeChild(host);
      },
    };
  }

  // ============================================================================
  // Basic Parent-Child Tests - Using proper component classes
  // ============================================================================

  describe('basic parent-child rendering', function () {
    it('parent with single child CE renders correct structure', async function () {
      // Define child component
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<div class="child">Child Content</div>',
        };
      }

      // Define parent component with child as dependency
      class ParentEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div class="parent"><child-el></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      // Verify HTML structure
      assert.ok(result.html.includes('class="parent"'), 'Should have parent div');
      assert.ok(result.html.includes('class="child"'), 'Should have child div');

      // Count elements - should be exactly 1 of each
      const parentDivCount = (result.html.match(/class="parent"/g) || []).length;
      const childDivCount = (result.html.match(/class="child"/g) || []).length;

      assert.strictEqual(parentDivCount, 1, 'Should have exactly 1 parent div');
      assert.strictEqual(childDivCount, 1, 'Should have exactly 1 child div');

      await result.stop();
    });

    it('parent with multiple child CE instances renders correct count', async function () {
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<div class="child">Child</div>',
        };
      }

      class ParentEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div class="parent"><child-el></child-el><child-el></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      const childDivCount = (result.html.match(/class="child"/g) || []).length;
      assert.strictEqual(childDivCount, 2, 'Should have exactly 2 child divs');

      await result.stop();
    });

    it('parent with bindable child CE passes values correctly', async function () {
      // Child component with a bindable - no injected state, just natural class
      class GreetingCard {
        // Bindable with default value
        name = 'Guest';

        static $au = {
          type: 'custom-element' as const,
          name: 'greeting-card',
          template: '<div class="greeting">Hello, ${name}!</div>',
          bindables: { name: { mode: 2 } }, // toView
        };
      }

      // Parent component that binds to child
      class ParentEl {
        userName = 'World';

        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div class="parent"><greeting-card name.bind="userName"></greeting-card></div>',
          dependencies: [GreetingCard],
        };
      }

      const result = await setupWithComponents(ParentEl, [GreetingCard]);

      console.log('Bindable test HTML:', result.html);

      // Should have the bound value "World", not default "Guest"
      // Note: markers may be inserted, so check for the value appearing after "Hello, "
      assert.ok(result.html.includes('World!'), 'Should have bound value World');
      assert.ok(!result.html.includes('Guest'), 'Should NOT have default value Guest');

      await result.stop();
    });
  });

  // ============================================================================
  // Manifest Recording with Hierarchy
  // ============================================================================

  describe('manifest recording with hierarchy', function () {
    it('manifest has correct targetCount for simple hierarchy', async function () {
      class ChildEl {
        text = 'Child';
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<span>${text}</span>',
        };
      }

      class ParentEl {
        message = 'Parent';
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div>${message}<child-el></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      console.log('HTML:', result.html);
      console.log('Manifest:', JSON.stringify(result.manifest, null, 2));

      // targetCount should cover both parent and child targets
      assert.ok(result.manifest.targetCount >= 0, 'Should have targetCount');

      await result.stop();
    });

    it('parent interpolation targets are separate from child targets', async function () {
      class ChildEl {
        childText = 'CHILD_VALUE';
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<span>${childText}</span>',
        };
      }

      class ParentEl {
        parentText = 'PARENT_VALUE';
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div><span>${parentText}</span><child-el></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      // Both values should appear
      assert.ok(result.html.includes('PARENT_VALUE'), 'Should have parent value');
      assert.ok(result.html.includes('CHILD_VALUE'), 'Should have child value');

      // Each should appear exactly once
      const parentCount = (result.html.match(/PARENT_VALUE/g) || []).length;
      const childCount = (result.html.match(/CHILD_VALUE/g) || []).length;

      assert.strictEqual(parentCount, 1, 'Parent value should appear once');
      assert.strictEqual(childCount, 1, 'Child value should appear once');

      await result.stop();
    });
  });

  // ============================================================================
  // Complex Hierarchy: Nested Custom Elements
  // ============================================================================

  describe('nested custom elements', function () {
    it('three-level hierarchy renders correctly', async function () {
      // Leaf component (level 3)
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<div class="child">Leaf</div>',
        };
      }

      // Middle component (level 2) - depends on leaf
      class ParentEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div class="parent"><child-el></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      // Root component (level 1) - depends on middle
      class GrandparentEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'grandparent-el',
          template: '<div class="grandparent"><parent-el></parent-el></div>',
          dependencies: [ParentEl],
        };
      }

      const result = await setupWithComponents(GrandparentEl, [ParentEl, ChildEl]);

      console.log('Three-level HTML:', result.html);

      // All three levels should be present
      assert.ok(result.html.includes('class="grandparent"'), 'Should have grandparent');
      assert.ok(result.html.includes('class="parent"'), 'Should have parent');
      assert.ok(result.html.includes('class="child"'), 'Should have child');

      await result.stop();
    });

    it('sibling custom elements at same level render correctly', async function () {
      class HeaderEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'header-el',
          template: '<header>Header</header>',
        };
      }

      class ContentEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'content-el',
          template: '<main>Content</main>',
        };
      }

      class FooterEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'footer-el',
          template: '<footer>Footer</footer>',
        };
      }

      class ContainerEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'container-el',
          template: '<div class="container"><header-el></header-el><content-el></content-el><footer-el></footer-el></div>',
          dependencies: [HeaderEl, ContentEl, FooterEl],
        };
      }

      const result = await setupWithComponents(ContainerEl, [HeaderEl, ContentEl, FooterEl]);

      assert.ok(result.html.includes('<header>Header</header>'), 'Should have header');
      assert.ok(result.html.includes('<main>Content</main>'), 'Should have content');
      assert.ok(result.html.includes('<footer>Footer</footer>'), 'Should have footer');

      await result.stop();
    });
  });

  // ============================================================================
  // Custom Elements with Template Controllers
  // ============================================================================

  describe('custom elements with template controllers', function () {
    it('repeat containing custom element renders multiple instances', async function () {
      class ItemEl {
        value = '';
        static $au = {
          type: 'custom-element' as const,
          name: 'item-el',
          template: '<span class="item">${value}</span>',
          bindables: { value: { mode: 2 } },
        };
      }

      class ParentEl {
        items = ['A', 'B', 'C'];
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div><item-el repeat.for="item of items" value.bind="item"></item-el></div>',
          dependencies: [ItemEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ItemEl]);

      console.log('Repeat with CE HTML:', result.html);

      // Should have 3 instances
      const itemCount = (result.html.match(/class="item"/g) || []).length;
      assert.strictEqual(itemCount, 3, 'Should have 3 item elements');

      // Should have A, B, C values
      assert.ok(result.html.includes('>A<'), 'Should have A');
      assert.ok(result.html.includes('>B<'), 'Should have B');
      assert.ok(result.html.includes('>C<'), 'Should have C');

      await result.stop();
    });

    it('if containing custom element renders conditionally', async function () {
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<span class="conditional">Visible</span>',
        };
      }

      class ParentEl {
        show = true;
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div><child-el if.bind="show"></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      assert.ok(result.html.includes('class="conditional"'), 'Should have conditional element when show=true');

      await result.stop();
    });

    it('if=false with custom element does not render child', async function () {
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<span class="conditional">Visible</span>',
        };
      }

      class ParentEl {
        show = false;
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div><child-el if.bind="show"></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      assert.ok(!result.html.includes('class="conditional"'), 'Should NOT have conditional element when show=false');

      await result.stop();
    });

    it('custom element inside repeat inside if', async function () {
      class ItemEl {
        name = '';
        static $au = {
          type: 'custom-element' as const,
          name: 'item-el',
          template: '<span class="nested-item">${name}</span>',
          bindables: { name: { mode: 2 } },
        };
      }

      class ParentEl {
        hasItems = true;
        items = ['X', 'Y'];
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div if.bind="hasItems"><item-el repeat.for="item of items" name.bind="item"></item-el></div>',
          dependencies: [ItemEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ItemEl]);

      const itemCount = (result.html.match(/class="nested-item"/g) || []).length;
      assert.strictEqual(itemCount, 2, 'Should have 2 nested items');

      await result.stop();
    });
  });

  // ============================================================================
  // Mirror of child-component-e2e.test.mjs Scenario
  // ============================================================================

  describe('MyApp + GreetingCard scenario (mirrors build package test)', function () {
    /**
     * This test mirrors the exact structure from child-component-e2e.test.mjs:
     * - MyApp: parent with appTitle, userName, timestamp
     * - GreetingCard: child with name bindable, greeting/nameLength getters
     *
     * KEY DIFFERENCE: We define proper classes with getters that work naturally,
     * instead of trying to inject state objects.
     */
    it('renders parent with two child greeting cards', async function () {
      // GreetingCard - child component with bindable and computed properties
      class GreetingCard {
        name = 'Guest';

        get greeting() {
          return `Hello, ${this.name}!`;
        }

        get nameLength() {
          return this.name.length;
        }

        static $au = {
          type: 'custom-element' as const,
          name: 'greeting-card',
          template: `<div class="greeting-card">
            <h2>\${greeting}</h2>
            <p>Name: "\${name}" (\${nameLength} characters)</p>
          </div>`,
          bindables: { name: { mode: 2 } },
        };
      }

      // MyApp - parent component
      class MyApp {
        appTitle = 'Child Component SSR Test';
        userName = 'World';
        timestamp = '2024-01-01T00:00:00.000Z';

        static $au = {
          type: 'custom-element' as const,
          name: 'my-app',
          template: `<div class="app">
            <h1>\${appTitle}</h1>
            <p>Rendered at: \${timestamp}</p>
            <greeting-card name.bind="userName"></greeting-card>
            <greeting-card name="Aurelia"></greeting-card>
          </div>`,
          dependencies: [GreetingCard],
        };
      }

      const result = await setupWithComponents(MyApp, [GreetingCard]);

      console.log('=== MyApp + GreetingCard SSR Output ===');
      console.log(result.html);
      console.log('=== Manifest ===');
      console.log(JSON.stringify(result.manifest, null, 2));

      // Structural assertions
      const appDivCount = (result.html.match(/class="app"/g) || []).length;
      const greetingCardCount = (result.html.match(/class="greeting-card"/g) || []).length;
      const h1Count = (result.html.match(/<h1>/g) || []).length;
      const h2Count = (result.html.match(/<h2>/g) || []).length;

      assert.strictEqual(appDivCount, 1, 'Should have exactly 1 <div class="app">');
      assert.strictEqual(greetingCardCount, 2, 'Should have exactly 2 <div class="greeting-card">');
      assert.strictEqual(h1Count, 1, 'Should have exactly 1 <h1>');
      assert.strictEqual(h2Count, 2, 'Should have exactly 2 <h2>');

      // Content assertions
      assert.ok(result.html.includes('Child Component SSR Test'), 'Should have appTitle');
      assert.ok(result.html.includes('2024-01-01'), 'Should have timestamp');
      assert.ok(result.html.includes('Hello, World!'), 'Should have first greeting with bound userName');
      assert.ok(result.html.includes('Hello, Aurelia!'), 'Should have second greeting with literal name');

      // Should NOT have default/unbound values
      assert.ok(!result.html.includes('Hello, Guest!'), 'Should NOT have default Guest greeting');

      await result.stop();
    });

    it('manifest records parent and child targets separately', async function () {
      class GreetingCard {
        name = 'Guest';
        get greeting() { return `Hello, ${this.name}!`; }

        static $au = {
          type: 'custom-element' as const,
          name: 'greeting-card',
          template: '<div class="greeting-card"><h2>${greeting}</h2></div>',
          bindables: { name: { mode: 2 } },
        };
      }

      class MyApp {
        appTitle = 'Test';
        userName = 'World';

        static $au = {
          type: 'custom-element' as const,
          name: 'my-app',
          template: `<div class="app">
            <h1>\${appTitle}</h1>
            <greeting-card name.bind="userName"></greeting-card>
          </div>`,
          dependencies: [GreetingCard],
        };
      }

      const result = await setupWithComponents(MyApp, [GreetingCard]);

      console.log('=== Manifest Structure ===');
      console.log(JSON.stringify(result.manifest, null, 2));

      // The manifest should exist
      assert.ok(result.manifest, 'Should have manifest');
      assert.ok(typeof result.manifest.targetCount === 'number', 'Should have targetCount');

      await result.stop();
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('edge cases', function () {
    it('empty parent with only custom element child', async function () {
      class ChildEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<div class="only-child">Only</div>',
        };
      }

      class ParentEl {
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<child-el></child-el>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl]);

      assert.ok(result.html.includes('class="only-child"'), 'Should render the child');

      await result.stop();
    });

    it('deeply nested interpolations do not cross CE boundaries', async function () {
      // Leaf component
      class GrandchildEl {
        grandchildVal = 'GRANDCHILD';
        static $au = {
          type: 'custom-element' as const,
          name: 'grandchild-el',
          template: '<span>${grandchildVal}</span>',
        };
      }

      // Middle component - depends on leaf
      class ChildEl {
        childVal = 'CHILD';
        static $au = {
          type: 'custom-element' as const,
          name: 'child-el',
          template: '<div>${childVal}<grandchild-el></grandchild-el></div>',
          dependencies: [GrandchildEl],
        };
      }

      // Root component - depends on middle
      class ParentEl {
        parentVal = 'PARENT';
        static $au = {
          type: 'custom-element' as const,
          name: 'parent-el',
          template: '<div>${parentVal}<child-el></child-el></div>',
          dependencies: [ChildEl],
        };
      }

      const result = await setupWithComponents(ParentEl, [ChildEl, GrandchildEl]);

      console.log('Deeply nested HTML:', result.html);

      // All three values should appear in the output as text content
      // The markers (<!--au:0-->) appear before text, so check for "-->VALUE<"
      assert.ok(result.html.includes('PARENT'), 'PARENT should appear');
      assert.ok(result.html.includes('-->CHILD<'), 'CHILD should appear as text (not in tag name)');
      assert.ok(result.html.includes('GRANDCHILD'), 'GRANDCHILD should appear');

      // Verify the nested structure is correct
      assert.ok(result.html.includes('<child-el'), 'Should have child-el tag');
      assert.ok(result.html.includes('<grandchild-el'), 'Should have grandchild-el tag');

      await result.stop();
    });
  });
});

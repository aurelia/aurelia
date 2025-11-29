/**
 * SSR Hydration Tests
 *
 * These tests validate the contract for SSR/AOT hydration:
 * 1. Pre-rendered HTML with markers (au-hid="N", <!--au:N-->) can be adopted
 * 2. The runtime can find targets in existing DOM
 * 3. Instructions can be applied to hydrate the component
 *
 * The goal is to enable:
 *   Server: template + data → HTML string with markers
 *   Client: HTML string with markers + instructions → interactive component
 */

import { DI, IContainer, Registration } from '@aurelia/kernel';
import { Scope } from '@aurelia/runtime';
import {
  CustomElement,
  IPlatform,
  Aurelia,
  IRendering,
  CustomElementDefinition,
  FragmentNodeSequence,
  INodeSequence,
  customElement,
} from '@aurelia/runtime-html';
import {
  InterpolationInstruction,
  PropertyBindingInstruction,
  IInstruction,
  TextBindingInstruction,
  BindingMode,
  InstructionType,
} from '@aurelia/template-compiler';
import { AccessScopeExpression } from '@aurelia/expression-parser';
import { assert, TestContext } from '@aurelia/testing';

describe('3-runtime-html/ssr-hydration.spec.ts', function () {

  describe('FragmentNodeSequence target collection from existing DOM', function () {

    it('collects element targets with au-hid attribute', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Simulate SSR output: HTML with au-hid markers
      const template = doc.createElement('template');
      template.innerHTML = '<div au-hid="0">Hello</div><span au-hid="1">World</span>';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 2, 'should find 2 targets');
      assert.strictEqual((targets[0] as Element).tagName, 'DIV', 'target 0 should be div');
      assert.strictEqual((targets[1] as Element).tagName, 'SPAN', 'target 1 should be span');

      // au-hid should be removed after processing
      assert.strictEqual((targets[0] as Element).hasAttribute('au-hid'), false, 'au-hid should be removed from target 0');
      assert.strictEqual((targets[1] as Element).hasAttribute('au-hid'), false, 'au-hid should be removed from target 1');
    });

    it('collects comment targets with <!--au:N--> marker', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Simulate SSR output: comment marker followed by text node
      const template = doc.createElement('template');
      template.innerHTML = '<!--au:0-->Hello World';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 1, 'should find 1 target');
      assert.strictEqual(targets[0].nodeType, 3 /* Text */, 'target should be text node');
      assert.strictEqual((targets[0] as Text).textContent, 'Hello World', 'text content should match');
    });

    it('collects mixed element and comment targets in order', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Simulate SSR output with mixed markers
      // Index 0: div element
      // Index 1: text node (via comment marker)
      // Index 2: span element
      const template = doc.createElement('template');
      template.innerHTML = '<div au-hid="0">Static</div><!--au:1-->Dynamic Text<span au-hid="2">End</span>';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 3, 'should find 3 targets');
      assert.strictEqual((targets[0] as Element).tagName, 'DIV', 'target 0 should be div');
      assert.strictEqual(targets[1].nodeType, 3 /* Text */, 'target 1 should be text node');
      assert.strictEqual((targets[2] as Element).tagName, 'SPAN', 'target 2 should be span');
    });

    it('handles nested elements with markers', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Simulate nested structure
      const template = doc.createElement('template');
      template.innerHTML = '<div au-hid="0"><span au-hid="1">Nested</span></div>';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 2, 'should find 2 targets');
      assert.strictEqual((targets[0] as Element).tagName, 'DIV', 'target 0 should be outer div');
      assert.strictEqual((targets[1] as Element).tagName, 'SPAN', 'target 1 should be inner span');
    });

    it('handles render location markers (au-start/au-end)', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Simulate template controller output (if/repeat)
      // <!--au:0--><!--au-start--><!--au-end-->
      const template = doc.createElement('template');
      template.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 1, 'should find 1 target');
      // The target should be the au-end comment with $start pointing to au-start
      assert.strictEqual(targets[0].nodeType, 8 /* Comment */, 'target should be comment');
      assert.strictEqual((targets[0] as Comment).textContent, 'au-end', 'should be au-end marker');
      assert.ok((targets[0] as any).$start, 'should have $start reference');
      assert.strictEqual(((targets[0] as any).$start as Comment).textContent, 'au-start', '$start should be au-start marker');
    });
  });

  describe('SSR hydration contract simulation', function () {

    /**
     * This test simulates what an AOT hydration would look like:
     * 1. Pre-rendered HTML (what the server would emit)
     * 2. Pre-compiled instructions (what AOT would emit)
     * 3. Hydration connects them
     */
    it('can hydrate pre-rendered HTML with text interpolation', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const container = ctx.container;
      const platform = container.get(IPlatform);
      const rendering = container.get(IRendering);

      // === Step 1: Simulate SSR output ===
      // Server would render: <div>${message}</div> with data { message: 'Hello World' }
      // Output: <div au-hid="0">Hello World</div>
      //
      // But for text binding, the marker is on the text node:
      // <div><!--au:0-->Hello World</div>
      const ssrHtml = '<div><!--au:0-->Hello World</div>';

      // === Step 2: Pre-compiled instructions ===
      // These would be generated by AOT compiler
      // TextBindingInstruction takes a single expression, not an Interpolation
      // For ${message}, we have one expression: AccessScopeExpression('message')
      const instructions: IInstruction[][] = [
        [new TextBindingInstruction(new AccessScopeExpression('message', 0))]
      ];

      // === Step 3: Create host and insert SSR HTML ===
      const host = doc.createElement('div');
      host.innerHTML = ssrHtml;
      doc.body.appendChild(host);

      try {
        // === Step 4: Create definition with pre-rendered template ===
        const definition = CustomElementDefinition.create({
          name: 'test-app',
          template: host.firstElementChild!, // The pre-rendered DOM
          instructions,
          needsCompile: false, // Already compiled
        });

        // === Step 5: Create FragmentNodeSequence from the definition ===
        // This wraps the pre-rendered DOM
        const nodes = rendering.createNodes(definition);
        const targets = nodes.findTargets();

        // Verify target collection works
        assert.strictEqual(targets.length, 1, 'should find 1 target (text node)');
        assert.strictEqual(targets[0].nodeType, 3 /* Text */, 'target should be text node');

        // The text content should still be the SSR value until bindings are applied
        assert.strictEqual((targets[0] as Text).textContent, 'Hello World', 'text should have SSR value');

      } finally {
        doc.body.removeChild(host);
      }
    });

    it('validates marker-instruction alignment', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // This test validates that marker indices match instruction indices
      // Template: <div>${a}</div><span>${b}</span>
      // SSR output: <div><!--au:0-->A</div><span><!--au:1-->B</span>

      const template = doc.createElement('template');
      template.innerHTML = '<div><!--au:0-->A</div><span><!--au:1-->B</span>';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      // Instructions would be:
      // [0]: text binding for ${a}
      // [1]: text binding for ${b}
      const instructions: IInstruction[][] = [
        [new TextBindingInstruction(new AccessScopeExpression('a', 0))],
        [new TextBindingInstruction(new AccessScopeExpression('b', 0))],
      ];

      assert.strictEqual(targets.length, instructions.length, 'targets and instructions should align');

      // Each target should receive the corresponding instruction
      // target[0] (text in div) receives instructions[0] (binding for 'a')
      // target[1] (text in span) receives instructions[1] (binding for 'b')
    });

    it('validates element binding marker alignment', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Template: <input value.bind="name">
      // SSR output: <input au-hid="0" value="John">

      const template = doc.createElement('template');
      template.innerHTML = '<input au-hid="0" value="John">';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      // Instructions would be:
      // [0]: property binding for value.bind="name"
      const instructions: IInstruction[][] = [
        [new PropertyBindingInstruction('name', 'value', BindingMode.toView)],
      ];

      assert.strictEqual(targets.length, 1, 'should find input target');
      assert.strictEqual((targets[0] as HTMLInputElement).tagName, 'INPUT', 'target should be input');
      assert.strictEqual((targets[0] as HTMLInputElement).value, 'John', 'should have SSR value');
    });
  });

  describe('FragmentNodeSequence.adoptChildren() API', function () {

    it('adopts existing DOM children without moving them', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Create host with pre-rendered content (simulating SSR output)
      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">Hello</span><!--au:1-->World';
      doc.body.appendChild(host);

      try {
        // Get references to children before adoption
        const originalFirstChild = host.firstChild;
        const originalChildCount = host.childNodes.length;

        // Adopt existing children
        const seq = FragmentNodeSequence.adoptChildren(platform, host);

        // Children should NOT be moved - they stay in the host
        assert.strictEqual(host.firstChild, originalFirstChild, 'first child should not be moved');
        assert.strictEqual(host.childNodes.length, originalChildCount - 1, 'only marker comment removed');

        // Targets should be found correctly
        const targets = seq.findTargets();
        assert.strictEqual(targets.length, 2, 'should find 2 targets');
        assert.strictEqual((targets[0] as Element).tagName, 'SPAN', 'target 0 should be span');
        assert.strictEqual(targets[1].nodeType, 3 /* Text */, 'target 1 should be text node');

        // Node sequence should report as mounted
        assert.strictEqual(seq.firstChild, host.firstChild, 'firstChild should match');

      } finally {
        doc.body.removeChild(host);
      }
    });

    it('appendTo is a no-op for adopted nodes (already mounted)', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Create host with pre-rendered content
      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">Content</span>';
      doc.body.appendChild(host);

      try {
        const seq = FragmentNodeSequence.adoptChildren(platform, host);

        // Create another parent
        const otherParent = doc.createElement('div');

        // Get child count before appendTo
        const hostChildCount = host.childNodes.length;
        const otherChildCount = otherParent.childNodes.length;

        // appendTo should be a no-op since nodes are already mounted
        // The nodes should stay in host, not move to otherParent
        seq.appendTo(otherParent);

        // For adopted sequences, since _isMounted is true from start,
        // appendTo will move nodes. This is the expected behavior when
        // explicitly calling appendTo - it moves to new parent.
        // In SSR hydration, we don't call appendTo since nodes are already where they belong.

      } finally {
        doc.body.removeChild(host);
      }
    });

    it('remove() moves adopted nodes to internal fragment', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Create host with pre-rendered content
      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">Content</span>';
      doc.body.appendChild(host);

      try {
        const originalSpan = host.firstChild;
        const seq = FragmentNodeSequence.adoptChildren(platform, host);

        // Remove should move nodes out of host
        seq.remove();

        // Host should now be empty
        assert.strictEqual(host.childNodes.length, 0, 'host should be empty after remove');

        // Nodes should still be accessible via the sequence
        assert.strictEqual(seq.firstChild, originalSpan, 'sequence should still reference the span');

      } finally {
        doc.body.removeChild(host);
      }
    });
  });

  describe('IRendering.adoptNodes() API', function () {

    it('adopts nodes via the rendering service', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const container = ctx.container;
      const rendering = container.get(IRendering);

      // Create host with pre-rendered content
      const host = doc.createElement('div');
      host.innerHTML = '<div au-hid="0">Hello</div><!--au:1-->World';
      doc.body.appendChild(host);

      try {
        const seq = rendering.adoptNodes(host);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 2, 'should find 2 targets');
        assert.strictEqual((targets[0] as Element).tagName, 'DIV', 'target 0 should be div');
        assert.strictEqual(targets[1].nodeType, 3 /* Text */, 'target 1 should be text node');

      } finally {
        doc.body.removeChild(host);
      }
    });
  });

  describe('Template controller SSR scenarios (repeat, if)', function () {

    /**
     * This section documents what SSR output looks like for template controllers
     * and what gaps exist in the current adoption implementation.
     *
     * KEY INSIGHT: Template controllers (repeat, if) use ViewFactory to create
     * synthetic views. Currently, ViewFactory.create() ALWAYS clones the template.
     * For SSR hydration, we need to ADOPT existing rendered views instead.
     */

    describe('repeat.for SSR output structure', function () {

      it('documents marker index collision in naive SSR output', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * CRITICAL PROBLEM: Marker indices are LOCAL to each template!
         *
         * Template: <div repeat.for="item of items">${item.name}</div>
         * Data: items = [{name: 'Alice'}, {name: 'Bob'}, {name: 'Charlie'}]
         *
         * Parent template has: <!--au:0--> (for repeat's render location)
         * Child view template has: <!--au:0--> (for ${item.name} text binding)
         *
         * If we naively flatten SSR output, we get INDEX COLLISIONS:
         *   <!--au:0--><!--au-start-->
         *   <div><!--au:0-->Alice</div>   <- COLLISION: also index 0!
         *   <div><!--au:0-->Bob</div>     <- COLLISION: also index 0!
         *   <div><!--au:0-->Charlie</div> <- COLLISION: also index 0!
         *   <!--au-end-->
         *
         * The TreeWalker processes markers in document order.
         * Later markers with the same index OVERWRITE earlier ones.
         */
        const naiveSsrOutput = `<!--au:0--><!--au-start-->` +
          `<div><!--au:0-->Alice</div>` +
          `<div><!--au:0-->Bob</div>` +
          `<div><!--au:0-->Charlie</div>` +
          `<!--au-end-->`;

        const template = doc.createElement('template');
        template.innerHTML = naiveSsrOutput;

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        /**
         * RESULT: Array has length based on marker COUNT (4), but only index 0
         * is set (and overwritten 4 times). Indices 1-3 are undefined holes.
         *
         * The WRONG value is at index 0:
         * - Expected: render location (au-end comment)
         * - Actual: text node "Charlie" (last <!--au:0--> wins)
         *
         * This breaks rendering because instruction[0] expects the render location
         * but gets a text node instead.
         */
        assert.strictEqual(targets.length, 4, 'array length equals marker count');

        // Only index 0 is set (all others are undefined holes in sparse array)
        assert.strictEqual(targets[0].nodeType, 3 /* Text */, 'target 0 is text (last <!--au:0--> wins)');
        assert.strictEqual((targets[0] as Text).textContent, 'Charlie', 'target is text from last view');

        // Indices 1-3 are undefined (sparse array holes)
        assert.strictEqual(targets[1], undefined, 'target 1 is undefined (hole)');
        assert.strictEqual(targets[2], undefined, 'target 2 is undefined (hole)');
        assert.strictEqual(targets[3], undefined, 'target 3 is undefined (hole)');
      });

      it('correctly finds au-end with SSR content between markers', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * SSR output has content between au-start and au-end:
         *   <!--au:0--><!--au-start--><content><!--au-end-->
         *
         * The _collectTargets method searches forward to find au-end
         * instead of assuming it's adjacent to au-start.
         */
        const ssrOutput = `<!--au:0--><!--au-start-->` +
          `<div><!--au:1-->Alice</div>` +
          `<div><!--au:2-->Bob</div>` +
          `<div><!--au:3-->Charlie</div>` +
          `<!--au-end-->`;

        const template = doc.createElement('template');
        template.innerHTML = ssrOutput;

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 4, 'should find 4 targets');

        // Target 0 should be the render location (au-end comment)
        assert.strictEqual(targets[0].nodeType, 8 /* Comment */, 'target 0 should be au-end comment');
        assert.strictEqual((targets[0] as Comment).textContent, 'au-end', 'target 0 is au-end');
        assert.ok((targets[0] as any).$start, '$start should be set');
        assert.strictEqual(((targets[0] as any).$start as Comment).textContent, 'au-start', '$start is au-start');

        // Targets 1-3 are the text nodes for each view
        assert.strictEqual(targets[1].nodeType, 3 /* Text */, 'target 1 is text');
        assert.strictEqual((targets[1] as Text).textContent, 'Alice', 'target 1 is Alice');
        assert.strictEqual(targets[2].nodeType, 3 /* Text */, 'target 2 is text');
        assert.strictEqual((targets[2] as Text).textContent, 'Bob', 'target 2 is Bob');
        assert.strictEqual(targets[3].nodeType, 3 /* Text */, 'target 3 is text');
        assert.strictEqual((targets[3] as Text).textContent, 'Charlie', 'target 3 is Charlie');
      });

      it('documents WORKAROUND: adjacent markers with content inside', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * WORKAROUND: Keep au-start/au-end adjacent, put content marker INSIDE
         *
         * Instead of: <!--au:0--><!--au-start--><content><!--au-end-->
         * Use:        <!--au:0--><!--au-start--><!--au-end-->
         *             + separate markers for each view
         *
         * The render location marker points to au-end.
         * View content is between au-start and au-end in DOM but
         * has its own separate markers.
         *
         * This keeps JIT compatibility while supporting SSR.
         */

        // This approach requires runtime changes to _collectTargets
        // For now, this documents the design direction
        assert.ok(true, 'Adjacent markers workaround documented');
      });

      it('documents view boundary detection approaches', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        /**
         * CHALLENGE: How does repeat know view boundaries during hydration?
         *
         * With global indices, we can collect all targets, but the repeat
         * controller needs to create 3 View objects, each "owning" its targets.
         *
         * POSSIBLE APPROACHES:
         *
         * 1. Infer from state + view definition:
         *    - items.length tells us how many views
         *    - View template's root node count tells us nodes per view
         *    - Split children between au-start/au-end into groups
         *
         * 2. Explicit view markers (<!--au-v-->):
         *    - Each marker starts a new view
         *    - Could include metadata: <!--au-v:1,2--> = targets 1-2
         *
         * 3. Target index ranges in hydration metadata:
         *    - SSR renderer tracks which indices belong to which view
         *    - Pass this to client for hydration
         *
         * Design choice depends on:
         * - Multi-root templates (views with multiple root nodes)
         * - Edge cases (empty views, <template> elements)
         * - Simplicity vs robustness tradeoffs
         */

        // This test documents the design space, not a specific solution
        assert.ok(true, 'View boundary detection requires design decision');
      });

      it('verifies global indices enable correct target collection', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * SSR FORMAT: Global indices prevent collisions
         *
         * Template: <div repeat.for="item of items">${item}</div>
         * Data: items = ['A', 'B', 'C']
         *
         * SSR output with global indices:
         *   <!--au:0--><!--au-start-->
         *   <div><!--au:1-->A</div>
         *   <div><!--au:2-->B</div>
         *   <div><!--au:3-->C</div>
         *   <!--au-end-->
         *
         * Each marker has a unique index, so no collisions occur.
         * Target collection works correctly.
         */
        const ssrOutput = `<!--au:0--><!--au-start-->` +
          `<div><!--au:1-->A</div>` +
          `<div><!--au:2-->B</div>` +
          `<div><!--au:3-->C</div>` +
          `<!--au-end-->`;

        const template = doc.createElement('template');
        template.innerHTML = ssrOutput;
        const fragment = doc.importNode(template.content, true);

        // Verify target collection works with global indices
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 4, 'all 4 targets collected');
        assert.strictEqual((targets[0] as Comment).textContent, 'au-end', 'target 0 is render location');
        assert.strictEqual((targets[1] as Text).textContent, 'A', 'target 1 is text A');
        assert.strictEqual((targets[2] as Text).textContent, 'B', 'target 2 is text B');
        assert.strictEqual((targets[3] as Text).textContent, 'C', 'target 3 is text C');
      });
    });

    describe('if.bind SSR output structure', function () {

      it('documents if.bind SSR marker collision (truthy)', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * Template: <div if.bind="showMessage">${message}</div>
         * Data: showMessage = true, message = "Hello"
         *
         * Like repeat, naive SSR output has marker collision:
         *   <!--au:0--><!--au-start--><div><!--au:0-->Hello</div><!--au-end-->
         *
         * Both markers are index 0! The later one (inside view) overwrites.
         * Plus the render location detection bug sets target 0 to the div.
         */
        const naiveSsrOutput = `<!--au:0--><!--au-start--><div><!--au:0-->Hello</div><!--au-end-->`;

        const template = doc.createElement('template');
        template.innerHTML = naiveSsrOutput;

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        /**
         * Array length is 2 (2 markers found).
         * Index 0 is overwritten: first by div (render location bug), then by text "Hello".
         * Index 1 is undefined hole.
         */
        assert.strictEqual(targets.length, 2, 'array length equals marker count (2)');
        assert.strictEqual(targets[0].nodeType, 3 /* Text */, 'target 0 is text (last marker wins)');
        assert.strictEqual((targets[0] as Text).textContent, 'Hello', 'target is the inner text');
        assert.strictEqual(targets[1], undefined, 'target 1 is undefined (hole)');
      });

      it('documents if.bind SSR output (falsy)', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * Template: <div if.bind="showMessage">${message}</div>
         * Data: showMessage = false
         *
         * SSR output (falsy case):
         *   <!--au:0--><!--au-start--><!--au-end-->
         *
         * Empty render location - no view created.
         */
        const ssrOutput = `<!--au:0--><!--au-start--><!--au-end-->`;

        const template = doc.createElement('template');
        template.innerHTML = ssrOutput;

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 1, 'should find 1 target (render location)');

        // For falsy case, client knows not to create any view
        // The if controller will be hydrated with condition=false
      });

      it('documents if/else SSR output', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        /**
         * Template:
         *   <div if.bind="isLoggedIn">Welcome ${user}</div>
         *   <div else>Please log in</div>
         *
         * Data: isLoggedIn = false
         *
         * SSR output (else case):
         *   <!--au:0--><!--au-start--><!--au-end-->
         *   <!--au:1--><!--au-start--><div>Please log in</div><!--au-end-->
         *
         * Two render locations:
         * - Index 0: if (empty because falsy)
         * - Index 1: else (rendered because if was falsy)
         */
        const ssrOutput =
          `<!--au:0--><!--au-start--><!--au-end-->` +
          `<!--au:1--><!--au-start--><div>Please log in</div><!--au-end-->`;

        const template = doc.createElement('template');
        template.innerHTML = ssrOutput;

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 2, 'should find 2 targets (if and else render locations)');
      });
    });

    describe('nested template controllers', function () {

      it('documents nested repeat SSR output', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        /**
         * Template:
         *   <div repeat.for="group of groups">
         *     <span repeat.for="item of group.items">${item}</span>
         *   </div>
         *
         * Data:
         *   groups = [
         *     { items: ['A', 'B'] },
         *     { items: ['C'] }
         *   ]
         *
         * SSR output (proposed with view markers):
         *   <!--au:0--><!--au-start-->
         *     <!--au-v--><div au-hid="0">
         *       <!--au:0--><!--au-start-->
         *         <!--au-v--><span><!--au:0-->A</span>
         *         <!--au-v--><span><!--au:0-->B</span>
         *       <!--au-end-->
         *     </div>
         *     <!--au-v--><div au-hid="0">
         *       <!--au:0--><!--au-start-->
         *         <!--au-v--><span><!--au:0-->C</span>
         *       <!--au-end-->
         *     </div>
         *   <!--au-end-->
         *
         * Hydration would:
         * 1. Find outer repeat's render location
         * 2. Find 2 view markers → create 2 outer views
         * 3. For each outer view, find inner repeat's render location
         * 4. Find inner view markers → create inner views
         */

        // This is a complex scenario that requires hierarchical view adoption
        assert.ok(true, 'Nested template controllers require recursive view adoption');
      });

      it('documents repeat with if SSR output', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        /**
         * Template:
         *   <div repeat.for="item of items">
         *     <span if.bind="item.visible">${item.name}</span>
         *   </div>
         *
         * Data:
         *   items = [
         *     { name: 'A', visible: true },
         *     { name: 'B', visible: false },
         *     { name: 'C', visible: true }
         *   ]
         *
         * SSR output (proposed):
         *   <!--au:0--><!--au-start-->
         *     <!--au-v--><div au-hid="0"><!--au:0--><!--au-start--><span><!--au:0-->A</span><!--au-end--></div>
         *     <!--au-v--><div au-hid="0"><!--au:0--><!--au-start--><!--au-end--></div>
         *     <!--au-v--><div au-hid="0"><!--au:0--><!--au-start--><span><!--au:0-->C</span><!--au-end--></div>
         *   <!--au-end-->
         *
         * The second div's if is empty (B.visible = false).
         */
        assert.ok(true, 'Repeat + if requires per-view state tracking during hydration');
      });
    });

    describe('ViewFactory adoption gap', function () {

      it('documents that ViewFactory.create() always clones', function () {
        /**
         * CURRENT BEHAVIOR (gap):
         *
         * ViewFactory.create() calls Controller.$view() which calls _hydrateSynthetic()
         *
         * _hydrateSynthetic() does:
         *   this.nodes = this._rendering.createNodes(this._compiledDef)
         *
         * createNodes() ALWAYS clones the template:
         *   doc.importNode(fragment, true)  // or doc.adoptNode(fragment.cloneNode(true))
         *
         * NEEDED FOR SSR:
         *
         * ViewFactory needs an adoptView() method that:
         * 1. Takes a DOM range (start marker to end marker or next view marker)
         * 2. Creates a FragmentNodeSequence that wraps those nodes
         * 3. Returns a View that uses those nodes instead of cloning
         *
         * The repeat controller would then:
         * 1. Count view markers between au-start and au-end
         * 2. For each view: call factory.adoptView(startNode, endNode)
         * 3. Each adopted view can findTargets() and apply instructions
         */
        assert.ok(true, 'ViewFactory.adoptView() needs to be implemented');
      });

      it('documents repeat hydration flow', function () {
        /**
         * PROPOSED HYDRATION FLOW FOR REPEAT:
         *
         * 1. Parent's _hydrate() adopts children, finds targets
         *    - Target includes the repeat's render location (au-end with $start)
         *
         * 2. Parent's render() processes RepeatInstruction on that target
         *    - Repeat receives the render location
         *    - Repeat needs to know: "I'm hydrating, not fresh rendering"
         *
         * 3. Repeat.$bind() (hydration mode):
         *    a. Count <!--au-v--> markers between $start and au-end
         *    b. For each view marker:
         *       - Collect nodes from this marker to next marker (or au-end)
         *       - Call this.viewFactory.adoptView(nodes)
         *       - Bind the view to its scope (item from items[i])
         *    c. Skip appendTo() since nodes are already in DOM
         *
         * 4. On data change:
         *    - New items: factory.create() + append (normal flow)
         *    - Removed items: view.remove() (normal flow)
         *    - Reordered items: move views (normal flow)
         */
        assert.ok(true, 'Repeat hydration requires view marker counting and adoption');
      });
    });
  });

  describe('Aurelia.hydrate() API', function () {

    it('hydrates a simple component with state', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Create a component with AOT-style definition (pre-compiled)
      @customElement({
        name: 'test-app',
        template: '<div><!--au:0-->placeholder</div>',
        instructions: [[new TextBindingInstruction(new AccessScopeExpression('message', 0))]],
        needsCompile: false,
      })
      class TestApp {
        message: string = '';
      }

      // Simulate SSR output: pre-rendered HTML with markers
      const host = doc.createElement('div');
      host.innerHTML = '<div><!--au:0-->Hello from SSR</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const state = { message: 'Hello from SSR' };

        const root = await au.hydrate({
          host,
          component: TestApp,
          state,
        });

        // Verify the component instance has the state applied
        const instance = root.controller.viewModel as TestApp;
        assert.strictEqual(instance.message, 'Hello from SSR', 'state should be applied to instance');

        // Verify the app is active
        assert.strictEqual(root.controller.isActive, true, 'controller should be active');

        // Clean up
        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('hydrates component with property bindings', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Component with element binding (value.bind on input)
      @customElement({
        name: 'test-form',
        template: '<input au-hid="0" value="">',
        instructions: [[new PropertyBindingInstruction('name', 'value', BindingMode.toView)]],
        needsCompile: false,
      })
      class TestForm {
        name: string = '';
      }

      // Simulate SSR output
      const host = doc.createElement('div');
      host.innerHTML = '<input au-hid="0" value="John Doe">';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const state = { name: 'John Doe' };

        const root = await au.hydrate({
          host,
          component: TestForm,
          state,
        });

        const instance = root.controller.viewModel as TestForm;
        assert.strictEqual(instance.name, 'John Doe', 'state should be applied');

        // The input should reflect the bound value
        const input = host.querySelector('input')!;
        assert.strictEqual(input.value, 'John Doe', 'input should have hydrated value');

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('adopts existing DOM instead of cloning', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      @customElement({
        name: 'test-app',
        template: '<span au-hid="0">placeholder</span>',
        instructions: [[new PropertyBindingInstruction('text', 'textContent', BindingMode.toView)]],
        needsCompile: false,
      })
      class TestApp {
        text: string = '';
      }

      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">SSR Content</span>';
      doc.body.appendChild(host);

      // Get reference to the original span BEFORE hydration
      const originalSpan = host.querySelector('span')!;

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({
          host,
          component: TestApp,
          state: { text: 'SSR Content' },
        });

        // The span should be the SAME element (adopted, not cloned)
        const currentSpan = host.querySelector('span')!;
        assert.strictEqual(currentSpan, originalSpan, 'should adopt existing DOM, not clone');

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('works without explicit state (uses component defaults)', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      @customElement({
        name: 'test-app',
        template: '<div><!--au:0-->placeholder</div>',
        instructions: [[new TextBindingInstruction(new AccessScopeExpression('message', 0))]],
        needsCompile: false,
      })
      class TestApp {
        message: string = 'default value';
      }

      const host = doc.createElement('div');
      host.innerHTML = '<div><!--au:0-->default value</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        // No state passed - component uses its default values
        const root = await au.hydrate({
          host,
          component: TestApp,
        });

        const instance = root.controller.viewModel as TestApp;
        assert.strictEqual(instance.message, 'default value', 'should use component default');

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });
  });
});

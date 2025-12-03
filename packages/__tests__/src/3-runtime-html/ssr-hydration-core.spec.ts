/**
 * SSR Hydration - Core/Low-Level Tests
 *
 * Tests for the low-level building blocks of SSR hydration:
 * - FragmentNodeSequence target collection from marked DOM
 * - adoptChildren() and adoptNodes() APIs
 * - Marker processing (au-hid, au:N, au-start/au-end)
 *
 * For higher-level hydration scenarios, see:
 * - ssr-hydration-initial.spec.ts (initial hydration)
 * - ssr-hydration-reactive.spec.ts (mutations/reactivity)
 * - ssr-hydration-lifecycle.spec.ts (lifecycle hooks)
 */

import {
  IPlatform,
  IRendering,
  FragmentNodeSequence,
} from '@aurelia/runtime-html';
import {
  PropertyBindingInstruction,
  IInstruction,
  TextBindingInstruction,
  BindingMode,
} from '@aurelia/template-compiler';
import { createAccessScopeExpression } from '@aurelia/expression-parser';
import { assert, TestContext } from '@aurelia/testing';

import { describeTargets, isRenderLocation } from './ssr-hydration.helpers.js';

describe('3-runtime-html/ssr-hydration-core.spec.ts', function () {

  // ============================================================================
  // FragmentNodeSequence Target Collection
  // ============================================================================

  describe('FragmentNodeSequence target collection', function () {

    describe('Element targets (au-hid attribute)', function () {

      it('collects single element target', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<div au-hid="0">Hello</div>';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'element', tag: 'DIV' },
        ]);
      });

      it('collects multiple element targets in order', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<div au-hid="0">First</div><span au-hid="1">Second</span>';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'element', tag: 'DIV' },
          { type: 'element', tag: 'SPAN' },
        ]);
      });

      it('removes au-hid attribute after collection', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<div au-hid="0">Hello</div>';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual((targets[0] as Element).hasAttribute('au-hid'), false);
      });

      it('handles nested elements with markers', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<div au-hid="0"><span au-hid="1">Nested</span></div>';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'element', tag: 'DIV' },
          { type: 'element', tag: 'SPAN' },
        ]);
      });
    });

    describe('Comment targets (<!--au:N--> marker)', function () {

      it('collects text node following comment marker', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<!--au:0-->Hello World';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'text', text: 'Hello World' },
        ]);
      });

      it('collects text nodes for multiple comment markers', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<div><!--au:0-->A</div><span><!--au:1-->B</span>';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'text', text: 'A' },
          { type: 'text', text: 'B' },
        ]);
      });
    });

    describe('Render location markers (au-start/au-end)', function () {

      it('collects render location with $start reference', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 1);
        assert.strictEqual(isRenderLocation(targets[0]), true);
        assert.strictEqual(((targets[0] as any).$start as Comment).textContent, 'au-start');
      });

      it('collects render location with content between markers', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        const template = doc.createElement('template');
        template.innerHTML = '<!--au:0--><!--au-start--><div>Content</div><!--au-end-->';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.strictEqual(targets.length, 1);
        assert.strictEqual(isRenderLocation(targets[0]), true);
      });
    });

    describe('Mixed targets', function () {

      it('collects mixed element and comment targets in index order', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        // Index 0: div element
        // Index 1: text node (via comment)
        // Index 2: span element
        const template = doc.createElement('template');
        template.innerHTML = '<div au-hid="0">Static</div><!--au:1-->Dynamic<span au-hid="2">End</span>';

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'element', tag: 'DIV' },
          { type: 'text', text: 'Dynamic' },
          { type: 'element', tag: 'SPAN' },
        ]);
      });

      it('collects all targets with global indices for nested controllers', function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;
        const platform = ctx.container.get(IPlatform);

        // Simulates nested repeat with if:
        // outer repeat at 0, div at 1, inner if at 2, span at 3, text at 4
        const template = doc.createElement('template');
        template.innerHTML =
          `<!--au:0--><!--au-start-->` +
            `<div au-hid="1">` +
              `<!--au:2--><!--au-start-->` +
                `<span au-hid="3"><!--au:4-->Hello</span>` +
              `<!--au-end-->` +
            `</div>` +
          `<!--au-end-->`;

        const fragment = doc.importNode(template.content, true);
        const seq = new FragmentNodeSequence(platform, fragment);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'comment', text: 'au-end' },  // outer render location
          { type: 'element', tag: 'DIV' },
          { type: 'comment', text: 'au-end' },  // inner render location
          { type: 'element', tag: 'SPAN' },
          { type: 'text', text: 'Hello' },
        ]);

        // Verify render locations have $start
        assert.strictEqual(isRenderLocation(targets[0]), true);
        assert.strictEqual(isRenderLocation(targets[2]), true);
      });
    });
  });

  // ============================================================================
  // FragmentNodeSequence.adoptChildren() API
  // ============================================================================

  describe('FragmentNodeSequence.adoptChildren()', function () {

    it('adopts existing DOM children without moving them', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">Hello</span><!--au:1-->World';
      doc.body.appendChild(host);

      try {
        const originalFirstChild = host.firstChild;
        const originalChildCount = host.childNodes.length;

        const seq = FragmentNodeSequence.adoptChildren(platform, host);

        // Children should stay in the host (only marker comment removed)
        assert.strictEqual(host.firstChild, originalFirstChild);
        assert.strictEqual(host.childNodes.length, originalChildCount - 1);

        // Targets should be found correctly
        const targets = seq.findTargets();
        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'element', tag: 'SPAN' },
          { type: 'text', text: 'World' },
        ]);

        // Sequence should report as mounted
        assert.strictEqual(seq.firstChild, host.firstChild);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('remove() moves adopted nodes to internal fragment', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">Content</span>';
      doc.body.appendChild(host);

      try {
        const originalSpan = host.firstChild;
        const seq = FragmentNodeSequence.adoptChildren(platform, host);

        seq.remove();

        assert.strictEqual(host.childNodes.length, 0, 'host should be empty after remove');
        assert.strictEqual(seq.firstChild, originalSpan, 'sequence should still reference the span');
      } finally {
        doc.body.removeChild(host);
      }
    });
  });

  // ============================================================================
  // IRendering.adoptNodes() API
  // ============================================================================

  describe('IRendering.adoptNodes()', function () {

    it('adopts nodes via the rendering service', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const rendering = ctx.container.get(IRendering);

      const host = doc.createElement('div');
      host.innerHTML = '<div au-hid="0">Hello</div><!--au:1-->World';
      doc.body.appendChild(host);

      try {
        const seq = rendering.adoptNodes(host);
        const targets = seq.findTargets();

        assert.deepStrictEqual(describeTargets(targets), [
          { type: 'element', tag: 'DIV' },
          { type: 'text', text: 'World' },
        ]);
      } finally {
        doc.body.removeChild(host);
      }
    });
  });

  // ============================================================================
  // SSR Hydration Contract Validation
  // ============================================================================

  describe('SSR hydration contract validation', function () {

    it('validates marker-instruction alignment for text bindings', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Template: <div>${a}</div><span>${b}</span>
      // SSR output: <div><!--au:0-->A</div><span><!--au:1-->B</span>
      const template = doc.createElement('template');
      template.innerHTML = '<div><!--au:0-->A</div><span><!--au:1-->B</span>';

      const fragment = doc.importNode(template.content, true);
      const seq = new FragmentNodeSequence(platform, fragment);
      const targets = seq.findTargets();

      const instructions: IInstruction[][] = [
        [new TextBindingInstruction(createAccessScopeExpression('a', 0))],
        [new TextBindingInstruction(createAccessScopeExpression('b', 0))],
      ];

      assert.strictEqual(targets.length, instructions.length, 'targets and instructions should align');
    });

    it('validates marker-instruction alignment for property bindings', function () {
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

      const instructions: IInstruction[][] = [
        [new PropertyBindingInstruction('name', 'value', BindingMode.toView)],
      ];

      assert.strictEqual(targets.length, 1);
      assert.deepStrictEqual(describeTargets(targets), [
        { type: 'element', tag: 'INPUT' },
      ]);
      assert.strictEqual((targets[0] as HTMLInputElement).value, 'John');
    });
  });

  // ============================================================================
  // Path-Based Element Target Resolution
  // ============================================================================

  describe('Path-based element target resolution', function () {

    it('resolves element targets using manifest paths instead of au-hid', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // HTML without au-hid attributes (as sent by SSR server to client)
      const parent = doc.createElement('div');
      parent.innerHTML = '<span>Hello</span><div><input value="John"></div>';

      // Manifest with element paths computed post-render
      const manifest = {
        targetCount: 2,
        controllers: {},
        elementPaths: {
          0: [0],      // root.children[0] = <span>
          1: [1, 0],   // root.children[1].children[0] = <input>
        }
      };

      const seq = FragmentNodeSequence.adoptChildren(platform, parent, manifest);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 2);
      assert.deepStrictEqual(describeTargets(targets), [
        { type: 'element', tag: 'SPAN' },
        { type: 'element', tag: 'INPUT' },
      ]);
    });

    it('handles empty path (root element itself)', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // Parent with single child that is the target
      const parent = doc.createElement('div');
      parent.innerHTML = '<span>Content</span>';

      const manifest = {
        targetCount: 1,
        controllers: {},
        elementPaths: {
          0: [0],  // root.children[0] = <span>
        }
      };

      const seq = FragmentNodeSequence.adoptChildren(platform, parent, manifest);
      const targets = seq.findTargets();

      assert.strictEqual(targets.length, 1);
      assert.strictEqual((targets[0] as Element).tagName, 'SPAN');
    });

    it('combines path-based elements with comment markers', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;
      const platform = ctx.container.get(IPlatform);

      // HTML with comment markers but no au-hid (path-based for elements)
      const parent = doc.createElement('div');
      parent.innerHTML = '<span><!--au:1-->Hello</span>';

      const manifest = {
        targetCount: 2,
        controllers: {},
        elementPaths: {
          0: [0],  // <span> element
        }
      };

      const seq = FragmentNodeSequence.adoptChildren(platform, parent, manifest);
      const targets = seq.findTargets();

      // Target 0 = <span> (from path)
      // Target 1 = text node "Hello" (from comment marker)
      assert.strictEqual(targets.length, 2);
      assert.strictEqual((targets[0] as Element).tagName, 'SPAN');
      assert.strictEqual((targets[1] as Text).nodeType, 3 /* Text */);
      assert.strictEqual((targets[1] as Text).textContent, 'Hello');
    });
  });

  // ============================================================================
  // SSR Post-Render Processing
  // ============================================================================

  describe('SSR post-render processing', function () {
    // Import dynamically to avoid bundling issues in test environment
    let processSSROutput: typeof import('@aurelia/runtime-html').processSSROutput;
    let computeElementPath: typeof import('@aurelia/runtime-html').computeElementPath;

    before(async function () {
      const hydration = await import('@aurelia/runtime-html');
      processSSROutput = hydration.processSSROutput;
      computeElementPath = hydration.computeElementPath;
    });

    it('computes correct path for nested element', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const root = doc.createElement('div');
      root.innerHTML = '<div><span><input></span></div>';

      const input = root.querySelector('input')!;
      const path = computeElementPath(root, input);

      assert.deepStrictEqual(path, [0, 0, 0]);
    });

    it('computes correct path for sibling elements', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const root = doc.createElement('div');
      root.innerHTML = '<span>First</span><span>Second</span><span>Third</span>';

      const spans = root.querySelectorAll('span');
      assert.deepStrictEqual(computeElementPath(root, spans[0]), [0]);
      assert.deepStrictEqual(computeElementPath(root, spans[1]), [1]);
      assert.deepStrictEqual(computeElementPath(root, spans[2]), [2]);
    });

    it('strips au-hid and computes paths in processSSROutput', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">Hello</span><div au-hid="1"><input au-hid="2"></div>';

      const initialManifest = {
        targetCount: 3,
        controllers: {},
      };

      const result = processSSROutput(host, initialManifest);

      // HTML should have au-hid stripped
      assert.strictEqual(result.html.includes('au-hid'), false);
      assert.strictEqual(result.html, '<span>Hello</span><div><input></div>');

      // Manifest should have element paths
      assert.deepStrictEqual(result.manifest.elementPaths, {
        0: [0],      // <span>
        1: [1],      // <div>
        2: [1, 0],   // <input> inside <div>
      });
    });

    it('preserves comment markers in processSSROutput', function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const host = doc.createElement('div');
      host.innerHTML = '<!--au:0--><!--au-start--><span au-hid="1">Text</span><!--au-end-->';

      const initialManifest = {
        targetCount: 2,
        controllers: { 0: { type: 'repeat', views: [{ targets: [1] }] } },
      };

      const result = processSSROutput(host, initialManifest);

      // Comments should be preserved
      assert.strictEqual(result.html.includes('<!--au:0-->'), true);
      assert.strictEqual(result.html.includes('<!--au-start-->'), true);
      assert.strictEqual(result.html.includes('<!--au-end-->'), true);

      // au-hid should be stripped
      assert.strictEqual(result.html.includes('au-hid'), false);
    });
  });
});

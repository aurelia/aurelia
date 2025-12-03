/**
 * SSR Hydration - Reactive/Mutation Tests
 *
 * Tests for post-hydration behavior - what happens when state changes after
 * initial hydration. Verifies that adopted views reconcile correctly.
 *
 * Categories:
 * - Repeat mutations (push, pop, splice, sort, replace)
 * - If mutations (toggle true/false, rapid toggles)
 * - Switch mutations (value changes between cases)
 * - Combined mutations (repeat+if, if+repeat, simultaneous changes)
 * - promise, au-compose
 *
 * For initial hydration (no mutations), see ssr-hydration-initial.spec.ts
 */

import { Aurelia } from '@aurelia/runtime-html';
import { tasksSettled } from '@aurelia/runtime';
import { IInstruction } from '@aurelia/template-compiler';
import { assert, TestContext } from '@aurelia/testing';

import {
  $, M,
  setupRepeatHydration,
  setupIfHydration,
  setupSwitchHydration,
  setupPromiseHydration,
  createViewDef,
  createParentTemplate,
  createRepeatComponent,
  createIfComponent,
  texts,
  text,
  count,
} from './ssr-hydration.helpers.js';

describe('3-runtime-html/ssr-hydration-reactive.spec.ts', function () {

  // ============================================================================
  // Repeat Mutations
  // ============================================================================

  describe('Repeat mutations', function () {

    // Shared view config for most mutation tests
    const simpleViewHtml = '<div><!--au:0--> </div>';
    const simpleViewInstr = [[$.text('item.name')]];

    describe('Adding items', function () {

      it('handles push', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>'],
          items: [{ name: 'A' }, { name: 'B' }],
          manifest: M.repeat(2, 1),
        });

        try {
          assert.strictEqual(count(setup.host, 'div'), 2);
          setup.instance.items.push({ name: 'C' });
          assert.deepStrictEqual(texts(setup.host, 'div'), ['A', 'B', 'C']);
        } finally {
          await setup.stop();
        }
      });

      it('handles unshift', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->B</div>', '<div><!--au:2-->C</div>'],
          items: [{ name: 'B' }, { name: 'C' }],
          manifest: M.repeat(2, 1),
        });

        try {
          setup.instance.items.unshift({ name: 'A' });
          assert.deepStrictEqual(texts(setup.host, 'div'), ['A', 'B', 'C']);
        } finally {
          await setup.stop();
        }
      });

      it('handles splice insert at middle', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->C</div>'],
          items: [{ name: 'A' }, { name: 'C' }],
          manifest: M.repeat(2, 1),
        });

        try {
          setup.instance.items.splice(1, 0, { name: 'B' });
          assert.deepStrictEqual(texts(setup.host, 'div'), ['A', 'B', 'C']);
        } finally {
          await setup.stop();
        }
      });

      it('handles adding multiple items at once', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>'],
          items: [{ name: 'A' }],
          manifest: M.repeat([[1]]),
        });

        try {
          setup.instance.items.push({ name: 'B' }, { name: 'C' }, { name: 'D' });
          assert.strictEqual(count(setup.host, 'div'), 4);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Removing items', function () {

      it('handles pop', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>', '<div><!--au:3-->C</div>'],
          items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
          manifest: M.repeat(3, 1),
        });

        try {
          setup.instance.items.pop();
          assert.deepStrictEqual(texts(setup.host, 'div'), ['A', 'B']);
        } finally {
          await setup.stop();
        }
      });

      it('handles shift', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>', '<div><!--au:3-->C</div>'],
          items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
          manifest: M.repeat(3, 1),
        });

        try {
          setup.instance.items.shift();
          assert.deepStrictEqual(texts(setup.host, 'div'), ['B', 'C']);
        } finally {
          await setup.stop();
        }
      });

      it('handles splice remove at middle', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>', '<div><!--au:3-->C</div>'],
          items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
          manifest: M.repeat(3, 1),
        });

        try {
          setup.instance.items.splice(1, 1);
          assert.deepStrictEqual(texts(setup.host, 'div'), ['A', 'C']);
        } finally {
          await setup.stop();
        }
      });

      it('handles removing all items', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>'],
          items: [{ name: 'A' }, { name: 'B' }],
          manifest: M.repeat([[1], [2]]),
        });

        try {
          setup.instance.items.splice(0);
          assert.strictEqual(count(setup.host, 'div'), 0);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Reordering items', function () {

      it('handles reverse', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>', '<div><!--au:3-->C</div>'],
          items: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
          manifest: M.repeat(3, 1),
        });

        try {
          setup.instance.items.reverse();
          assert.deepStrictEqual(texts(setup.host, 'div'), ['C', 'B', 'A']);
        } finally {
          await setup.stop();
        }
      });

      it('handles sort', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->C</div>', '<div><!--au:2-->A</div>', '<div><!--au:3-->B</div>'],
          items: [{ name: 'C' }, { name: 'A' }, { name: 'B' }],
          manifest: M.repeat([[1], [2], [3]]),
        });

        try {
          setup.instance.items.sort((a, b) => a.name.localeCompare(b.name));
          assert.deepStrictEqual(texts(setup.host, 'div'), ['A', 'B', 'C']);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Replacing items', function () {

      it('handles complete array replacement', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>'],
          items: [{ name: 'A' }, { name: 'B' }],
          manifest: M.repeat([[1], [2]]),
        });

        try {
          setup.instance.items = [{ name: 'X' }, { name: 'Y' }, { name: 'Z' }];
          assert.deepStrictEqual(texts(setup.host, 'div'), ['X', 'Y', 'Z']);
        } finally {
          await setup.stop();
        }
      });

      it('handles clear then repopulate', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: simpleViewHtml,
          viewInstructions: simpleViewInstr,
          ssrViewsHtml: ['<div><!--au:1-->A</div>', '<div><!--au:2-->B</div>'],
          items: [{ name: 'A' }, { name: 'B' }],
          manifest: M.repeat([[1], [2]]),
        });

        try {
          setup.instance.items.splice(0);
          assert.strictEqual(count(setup.host, 'div'), 0);
          setup.instance.items.push({ name: 'New1' }, { name: 'New2' });
          assert.deepStrictEqual(texts(setup.host, 'div'), ['New1', 'New2']);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Multi-root view mutations', function () {

      it('handles push on multi-root views', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<b><!--au:0--> </b><i><!--au:1--> </i>',
          viewInstructions: [[$.text('item.a')], [$.text('item.b')]],
          ssrViewsHtml: ['<b><!--au:1-->X</b><i><!--au:2-->1</i>'],
          items: [{ a: 'X', b: '1' }],
          manifest: M.repeat([[1, 2]], { nodeCount: 2 }),
        });

        try {
          setup.instance.items.push({ a: 'Y', b: '2' });
          assert.deepStrictEqual(texts(setup.host, 'b'), ['X', 'Y']);
          assert.deepStrictEqual(texts(setup.host, 'i'), ['1', '2']);
        } finally {
          await setup.stop();
        }
      });

      it('handles pop on multi-root views', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<b><!--au:0--> </b><i><!--au:1--> </i>',
          viewInstructions: [[$.text('item.a')], [$.text('item.b')]],
          ssrViewsHtml: ['<b><!--au:1-->X</b><i><!--au:2-->1</i>', '<b><!--au:3-->Y</b><i><!--au:4-->2</i>'],
          items: [{ a: 'X', b: '1' }, { a: 'Y', b: '2' }],
          manifest: M.repeat([[1, 2], [3, 4]], { nodeCount: 2 }),
        });

        try {
          setup.instance.items.pop();
          assert.strictEqual(count(setup.host, 'b'), 1);
          assert.strictEqual(count(setup.host, 'i'), 1);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Edge cases', function () {

      it('handles adding to initially empty repeat', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const viewDef = createViewDef(doc, '<div><!--au:0--> </div>', [[$.text('item.name')]]);
        const repeatInstruction = $.repeat(viewDef, 'item of items');
        const parentTemplate = createParentTemplate(doc);
        const TestApp = createRepeatComponent(parentTemplate, repeatInstruction, [] as { name: string }[]);

        const host = doc.createElement('div');
        host.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { items: [] },
            manifest: { targetCount: 1, controllers: { 0: { type: 'repeat', views: [] } } }
          });

          const instance = root.controller.viewModel as { items: { name: string }[] };
          assert.strictEqual(count(host, 'div'), 0);

          instance.items.push({ name: 'First' });
          assert.deepStrictEqual(texts(host, 'div'), ['First']);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      it.skip('handles rapid successive mutations', async function () {
        // push, pop, push, shift, unshift in quick succession
        // Verify final state is correct
      });
    });
  });

  // ============================================================================
  // If Mutations
  // ============================================================================

  describe('If mutations', function () {

    describe('Toggle true to false', function () {

      it('removes view when toggling true -> false', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<div>Content</div>',
          viewInstructions: [[]],
          show: true,
          ssrViewHtml: '<div>Content</div>',
          viewTargets: [],
        });

        try {
          assert.strictEqual(count(setup.host, 'div'), 1);
          setup.instance.show = false;
          await Promise.resolve();
          assert.strictEqual(count(setup.host, 'div'), 0);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Toggle false to true', function () {

      it('creates view when toggling false -> true', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<div>Content</div>',
          viewInstructions: [[]],
          show: false,
          ssrViewHtml: '',
          viewTargets: [],
        });

        try {
          assert.strictEqual(count(setup.host, 'div'), 0);
          setup.instance.show = true;
          await Promise.resolve();
          assert.strictEqual(count(setup.host, 'div'), 1);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Multiple toggles', function () {

      it('handles rapid toggles', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<span>Toggle</span>',
          viewInstructions: [[]],
          show: true,
          ssrViewHtml: '<span>Toggle</span>',
          viewTargets: [],
        });

        try {
          setup.instance.show = false;
          await Promise.resolve();
          setup.instance.show = true;
          await Promise.resolve();
          setup.instance.show = false;
          await Promise.resolve();
          assert.strictEqual(count(setup.host, 'span'), 0);
        } finally {
          await setup.stop();
        }
      });

      it('handles toggle back to original state', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<p>Paragraph</p>',
          viewInstructions: [[]],
          show: true,
          ssrViewHtml: '<p>Paragraph</p>',
          viewTargets: [],
        });

        try {
          assert.strictEqual(count(setup.host, 'p'), 1);
          setup.instance.show = false;
          await Promise.resolve();
          assert.strictEqual(count(setup.host, 'p'), 0);
          setup.instance.show = true;
          await Promise.resolve();
          assert.strictEqual(count(setup.host, 'p'), 1);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Bindings after toggle', function () {

      it('maintains bindings after hide/show cycle', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const viewDef = createViewDef(doc, '<span><!--au:0--> </span>', [[$.text('message')]]);
        const ifInstruction = $.if(viewDef, 'show');
        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[ifInstruction]],
            needsCompile: false,
          };
          show = true;
          message = '';
        }

        const host = doc.createElement('div');
        host.innerHTML = '<!--au:0--><!--au-start--><span><!--au:1-->Initial</span><!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { show: true, message: 'Initial' },
            manifest: M.if(true, [1]),
          });

          const instance = root.controller.viewModel as TestApp;

          // Hide, update message, show
          instance.show = false;
          await Promise.resolve();
          instance.message = 'Updated';
          instance.show = true;
          await Promise.resolve();

          assert.strictEqual(text(host, 'span'), 'Updated');
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });

    describe('Multi-node view mutations', function () {

      it('removes multi-node view on toggle false', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<b>Bold</b><i>Italic</i>',
          viewInstructions: [[]],
          show: true,
          ssrViewHtml: '<b>Bold</b><i>Italic</i>',
          viewTargets: [],
          nodeCount: 2,
        });

        try {
          assert.strictEqual(count(setup.host, 'b'), 1);
          assert.strictEqual(count(setup.host, 'i'), 1);
          setup.instance.show = false;
          await Promise.resolve();
          assert.strictEqual(count(setup.host, 'b'), 0);
          assert.strictEqual(count(setup.host, 'i'), 0);
        } finally {
          await setup.stop();
        }
      });
    });
  });

  // ============================================================================
  // Combined Mutations (Repeat + If)
  // ============================================================================

  describe('Combined mutations', function () {

    describe('Repeat containing If', function () {

      it('handles if toggle inside repeat item', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const ifViewDef = createViewDef(doc, '<span><!--au:0--> </span>', [[$.text('item.name')]]);
        const ifInstruction = $.if(ifViewDef, 'item.visible');

        const repeatViewTemplate = doc.createElement('template');
        repeatViewTemplate.innerHTML = '<div><!--au:0--><!--au-start--><!--au-end--></div>';
        const repeatViewDef = {
          name: 'repeat-view',
          type: 'custom-element' as const,
          template: repeatViewTemplate,
          instructions: [[ifInstruction]] as IInstruction[][],
          needsCompile: false as const,
        };

        const repeatInstruction = $.repeat(repeatViewDef, 'item of items');
        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[repeatInstruction]],
            needsCompile: false,
          };
          items: { name: string; visible: boolean }[] = [];
        }

        const host = doc.createElement('div');
        host.innerHTML = [
          '<!--au:0--><!--au-start-->',
          '<div><!--au:1--><!--au-start--><span><!--au:2-->Alice</span><!--au-end--></div>',
          '<div><!--au:3--><!--au-start--><!--au-end--></div>',
          '<div><!--au:4--><!--au-start--><span><!--au:5-->Carol</span><!--au-end--></div>',
          '<!--au-end-->'
        ].join('');
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: {
              items: [
                { name: 'Alice', visible: true },
                { name: 'Bob', visible: false },
                { name: 'Carol', visible: true }
              ]
            },
            manifest: {
              targetCount: 6,
              controllers: {
                0: { type: 'repeat', views: [{ targets: [1] }, { targets: [3] }, { targets: [4] }] },
                1: { type: 'if', views: [{ targets: [2] }] },
                3: { type: 'if', views: [] },
                4: { type: 'if', views: [{ targets: [5] }] }
              }
            }
          });

          const instance = root.controller.viewModel as TestApp;

          assert.strictEqual(count(host, 'span'), 2);

          // Toggle Bob's visibility on
          instance.items[1].visible = true;
          await Promise.resolve();
          assert.strictEqual(count(host, 'span'), 3);

          // Toggle Alice's visibility off
          instance.items[0].visible = false;
          await Promise.resolve();
          assert.strictEqual(count(host, 'span'), 2);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      it('handles repeat item removal while if is visible', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const ifViewDef = createViewDef(doc, '<span>Active</span>', []);
        const ifInstruction = $.if(ifViewDef, 'item.active');

        const repeatViewTemplate = doc.createElement('template');
        repeatViewTemplate.innerHTML = '<li><!--au:0--><!--au-start--><!--au-end--></li>';
        const repeatViewDef = {
          name: 'repeat-view',
          type: 'custom-element' as const,
          template: repeatViewTemplate,
          instructions: [[ifInstruction]] as IInstruction[][],
          needsCompile: false as const,
        };

        const repeatInstruction = $.repeat(repeatViewDef, 'item of items');
        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[repeatInstruction]],
            needsCompile: false,
          };
          items: { active: boolean }[] = [];
        }

        const host = doc.createElement('ul');
        host.innerHTML = [
          '<!--au:0--><!--au-start-->',
          '<li><!--au:1--><!--au-start--><span>Active</span><!--au-end--></li>',
          '<li><!--au:2--><!--au-start--><span>Active</span><!--au-end--></li>',
          '<!--au-end-->'
        ].join('');
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { items: [{ active: true }, { active: true }] },
            manifest: {
              targetCount: 3,
              controllers: {
                0: { type: 'repeat', views: [{ targets: [1] }, { targets: [2] }] },
                1: { type: 'if', views: [{ targets: [] }] },
                2: { type: 'if', views: [{ targets: [] }] }
              }
            }
          });

          const instance = root.controller.viewModel as TestApp;

          assert.strictEqual(count(host, 'li'), 2);
          assert.strictEqual(count(host, 'span'), 2);

          instance.items.shift();
          assert.strictEqual(count(host, 'li'), 1);
          assert.strictEqual(count(host, 'span'), 1);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });

    describe('If containing Repeat', function () {

      it('handles if toggle with repeat inside (show then hide)', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const repeatViewDef = createViewDef(doc, '<li><!--au:0--> </li>', [[$.text('item')]]);
        const repeatInstruction = $.repeat(repeatViewDef, 'item of items');

        const ifViewTemplate = doc.createElement('template');
        ifViewTemplate.innerHTML = '<div><ul><!--au:0--><!--au-start--><!--au-end--></ul></div>';
        const ifViewDef = {
          name: 'if-view',
          type: 'custom-element' as const,
          template: ifViewTemplate,
          instructions: [[repeatInstruction]] as IInstruction[][],
          needsCompile: false as const,
        };

        const ifInstruction = $.if(ifViewDef, 'showList');
        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[ifInstruction]],
            needsCompile: false,
          };
          showList = true;
          items: string[] = [];
        }

        const host = doc.createElement('div');
        host.innerHTML = [
          '<!--au:0--><!--au-start-->',
          '<div><ul>',
          '<!--au:1--><!--au-start-->',
          '<li><!--au:2-->A</li>',
          '<li><!--au:3-->B</li>',
          '<!--au-end-->',
          '</ul></div>',
          '<!--au-end-->'
        ].join('');
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { showList: true, items: ['A', 'B'] },
            manifest: {
              targetCount: 4,
              controllers: {
                0: { type: 'if', views: [{ targets: [1] }] },
                1: { type: 'repeat', views: [{ targets: [2] }, { targets: [3] }] }
              }
            }
          });

          const instance = root.controller.viewModel as TestApp;

          assert.strictEqual(count(host, 'li'), 2);

          // Hide the if
          instance.showList = false;
          await Promise.resolve();
          assert.strictEqual(count(host, 'div'), 0);
          assert.strictEqual(count(host, 'li'), 0);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      it('handles if toggle from false then adding items to repeat', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const repeatViewDef = createViewDef(doc, '<li><!--au:0--> </li>', [[$.text('item')]]);
        const repeatInstruction = $.repeat(repeatViewDef, 'item of items');

        const ifViewTemplate = doc.createElement('template');
        ifViewTemplate.innerHTML = '<ul><!--au:0--><!--au-start--><!--au-end--></ul>';
        const ifViewDef = {
          name: 'if-view',
          type: 'custom-element' as const,
          template: ifViewTemplate,
          instructions: [[repeatInstruction]] as IInstruction[][],
          needsCompile: false as const,
        };

        const ifInstruction = $.if(ifViewDef, 'showList');
        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[ifInstruction]],
            needsCompile: false,
          };
          showList = false;
          items: string[] = [];
        }

        const host = doc.createElement('div');
        host.innerHTML = '<!--au:0--><!--au-start--><!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { showList: false, items: [] },
            manifest: { targetCount: 1, controllers: { 0: { type: 'if', views: [] } } }
          });

          const instance = root.controller.viewModel as TestApp;

          assert.strictEqual(count(host, 'ul'), 0);

          // Show the if
          instance.showList = true;
          await Promise.resolve();
          assert.strictEqual(count(host, 'ul'), 1);
          assert.strictEqual(count(host, 'li'), 0);

          // Add items to repeat
          instance.items.push('First', 'Second');
          assert.strictEqual(count(host, 'li'), 2);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      // TODO: Fix nested Repeat inside cached If view after hide/show
      it.skip('handles if hide/show with repeat state preserved', async function () {
        // 1. Hydrate if=true with repeat items
        // 2. Hide if
        // 3. Show if
        // 4. Verify repeat items are still correct
        // 5. Add more items
      });
    });

    describe('Simultaneous mutations', function () {

      it('handles simultaneous if toggle and repeat mutation', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const ifViewDef = createViewDef(doc, '<span>Visible</span>', []);
        const ifInstruction = $.if(ifViewDef, 'item.show');

        const repeatViewTemplate = doc.createElement('template');
        repeatViewTemplate.innerHTML = '<div><!--au:0--><!--au-start--><!--au-end--></div>';
        const repeatViewDef = {
          name: 'repeat-view',
          type: 'custom-element' as const,
          template: repeatViewTemplate,
          instructions: [[ifInstruction]] as IInstruction[][],
          needsCompile: false as const,
        };

        const repeatInstruction = $.repeat(repeatViewDef, 'item of items');
        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[repeatInstruction]],
            needsCompile: false,
          };
          items: { show: boolean }[] = [];
        }

        const host = doc.createElement('div');
        host.innerHTML = [
          '<!--au:0--><!--au-start-->',
          '<div><!--au:1--><!--au-start--><span>Visible</span><!--au-end--></div>',
          '<div><!--au:2--><!--au-start--><span>Visible</span><!--au-end--></div>',
          '<!--au-end-->'
        ].join('');
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { items: [{ show: true }, { show: true }] },
            manifest: {
              targetCount: 3,
              controllers: {
                0: { type: 'repeat', views: [{ targets: [1] }, { targets: [2] }] },
                1: { type: 'if', views: [{ targets: [] }] },
                2: { type: 'if', views: [{ targets: [] }] }
              }
            }
          });

          const instance = root.controller.viewModel as TestApp;

          assert.strictEqual(count(host, 'div'), 2);
          assert.strictEqual(count(host, 'span'), 2);

          // Simultaneously: toggle first item's if AND add a new item
          instance.items[0].show = false;
          instance.items.push({ show: true });
          await Promise.resolve();

          assert.strictEqual(count(host, 'div'), 3);
          assert.strictEqual(count(host, 'span'), 2);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });
  });

  // ============================================================================
  // TDD Scaffolds for Future Reactive Features
  // ============================================================================

  describe('Switch mutations', function () {

    it('handles switch value change to different case', async function () {
      // SSR rendered with status='loading', then client changes to 'success'
      const setup = await setupSwitchHydration({
        case1: { value: 'loading', contentHtml: '<span>Loading...</span>' },
        case2: { value: 'success', contentHtml: '<span>Done!</span>' },
        status: 'loading',
      });

      try {
        // Initially shows loading case (adopted from SSR)
        assert.strictEqual(text(setup.host, 'span'), 'Loading...');
        assert.strictEqual(count(setup.host, 'span'), 1);

        // Change status to success
        setup.instance.status = 'success';
        await Promise.resolve();

        // Should now show success case (created from template)
        assert.strictEqual(text(setup.host, 'span'), 'Done!');
        assert.strictEqual(count(setup.host, 'span'), 1);
      } finally {
        await setup.stop();
      }
    });

    it('handles switch value change to unmatched (show default)', async function () {
      // SSR rendered with status='success', then client changes to 'unknown'
      const setup = await setupSwitchHydration({
        case1: { value: 'success', contentHtml: '<span>Success</span>' },
        case2: { value: 'default', contentHtml: '<span>Unknown status</span>' },
        status: 'success',
        isCase2Default: true,
      });

      try {
        // Initially shows success case (adopted from SSR)
        assert.strictEqual(text(setup.host, 'span'), 'Success');
        assert.strictEqual(count(setup.host, 'span'), 1);

        // Change status to something unmatched
        setup.instance.status = 'unknown';
        await Promise.resolve();

        // Should now show default case (created from template)
        assert.strictEqual(text(setup.host, 'span'), 'Unknown status');
        assert.strictEqual(count(setup.host, 'span'), 1);
      } finally {
        await setup.stop();
      }
    });

    it('handles rapid switch value changes', async function () {
      const setup = await setupSwitchHydration({
        case1: { value: 'a', contentHtml: '<span>A</span>' },
        case2: { value: 'b', contentHtml: '<span>B</span>' },
        status: 'a',
      });

      try {
        assert.strictEqual(text(setup.host, 'span'), 'A');

        // Rapid changes
        setup.instance.status = 'b';
        await Promise.resolve();
        setup.instance.status = 'a';
        await Promise.resolve();
        setup.instance.status = 'b';
        await Promise.resolve();

        assert.strictEqual(text(setup.host, 'span'), 'B');
        assert.strictEqual(count(setup.host, 'span'), 1);
      } finally {
        await setup.stop();
      }
    });

    it('handles switch value change back to original case', async function () {
      const setup = await setupSwitchHydration({
        case1: { value: 'loading', contentHtml: '<div>Loading...</div>' },
        case2: { value: 'success', contentHtml: '<div>Done!</div>' },
        status: 'loading',
      });

      try {
        assert.strictEqual(text(setup.host, 'div'), 'Loading...');

        // Change to success
        setup.instance.status = 'success';
        await Promise.resolve();
        assert.strictEqual(text(setup.host, 'div'), 'Done!');

        // Change back to loading
        setup.instance.status = 'loading';
        await Promise.resolve();
        assert.strictEqual(text(setup.host, 'div'), 'Loading...');
        assert.strictEqual(count(setup.host, 'div'), 1);
      } finally {
        await setup.stop();
      }
    });
  });

  describe('Promise mutations', function () {

    it('handles promise replacement (resolved -> new promise -> resolved)', async function () {
      const setup = await setupPromiseHydration<string>({
        pendingHtml: '<span>Loading...</span>',
        thenHtml: '<span><!--au:0--> </span>',
        thenInstructions: [[$.text('value')]],
        state: 'resolved',
        ssrActiveHtml: '<span><!--au:4-->Initial</span>',
        resolvedValue: 'Initial',
      });

      try {
        assert.strictEqual(text(setup.host, 'span'), 'Initial');

        let resolvePromise: (value: string) => void;
        setup.instance.dataPromise = new Promise<string>((resolve) => {
          resolvePromise = resolve;
        });

        await tasksSettled();
        assert.strictEqual(text(setup.host, 'span'), 'Loading...');

        resolvePromise!('Updated');
        await tasksSettled();
        assert.strictEqual(text(setup.host, 'span'), 'Updated');
      } finally {
        await setup.stop();
      }
    });

  });

  describe('Au-compose mutations', function () {

    it.skip('handles component swap', async function () {
      // component.bind changes from ComponentA to ComponentB
    });

    it.skip('handles model update', async function () {
      // model.bind changes, same component
    });
  });
});

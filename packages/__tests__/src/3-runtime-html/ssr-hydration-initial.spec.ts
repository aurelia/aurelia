/**
 * SSR Hydration - Initial Hydration Tests
 *
 * Tests for the initial hydration pass only - adopting SSR-rendered DOM and
 * verifying correct state without any subsequent mutations.
 *
 * Categories:
 * - Aurelia.hydrate() API
 * - Template controllers: repeat, if, switch
 * - Nested controllers (repeat in if, if in repeat, etc.)
 * - promise, portal, au-compose, custom elements, slots
 *
 * For post-hydration mutations/reactivity, see ssr-hydration-reactive.spec.ts
 */

import { Aurelia, customElement } from '@aurelia/runtime-html';
import { TextBindingInstruction, HydrateTemplateController, IteratorBindingInstruction, IInstruction } from '@aurelia/template-compiler';
import { createAccessScopeExpression, createAccessMemberExpression, createForOfStatement, createBindingIdentifier } from '@aurelia/expression-parser';
import { assert, TestContext } from '@aurelia/testing';

import {
  $, M,
  setupRepeatHydration,
  setupIfHydration,
  setupWithHydration,
  setupPromiseHydration,
  createViewDef,
  createParentTemplate,
  createRepeatComponent,
  createIfComponent,
  texts,
  text,
  count,
} from './ssr-hydration.helpers.js';

describe('3-runtime-html/ssr-hydration-initial.spec.ts', function () {

  // ============================================================================
  // Aurelia.hydrate() API
  // ============================================================================

  describe('Aurelia.hydrate() API', function () {

    it('hydrates a simple component with state', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      @customElement({
        name: 'test-app',
        template: '<div><!--au:0-->placeholder</div>',
        instructions: [[new TextBindingInstruction(createAccessScopeExpression('message', 0))]],
        needsCompile: false,
      })
      class TestApp { message: string = ''; }

      const host = doc.createElement('div');
      host.innerHTML = '<div><!--au:0-->Hello from SSR</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({ host, component: TestApp, state: { message: 'Hello from SSR' } });

        assert.strictEqual((root.controller.viewModel as TestApp).message, 'Hello from SSR');
        assert.strictEqual(root.controller.isActive, true);
        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('hydrates component with property bindings', async function () {
      const ctx = TestContext.create();
      const doc = ctx.doc;

      @customElement({
        name: 'test-form',
        template: '<input au-hid="0" value="">',
        instructions: [[$.prop('name', 'value')]],
        needsCompile: false,
      })
      class TestForm { name: string = ''; }

      const host = doc.createElement('div');
      host.innerHTML = '<input au-hid="0" value="John Doe">';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({ host, component: TestForm, state: { name: 'John Doe' } });

        assert.strictEqual((root.controller.viewModel as TestForm).name, 'John Doe');
        assert.strictEqual(host.querySelector('input')!.value, 'John Doe');
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
        instructions: [[$.prop('text', 'textContent')]],
        needsCompile: false,
      })
      class TestApp { text: string = ''; }

      const host = doc.createElement('div');
      host.innerHTML = '<span au-hid="0">SSR Content</span>';
      doc.body.appendChild(host);
      const originalSpan = host.querySelector('span')!;

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({ host, component: TestApp, state: { text: 'SSR Content' } });

        assert.strictEqual(host.querySelector('span'), originalSpan, 'should adopt existing DOM, not clone');
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
        instructions: [[new TextBindingInstruction(createAccessScopeExpression('message', 0))]],
        needsCompile: false,
      })
      class TestApp { message: string = 'default value'; }

      const host = doc.createElement('div');
      host.innerHTML = '<div><!--au:0-->default value</div>';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        const root = await au.hydrate({ host, component: TestApp });

        assert.strictEqual((root.controller.viewModel as TestApp).message, 'default value');
        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });
  });

  // ============================================================================
  // Repeat Initial Hydration
  // ============================================================================

  describe('Repeat initial hydration', function () {

    describe('Single-element views', function () {

      it('hydrates repeat with simple text binding', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<span><!--au:0--> </span>',
          viewInstructions: [[$.text('item.name')]],
          ssrViewsHtml: [
            '<span><!--au:1-->Alice</span>',
            '<span><!--au:2-->Bob</span>',
            '<span><!--au:3-->Charlie</span>',
          ],
          items: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }],
          manifest: M.repeat(3, 1),
        });

        try {
          assert.deepStrictEqual(texts(setup.host, 'span'), ['Alice', 'Bob', 'Charlie']);
        } finally {
          await setup.stop();
        }
      });

      it('hydrates repeat with element + text binding', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<li au-hid="0"><!--au:1--> </li>',
          viewInstructions: [[], [$.text('item.name')]],
          ssrViewsHtml: [
            '<li au-hid="1"><!--au:2-->Alice</li>',
            '<li au-hid="3"><!--au:4-->Bob</li>',
          ],
          items: [{ name: 'Alice' }, { name: 'Bob' }],
          manifest: M.repeat(2, 2),
          hostTag: 'ul',
        });

        try {
          assert.deepStrictEqual(texts(setup.host, 'li'), ['Alice', 'Bob']);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Multi-root views', function () {

      it('hydrates repeat with 2-node views (text + element)', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<!--au:0--> <span au-hid="1"><!--au:2--> </span>',
          viewInstructions: [[$.text('item.label')], [], [$.text('item.value')]],
          ssrViewsHtml: [
            '<!--au:1-->A: <span au-hid="2"><!--au:3-->100</span>',
            '<!--au:4-->B: <span au-hid="5"><!--au:6-->200</span>',
          ],
          items: [{ label: 'A: ', value: '100' }, { label: 'B: ', value: '200' }],
          manifest: M.repeat(2, 3, { nodeCount: 2 }),
        });

        try {
          assert.deepStrictEqual(texts(setup.host, 'span'), ['100', '200']);
        } finally {
          await setup.stop();
        }
      });

      it('hydrates repeat with 3-node views (element + text + element)', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<b><!--au:0--> </b> - <i><!--au:1--> </i>',
          viewInstructions: [[$.text('item.prefix')], [$.text('item.suffix')]],
          ssrViewsHtml: [
            '<b><!--au:1-->Hello</b> - <i><!--au:2-->World</i>',
            '<b><!--au:3-->Foo</b> - <i><!--au:4-->Bar</i>',
          ],
          items: [{ prefix: 'Hello', suffix: 'World' }, { prefix: 'Foo', suffix: 'Bar' }],
          manifest: M.repeat(2, 2, { nodeCount: 3 }),
        });

        try {
          assert.deepStrictEqual(texts(setup.host, 'b'), ['Hello', 'Foo']);
          assert.deepStrictEqual(texts(setup.host, 'i'), ['World', 'Bar']);
        } finally {
          await setup.stop();
        }
      });

      it.skip('hydrates repeat with dt/dd pairs (definition list pattern)', async function () {
        // Template: <template repeat.for="item of items"><dt>${item.term}</dt><dd>${item.definition}</dd></template>
        // 2 elements per view, common pattern for definition lists
      });
    });

    describe('Text-only views', function () {

      it('hydrates repeat with pure text interpolation', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<!--au:0--> ',
          viewInstructions: [[$.text('item.name')]],
          ssrViewsHtml: ['<!--au:1-->Alice, ', '<!--au:2-->Bob, ', '<!--au:3-->Charlie'],
          items: [{ name: 'Alice, ' }, { name: 'Bob, ' }, { name: 'Charlie' }],
          manifest: M.repeat(3, 1, { nodeCount: 1 }),
        });

        try {
          assert.ok(setup.host.textContent?.includes('Alice'), 'should contain Alice');
          assert.ok(setup.host.textContent?.includes('Bob'), 'should contain Bob');
          assert.ok(setup.host.textContent?.includes('Charlie'), 'should contain Charlie');
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Edge cases', function () {

      it('hydrates empty repeat (0 items)', async function () {
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
          await au.hydrate({
            host,
            component: TestApp,
            state: { items: [] },
            manifest: { targetCount: 1, controllers: { 0: { type: 'repeat', views: [] } } }
          });

          assert.strictEqual(count(host, 'div'), 0);
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      it('hydrates single item', async function () {
        const setup = await setupRepeatHydration({
          viewTemplateHtml: '<div><!--au:0--> </div>',
          viewInstructions: [[$.text('item.name')]],
          ssrViewsHtml: ['<div><!--au:1-->Only</div>'],
          items: [{ name: 'Only' }],
          manifest: M.repeat([[1]]),
        });

        try {
          assert.deepStrictEqual(texts(setup.host, 'div'), ['Only']);
        } finally {
          await setup.stop();
        }
      });

      it('hydrates views with no bindings (static content)', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        const viewDef = createViewDef(doc, '<li>static</li>', []);
        const repeatInstruction = $.repeat(viewDef, 'item of items');
        const parentTemplate = createParentTemplate(doc);
        const TestApp = createRepeatComponent(parentTemplate, repeatInstruction, [{}, {}, {}]);

        const host = doc.createElement('ul');
        host.innerHTML = '<!--au:0--><!--au-start--><li>static</li><li>static</li><li>static</li><!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          await au.hydrate({
            host,
            component: TestApp,
            state: { items: [{}, {}, {}] },
            manifest: { targetCount: 1, controllers: { 0: { type: 'repeat', views: [{ targets: [] }, { targets: [] }, { targets: [] }] } } }
          });

          assert.strictEqual(count(host, 'li'), 3);
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      it.skip('hydrates repeat with large item count (100+ items)', async function () {
        // Verify performance and correctness with many items
      });
    });
  });

  // ============================================================================
  // If Initial Hydration
  // ============================================================================

  describe('If initial hydration', function () {

    describe('Truthy condition', function () {

      it('hydrates if.bind=true with simple element', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<div au-hid="0">Visible</div>',
          viewInstructions: [[]],
          show: true,
          ssrViewHtml: '<div au-hid="1">Visible</div>',
          viewTargets: [1],
        });

        try {
          assert.deepStrictEqual(texts(setup.host, 'div'), ['Visible']);
        } finally {
          await setup.stop();
        }
      });

      it('hydrates if.bind=true with text binding inside', async function () {
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
        host.innerHTML = '<!--au:0--><!--au-start--><span><!--au:1-->Hello World</span><!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          await au.hydrate({
            host,
            component: TestApp,
            state: { show: true, message: 'Hello World' },
            manifest: M.if(true, [1]),
          });

          assert.strictEqual(text(host, 'span'), 'Hello World');
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });

    describe('Falsy condition', function () {

      it('hydrates if.bind=false (empty render location)', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<div>Hidden</div>',
          viewInstructions: [[]],
          show: false,
          ssrViewHtml: '',
          viewTargets: [],
        });

        try {
          assert.strictEqual(count(setup.host, 'div'), 0);
        } finally {
          await setup.stop();
        }
      });
    });

    describe('Edge cases', function () {

      it('hydrates if with multi-node view', async function () {
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
        } finally {
          await setup.stop();
        }
      });

      it('hydrates if with static content (no bindings)', async function () {
        const setup = await setupIfHydration({
          viewTemplateHtml: '<div>Static content</div>',
          viewInstructions: [],
          show: true,
          ssrViewHtml: '<div>Static content</div>',
          viewTargets: [],
        });

        try {
          assert.strictEqual(text(setup.host, 'div'), 'Static content');
        } finally {
          await setup.stop();
        }
      });

      it('hydrates else branch when if is falsy', async function () {
        // Template equivalent:
        // <div if.bind="show">If content</div>
        // <div else>Else content</div>
        // SSR: if falsy, else branch rendered
        const ctx = TestContext.create();
        const doc = ctx.doc;

        // If view definition
        const ifViewDef = createViewDef(doc, '<div>If content</div>', []);

        // Else view definition
        const elseViewDef = createViewDef(doc, '<div>Else content</div>', []);

        // Instructions: if at location 0, else at location 1
        const ifInstruction = $.if(ifViewDef, 'show');
        const elseInstruction = $.else(elseViewDef);

        // Parent template with TWO render locations
        const parentTemplate = doc.createElement('template');
        parentTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[ifInstruction], [elseInstruction]],
            needsCompile: false,
          };
          show = false;
        }

        // SSR output: if=false, so else content is at if's render location (0)
        // Else's render location (1) is empty
        const host = doc.createElement('div');
        host.innerHTML = '<!--au:0--><!--au-start--><div>Else content</div><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          const root = await au.hydrate({
            host,
            component: TestApp,
            state: { show: false },
            manifest: {
              targetCount: 2,
              controllers: {
                // If controller at target 0: else content was rendered
                0: { type: 'if', views: [{ targets: [], nodeCount: 1 }] },
                // Else controller at target 1: no content (it just provides factory to If)
                1: { type: 'else', views: [] },
              }
            },
          });
          const instance = root.controller.viewModel as TestApp;

          // Verify else content is displayed
          assert.strictEqual(text(host, 'div'), 'Else content');
          assert.strictEqual(count(host, 'div'), 1);

          // Verify reactivity: toggle to show if
          instance.show = true;
          await Promise.resolve();

          assert.strictEqual(text(host, 'div'), 'If content');
          assert.strictEqual(count(host, 'div'), 1);

          // Toggle back to else
          instance.show = false;
          await Promise.resolve();

          assert.strictEqual(text(host, 'div'), 'Else content');
          assert.strictEqual(count(host, 'div'), 1);

          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });
  });

  // ============================================================================
  // Nested Template Controllers
  // ============================================================================

  describe('Nested template controllers', function () {

    describe('Nested repeat', function () {

      it('hydrates nested repeat (groups with items)', async function () {
        const ctx = TestContext.create();
        const doc = ctx.doc;

        // Inner repeat: <li>${item}</li>
        const innerViewDef = createViewDef(doc, '<li><!--au:0--> </li>', [[new TextBindingInstruction(createAccessScopeExpression('item'))]]);
        const innerForOf = createForOfStatement(
          createBindingIdentifier('item'),
          createAccessMemberExpression(createAccessScopeExpression('group'), 'items'),
          -1
        );

        // Outer repeat view
        const outerViewTemplate = doc.createElement('template');
        outerViewTemplate.innerHTML = '<div au-hid="0"><h2><!--au:1--> </h2><ul><!--au:2--><!--au-start--><!--au-end--></ul></div>';

        const outerViewDef = {
          name: 'outer-repeat-view',
          type: 'custom-element' as const,
          template: outerViewTemplate,
          instructions: [
            [],
            [$.text('group.name')],
            [new HydrateTemplateController(innerViewDef, 'repeat', undefined, [new IteratorBindingInstruction(innerForOf, 'items', [])])]
          ],
          needsCompile: false as const,
        };

        const parentTemplate = createParentTemplate(doc);

        class TestApp {
          static $au = {
            type: 'custom-element' as const,
            name: 'test-app',
            template: parentTemplate,
            instructions: [[new HydrateTemplateController(outerViewDef as any, 'repeat', undefined, [new IteratorBindingInstruction('group of groups', 'items', [])])]],
            needsCompile: false,
          };
          groups: { name: string; items: string[] }[] = [];
        }

        const host = doc.createElement('div');
        host.innerHTML =
          '<!--au:0--><!--au-start-->' +
          '<div au-hid="1"><h2><!--au:2-->Fruits</h2><ul><!--au:3--><!--au-start--><li><!--au:4-->Apple</li><li><!--au:5-->Banana</li><!--au-end--></ul></div>' +
          '<div au-hid="6"><h2><!--au:7-->Veggies</h2><ul><!--au:8--><!--au-start--><li><!--au:9-->Carrot</li><!--au-end--></ul></div>' +
          '<!--au-end-->';
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          await au.hydrate({
            host,
            component: TestApp,
            state: {
              groups: [
                { name: 'Fruits', items: ['Apple', 'Banana'] },
                { name: 'Veggies', items: ['Carrot'] }
              ]
            },
            manifest: {
              targetCount: 10,
              controllers: {
                0: { type: 'repeat', views: [{ targets: [1, 2, 3] }, { targets: [6, 7, 8] }] },
                3: { type: 'repeat', views: [{ targets: [4] }, { targets: [5] }] },
                8: { type: 'repeat', views: [{ targets: [9] }] }
              }
            }
          });

          assert.deepStrictEqual(texts(host, 'h2'), ['Fruits', 'Veggies']);
          assert.deepStrictEqual(texts(host, 'li'), ['Apple', 'Banana', 'Carrot']);
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });

    describe('Repeat containing if', function () {

      it('hydrates repeat where each item has if.bind', async function () {
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
          '<div><!--au:3--><!--au-start--><!--au-end--></div>',  // Bob hidden
          '<div><!--au:4--><!--au-start--><span><!--au:5-->Carol</span><!--au-end--></div>',
          '<!--au-end-->'
        ].join('');
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          await au.hydrate({
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
                3: { type: 'if', views: [] },  // Bob hidden
                4: { type: 'if', views: [{ targets: [5] }] }
              }
            }
          });

          assert.strictEqual(count(host, 'div'), 3);
          assert.strictEqual(count(host, 'span'), 2);
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });

    describe('If containing repeat', function () {

      it('hydrates if.bind=true containing a repeat', async function () {
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
          '<li><!--au:4-->C</li>',
          '<!--au-end-->',
          '</ul></div>',
          '<!--au-end-->'
        ].join('');
        doc.body.appendChild(host);

        try {
          const au = new Aurelia(ctx.container);
          await au.hydrate({
            host,
            component: TestApp,
            state: { showList: true, items: ['A', 'B', 'C'] },
            manifest: {
              targetCount: 5,
              controllers: {
                0: { type: 'if', views: [{ targets: [1] }] },
                1: { type: 'repeat', views: [{ targets: [2] }, { targets: [3] }, { targets: [4] }] }
              }
            }
          });

          assert.strictEqual(count(host, 'div'), 1);
          assert.strictEqual(count(host, 'li'), 3);
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });

      it('hydrates if.bind=false containing a repeat (empty)', async function () {
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
          await au.hydrate({
            host,
            component: TestApp,
            state: { showList: false, items: [] },
            manifest: { targetCount: 1, controllers: { 0: { type: 'if', views: [] } } }
          });

          assert.strictEqual(count(host, 'ul'), 0);
          await au.stop(true);
        } finally {
          doc.body.removeChild(host);
        }
      });
    });

    describe('Deeply nested', function () {

      it.skip('hydrates 3-level nested if', async function () {
        // <div if.bind="a"><div if.bind="b"><div if.bind="c">${message}</div></div></div>
        // All three levels truthy
      });

      it.skip('hydrates repeat > if > repeat', async function () {
        // Outer repeat containing if containing inner repeat
      });

      it.skip('hydrates if > repeat > if', async function () {
        // if containing repeat where each item has another if
      });
    });
  });

  // ============================================================================
  // Other Template Controllers (TDD Scaffolds)
  // ============================================================================

  describe('Switch hydration', function () {

    it('hydrates switch with matched case (static content)', async function () {
      // Template equivalent:
      // <template switch.bind="status">
      //   <span case="loading">Loading...</span>
      //   <span case="success">Done!</span>
      // </template>
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Case view definitions (content of each case)
      const loadingCaseView = createViewDef(doc, '<span>Loading...</span>', []);
      const successCaseView = createViewDef(doc, '<span>Done!</span>', []);

      // Case instructions
      const loadingCase = $.case(loadingCaseView, 'loading');
      const successCase = $.case(successCaseView, 'success');

      // Switch's view template: contains render locations for each case
      // Two cases = two render location markers (local indices 0, 1)
      const switchViewTemplate = doc.createElement('template');
      switchViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';

      const switchView = {
        name: 'switch-view',
        type: 'custom-element' as const,
        template: switchViewTemplate,
        instructions: [[loadingCase], [successCase]],
        needsCompile: false as const,
      };

      // Switch instruction
      const switchInstruction = $.switch(switchView, 'status');

      // Parent template: render location for switch
      const parentTemplate = createParentTemplate(doc);

      class TestApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'test-app',
          template: parentTemplate,
          instructions: [[switchInstruction]],
          needsCompile: false,
        };
        status = 'loading';
      }

      // SSR output: switch at 0, case locations at 1 and 2, loading case content shown
      // Global indices: 0=switch, 1=loading case location, 2=success case location
      const host = doc.createElement('div');
      host.innerHTML = '<!--au:0--><!--au-start--><!--au:1--><!--au-start--><span>Loading...</span><!--au-end--><!--au:2--><!--au-start--><!--au-end--><!--au-end-->';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({
          host,
          component: TestApp,
          state: { status: 'loading' },
          manifest: M.switch({
            caseLocations: [1, 2],
            activeCases: { 1: { nodeCount: 1 } }  // Loading case at target 1 is active
          }),
        });

        assert.strictEqual(text(host, 'span'), 'Loading...');
        assert.strictEqual(count(host, 'span'), 1);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('hydrates switch with matched case (with binding)', async function () {
      // Template equivalent:
      // <template switch.bind="status">
      //   <span case="loading">Loading...</span>
      //   <span case="success">${message}</span>
      // </template>
      const ctx = TestContext.create();
      const doc = ctx.doc;

      // Loading case: static content
      const loadingCaseView = createViewDef(doc, '<span>Loading...</span>', []);

      // Success case: has text binding
      const successCaseView = createViewDef(doc, '<span><!--au:0--> </span>', [[$.text('message')]]);

      const loadingCase = $.case(loadingCaseView, 'loading');
      const successCase = $.case(successCaseView, 'success');

      const switchViewTemplate = doc.createElement('template');
      switchViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';

      const switchView = {
        name: 'switch-view',
        type: 'custom-element' as const,
        template: switchViewTemplate,
        instructions: [[loadingCase], [successCase]],
        needsCompile: false as const,
      };

      const switchInstruction = $.switch(switchView, 'status');
      const parentTemplate = createParentTemplate(doc);

      class TestApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'test-app',
          template: parentTemplate,
          instructions: [[switchInstruction]],
          needsCompile: false,
        };
        status = 'success';
        message = '';
      }

      // SSR: success case is shown with text binding at global index 3
      const host = doc.createElement('div');
      host.innerHTML = '<!--au:0--><!--au-start--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start--><span><!--au:3-->Hello World</span><!--au-end--><!--au-end-->';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({
          host,
          component: TestApp,
          state: { status: 'success', message: 'Hello World' },
          manifest: M.switch({
            caseLocations: [1, 2],
            activeCases: { 2: { targets: [3], nodeCount: 1 } }  // Success case at target 2 is active
          }),
        });

        assert.strictEqual(text(host, 'span'), 'Hello World');
        assert.strictEqual(count(host, 'span'), 1);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it('hydrates switch with default case', async function () {
      // Template equivalent:
      // <template switch.bind="status">
      //   <span case="loading">Loading...</span>
      //   <span default-case>Unknown</span>
      // </template>
      const ctx = TestContext.create();
      const doc = ctx.doc;

      const loadingCaseView = createViewDef(doc, '<span>Loading...</span>', []);
      const defaultCaseView = createViewDef(doc, '<span>Unknown</span>', []);

      const loadingCase = $.case(loadingCaseView, 'loading');
      const defaultCase = $.defaultCase(defaultCaseView);

      const switchViewTemplate = doc.createElement('template');
      switchViewTemplate.innerHTML = '<!--au:0--><!--au-start--><!--au-end--><!--au:1--><!--au-start--><!--au-end-->';

      const switchView = {
        name: 'switch-view',
        type: 'custom-element' as const,
        template: switchViewTemplate,
        instructions: [[loadingCase], [defaultCase]],
        needsCompile: false as const,
      };

      const switchInstruction = $.switch(switchView, 'status');
      const parentTemplate = createParentTemplate(doc);

      class TestApp {
        static $au = {
          type: 'custom-element' as const,
          name: 'test-app',
          template: parentTemplate,
          instructions: [[switchInstruction]],
          needsCompile: false,
        };
        status = 'other';  // Doesn't match 'loading', so default shows
      }

      // SSR: status='other' means default case is shown
      const host = doc.createElement('div');
      host.innerHTML = '<!--au:0--><!--au-start--><!--au:1--><!--au-start--><!--au-end--><!--au:2--><!--au-start--><span>Unknown</span><!--au-end--><!--au-end-->';
      doc.body.appendChild(host);

      try {
        const au = new Aurelia(ctx.container);
        await au.hydrate({
          host,
          component: TestApp,
          state: { status: 'other' },
          manifest: M.switch({
            caseLocations: [1, 2],
            activeCases: { 2: { nodeCount: 1 } }  // Default case at target 2 is active
          }),
        });

        assert.strictEqual(text(host, 'span'), 'Unknown');
        assert.strictEqual(count(host, 'span'), 1);

        await au.stop(true);
      } finally {
        doc.body.removeChild(host);
      }
    });

    it.skip('hydrates switch with fall-through cases', async function () {
      // case="a" fall-through, case="b" - both render for value="a"
      // More complex scenario - implement when basic cases work
    });
  });

  // ============================================================================
  // With Hydration
  // ============================================================================

  describe('With hydration', function () {

    it('hydrates with.bind with simple object', async function () {
      const setup = await setupWithHydration({
        viewTemplateHtml: '<span><!--au:0--> </span>',
        viewInstructions: [[$.text('name')]],
        ssrViewHtml: '<span><!--au:1-->Alice</span>',
        value: { name: 'Alice' },
        manifest: M.with([1]),
      });

      try {
        assert.strictEqual(text(setup.host, 'span'), 'Alice');
      } finally {
        await setup.stop();
      }
    });

    it('hydrates with.bind with nested properties', async function () {
      const setup = await setupWithHydration({
        viewTemplateHtml: '<div au-hid="0"><!--au:1--> </div><div au-hid="2"><!--au:3--> </div>',
        viewInstructions: [[], [$.text('name')], [], [$.text('email')]],
        ssrViewHtml: '<div au-hid="1"><!--au:2-->Bob</div><div au-hid="3"><!--au:4-->bob@example.com</div>',
        value: { name: 'Bob', email: 'bob@example.com' },
        manifest: {
          targetCount: 5,
          controllers: {
            0: { type: 'with', views: [{ targets: [1, 2, 3, 4], nodeCount: 2 }] }
          }
        },
      });

      try {
        assert.deepStrictEqual(texts(setup.host, 'div'), ['Bob', 'bob@example.com']);
      } finally {
        await setup.stop();
      }
    });

    it('hydrates with.bind with static content (no bindings)', async function () {
      const setup = await setupWithHydration({
        viewTemplateHtml: '<div>Static content</div>',
        viewInstructions: [],
        ssrViewHtml: '<div>Static content</div>',
        value: {},
        manifest: M.with([]),
      });

      try {
        assert.strictEqual(text(setup.host, 'div'), 'Static content');
      } finally {
        await setup.stop();
      }
    });
  });

  // ============================================================================
  // Promise Hydration
  // ============================================================================

  describe('Promise hydration', function () {

    it('hydrates promise in resolved state (then branch)', async function () {
      const setup = await setupPromiseHydration<string>({
        thenHtml: '<span><!--au:0--> </span>',
        thenInstructions: [[$.text('value')]],
        state: 'resolved',
        ssrActiveHtml: '<span><!--au:4-->Hello World</span>',
        resolvedValue: 'Hello World',
      });

      try {
        assert.strictEqual(text(setup.host, 'span'), 'Hello World');
        assert.strictEqual(count(setup.host, 'span'), 1);
      } finally {
        await setup.stop();
      }
    });

    it('hydrates promise in pending state', async function () {
      const setup = await setupPromiseHydration<string>({
        pendingHtml: '<span>Loading...</span>',
        state: 'pending',
        ssrActiveHtml: '<span>Loading...</span>',
      });

      try {
        assert.strictEqual(text(setup.host, 'span'), 'Loading...');
        assert.strictEqual(count(setup.host, 'span'), 1);
      } finally {
        await setup.stop();
      }
    });

    it('hydrates promise in rejected state (catch branch)', async function () {
      const setup = await setupPromiseHydration<string>({
        catchHtml: '<span><!--au:0--> </span>',
        catchInstructions: [[$.text('err')]],
        state: 'rejected',
        ssrActiveHtml: '<span><!--au:4-->Something went wrong</span>',
        rejectedError: 'Something went wrong',
      });

      try {
        assert.strictEqual(text(setup.host, 'span'), 'Something went wrong');
        assert.strictEqual(count(setup.host, 'span'), 1);
      } finally {
        await setup.stop();
      }
    });

  });

  describe('Portal hydration', function () {

    it.skip('hydrates portal with target element', async function () {
      // <div portal="target">${content}</div>
      // Content rendered inside target element
    });
  });

  describe('Au-compose hydration', function () {

    it.skip('hydrates au-compose with static component', async function () {
      // <au-compose component.bind="MyComponent"></au-compose>
    });

    it.skip('hydrates au-compose with dynamic component', async function () {
      // Component type determined at runtime
    });

    it.skip('hydrates repeat with au-compose inside', async function () {
      // <div repeat.for="item of items">
      //   <au-compose component.bind="item.component" model.bind="item.data"></au-compose>
      // </div>
      // Heterogeneous views inside a repeat
    });
  });

  describe('Custom elements inside template controllers', function () {

    it.skip('hydrates repeat containing custom elements', async function () {
      // <user-card repeat.for="user of users" user.bind="user"></user-card>
      // Custom element's internal template also needs hydration
    });

    it.skip('hydrates if containing custom element', async function () {
      // <my-component if.bind="show"></my-component>
    });

    it.skip('hydrates custom element with slotted content inside repeat', async function () {
      // <my-panel repeat.for="item of items">
      //   <span au-slot>${item.content}</span>
      // </my-panel>
    });
  });

  describe('Slot/projection hydration', function () {

    it.skip('hydrates au-slot with repeated content', async function () {
      // <my-panel>
      //   <li au-slot repeat.for="item of items">${item}</li>
      // </my-panel>
    });

    it.skip('hydrates named slots', async function () {
      // <my-layout>
      //   <header au-slot="header">${title}</header>
      //   <main au-slot>${content}</main>
      // </my-layout>
    });
  });

  // ============================================================================
  // Error Cases (TDD Scaffolds)
  // ============================================================================

  describe('Error handling', function () {

    it.skip('throws when manifest targetCount mismatches DOM', async function () {
      // SSR output has 5 targets but manifest says 7
      // Should detect version/build mismatch
    });

    it.skip('throws when manifest references invalid target index', async function () {
      // manifest.controllers[0].views[0].targets = [999] but only 5 targets exist
    });

    it.skip('provides helpful error for missing manifest', async function () {
      // hydrate() called without manifest when template has controllers
    });
  });
});

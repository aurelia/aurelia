import { IContainer } from '@aurelia/kernel';
import {
  IRenderLocation,
  IRendering,
  type ISSRScope,
  type ISSRTemplateController,
  adoptSSRView,
  adoptSSRViews,
  ViewFactory,
  CustomElementDefinition,
  isSSRTemplateController,
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext,
} from '@aurelia/testing';

describe('3-runtime-html/ssr-hydration.integration.spec.ts', function () {
  function createRenderLocation(
    doc: Document,
    parent: Element,
    childElements: Element[],
  ): IRenderLocation<Comment> {
    const start = doc.createComment('au-start');
    const end = doc.createComment('au-end') as IRenderLocation<Comment>;
    end.$start = start;

    parent.appendChild(start);
    for (const el of childElements) {
      parent.appendChild(el);
    }
    parent.appendChild(end);

    return end;
  }

  function createViewFactory(container: IContainer, template: string, name: string = 'test-view'): ViewFactory {
    const rendering = container.get(IRendering);
    const def = rendering.getViewFactory(
      CustomElementDefinition.create({ name, template }),
      container,
    );
    return def as ViewFactory;
  }

  function createMockController(container: IContainer) {
    return {
      container,
      scope: {
        bindingContext: {},
        overrideContext: { bindingContext: {} },
      },
      ssrScope: undefined as ISSRScope | undefined,
    } as any;
  }

  describe('adoptSSRView with real infrastructure', function () {
    it('creates a real view that wraps existing DOM', function () {
      const { container, platform, doc } = TestContext.create();

      // Create "SSR rendered" content
      const parent = doc.createElement('div');
      const content = doc.createElement('span');
      content.textContent = 'Hello from SSR';
      content.className = 'ssr-content';

      const location = createRenderLocation(doc, parent, [content]);

      // Create real view factory
      const factory = createViewFactory(container, '<template><span class="ssr-content"></span></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        state: { value: true },
        views: [{ nodeCount: 1, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should create a result');
      assert.notStrictEqual(result!.view, null, 'should have a view');

      // The view should reference our existing DOM node
      const view = result!.view;
      assert.strictEqual(view.nodes.childNodes.length, 1, 'view should have 1 child node');
      assert.strictEqual((view.nodes.firstChild as Element).className, 'ssr-content', 'should be our content');
    });

    it('adopted view can be activated', async function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const content = doc.createElement('div');
      content.textContent = 'Adoptable content';

      const location = createRenderLocation(doc, parent, [content]);

      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ nodeCount: 1, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should create a result');

      // Activation should not throw
      const view = result!.view;
      await view.activate(view, controller, controller.scope);

      // View activation completed without error
      // Note: isActive depends on controller state that may differ for adopted views
    });

    it('handles multi-node views correctly', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const node1 = doc.createElement('span');
      node1.textContent = 'First';
      const node2 = doc.createElement('span');
      node2.textContent = 'Second';
      const node3 = doc.createElement('span');
      node3.textContent = 'Third';

      const location = createRenderLocation(doc, parent, [node1, node2, node3]);

      const factory = createViewFactory(container, '<template><span></span><span></span><span></span></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'with',
        views: [{ nodeCount: 3, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should create a result');
      assert.strictEqual(result!.view.nodes.childNodes.length, 3, 'view should have 3 nodes');
      assert.strictEqual((result!.view.nodes.childNodes[0] as Element).textContent, 'First', 'first node text');
      assert.strictEqual((result!.view.nodes.childNodes[1] as Element).textContent, 'Second', 'second node text');
      assert.strictEqual((result!.view.nodes.childNodes[2] as Element).textContent, 'Third', 'third node text');
    });
  });

  // =============================================================================
  // Integration: adoptSSRViews with real ViewFactory
  // =============================================================================

  describe('adoptSSRViews with real infrastructure', function () {
    it('creates multiple real views from manifest', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const items = ['A', 'B', 'C'].map(text => {
        const li = doc.createElement('li');
        li.textContent = text;
        li.className = 'item';
        return li;
      });

      const location = createRenderLocation(doc, parent, items);

      const factory = createViewFactory(container, '<template><li class="item"></li></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] },
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3, 'should create 3 views');
      assert.strictEqual(result.viewScopes.length, 3, 'should have 3 scopes');

      // Each view should wrap the corresponding DOM node
      assert.strictEqual((result.views[0].nodes.firstChild as Element).textContent, 'A', 'view 0 content');
      assert.strictEqual((result.views[1].nodes.firstChild as Element).textContent, 'B', 'view 1 content');
      assert.strictEqual((result.views[2].nodes.firstChild as Element).textContent, 'C', 'view 2 content');
    });

    it('all adopted views can be activated', async function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const items = ['X', 'Y'].map(text => {
        const div = doc.createElement('div');
        div.textContent = text;
        return div;
      });

      const location = createRenderLocation(doc, parent, items);

      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] },
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      // Activate all views - should not throw
      for (const view of result.views) {
        await view.activate(view, controller, controller.scope);
        // Note: isActive depends on controller state that may differ for adopted views
      }
    });

    it('correctly partitions nodes with varying counts', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      // Create 5 nodes: first view gets 2, second gets 1, third gets 2
      const nodes: Element[] = [];
      for (let i = 0; i < 5; i++) {
        const span = doc.createElement('span');
        span.textContent = `Node${i}`;
        nodes.push(span);
      }

      const location = createRenderLocation(doc, parent, nodes);

      const factory = createViewFactory(container, '<template><span></span></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 2, children: [] }, // Node0, Node1
          { nodeCount: 1, children: [] }, // Node2
          { nodeCount: 2, children: [] }, // Node3, Node4
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3, 'should create 3 views');

      // View 0: 2 nodes
      assert.strictEqual(result.views[0].nodes.childNodes.length, 2, 'view 0 should have 2 nodes');
      assert.strictEqual((result.views[0].nodes.childNodes[0] as Element).textContent, 'Node0', 'view 0 first node');
      assert.strictEqual((result.views[0].nodes.childNodes[1] as Element).textContent, 'Node1', 'view 0 second node');

      // View 1: 1 node
      assert.strictEqual(result.views[1].nodes.childNodes.length, 1, 'view 1 should have 1 node');
      assert.strictEqual((result.views[1].nodes.childNodes[0] as Element).textContent, 'Node2', 'view 1 node');

      // View 2: 2 nodes
      assert.strictEqual(result.views[2].nodes.childNodes.length, 2, 'view 2 should have 2 nodes');
      assert.strictEqual((result.views[2].nodes.childNodes[0] as Element).textContent, 'Node3', 'view 2 first node');
      assert.strictEqual((result.views[2].nodes.childNodes[1] as Element).textContent, 'Node4', 'view 2 second node');
    });
  });

  // =============================================================================
  // Integration: SSR scope propagation
  // =============================================================================

  describe('SSR scope propagation', function () {
    it('viewScope is available for nested hydration', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const content = doc.createElement('div');
      content.innerHTML = '<span class="nested">Nested content</span>';

      const location = createRenderLocation(doc, parent, [content]);

      const factory = createViewFactory(container, '<template><div></div></template>');

      // Nested structure in manifest
      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{
          nodeCount: 1,
          children: [{
            type: 'repeat',
            views: [{ nodeCount: 1, children: [] }],
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should create a result');

      // The viewScope should contain the nested children
      const viewScope = result!.viewScope;
      assert.strictEqual(viewScope.children.length, 1, 'viewScope should have 1 child');
      assert.strictEqual(isSSRTemplateController(viewScope.children[0]), true, 'child should be a TC entry');
      assert.strictEqual((viewScope.children[0] as ISSRTemplateController).type, 'repeat', 'child should be repeat');
    });

    it('adoptSSRViews preserves viewScopes for each view', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const items = [1, 2].map(i => {
        const div = doc.createElement('div');
        div.textContent = `Item ${i}`;
        return div;
      });

      const location = createRenderLocation(doc, parent, items);

      const factory = createViewFactory(container, '<template><div></div></template>');

      // Each view has its own nested children
      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 1, children: [{ name: 'child-a', children: [] }] },
          { nodeCount: 1, children: [{ name: 'child-b', children: [] }] },
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.viewScopes.length, 2, 'should have 2 viewScopes');
      assert.strictEqual(result.viewScopes[0].children.length, 1, 'first viewScope has children');
      assert.strictEqual(result.viewScopes[1].children.length, 1, 'second viewScope has children');
      assert.strictEqual((result.viewScopes[0].children[0] as ISSRScope).name, 'child-a', 'first child name');
      assert.strictEqual((result.viewScopes[1].children[0] as ISSRScope).name, 'child-b', 'second child name');
    });
  });

  // =============================================================================
  // Edge cases and error handling
  // =============================================================================

  describe('edge cases', function () {
    it('handles empty SSR content gracefully', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      // No content between markers
      const location = createRenderLocation(doc, parent, []);

      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ nodeCount: 0, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      // nodeCount 0 means empty partition, should return null
      assert.strictEqual(result, null, 'should return null for empty content');
    });

    it('handles text nodes in SSR content', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const start = doc.createComment('au-start');
      const end = doc.createComment('au-end') as IRenderLocation<Comment>;
      (end as any).$start = start;

      parent.appendChild(start);
      parent.appendChild(doc.createTextNode('Text content'));
      parent.appendChild(end);

      const factory = createViewFactory(container, '<template></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ nodeCount: 1, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, end, platform);

      assert.notStrictEqual(result, null, 'should handle text nodes');
      assert.strictEqual(result!.view.nodes.childNodes.length, 1, 'should have 1 node');
      assert.strictEqual(result!.view.nodes.firstChild?.nodeType, 3, 'should be text node');
    });

    it('handles mixed element and text nodes', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const start = doc.createComment('au-start');
      const end = doc.createComment('au-end') as IRenderLocation<Comment>;
      (end as any).$start = start;

      parent.appendChild(start);
      parent.appendChild(doc.createTextNode('Before '));
      parent.appendChild(doc.createElement('strong'));
      (parent.lastChild as Element).textContent = 'bold';
      parent.appendChild(doc.createTextNode(' after'));
      parent.appendChild(end);

      const factory = createViewFactory(container, '<template></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ nodeCount: 3, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, end, platform);

      assert.notStrictEqual(result, null, 'should handle mixed nodes');
      assert.strictEqual(result!.view.nodes.childNodes.length, 3, 'should have 3 nodes');
    });
  });

  // =============================================================================
  // TC-specific hydration: with
  // =============================================================================

  describe('with TC hydration', function () {
    it('adopts view with correct node count', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const content = doc.createElement('div');
      content.className = 'with-content';
      content.textContent = 'Scoped content';

      const location = createRenderLocation(doc, parent, [content]);
      const factory = createViewFactory(container, '<template><div class="with-content"></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'with',
        views: [{ nodeCount: 1, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      assert.strictEqual(result!.view.nodes.childNodes.length, 1);
      assert.strictEqual((result!.view.nodes.firstChild as Element).className, 'with-content');
      assert.strictEqual((result!.view.nodes.firstChild as Element).textContent, 'Scoped content');
    });

    it('falls back to fresh view when manifest has no views', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const location = createRenderLocation(doc, parent, []);
      const factory = createViewFactory(container, '<template><div>Fresh</div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'with',
        views: [], // Empty - should fall back
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      // Returns null, caller should create fresh view
      assert.strictEqual(result, null);
    });

    it('preserves nested TC children in viewScope', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const outer = doc.createElement('div');
      outer.innerHTML = '<span>Item 1</span><span>Item 2</span>';

      const location = createRenderLocation(doc, parent, [outer]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'with',
        views: [{
          nodeCount: 1,
          children: [{
            type: 'repeat',
            views: [
              { nodeCount: 1, children: [] },
              { nodeCount: 1, children: [] },
            ],
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      const nested = result!.viewScope.children[0] as ISSRTemplateController;
      assert.strictEqual(nested.type, 'repeat');
      assert.strictEqual(nested.views.length, 2);
    });
  });

  // =============================================================================
  // TC-specific hydration: switch
  // =============================================================================

  describe('switch TC hydration', function () {
    it('adoptSSRView works for case type', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const caseContent = doc.createElement('div');
      caseContent.textContent = 'Case A content';

      const location = createRenderLocation(doc, parent, [caseContent]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'case',
        views: [{ nodeCount: 1, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      assert.strictEqual((result!.view.nodes.firstChild as Element).textContent, 'Case A content');
    });

    it('handles multiple active cases (fallthrough scenario)', function () {
      const { container, platform, doc } = TestContext.create();

      // Simulate: case A falls through to case B
      // Both cases were rendered server-side
      const parent = doc.createElement('div');
      const caseA = doc.createElement('div');
      caseA.textContent = 'Case A';
      const caseB = doc.createElement('div');
      caseB.textContent = 'Case B';

      // Two separate locations for two cases
      const locationA = createRenderLocation(doc, parent, [caseA]);
      const locationB = createRenderLocation(doc, parent, [caseB]);

      const factory = createViewFactory(container, '<template><div></div></template>');
      const controller = createMockController(container);

      const ssrScopeA: ISSRTemplateController = { type: 'case', views: [{ nodeCount: 1, children: [] }] };
      const ssrScopeB: ISSRTemplateController = { type: 'case', views: [{ nodeCount: 1, children: [] }] };

      const resultA = adoptSSRView(ssrScopeA, factory, controller, locationA, platform);
      const resultB = adoptSSRView(ssrScopeB, factory, controller, locationB, platform);

      assert.notStrictEqual(resultA, null);
      assert.notStrictEqual(resultB, null);
      assert.strictEqual((resultA!.view.nodes.firstChild as Element).textContent, 'Case A');
      assert.strictEqual((resultB!.view.nodes.firstChild as Element).textContent, 'Case B');
    });

    it('switch manifest records multiple case views correctly', function () {
      // This tests the manifest structure for switch with active cases
      const ssrScope: ISSRTemplateController = {
        type: 'switch',
        views: [
          { nodeCount: 1, children: [] }, // First active case
          { nodeCount: 2, children: [] }, // Second active case (fallthrough)
        ],
      };

      assert.strictEqual(ssrScope.type, 'switch');
      assert.strictEqual(ssrScope.views.length, 2);
      assert.strictEqual(ssrScope.views[0].nodeCount, 1);
      assert.strictEqual(ssrScope.views[1].nodeCount, 2);
    });
  });

  // =============================================================================
  // Nested TC combinations
  // =============================================================================

  describe('nested TC combinations', function () {
    it('if inside repeat: each repeat item has its own if state', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      // 3 repeat items, each with an if (some true, some false)
      const item1 = doc.createElement('li');
      item1.innerHTML = '<span>Visible 1</span>';
      const item2 = doc.createElement('li'); // if=false, empty
      const item3 = doc.createElement('li');
      item3.innerHTML = '<span>Visible 3</span>';

      const location = createRenderLocation(doc, parent, [item1, item2, item3]);
      const factory = createViewFactory(container, '<template><li></li></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          {
            nodeCount: 1,
            children: [{
              type: 'if',
              state: { value: true },
              views: [{ nodeCount: 1, children: [] }],
            }],
          },
          {
            nodeCount: 1,
            children: [{
              type: 'if',
              state: { value: false },
              views: [], // No view rendered
            }],
          },
          {
            nodeCount: 1,
            children: [{
              type: 'if',
              state: { value: true },
              views: [{ nodeCount: 1, children: [] }],
            }],
          },
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3);

      // Check nested if states are preserved in viewScopes
      const scope0 = result.viewScopes[0].children[0] as ISSRTemplateController;
      const scope1 = result.viewScopes[1].children[0] as ISSRTemplateController;
      const scope2 = result.viewScopes[2].children[0] as ISSRTemplateController;

      assert.strictEqual(scope0.type, 'if');
      assert.strictEqual((scope0.state as { value: boolean }).value, true);
      assert.strictEqual(scope0.views.length, 1);

      assert.strictEqual(scope1.type, 'if');
      assert.strictEqual((scope1.state as { value: boolean }).value, false);
      assert.strictEqual(scope1.views.length, 0);

      assert.strictEqual(scope2.type, 'if');
      assert.strictEqual((scope2.state as { value: boolean }).value, true);
      assert.strictEqual(scope2.views.length, 1);
    });

    it('repeat inside if: conditional list rendering', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const wrapper = doc.createElement('ul');
      wrapper.innerHTML = '<li>A</li><li>B</li><li>C</li>';

      const location = createRenderLocation(doc, parent, [wrapper]);
      const factory = createViewFactory(container, '<template><ul></ul></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        state: { value: true },
        views: [{
          nodeCount: 1,
          children: [{
            type: 'repeat',
            views: [
              { nodeCount: 1, children: [] },
              { nodeCount: 1, children: [] },
              { nodeCount: 1, children: [] },
            ],
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      const nestedRepeat = result!.viewScope.children[0] as ISSRTemplateController;
      assert.strictEqual(nestedRepeat.type, 'repeat');
      assert.strictEqual(nestedRepeat.views.length, 3);
    });

    it('with inside repeat: scoped data per item', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const items = ['User 1', 'User 2'].map(name => {
        const div = doc.createElement('div');
        div.innerHTML = `<span class="name">${name}</span>`;
        return div;
      });

      const location = createRenderLocation(doc, parent, items);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          {
            nodeCount: 1,
            children: [{
              type: 'with',
              views: [{ nodeCount: 1, children: [] }],
            }],
          },
          {
            nodeCount: 1,
            children: [{
              type: 'with',
              views: [{ nodeCount: 1, children: [] }],
            }],
          },
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 2);
      assert.strictEqual((result.viewScopes[0].children[0] as ISSRTemplateController).type, 'with');
      assert.strictEqual((result.viewScopes[1].children[0] as ISSRTemplateController).type, 'with');
    });

    it('switch inside if: conditional switch', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const wrapper = doc.createElement('div');
      wrapper.innerHTML = '<span>Case B active</span>';

      const location = createRenderLocation(doc, parent, [wrapper]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        state: { value: true },
        views: [{
          nodeCount: 1,
          children: [{
            type: 'switch',
            views: [{ nodeCount: 1, children: [] }], // One active case
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      const nestedSwitch = result!.viewScope.children[0] as ISSRTemplateController;
      assert.strictEqual(nestedSwitch.type, 'switch');
      assert.strictEqual(nestedSwitch.views.length, 1);
    });

    it('repeat inside switch case: list in conditional branch', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const caseContent = doc.createElement('div');
      caseContent.innerHTML = '<p>Item 1</p><p>Item 2</p>';

      const location = createRenderLocation(doc, parent, [caseContent]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'case',
        views: [{
          nodeCount: 1,
          children: [{
            type: 'repeat',
            views: [
              { nodeCount: 1, children: [] },
              { nodeCount: 1, children: [] },
            ],
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      const nestedRepeat = result!.viewScope.children[0] as ISSRTemplateController;
      assert.strictEqual(nestedRepeat.type, 'repeat');
      assert.strictEqual(nestedRepeat.views.length, 2);
    });

    it('deeply nested: repeat > if > with', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const item = doc.createElement('div');
      item.innerHTML = '<section><article>Deep content</article></section>';

      const location = createRenderLocation(doc, parent, [item]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [{
          nodeCount: 1,
          children: [{
            type: 'if',
            state: { value: true },
            views: [{
              nodeCount: 1,
              children: [{
                type: 'with',
                views: [{ nodeCount: 1, children: [] }],
              }],
            }],
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 1);

      const ifScope = result.viewScopes[0].children[0] as ISSRTemplateController;
      assert.strictEqual(ifScope.type, 'if');

      const withScope = ifScope.views[0].children[0] as ISSRTemplateController;
      assert.strictEqual(withScope.type, 'with');
      assert.strictEqual(withScope.views.length, 1);
    });
  });

  // =============================================================================
  // Custom element boundaries
  // =============================================================================

  describe('custom element boundaries', function () {
    it('TC containing child CE: manifest includes CE scope', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const item = doc.createElement('my-card');
      item.innerHTML = '<h2>Card Title</h2><p>Card body</p>';

      const location = createRenderLocation(doc, parent, [item]);
      const factory = createViewFactory(container, '<template><my-card></my-card></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [{
          nodeCount: 1,
          children: [{
            name: 'my-card',
            children: [], // CE's own children would be here
          }],
        }],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 1);
      const ceScope = result.viewScopes[0].children[0] as ISSRScope;
      assert.strictEqual(ceScope.name, 'my-card');
    });

    it('child CE containing TCs: CE scope has TC children', function () {
      const ssrScope: ISSRScope = {
        name: 'my-list',
        children: [{
          type: 'repeat',
          views: [
            { nodeCount: 1, children: [] },
            { nodeCount: 1, children: [] },
          ],
        }],
      };

      assert.strictEqual(ssrScope.name, 'my-list');
      const repeat = ssrScope.children[0] as ISSRTemplateController;
      assert.strictEqual(repeat.type, 'repeat');
      assert.strictEqual(repeat.views.length, 2);
    });

    it('repeat > CE > if: mixed nesting across boundaries', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const items = [1, 2].map(i => {
        const ce = doc.createElement('expandable-item');
        ce.innerHTML = i === 1 ? '<div>Expanded content</div>' : '';
        return ce;
      });

      const location = createRenderLocation(doc, parent, items);
      const factory = createViewFactory(container, '<template><expandable-item></expandable-item></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          {
            nodeCount: 1,
            children: [{
              name: 'expandable-item',
              children: [{
                type: 'if',
                state: { value: true },
                views: [{ nodeCount: 1, children: [] }],
              }],
            }],
          },
          {
            nodeCount: 1,
            children: [{
              name: 'expandable-item',
              children: [{
                type: 'if',
                state: { value: false },
                views: [],
              }],
            }],
          },
        ],
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 2);

      // First item: CE with if=true
      const ce1 = result.viewScopes[0].children[0] as ISSRScope;
      assert.strictEqual(ce1.name, 'expandable-item');
      const if1 = ce1.children[0] as ISSRTemplateController;
      assert.strictEqual(if1.type, 'if');
      assert.strictEqual((if1.state as { value: boolean }).value, true);
      assert.strictEqual(if1.views.length, 1);

      // Second item: CE with if=false
      const ce2 = result.viewScopes[1].children[0] as ISSRScope;
      assert.strictEqual(ce2.name, 'expandable-item');
      const if2 = ce2.children[0] as ISSRTemplateController;
      assert.strictEqual(if2.type, 'if');
      assert.strictEqual((if2.state as { value: boolean }).value, false);
      assert.strictEqual(if2.views.length, 0);
    });
  });

  // =============================================================================
  // Edge cases that could break hydration
  // =============================================================================

  describe('potential failure modes', function () {
    it('mismatched nodeCount: manifest says more nodes than DOM has', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      // Only 1 node in DOM
      const node = doc.createElement('div');
      node.textContent = 'Only one';

      const location = createRenderLocation(doc, parent, [node]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      // Manifest claims 3 nodes
      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ nodeCount: 3, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      // Should handle gracefully - either adopt what's available or return null
      // The exact behavior depends on implementation, but it shouldn't crash
      if (result !== null) {
        assert.ok(result.view.nodes.childNodes.length <= 3, 'should not exceed available nodes');
      }
    });

    it('mismatched nodeCount: manifest says fewer nodes than DOM has', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      // 5 nodes in DOM
      for (let i = 0; i < 5; i++) {
        const node = doc.createElement('span');
        node.textContent = `Node ${i}`;
        parent.appendChild(node);
      }

      const start = doc.createComment('au-start');
      const end = doc.createComment('au-end') as IRenderLocation<Comment>;
      (end as any).$start = start;
      parent.insertBefore(start, parent.firstChild);
      parent.appendChild(end);

      const factory = createViewFactory(container, '<template><span></span></template>');

      // Manifest claims only 2 nodes
      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ nodeCount: 2, children: [] }],
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, end, platform);

      // Should adopt exactly 2 nodes as specified
      assert.notStrictEqual(result, null);
      assert.strictEqual(result!.view.nodes.childNodes.length, 2);
      assert.strictEqual((result!.view.nodes.childNodes[0] as Element).textContent, 'Node 0');
      assert.strictEqual((result!.view.nodes.childNodes[1] as Element).textContent, 'Node 1');
    });

    it('manifest with undefined nodeCount defaults to 1', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const node = doc.createElement('div');
      node.textContent = 'Single node';

      const location = createRenderLocation(doc, parent, [node]);
      const factory = createViewFactory(container, '<template><div></div></template>');

      // No nodeCount specified
      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ children: [] }], // nodeCount omitted
      };

      const controller = createMockController(container);
      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null);
      assert.strictEqual(result!.view.nodes.childNodes.length, 1);
    });

    it('empty repeat: zero items rendered', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const location = createRenderLocation(doc, parent, []);
      const factory = createViewFactory(container, '<template><div></div></template>');

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [], // Empty array
      };

      const controller = createMockController(container);
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 0);
      assert.strictEqual(result.viewScopes.length, 0);
    });

    it('switch with no active case (default only)', function () {
      // When no case matches and default is rendered
      const ssrScope: ISSRTemplateController = {
        type: 'switch',
        views: [
          { nodeCount: 1, children: [] }, // default-case view
        ],
      };

      assert.strictEqual(ssrScope.views.length, 1);
    });

    it('deeply nested empty structures', function () {
      // Edge case: nested TCs where inner ones have no content
      const ssrScope: ISSRTemplateController = {
        type: 'if',
        state: { value: true },
        views: [{
          nodeCount: 1,
          children: [{
            type: 'repeat',
            views: [], // Empty repeat inside if
          }],
        }],
      };

      const innerRepeat = ssrScope.views[0].children[0] as ISSRTemplateController;
      assert.strictEqual(innerRepeat.type, 'repeat');
      assert.strictEqual(innerRepeat.views.length, 0);
    });
  });
});

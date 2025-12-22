import { DI, IContainer } from '@aurelia/kernel';
import {
  IRenderLocation,
  type ISSRScope,
  type ISSRTemplateController,
  adoptSSRView,
  adoptSSRViews,
  IViewFactory,
  ViewFactory,
  CustomElementDefinition,
  isSSRTemplateController,
  isSSRScope,
} from '@aurelia/runtime-html';
import {
  assert,
  TestContext,
} from '@aurelia/testing';

describe('3-runtime-html/ssr-hydration.spec.ts', function () {
  /**
   * Creates a render location (au-start/au-end comment pair) with
   * pre-populated child nodes between them.
   */
  function createLocationWithNodes(
    doc: Document,
    parent: Element,
    nodeContents: string[],
  ): { location: IRenderLocation; nodes: Node[] } {
    const startMarker = doc.createComment('au-start');
    const endMarker = doc.createComment('au-end') as IRenderLocation<Comment>;
    endMarker.$start = startMarker;

    parent.appendChild(startMarker);

    const nodes: Node[] = [];
    for (const content of nodeContents) {
      const node = doc.createElement('div');
      node.textContent = content;
      parent.appendChild(node);
      nodes.push(node);
    }

    parent.appendChild(endMarker);

    return { location: endMarker, nodes };
  }

  function createMockViewFactory(container: IContainer): IViewFactory {
    const def = CustomElementDefinition.create({
      name: 'test-view',
      template: '<template></template>',
    });
    return new ViewFactory(container, def);
  }

  function createMockController() {
    return {
      container: DI.createContainer(),
      scope: { bindingContext: {}, overrideContext: {} },
      ssrScope: undefined as ISSRScope | undefined,
    } as any;
  }

  // =============================================================================
  // Unit Tests: adoptSSRView
  // =============================================================================

  describe('adoptSSRView', function () {
    it('returns null when manifest has no views', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A', 'B']);

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [], // No views
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result, null, 'should return null when no views');
    });

    it('returns null when location has no start marker', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const endMarker = doc.createComment('au-end') as IRenderLocation<Comment>;
      // Not setting $start - simulating malformed location
      parent.appendChild(endMarker);

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ children: [] }],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRView(ssrScope, factory, controller, endMarker, platform);

      assert.strictEqual(result, null, 'should return null when no start marker');
    });

    it('creates view wrapping single node when nodeCount is 1', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location, nodes } = createLocationWithNodes(doc, parent, ['A']);

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        state: { value: true },
        views: [{ nodeCount: 1, children: [] }],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should return a result');
      assert.notStrictEqual(result!.view, null, 'should have view');
      assert.strictEqual(result!.viewScope.nodeCount, 1, 'should have correct nodeCount');
    });

    it('creates view wrapping multiple nodes when nodeCount > 1', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location, nodes } = createLocationWithNodes(doc, parent, ['A', 'B', 'C']);

      const ssrScope: ISSRTemplateController = {
        type: 'with',
        views: [{ nodeCount: 3, children: [] }],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should return a result');
      assert.notStrictEqual(result!.view, null, 'should have view');
      assert.strictEqual(result!.viewScope.nodeCount, 3, 'should have correct nodeCount');
    });

    it('defaults nodeCount to 1 when not specified', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A']);

      const ssrScope: ISSRTemplateController = {
        type: 'if',
        views: [{ children: [] }], // No nodeCount specified
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRView(ssrScope, factory, controller, location, platform);

      assert.notStrictEqual(result, null, 'should return a result');
      // Should default to 1 and adopt a single node
      assert.notStrictEqual(result!.view, null, 'should have view');
    });
  });

  // =============================================================================
  // Unit Tests: adoptSSRViews
  // =============================================================================

  describe('adoptSSRViews', function () {
    it('returns empty arrays when manifest has no views', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A', 'B']);

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 0, 'should have 0 views');
      assert.strictEqual(result.viewScopes.length, 0, 'should have 0 viewScopes');
    });

    it('creates views for each manifest entry', function () {
      const { container, platform, doc } = TestContext.create();

      // Create nodes for 3 views: A, B, C (each 1 node)
      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A', 'B', 'C']);

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] },
        ],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3, 'should create 3 views');
      assert.strictEqual(result.viewScopes.length, 3, 'should have 3 viewScopes');
    });

    it('partitions nodes correctly with varying nodeCounts', function () {
      const { container, platform, doc } = TestContext.create();

      // Create nodes: A, B, C, D, E, F (6 total)
      // Views: [A, B] (2), [C] (1), [D, E, F] (3)
      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A', 'B', 'C', 'D', 'E', 'F']);

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 2, children: [] }, // A, B
          { nodeCount: 1, children: [] }, // C
          { nodeCount: 3, children: [] }, // D, E, F
        ],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3, 'should create 3 views');
      assert.strictEqual(result.viewScopes[0].nodeCount, 2, 'first view has nodeCount 2');
      assert.strictEqual(result.viewScopes[1].nodeCount, 1, 'second view has nodeCount 1');
      assert.strictEqual(result.viewScopes[2].nodeCount, 3, 'third view has nodeCount 3');
    });

    it('handles views with missing nodeCount (defaults to 1)', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A', 'B', 'C']);

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { children: [] }, // No nodeCount - defaults to 1
          { children: [] }, // No nodeCount - defaults to 1
          { children: [] }, // No nodeCount - defaults to 1
        ],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3, 'should create 3 views');
    });

    it('handles more views than available nodes gracefully', function () {
      const { container, platform, doc } = TestContext.create();

      // Only 2 nodes, but 3 views requested
      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A', 'B']);

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] },
          { nodeCount: 1, children: [] }, // No node available for this
        ],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      // Should not throw - creates views with what's available
      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 3, 'should still create 3 views');
    });

    it('handles single view correctly', function () {
      const { container, platform, doc } = TestContext.create();

      const parent = doc.createElement('div');
      const { location } = createLocationWithNodes(doc, parent, ['A']);

      const ssrScope: ISSRTemplateController = {
        type: 'repeat',
        views: [{ nodeCount: 1, children: [] }],
      };

      const factory = createMockViewFactory(container);
      const controller = createMockController();

      const result = adoptSSRViews(ssrScope, factory, controller, location, platform);

      assert.strictEqual(result.views.length, 1, 'should create 1 view');
      assert.strictEqual(result.viewScopes[0].nodeCount, 1, 'should have nodeCount 1');
    });
  });

  // =============================================================================
  // Type Guard Tests
  // =============================================================================

  describe('SSR type guards', function () {
    it('isSSRTemplateController identifies TC entries', function () {
      const tcEntry: ISSRTemplateController = { type: 'if', views: [] };
      const scopeEntry: ISSRScope = { children: [] };

      assert.strictEqual(isSSRTemplateController(tcEntry), true, 'should identify TC entry');
      assert.strictEqual(isSSRTemplateController(scopeEntry), false, 'should not identify scope as TC');
    });

    it('isSSRScope identifies scope entries', function () {
      const tcEntry: ISSRTemplateController = { type: 'repeat', views: [] };
      const scopeEntry: ISSRScope = { name: 'my-component', children: [] };

      assert.strictEqual(isSSRScope(scopeEntry), true, 'should identify scope entry');
      assert.strictEqual(isSSRScope(tcEntry), false, 'should not identify TC as scope');
    });
  });
});

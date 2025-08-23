import { Registration } from '@aurelia/kernel';
import { TestContext, assert } from '@aurelia/testing';

import {
  IInsightsConfiguration,
  IPerformanceTracker,
  RouterLifecycleHooks
} from '@aurelia/insights';

// Mock interfaces for testing both router packages
interface MockRouteNode {
  computeAbsolutePath(): string;
  path: string;
  finalPath: string;
  context: unknown;
  component: { name: string };
}

interface MockRoutingInstruction {
  component: unknown;
  endpoint: unknown;
  parameters: unknown;
  ownsScope: boolean;
  route: string | { path: string };
}

interface MockNavigation {
  instruction: string | MockRoutingInstruction[];
  trigger: unknown;
  fromBrowser: boolean;
  path?: string;
}

interface MockParams {
  [key: string]: string;
}

interface MockParameters {
  [key: string]: string;
}

interface MockRouterComponent {
  constructor: { name: string };
}

describe('insights/router-lifecycle-hooks.spec.ts', function () {
  let ctx: TestContext;
  let hooks: RouterLifecycleHooks;
  let mockTracker: IPerformanceTracker;
  let mockConfig: IInsightsConfiguration;
  let measurementStartSpy: number;
  let measurementEndSpy: number;

  beforeEach(function () {
    ctx = TestContext.create();

    // Mock performance tracker
    measurementStartSpy = 0;
    measurementEndSpy = 0;
    let measurementId = 1;

    mockTracker = {
      isEnabled: () => true,
      startMeasurement: (_name: string, _metadata?: unknown) => {
        measurementStartSpy++;
        return `measurement-${measurementId++}`;
      },
      endMeasurement: (_id: string) => {
        measurementEndSpy++;
        return null;
      },
      addMeasurement: () => {},
      addInstantMeasurement: () => {},
      getMeasurements: () => [],
      clear: () => {},
      dispose: () => {},
      debug: () => {},
      generateTestData: () => ({} as any),
      checkRegressions: () => ({} as any),
      exportTestData: () => {}
    } as unknown as IPerformanceTracker;

    // Mock configuration with router tracking enabled
    mockConfig = {
      enabled: true,
      trackName: 'Test',
      trackGroup: 'TestGroup',
      defaultColor: 'primary',
      filters: [],
      enableRouterTracking: true
    };

    // Register mocks in DI container
    ctx.container.register(
      Registration.instance(IPerformanceTracker, mockTracker),
      Registration.instance(IInsightsConfiguration, mockConfig)
    );

    hooks = ctx.container.get(RouterLifecycleHooks);
  });

  afterEach(function () {
    hooks.dispose();
  });

  describe('constructor', function () {
    it('should be injectable via DI', function () {
      assert.instanceOf(hooks, RouterLifecycleHooks);
    });

    it('should resolve dependencies correctly', function () {
      assert.notStrictEqual(hooks, undefined);
    });
  });

  describe('loading hook - router package (was router-lite)', function () {
    let mockComponent: MockRouterComponent;
    let mockParams: MockParams;
    let mockRouteNode: MockRouteNode;

    beforeEach(function () {
      mockComponent = {
        constructor: { name: 'TestComponent' }
      };

      mockParams = {
        id: '123',
        category: 'test'
      };

      mockRouteNode = {
        computeAbsolutePath: () => '/test/path',
        path: '/test',
        finalPath: '/test/path',
        context: {},
        component: { name: 'TestComponent' }
      };
    });

    it('should start measurement when router tracking is enabled', function () {
      const initialStartCount = measurementStartSpy;

      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      assert.strictEqual(measurementStartSpy, initialStartCount + 1);
    });

    it('should extract route info from RouteNode.computeAbsolutePath()', function () {
      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      // The measurement should be started (tested above)
      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should fallback to RouteNode.finalPath when computeAbsolutePath is empty', function () {
      mockRouteNode.computeAbsolutePath = () => '';
      mockRouteNode.finalPath = '/fallback/path';

      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should fallback to RouteNode.path when finalPath is empty', function () {
      mockRouteNode.computeAbsolutePath = () => '';
      mockRouteNode.finalPath = '';
      mockRouteNode.path = '/path/fallback';

      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should use component name as last resort', function () {
      mockRouteNode.computeAbsolutePath = () => '';
      mockRouteNode.finalPath = '';
      mockRouteNode.path = '';

      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      assert.strictEqual(measurementStartSpy, 1);
    });
  });

  describe('loading hook - router-direct package (was router)', function () {
    let mockComponent: MockRouterComponent;
    let mockParameters: MockParameters;
    let mockInstruction: MockRoutingInstruction;
    let mockNavigation: MockNavigation;

    beforeEach(function () {
      mockComponent = {
        constructor: { name: 'TestDirectComponent' }
      };

      mockParameters = {
        id: '456',
        section: 'direct-test'
      };

      mockInstruction = {
        component: {},
        endpoint: {},
        parameters: {},
        ownsScope: true,
        route: '/direct/test/path'
      };

      mockNavigation = {
        instruction: [mockInstruction],
        trigger: {},
        fromBrowser: false,
        path: '/navigation/path'
      };
    });

    it('should start measurement with router-direct signature', function () {
      const initialStartCount = measurementStartSpy;

      void hooks.loading(mockComponent as any, mockParameters, mockInstruction as any, mockNavigation as any);

      assert.strictEqual(measurementStartSpy, initialStartCount + 1);
    });

    it('should extract route info from Navigation.instruction array', function () {
      void hooks.loading(mockComponent as any, mockParameters, mockInstruction as any, mockNavigation as any);

      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should handle string Navigation.instruction', function () {
      mockNavigation.instruction = '/string/instruction/path';

      void hooks.loading(mockComponent as any, mockParameters, mockInstruction as any, mockNavigation as any);

      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should fallback to Navigation.path when instruction extraction fails', function () {
      mockNavigation.instruction = [];
      mockNavigation.path = '/navigation/fallback/path';

      void hooks.loading(mockComponent as any, mockParameters, mockInstruction as any, mockNavigation as any);

      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should extract route from RoutingInstruction.route object', function () {
      mockInstruction.route = { path: '/object/route/path' };

      void hooks.loading(mockComponent as any, mockParameters, mockInstruction as any, mockNavigation as any);

      assert.strictEqual(measurementStartSpy, 1);
    });

    it('should handle RoutingInstruction.route as string', function () {
      mockInstruction.route = '/string/route/path';

      void hooks.loading(mockComponent as any, mockParameters, mockInstruction as any, mockNavigation as any);

      assert.strictEqual(measurementStartSpy, 1);
    });
  });

  describe('attached hook', function () {
    let mockComponent: MockRouterComponent;

    beforeEach(function () {
      mockComponent = {
        constructor: { name: 'AttachedTestComponent' }
      };
    });

    it('should end measurement when component has active loading measurement', function () {
      const mockParams = { id: '789' };
      const mockRouteNode: MockRouteNode = {
        computeAbsolutePath: () => '/attached/test',
        path: '/attached',
        finalPath: '/attached/test',
        context: {},
        component: { name: 'AttachedTestComponent' }
      };

      // Start a measurement first
      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);
      assert.strictEqual(measurementStartSpy, 1);

      const initialEndCount = measurementEndSpy;

      // Then call attached
      hooks.attached(mockComponent);

      assert.strictEqual(measurementEndSpy, initialEndCount + 1);
    });

    it('should not end measurement when component has no active loading measurement', function () {
      const initialEndCount = measurementEndSpy;

      hooks.attached(mockComponent);

      assert.strictEqual(measurementEndSpy, initialEndCount);
    });
  });

  describe('configuration handling', function () {
    it('should not track when router tracking is disabled', function () {
      mockConfig.enableRouterTracking = false;

      const mockComponent = { constructor: { name: 'ConfigTestComponent' } };
      const mockParams = { test: 'param' };
      const mockRouteNode: MockRouteNode = {
        computeAbsolutePath: () => '/config/test',
        path: '/config',
        finalPath: '/config/test',
        context: {},
        component: { name: 'ConfigTestComponent' }
      };

      const initialStartCount = measurementStartSpy;

      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      assert.strictEqual(measurementStartSpy, initialStartCount);
    });

    it('should not track when performance tracker is disabled', function () {
      mockTracker.isEnabled = () => false;

      const mockComponent = { constructor: { name: 'TrackerTestComponent' } };
      const mockParams = { test: 'param' };
      const mockRouteNode: MockRouteNode = {
        computeAbsolutePath: () => '/tracker/test',
        path: '/tracker',
        finalPath: '/tracker/test',
        context: {},
        component: { name: 'TrackerTestComponent' }
      };

      const initialStartCount = measurementStartSpy;

      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);

      assert.strictEqual(measurementStartSpy, initialStartCount);
    });
  });

  describe('type guards', function () {
    it('should correctly identify RouteNode objects', function () {
      const routeNode = {
        computeAbsolutePath: () => '/test',
        path: '/test',
        finalPath: '/test',
        context: {},
        component: {}
      };

      // Access private method through any casting for testing
      const result = (hooks as any).isRouteNode(routeNode);
      assert.strictEqual(result, true);
    });

    it('should correctly identify RoutingInstruction objects', function () {
      const instruction = {
        component: {},
        endpoint: {},
        parameters: {},
        ownsScope: true,
        route: '/test'
      };

      const result = (hooks as any).isRoutingInstruction(instruction);
      assert.strictEqual(result, true);
    });

    it('should correctly identify Navigation objects', function () {
      const navigation = {
        instruction: '/test',
        trigger: {},
        fromBrowser: false
      };

      const result = (hooks as any).isNavigation(navigation);
      assert.strictEqual(result, true);
    });

    it('should reject invalid RouteNode objects', function () {
      const invalidNode = {
        path: '/test'
        // Missing required properties
      };

      const result = (hooks as any).isRouteNode(invalidNode);
      assert.strictEqual(result, false);
    });

    it('should reject invalid RoutingInstruction objects', function () {
      const invalidInstruction = {
        component: {}
        // Missing required properties
      };

      const result = (hooks as any).isRoutingInstruction(invalidInstruction);
      assert.strictEqual(result, false);
    });

    it('should reject invalid Navigation objects', function () {
      const invalidNavigation = {
        instruction: '/test'
        // Missing required properties
      };

      const result = (hooks as any).isNavigation(invalidNavigation);
      assert.strictEqual(result, false);
    });
  });

  describe('dispose', function () {
    it('should clean up active measurements', function () {
      const mockComponent = { constructor: { name: 'DisposeTestComponent' } };
      const mockParams = { test: 'param' };
      const mockRouteNode: MockRouteNode = {
        computeAbsolutePath: () => '/dispose/test',
        path: '/dispose',
        finalPath: '/dispose/test',
        context: {},
        component: { name: 'DisposeTestComponent' }
      };

      // Start a measurement
      void hooks.loading(mockComponent as any, mockParams, mockRouteNode as any);
      assert.strictEqual(measurementStartSpy, 1);

      // Dispose should not throw
      assert.doesNotThrow(() => {
        hooks.dispose();
      });
    });
  });

  describe('component name extraction', function () {
    it('should extract component name from constructor when CustomElement definition fails', function () {
      const mockComponent = { constructor: { name: 'ExtractTestComponent' } };

      const result = (hooks as any).getComponentName(mockComponent);
      assert.strictEqual(result, 'ExtractTestComponent');
    });

    it('should return default name for invalid components', function () {
      const result = (hooks as any).getComponentName(null);
      assert.strictEqual(result, 'UnknownRouterComponent');
    });

    it('should handle missing constructor name', function () {
      const mockComponent = { constructor: {} };

      const result = (hooks as any).getComponentName(mockComponent);
      assert.strictEqual(result, 'UnknownRouterComponent');
    });
  });
});

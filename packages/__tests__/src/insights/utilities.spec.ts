import { assert, TestContext, createSpy } from '@aurelia/testing';

import {
  InsightsUtilities,
  IInsightsConfiguration,
  IPerformanceMeasurement,
} from '@aurelia/insights';

// Simplified mock implementation of IPerformanceTracker that only implements the methods we need
class MockPerformanceTracker {
  private measurements: IPerformanceMeasurement[] = [];

  public getMeasurements(): readonly IPerformanceMeasurement[] {
    return [...this.measurements];
  }

  public clear(): void {
    this.measurements.length = 0;
  }

  public isEnabled(): boolean {
    return true;
  }

  public startMeasurement(): string {
    return 'mock-id';
  }

  public endMeasurement(): IPerformanceMeasurement | null {
    return null;
  }

  public addMeasurement(measurement: IPerformanceMeasurement): void {
    this.measurements.push(measurement);
  }

  public addInstantMeasurement(): void {
    // Mock implementation
  }

  public dispose(): void {
    this.clear();
  }

  public debug(): void {
    // Mock implementation
  }

  // Helper method for tests
  public setMockMeasurements(measurements: IPerformanceMeasurement[]): void {
    this.measurements = [...measurements];
  }
}

// Mock implementation of IInsightsConfiguration
const createMockConfig = (overrides: Partial<IInsightsConfiguration> = {}): IInsightsConfiguration => ({
  enabled: true,
  trackName: 'Test',
  trackGroup: 'TestGroup',
  defaultColor: 'primary',
  filters: [],
  enableRouterTracking: true,
  ...overrides
});

describe('insights/utilities.spec.ts', function () {
  let ctx: TestContext;
  let mockTracker: MockPerformanceTracker;
  let mockConfig: IInsightsConfiguration;
  let utilities: InsightsUtilities;

  beforeEach(function () {
    ctx = TestContext.create();
    mockTracker = new MockPerformanceTracker();
    mockConfig = createMockConfig();

    utilities = new InsightsUtilities(mockTracker as any, mockConfig);
  });

  describe('getMeasurements', function () {
    it('should return measurements from performance tracker', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'component-lifecycle',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'TestComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getMeasurements();

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].name, 'component-lifecycle');
      assert.strictEqual(result[0].duration, 50);
    });

    it('should return empty array when no measurements', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.getMeasurements();

      assert.strictEqual(result.length, 0);
      assert.instanceOf(result, Array);
    });

    it('should return readonly array', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'test',
          startTime: 100,
          endTime: 150,
          duration: 50
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getMeasurements();

      assert.strictEqual(result.length, 1);
    });
  });

  describe('clearMeasurements', function () {
    it('should delegate to performance tracker clear method', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'test',
          startTime: 100,
          endTime: 150,
          duration: 50
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      assert.strictEqual(utilities.getMeasurements().length, 1);

      utilities.clearMeasurements();
      assert.strictEqual(utilities.getMeasurements().length, 0);
    });
  });

  describe('groupMeasurementsByComponent', function () {
    it('should group measurements by component and phase', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'ComponentA', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 250,
          duration: 50,
          metadata: { componentName: 'ComponentA', phase: 'bound' }
        },
        {
          name: 'lifecycle',
          startTime: 300,
          endTime: 400,
          duration: 100,
          metadata: { componentName: 'ComponentB', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.groupMeasurementsByComponent();

      assert.strictEqual(Object.keys(result).length, 2);
      assert.notStrictEqual(result.ComponentA, undefined);
      assert.notStrictEqual(result.ComponentB, undefined);

      assert.notStrictEqual(result.ComponentA.created, undefined);
      assert.notStrictEqual(result.ComponentA.bound, undefined);
      assert.notStrictEqual(result.ComponentB.created, undefined);

      const componentACreated = result.ComponentA.created;
      assert.strictEqual(componentACreated.count, 1);
      assert.strictEqual(componentACreated.total, 50);
      assert.strictEqual(componentACreated.average, 50);
      assert.strictEqual(componentACreated.min, 50);
      assert.strictEqual(componentACreated.max, 50);
      assert.strictEqual(componentACreated.measurements.length, 1);
    });

    it('should handle multiple measurements for same component and phase', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'Component', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 300,
          duration: 100,
          metadata: { componentName: 'Component', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 400,
          endTime: 450,
          duration: 50,
          metadata: { componentName: 'Component', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.groupMeasurementsByComponent();

      const stats = result.Component.created;
      assert.strictEqual(stats.count, 3);
      assert.strictEqual(stats.total, 200);
      assert.strictEqual(stats.average, 200 / 3);
      assert.strictEqual(stats.min, 50);
      assert.strictEqual(stats.max, 100);
      assert.strictEqual(stats.measurements.length, 3);
    });

    it('should filter out measurements without valid metadata', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'valid',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'Component', phase: 'created' }
        },
        {
          name: 'no-metadata',
          startTime: 100,
          endTime: 150,
          duration: 50
        },
        {
          name: 'empty-metadata',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: {}
        },
        {
          name: 'invalid-componentName',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: '', phase: 'created' }
        },
        {
          name: 'invalid-phase',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'Component', phase: '' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.groupMeasurementsByComponent();

      assert.strictEqual(Object.keys(result).length, 1);
      assert.notStrictEqual(result.Component, undefined);
      assert.strictEqual(result.Component.created.count, 1);
    });

    it('should handle measurements without duration', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'no-duration',
          startTime: 100,
          endTime: 150,
          metadata: { componentName: 'Component', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.groupMeasurementsByComponent();

      const stats = result.Component.created;
      assert.strictEqual(stats.total, 0);
      assert.strictEqual(stats.average, 0);
      assert.strictEqual(stats.min, 0);
      assert.strictEqual(stats.max, 0);
    });

    it('should return empty object when no valid measurements', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.groupMeasurementsByComponent();

      assert.deepStrictEqual(result, {});
    });
  });

  describe('getComponentStats', function () {
    it('should return stats for existing component', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'TestComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getComponentStats('TestComponent');

      assert.notStrictEqual(result, undefined);
      assert.notStrictEqual(result!.created, undefined);
      assert.strictEqual(result!.created.count, 1);
    });

    it('should return undefined for non-existing component', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.getComponentStats('NonExistentComponent');

      assert.strictEqual(result, undefined);
    });
  });

  describe('getPhaseStats', function () {
    it('should return stats for existing component and phase', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'TestComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getPhaseStats('TestComponent', 'created');

      assert.notStrictEqual(result, undefined);
      assert.strictEqual(result!.count, 1);
      assert.strictEqual(result!.total, 50);
    });

    it('should return undefined for non-existing component', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.getPhaseStats('NonExistentComponent', 'created');

      assert.strictEqual(result, undefined);
    });

    it('should return undefined for non-existing phase', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 150,
          duration: 50,
          metadata: { componentName: 'TestComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getPhaseStats('TestComponent', 'nonExistentPhase');

      assert.strictEqual(result, undefined);
    });
  });

  describe('getSlowestComponents', function () {
    it('should return components sorted by total time', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'FastComponent', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 400,
          duration: 300,
          metadata: { componentName: 'SlowComponent', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 250,
          duration: 150,
          metadata: { componentName: 'MediumComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getSlowestComponents(3);

      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, 'SlowComponent');
      assert.strictEqual(result[0].totalTime, 300);
      assert.strictEqual(result[1].name, 'MediumComponent');
      assert.strictEqual(result[1].totalTime, 150);
      assert.strictEqual(result[2].name, 'FastComponent');
      assert.strictEqual(result[2].totalTime, 100);
    });

    it('should aggregate multiple phases for same component', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 350,
          duration: 150,
          metadata: { componentName: 'Component', phase: 'bound' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getSlowestComponents(1);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].name, 'Component');
      assert.strictEqual(result[0].totalTime, 250);
      assert.notStrictEqual(result[0].phases.created, undefined);
      assert.notStrictEqual(result[0].phases.bound, undefined);
    });

    it('should respect limit parameter', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component1', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 300,
          duration: 200,
          metadata: { componentName: 'Component2', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 400,
          duration: 300,
          metadata: { componentName: 'Component3', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getSlowestComponents(2);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].name, 'Component3');
      assert.strictEqual(result[1].name, 'Component2');
    });

    it('should use default limit of 10', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [];
      for (let i = 0; i < 15; i++) {
        mockMeasurements.push({
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100 + i,
          metadata: { componentName: `Component${i}`, phase: 'created' }
        });
      }

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getSlowestComponents();

      assert.strictEqual(result.length, 10);
    });

    it('should return empty array when no measurements', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.getSlowestComponents();

      assert.strictEqual(result.length, 0);
      assert.instanceOf(result, Array);
    });
  });

  describe('getMostActiveComponents', function () {
    it('should return components sorted by execution count', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        // Component1: 1 execution
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component1', phase: 'created' }
        },
        // Component2: 3 executions
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component2', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 300,
          duration: 100,
          metadata: { componentName: 'Component2', phase: 'bound' }
        },
        {
          name: 'lifecycle',
          startTime: 300,
          endTime: 400,
          duration: 100,
          metadata: { componentName: 'Component2', phase: 'attached' }
        },
        // Component3: 2 executions
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component3', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 300,
          duration: 100,
          metadata: { componentName: 'Component3', phase: 'bound' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getMostActiveComponents(3);

      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].name, 'Component2');
      assert.strictEqual(result[0].totalExecutions, 3);
      assert.strictEqual(result[1].name, 'Component3');
      assert.strictEqual(result[1].totalExecutions, 2);
      assert.strictEqual(result[2].name, 'Component1');
      assert.strictEqual(result[2].totalExecutions, 1);
    });

    it('should respect limit parameter', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component1', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component2', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getMostActiveComponents(1);

      assert.strictEqual(result.length, 1);
    });

    it('should use default limit of 10', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [];
      for (let i = 0; i < 15; i++) {
        mockMeasurements.push({
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: `Component${i}`, phase: 'created' }
        });
      }

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.getMostActiveComponents();

      assert.strictEqual(result.length, 10);
    });
  });

  describe('logPerformanceSummary', function () {
    let consoleSpies: {
      group: any;
      groupEnd: any;
      log: any;
      warn: any;
    };

    beforeEach(function () {
      consoleSpies = {
        group: createSpy(console, 'group'),
        groupEnd: createSpy(console, 'groupEnd'),
        log: createSpy(console, 'log'),
        warn: createSpy(console, 'warn')
      };
    });

    it('should log warning when tracking is disabled', function () {
      mockConfig = createMockConfig({ enabled: false });
      utilities = new InsightsUtilities(mockTracker as any, mockConfig);

      utilities.logPerformanceSummary();

      assert.strictEqual(consoleSpies.warn.calls.length, 1);
      assert.strictEqual(consoleSpies.warn.calls[0][0], '🔍 Aurelia Performance Insights - Tracking is disabled');
    });

    it('should log performance summary when enabled', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'TestComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      utilities.logPerformanceSummary();

      assert.greaterThan(consoleSpies.group.calls.length, 0);
      assert.greaterThan(consoleSpies.groupEnd.calls.length, 0);
      assert.greaterThan(consoleSpies.log.calls.length, 0);
    });

    it('should log overview section', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component1', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 300,
          duration: 100,
          metadata: { componentName: 'Component2', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      utilities.logPerformanceSummary();

      const logCalls = consoleSpies.log.calls.map((call: any) => call[0]);
      assert.includes(logCalls, 'Total Components: 2');
      assert.includes(logCalls, 'Total Measurements: 2');
      assert.includes(logCalls, 'Tracking Enabled: ✅');
    });

    it('should log slowest components when available', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 400,
          duration: 300,
          metadata: { componentName: 'SlowComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      utilities.logPerformanceSummary();

      const groupCalls = consoleSpies.group.calls.map((call: any) => call[0]);
      const logCalls = consoleSpies.log.calls.map((call: any) => call[0]);
      assert.includes(groupCalls, '🐌 Slowest Components (by total time)');
      assert.includes(logCalls, '1. SlowComponent: 300.00ms');
    });

    it('should log most active components when available', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'ActiveComponent', phase: 'created' }
        },
        {
          name: 'lifecycle',
          startTime: 200,
          endTime: 300,
          duration: 100,
          metadata: { componentName: 'ActiveComponent', phase: 'bound' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      utilities.logPerformanceSummary();

      const groupCalls = consoleSpies.group.calls.map((call: any) => call[0]);
      const logCalls = consoleSpies.log.calls.map((call: any) => call[0]);
      assert.includes(groupCalls, '🔥 Most Active Components (by execution count)');
      assert.includes(logCalls, '1. ActiveComponent: 2 executions');
    });
  });

  describe('exportPerformanceData', function () {
    it('should export performance data as JSON string', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'lifecycle',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'TestComponent', phase: 'created' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.exportPerformanceData();

      assert.typeOf(result, 'string');
      const parsed = JSON.parse(result);

      assert.notStrictEqual(parsed.timestamp, undefined);
      assert.notStrictEqual(parsed.config, undefined);
      assert.notStrictEqual(parsed.measurements, undefined);
      assert.notStrictEqual(parsed.grouped, undefined);
      assert.notStrictEqual(parsed.slowest, undefined);
      assert.notStrictEqual(parsed.mostActive, undefined);
    });

    it('should include configuration in export', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.exportPerformanceData();
      const parsed = JSON.parse(result);

      assert.strictEqual(parsed.config.enabled, true);
      assert.strictEqual(parsed.config.trackName, 'Test');
      assert.strictEqual(parsed.config.trackGroup, 'TestGroup');
      assert.strictEqual(parsed.config.filtersApplied, 0);
    });

    it('should include filters count in export', function () {
      const configWithFilters = createMockConfig({
        filters: [
          { name: 'filter1', include: true, pattern: 'pattern1' },
          { name: 'filter2', include: false, pattern: 'pattern2' }
        ]
      });

      utilities = new InsightsUtilities(mockTracker as any, configWithFilters);
      mockTracker.setMockMeasurements([]);

      const result = utilities.exportPerformanceData();
      const parsed = JSON.parse(result);

      assert.strictEqual(parsed.config.filtersApplied, 2);
    });

    it('should be valid JSON', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.exportPerformanceData();

      assert.doesNotThrow(() => {
        JSON.parse(result);
      });
    });

    it('should include timestamp in ISO format', function () {
      mockTracker.setMockMeasurements([]);
      const result = utilities.exportPerformanceData();
      const parsed = JSON.parse(result);

      assert.typeOf(parsed.timestamp, 'string');
      assert.doesNotThrow(() => {
        new Date(parsed.timestamp);
      });
    });
  });

  describe('private helper methods validation', function () {
    it('should validate component measurements correctly through grouping', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        // Valid measurement
        {
          name: 'valid',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'ValidComponent', phase: 'created' }
        },
        // Invalid - no metadata
        {
          name: 'no-meta',
          startTime: 100,
          endTime: 200,
          duration: 100
        },
        // Invalid - null metadata
        {
          name: 'null-meta',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: null as any
        },
        // Invalid - wrong componentName type
        {
          name: 'wrong-type',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 123, phase: 'created' }
        },
        // Invalid - empty componentName
        {
          name: 'empty-name',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: '   ', phase: 'created' }
        },
        // Invalid - wrong phase type
        {
          name: 'wrong-phase-type',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component', phase: null }
        },
        // Invalid - empty phase
        {
          name: 'empty-phase',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: 'Component', phase: '   ' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.groupMeasurementsByComponent();

      // Only the valid measurement should be included
      assert.strictEqual(Object.keys(result).length, 1);
      assert.notStrictEqual(result.ValidComponent, undefined);
      assert.strictEqual(result.ValidComponent.created.count, 1);
    });

    it('should extract component names and phases with trimming', function () {
      const mockMeasurements: IPerformanceMeasurement[] = [
        {
          name: 'trimmed',
          startTime: 100,
          endTime: 200,
          duration: 100,
          metadata: { componentName: '  TrimmedComponent  ', phase: '  created  ' }
        }
      ];

      mockTracker.setMockMeasurements(mockMeasurements);
      const result = utilities.groupMeasurementsByComponent();

      assert.notStrictEqual(result.TrimmedComponent, undefined);
      assert.notStrictEqual(result.TrimmedComponent.created, undefined);
    });
  });
});

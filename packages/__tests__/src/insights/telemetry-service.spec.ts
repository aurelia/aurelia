import { Registration } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';

import {
  ITelemetryService,
  TelemetryService,
  IPerformanceTracker,
  ITelemetryMeter,
  IActivitySource,
  IPerformanceMeasurement
} from '@aurelia/insights';

// Mock implementations for testing
class MockPerformanceTracker implements Partial<IPerformanceTracker> {
  private measurements: IPerformanceMeasurement[] = [];
  private measurementId = 0;
  private enabled = true;

  public startMeasurement(name: string, metadata?: Record<string, unknown>): string {
    return `measurement_${++this.measurementId}`;
  }

  public endMeasurement(id: string): IPerformanceMeasurement | null {
    const measurement: IPerformanceMeasurement = {
      name: `test_${id}`,
      startTime: 100,
      endTime: 200,
      duration: 100,
      metadata: { measurementId: id }
    };
    this.measurements.push(measurement);
    return measurement;
  }

  public addMeasurement(measurement: IPerformanceMeasurement): void {
    this.measurements.push(measurement);
  }

  public addInstantMeasurement(name: string, metadata?: Record<string, unknown>): void {
    const measurement: IPerformanceMeasurement = {
      name,
      startTime: 100,
      endTime: 100,
      duration: 0,
      metadata
    };
    this.measurements.push(measurement);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public debug(): void {}

  public getMeasurements(): readonly IPerformanceMeasurement[] {
    return this.measurements;
  }

  public clear(): void {
    this.measurements = [];
  }
}

describe('insights/telemetry-service.spec.ts', function () {
  let ctx: TestContext;
  let mockTracker: MockPerformanceTracker;
  let telemetryService: ITelemetryService;

  beforeEach(function () {
    ctx = TestContext.create();
    mockTracker = new MockPerformanceTracker();

    ctx.container.register(
      Registration.instance(IPerformanceTracker, mockTracker),
      Registration.singleton(ITelemetryService, TelemetryService)
    );

    telemetryService = ctx.container.get(ITelemetryService);
  });

  describe('TelemetryService - Meter Management', function () {
    describe('createMeter', function () {
      it('should create a new meter with name and version', function () {
        const meter = telemetryService.createMeter('test-meter', '1.0.0');

        assert.strictEqual(meter.name, 'test-meter');
        assert.strictEqual(meter.version, '1.0.0');
      });

      it('should create meter with default version when not specified', function () {
        const meter = telemetryService.createMeter('test-meter');

        assert.strictEqual(meter.name, 'test-meter');
        assert.strictEqual(meter.version, '1.0.0');
      });

      it('should return same meter instance for same name and version', function () {
        const meter1 = telemetryService.createMeter('test-meter', '1.0.0');
        const meter2 = telemetryService.createMeter('test-meter', '1.0.0');

        assert.strictEqual(meter1, meter2);
      });

      it('should return different meter instances for different names', function () {
        const meter1 = telemetryService.createMeter('meter-one', '1.0.0');
        const meter2 = telemetryService.createMeter('meter-two', '1.0.0');

        assert.notStrictEqual(meter1, meter2);
      });

      it('should return different meter instances for different versions', function () {
        const meter1 = telemetryService.createMeter('test-meter', '1.0.0');
        const meter2 = telemetryService.createMeter('test-meter', '2.0.0');

        assert.notStrictEqual(meter1, meter2);
      });
    });

    describe('getMeter', function () {
      it('should create and return meter if it does not exist', function () {
        const meter = telemetryService.getMeter('new-meter', '1.0.0');

        assert.strictEqual(meter.name, 'new-meter');
        assert.strictEqual(meter.version, '1.0.0');
      });

      it('should return existing meter if it already exists', function () {
        const createdMeter = telemetryService.createMeter('existing-meter', '1.0.0');
        const retrievedMeter = telemetryService.getMeter('existing-meter', '1.0.0');

        assert.strictEqual(createdMeter, retrievedMeter);
      });

      it('should use default version when not specified', function () {
        const meter1 = telemetryService.getMeter('test-meter');
        const meter2 = telemetryService.getMeter('test-meter', '1.0.0');

        assert.strictEqual(meter1, meter2);
      });
    });

    describe('getMeters', function () {
      it('should return empty array when no meters are created', function () {
        const meters = telemetryService.getMeters();

        assert.instanceOf(meters, Array);
        assert.strictEqual(meters.length, 0);
      });

      it('should return array with created meters', function () {
        telemetryService.createMeter('meter-one', '1.0.0');
        telemetryService.createMeter('meter-two', '1.0.0');
        telemetryService.createMeter('meter-three', '2.0.0');

        const meters = telemetryService.getMeters();

        assert.strictEqual(meters.length, 3);
      });

      it('should return readonly array', function () {
        telemetryService.createMeter('test-meter', '1.0.0');
        const meters = telemetryService.getMeters();

        // Attempting to modify should not affect the internal collection
        const mockMeter: ITelemetryMeter = {
          name: 'mock',
          version: '1.0.0',
          createCounter: () => ({} as any),
          createHistogram: () => ({} as any),
          createGauge: () => ({} as any),
          recordEvent: () => {}
        };
        (meters as ITelemetryMeter[]).push(mockMeter);
        const metersAgain = telemetryService.getMeters();

        assert.strictEqual(metersAgain.length, 1);
      });
    });
  });

  describe('TelemetryService - Activity Source Management', function () {
    describe('createActivitySource', function () {
      it('should create a new activity source with name and version', function () {
        const activitySource = telemetryService.createActivitySource('test-source', '1.0.0');

        assert.strictEqual(activitySource.name, 'test-source');
        assert.strictEqual(activitySource.version, '1.0.0');
      });

      it('should create activity source with default version when not specified', function () {
        const activitySource = telemetryService.createActivitySource('test-source');

        assert.strictEqual(activitySource.name, 'test-source');
        assert.strictEqual(activitySource.version, '1.0.0');
      });

      it('should return same activity source instance for same name and version', function () {
        const source1 = telemetryService.createActivitySource('test-source', '1.0.0');
        const source2 = telemetryService.createActivitySource('test-source', '1.0.0');

        assert.strictEqual(source1, source2);
      });

      it('should return different activity source instances for different names', function () {
        const source1 = telemetryService.createActivitySource('source-one', '1.0.0');
        const source2 = telemetryService.createActivitySource('source-two', '1.0.0');

        assert.notStrictEqual(source1, source2);
      });

      it('should return different activity source instances for different versions', function () {
        const source1 = telemetryService.createActivitySource('test-source', '1.0.0');
        const source2 = telemetryService.createActivitySource('test-source', '2.0.0');

        assert.notStrictEqual(source1, source2);
      });
    });

    describe('getActivitySource', function () {
      it('should create and return activity source if it does not exist', function () {
        const activitySource = telemetryService.getActivitySource('new-source', '1.0.0');

        assert.strictEqual(activitySource.name, 'new-source');
        assert.strictEqual(activitySource.version, '1.0.0');
      });

      it('should return existing activity source if it already exists', function () {
        const createdSource = telemetryService.createActivitySource('existing-source', '1.0.0');
        const retrievedSource = telemetryService.getActivitySource('existing-source', '1.0.0');

        assert.strictEqual(createdSource, retrievedSource);
      });

      it('should use default version when not specified', function () {
        const source1 = telemetryService.getActivitySource('test-source');
        const source2 = telemetryService.getActivitySource('test-source', '1.0.0');

        assert.strictEqual(source1, source2);
      });
    });

    describe('getActivitySources', function () {
      it('should return empty array when no activity sources are created', function () {
        const sources = telemetryService.getActivitySources();

        assert.instanceOf(sources, Array);
        assert.strictEqual(sources.length, 0);
      });

      it('should return array with created activity sources', function () {
        telemetryService.createActivitySource('source-one', '1.0.0');
        telemetryService.createActivitySource('source-two', '1.0.0');
        telemetryService.createActivitySource('source-three', '2.0.0');

        const sources = telemetryService.getActivitySources();

        assert.strictEqual(sources.length, 3);
      });

      it('should return readonly array', function () {
        telemetryService.createActivitySource('test-source', '1.0.0');
        const sources = telemetryService.getActivitySources();

        // Attempting to modify should not affect the internal collection
        const mockSource: IActivitySource = {
          name: 'mock',
          version: '1.0.0',
          startActivity: () => null
        };
        (sources as IActivitySource[]).push(mockSource);
        const sourcesAgain = telemetryService.getActivitySources();

        assert.strictEqual(sourcesAgain.length, 1);
      });
    });
  });

  describe('TelemetryService - Integration Tests', function () {
    describe('meter functionality', function () {
      it('should create functional meters that record events', function () {
        const meter = telemetryService.createMeter('integration-meter', '1.0.0');

        // This should not throw
        meter.recordEvent('test-event', { key: 'value' });

        // Verify the event was recorded through the performance tracker
        const measurements = mockTracker.getMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'integration-meter.test-event');
      });

      it('should create functional counters through meters', function () {
        const meter = telemetryService.createMeter('counter-meter', '1.0.0');
        const counter = meter.createCounter('test-counter');

        // This should not throw
        counter.add(5, { operation: 'test' });

        // Verify the counter increment was recorded
        const measurements = mockTracker.getMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'counter-meter.test-counter');
      });
    });

    describe('activity source functionality', function () {
      it('should create functional activity sources that start activities', function () {
        mockTracker.setEnabled(true);
        const source = telemetryService.createActivitySource('integration-source', '1.0.0');

        const activity = source.startActivity('test-activity', { userId: '123' });

        assert.notStrictEqual(activity, null);
        assert.strictEqual(activity!.name, 'test-activity');
        assert.strictEqual(activity!.isRecording, true);

        // Clean up
        activity!.dispose();
      });

      it('should return null activity when tracking is disabled', function () {
        mockTracker.setEnabled(false);
        const source = telemetryService.createActivitySource('disabled-source', '1.0.0');

        const activity = source.startActivity('test-activity');

        assert.strictEqual(activity, null);
      });
    });
  });

  describe('TelemetryService - Cleanup and Disposal', function () {
    describe('clear', function () {
      it('should clear all meters and activity sources', function () {
        telemetryService.createMeter('meter-1', '1.0.0');
        telemetryService.createMeter('meter-2', '2.0.0');
        telemetryService.createActivitySource('source-1', '1.0.0');
        telemetryService.createActivitySource('source-2', '2.0.0');

        assert.strictEqual(telemetryService.getMeters().length, 2);
        assert.strictEqual(telemetryService.getActivitySources().length, 2);

        telemetryService.clear();

        assert.strictEqual(telemetryService.getMeters().length, 0);
        assert.strictEqual(telemetryService.getActivitySources().length, 0);
      });

      it('should allow creating new meters and sources after clearing', function () {
        telemetryService.createMeter('old-meter', '1.0.0');
        telemetryService.clear();

        const newMeter = telemetryService.createMeter('new-meter', '1.0.0');
        const newSource = telemetryService.createActivitySource('new-source', '1.0.0');

        assert.notStrictEqual(newMeter, null);
        assert.notStrictEqual(newSource, null);
        assert.strictEqual(telemetryService.getMeters().length, 1);
        assert.strictEqual(telemetryService.getActivitySources().length, 1);
      });
    });

    describe('dispose', function () {
      it('should implement IDisposable and clear all resources', function () {
        const service = telemetryService as TelemetryService;

        telemetryService.createMeter('disposable-meter', '1.0.0');
        telemetryService.createActivitySource('disposable-source', '1.0.0');

        assert.strictEqual(telemetryService.getMeters().length, 1);
        assert.strictEqual(telemetryService.getActivitySources().length, 1);

        service.dispose();

        assert.strictEqual(telemetryService.getMeters().length, 0);
        assert.strictEqual(telemetryService.getActivitySources().length, 0);
      });
    });
  });

  describe('TelemetryService - Edge Cases and Error Handling', function () {
    describe('empty and special names', function () {
      it('should handle empty meter names', function () {
        const meter = telemetryService.createMeter('', '1.0.0');

        assert.strictEqual(meter.name, '');
        assert.strictEqual(meter.version, '1.0.0');
      });

      it('should handle empty activity source names', function () {
        const source = telemetryService.createActivitySource('', '1.0.0');

        assert.strictEqual(source.name, '');
        assert.strictEqual(source.version, '1.0.0');
      });

      it('should handle special characters in names', function () {
        const meterName = 'test@meter#special$chars%';
        const sourceName = 'test@source#special$chars%';

        const meter = telemetryService.createMeter(meterName, '1.0.0');
        const source = telemetryService.createActivitySource(sourceName, '1.0.0');

        assert.strictEqual(meter.name, meterName);
        assert.strictEqual(source.name, sourceName);
        assert.strictEqual(meter.version, '1.0.0');
        assert.strictEqual(source.version, '1.0.0');
      });
    });

    describe('version handling', function () {
      it('should handle empty version strings', function () {
        const meter = telemetryService.createMeter('test-meter', '');
        const source = telemetryService.createActivitySource('test-source', '');

        assert.strictEqual(meter.name, 'test-meter');
        assert.strictEqual(source.name, 'test-source');
        assert.strictEqual(meter.version, '');
        assert.strictEqual(source.version, '');
      });

      it('should treat different empty-like versions as different', function () {
        const meter1 = telemetryService.createMeter('test-meter', '');
        const meter2 = telemetryService.createMeter('test-meter', ' ');
        const meter3 = telemetryService.createMeter('test-meter');

        assert.notStrictEqual(meter1, meter2);
        assert.notStrictEqual(meter1, meter3);
        assert.notStrictEqual(meter2, meter3);
      });
    });

    describe('concurrent operations', function () {
      it('should handle multiple operations on same instances', function () {
        const meter = telemetryService.createMeter('concurrent-meter', '1.0.0');
        const source = telemetryService.createActivitySource('concurrent-source', '1.0.0');

        // Multiple rapid operations should not cause issues
        meter.recordEvent('event1');
        meter.recordEvent('event2');
        meter.recordEvent('event3');

        const activity1 = source.startActivity('activity1');
        const activity2 = source.startActivity('activity2');

        assert.notStrictEqual(activity1, null);
        assert.notStrictEqual(activity2, null);

        // Clean up
        activity1?.dispose();
        activity2?.dispose();
      });
    });
  });

  describe('TelemetryService - Dependency Injection', function () {
    describe('performance tracker dependency', function () {
      it('should use injected performance tracker', function () {
        const meter = telemetryService.createMeter('di-test-meter', '1.0.0');
        meter.recordEvent('di-test-event');

        // Verify our mock tracker was used
        const measurements = mockTracker.getMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'di-test-meter.di-test-event');
      });

      it('should work with tracker state changes', function () {
        const source = telemetryService.createActivitySource('tracker-state-test', '1.0.0');

        // When tracker is enabled
        mockTracker.setEnabled(true);
        const activity1 = source.startActivity('enabled-activity');
        assert.notStrictEqual(activity1, null);
        activity1?.dispose();

        // When tracker is disabled
        mockTracker.setEnabled(false);
        const activity2 = source.startActivity('disabled-activity');
        assert.strictEqual(activity2, null);
      });
    });

    describe('service lifecycle', function () {
      it('should be properly registered as singleton', function () {
        const service1 = ctx.container.get(ITelemetryService);
        const service2 = ctx.container.get(ITelemetryService);

        assert.strictEqual(service1, service2);
      });

      it('should maintain state across multiple retrievals', function () {
        const service1 = ctx.container.get(ITelemetryService);
        service1.createMeter('persistent-meter', '1.0.0');

        const service2 = ctx.container.get(ITelemetryService);
        const meters = service2.getMeters();

        assert.strictEqual(meters.length, 1);
      });
    });
  });
});

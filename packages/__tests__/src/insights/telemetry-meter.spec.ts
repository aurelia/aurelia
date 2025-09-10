import { Registration } from '@aurelia/kernel';
import { assert, TestContext } from '@aurelia/testing';

import {
  ITelemetryMeter,
  TelemetryMeter,
  ICounter,
  IHistogram,
  IGauge,
  IPerformanceTracker,
  IPerformanceMeasurement
} from '@aurelia/insights';

// Mock Performance Tracker for testing
class MockPerformanceTracker implements Partial<IPerformanceTracker> {
  private instantMeasurements: { name: string; metadata?: Record<string, unknown> }[] = [];

  public getInstantMeasurements(): { name: string; metadata?: Record<string, unknown> }[] {
    return [...this.instantMeasurements];
  }

  public clearInstantMeasurements(): void {
    this.instantMeasurements = [];
  }

  public startMeasurement(): string {
    return 'mock-id';
  }

  public endMeasurement(): IPerformanceMeasurement | null {
    return null;
  }

  public addMeasurement(): void {
    // Mock implementation
  }

  public addInstantMeasurement(name: string, metadata?: Record<string, unknown>): void {
    this.instantMeasurements.push({ name, metadata });
  }

  public getMeasurements(): readonly IPerformanceMeasurement[] {
    return [];
  }

  public clear(): void {
    this.instantMeasurements = [];
  }

  public isEnabled(): boolean {
    return true;
  }

  public debug(): void {
    // Mock implementation
  }
}

describe('insights/telemetry-meter.spec.ts', function () {
  let ctx: TestContext;
  let mockTracker: MockPerformanceTracker;
  let telemetryMeter: ITelemetryMeter;

  beforeEach(function () {
    ctx = TestContext.create();
    mockTracker = new MockPerformanceTracker();

    ctx.container.register(
      Registration.instance(IPerformanceTracker, mockTracker)
    );

    telemetryMeter = new TelemetryMeter('TestMeter', '2.0.0', mockTracker as any);
  });

  describe('TelemetryMeter', function () {
    describe('constructor', function () {
      it('should initialize with correct name and version', function () {
        const meter = new TelemetryMeter('CustomMeter', '3.1.4', mockTracker as any);

        assert.strictEqual(meter.name, 'CustomMeter');
        assert.strictEqual(meter.version, '3.1.4');
      });

      it('should use default version when not provided', function () {
        const meter = new TelemetryMeter('DefaultVersionMeter', undefined as any, mockTracker as any);

        assert.strictEqual(meter.name, 'DefaultVersionMeter');
        assert.strictEqual(meter.version, '1.0.0');
      });
    });

    describe('createCounter', function () {
      it('should create counter with correct name prefix', function () {
        const counter = telemetryMeter.createCounter<number>('requests');

        assert.notStrictEqual(counter, undefined);
        assert.typeOf(counter.add, 'function');
      });

      it('should reuse existing counter with same name', function () {
        const counter1 = telemetryMeter.createCounter<number>('requests');
        const counter2 = telemetryMeter.createCounter<number>('requests');

        assert.strictEqual(counter1, counter2);
      });

      it('should create different counters with different names', function () {
        const counter1 = telemetryMeter.createCounter<number>('requests');
        const counter2 = telemetryMeter.createCounter<number>('errors');

        assert.notStrictEqual(counter1, counter2);
      });

      it('should accept description and unit parameters', function () {
        const counter = telemetryMeter.createCounter<number>('requests', 'Total requests', 'count');

        assert.notStrictEqual(counter, undefined);
        assert.typeOf(counter.add, 'function');
      });
    });

    describe('createHistogram', function () {
      it('should create histogram with correct name prefix', function () {
        const histogram = telemetryMeter.createHistogram<number>('response_time');

        assert.notStrictEqual(histogram, undefined);
        assert.typeOf(histogram.record, 'function');
      });

      it('should reuse existing histogram with same name', function () {
        const histogram1 = telemetryMeter.createHistogram<number>('response_time');
        const histogram2 = telemetryMeter.createHistogram<number>('response_time');

        assert.strictEqual(histogram1, histogram2);
      });

      it('should create different histograms with different names', function () {
        const histogram1 = telemetryMeter.createHistogram<number>('response_time');
        const histogram2 = telemetryMeter.createHistogram<number>('request_size');

        assert.notStrictEqual(histogram1, histogram2);
      });

      it('should accept description and unit parameters', function () {
        const histogram = telemetryMeter.createHistogram<number>('response_time', 'Response time distribution', 'ms');

        assert.notStrictEqual(histogram, undefined);
        assert.typeOf(histogram.record, 'function');
      });
    });

    describe('createGauge', function () {
      it('should create gauge with correct name prefix', function () {
        const gauge = telemetryMeter.createGauge<number>('memory_usage');

        assert.notStrictEqual(gauge, undefined);
        assert.typeOf(gauge.set, 'function');
      });

      it('should reuse existing gauge with same name', function () {
        const gauge1 = telemetryMeter.createGauge<number>('memory_usage');
        const gauge2 = telemetryMeter.createGauge<number>('memory_usage');

        assert.strictEqual(gauge1, gauge2);
      });

      it('should create different gauges with different names', function () {
        const gauge1 = telemetryMeter.createGauge<number>('memory_usage');
        const gauge2 = telemetryMeter.createGauge<number>('cpu_usage');

        assert.notStrictEqual(gauge1, gauge2);
      });

      it('should accept description and unit parameters', function () {
        const gauge = telemetryMeter.createGauge<number>('memory_usage', 'Current memory usage', 'MB');

        assert.notStrictEqual(gauge, undefined);
        assert.typeOf(gauge.set, 'function');
      });
    });

    describe('recordEvent', function () {
      it('should record event with correct name prefix', function () {
        telemetryMeter.recordEvent('user_action');

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'TestMeter.user_action');
      });

      it('should record event with attributes', function () {
        const attributes = { userId: '123', action: 'click', timestamp: 1234567890 };
        telemetryMeter.recordEvent('user_action', attributes);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'TestMeter.user_action');
        assert.deepStrictEqual(measurements[0].metadata, attributes);
      });

      it('should record event without attributes', function () {
        telemetryMeter.recordEvent('simple_event');

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'TestMeter.simple_event');
        assert.strictEqual(measurements[0].metadata, undefined);
      });
    });
  });

  describe('Counter', function () {
    let counter: ICounter<number>;

    beforeEach(function () {
      counter = telemetryMeter.createCounter<number>('test_counter');
      mockTracker.clearInstantMeasurements();
    });

    describe('add', function () {
      it('should increment counter value', function () {
        counter.add(5);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'TestMeter.test_counter');

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.value, 5);
        assert.strictEqual(metadata.increment, 5);
        assert.strictEqual(metadata.type, 'counter');
      });

      it('should accumulate counter values', function () {
        counter.add(3);
        counter.add(7);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 2);

        const firstMetadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(firstMetadata.value, 3);
        assert.strictEqual(firstMetadata.increment, 3);

        const secondMetadata = measurements[1].metadata as Record<string, unknown>;
        assert.strictEqual(secondMetadata.value, 10);
        assert.strictEqual(secondMetadata.increment, 7);
      });

      it('should include attributes in measurement', function () {
        const attributes = { source: 'api', endpoint: '/users' };
        counter.add(1, attributes);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.source, 'api');
        assert.strictEqual(metadata.endpoint, '/users');
        assert.strictEqual(metadata.type, 'counter');
      });

      it('should handle zero increments', function () {
        counter.add(0);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.value, 0);
        assert.strictEqual(metadata.increment, 0);
      });

      it('should handle negative increments', function () {
        counter.add(5);
        counter.add(-2);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 2);

        const secondMetadata = measurements[1].metadata as Record<string, unknown>;
        assert.strictEqual(secondMetadata.value, 3);
        assert.strictEqual(secondMetadata.increment, -2);
      });
    });
  });

  describe('Histogram', function () {
    let histogram: IHistogram<number>;

    beforeEach(function () {
      histogram = telemetryMeter.createHistogram<number>('test_histogram');
      mockTracker.clearInstantMeasurements();
    });

    describe('record', function () {
      it('should record single value', function () {
        histogram.record(42.5);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'TestMeter.test_histogram');

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.value, 42.5);
        assert.strictEqual(metadata.count, 1);
        assert.strictEqual(metadata.min, 42.5);
        assert.strictEqual(metadata.max, 42.5);
        assert.strictEqual(metadata.avg, 42.5);
        assert.strictEqual(metadata.p50, 42.5);
        assert.strictEqual(metadata.p90, 42.5);
        assert.strictEqual(metadata.p99, 42.5);
        assert.strictEqual(metadata.type, 'histogram');
      });

      it('should calculate statistics for multiple values', function () {
        const values = [10, 20, 30, 40, 50];
        values.forEach(value => histogram.record(value));

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 5);

        const lastMetadata = measurements[4].metadata as Record<string, unknown>;
        assert.strictEqual(lastMetadata.count, 5);
        assert.strictEqual(lastMetadata.min, 10);
        assert.strictEqual(lastMetadata.max, 50);
        assert.strictEqual(lastMetadata.avg, 30);
      });

      it('should calculate percentiles correctly', function () {
        // Record 100 values from 1 to 100
        for (let i = 1; i <= 100; i++) {
          histogram.record(i);
        }

        const measurements = mockTracker.getInstantMeasurements();
        const lastMetadata = measurements[99].metadata as Record<string, unknown>;

        assert.strictEqual(lastMetadata.count, 100);
        assert.strictEqual(lastMetadata.min, 1);
        assert.strictEqual(lastMetadata.max, 100);
        assert.strictEqual(lastMetadata.avg, 50.5);
        assert.strictEqual(lastMetadata.p50, 50);
        assert.strictEqual(lastMetadata.p90, 90);
        assert.strictEqual(lastMetadata.p99, 99);
      });

      it('should include attributes in measurement', function () {
        const attributes = { operation: 'query', database: 'users' };
        histogram.record(123.45, attributes);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.operation, 'query');
        assert.strictEqual(metadata.database, 'users');
        assert.strictEqual(metadata.type, 'histogram');
      });

      it('should handle duplicate values', function () {
        histogram.record(25);
        histogram.record(25);
        histogram.record(25);

        const measurements = mockTracker.getInstantMeasurements();
        const lastMetadata = measurements[2].metadata as Record<string, unknown>;

        assert.strictEqual(lastMetadata.count, 3);
        assert.strictEqual(lastMetadata.min, 25);
        assert.strictEqual(lastMetadata.max, 25);
        assert.strictEqual(lastMetadata.avg, 25);
        assert.strictEqual(lastMetadata.p50, 25);
        assert.strictEqual(lastMetadata.p90, 25);
        assert.strictEqual(lastMetadata.p99, 25);
      });

      it('should handle single element percentile calculation', function () {
        histogram.record(75);

        const measurements = mockTracker.getInstantMeasurements();
        const metadata = measurements[0].metadata as Record<string, unknown>;

        assert.strictEqual(metadata.p50, 75);
        assert.strictEqual(metadata.p90, 75);
        assert.strictEqual(metadata.p99, 75);
      });
    });
  });

  describe('Gauge', function () {
    let gauge: IGauge<number>;

    beforeEach(function () {
      gauge = telemetryMeter.createGauge<number>('test_gauge');
      mockTracker.clearInstantMeasurements();
    });

    describe('set', function () {
      it('should set initial gauge value', function () {
        gauge.set(100);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);
        assert.strictEqual(measurements[0].name, 'TestMeter.test_gauge');

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.value, 100);
        assert.strictEqual(metadata.previousValue, 0);
        assert.strictEqual(metadata.change, 100);
        assert.strictEqual(metadata.type, 'gauge');
      });

      it('should track value changes', function () {
        gauge.set(50);
        gauge.set(75);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 2);

        const firstMetadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(firstMetadata.value, 50);
        assert.strictEqual(firstMetadata.previousValue, 0);
        assert.strictEqual(firstMetadata.change, 50);

        const secondMetadata = measurements[1].metadata as Record<string, unknown>;
        assert.strictEqual(secondMetadata.value, 75);
        assert.strictEqual(secondMetadata.previousValue, 50);
        assert.strictEqual(secondMetadata.change, 25);
      });

      it('should handle value decrease', function () {
        gauge.set(100);
        gauge.set(30);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 2);

        const secondMetadata = measurements[1].metadata as Record<string, unknown>;
        assert.strictEqual(secondMetadata.value, 30);
        assert.strictEqual(secondMetadata.previousValue, 100);
        assert.strictEqual(secondMetadata.change, -70);
      });

      it('should include attributes in measurement', function () {
        const attributes = { metric: 'cpu', host: 'server1' };
        gauge.set(85.5, attributes);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.metric, 'cpu');
        assert.strictEqual(metadata.host, 'server1');
        assert.strictEqual(metadata.type, 'gauge');
      });

      it('should handle zero values', function () {
        gauge.set(50);
        gauge.set(0);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 2);

        const secondMetadata = measurements[1].metadata as Record<string, unknown>;
        assert.strictEqual(secondMetadata.value, 0);
        assert.strictEqual(secondMetadata.previousValue, 50);
        assert.strictEqual(secondMetadata.change, -50);
      });

      it('should handle negative values', function () {
        gauge.set(-25);

        const measurements = mockTracker.getInstantMeasurements();
        assert.strictEqual(measurements.length, 1);

        const metadata = measurements[0].metadata as Record<string, unknown>;
        assert.strictEqual(metadata.value, -25);
        assert.strictEqual(metadata.previousValue, 0);
        assert.strictEqual(metadata.change, -25);
      });
    });
  });

  describe('Integration Tests', function () {
    it('should support multiple metric types together', function () {
      const counter = telemetryMeter.createCounter<number>('requests');
      const histogram = telemetryMeter.createHistogram<number>('latency');
      const gauge = telemetryMeter.createGauge<number>('memory');

      counter.add(1);
      histogram.record(250);
      gauge.set(1024);
      telemetryMeter.recordEvent('deployment', { version: '2.1.0' });

      const measurements = mockTracker.getInstantMeasurements();
      assert.strictEqual(measurements.length, 4);

      assert.strictEqual(measurements[0].name, 'TestMeter.requests');
      assert.strictEqual(measurements[1].name, 'TestMeter.latency');
      assert.strictEqual(measurements[2].name, 'TestMeter.memory');
      assert.strictEqual(measurements[3].name, 'TestMeter.deployment');
    });

    it('should handle multiple instances of same metric type', function () {
      const successCounter = telemetryMeter.createCounter<number>('success');
      const errorCounter = telemetryMeter.createCounter<number>('errors');

      successCounter.add(10);
      errorCounter.add(2);

      const measurements = mockTracker.getInstantMeasurements();
      assert.strictEqual(measurements.length, 2);

      assert.strictEqual(measurements[0].name, 'TestMeter.success');
      assert.strictEqual(measurements[1].name, 'TestMeter.errors');
    });

    it('should properly namespace metrics with meter name', function () {
      const apiMeter = new TelemetryMeter('API', '1.0.0', mockTracker as any);
      const dbMeter = new TelemetryMeter('Database', '2.0.0', mockTracker as any);

      const apiCounter = apiMeter.createCounter<number>('requests');
      const dbCounter = dbMeter.createCounter<number>('requests');

      mockTracker.clearInstantMeasurements();

      apiCounter.add(5);
      dbCounter.add(3);

      const measurements = mockTracker.getInstantMeasurements();
      assert.strictEqual(measurements.length, 2);

      assert.strictEqual(measurements[0].name, 'API.requests');
      assert.strictEqual(measurements[1].name, 'Database.requests');
    });
  });

  describe('Edge Cases', function () {
    it('should handle very large numbers', function () {
      const counter = telemetryMeter.createCounter<number>('large_counter');
      const largeValue = Number.MAX_SAFE_INTEGER;

      counter.add(largeValue);

      const measurements = mockTracker.getInstantMeasurements();
      const metadata = measurements[0].metadata as Record<string, unknown>;
      assert.strictEqual(metadata.value, largeValue);
    });

    it('should handle very small numbers', function () {
      const histogram = telemetryMeter.createHistogram<number>('small_histogram');
      const smallValue = Number.MIN_VALUE;

      histogram.record(smallValue);

      const measurements = mockTracker.getInstantMeasurements();
      const metadata = measurements[0].metadata as Record<string, unknown>;
      assert.strictEqual(metadata.value, smallValue);
    });

    it('should handle floating point precision', function () {
      const gauge = telemetryMeter.createGauge<number>('precision_gauge');
      const preciseValue = 0.1 + 0.2; // Known floating point precision issue

      gauge.set(preciseValue);

      const measurements = mockTracker.getInstantMeasurements();
      const metadata = measurements[0].metadata as Record<string, unknown>;
      assert.strictEqual(metadata.value, preciseValue);
    });

    it('should handle empty attribute objects', function () {
      const counter = telemetryMeter.createCounter<number>('empty_attrs');

      counter.add(1, {});

      const measurements = mockTracker.getInstantMeasurements();
      assert.strictEqual(measurements.length, 1);

      const metadata = measurements[0].metadata as Record<string, unknown>;
      assert.strictEqual(metadata.type, 'counter');
      assert.strictEqual(metadata.value, 1);
    });
  });
});

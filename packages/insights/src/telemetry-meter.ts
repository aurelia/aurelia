/**
 * Telemetry meter for custom application metrics
 * Inspired by .NET Core's telemetry approach
 */
export interface ITelemetryMeter {
  /**
   * The name of this telemetry meter
   */
  readonly name: string;

  /**
   * The version of this telemetry meter
   */
  readonly version: string;

  /**
   * Creates a counter metric for tracking incremental values
   */
  createCounter<T extends number>(name: string, description?: string, unit?: string): ICounter<T>;

  /**
   * Creates a histogram metric for tracking value distributions
   */
  createHistogram<T extends number>(name: string, description?: string, unit?: string): IHistogram<T>;

  /**
   * Creates a gauge metric for tracking current values
   */
  createGauge<T extends number>(name: string, description?: string, unit?: string): IGauge<T>;

  /**
   * Records an event with optional attributes
   */
  recordEvent(name: string, attributes?: Record<string, string | number | boolean>): void;
}

/**
 * Counter metric interface
 */
export interface ICounter<T extends number> {
  /**
   * Increments the counter by the specified amount
   */
  add(value: T, attributes?: Record<string, string | number | boolean>): void;
}

/**
 * Histogram metric interface
 */
export interface IHistogram<T extends number> {
  /**
   * Records a value in the histogram
   */
  record(value: T, attributes?: Record<string, string | number | boolean>): void;
}

/**
 * Gauge metric interface
 */
export interface IGauge<T extends number> {
  /**
   * Sets the current gauge value
   */
  set(value: T, attributes?: Record<string, string | number | boolean>): void;
}

/**
 * Telemetry meter implementation
 */
export class TelemetryMeter implements ITelemetryMeter {
  private readonly counters = new Map<string, Counter>();
  private readonly histograms = new Map<string, Histogram>();
  private readonly gauges = new Map<string, Gauge>();

  public constructor(
    public readonly name: string,
    public readonly version: string = '1.0.0',
    private readonly tracker: IPerformanceTracker
  ) {}

  public createCounter<T extends number>(
    name: string,
    description?: string,
    unit?: string
  ): ICounter<T> {
    const fullName = `${this.name}.${name}`;

    if (!this.counters.has(fullName)) {
      this.counters.set(fullName, new Counter(fullName, description, unit, this.tracker));
    }

    return this.counters.get(fullName)! as ICounter<T>;
  }

  public createHistogram<T extends number>(
    name: string,
    description?: string,
    unit?: string
  ): IHistogram<T> {
    const fullName = `${this.name}.${name}`;

    if (!this.histograms.has(fullName)) {
      this.histograms.set(fullName, new Histogram(fullName, description, unit, this.tracker));
    }

    return this.histograms.get(fullName)! as IHistogram<T>;
  }

  public createGauge<T extends number>(
    name: string,
    description?: string,
    unit?: string
  ): IGauge<T> {
    const fullName = `${this.name}.${name}`;

    if (!this.gauges.has(fullName)) {
      this.gauges.set(fullName, new Gauge(fullName, description, unit, this.tracker));
    }

    return this.gauges.get(fullName)! as IGauge<T>;
  }

  public recordEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
    const fullName = `${this.name}.${name}`;
    this.tracker.addInstantMeasurement(fullName, attributes);
  }
}

/**
 * Counter implementation
 */
class Counter implements ICounter<number> {
  private value = 0;

  public constructor(
    private readonly name: string,
    private readonly description?: string,
    private readonly unit?: string,
    private readonly tracker?: IPerformanceTracker
  ) {}

  public add(value: number, attributes?: Record<string, string | number | boolean>): void {
    this.value += value;

    this.tracker?.addInstantMeasurement(`${this.name}`, {
      value: this.value,
      increment: value,
      type: 'counter',
      description: this.description,
      unit: this.unit,
      ...attributes
    });
  }
}

/**
 * Histogram implementation
 */
class Histogram implements IHistogram<number> {
  private readonly values: number[] = [];

  public constructor(
    private readonly name: string,
    private readonly description?: string,
    private readonly unit?: string,
    private readonly tracker?: IPerformanceTracker
  ) {}

  public record(value: number, attributes?: Record<string, string | number | boolean>): void {
    this.values.push(value);

    const stats = this.calculateStats();

    this.tracker?.addInstantMeasurement(`${this.name}`, {
      value,
      count: this.values.length,
      min: stats.min,
      max: stats.max,
      avg: stats.avg,
      p50: stats.p50,
      p90: stats.p90,
      p99: stats.p99,
      type: 'histogram',
      description: this.description,
      unit: this.unit,
      ...attributes
    });
  }

  private calculateStats() {
    if (this.values.length === 0) {
      return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p99: 0 };
    }

    const sorted = [...this.values].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: sum / sorted.length,
      p50: this.percentile(sorted, 0.5),
      p90: this.percentile(sorted, 0.9),
      p99: this.percentile(sorted, 0.99)
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }
}

/**
 * Gauge implementation
 */
class Gauge implements IGauge<number> {
  private currentValue = 0;

  public constructor(
    private readonly name: string,
    private readonly description?: string,
    private readonly unit?: string,
    private readonly tracker?: IPerformanceTracker
  ) {}

  public set(value: number, attributes?: Record<string, string | number | boolean>): void {
    const previousValue = this.currentValue;
    this.currentValue = value;

    this.tracker?.addInstantMeasurement(`${this.name}`, {
      value,
      previousValue,
      change: value - previousValue,
      type: 'gauge',
      description: this.description,
      unit: this.unit,
      ...attributes
    });
  }
}

import { IPerformanceTracker } from './performance-tracker';

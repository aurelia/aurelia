import { DI, IDisposable, resolve } from '@aurelia/kernel';
import { IPerformanceTracker } from './performance-tracker';
import { ITelemetryMeter, TelemetryMeter } from './telemetry-meter';
import { IActivitySource, ActivitySource } from './activity-source';

/**
 * Telemetry service interface
 */
export const ITelemetryService = /*@__PURE__*/ DI.createInterface<ITelemetryService>('ITelemetryService');
export interface ITelemetryService {
  /**
   * Creates a new telemetry meter for custom metrics
   */
  createMeter(name: string, version?: string): ITelemetryMeter;

  /**
   * Creates a new activity source for custom tracing
   */
  createActivitySource(name: string, version?: string): IActivitySource;

  /**
   * Gets an existing meter by name, or creates a new one
   */
  getMeter(name: string, version?: string): ITelemetryMeter;

  /**
   * Gets an existing activity source by name, or creates a new one
   */
  getActivitySource(name: string, version?: string): IActivitySource;

  /**
   * Lists all registered meters
   */
  getMeters(): readonly ITelemetryMeter[];

  /**
   * Lists all registered activity sources
   */
  getActivitySources(): readonly IActivitySource[];

  /**
   * Clears all telemetry data
   */
  clear(): void;
}

/**
 * Telemetry service implementation
 */
export class TelemetryService implements ITelemetryService, IDisposable {
  private readonly meters = new Map<string, ITelemetryMeter>();
  private readonly activitySources = new Map<string, IActivitySource>();

  public constructor(
    private readonly performanceTracker: IPerformanceTracker = resolve(IPerformanceTracker)
  ) {}

  public createMeter(name: string, version: string = '1.0.0'): ITelemetryMeter {
    const key = `${name}@${version}`;

    if (!this.meters.has(key)) {
      const meter = new TelemetryMeter(name, version, this.performanceTracker);
      this.meters.set(key, meter);
    }

    return this.meters.get(key)!;
  }

  public createActivitySource(name: string, version: string = '1.0.0'): IActivitySource {
    const key = `${name}@${version}`;

    if (!this.activitySources.has(key)) {
      const activitySource = new ActivitySource(name, version, this.performanceTracker);
      this.activitySources.set(key, activitySource);
    }

    return this.activitySources.get(key)!;
  }

  public getMeter(name: string, version: string = '1.0.0'): ITelemetryMeter {
    return this.createMeter(name, version);
  }

  public getActivitySource(name: string, version: string = '1.0.0'): IActivitySource {
    return this.createActivitySource(name, version);
  }

  public getMeters(): readonly ITelemetryMeter[] {
    return Array.from(this.meters.values());
  }

  public getActivitySources(): readonly IActivitySource[] {
    return Array.from(this.activitySources.values());
  }

  public clear(): void {
    this.meters.clear();
    this.activitySources.clear();
  }

  public dispose(): void {
    this.clear();
  }
}

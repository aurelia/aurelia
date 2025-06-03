import { DI, IDisposable, resolve } from '@aurelia/kernel';
import { IPerformanceTracker } from './performance-tracker';
import { ITelemetryMeter, TelemetryMeter } from './telemetry-meter';
import { IActivitySource, ActivitySource } from './activity-source';

/**
 * Telemetry service interface
 */
export const ITelemetryService = /*@__PURE__*/ DI.createInterface<ITelemetryService>('ITelemetryService', x => x.singleton(TelemetryService));
export interface ITelemetryService extends TelemetryService { }

/**
 * Telemetry service implementation
 */
export class TelemetryService implements IDisposable {
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

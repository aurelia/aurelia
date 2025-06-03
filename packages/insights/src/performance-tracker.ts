/* eslint-disable no-console */
import { DI, IDisposable, resolve } from "@aurelia/kernel";
import { IPlatform } from "@aurelia/runtime-html";
import { IPerformanceMeasurement } from "./interfaces";
import { IInsightsConfiguration } from "./configuration";

/**
 * Performance tracker service interface
 */
export const IPerformanceTracker =
  /*@__PURE__*/ DI.createInterface<IPerformanceTracker>("IPerformanceTracker");
export interface IPerformanceTracker {
  startMeasurement(name: string, metadata?: Record<string, unknown>): string;
  endMeasurement(id: string): IPerformanceMeasurement | null;
  addMeasurement(measurement: IPerformanceMeasurement): void;
  addInstantMeasurement(name: string, metadata?: Record<string, unknown>): void;
  getMeasurements(): readonly IPerformanceMeasurement[];
  clear(): void;
  isEnabled(): boolean;
  debug(): void;
}

/**
 * Active measurement tracking
 */
interface IActiveMeasurement {
  id: string;
  name: string;
  startTime: number;
  counter: number;
  metadata?: Record<string, unknown>;
}

/**
 * Chrome DevTools Performance API helper
 */
class DevToolsPerformance {
  public constructor(
    private readonly platform: IPlatform = resolve(IPlatform),
    private readonly config: IInsightsConfiguration = resolve(
      IInsightsConfiguration
    )
  ) {}

  public mark(name: string): void {
    this.platform.globalThis.performance.mark(name);
  }

  public measure(name: string, startMark: string, endMark?: string): void {
    this.platform.globalThis.performance.measure(name, startMark, endMark);
  }

  public createMeasurementEntry(
    name: string,
    startTime: number,
    endTime: number,
    metadata?: Record<string, unknown>
  ): void {
    this.platform.globalThis.performance.measure(name, {
      start: startTime,
      end: endTime,
      detail: {
        devtools: {
          dataType: "track-entry",
          track: this.config.trackName ?? "Aurelia",
          trackGroup: this.config.trackGroup ?? "Framework",
          color: this.config.defaultColor ?? "primary",
          properties: metadata
            ? Object.entries(metadata).map(([key, value]) => [
                key,
                String(value),
              ])
            : undefined,
          tooltipText: `${name} (${(endTime - startTime).toFixed(2)}ms)`,
        },
      },
    });
  }

  public createMarker(
    name: string,
    timestamp?: number,
    metadata?: Record<string, unknown>
  ): void {
    const time = timestamp ?? this.now();
    this.platform.globalThis.performance.mark(name, {
      startTime: time,
      detail: {
        devtools: {
          dataType: "marker",
          color: this.config.defaultColor ?? "primary",
          properties: metadata
            ? Object.entries(metadata).map(([key, value]) => [
                key,
                String(value),
              ])
            : undefined,
          tooltipText: name,
        },
      },
    });
  }

  public now(): number {
    return this.platform.globalThis.performance.now();
  }

  public clearMarks(name?: string): void {
    this.platform.globalThis.performance.clearMarks(name);
  }

  public clearMeasures(name?: string): void {
    this.platform.globalThis.performance.clearMeasures(name);
  }
}

/**
 * Performance tracker implementation
 */
export class PerformanceTracker implements IPerformanceTracker, IDisposable {
  private readonly activeMeasurements = new Map<string, IActiveMeasurement>();
  private readonly completedMeasurements: IPerformanceMeasurement[] = [];
  private readonly devTools: DevToolsPerformance;
  private measurementCounter = 0;

  public constructor(
    private readonly config: IInsightsConfiguration = resolve(
      IInsightsConfiguration
    ),
    private readonly platform: IPlatform = resolve(IPlatform)
  ) {
    this.devTools = new DevToolsPerformance(this.platform, this.config);
  }

  public isEnabled(): boolean {
    return this.config.enabled === true;
  }

  public startMeasurement(
    name: string,
    metadata?: Record<string, unknown>
  ): string {
    if (!this.isEnabled() || !this.shouldTrackMeasurement(name)) {
      return "";
    }

    const counter = ++this.measurementCounter;
    const id = `${name}_${counter}_${Date.now()}`;
    const startTime = this.devTools.now();

    const measurement: IActiveMeasurement = {
      id,
      name,
      startTime,
      counter,
      metadata,
    };

    this.activeMeasurements.set(id, measurement);

    this.devTools.createMarker(`${name} started`, startTime, {
      ...metadata,
      measurementId: id,
      phase: "start",
    });

    return id;
  }

  public endMeasurement(id: string): IPerformanceMeasurement | null {
    if (!this.isEnabled() || !id) {
      return null;
    }

    const activeMeasurement = this.activeMeasurements.get(id);
    if (!activeMeasurement) {
      return null;
    }

    const endTime = this.devTools.now();
    const duration = endTime - activeMeasurement.startTime;

    const measurement: IPerformanceMeasurement = {
      name: activeMeasurement.name,
      startTime: activeMeasurement.startTime,
      endTime,
      duration,
      metadata: activeMeasurement.metadata,
    };

    this.devTools.createMeasurementEntry(
      activeMeasurement.name,
      activeMeasurement.startTime,
      endTime,
      {
        ...activeMeasurement.metadata,
        duration: `${duration.toFixed(2)}ms`,
        measurementId: id,
      }
    );

    this.devTools.createMarker(`${activeMeasurement.name} completed`, endTime, {
      ...activeMeasurement.metadata,
      duration: `${duration.toFixed(2)}ms`,
      measurementId: id,
      phase: "end",
    });

    this.activeMeasurements.delete(id);
    this.completedMeasurements.push(measurement);

    return measurement;
  }

  public addMeasurement(measurement: IPerformanceMeasurement): void {
    if (this.isEnabled() && this.shouldTrackMeasurement(measurement.name)) {
      this.completedMeasurements.push(measurement);
    }
  }

  public addInstantMeasurement(
    name: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.isEnabled() || !this.shouldTrackMeasurement(name)) {
      return;
    }

    const now = this.devTools.now();
    const measurement: IPerformanceMeasurement = {
      name,
      startTime: now,
      endTime: now,
      duration: 0,
      metadata,
    };

    this.devTools.createMeasurementEntry(name, now, now, {
      ...metadata,
      duration: "0ms",
      instant: true,
    });

    this.completedMeasurements.push(measurement);
  }

  public getMeasurements(): readonly IPerformanceMeasurement[] {
    return [...this.completedMeasurements];
  }

  public clear(): void {
    this.activeMeasurements.clear();
    this.completedMeasurements.length = 0;
    this.devTools.clearMarks();
    this.devTools.clearMeasures();
    this.measurementCounter = 0;
  }

  public dispose(): void {
    this.clear();
  }

  public debug(): void {
    console.group("[Aurelia Insights] Debug Information");
    console.log("Enabled:", this.isEnabled());
    console.log("Config:", this.config);
    console.log(
      "Platform has window:",
      typeof this.platform.window !== "undefined"
    );
    console.log(
      "Performance API available:",
      "performance" in this.platform.globalThis
    );
    console.log("Active measurements:", this.activeMeasurements.size);
    console.log("Completed measurements:", this.completedMeasurements.length);

    if (this.completedMeasurements.length > 0) {
      console.log("Recent measurements:", this.completedMeasurements.slice(-5));
    }

    console.groupEnd();
  }

  private shouldTrackMeasurement(name: string): boolean {
    if (!this.config.filters || this.config.filters.length === 0) {
      return true;
    }

    for (const filter of this.config.filters) {
      const matches =
        typeof filter.pattern === "string"
          ? name.includes(filter.pattern)
          : filter.pattern.test(name);

      if (matches) {
        return filter.include;
      }
    }

    return true;
  }
}

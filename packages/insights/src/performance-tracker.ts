/* eslint-disable no-console */
import { DI, IDisposable, resolve } from "@aurelia/kernel";
import { IPlatform } from "@aurelia/runtime-html";
import { IPerformanceMeasurement, IPerformanceTestData, IPerformanceRegressionResult, IPerformanceStats } from "./interfaces";
import { IInsightsConfiguration } from "./configuration";

/**
 * Performance tracker service interface
 */
export const IPerformanceTracker =
  /*@__PURE__*/ DI.createInterface<IPerformanceTracker>("IPerformanceTracker", x => x.singleton(PerformanceTracker));
export interface IPerformanceTracker extends PerformanceTracker { }

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
    if (this.shouldUseDevToolsAPI()) {
      this.platform.globalThis.performance.mark(name);
    }
  }

  public measure(name: string, startMark: string, endMark?: string): void {
    if (this.shouldUseDevToolsAPI()) {
      this.platform.globalThis.performance.measure(name, startMark, endMark);
    }
  }

  public createMeasurementEntry(
    name: string,
    startTime: number,
    endTime: number,
    metadata?: Record<string, unknown>
  ): void {
    if (this.shouldUseDevToolsAPI()) {
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
  }

  public createMarker(
    name: string,
    timestamp?: number,
    metadata?: Record<string, unknown>
  ): void {
    if (this.shouldUseDevToolsAPI()) {
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
  }

  public now(): number {
    return this.platform.globalThis.performance.now();
  }

  public clearMarks(name?: string): void {
    if (this.shouldUseDevToolsAPI()) {
      this.platform.globalThis.performance.clearMarks(name);
    }
  }

  public clearMeasures(name?: string): void {
    if (this.shouldUseDevToolsAPI()) {
      this.platform.globalThis.performance.clearMeasures(name);
    }
  }

  private shouldUseDevToolsAPI(): boolean {
    const mode = this.config.trackingMode ?? 'devtools-only';
    return mode === 'devtools-only' || mode === 'both';
  }
}

/**
 * Test mode performance tracker for e2e testing without browser performance API
 */
class TestModeTracker {
  private readonly testRunId: string;
  private readonly startTime: number;

  public constructor(
    private readonly config: IInsightsConfiguration,
    private readonly platform: IPlatform
  ) {
    this.testRunId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    this.startTime = Date.now();
  }

  public generateTestData(measurements: readonly IPerformanceMeasurement[]): IPerformanceTestData {
    const stats = this.calculateStatistics(measurements);

    return {
      timestamp: this.startTime,
      runId: this.testRunId,
      environment: {
        userAgent: this.platform.globalThis.navigator?.userAgent,
        platform: this.platform.globalThis.navigator?.platform,
        testFramework: 'mocha'
      },
      measurements,
      statistics: stats
    };
  }

  public checkRegressions(
    currentData: IPerformanceTestData,
    baselineData: IPerformanceTestData,
    regressionThreshold: number = 0.2 // 20% by default
  ): IPerformanceRegressionResult {
    const regressions: IPerformanceRegressionResult['regressions'] = [];
    const improvements: IPerformanceRegressionResult['improvements'] = [];

    const currentStats = this.groupMeasurementsByComponentAndPhase(currentData.measurements);
    const baselineStats = this.groupMeasurementsByComponentAndPhase(baselineData.measurements);

    for (const [component, phases] of Object.entries(currentStats)) {
      const baselineComponent = baselineStats[component];
      if (baselineComponent === undefined) {
        continue;
      }

      for (const [phase, currentPhaseStats] of Object.entries(phases)) {
        const baselinePhaseStats = baselineComponent[phase];
        if (baselinePhaseStats === undefined) {
          continue;
        }

        const currentAvg = currentPhaseStats.average;
        const baselineAvg = baselinePhaseStats.average;
        const change = (currentAvg - baselineAvg) / baselineAvg;

        if (change > regressionThreshold) {
          regressions.push({
            component,
            phase,
            baseline: baselineAvg,
            current: currentAvg,
            regression: change,
            threshold: regressionThreshold
          });
        } else if (change < -0.1) { // 10% improvement
          improvements.push({
            component,
            phase,
            baseline: baselineAvg,
            current: currentAvg,
            improvement: -change
          });
        }
      }
    }

    const totalMeasurements = currentData.measurements.length;
    const averageChange = regressions.length > 0
      ? regressions.reduce((sum, r) => sum + r.regression, 0) / regressions.length
      : 0;

    return {
      passed: regressions.length === 0,
      regressions,
      improvements,
      summary: {
        totalMeasurements,
        regressionsCount: regressions.length,
        improvementsCount: improvements.length,
        averageChange
      }
    };
  }

  public checkThresholds(measurements: readonly IPerformanceMeasurement[]): IPerformanceTestData['statistics']['thresholdViolations'] {
    const violations: IPerformanceTestData['statistics']['thresholdViolations'] = [];
    const thresholds = this.config.testModeConfig?.thresholds ?? {};

    for (const measurement of measurements) {
      const componentName = measurement.metadata?.componentName as string;
      const phase = measurement.metadata?.phase as string;

      if (componentName && phase) {
        const thresholdKey = `${componentName}.${phase}`;
        const threshold = thresholds[thresholdKey] ?? thresholds[componentName] ?? thresholds['default'];

        if (threshold != null && measurement.duration != null && measurement.duration > threshold) {
          violations.push({
            name: thresholdKey,
            threshold,
            actual: measurement.duration,
            violation: measurement.duration - threshold
          });
        }
      }
    }

    return violations;
  }

  private calculateStatistics(measurements: readonly IPerformanceMeasurement[]): IPerformanceTestData['statistics'] {
    const total = measurements.reduce((sum, m) => sum + (m.duration ?? 0), 0);
    const averageDuration = measurements.length > 0 ? total / measurements.length : 0;

    const componentStats = this.groupMeasurementsByComponentAndPhase(measurements);
    const slowestComponents = Object.entries(componentStats)
      .map(([name, phases]) => ({
        name,
        totalTime: Object.values(phases).reduce((sum, stats) => sum + stats.total, 0),
        phases
      }))
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10);

    const thresholdViolations = this.checkThresholds(measurements);

    return {
      total,
      averageDuration,
      slowestComponents,
      thresholdViolations
    };
  }

    private groupMeasurementsByComponentAndPhase(measurements: readonly IPerformanceMeasurement[]): Record<string, Record<string, IPerformanceStats>> {
    const grouped: Record<string, Record<string, { total: number; count: number; average: number; min: number; max: number; measurements: IPerformanceMeasurement[] }>> = {};

    for (const measurement of measurements) {
      const componentName = measurement.metadata?.componentName as string;
      const phase = measurement.metadata?.phase as string;

      if (!componentName || !phase) {
        continue;
      }

      if (grouped[componentName] === undefined) {
        grouped[componentName] = {};
      }

      if (grouped[componentName][phase] === undefined) {
        grouped[componentName][phase] = {
          total: 0,
          count: 0,
          average: 0,
          min: Infinity,
          max: 0,
          measurements: []
        };
      }

      const stats = grouped[componentName][phase];
      const duration = measurement.duration ?? 0;

      stats.total += duration;
      stats.count += 1;
      stats.min = Math.min(stats.min, duration);
      stats.max = Math.max(stats.max, duration);
      stats.average = stats.total / stats.count;
      stats.measurements.push(measurement);
    }

    // Convert to the correct type with readonly measurements
    const result: Record<string, Record<string, IPerformanceStats>> = {};
    for (const [componentName, phases] of Object.entries(grouped)) {
      result[componentName] = {};
      for (const [phase, stats] of Object.entries(phases)) {
        result[componentName][phase] = {
          ...stats,
          measurements: [...stats.measurements] as readonly IPerformanceMeasurement[]
        };
      }
    }

    return result;
  }
}

/**
 * Performance tracker implementation
 */
export class PerformanceTracker implements IPerformanceTracker, IDisposable {
  private readonly activeMeasurements = new Map<string, IActiveMeasurement>();
  private readonly completedMeasurements: IPerformanceMeasurement[] = [];
  private readonly devTools: DevToolsPerformance;
  private readonly testModeTracker: TestModeTracker;
  private measurementCounter = 0;

  public constructor(
    private readonly config: IInsightsConfiguration = resolve(
      IInsightsConfiguration
    ),
    private readonly platform: IPlatform = resolve(IPlatform)
  ) {
    this.devTools = new DevToolsPerformance(this.platform, this.config);
    this.testModeTracker = new TestModeTracker(this.config, this.platform);
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

    // Only create DevTools markers if in appropriate mode
    if (this.shouldUseDevToolsAPI()) {
      this.devTools.createMarker(`${name} started`, startTime, {
        ...metadata,
        measurementId: id,
        phase: "start",
      });
    }

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

    // Only create DevTools entries if in appropriate mode
    if (this.shouldUseDevToolsAPI()) {
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
    }

    this.activeMeasurements.delete(id);
    this.completedMeasurements.push(measurement);

    // Auto-export in test mode if configured
    if (this.shouldUseTestMode() && this.config.testModeConfig?.autoExport === true) {
      this.exportTestData();
    }

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

    if (this.shouldUseDevToolsAPI()) {
      this.devTools.createMeasurementEntry(name, now, now, {
        ...metadata,
        duration: "0ms",
        instant: true,
      });
    }

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
    console.log("Tracking Mode:", this.config.trackingMode);
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

  // Test mode specific methods
  public generateTestData(): IPerformanceTestData {
    if (!this.shouldUseTestMode()) {
      throw new Error('Test data generation is only available in test mode or both mode');
    }
    return this.testModeTracker.generateTestData(this.completedMeasurements);
  }

  public checkRegressions(baselineData: IPerformanceTestData, regressionThreshold?: number): IPerformanceRegressionResult {
    if (!this.shouldUseTestMode()) {
      throw new Error('Regression checking is only available in test mode or both mode');
    }
    const currentData = this.generateTestData();
    return this.testModeTracker.checkRegressions(currentData, baselineData, regressionThreshold);
  }

  public exportTestData(): void {
    if (!this.shouldUseTestMode()) {
      return;
    }

    const testData = this.generateTestData();
    const exportCallback = this.config.testModeConfig?.exportCallback;

    if (exportCallback !== undefined) {
      exportCallback(testData);
    }
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

  private shouldUseDevToolsAPI(): boolean {
    const mode = this.config.trackingMode ?? 'devtools-only';
    return mode === 'devtools-only' || mode === 'both';
  }

  private shouldUseTestMode(): boolean {
    const mode = this.config.trackingMode ?? 'devtools-only';
    return mode === 'test-mode' || mode === 'both';
  }
}

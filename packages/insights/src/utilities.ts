import { DI, resolve } from '@aurelia/kernel';
import { IPerformanceTracker } from './performance-tracker';
import { IInsightsConfiguration } from './configuration';
import { IPerformanceMeasurement, IPerformanceStats, IGroupedMeasurements } from './interfaces';

/**
 * Insights utilities service interface
 *
 * @example
 * ```typescript
 * // Using with dependency injection
 * export class MyComponent {
 *   constructor(
 *     private readonly insights: IInsightsUtilities = resolve(IInsightsUtilities)
 *   ) {}
 *
 *   public analyzePerformance(): void {
 *     const stats = this.insights.groupMeasurementsByComponent();
 *     const slowest = this.insights.getSlowestComponents(3);
 *     this.insights.logPerformanceSummary();
 *   }
 * }
 * ```
 */
export const IInsightsUtilities = /*@__PURE__*/DI.createInterface<IInsightsUtilities>('IInsightsUtilities', x => x.singleton(InsightsUtilities));
export interface IInsightsUtilities extends InsightsUtilities { }

/**
 * Utility service for working with performance insights
 */
export class InsightsUtilities implements IInsightsUtilities {
  public constructor(
    private readonly performanceTracker: IPerformanceTracker = resolve(IPerformanceTracker),
    private readonly config: IInsightsConfiguration = resolve(IInsightsConfiguration)
  ) {}

  /**
   * Gets all measurements from the performance tracker
   */
  public getMeasurements(): readonly IPerformanceMeasurement[] {
    return this.performanceTracker.getMeasurements();
  }

  /**
   * Clears all performance measurements
   */
  public clearMeasurements(): void {
    this.performanceTracker.clear();
  }

  /**
   * Groups measurements by component and lifecycle phase
   */
  public groupMeasurementsByComponent(): IGroupedMeasurements {
    const measurements = this.getMeasurements();
    const grouped: IGroupedMeasurements = {};

    for (const measurement of measurements) {
      const metadata = measurement.metadata;
      if (!this.isValidComponentMeasurement(metadata)) {
        continue;
      }

      const componentName = this.extractComponentName(metadata!);
      const phase = this.extractPhase(metadata!);

      if (!componentName || !phase) {
        continue;
      }

      // Initialize component if needed
      if (!(componentName in grouped)) {
        grouped[componentName] = {};
      }

      // Initialize phase if needed
      if (!(phase in grouped[componentName])) {
        grouped[componentName][phase] = {
          total: 0,
          count: 0,
          average: 0,
          min: Infinity,
          max: -Infinity,
          measurements: []
        };
      }

      const stats = grouped[componentName][phase];
      const duration = measurement.duration ?? 0;

      stats.total += duration;
      stats.count += 1;
      stats.min = Math.min(stats.min, duration);
      stats.max = Math.max(stats.max, duration);
      (stats.measurements as IPerformanceMeasurement[]).push(measurement);
    }

    // Calculate averages
    for (const componentName in grouped) {
      for (const phase in grouped[componentName]) {
        const stats = grouped[componentName][phase];
        stats.average = stats.count > 0 ? stats.total / stats.count : 0;
      }
    }

    return grouped;
  }

  /**
   * Gets performance statistics for a specific component
   */
  public getComponentStats(componentName: string): { [phase: string]: IPerformanceStats } | undefined {
    const grouped = this.groupMeasurementsByComponent();
    return grouped[componentName];
  }

  /**
   * Gets performance statistics for a specific component and lifecycle phase
   */
  public getPhaseStats(componentName: string, phase: string): IPerformanceStats | undefined {
    const componentStats = this.getComponentStats(componentName);
    return componentStats?.[phase];
  }

  /**
   * Gets the slowest components by total time
   */
  public getSlowestComponents(limit: number = 10): { name: string; totalTime: number; phases: { [phase: string]: IPerformanceStats } }[] {
    const grouped = this.groupMeasurementsByComponent();
    const results: { name: string; totalTime: number; phases: { [phase: string]: IPerformanceStats } }[] = [];

    for (const componentName in grouped) {
      let totalTime = 0;
      const phases = grouped[componentName];

      for (const phase in phases) {
        totalTime += phases[phase].total;
      }

      results.push({
        name: componentName,
        totalTime,
        phases
      });
    }

    return results
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, limit);
  }

  /**
   * Gets components with the most lifecycle executions
   */
  public getMostActiveComponents(limit: number = 10): { name: string; totalExecutions: number; phases: { [phase: string]: IPerformanceStats } }[] {
    const grouped = this.groupMeasurementsByComponent();
    const results: { name: string; totalExecutions: number; phases: { [phase: string]: IPerformanceStats } }[] = [];

    for (const componentName in grouped) {
      let totalExecutions = 0;
      const phases = grouped[componentName];

      for (const phase in phases) {
        totalExecutions += phases[phase].count;
      }

      results.push({
        name: componentName,
        totalExecutions,
        phases
      });
    }

    return results
      .sort((a, b) => b.totalExecutions - a.totalExecutions)
      .slice(0, limit);
  }

  /**
   * Groups listener binding measurements by event type and target
   */
  public groupMeasurementsByEventType(): Record<string, Record<string, IPerformanceStats>> {
    const measurements = this.getMeasurements();
    const grouped: Record<string, Record<string, IPerformanceStats>> = {};

    for (const measurement of measurements) {
      const metadata = measurement.metadata;
      if (!this.isValidListenerMeasurement(metadata)) {
        continue;
      }

      const eventType = this.extractEventType(metadata!);
      const target = this.extractTarget(metadata!);

      if (!eventType || !target) {
        continue;
      }

      // Initialize event type if needed
      if (!(eventType in grouped)) {
        grouped[eventType] = {};
      }

      // Initialize target if needed
      if (!(target in grouped[eventType])) {
        grouped[eventType][target] = {
          total: 0,
          count: 0,
          average: 0,
          min: Infinity,
          max: -Infinity,
          measurements: []
        };
      }

      const stats = grouped[eventType][target];
      const duration = measurement.duration ?? 0;

      stats.total += duration;
      stats.count += 1;
      stats.min = Math.min(stats.min, duration);
      stats.max = Math.max(stats.max, duration);
      (stats.measurements as IPerformanceMeasurement[]).push(measurement);
    }

    // Calculate averages
    for (const eventType in grouped) {
      for (const target in grouped[eventType]) {
        const stats = grouped[eventType][target];
        stats.average = stats.count > 0 ? stats.total / stats.count : 0;
      }
    }

    return grouped;
  }

  /**
   * Gets the slowest event handlers by total time
   */
  public getSlowestEventHandlers(limit: number = 10): { eventType: string; target: string; totalTime: number; stats: IPerformanceStats }[] {
    const grouped = this.groupMeasurementsByEventType();
    const results: { eventType: string; target: string; totalTime: number; stats: IPerformanceStats }[] = [];

    for (const eventType in grouped) {
      for (const target in grouped[eventType]) {
        const stats = grouped[eventType][target];
        results.push({
          eventType,
          target,
          totalTime: stats.total,
          stats
        });
      }
    }

    return results
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, limit);
  }

  /**
   * Gets the most triggered event handlers
   */
  public getMostTriggeredEventHandlers(limit: number = 10): { eventType: string; target: string; totalTriggers: number; stats: IPerformanceStats }[] {
    const grouped = this.groupMeasurementsByEventType();
    const results: { eventType: string; target: string; totalTriggers: number; stats: IPerformanceStats }[] = [];

    for (const eventType in grouped) {
      for (const target in grouped[eventType]) {
        const stats = grouped[eventType][target];
        results.push({
          eventType,
          target,
          totalTriggers: stats.count,
          stats
        });
      }
    }

    return results
      .sort((a, b) => b.totalTriggers - a.totalTriggers)
      .slice(0, limit);
  }

  /**
   * Logs a complete performance summary including both components and event handlers
   */
  public logPerformanceSummary(): void {
    if (!this.config.enabled) {
      // eslint-disable-next-line no-console
      console.warn('🔍 Aurelia Performance Insights - Tracking is disabled');
      return;
    }

    const componentGrouped = this.groupMeasurementsByComponent();
    const eventGrouped = this.groupMeasurementsByEventType();
    const slowestComponents = this.getSlowestComponents(5);
    const mostActiveComponents = this.getMostActiveComponents(5);
    const slowestEventHandlers = this.getSlowestEventHandlers(5);
    const mostTriggeredEventHandlers = this.getMostTriggeredEventHandlers(5);

    // eslint-disable-next-line no-console
    console.group('🔍 Aurelia Performance Insights');

    // eslint-disable-next-line no-console
    console.group('📊 Overview');
    const totalComponents = Object.keys(componentGrouped).length;
    const totalEventTypes = Object.keys(eventGrouped).length;
    const totalMeasurements = this.getMeasurements().length;
    // eslint-disable-next-line no-console
    console.log(`Total Components: ${totalComponents}`);
    // eslint-disable-next-line no-console
    console.log(`Total Event Types: ${totalEventTypes}`);
    // eslint-disable-next-line no-console
    console.log(`Total Measurements: ${totalMeasurements}`);
    // eslint-disable-next-line no-console
    console.log(`Tracking Enabled: ${this.config.enabled ? '✅' : '❌'}`);
    // eslint-disable-next-line no-console
    console.groupEnd();

    if (slowestComponents.length > 0) {
      // eslint-disable-next-line no-console
      console.group('🐌 Slowest Components (by total time)');
      slowestComponents.forEach((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${item.name}: ${item.totalTime.toFixed(2)}ms`);
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    if (mostActiveComponents.length > 0) {
      // eslint-disable-next-line no-console
      console.group('🔥 Most Active Components (by execution count)');
      mostActiveComponents.forEach((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${item.name}: ${item.totalExecutions} executions`);
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    if (slowestEventHandlers.length > 0) {
      // eslint-disable-next-line no-console
      console.group('🎯 Slowest Event Handlers (by total time)');
      slowestEventHandlers.forEach((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${item.eventType} on ${item.target}: ${item.totalTime.toFixed(2)}ms`);
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    if (mostTriggeredEventHandlers.length > 0) {
      // eslint-disable-next-line no-console
      console.group('⚡ Most Triggered Event Handlers');
      mostTriggeredEventHandlers.forEach((item, index) => {
        // eslint-disable-next-line no-console
        console.log(`${index + 1}. ${item.eventType} on ${item.target}: ${item.totalTriggers} triggers`);
      });
      // eslint-disable-next-line no-console
      console.groupEnd();
    }

    // eslint-disable-next-line no-console
    console.groupEnd();
  }

  /**
   * Exports performance data as JSON for external analysis
   */
  public exportPerformanceData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      config: {
        enabled: this.config.enabled,
        trackName: this.config.trackName,
        trackGroup: this.config.trackGroup,
        filtersApplied: this.config.filters?.length ?? 0
      },
      measurements: this.getMeasurements(),
      components: {
        grouped: this.groupMeasurementsByComponent(),
        slowest: this.getSlowestComponents(),
        mostActive: this.getMostActiveComponents()
      },
      eventHandlers: {
        grouped: this.groupMeasurementsByEventType(),
        slowest: this.getSlowestEventHandlers(),
        mostTriggered: this.getMostTriggeredEventHandlers()
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Validates if a measurement has valid component metadata
   */
  private isValidComponentMeasurement(metadata: Record<string, unknown> | undefined): boolean {
    return metadata != null
      && typeof metadata.componentName === 'string'
      && typeof metadata.phase === 'string'
      && metadata.componentName.trim() !== ''
      && metadata.phase.trim() !== '';
  }

  /**
   * Safely extracts component name from metadata
   */
  private extractComponentName(metadata: Record<string, unknown>): string | null {
    const componentName = metadata.componentName;
    return typeof componentName === 'string' && componentName.trim() !== ''
      ? componentName.trim()
      : null;
  }

  /**
   * Safely extracts phase from metadata
   */
  private extractPhase(metadata: Record<string, unknown>): string | null {
    const phase = metadata.phase;
    return typeof phase === 'string' && phase.trim() !== ''
      ? phase.trim()
      : null;
  }

  /**
   * Validates if a measurement has valid listener binding metadata
   */
  private isValidListenerMeasurement(metadata: Record<string, unknown> | undefined): boolean {
    return metadata != null
      && typeof metadata.eventType === 'string'
      && typeof metadata.target === 'string'
      && metadata.eventType.trim() !== ''
      && metadata.target.trim() !== '';
  }

  /**
   * Safely extracts event type from metadata
   */
  private extractEventType(metadata: Record<string, unknown>): string | null {
    const eventType = metadata.eventType;
    return typeof eventType === 'string' && eventType.trim() !== ''
      ? eventType.trim()
      : null;
  }

  /**
   * Safely extracts target from metadata
   */
  private extractTarget(metadata: Record<string, unknown>): string | null {
    const target = metadata.target;
    return typeof target === 'string' && target.trim() !== ''
      ? target.trim()
      : null;
  }
}

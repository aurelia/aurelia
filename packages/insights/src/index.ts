// Core interfaces and types
export {
  IInsightsConfigurationOptions,
  IPerformanceMeasurement,
  DevToolsColor,
  RouterLifecycleHook,
  IRepeatPerformanceConfig,
  IPerformanceFilter,
  IPerformanceStats,
  IGroupedMeasurements,
} from './interfaces';

// Configuration
export {
  IInsightsConfiguration,
  DEFAULT_INSIGHTS_CONFIGURATION,
  createInsightsConfiguration,
  InsightsConfiguration,
} from './configuration';

// Performance tracking
export { IPerformanceTracker, PerformanceTracker } from './performance-tracker';
export { IInsightsUtilities, InsightsUtilities } from './utilities';

// Telemetry
export { ITelemetryMeter, TelemetryMeter, ICounter, IHistogram, IGauge } from './telemetry-meter';
export { IActivitySource, IActivity, ActivitySource, withActivity } from './activity-source';
export { ITelemetryService, TelemetryService } from './telemetry-service';

export {
  ITelemetryService,
  TelemetryService,
} from './telemetry-service';

// Performance-enhanced components
export { PerformanceRepeat } from './performance-repeat';

// Plugin exports
export { InsightsPlugin as default, InsightsPlugin, InsightsConfiguration as InsightsPluginConfiguration } from './insights-plugin';

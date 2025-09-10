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
  PerformanceTrackingMode,
  ITestModeConfig,
  IPerformanceTestData,
  IPerformanceRegressionResult,
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

// Visualization components
export {
  IDashboardStats,
  IGaugeData,
  IChartDataPoint,
  IChartData,
  TelemetryDashboard,
  MetricGauge,
  MetricChart,
} from './components';

// Performance-enhanced components
export { PerformanceRepeat } from './performance-repeat';

// Router lifecycle hooks
export { RouterLifecycleHooks } from './router-lifecycle-hooks';

export { applyListenerBindingPatch } from './patches/listener-binding-patch';

// Test helpers for performance regression testing
export {
  PerformanceTestHelper,
  createPerformanceTestHelper,
  createMochaPerformanceTest,
} from './test-helpers';

// Plugin exports
export { InsightsPlugin as default, InsightsPlugin, InsightsConfiguration as InsightsPluginConfiguration } from './insights-plugin';

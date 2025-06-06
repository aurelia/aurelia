// Core interfaces and types
export * from './interfaces';

// Configuration
export {
  IInsightsConfiguration,
  DEFAULT_INSIGHTS_CONFIGURATION,
  createInsightsConfiguration,
  InsightsConfiguration
} from './configuration';

// Performance tracking
export * from './performance-tracker';
export * from './utilities';

// Telemetry
export * from './telemetry-meter';
export * from './activity-source';
export {
  ITelemetryService,
  TelemetryService,
} from './telemetry-service';

// Performance-enhanced components
export { PerformanceRepeat } from './performance-repeat';

// Plugin exports
export { InsightsPlugin as default } from './insights-plugin';
export { InsightsPlugin } from './insights-plugin';
export { InsightsConfiguration as InsightsPluginConfiguration } from './insights-plugin';

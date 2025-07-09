/**
 * Available colors for DevTools performance tracks
 */
export type DevToolsColor =
  | 'primary' | 'primary-light' | 'primary-dark'
  | 'secondary' | 'secondary-light' | 'secondary-dark'
  | 'tertiary' | 'tertiary-light' | 'tertiary-dark'
  | 'error';

/**
 * Performance tracking modes
 */
export type PerformanceTrackingMode = 'devtools-only' | 'test-mode' | 'both';

/**
 * Router lifecycle hook names
 */
export type RouterLifecycleHook = 'loading';

/**
 * Performance measurement data
 */
export interface IPerformanceMeasurement {
  /**
   * Name/label of the measurement
   */
  name: string;
  /**
   * Start time in milliseconds
   */
  startTime: number;
  /**
   * End time in milliseconds
   */
  endTime?: number;
  /**
   * Duration in milliseconds
   */
  duration?: number;
  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Performance insights configuration options
 */
export interface IInsightsConfigurationOptions {
  /**
   * Whether to enable performance tracking
   * @default true
   */
  enabled?: boolean;

  /**
   * Performance tracking mode
   * - 'devtools-only': Only use browser performance API for DevTools integration
   * - 'test-mode': Only collect internal measurements for testing (no browser API)
   * - 'both': Use both browser performance API and internal measurements
   * @default 'devtools-only'
   */
  trackingMode?: PerformanceTrackingMode;

  /**
   * Default track name for Aurelia insights
   * @default 'Aurelia'
   */
  trackName?: string;

  /**
   * Default track group name
   * @default 'Framework'
   */
  trackGroup?: string;
  /**
   * Default color for measurements
   * @default 'primary'
   */
  defaultColor?: DevToolsColor;

  /**
   * Custom measurement filters
   */
  filters?: IPerformanceFilter[];

  /**
   * Router tracking configuration
   * @default true
   */
  enableRouterTracking?: boolean;

  /**
   * Repeat template controller performance tracking configuration
   */
  repeatPerformance?: IRepeatPerformanceConfig;

  /**
   * Test mode configuration
   */
  testModeConfig?: ITestModeConfig;
}

/**
 * Configuration options for repeat template controller performance tracking
 */
export interface IRepeatPerformanceConfig {
  /**
   * Whether to enable repeat performance tracking
   * @default true
   */
  enabled?: boolean;

  /**
   * Threshold for detailed tracking. Collections larger than this will use summary tracking
   * @default 100
   */
  detailedTrackingThreshold?: number;

  /**
   * Threshold for batch operations. Operations affecting more than this many items are considered large
   * @default 10
   */
  batchOperationThreshold?: number;

  /**
   * Whether to track individual item operations for small collections
   * @default true
   */
  trackIndividualOperations?: boolean;

  /**
   * Custom color for repeat performance measurements
   * @default 'secondary'
   */
  color?: DevToolsColor;
}

/**
 * Performance filter for selective tracking
 */
export interface IPerformanceFilter {
  /**
   * Filter name
   */
  name: string;
  /**
   * Whether the filter should include or exclude matches
   */
  include: boolean;
  /**
   * Pattern to match against measurement names
   */
  pattern: string | RegExp;
}

/**
 * Performance measurement statistics
 */
export interface IPerformanceStats {
  total: number;
  count: number;
  average: number;
  min: number;
  max: number;
  measurements: readonly IPerformanceMeasurement[];
}

/**
 * Grouped performance measurements
 */
export interface IGroupedMeasurements {
  [componentName: string]: {
    [phase: string]: IPerformanceStats;
  };
}

/**
 * Test mode configuration options
 */
export interface ITestModeConfig {
  /**
   * Whether to enable performance thresholds
   * @default true
   */
  enableThresholds?: boolean;

  /**
   * Default performance thresholds in milliseconds
   */
  thresholds?: Record<string, number>;

  /**
   * Whether to collect detailed metadata in test mode
   * @default true
   */
  collectDetailedMetadata?: boolean;

  /**
   * Whether to automatically export performance data
   * @default false
   */
  autoExport?: boolean;

  /**
   * Export callback for performance data
   */
  exportCallback?: (data: IPerformanceTestData) => void;
}

/**
 * Performance test data for regression testing
 */
export interface IPerformanceTestData {
  /**
   * Test run timestamp
   */
  timestamp: number;

  /**
   * Test run identifier
   */
  runId: string;

  /**
   * Environment information
   */
  environment: {
    userAgent?: string;
    platform?: string;
    testFramework?: string;
  };

  /**
   * Performance measurements
   */
  measurements: readonly IPerformanceMeasurement[];

  /**
   * Performance statistics
   */
  statistics: {
    total: number;
    averageDuration: number;
    slowestComponents: {
      name: string;
      totalTime: number;
      phases: Record<string, IPerformanceStats>;
    }[];
    thresholdViolations: {
      name: string;
      threshold: number;
      actual: number;
      violation: number;
    }[];
  };
}

/**
 * Performance regression test result
 */
export interface IPerformanceRegressionResult {
  /**
   * Whether the test passed (no regressions detected)
   */
  passed: boolean;

  /**
   * Detected regressions
   */
  regressions: {
    component: string;
    phase: string;
    baseline: number;
    current: number;
    regression: number;
    threshold: number;
  }[];

  /**
   * Performance improvements
   */
  improvements: {
    component: string;
    phase: string;
    baseline: number;
    current: number;
    improvement: number;
  }[];

  /**
   * Test summary
   */
  summary: {
    totalMeasurements: number;
    regressionsCount: number;
    improvementsCount: number;
    averageChange: number;
  };
}

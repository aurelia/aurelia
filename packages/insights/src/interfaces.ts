/**
 * Available colors for DevTools performance tracks
 */
export type DevToolsColor =
  | 'primary' | 'primary-light' | 'primary-dark'
  | 'secondary' | 'secondary-light' | 'secondary-dark'
  | 'tertiary' | 'tertiary-light' | 'tertiary-dark'
  | 'error';

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

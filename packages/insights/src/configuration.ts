import { DI, IRegistry, Registration } from '@aurelia/kernel';
import { IInsightsConfigurationOptions, IPerformanceFilter } from './interfaces';

/**
 * Configuration token for insights options
 */
export const IInsightsConfiguration = /*@__PURE__*/DI.createInterface<IInsightsConfiguration>('IInsightsConfiguration');
export interface IInsightsConfiguration extends IInsightsConfigurationOptions {}

/**
 * Default configuration for insights
 */
export const DEFAULT_INSIGHTS_CONFIGURATION: Required<IInsightsConfigurationOptions> = {
  enabled: true,
  trackingMode: 'devtools-only',
  trackName: 'Aurelia',
  trackGroup: 'Framework',
  defaultColor: 'primary',
  filters: [],
  enableRouterTracking: true,
  repeatPerformance: {
    enabled: true,
    detailedTrackingThreshold: 100,
    batchOperationThreshold: 10
  },
  testModeConfig: {
    enableThresholds: true,
    thresholds: {},
    collectDetailedMetadata: true,
    autoExport: false
  }
};

/**
 * Creates a registration for insights configuration
 */
export function createInsightsConfiguration(options: Partial<IInsightsConfigurationOptions> = {}): IRegistry {
  const config: IInsightsConfiguration = {
    ...DEFAULT_INSIGHTS_CONFIGURATION,
    ...options,
    filters: [...DEFAULT_INSIGHTS_CONFIGURATION.filters, ...(options.filters ?? [])]
  };

  return Registration.instance(IInsightsConfiguration, config);
}

/**
 * Configuration builder for insights
 */
export class InsightsConfiguration {
  private constructor(private readonly options: Partial<IInsightsConfigurationOptions>) {}

  public static create(options: Partial<IInsightsConfigurationOptions> = {}): InsightsConfiguration {
    return new InsightsConfiguration(options);
  }

  public enabled(value: boolean): InsightsConfiguration {
    this.options.enabled = value;
    return this;
  }

  public trackName(value: string): InsightsConfiguration {
    this.options.trackName = value;
    return this;
  }

  public trackGroup(value: string): InsightsConfiguration {
    this.options.trackGroup = value;
    return this;
  }

  public defaultColor(value: IInsightsConfigurationOptions['defaultColor']): InsightsConfiguration {
    this.options.defaultColor = value;
    return this;
  }

  public addFilter(filter: IPerformanceFilter): InsightsConfiguration {
    if (!this.options.filters) {
      this.options.filters = [];
    }
    this.options.filters.push(filter);
    return this;
  }

  public enableRouterTracking(value: boolean): InsightsConfiguration {
    this.options.enableRouterTracking = value;
    return this;
  }

  public build(): IRegistry {
    return createInsightsConfiguration(this.options);
  }
}

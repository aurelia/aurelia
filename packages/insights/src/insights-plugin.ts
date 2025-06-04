import { IContainer, IRegistry } from '@aurelia/kernel';
import { IInsightsConfigurationOptions } from './interfaces';
import { createInsightsConfiguration } from './configuration';
import { IPerformanceTracker } from './performance-tracker';
import { IInsightsUtilities } from './utilities';
import { PerformanceLifecycleHooks } from './lifecycle-hooks';
import { RouterLifecycleHooks } from './router-lifecycle-hooks';
import { ITelemetryService } from './telemetry-service';

/**
 * Aurelia Insights Plugin
 * Provides performance monitoring capabilities for Aurelia applications
 */
export class InsightsPlugin {

  /**
   * Default configuration with sensible defaults for quick setup
   */
  public static get DefaultConfiguration(): IRegistry {
    return InsightsPlugin.configure({
      enabled: true,
      trackName: 'Aurelia',
      trackGroup: 'Performance'
    });
  }

  /**
   * Creates a plugin configuration with the given options
   */
  public static configure(options: Partial<IInsightsConfigurationOptions> = {}): IRegistry {
    return {
      register(container: IContainer): IContainer {
        // Register configuration first
        const configRegistration = createInsightsConfiguration(options);
        container.register(configRegistration);

        // Register the performance tracker
        container.register(IPerformanceTracker);

        // Register the insights utilities
        container.register(IInsightsUtilities);

        // Register the telemetry service for custom metrics and activities
        container.register(ITelemetryService);

        // Register performance lifecycle hooks
        container.register(PerformanceLifecycleHooks);

        // Register router lifecycle hooks
        container.register(RouterLifecycleHooks);

        return container;
      }
    };
  }

  /**
   * Creates an enabled plugin configuration
   */
  public static enable(options: Partial<IInsightsConfigurationOptions> = {}): IRegistry {
    return InsightsPlugin.configure({ ...options, enabled: true });
  }

  /**
   * Creates a disabled plugin configuration
   */
  public static disable(): IRegistry {
    return InsightsPlugin.configure({ enabled: false });
  }
}

/**
 * Default insights configuration for easy registration
 */
export const InsightsConfiguration = InsightsPlugin;

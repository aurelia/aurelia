import { IContainer, IRegistry } from '@aurelia/kernel';
import { IInsightsConfigurationOptions } from './interfaces';
import { createInsightsConfiguration } from './configuration';
import { IPerformanceTracker } from './performance-tracker';
import { IInsightsUtilities } from './utilities';
import { PerformanceLifecycleHooks } from './lifecycle-hooks';
import { RouterLifecycleHooks } from './router-lifecycle-hooks';
import { ITelemetryService } from './telemetry-service';
import { TelemetryDashboard, MetricGauge, MetricChart } from './components';
import { PerformanceRepeat } from './performance-repeat';
import { applyListenerBindingPatch } from './patches/listener-binding-patch';

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

        // Register visualization components globally
        container.register(
          TelemetryDashboard,
          MetricGauge,
          MetricChart
        );

        // Deregister the default repeat template controller and register our performance version
        // The repeat key follows the pattern: "au:resource:custom-attribute:repeat"
        const repeatResourceKey = 'au:resource:custom-attribute:repeat';
        if (container.has(repeatResourceKey, false)) {
          container.deregister(repeatResourceKey);
        }

        // Register our performance-tracking version of repeat template controller
        container.register(PerformanceRepeat);

        // Apply framework patches
        applyListenerBindingPatch(container);

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

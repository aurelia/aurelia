import { IDisposable, resolve } from '@aurelia/kernel';
import { lifecycleHooks, CustomElement } from '@aurelia/runtime-html';
import { IPerformanceTracker } from './performance-tracker';
import { IInsightsConfiguration } from './configuration';

// Import router interfaces for both packages
import type { IRouteableComponent, Parameters, RoutingInstruction } from '@aurelia/router-direct';
import type { IRouteViewModel, Params, RouteNode } from '@aurelia/router';
import type { Navigation } from '@aurelia/router-direct';

/**
 * Combined interface for both router packages
 */
type CombinedRouterComponent = IRouteableComponent & IRouteViewModel;

/**
 * Metadata structure for loading measurements
 */
interface LoadingMetadata {
  [key: string]: any;
  measurementName: string;
  componentName: string;
  hookType: string;
  route: string;
  timestamp: number;
  priority: string;
}

/**
 * Router lifecycle hooks for performance measurement
 */
@lifecycleHooks()
export class RouterLifecycleHooks implements IDisposable {
  private readonly performanceTracker: IPerformanceTracker = resolve(IPerformanceTracker);
  private readonly config: IInsightsConfiguration = resolve(IInsightsConfiguration);

  // Map component instances to their active loading measurements
  private readonly activeLoadingMeasurements = new Map<unknown, string>();
  // Map component instances to their metadata for attached hook
  private readonly loadingMetadata = new Map<unknown, LoadingMetadata>();

  public dispose(): void {
    this.activeLoadingMeasurements.clear();
    this.loadingMetadata.clear();
  }

  // Router Lifecycle Hook Implementations

  /**
   * loading hook - START measurement for loading time (loading → attached)
   * Supports both router packages with different signatures:
   * - router: loading(params: Params, next: RouteNode, current: RouteNode | null)
   * - router-direct: loading(parameters: Parameters, instruction: RoutingInstruction, navigation: Navigation)
   */
  public loading(
    vm: CombinedRouterComponent,
    paramsOrParams: Parameters | Params,
    instructionOrNext: RoutingInstruction | RouteNode,
    navigationOrCurrent?: Navigation | RouteNode | null
  ): void | Promise<void> {
    if (this.performanceTracker.isEnabled() &&
        this.config.enableRouterTracking) {

      const componentName = this.getComponentName(vm);
      const routeInfo = this.extractRouteInfo(instructionOrNext, navigationOrCurrent);
      const measurementName = `${componentName} • Loading → Attached (${routeInfo})`;

      const metadata = {
        componentName,
        hookType: 'loading-to-attached',
        route: routeInfo,
        timestamp: Date.now(),
        priority: 'high' // Mark loading as high priority for visibility
      };
      // Start measurement for loading → attached distance
      const measurementId = this.performanceTracker.startMeasurement(measurementName, metadata);
      this.activeLoadingMeasurements.set(vm, measurementId);
      this.loadingMetadata.set(vm, { ...metadata, measurementName });
    }
  }

  /**
   * attached hook - END measurement for loading time (loading → attached)
   */
  public attached(vm: unknown): void {
    if (this.performanceTracker.isEnabled() &&
        this.config.enableRouterTracking) {

      // Check if this component has an active loading measurement
      if (this.activeLoadingMeasurements.has(vm)) {
        this.endLoadingMeasurement(vm, true);
      }
    }
  }

  // Helper Methods
  private endLoadingMeasurement(vm: unknown, success: boolean, error?: unknown): void {
    const measurementId = this.activeLoadingMeasurements.get(vm);
    const metadata = this.loadingMetadata.get(vm);

    if (measurementId != null && metadata != null) {
      if (success === false && error != null) {
        // Create a separate error measurement
        this.createErrorMeasurement(metadata.measurementName, metadata, error);
      }

      this.performanceTracker.endMeasurement(measurementId);
      this.activeLoadingMeasurements.delete(vm);
      this.loadingMetadata.delete(vm);
    }
  }

  private createErrorMeasurement(baseName: string, baseMetadata: any, error: unknown): void {
    const errorMessage = (error as Error)?.message ?? 'Unknown error';
    const errorMeasurementName = `${baseName} (ERROR: ${errorMessage})`;
    this.performanceTracker.addInstantMeasurement(errorMeasurementName, {
      ...baseMetadata,
      error: true,
      errorMessage,
      success: false
    });
  }

  private getComponentName(vm: unknown): string {
    if (vm != null && typeof vm === 'object') {
      const vmObj = vm as Record<string, any>;
      const constructor = vmObj.constructor;

      try {
        const definition = CustomElement.getDefinition(constructor);
        return definition?.name ?? constructor?.name ?? 'UnknownRouterComponent';
      } catch {
        // Fallback to constructor name if getDefinition fails (e.g., in tests or non-custom-element components)
        return constructor?.name ?? 'UnknownRouterComponent';
      }
    }

    return 'UnknownRouterComponent';
  }

  /**
   * Enhanced route information extraction that properly handles both router packages
   */
  private extractRouteInfo(instructionOrNode: unknown, navigationOrCurrent?: Navigation | RouteNode | null): string {
    if (instructionOrNode == null) {
      return 'unknown route';
    }

    // Type guard for RouteNode (router)
    if (this.isRouteNode(instructionOrNode)) {

      // Use the official computeAbsolutePath method - this is the canonical way
      const absolutePath = instructionOrNode.computeAbsolutePath();
      if (absolutePath != null && absolutePath.length > 0) {
        return absolutePath;
      }

      // Fallback to finalPath or path
      if (instructionOrNode.finalPath != null && instructionOrNode.finalPath.length > 0) {
        return instructionOrNode.finalPath;
      }
      if (instructionOrNode.path != null && instructionOrNode.path.length > 0) {
        return instructionOrNode.path;
      }

      // Last resort: use component name
      if (instructionOrNode.component?.name != null) {
        return instructionOrNode.component.name;
      }

      return 'router-route';
    }

    // Type guard for RoutingInstruction (router-direct)
    if (this.isRoutingInstruction(instructionOrNode)) {
      // For router-direct, we can also check navigation object for route info
      if (navigationOrCurrent && this.isNavigation(navigationOrCurrent)) {
        const navigation = navigationOrCurrent as Navigation;
        // Try to extract route info from navigation object
        const routeInfo = this.extractRouteFromNavigation(navigation);
        if (routeInfo) return routeInfo;
      }
      // Extract route information from the route property
      if (instructionOrNode.route != null) {
        // Handle string route
        if (typeof instructionOrNode.route === 'string') {
          return instructionOrNode.route;
        }

        // Handle FoundRoute - need proper typing here
        const foundRoute = instructionOrNode.route as Record<string, unknown>;
        if (foundRoute.match != null && typeof foundRoute.match === 'object') {
          const match = foundRoute.match as Record<string, unknown>;

          // Try route path first
          if (typeof match.path === 'string' && match.path.length > 0) {
            return match.path;
          }

          // Try route id as fallback
          if (typeof match.id === 'string' && match.id.length > 0) {
            return match.id;
          }
        }

        // Try the matching path from FoundRoute
        if (typeof foundRoute.matching === 'string' && foundRoute.matching.length > 0) {
          return foundRoute.matching;
        }
      }

      // Fallback to component information
      if (instructionOrNode.component != null &&
          typeof instructionOrNode.component === 'object' &&
          'name' in instructionOrNode.component &&
          typeof instructionOrNode.component.name === 'string' &&
          instructionOrNode.component.name.length > 0) {
        return instructionOrNode.component.name;
      }

      // Last resort: viewport name
      if (instructionOrNode.viewport != null &&
          typeof instructionOrNode.viewport === 'object' &&
          'name' in instructionOrNode.viewport &&
          typeof instructionOrNode.viewport.name === 'string') {
        return `@${instructionOrNode.viewport.name}`;
      }

      return 'router-direct-route';
    }

    // Generic fallback for objects with path-like properties
    const obj = instructionOrNode as Record<string, unknown>;

    // Try common path properties
    if (typeof obj.path === 'string' && obj.path.length > 0) {
      return obj.path;
    }
    if (typeof obj.finalPath === 'string' && obj.finalPath.length > 0) {
      return obj.finalPath;
    }
    if (typeof obj.component === 'string' && obj.component.length > 0) {
      return obj.component;
    }
    if (obj.component != null &&
        typeof obj.component === 'object' &&
        'name' in obj.component &&
        typeof obj.component.name === 'string') {
      return obj.component.name;
    }

    return 'unknown route';
  }

  /**
   * Type guard to check if the object is a RouteNode (router)
   */
  private isRouteNode(obj: unknown): obj is RouteNode {
    if (obj == null || typeof obj !== 'object') {
      return false;
    }

    const node = obj as Record<string, unknown>;
    return (
      typeof node.computeAbsolutePath === 'function' &&
      typeof node.path === 'string' &&
      typeof node.finalPath === 'string' &&
      node.context != null &&
      node.component != null
    );
  }

  /**
   * Type guard to check if the object is a RoutingInstruction (router-direct)
   */
  private isRoutingInstruction(obj: unknown): obj is RoutingInstruction {
    if (obj == null || typeof obj !== 'object') {
      return false;
    }

    const instruction = obj as Record<string, unknown>;
    return (
      instruction.component != null &&
      instruction.endpoint != null &&
      instruction.parameters != null &&
      // RoutingInstructions have these specific properties
      typeof instruction.ownsScope === 'boolean' &&
      Object.prototype.hasOwnProperty.call(instruction, 'route') // route can be null, but should exist as property
    );
  }

  /**
   * Type guard to check if the object is a Navigation (router-direct)
   */
  private isNavigation(obj: unknown): obj is Navigation {
    if (obj == null || typeof obj !== 'object') {
      return false;
    }

    const navigation = obj as Record<string, unknown>;
    return (
      navigation.instruction != null &&
      navigation.trigger != null &&
      Object.prototype.hasOwnProperty.call(navigation, 'fromBrowser')
    );
  }

  /**
   * Extract route information from Navigation object (router-direct)
   */
  private extractRouteFromNavigation(navigation: Navigation): string | null {
    if (navigation.instruction) {
      // Handle string instruction
      if (typeof navigation.instruction === 'string') {
        return navigation.instruction;
      }
      // Handle RoutingInstruction[] - get the first instruction
      if (Array.isArray(navigation.instruction) && navigation.instruction.length > 0) {
        const firstInstruction = navigation.instruction[0];
        if (firstInstruction && typeof firstInstruction === 'object' && 'route' in firstInstruction) {
          const route = firstInstruction.route;
          if (typeof route === 'string') {
            return route;
          }
          // Handle route object
          if (route && typeof route === 'object' && 'path' in route) {
            const routeObj = route as Record<string, unknown>;
            if (typeof routeObj.path === 'string') {
              return routeObj.path;
            }
          }
        }
      }
    }
    // Try to get path from stored navigation
    if (navigation.path) {
      return navigation.path;
    }
    return null;
  }
}

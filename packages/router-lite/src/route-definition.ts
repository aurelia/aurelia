import { Metadata } from '@aurelia/metadata';
import {
  emptyObject,
  type IContainer,
  IModule,
  onResolve,
  Protocol,
  Writable,
} from '@aurelia/kernel';
import {
  type CustomElementDefinition,
  CustomElement,
} from '@aurelia/runtime-html';

import {
  TypedNavigationInstruction,
  NavigationInstructionType,
  ITypedNavigationInstruction_Component,
  defaultViewportName,
  type ViewportInstruction,
} from './instructions';
import {
  RouteConfig,
  IChildRouteConfig,
  Routeable,
  RouteType,
  Route,
  IRedirectRouteConfig,
  TransitionPlanOrFunc,
  IRouteConfig,
  noRoutes,
  TransitionPlan,
} from './route';
import type {
  IRouteContext,
} from './route-context';
import {
  isPartialChildRouteConfig,
  isPartialRedirectRouteConfig,
  shallowEquals,
} from './validation';
import {
  ensureArrayOfStrings,
  ensureString,
} from './util';
import type { IRouteViewModel } from './component-agent';
import type { RouteNode } from './route-tree';
import { FallbackFunction } from './resources/viewport';

function defaultReentryBehavior(current: RouteNode, next: RouteNode): TransitionPlan {
  if (!shallowEquals(current.params, next.params)) {
    return 'replace';
  }

  return 'none';
}

// TODO(sayan): cleanup so many configuration
// Configuration used in route definition.
/** @internal */
export class RouteDefinitionConfiguration {
  private constructor(
    public readonly id: string,
    public readonly component: CustomElementDefinition | null,
    public readonly path: string[],
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    public readonly redirectTo: string | null,
    public readonly caseSensitive: boolean,
    public readonly viewport: string,
    public readonly data: Record<string, unknown>,
    public readonly fallback: string | FallbackFunction | null,
    public readonly transitionPlan: TransitionPlanOrFunc | null,
    /** @internal */
    public readonly routes: readonly Routeable[],
    public readonly nav: boolean,
  ) { }

  public static create(config: RouteConfig, definition: RouteDefinition) {
    const component = definition.component;
    const path = ensureArrayOfStrings(config.path ?? component!.name);
    return new RouteDefinitionConfiguration(
      ensureString(config.id ?? path),
      component,
      path,
      config.title ?? null,
      config.redirectTo ?? null,
      config.caseSensitive,
      config.viewport ?? defaultViewportName,
      config.data ?? {},
      config.fallback ?? definition.fallback ?? null,
      config.transitionPlan ?? definition.transitionPlan ?? null,
      config.routes ?? noRoutes,
      config.nav,
    );
  }

  public getTransitionPlan(cur: RouteNode, next: RouteNode) {
    const plan = this.transitionPlan ?? defaultReentryBehavior;
    return typeof plan === 'function' ? plan(cur, next) : plan;
  }

  /** @internal */
  public _getFallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): string | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      ? fallback(viewportInstruction, routeNode, context)
      : fallback;
  }

  public toString() {
    return `RDC(id: ${this.id}, c: ${this.component?.Type.name}, path: ${this.path})`;
  }
}

// 1. Create one route definition per class.
// 2. The route configurations can come from primarily two sources:
//  - the configurations defined by the parent components
//  - the configurations defined by the this component using the `@route` decorator or `getRouteConfig` hook.
// 3. Store the configurations defined by this component directly under the RouteDefinition.
// 4. Store the configuration coming from the parents under the context lookup.
// 5. The configuration defined by the component itself always overrides the configuration coming from parent.
// 6. Need to find a (opinionated) sensible default.
export class RouteDefinition {
  /**
   * These route configurations are defined for the current component.
   * Depending on the parent route definition configuration there can be multiple configurations for the same component.
   * Example: the same component being used as child under multiple parent components,
   * or there are multiple configurations for the same component under same parent.
   *
   * @internal
   */
  private readonly _configurations: Map<RouteDefinitionConfiguration, RouteDefinitionConfiguration[]> = new Map<RouteDefinitionConfiguration, RouteDefinitionConfiguration[]>();

  /** @internal */
  public _directConfiguration: RouteDefinitionConfiguration | null = null;

  private constructor(
    public readonly component: CustomElementDefinition | null,
    public readonly fallback: string | FallbackFunction | null,
    public readonly transitionPlan: TransitionPlanOrFunc | null,
  ) { }

  /** @internal */
  private _addConfiguration(parent: RouteDefinitionConfiguration | null, config: RouteConfig, overrideDirectConfig: boolean): RouteDefinitionConfiguration {
    let $config: RouteDefinitionConfiguration | undefined;
    if (config._definedByComponent) {
      if (this._directConfiguration !== null && !overrideDirectConfig) throw new Error('Unexpected state; the direct configuration is already present.');
      $config = RouteDefinitionConfiguration.create(config, this);
      if (this._directConfiguration === null) {
        this._directConfiguration = $config;
      } else {
        const existing = this._directConfiguration;
        (existing as Writable<RouteDefinitionConfiguration>).id = $config.id ?? existing.id;
        (existing as Writable<RouteDefinitionConfiguration>).path = $config.path ?? existing.path;
        (existing as Writable<RouteDefinitionConfiguration>).title = $config.title ?? existing.title;
        (existing as Writable<RouteDefinitionConfiguration>).redirectTo = $config.redirectTo ?? existing.redirectTo;
        (existing as Writable<RouteDefinitionConfiguration>).caseSensitive = $config.caseSensitive ?? existing.caseSensitive;
        (existing as Writable<RouteDefinitionConfiguration>).viewport = $config.viewport ?? existing.viewport;
        (existing as Writable<RouteDefinitionConfiguration>).data = $config.data ?? existing.data;
        (existing as Writable<RouteDefinitionConfiguration>).fallback = $config.fallback ?? existing.fallback;
        (existing as Writable<RouteDefinitionConfiguration>).transitionPlan = $config.transitionPlan ?? existing.transitionPlan;
        (existing as Writable<RouteDefinitionConfiguration>).nav = $config.nav ?? existing.nav;
      }
      if (parent == null) return $config;
    }

    if (parent == null) throw new Error('When adding route configuration to definition, a route context must be provided.');

    let configurations = this._configurations.get(parent);
    if (configurations === void 0) {
      this._configurations.set(parent, configurations = []);
    }

    configurations.push($config ??= RouteDefinitionConfiguration.create(config, this));
    return $config;
  }

  /** @internal */
  private _getConfigurations(parent?: RouteDefinitionConfiguration | null): RouteDefinitionConfiguration[] | null {
    return parent == null
      ? null
      : (this._configurations.get(parent) ?? null);
  }

  /** @internal */
  public _getFallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): string | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      ? fallback(viewportInstruction, routeNode, context)
      : fallback;
  }

  private _hasChildRoutes(): boolean {
    const directConfig = this._directConfiguration;
    if (directConfig === null) return false;
    return directConfig.routes.length !== 0;
  }

  // Note on component instance: it is non-null for the root, and when the component agent is created via the route context (if the child routes are not yet configured).
  public static resolve(routeable: string,          parent: RouteDefinitionConfiguration,         routeNode: RouteNode | null): never;
  public static resolve(routeable: string,          parent: RouteDefinitionConfiguration,         routeNode: null,              context: IRouteContext): RouteDefinitionConfiguration;
  public static resolve(routeable: IRouteViewModel, parent: RouteDefinitionConfiguration,         routeNode: RouteNode): RouteDefinitionConfiguration | Promise<RouteDefinitionConfiguration>;
  public static resolve(routeable: Routeable,       parent: RouteDefinitionConfiguration,         routeNode: null,              context: IRouteContext): RouteDefinitionConfiguration | Promise<RouteDefinitionConfiguration>;
  public static resolve(routeable: Routeable,       parent: null,                                 routeNode: null,              context: IRouteContext): RouteDefinitionConfiguration[];
  public static resolve(routeable: Routeable,       parent: RouteDefinitionConfiguration | null,  routeNode: null,              context: IRouteContext | null,  rdConfig: RouteDefinitionConfiguration | null): RouteDefinitionConfiguration;
  public static resolve(routeable: Routeable,       parent: RouteDefinitionConfiguration | null,  routeNode: RouteNode | null,  context?: IRouteContext | null, rdConfig?: RouteDefinitionConfiguration | null): RouteDefinitionConfiguration | RouteDefinitionConfiguration[] | Promise<RouteDefinitionConfiguration | RouteDefinitionConfiguration[]> {
    if (isPartialRedirectRouteConfig(routeable)) {
      if (parent == null) throw new Error('When adding route configuration to definition, a parent must be provided.');
      const routeDefinition = new RouteDefinition(null, parent?.fallback ?? null, parent?.transitionPlan ?? null);
      return routeDefinition._addConfiguration(parent, RouteConfig._create(routeable, null, false/* , parentConfig */), false);
    }

    const instruction = this._createNavigationInstruction(routeable);
    let ceDef: CustomElementDefinition | Promise<CustomElementDefinition>;
    switch (instruction.type) {
      case NavigationInstructionType.string: {
        if (context == null) throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
        const component = context.container.find(CustomElement, instruction.value);
        if (component === null) throw new Error(`Could not find a CustomElement named '${instruction.value}' in the current container scope of ${context}. This means the component is neither registered at Aurelia startup nor via the 'dependencies' decorator or static property.`);
        ceDef = component;
        break;
      }
      case NavigationInstructionType.CustomElementDefinition:
        ceDef = instruction.value;
        break;
      case NavigationInstructionType.IRouteViewModel:
        // Get the class from the constructor property. There might be static properties on it.
        ceDef = CustomElement.getDefinition(instruction.value.constructor as RouteType);
        break;
      case NavigationInstructionType.Promise:
        if (context == null) throw new Error(`RouteContext must be provided when resolving an imported module`);
        ceDef = context.resolveLazy(instruction.value);
        break;
    }

    // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
    // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
    // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
    return onResolve(ceDef, $ceDef => {
      let routeDefinition = $RouteDefinition.get($ceDef);
      const hasRouteConfigHook = instruction.type === NavigationInstructionType.IRouteViewModel && typeof (routeable as IRouteViewModel).getRouteConfig === 'function';

      const type = $ceDef.Type;
      if (routeDefinition === null) {

        // typical use case: root component without the @route deco.
        if (hasRouteConfigHook) return onResolve(
          (routeable as IRouteViewModel).getRouteConfig!(parent, routeNode),
          (value) => {
            if (parent == null) throw new Error('When adding route configuration to definition, a parent must be provided.');
            routeDefinition = new RouteDefinition($ceDef, parent?.fallback ?? null, parent?.transitionPlan ?? null);
            $RouteDefinition.define(routeDefinition, $ceDef);
            return routeDefinition._addConfiguration(
              parent,
              RouteConfig._create(
                value ?? emptyObject,
                type,
                true,
                /* , parentConfig */
              ),
              true,
            );
          });

        routeDefinition = new RouteDefinition($ceDef, parent?.fallback ?? null, parent?.transitionPlan ?? null);
        $RouteDefinition.define(routeDefinition, $ceDef);
        if (!isPartialChildRouteConfig(routeable) && Route.isConfigured(type)) {
          // this means that this component defines it's own child configuration using @route deco.
          return /* const directConfig = */ routeDefinition._addConfiguration(null, Route.getConfig(type), true);
          // if (parent == null) return directConfig;
        }
        if (parent == null) throw new Error('When adding route configuration to definition, a parent must be provided.');
         return routeDefinition._addConfiguration(
          parent,
          RouteConfig._create(
            // The component is configured as a child in a parent route configuration.
            isPartialChildRouteConfig(routeable)
              ? routeable as string | string[] | IRouteConfig
              : {},
            type,
            false
            /* , parentConfig */
          ),
          false);
      } else if (!routeDefinition._hasChildRoutes()) {
        if(hasRouteConfigHook) {
          return onResolve((routeable as IRouteViewModel).getRouteConfig?.(parent, routeNode), value => {
            return value == null
              ? getRouteDefinitionConfiguration(routeDefinition!)
              : routeDefinition!._addConfiguration(parent, RouteConfig._create(value, type, true), true);
          });
        }
        if (!isPartialChildRouteConfig(routeable) && Route.isConfigured(type)) {
          // this means that this component defines it's own child configuration using @route deco.
          return /* const directConfig = */ routeDefinition._addConfiguration(null, Route.getConfig(type), true);
          // if (parent == null) return directConfig;
        }
      }
      return getRouteDefinitionConfiguration(routeDefinition);
      // let configurations: RouteDefinitionConfiguration | RouteDefinitionConfiguration [] | null = routeDefinition._getConfigurations(parent);
      // if (configurations !== null) {
      //   return rdConfig != null && configurations.includes(rdConfig) ? rdConfig : configurations;
      // }
      // configurations = routeDefinition._directConfiguration;
      // if (configurations !== null) return configurations;
      // throw new Error(`No route is configured for the component '${routeDefinition?.component?.name}' for the given context '${context?.friendlyPath}'`);
    });

    function getRouteDefinitionConfiguration(routeDefinition: RouteDefinition): RouteDefinitionConfiguration | RouteDefinitionConfiguration [] {
      let configurations: RouteDefinitionConfiguration | RouteDefinitionConfiguration [] | null = routeDefinition._getConfigurations(parent);
      if (configurations !== null) return rdConfig != null && configurations.includes(rdConfig) ? rdConfig : configurations;

      configurations = routeDefinition._directConfiguration;
      if (configurations !== null) return configurations;

      throw new Error(`No route is configured for the component '${routeDefinition?.component?.name}' for the given context '${context?.friendlyPath}'`);
    }
  }

  /** @internal */
  private static _createNavigationInstruction(routeable: Exclude<Routeable, IRedirectRouteConfig>): ITypedNavigationInstruction_Component {
    return isPartialChildRouteConfig(routeable)
      ? this._createNavigationInstruction(routeable.component)
      : TypedNavigationInstruction.create(routeable);
  }

  // /** @internal */
  // private applyChildRouteConfig(config: IChildRouteConfig) {
  //   (this as Writable<RouteDefinition>).config = config = this.config.applyChildRouteConfig(config, null);
  //   (this as Writable<RouteDefinition>).caseSensitive = config.caseSensitive ?? this.caseSensitive;
  //   (this as Writable<RouteDefinition>).path = ensureArrayOfStrings(config.path ?? this.path);
  //   (this as Writable<RouteDefinition>).redirectTo = config.redirectTo ?? null;
  //   (this as Writable<RouteDefinition>).viewport = config.viewport ?? defaultViewportName;
  //   (this as Writable<RouteDefinition>).id = ensureString(config.id ?? this.path);
  //   (this as Writable<RouteDefinition>).data = config.data ?? {};
  //   (this as Writable<RouteDefinition>).fallback = config.fallback ?? this.fallback;
  // }

  public register(container: IContainer): void {
    this.component?.register(container);
  }

  public toString(): string {
    const config = this._directConfiguration;
    const path = (config?.path ?? null) === null ? 'null' : `'${config!.path}'`;
    if (this.component !== null) {
      return `RD(config.path:${path},c.name:'${this.component.name}',vp:'${config?.viewport}')`;
    } else {
      return `RD(config.path:${path},redirectTo:'${config?.redirectTo}')`;
    }
  }
}

export const $RouteDefinition = {
  name: Protocol.resource.keyFor('route-definition'),
  /**
   * Returns `true` if the `def` has a route definition.
   */
  isDefined(def: CustomElementDefinition): boolean {
    return Metadata.hasOwn($RouteDefinition.name, def);
  },
  /**
   * Apply the specified configuration to the specified type, overwriting any existing configuration.
   */
  define(routeDefinition: RouteDefinition, customElementDefinition: CustomElementDefinition): void {
    Metadata.define($RouteDefinition.name, routeDefinition, customElementDefinition);
  },
  /**
   * Get the `RouteDefinition` associated with the `customElementDefinition`.
   * Returns `null` if no route definition is associated with the given `customElementDefinition`.
   */
  get(customElementDefinition: CustomElementDefinition): RouteDefinition | null {
    return $RouteDefinition.isDefined(customElementDefinition)
      ? Metadata.getOwn($RouteDefinition.name, customElementDefinition) as RouteDefinition
      : null;
  },
};

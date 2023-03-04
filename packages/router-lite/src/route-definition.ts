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
} from './route';
import type {
  IRouteContext,
} from './route-context';
import {
  isPartialChildRouteConfig,
  isPartialRedirectRouteConfig,
} from './validation';
import {
  ensureArrayOfStrings,
  ensureString,
} from './util';
import type { IRouteViewModel } from './component-agent';
import type { RouteNode } from './route-tree';
import { FallbackFunction } from './resources/viewport';

// TODO(sayan): cleanup so many configuration
// Configuration used in route definition.
/** @internal */
export class RouteDefinitionConfiguration {
  private constructor(
    public readonly id: string,
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
    const path = ensureArrayOfStrings(config.path ?? definition.component!.name);
    return new RouteDefinitionConfiguration(
      ensureString(config.id ?? path),
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
   * Depending on the routing context there can be multiple configurations for the same component.
   * Example: the same component being used as child under multiple parent components,
   * or there are multiple configurations for the same component under same parent.
   *
   * @internal
   */
  private readonly _configurations: WeakMap<IRouteContext, RouteDefinitionConfiguration[]> = new WeakMap<IRouteContext, RouteDefinitionConfiguration[]>();

  /** @internal */
  public _directConfiguration: RouteDefinitionConfiguration | null = null;

  private constructor(
    public readonly component: CustomElementDefinition | null,
    public readonly fallback: string | FallbackFunction | null,
    public readonly transitionPlan: TransitionPlanOrFunc | null,
  ) { }

  /** @internal */
  private _addConfiguration(context: IRouteContext | null, config: RouteConfig, overrideDirectConfig: boolean): RouteDefinitionConfiguration {
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
      if (context == null) return $config;
    }

    if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');

    let configurations = this._configurations.get(context);
    if (configurations === void 0) {
      this._configurations.set(context, configurations = []);
    }

    configurations.push($config ??= RouteDefinitionConfiguration.create(config, this));
    return $config;
  }

  /** @internal */
  private _getConfigurations(context: IRouteContext): RouteDefinitionConfiguration[] | null {
    return this._configurations.get(context) ?? null;
  }

  /** @internal */
  private _hasConfigurations(context: IRouteContext): boolean {
    const configurations = this._configurations.get(context);
    return configurations != null && configurations.length > 0;
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
  public static resolve(routeable: Promise<IModule>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): [RouteDefinition, RouteDefinitionConfiguration] | Promise<[RouteDefinition, RouteDefinitionConfiguration]>;
  public static resolve(routeable: string | IChildRouteConfig, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): [RouteDefinition, RouteDefinitionConfiguration];
  public static resolve(routeable: string | IChildRouteConfig | Promise<IModule>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null): never;
  public static resolve(routeable: Exclude<Routeable, Promise<IModule> | string | IChildRouteConfig>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null): [RouteDefinition, RouteDefinitionConfiguration] | Promise<[RouteDefinition, RouteDefinitionConfiguration]>;
  public static resolve(routeable: Routeable, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): [RouteDefinition, RouteDefinitionConfiguration | null | undefined] | Promise<[RouteDefinition, RouteDefinitionConfiguration | null | undefined]>;
  public static resolve(routeable: Routeable, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context?: IRouteContext): [RouteDefinition, RouteDefinitionConfiguration | null | undefined] | Promise<[RouteDefinition, RouteDefinitionConfiguration | null | undefined]> {
    if (isPartialRedirectRouteConfig(routeable)) {
      if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');
      const routeDefinition = new RouteDefinition(null, parentDefinition?.fallback ?? null, parentDefinition?.transitionPlan ?? null);
      const rdConfig = routeDefinition._addConfiguration(context, RouteConfig._create(routeable, null, false/* , parentConfig */), false);
      return [routeDefinition, rdConfig];
    }

    const instruction = this._createNavigationInstruction(routeable);
    let ceDef: CustomElementDefinition | Promise<CustomElementDefinition>;
    switch (instruction.type) {
      case NavigationInstructionType.string: {
        if (context === void 0) throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
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
        if (context === void 0) throw new Error(`RouteContext must be provided when resolving an imported module`);
        ceDef = context.resolveLazy(instruction.value);
        break;
    }

    // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
    // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
    // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
    return onResolve(ceDef, $ceDef => {
      let rdConfig: RouteDefinitionConfiguration | null = null;
      let routeDefinition = $RouteDefinition.get($ceDef);
      const hasRouteConfigHook = instruction.type === NavigationInstructionType.IRouteViewModel && typeof (routeable as IRouteViewModel).getRouteConfig === 'function';

      const type = $ceDef.Type;
      if (routeDefinition === null) {

        // typical use case: root component without the @route deco.
        if (hasRouteConfigHook) return onResolve(
          (routeable as IRouteViewModel).getRouteConfig!(parentDefinition, routeNode),
          (value) => {
            if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');
            routeDefinition = new RouteDefinition($ceDef, parentDefinition?.fallback ?? null, parentDefinition?.transitionPlan ?? null);
            $RouteDefinition.define(routeDefinition, $ceDef);
            rdConfig = routeDefinition._addConfiguration(
              context,
              RouteConfig._create(
                value ?? emptyObject,
                type,
                true,
                /* , parentConfig */
              ),
              true,
            );
            return [routeDefinition, rdConfig];
          });

        if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');

        routeDefinition = new RouteDefinition($ceDef, parentDefinition?.fallback ?? null, parentDefinition?.transitionPlan ?? null);
        $RouteDefinition.define(routeDefinition, $ceDef);
        if (isPartialChildRouteConfig(routeable)) {
          // The component is configured as a child in a parent route configuration.
          if (Route.isConfigured(type)) {
            // this means that this component defines it's own child configuration using @route deco.
            routeDefinition._addConfiguration(context, Route.getConfig(type), true);
          }
        }
        rdConfig = routeDefinition._addConfiguration(context, RouteConfig._create(routeable as string | string[] | IRouteConfig, type, false/* , parentConfig */), false);
      } else if (!routeDefinition._hasChildRoutes() && hasRouteConfigHook) {
        return onResolve((routeable as IRouteViewModel).getRouteConfig?.(parentDefinition, routeNode), value => {
          if (value == null) return [routeDefinition!, rdConfig];
          rdConfig = routeDefinition!._addConfiguration(context ?? null, RouteConfig._create(value, type, true), true);
          return [routeDefinition!, rdConfig];
        });
      }
      return [routeDefinition, rdConfig];
    });
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

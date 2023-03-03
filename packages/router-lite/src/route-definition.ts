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
export class RouteDefinitionConfiguration {
  private constructor(
    public readonly id: string,
    public readonly path: string[],
    public readonly redirectTo: string | null,
    public readonly caseSensitive: boolean,
    public readonly viewport: string,
    public readonly data: Record<string, unknown>,
    public readonly fallback: string | FallbackFunction | null,
    public readonly transitionPlan: TransitionPlanOrFunc | null,
  ) { }

  public static create(config: RouteConfig, definition: RouteDefinition) {
    const path = ensureArrayOfStrings(config.path ?? definition.component!.name);
    return new RouteDefinitionConfiguration(
      ensureString(config.id ?? path),
      path,
      config.redirectTo ?? null,
      config.caseSensitive,
      config.viewport ?? defaultViewportName,
      config.data ?? {},
      config.fallback ?? definition.fallback ?? null,
      config.transitionPlan ?? definition.transitionPlan ?? null,
    );
  }
}

export class RouteDefinition {
  /** @internal */
  private readonly _configurations: WeakMap<IRouteContext, RouteDefinitionConfiguration[]> = new WeakMap<IRouteContext, RouteDefinitionConfiguration[]>();

  private constructor(
    public readonly component: CustomElementDefinition | null,
    public readonly fallback: string | FallbackFunction | null,
    public readonly transitionPlan: TransitionPlanOrFunc | null,
  ) { }

  /** @internal */
  private _addConfiguration(context: IRouteContext, config: RouteConfig) {
    if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');

    let configurations = this._configurations.get(context);
    if (configurations === void 0) {
      this._configurations.set(context, configurations = []);
    }

    configurations.push(RouteDefinitionConfiguration.create(config, this));
  }

  /** @internal */
  private _getConfigurations(context: IRouteContext): RouteDefinitionConfiguration[] | null {
    return this._configurations.get(context) ?? null;
  }

  /** @internal */
  private _hasConfigurations(context: IRouteContext): boolean {
    const configurations =  this._configurations.get(context);
    return configurations != null && configurations.length > 0;
  }

  /** @internal */
  public _getFallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): string | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      ? fallback(viewportInstruction, routeNode, context)
      : fallback;
  }

  // Note on component instance: it is non-null for the root, and when the component agent is created via the route context (if the child routes are not yet configured).
  public static resolve(routeable: Promise<IModule>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
  public static resolve(routeable: string | IChildRouteConfig, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): RouteDefinition;
  public static resolve(routeable: string | IChildRouteConfig | Promise<IModule>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null): never;
  public static resolve(routeable: Exclude<Routeable, Promise<IModule> | string | IChildRouteConfig>, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null): RouteDefinition | Promise<RouteDefinition>;
  public static resolve(routeable: Routeable, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
  public static resolve(routeable: Routeable, parentDefinition: RouteDefinition | null, routeNode: RouteNode | null, context?: IRouteContext): RouteDefinition | Promise<RouteDefinition> {
    if (isPartialRedirectRouteConfig(routeable)) {
      if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');
      const routeDefinition = new RouteDefinition(null, parentDefinition?.fallback ?? null, parentDefinition?.transitionPlan ?? null);
      routeDefinition._addConfiguration(context, RouteConfig._create(routeable, null/* , parentConfig */));
      return routeDefinition;
    }

    const instruction = this.createNavigationInstruction(routeable);
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
    return onResolve(ceDef, def => {
      let routeDefinition = $RouteDefinition.get(def);
      const hasRouteConfigHook = instruction.type === NavigationInstructionType.IRouteViewModel && typeof (routeable as IRouteViewModel).getRouteConfig === 'function';

      if (routeDefinition === null) {
        const type = def.Type;

        if (hasRouteConfigHook) return onResolve(
          (routeable as IRouteViewModel).getRouteConfig!(parentDefinition, routeNode),
          (value) => {
            if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');
            routeDefinition = new RouteDefinition(def, parentDefinition?.fallback ?? null, parentDefinition?.transitionPlan ?? null);
            $RouteDefinition.define(routeDefinition, def);
            routeDefinition._addConfiguration(context, RouteConfig._create(value ?? emptyObject, type/* , parentConfig */));
            return routeDefinition;
          });

        if (context == null) throw new Error('When adding route configuration to definition, a route context must be provided.');

        routeDefinition = new RouteDefinition(def, parentDefinition?.fallback ?? null, parentDefinition?.transitionPlan ?? null);
        $RouteDefinition.define(routeDefinition, def);
        routeDefinition._addConfiguration(context,
          isPartialChildRouteConfig(routeable)
            ? Route.isConfigured(type)
              ? Route.getConfig(type).applyChildRouteConfig(routeable/* , parentConfig */)
              : RouteConfig._create(routeable, type/* , parentConfig */)
            : Route.getConfig(def.Type)
        );

      } else if (!routeDefinition._hasConfigurations(context) && hasRouteConfigHook) {
        return onResolve((routeable as IRouteViewModel).getRouteConfig?.(parentDefinition, routeNode), value => {
          routeDefinition!.applyChildRouteConfig(value ?? emptyObject);
          return routeDefinition!;
        });
      }
      return routeDefinition;
    });
  }

  private static createNavigationInstruction(routeable: Exclude<Routeable, IRedirectRouteConfig>): ITypedNavigationInstruction_Component {
    return isPartialChildRouteConfig(routeable)
      ? this.createNavigationInstruction(routeable.component)
      : TypedNavigationInstruction.create(routeable);
  }

  /** @internal */
  private applyChildRouteConfig(config: IChildRouteConfig) {
    (this as Writable<RouteDefinition>).config = config = this.config.applyChildRouteConfig(config, null);
    (this as Writable<RouteDefinition>).caseSensitive = config.caseSensitive ?? this.caseSensitive;
    (this as Writable<RouteDefinition>).path = ensureArrayOfStrings(config.path ?? this.path);
    (this as Writable<RouteDefinition>).redirectTo = config.redirectTo ?? null;
    (this as Writable<RouteDefinition>).viewport = config.viewport ?? defaultViewportName;
    (this as Writable<RouteDefinition>).id = ensureString(config.id ?? this.path);
    (this as Writable<RouteDefinition>).data = config.data ?? {};
    (this as Writable<RouteDefinition>).fallback = config.fallback ?? this.fallback;
  }

  public register(container: IContainer): void {
    this.component?.register(container);
  }

  public toString(): string {
    const path = this.config.path === null ? 'null' : `'${this.config.path}'`;
    if (this.component !== null) {
      return `RD(config.path:${path},c.name:'${this.component.name}',vp:'${this.viewport}')`;
    } else {
      return `RD(config.path:${path},redirectTo:'${this.redirectTo}')`;
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

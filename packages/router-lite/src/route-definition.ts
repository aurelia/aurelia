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

export class RouteDefinition {
  public readonly hasExplicitPath: boolean;
  public readonly caseSensitive: boolean;
  public readonly path: string[];
  public readonly redirectTo: string | null;
  public readonly viewport: string;
  public readonly id: string;
  public readonly data: Record<string, unknown>;
  public readonly fallback: string | FallbackFunction | null;

  private constructor(
    public readonly config: RouteConfig,
    public readonly component: CustomElementDefinition | null,
    parentDefinition: RouteDefinition | null,
  ) {
    this.hasExplicitPath = config.path !== null;
    this.caseSensitive = config.caseSensitive;
    this.path = ensureArrayOfStrings(config.path ?? component!.name);
    this.redirectTo = config.redirectTo ?? null;
    this.viewport = config.viewport ?? defaultViewportName;
    this.id = ensureString(config.id ?? this.path);
    this.data = config.data ?? {};
    this.fallback = config.fallback ?? parentDefinition?.fallback ?? null;
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
    const parentConfig = parentDefinition?.config ?? null;
    if (isPartialRedirectRouteConfig(routeable)) return new RouteDefinition(RouteConfig._create(routeable, null, parentConfig), null, parentDefinition);

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
            const config = RouteConfig._create(value ?? emptyObject, type, parentConfig);
            routeDefinition = new RouteDefinition(config, def, parentDefinition);
            $RouteDefinition.define(routeDefinition, def);
            return routeDefinition;
          });
        const config = isPartialChildRouteConfig(routeable)
          ? Route.isConfigured(type)
            ? Route.getConfig(type).applyChildRouteConfig(routeable, parentConfig)
            : RouteConfig._create(routeable, type, parentConfig)
          : Route.getConfig(def.Type);

        routeDefinition = new RouteDefinition(config, def, parentDefinition);
        $RouteDefinition.define(routeDefinition, def);
      } else if (routeDefinition.config.routes.length === 0 && hasRouteConfigHook) {
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
    (this as Writable<RouteDefinition>).hasExplicitPath = config.path !== null;
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

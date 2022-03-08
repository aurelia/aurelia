import { IContainer, IModule, Metadata, onResolve } from '@aurelia/kernel';
import { CustomElementDefinition, CustomElement } from '@aurelia/runtime-html';

import { TypedNavigationInstruction, NavigationInstructionType, Params } from './instructions.js';
import { RouteConfig, IChildRouteConfig, Routeable, RouteType, Route, IRedirectRouteConfig } from './route.js';
import { IRouteContext } from './route-context.js';
import { isPartialChildRouteConfig, isPartialRedirectRouteConfig } from './validation.js';
import { ensureArrayOfStrings, ensureString } from './util.js';

export class RouteDefinition {
  public readonly hasExplicitPath: boolean;
  public readonly caseSensitive: boolean;
  public readonly path: string[];
  public readonly redirectTo: string | null;
  public readonly viewport: string;
  public readonly id: string;
  public readonly data: Params;

  public constructor(
    public readonly config: Omit<RouteConfig, 'saveTo'>,
    public readonly component: CustomElementDefinition | null,
  ) {
    this.hasExplicitPath = config.path !== null;
    this.caseSensitive = config.caseSensitive;
    this.path = ensureArrayOfStrings(config.path ?? component!.name);
    this.redirectTo = config.redirectTo ?? null;
    this.viewport = config.viewport ?? 'default';
    this.id = ensureString(config.id ?? this.path);
    this.data = config.data ?? {};
  }

  public static resolve(routeable: Promise<IModule>, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
  public static resolve(routeable: string | IChildRouteConfig, context: IRouteContext): RouteDefinition;
  public static resolve(routeable: string | IChildRouteConfig | Promise<IModule>): never;
  public static resolve(routeable: Exclude<Routeable, Promise<IModule> | string | IChildRouteConfig>): RouteDefinition;
  public static resolve(routeable: Routeable, context: IRouteContext): RouteDefinition | Promise<RouteDefinition>;
  public static resolve(routeable: Routeable, context?: IRouteContext): RouteDefinition | Promise<RouteDefinition> {
    if (isPartialRedirectRouteConfig(routeable)) {
      return new RouteDefinition(routeable as RouteConfig, null);
    }

    // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
    // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
    // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
    return onResolve(this.resolveCustomElementDefinition(routeable, context), def => {
      const config = isPartialChildRouteConfig(routeable)
        ? {
          ...Route.getConfig(def.Type),
          ...routeable
        }
        : Route.getConfig(def.Type);

      if (!Metadata.hasOwn(Route.name, def)) {
        const routeDefinition = new RouteDefinition(config, def);
        Metadata.define(Route.name, routeDefinition, def);
      } else {
        let routeDefinition = Metadata.getOwn(Route.name, def) as RouteDefinition;
        if (routeDefinition.config !== config) {
          routeDefinition = new RouteDefinition(config, def);
          Metadata.define(Route.name, routeDefinition, def);
        }
      }

      return Metadata.getOwn(Route.name, def) as RouteDefinition;
    });
  }

  public static resolveCustomElementDefinition(
    routeable: Exclude<Routeable, IRedirectRouteConfig>,
    context?: IRouteContext,
  ): CustomElementDefinition | Promise<CustomElementDefinition> {
    if (isPartialChildRouteConfig(routeable)) {
      return this.resolveCustomElementDefinition(routeable.component, context);
    }

    const typedInstruction = TypedNavigationInstruction.create(routeable);
    switch (typedInstruction.type) {
      case NavigationInstructionType.string: {
        if (context === void 0) {
          throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
        }
        const component = context.container.find(CustomElement, typedInstruction.value);
        if (component === null) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          throw new Error(`Could not find a CustomElement named '${typedInstruction.value}' in the current container scope of ${context}. This means the component is neither registered at Aurelia startup nor via the 'dependencies' decorator or static property.`);
        }
        return component as CustomElementDefinition;
      }
      case NavigationInstructionType.CustomElementDefinition:
        return typedInstruction.value;
      case NavigationInstructionType.IRouteViewModel:
        // Get the class from the constructor property. There might be static properties on it.
        return CustomElement.getDefinition(typedInstruction.value.constructor as RouteType);
      case NavigationInstructionType.Promise:
        if (context === void 0) {
          throw new Error(`RouteContext must be provided when resolving an imported module`);
        }
        return context.resolveLazy(typedInstruction.value);
    }
  }

  public register(container: IContainer): void {
    this.component?.register(container);
  }

  public toUrlComponent(): string {
    return 'not-implemented'; // TODO
  }

  public toString(): string {
    const path = this.config.path === null ? 'null' : `'${this.config.path}'`;
    if (this.component !== null) {
      return `RD(config.path:${path},c.name:'${this.component.name}')`;
    } else {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return `RD(config.path:${path},redirectTo:'${this.redirectTo}')`;
    }
  }
}

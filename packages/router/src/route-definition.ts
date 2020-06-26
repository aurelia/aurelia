/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  Metadata,
} from '@aurelia/kernel';
import {
  CustomElementDefinition,
  CustomElement,
} from '@aurelia/runtime';

import {
  RouteableComponent,
  TypedNavigationInstruction,
  NavigationInstructionType,
  Params,
} from './instructions';
import {
  RouteConfig,
  IChildRouteConfig,
  Routeable,
  RouteType,
  Route,
} from './route';
import {
  IRouteContext,
} from './route-context';
import {
  isPartialChildRouteConfig,
} from './validation';

export class RouteDefinition {
  public readonly hasExplicitPath: boolean;
  public readonly caseSensitive: boolean;
  public readonly path: string;
  public readonly viewport: string;
  public readonly id: string;
  public readonly data: Params;

  public constructor(
    public readonly config: RouteConfig,
    public readonly component: CustomElementDefinition,
  ) {
    this.hasExplicitPath = this.config.path !== null;
    this.caseSensitive = config.caseSensitive;
    this.path = this.config.path ?? this.component.name;
    this.viewport = this.config.viewport ?? 'default';
    this.id = this.config.id ?? this.path;
    this.data = this.config.data ?? {};
  }

  public static resolve(routeable: string | IChildRouteConfig, context: IRouteContext): RouteDefinition;
  public static resolve(routeable: RouteableComponent): RouteDefinition;
  public static resolve(routeable: Routeable, context?: IRouteContext): RouteDefinition;
  public static resolve(routeable: Routeable, context?: IRouteContext): RouteDefinition {
    if (isPartialChildRouteConfig(routeable)) {
      return RouteDefinition.resolve(routeable.component, context);
    }

    const typedInstruction = TypedNavigationInstruction.create(routeable);
    let ceDefinition: CustomElementDefinition;
    switch (typedInstruction.type) {
      case NavigationInstructionType.string:
        ceDefinition = resolveComponentByName(typedInstruction.value, context);
        break;
      case NavigationInstructionType.CustomElementDefinition:
        ceDefinition = typedInstruction.value;
        break;
      case NavigationInstructionType.IRouteViewModel:
        // Get the class from the constructor property. There might be static properties on it.
        ceDefinition = CustomElement.getDefinition(typedInstruction.value.constructor as RouteType);
        break;
    }

    // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
    // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
    // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
    const config = Route.getConfig(ceDefinition.Type);
    if (!Metadata.hasOwn(Route.name, ceDefinition)) {
      const routeDefinition = new RouteDefinition(config, ceDefinition);
      Metadata.define(Route.name, routeDefinition, ceDefinition);
    } else {
      let routeDefinition = Metadata.getOwn(Route.name, ceDefinition) as RouteDefinition;
      if (routeDefinition.config !== config) {
        routeDefinition = new RouteDefinition(config, ceDefinition);
        Metadata.define(Route.name, routeDefinition, ceDefinition);
      }
    }

    return Metadata.getOwn(Route.name, ceDefinition);
  }

  public toString(): string {
    const path = this.config.path === null ? 'null' : `'${this.config.path}'`;
    return `RD(config.path:${path},c.name:'${this.component.name}')`;
  }
}

function resolveComponentByName(name: string, context: IRouteContext | undefined): CustomElementDefinition {
  if (context === void 0) {
    throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
  }
  const component = context.findResource(CustomElement, name);
  if (component === null) {
    throw new Error(`Could not find a CustomElement named '${name}' in the current container scope of ${context}. This means the component is neither registered at Aurelia startup nor via the 'dependencies' decorator or static property.`);
  }
  return component as CustomElementDefinition;
}

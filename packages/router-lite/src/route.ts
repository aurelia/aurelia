import { Metadata } from '@aurelia/metadata';
import { Constructable, emptyArray, onResolve, Protocol, ResourceType, Writable, IContainer } from '@aurelia/kernel';

import { validateRouteConfig, expectType, shallowEquals, isPartialRedirectRouteConfig, isPartialChildRouteConfig } from './validation';
import { defaultViewportName, ITypedNavigationInstruction_Component, NavigationInstructionType, TypedNavigationInstruction, ViewportInstruction } from './instructions';
import type { RouteNode } from './route-tree';
import type { IRouteContext } from './route-context';
import { CustomElement, CustomElementDefinition } from '@aurelia/runtime-html';
import { IRouteViewModel } from './component-agent';
import { ensureArrayOfStrings, ensureString } from './util';
import type { FallbackFunction, IChildRouteConfig, IRedirectRouteConfig, IRouteConfig, Routeable, TransitionPlan, TransitionPlanOrFunc } from './options';
import { Events, getMessage } from './events';

export const noRoutes = emptyArray as RouteConfig['routes'];

// Every kind of route configurations are normalized to this `RouteConfig` class.
export class RouteConfig implements IRouteConfig, IChildRouteConfig {
  /** @internal */
  public _configurationFromHookApplied: boolean = false;
  public get path(): string[] {
    const path = this._path;
    if (path.length > 0) return path;
    const ceDfn = CustomElement.getDefinition(this.component as RouteType);
    return this._path = [ceDfn.name, ...ceDfn.aliases];
  }
  private constructor(
    public readonly id: string,
    /** @internal */
    public _path: string[],
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    public readonly redirectTo: string | null,
    public readonly caseSensitive: boolean,
    public readonly transitionPlan: TransitionPlanOrFunc | null,
    public readonly viewport: string,
    public readonly data: Record<string, unknown>,
    public readonly routes: readonly Routeable[],
    public readonly fallback: Routeable | FallbackFunction | null,
    public readonly component: Routeable,
    public readonly nav: boolean,
  ) { }

  /** @internal */
  public static _create(
    configOrPath: IRouteConfig | IChildRouteConfig | string | string[],
    Type: RouteType | null,
  ): RouteConfig {
    if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
      const path = ensureArrayOfStrings(configOrPath);

      const redirectTo = Type?.redirectTo ?? null;
      const caseSensitive = Type?.caseSensitive ?? false;
      const id = ensureString(Type?.id ?? (path instanceof Array ? path[0] : path));
      const title = Type?.title ?? null;
      const reentryBehavior = Type?.transitionPlan ?? null;
      const viewport = Type?.viewport ?? defaultViewportName;
      const data = Type?.data ?? {};
      const children = Type?.routes ?? noRoutes;

      return new RouteConfig(
        id,
        path,
        title,
        redirectTo,
        caseSensitive,
        reentryBehavior,
        viewport,
        data,
        children,
        Type?.fallback ?? null,
        Type as Routeable,
        Type?.nav ?? true,
      );
    } else if (typeof configOrPath === 'object') {
      const config = configOrPath;
      validateRouteConfig(config, '');

      const path = ensureArrayOfStrings(config.path ?? Type?.path ?? emptyArray);
      const title = config.title ?? Type?.title ?? null;
      const redirectTo = config.redirectTo ?? Type?.redirectTo ?? null;
      const caseSensitive = config.caseSensitive ?? Type?.caseSensitive ?? false;
      const id = config.id ?? Type?.id ?? (path instanceof Array ? path[0] : path);
      const reentryBehavior = config.transitionPlan ?? Type?.transitionPlan ?? null;
      const viewport = config.viewport ?? Type?.viewport ?? defaultViewportName;
      const data = {
        ...Type?.data,
        ...config.data,
      };
      const children = [
        ...(config.routes ?? noRoutes),
        ...(Type?.routes ?? noRoutes),
      ];
      return new RouteConfig(
        id,
        path,
        title,
        redirectTo,
        caseSensitive,
        reentryBehavior,
        viewport,
        data,
        children,
        config.fallback ?? Type?.fallback ?? null,
        (config as IChildRouteConfig).component ?? Type ?? null,
        config.nav ?? true,
      );
    } else {
      expectType('string, function/class or object', '', configOrPath);
    }
  }

  /**
   * Invoked when this component is used as a child under another parent.
   * Creates a new route config applying the child route config.
   * Note that the current rote config is not mutated.
   *
   * @internal
   */
  public _applyChildRouteConfig(config: IChildRouteConfig, parentConfig: RouteConfig | null): RouteConfig {
    validateRouteConfig(config, this.path[0] ?? '');
    const path = ensureArrayOfStrings(config.path ?? this.path);
    return new RouteConfig(
      ensureString(config.id ?? this.id ?? path),
      path,
      config.title ?? this.title,
      config.redirectTo ?? this.redirectTo,
      config.caseSensitive ?? this.caseSensitive,
      config.transitionPlan ?? this.transitionPlan ?? parentConfig?.transitionPlan ?? null,
      config.viewport ?? this.viewport,
      config.data ?? this.data,
      config.routes ?? this.routes,
      config.fallback ?? this.fallback ?? parentConfig?.fallback ?? null,
      this.component, // The RouteConfig is created using a definitive Type as component; do not overwrite it.
      config.nav ?? this.nav,
    );
  }

  /** @internal */
  public _getTransitionPlan(cur: RouteNode, next: RouteNode, overridingTransitionPlan: TransitionPlan | null) {
    const hasSameParameters = shallowEquals(cur.params, next.params);
    if (hasSameParameters) return 'none';

    if (overridingTransitionPlan != null) return overridingTransitionPlan;

    const plan = this.transitionPlan ?? 'replace';
    return typeof plan === 'function' ? plan(cur, next) : plan;
  }

  /** @internal */
  public _applyFromConfigurationHook(instance: IRouteViewModel, parent: IRouteConfig | null, routeNode: RouteNode | null): void | Promise<void> {
    // start strict
    if (this._configurationFromHookApplied) throw new Error(getMessage(Events.rtConfigFromHookApplied));
    if (typeof instance.getRouteConfig !== 'function') return;
    return onResolve(
      instance.getRouteConfig(parent, routeNode),
      value => {
        this._configurationFromHookApplied = true;
        if (value == null) return;
        let parentPath = parent?.path ?? '';
        if (typeof parentPath !== 'string') {
          parentPath = parentPath[0];
        }
        validateRouteConfig(value, parentPath);

        // the value from the hook takes precedence
        (this as Writable<RouteConfig>).id = value.id ?? this.id;
        (this as Writable<RouteConfig>)._path = ensureArrayOfStrings(value.path ?? this.path);
        (this as Writable<RouteConfig>).title = value.title ?? this.title;
        (this as Writable<RouteConfig>).redirectTo = value.redirectTo ?? this.redirectTo;
        (this as Writable<RouteConfig>).caseSensitive = value.caseSensitive ?? this.caseSensitive;
        (this as Writable<RouteConfig>).transitionPlan = value.transitionPlan ?? this.transitionPlan;
        (this as Writable<RouteConfig>).viewport = value.viewport ?? this.viewport;
        (this as Writable<RouteConfig>).data = value.data ?? this.data;
        (this as Writable<RouteConfig>).routes = value.routes ?? this.routes;
        (this as Writable<RouteConfig>).fallback = value.fallback ?? this.fallback;
        (this as Writable<RouteConfig>).nav = value.nav ?? this.nav;
      });
  }

  /** @internal */
  public _clone(): RouteConfig {
    return new RouteConfig(
      this.id,
      this.path,
      this.title,
      this.redirectTo,
      this.caseSensitive,
      this.transitionPlan,
      this.viewport,
      this.data,
      this.routes,
      this.fallback,
      this.component,
      this.nav,
    );
  }

  /** @internal */
  public _getFallback(viewportInstruction: ViewportInstruction, routeNode: RouteNode, context: IRouteContext): Routeable | null {
    const fallback = this.fallback;
    return typeof fallback === 'function'
      && !CustomElement.isType(fallback as Constructable)
      ? (fallback as FallbackFunction)(viewportInstruction, routeNode, context)
      : fallback;
  }

  public register(container: IContainer): void {
    /**
     * When an instance of the RouteConfig is created, via the static `_create` and `resolveRouteConfiguration`, the component is always resolved to a custom element.
     * This makes the process to registering to registering the custom element to the DI.
     * The component can only be null for redirection configurations and that is ignored here.
     */
    const component = this.component;
    if (component == null) return;
    container.register(component);
  }
}

export const Route = {
  name: Protocol.resource.keyFor('route-configuration'),
  /**
   * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
   */
  isConfigured(Type: RouteType): boolean {
    return Metadata.hasOwn(Route.name, Type);
  },
  /**
   * Apply the specified configuration to the specified type, overwriting any existing configuration.
   */
  configure<T extends RouteType>(
    configOrPath: IRouteConfig | IChildRouteConfig | string | string[],
    Type: T,
  ): T {
    const config = RouteConfig._create(configOrPath, Type);
    Metadata.define(Route.name, config, Type);

    return Type;
  },
  /**
   * Get the `RouteConfig` associated with the specified type, creating a new one if it does not yet exist.
   */
  getConfig(Type: RouteType): RouteConfig {
    if (!Route.isConfigured(Type)) {
      // This means there was no @route decorator on the class.
      // However there might still be static properties, and this API provides a unified way of accessing those.
      Route.configure({}, Type);
    }

    return Metadata.getOwn(Route.name, Type) as RouteConfig;
  },
};

export type RouteType<T extends Constructable = Constructable> = ResourceType<T, InstanceType<T>, IRouteConfig>;
export type RouteDecorator = <T extends Constructable>(Type: T) => T;

/**
 * Associate a static route configuration with this type.
 *
 * @param config - The route config
 */
export function route(config: IRouteConfig): RouteDecorator;
/**
 * Associate a static route configuration with this type.
 *
 * @param path - The path to match against.
 *
 * ```
 * &#64;route('home')
 * export class Home {}
 * ```
 *
 * ```
 * &#64;route(':id')
 * export class ProductDetail {}
 * ```
 */
export function route(path: string | string[]): RouteDecorator;
export function route(configOrPath: IRouteConfig | string | string[]): RouteDecorator {
  return function (target) {
    return Route.configure(configOrPath, target);
  };
}

/** @internal */
export function resolveRouteConfiguration(routeable: Routeable, isChild: boolean, parent: RouteConfig | null, routeNode: RouteNode | null, context: IRouteContext | null): RouteConfig | Promise<RouteConfig> {
  if (isPartialRedirectRouteConfig(routeable)) return RouteConfig._create(routeable, null/* , false */);

  const [instruction, ceDef] = resolveCustomElementDefinition(routeable, context);

  return onResolve(ceDef, $ceDef => {
    const type = $ceDef.Type;
    const routeConfig = Route.getConfig(type);

    // If the component is used as a child, then apply the child configuration (comping from parent) and return a new RouteConfig with the configuration applied.
    if (isPartialChildRouteConfig(routeable)) return routeConfig._applyChildRouteConfig(routeable, parent);

    // If the component is used as a child, then return a clone.
    // Rationale: as this component can be used multiple times as child (either under same parent or different parents), we don't want to mutate the original route config for the type.
    if (isChild) return routeConfig._clone();

    if (
      !routeConfig._configurationFromHookApplied
      && instruction.type === NavigationInstructionType.IRouteViewModel
      && typeof (routeable as IRouteViewModel).getRouteConfig === 'function'
    ) {
      return onResolve(routeConfig._applyFromConfigurationHook(routeable, parent, routeNode), () => routeConfig);
    }
    return routeConfig;
  });
}

/** @internal */
export function resolveCustomElementDefinition(routeable: Routeable, context: IRouteContext | null | undefined): [instruction: ITypedNavigationInstruction_Component, ceDef: CustomElementDefinition | Promise<CustomElementDefinition>] {
  const instruction = createNavigationInstruction(routeable);
  let ceDef: CustomElementDefinition | Promise<CustomElementDefinition>;
  switch (instruction.type) {
    case NavigationInstructionType.string: {
      if (context == null) throw new Error(getMessage(Events.rtNoCtxStrComponent));

      const component = CustomElement.find(context.container, instruction.value);
      if (component === null) throw new Error(getMessage(Events.rtNoComponent, instruction.value, context));

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
      if (context == null) throw new Error(getMessage(Events.rtNoCtxLazyImport));
      ceDef = context._resolveLazy(instruction.value);
      break;
  }
  return [instruction, ceDef];
}

function createNavigationInstruction(routeable: Exclude<Routeable, IRedirectRouteConfig>): ITypedNavigationInstruction_Component {
  return isPartialChildRouteConfig(routeable)
    ? createNavigationInstruction(routeable.component)
    : TypedNavigationInstruction.create(routeable);
}

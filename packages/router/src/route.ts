import { Metadata } from '@aurelia/metadata';
import { Constructable, ResourceType, Writable, getResourceKeyFor } from '@aurelia/kernel';
import { CustomElement } from '@aurelia/runtime-html';
import { LoadInstruction, ComponentAppellation, ViewportHandle, ComponentParameters, RouteableComponentType, type ReloadBehavior } from './interfaces';

export interface IRoute extends Writable<Partial<Route>> {
  /**
   * The component to load when this route is matched. Transfered into the `instructions` property.
   */
  component?: ComponentAppellation;

  /**
   * The name of the viewport this component should be loaded into. Transfered into the `instructions` property.
   *
   * (TODO: Decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
   */
  viewport?: ViewportHandle;

  /**
   * Parameters that should be accessible to components. Transfered into the `instructions` property.
   */
  parameters?: ComponentParameters;

  /**
   * Child instructions that should also be loaded when this route is matched. Transfered into the `instructions` property.
   */
  children?: LoadInstruction[];
}

export class Route {
  /**
   * The metadata resource key for a configured route.
   */
  private static readonly resourceKey = getResourceKeyFor('route');

  protected constructor(
    /**
     * The path to match against the url.
     */
    public readonly path: string | string[],

    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    public readonly id: string | null,

    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    public readonly redirectTo: string | null,

    /**
     * The instructions that should be loaded when this route is matched.
     */
    public instructions: LoadInstruction[] | null,

    /**
     * Whether the `path` should be case sensitive.
     */
    public readonly caseSensitive: boolean,

    /**
     * Title string or function to be used when setting title for the route.
     */
    // TODO(jurgen): Specify type!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly title: any,

    /**
     * The reload behavior of the components in the route, as in how they behave
     * when the route is loaded again.
     *
     * TODO(alpha): Add support for function in value
     */
    public reloadBehavior: ReloadBehavior | null,

    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    public readonly data: unknown,

    // TODO: Look into adding these:
    // public readonly canLoad: readonly CanLoad[],
    // public readonly canUnload: readonly CanUnload[],
    // public readonly loading: readonly Load[],
    // public readonly unloading: readonly Unload[],
  ) { }

  /**
   * Apply the specified configuration to the specified type, overwriting any existing configuration.
   */
  public static configure<T extends RouteType>(configOrPath: IRoute | string | undefined, Type: T): T {
    const config = Route.create(configOrPath as IRoute, Type as RouteableComponentType);
    Metadata.defineMetadata(config, Type, Route.resourceKey);

    return Type;
  }

  /**
   * Get the `Route` configured with the specified type or null if there's nothing configured.
   */
  public static getConfiguration(Type: RouteableComponentType): Route | IRoute {
    const config = Metadata.getMetadata<IRoute>(Route.resourceKey, Type) ?? {};

    if (Array.isArray(Type.parameters)) {
      config.parameters = Type.parameters;
    }
    if ('title' in Type) {
      config.title = Type.title;
    }

    return config instanceof Route ? config : Route.create(config, Type);
  }

  /**
   * Create a valid Route or throw if it can't.
   *
   * @param configOrType - Configuration or type the route is created from.
   * @param Type - If specified, the Route is routing to Type, regardless of what config says, as with `@route` decorator.
   */
  public static create(configOrType: IRoute | RouteableComponentType | undefined, Type: RouteableComponentType | null = null): Route {
    // If a fixed type is specified, component is fixed to that type and
    // configOrType is set to a config with that.
    // This also clones the route (not deep)
    if (Type !== null) {
      configOrType = Route.transferTypeToComponent(configOrType, Type);
    }

    // Another component queries our route configuration
    if (CustomElement.isType(configOrType)) {
      configOrType = Route.getConfiguration(configOrType);
    } else if (Type === null) { // We need to clone the route (not deep)
      configOrType = { ...configOrType };
    }

    const config = Route.transferIndividualIntoInstructions(configOrType!);

    Route.validateRouteConfiguration(config);

    let pathId = config.path;
    if (Array.isArray(pathId)) {
      pathId = pathId.join(',');
    }
    return new Route(
      config.path ?? '',
      config.id ?? pathId ?? null,
      config.redirectTo ?? null,
      config.instructions ?? null,
      config.caseSensitive ?? false,
      config.title ?? null,
      config.reloadBehavior ?? null,
      config.data ?? null,
    );
  }

  /**
   * Transfers the (only allowed) Type for the Route to the `component` property, creating
   * a new configuration if necessary.
   *
   * It also validates that that the `component` and `instructions` are not used.
   */
  private static transferTypeToComponent(configOrType: IRoute | RouteableComponentType | undefined, Type: RouteableComponentType): IRoute {
    if (CustomElement.isType(configOrType)) {
      throw new Error(`Invalid route configuration: A component ` +
        `can't be specified in a component route configuration.`);
    }

    // Clone it so that original route isn't affected
    // NOTE that it's not a deep clone (yet)
    const config: IRoute = { ...configOrType };

    if ('component' in config || 'instructions' in config) {
      throw new Error(`Invalid route configuration: The 'component' and 'instructions' properties ` +
        `can't be specified in a component route configuration.`);
    }
    if (!('redirectTo' in config)) {
      config.component = Type;
    }
    if (!('path' in config) && !('redirectTo' in config)) {
      config.path = CustomElement.getDefinition(Type).name;
    }

    return config;
  }

  /**
   * Transfers individual load instruction properties into the `instructions` property.
   *
   * It also validates that not both individual load instruction parts and the `instructions`
   * is used.
   */
  private static transferIndividualIntoInstructions(config: IRoute): IRoute {
    if (config === null || config === void 0) {
      throw new Error(`Invalid route configuration: expected an object.`);
    }

    if ((config.component ?? null) !== null
      || (config.viewport ?? null) !== null
      || (config.parameters ?? null) !== null
      || (config.children ?? null) !== null
    ) {
      if (config.instructions != null) {
        throw new Error(`Invalid route configuration: The 'instructions' property can't be used together with ` +
          `the 'component', 'viewport', 'parameters' or 'children' properties.`);
      }
      config.instructions = [{
        component: config.component,
        viewport: config.viewport,
        parameters: config.parameters,
        children: config.children,
      }];
    }

    return config;
  }

  /**
   * Validate a `Route`.
   */
  private static validateRouteConfiguration(config: Partial<Route>): void {
    if (config.redirectTo === null && config.instructions === null) {
      throw new Error(`Invalid route configuration: either 'redirectTo' or 'instructions' ` +
        `need to be specified.`);
    }

    // TODO: Add validations for remaining properties and each index of 'instructions'
  }
}

export type RouteType<T extends Constructable = Constructable> = ResourceType<T, InstanceType<T>, IRoute>;

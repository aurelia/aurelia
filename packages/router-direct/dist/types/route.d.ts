import { Constructable, ResourceType, Writable } from '@aurelia/kernel';
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
export declare class Route {
    /**
     * The path to match against the url.
     */
    readonly path: string | string[];
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    readonly id: string | null;
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    readonly redirectTo: string | null;
    /**
     * The instructions that should be loaded when this route is matched.
     */
    instructions: LoadInstruction[] | null;
    /**
     * Whether the `path` should be case sensitive.
     */
    readonly caseSensitive: boolean;
    /**
     * Title string or function to be used when setting title for the route.
     */
    readonly title: any;
    /**
     * The reload behavior of the components in the route, as in how they behave
     * when the route is loaded again.
     *
     * TODO(alpha): Add support for function in value
     */
    reloadBehavior: ReloadBehavior | null;
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    readonly data: unknown;
    /**
     * The metadata resource key for a configured route.
     */
    private static readonly resourceKey;
    protected constructor(
    /**
     * The path to match against the url.
     */
    path: string | string[], 
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    id: string | null, 
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    redirectTo: string | null, 
    /**
     * The instructions that should be loaded when this route is matched.
     */
    instructions: LoadInstruction[] | null, 
    /**
     * Whether the `path` should be case sensitive.
     */
    caseSensitive: boolean, 
    /**
     * Title string or function to be used when setting title for the route.
     */
    title: any, 
    /**
     * The reload behavior of the components in the route, as in how they behave
     * when the route is loaded again.
     *
     * TODO(alpha): Add support for function in value
     */
    reloadBehavior: ReloadBehavior | null, 
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    data: unknown);
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    static configure<T extends RouteType>(configOrPath: IRoute | string | undefined, Type: T): T;
    /**
     * Get the `Route` configured with the specified type or null if there's nothing configured.
     */
    static getConfiguration(Type: RouteableComponentType): Route | IRoute;
    /**
     * Create a valid Route or throw if it can't.
     *
     * @param configOrType - Configuration or type the route is created from.
     * @param Type - If specified, the Route is routing to Type, regardless of what config says, as with `@route` decorator.
     */
    static create(configOrType: IRoute | RouteableComponentType | undefined, Type?: RouteableComponentType | null): Route;
    /**
     * Transfers the (only allowed) Type for the Route to the `component` property, creating
     * a new configuration if necessary.
     *
     * It also validates that that the `component` and `instructions` are not used.
     */
    private static transferTypeToComponent;
    /**
     * Transfers individual load instruction properties into the `instructions` property.
     *
     * It also validates that not both individual load instruction parts and the `instructions`
     * is used.
     */
    private static transferIndividualIntoInstructions;
    /**
     * Validate a `Route`.
     */
    private static validateRouteConfiguration;
}
export type RouteType<T extends Constructable = Constructable> = ResourceType<T, InstanceType<T>, IRoute>;
//# sourceMappingURL=route.d.ts.map
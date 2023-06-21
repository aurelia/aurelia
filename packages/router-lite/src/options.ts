import { DI } from '@aurelia/kernel';
import type { IViewportInstruction, Params, RouteContextLike, RouteableComponent, ViewportInstructionTree } from './instructions';
import type { RouteNode } from './route-tree';
import type { Transition } from './router';
import type { IRouteContext } from './route-context';

export type HistoryStrategy = 'none' | 'replace' | 'push';
export type ValueOrFunc<T extends string> = T | ((instructions: ViewportInstructionTree) => T);
function valueOrFuncToValue<T extends string>(instructions: ViewportInstructionTree, valueOrFunc: ValueOrFunc<T>): T {
  if (typeof valueOrFunc === 'function') {
    return valueOrFunc(instructions);
  }
  return valueOrFunc;
}

export const IRouterOptions = /*@__PURE__*/DI.createInterface<Readonly<RouterOptions>>('RouterOptions');
export interface IRouterOptions extends Partial<RouterOptions> {}
export class RouterOptions {
  protected constructor(
    public readonly useUrlFragmentHash: boolean,
    public readonly useHref: boolean,
    /**
     * The strategy to use for interacting with the browser's `history` object (if applicable).
     *
     * - `none`: do not interact with the `history` object at all.
     * - `replace`: replace the current state in history
     * - `push`: push a new state onto the history (default)
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `push`
     */
    public readonly historyStrategy: ValueOrFunc<HistoryStrategy>,
    /**
     * An optional handler to build the title.
     * When configured, the work of building the title string is completely handed over to this function.
     * If this function returns `null`, the title is not updated.
     */
    public readonly buildTitle: ((transition: Transition) => string | null) | null,
    /**
     * When set to `false`, the navigation model won't be generated.
     * The default value is `true`.
     */
    public readonly useNavigationModel: boolean,
    /**
     * The class that is added to the element by the `load` custom attribute, if the associated instruction is active.
     * If no value is provided while configuring router, no class will be added.
     * The default value is `null`.
     */
    public readonly activeClass: string | null,
    /**
     * When set to `true`, the router will try to restore previous route tree, when a routing instruction errs.
     * Set this to `false`, if a stricter behavior is desired. However, in that case, you need to ensure the avoidance of errors.
     * The default value is `true`.
     */
    public readonly restorePreviousRouteTreeOnError: boolean,
  ) { }

  public static create(input: IRouterOptions): RouterOptions {
    return new RouterOptions(
      input.useUrlFragmentHash ?? false,
      input.useHref ?? true,
      input.historyStrategy ?? 'push',
      input.buildTitle ?? null,
      input.useNavigationModel ?? true,
      input.activeClass ?? null,
      input.restorePreviousRouteTreeOnError ?? true,
    );
  }

  public toString(): string {
    if(!__DEV__) return 'RO';
    return `RO(${([
      ['historyStrategy', 'history'],
    ] as const).map(([key, name]) => {
      const value = this[key];
      return `${name}:${typeof value === 'function' ? value : `'${value}'`}`;
    }).join(',')})`;
  }
}

export interface INavigationOptions extends Partial<NavigationOptions> { }
export class NavigationOptions implements INavigationOptions {
  private constructor(
    /**
     * Same as `RouterOptions#historyStrategy`.
     */
    public readonly historyStrategy: ValueOrFunc<HistoryStrategy>,
    public readonly title: string | ((node: RouteNode) => string | null) | null,
    public readonly titleSeparator: string,
    /**
     * Specify a context to use for relative navigation.
     *
     * - `null` (or empty): navigate relative to the root (absolute navigation)
     * - `IRouteContext`: navigate relative to specifically this RouteContext (advanced users).
     * - `HTMLElement`: navigate relative to the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): navigate relative to this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    public readonly context: RouteContextLike | null,
    /**
     * Specify an object to be serialized to a query string, and then set to the query string of the new URL.
     */
    public readonly queryParams: Params | null,
    /**
     * Specify the hash fragment for the new URL.
     */
    public readonly fragment: string,
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    public readonly state: Params | null,
    public readonly transitionPlan: TransitionPlan | null,
  ) { }

  public static create(routerOptions: RouterOptions, input: INavigationOptions): NavigationOptions {
    return new NavigationOptions(
      input.historyStrategy ?? routerOptions.historyStrategy,
      input.title ?? null,
      input.titleSeparator ?? ' | ',
      input.context ?? null,
      input.queryParams ?? null,
      input.fragment ?? '',
      input.state ?? null,
      input.transitionPlan ?? null,
    );
  }

  /** @internal */
  public _clone(): NavigationOptions {
    return new NavigationOptions(
      this.historyStrategy,
      this.title,
      this.titleSeparator,
      this.context,
      { ...this.queryParams },
      this.fragment,
      this.state === null ? null : { ...this.state },
      this.transitionPlan,
    );
  }

  /** @internal */
  public _getHistoryStrategy(instructions: ViewportInstructionTree): HistoryStrategy {
    return valueOrFuncToValue(instructions, this.historyStrategy);
  }
}

export type FallbackFunction = (viewportInstruction: IViewportInstruction, routeNode: RouteNode, context: IRouteContext) => Routeable | null;

/**
 * Either a `RouteableComponent` or a name/config that can be resolved to a one:
 * - `string`: a string representing the component name. Must be resolveable via DI from the context of the component relative to which the navigation occurs (specified in the `dependencies` array, `<import>`ed in the view, declared as an inline template, or registered globally)
 * - `IChildRouteConfig`: a standalone child route config object.
 * - `RouteableComponent`: see `RouteableComponent`.
 *
 * NOTE: differs from `NavigationInstruction` only in having `IChildRouteConfig` instead of `IViewportInstruction`
 * (which in turn are quite similar, but do have a few minor but important differences that make them non-interchangeable)
 * as well as `IRedirectRouteConfig`
 */
export type Routeable = string | IChildRouteConfig | IRedirectRouteConfig | RouteableComponent;

export interface IRouteConfig {
  /**
   * The id for this route, which can be used in the view for generating hrefs.
   */
  readonly id?: string | null;
  /**
   * The path to match against the url.
   *
   * If left blank, the path will be derived from the component's static `path` property (if it exists).
   */
  readonly path?: string | string[] | null;
  /**
   * The title to use for this route when matched.
   *
   * If left blank, this route will not contribute to the generated title.
   */
  readonly title?: string | ((node: RouteNode) => string | null) | null;
  /**
   * The path to which to redirect when the url matches the path in this config.
   */
  readonly redirectTo?: string | null;
  /**
   * Whether the `path` should be case sensitive.
   */
  readonly caseSensitive?: boolean;
  /**
   * How to behave when this component scheduled to be loaded again in the same viewport:
   *
   * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed  (default if only the parameters have changed).
   * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unloading` and `loading`.
   * - `none`: does nothing (default if nothing has changed for the viewport).
   */
  readonly transitionPlan?: TransitionPlanOrFunc | null;
  /**
   * The name of the viewport this component should be loaded into.
   */
  readonly viewport?: string | null;
  /**
   * Any custom data that should be accessible to matched components or hooks.
   */
  readonly data?: Record<string, unknown>;
  /**
   * The child routes that can be navigated to from this route. See `Routeable` for more information.
   */
  readonly routes?: readonly Routeable[];

  /**
   * When set, will be used to redirect unknown/unconfigured routes to this route.
   * Can be a route-id, route-path (route), or a custom element name; this is also the resolution/fallback order.
   */
  readonly fallback?: Routeable | FallbackFunction | null;
  /**
   * When set to `false`, the routes won't be included in the navigation model.
   *
   * @default true
   */
  readonly nav?: boolean;
}
export interface IChildRouteConfig extends IRouteConfig {
  /**
   * The component to load when this route is matched.
   */
  readonly component: Routeable;
}
export interface IRedirectRouteConfig extends Pick<IRouteConfig, 'caseSensitive' | 'redirectTo' | 'path'> { }

export type TransitionPlan = 'none' | 'replace' | 'invoke-lifecycles';
export type TransitionPlanOrFunc = TransitionPlan | ((current: RouteNode, next: RouteNode) => TransitionPlan);

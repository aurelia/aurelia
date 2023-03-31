import { DI } from '@aurelia/kernel';
import type { Params, RouteContextLike, ViewportInstructionTree } from './instructions';
import { TransitionPlan } from './route';
import type { RouteNode } from './route-tree';
import type { Transition } from './router';

export type HistoryStrategy = 'none' | 'replace' | 'push';
export type ValueOrFunc<T extends string> = T | ((instructions: ViewportInstructionTree) => T);
function valueOrFuncToValue<T extends string>(instructions: ViewportInstructionTree, valueOrFunc: ValueOrFunc<T>): T {
  if (typeof valueOrFunc === 'function') {
    return valueOrFunc(instructions);
  }
  return valueOrFunc;
}

export const IRouterOptions = DI.createInterface<Readonly<RouterOptions>>('RouterOptions');
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
  ) { }

  public static create(input: IRouterOptions): RouterOptions {
    return new RouterOptions(
      input.useUrlFragmentHash ?? false,
      input.useHref ?? true,
      input.historyStrategy ?? 'push',
      input.buildTitle ?? null,
      input.useNavigationModel ?? true,
    );
  }

  /** @internal */
  public _stringifyProperties(): string {
    return ([
      ['historyStrategy', 'history'],
    ] as const).map(([key, name]) => {
      const value = this[key];
      return `${name}:${typeof value === 'function' ? value : `'${value}'`}`;
    }).join(',');
  }

  public toString(): string {
    return `RO(${this._stringifyProperties()})`;
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

  public clone(): NavigationOptions {
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

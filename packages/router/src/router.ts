/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  IIndexable,
  IContainer,
  ILogger,
  isObject,
  DI,
  IDisposable,
} from '@aurelia/kernel';
import {
  IScheduler,
  PartialCustomElementDefinition,
} from '@aurelia/runtime';

import {
  IRouteContext,
  RouteContext,
  RouteContextLike,
} from './route-context';
import {
  RouteExpression,
} from './route-expression';
import {
  IRouterEvents,
  NavigationStartEvent,
  NavigationEndEvent,
} from './router-events';
import {
  ILocationManager,
} from './location-manager';
import {
  RouteType,
} from './route';
import {
  IRouteViewModel,
} from './component-agent';
import {
  RouteTree,
  IViewportInstruction,
  NavigationInstruction,
  RouteNode,
  RouteTreeCompiler,
} from './route-tree';

export const AuNavId = 'au-nav-id' as const;
export type AuNavId = typeof AuNavId;

export type ManagedState = {
  [k: string]: unknown;
  [AuNavId]: number;
};

export function isManagedState(state: {} | null): state is ManagedState {
  return isObject(state) && Object.prototype.hasOwnProperty.call(state, AuNavId) === true;
}
export function toManagedState(state: {} | null, navId: number): ManagedState {
  return {
    ...state,
    [AuNavId]: navId,
  };
}

export type RoutingMode = 'direct-only' | 'configured-only' | 'direct-first' | 'configured-first';
export type QueryParamsStrategy = 'overwrite' | 'preserve' | 'merge';
export type FragmentStrategy = 'overwrite' | 'preserve';
export type HistoryStrategy = 'none' | 'replace' | 'push';
export type SameUrlStrategy = 'ignore' | 'reload';
export type ValueOrFunc<T extends string> = T | ((path: string) => T);
function valueOrFuncToValue<T extends string>(path: string, valueOrFunc: ValueOrFunc<T>): T {
  if (typeof valueOrFunc === 'function') {
    return valueOrFunc(path);
  }
  return valueOrFunc;
}

export interface IRouterOptions extends Partial<RouterOptions> { }
export class RouterOptions {
  public static get DEFAULT(): RouterOptions {
    return RouterOptions.create({});
  }

  protected constructor(
    public readonly useUrlFragmentHash: boolean,
    public readonly useHref: boolean,
    public readonly statefulHistoryLength: number,
    /**
     * The operating mode of the router that determines how components are resolved based on a url.
     *
     * - `direct-only`: only resolves components by name, provided they are either globally or locally registered as dependencies (configuration is ignored)
     * - `configured-only`: only match the url against configured routes.
     * - `direct-first`: first tries to resolve by component name from available dependencies, then by configured routes.
     * - `configured-first`: first tries to resolve by configured routes, then by component name from available dependencies. (default)
     * - A function that returns one of the 4 above values based on the navigation.
     *
     * Default: `configured-first`
     */
    public readonly routingMode: ValueOrFunc<RoutingMode>,
    /**
     * The strategy to use for determining the query parameters when both the previous and the new url has a query string.
     *
     * - `overwrite`: uses the query params of the new url. (default)
     * - `preserve`: uses the query params of the previous url.
     * - `merge`: uses the query params of both the previous and the new url. When a param name exists in both, the value from the new url is used.
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    public readonly queryParamsStrategy: ValueOrFunc<QueryParamsStrategy>,
    /**
     * The strategy to use for determining the fragment (value that comes after `#`) when both the previous and the new url have one.
     *
     * - `overwrite`: uses the fragment of the new url. (default)
     * - `preserve`: uses the fragment of the previous url.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    public readonly fragmentStrategy: ValueOrFunc<FragmentStrategy>,
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
     * The strategy to use for when navigating to the same URL.
     *
     * - `ignore`: do nothing (default).
     * - `reload`: reload the current URL, effectively performing a refresh.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `ignore`
     */
    public readonly sameUrlStrategy: ValueOrFunc<SameUrlStrategy>,
  ) { }

  public static create(
    input: IRouterOptions,
  ): RouterOptions {
    return new RouterOptions(
      input.useUrlFragmentHash ?? false,
      input.useHref ?? true,
      input.statefulHistoryLength ?? 0,
      input.routingMode ?? 'configured-first',
      input.queryParamsStrategy ?? 'overwrite',
      input.fragmentStrategy ?? 'overwrite',
      input.historyStrategy ?? 'push',
      input.sameUrlStrategy ?? 'ignore',
    );
  }
  /** @internal */
  public getRoutingMode(path: string): RoutingMode {
    return valueOrFuncToValue(path, this.routingMode);
  }
  /** @internal */
  public getQueryParamsStrategy(path: string): QueryParamsStrategy {
    return valueOrFuncToValue(path, this.queryParamsStrategy);
  }
  /** @internal */
  public getFragmentStrategy(path: string): FragmentStrategy {
    return valueOrFuncToValue(path, this.fragmentStrategy);
  }
  /** @internal */
  public getHistoryStrategy(path: string): HistoryStrategy {
    return valueOrFuncToValue(path, this.historyStrategy);
  }
  /** @internal */
  public getSameUrlStrategy(path: string): SameUrlStrategy {
    return valueOrFuncToValue(path, this.sameUrlStrategy);
  }

  protected stringifyProperties(): string {
    return ([
      'queryParamsStrategy',
      'fragmentStrategy',
      'historyStrategy',
      'sameUrlStrategy',
    ] as const).map(key => {
      const value = this[key];
      return `${key}:${typeof value === 'function' ? value : `'${value}'`}`;
    }).join(',');
  }

  public toString(): string {
    return `RouterOptions(${this.stringifyProperties()})`;
  }
}

export interface INavigationOptions extends Partial<NavigationOptions> { }
export class NavigationOptions extends RouterOptions {
  public static get DEFAULT(): NavigationOptions {
    return NavigationOptions.create({});
  }

  private constructor(
    routerOptions: RouterOptions,
    public readonly title: string | null,
    public readonly append: boolean,
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
    public readonly queryParams: Readonly<IIndexable> | null,
    /**
     * Specify the hash fragment for the new URL.
     */
    public readonly fragment: string,
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    public readonly state: Readonly<IIndexable> | null,
  ) {
    super(
      routerOptions.useUrlFragmentHash,
      routerOptions.useHref,
      routerOptions.statefulHistoryLength,
      routerOptions.routingMode,
      routerOptions.queryParamsStrategy,
      routerOptions.fragmentStrategy,
      routerOptions.historyStrategy,
      routerOptions.sameUrlStrategy,
    );
  }

  public static create(
    input: INavigationOptions,
  ): NavigationOptions {
    return new NavigationOptions(
      RouterOptions.create(input),
      input.title ?? null,
      input.append ?? false,
      input.context ?? null,
      input.queryParams ?? null,
      input.fragment ?? '',
      input.state ?? null,
    );
  }

  public toString(): string {
    return `NavigationOptions(${super.stringifyProperties()})`;
  }
}

export class Navigation {
  private constructor(
    public readonly id: number,
    public readonly route: RouteExpression,
    public readonly trigger: 'popstate' | 'hashchange' | 'api',
    public readonly options: NavigationOptions,
    public readonly prevNavigation: Navigation | null,
    // Set on next navigation, this is the route after all redirects etc have been processed.
    public finalRoute: RouteExpression | undefined,
  ) { }

  public static create(input: Navigation): Navigation {
    return new Navigation(
      input.id,
      input.route,
      input.trigger,
      input.options,
      input.prevNavigation,
      input.finalRoute,
    );
  }

  public toString(): string {
    return `Navigation(id:${this.id},route:'${this.route}',trigger:'${this.trigger}')`;
  }
}

export class Transition {
  private constructor(
    public readonly id: number,
    public readonly previousRoute: RouteExpression,
    public readonly route: RouteExpression,
    public finalRoute: RouteExpression,
    public readonly trigger: 'popstate' | 'hashchange' | 'api',
    public readonly options: NavigationOptions,
    public readonly managedState: ManagedState | null,
    public readonly previousRouteTree: RouteTree,
    public routeTree: RouteTree | null,
    public readonly promise: Promise<boolean> | null,
    public readonly resolve: ((success: boolean) => void) | null,
    public readonly reject: ((err: unknown) => void) | null,
  ) { }

  public static create(
    input: Transition,
  ): Transition {
    return new Transition(
      input.id,
      input.previousRoute,
      input.route,
      input.finalRoute,
      input.trigger,
      input.options,
      input.managedState,
      input.previousRouteTree,
      input.routeTree,
      input.promise,
      input.resolve,
      input.reject,
    );
  }

  public toString(): string {
    return `Transition(id:${this.id},prevRoute:'${this.previousRoute}',route:'${this.route}',trigger:'${this.trigger}')`;
  }
}

export interface IRouter extends Router { }
export const IRouter = DI.createInterface<IRouter>('IRouter').withDefault(x => x.singleton(Router));
export class Router {
  private _ctx: RouteContext | null = null;
  private get ctx(): RouteContext {
    let ctx = this._ctx;
    if (ctx === null) {
      if (!this.container.has(IRouteContext, true)) {
        throw new Error(`Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?`);
      }
      ctx = this._ctx = this.container.get(IRouteContext);
    }
    return ctx;
  }

  private _routeTree: RouteTree | null = null;
  public get routeTree(): RouteTree {
    let routeTree = this._routeTree;
    if (routeTree === null) {
      // Lazy instantiation for only the very first (synthetic) tree.
      // Doing it here instead of in the constructor to delay it until we have the context.
      const ctx = this.ctx;
      routeTree = this._routeTree = new RouteTree(
        '',
        RouteNode.create({
          context: ctx,
          matchedSegments: [],
          component: ctx.definition,
          append: false,
        }),
      );
    }
    return routeTree;
  }

  private _currentTransition: Transition | null = null;
  private get currentTransition(): Transition {
    let currentTransition = this._currentTransition;
    if (currentTransition === null) {
      currentTransition = this._currentTransition = Transition.create({
        id: 0,
        previousRoute: this.currentRoute,
        route: this.currentRoute,
        finalRoute: this.currentRoute,
        trigger: 'api',
        options: NavigationOptions.DEFAULT,
        managedState: null,
        previousRouteTree: this.routeTree.clone(),
        routeTree: null,
        resolve: null,
        reject: null,
        promise: null,
      });
    }
    return currentTransition;
  }
  private set currentTransition(value: Transition) {
    this._currentTransition = value;
  }

  public options: RouterOptions = RouterOptions.DEFAULT;

  private navigated: boolean = false;
  private navigationId: number = 0;

  private lastSuccessfulNavigation: Navigation | null = null;
  private activeNavigation: Navigation | null = null;

  private currentRoute: RouteExpression = RouteExpression.parse('', false);

  private nextTransition: Transition | null = null;
  private locationChangeSubscription: IDisposable | null = null;

  public constructor(
    @IContainer private readonly container: IContainer,
    @IScheduler private readonly scheduler: IScheduler,
    @ILogger private readonly logger: ILogger,
    @IRouterEvents private readonly events: IRouterEvents,
    @ILocationManager private readonly locationMgr: ILocationManager,
  ) {
    this.logger = logger.root.scopeTo('Router');
  }

  /**
   * Get the closest RouteContext relative to the provided component, controller or node.
   *
   * @param context - The object from which to resolve the closest RouteContext.
   *
   * @returns when the value is:
   * - `null`: the root
   * - `IRouteContext`: the provided value (no-op)
   * - `HTMLElement`: the context of the routeable component (page) that directly or indirectly contains this element.
   * - `ICustomElementViewModel` (the `this` object when working from inside a view model): the context of this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
   * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
   */
  public getContext(context: RouteContextLike | null): IRouteContext {
    return RouteContext.resolve(this.ctx, context);
  }

  public start(
    routerOptions: IRouterOptions,
    performInitialNavigation: boolean,
  ): void | Promise<boolean> {
    this.options = RouterOptions.create(routerOptions);

    this.locationMgr.startListening();
    this.locationChangeSubscription = this.events.subscribe('au:router:location-change', e => {
      // TODO(fkleuver): add a throttle config.
      // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
      // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
      // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
      this.scheduler.queueMacroTask(
        () => {
          // Don't try to restore state that might not have anything to do with the Aurelia app
          const state = isManagedState(e.state) ? e.state : null;
          const route = RouteExpression.parse(e.url, this.options.useUrlFragmentHash);
          const options = NavigationOptions.create({
            ...this.options,
            historyStrategy: 'replace',
          });
          // The promise will be stored in the transition. However, unlike `load()`, `start()` does not return this promise in any way.
          // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
          // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
          // So we do want to solve this at some point.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.enqueue(route, e.trigger, state, options, null);
        },
      );
    });

    if (!this.navigated && performInitialNavigation) {
      return this.load(this.locationMgr.getPath(), { historyStrategy: 'replace' });
    }
  }

  public stop(): void {
    this.locationMgr.stopListening();
    this.locationChangeSubscription?.dispose();
  }

  /**
   * Loads the provided path.
   *
   * Examples:
   *
   * ```ts
   * // Use direct routing syntax to load 'product-detail' with parameter id=37, as a child of the current component, in the next available sibling viewport.
   * router.load('+product-detail(id=37)');
   * // Load the route 'product-detail', as a child of the current component, with child route '37'.
   * router.load('product-detail/37', { context: this });
   * ```
   */
  public load(
    path: string,
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided paths as siblings.
   *
   * Examples:
   *
   * ```ts
   * router.load(['book-detail(20)', 'author-detail(11)']);
   * router.load(['category/50/product/20', 'widget/30'], { routingMode: 'configured-only' });
   * router.load(['category/50/product/20', 'widget(id=30)]);
   * ```
   */
  public load(
    paths: readonly string[],
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component type. Must be a custom element.
   *
   * Examples:
   *
   * ```ts
   * router.load(ProductList);
   * router.load(CustomElement.define({ name: 'greeter', template: 'Hello!' }));
   * ```
   */
  public load(
    componentType: RouteType,
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component types. Must be custom elements.
   *
   * Examples:
   *
   * ```ts
   * router.load([MemberList, OrganizationList]);
   * ```
   */
  public load(
    componentTypes: readonly RouteType[],
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component definition. May or may not be pre-compiled.
   *
   * Examples:
   *
   * ```ts
   * router.load({ name: 'greeter', template: 'Hello!' });
   * ```
   */
  public load(
    componentDefinition: PartialCustomElementDefinition,
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component instance.
   *
   * Examples:
   *
   * ```ts
   * // Given an already defined custom element named Greeter
   * const greeter = new Greeter();
   * Controller.forCustomElement(greeter, this.lifecycle, null, this.context);
   * router.load(greeter);
   * ```
   */
  public load(
    componentInstance: IRouteViewModel,
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided ViewportInstruction, with component specified in any of the ways as described
   * in the other method overloads, and optional additional properties.
   *
   * Examples:
   *
   * ```ts
   * router.load({ component: 'product-detail', parameters: { id: 37 } })
   * router.load({ component: ProductDetail, parameters: { id: 37 } })
   * router.load({ component: 'category(id=50)', children: ['product(id=20)'] })
   * router.load({ component: 'category(id=50)', children: [{ component: 'product', parameters: { id: 20 } }] })
   * router.load({
   *   component: CustomElement.define({
   *     name: 'greeter',
   *     template: 'Hello, ${name}!'
   *   }, class {
   *     load(instruction) {
   *       this.name = instruction.parameters.name;
   *     }
   *   }),
   *   parameters: { name: 'John' }
   * })
   * ```
   */
  public load(
    viewportInstruction: IViewportInstruction,
    options?: INavigationOptions,
  ): Promise<boolean>;
  public load(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): Promise<boolean>;
  public load(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): Promise<boolean> {
    this.logger.trace(`load(instructionOrInstructions:${instructionOrInstructions})`);

    const $options = this.getNavigationOptions(options);
    const route = this.createRouteExpression(instructionOrInstructions, $options);

    this.logger.trace(`load(route:'${route}')`);

    return this.enqueue(route, 'api', null, $options, null);
  }

  public isActive(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): boolean {
    this.logger.trace(`isActive(instructionOrInstructions:${instructionOrInstructions})`);

    const $options = this.getNavigationOptions(options);
    const route = this.createRouteExpression(instructionOrInstructions, $options);

    this.logger.trace(`isActive(route:'${route}')`);

    return this.currentRoute.contains(route);
  }

  private createRouteExpression(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options: NavigationOptions,
  ): RouteExpression {
    if (typeof instructionOrInstructions === 'string') {
      return RouteExpression.parse(instructionOrInstructions, options.useUrlFragmentHash);
    }

    // TODO(fkleuver): extend the Route AST to be parseable from NavigationInstructions and not just strings
    this.logger.error(`Not yet implemented instruction type: ${instructionOrInstructions}`);
    return null!;
  }

  private async enqueue(
    route: RouteExpression,
    trigger: 'popstate' | 'hashchange' | 'api',
    managedState: ManagedState | null,
    options: NavigationOptions,
    failedTransition: Transition | null,
  ): Promise<boolean> {
    const lastTransition = this.currentTransition;
    lastTransition.finalRoute = this.currentRoute;

    if (
      trigger !== 'api' &&
      lastTransition.trigger === 'api' &&
      lastTransition.route.equals(route)
    ) {
      // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
      this.logger.debug(`Ignoring navigation triggered by '${trigger}' because it is the same URL as the previous navigation which was triggered by 'api'.`);
      return true;
    }

    let resolve: Exclude<Transition['resolve'], null> = (void 0)!; // Need this initializer because TS doesn't know the promise executor will run synchronously
    let reject: Exclude<Transition['reject'], null> = (void 0)!;
    let promise: Exclude<Transition['promise'], null>;

    if (failedTransition === null) {
      promise = new Promise(function ($resolve, $reject) {
        resolve = $resolve;
        reject = $reject;
      });
    } else {
      // Ensure that `await router.load` only resolves when the transition truly finished, so chain forward on top of
      // any previously failed transition that caused a recovering backwards navigation.
      this.logger.debug(`Reusing promise/resolve/reject from the previously failed transition ${failedTransition}`);
      /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
      promise = failedTransition.promise!;
      resolve = failedTransition.resolve!;
      reject = failedTransition.reject!;
      /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
    }

    // This is an intentional overwrite: if a new transition is scheduled while the currently scheduled transition hasn't even started yet,
    // then the currently scheduled transition is effectively canceled/ignored.
    // This is consistent with the runtime's controller behavior, where if you rapidly call async activate -> deactivate -> activate (for example), then the deactivate is canceled.
    const nextTransition = this.nextTransition = Transition.create({
      id: ++this.navigationId,
      trigger,
      managedState,
      previousRoute: lastTransition.finalRoute,
      finalRoute: route,
      route,
      options,
      promise,
      resolve,
      reject,
      previousRouteTree: this.routeTree.clone(),
      routeTree: null,
    });

    this.logger.debug(`Scheduling transition: ${nextTransition}`);

    if (this.activeNavigation === null) {
      // The promise for nextTransition is awaited a few lines down below: `const result = await promise;`
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.dequeue(nextTransition);
    }

    try {
      // Explicitly await so we can catch, log and re-throw
      const result = await promise;
      this.logger.debug(`Transition succeeded: ${nextTransition}`);
      return result;
    } catch (err) {
      this.logger.error(`Navigation failed: ${nextTransition}`, err);
      throw err;
    }
  }

  private async dequeue(
    transition: Transition,
  ): Promise<void> {
    this.logger.trace(`dequeue(transition:${transition})`);

    this.currentTransition = transition;
    this.nextTransition = null;

    // Clone it because the prevNavigation could have observers and stuff on it, and it's meant to be a standalone snapshot from here on.
    const prevNavigation = this.lastSuccessfulNavigation === null ? null : Navigation.create({
      ...this.lastSuccessfulNavigation,
      // There could be arbitrary state stored on a navigation, so to prevent memory leaks we only keep one `prevNavigation` around
      prevNavigation: null,
    });

    this.activeNavigation = Navigation.create({
      id: transition.id,
      route: transition.route,
      trigger: transition.trigger,
      options: transition.options,
      prevNavigation,
      finalRoute: transition.finalRoute,
    });

    const routeChanged = !transition.route.equals(this.currentRoute);
    const shouldProcessRoute = routeChanged || transition.options.getSameUrlStrategy(this.currentRoute.raw) === 'reload';

    if (shouldProcessRoute) {
      this.logger.trace(`dequeue(transition:${transition}) - processing route`);

      this.events.publish(new NavigationStartEvent(
        transition.id,
        transition.route,
        transition.trigger,
        transition.managedState,
      ));

      // If user triggered a new transition in response to the NavigationStartEvent
      // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
      if (this.nextTransition !== null) {
        this.logger.debug(`dequeue(transition:${transition}) - aborting because a new transition was queued in response to the NavigationStartEvent`);
        return this.dequeue(this.nextTransition);
      }

      const ctx = this.getContext(transition.options.context);

      // TODO: apply redirects
      //
      //
      // ---

      this.activeNavigation = Navigation.create({
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        ...this.activeNavigation!,
        // After redirects are applied, this could be a different route
        finalRoute: transition.finalRoute,
      });

      // TODO: run global guards
      //
      //
      // ---

      this._routeTree = transition.routeTree = RouteTreeCompiler.compileRoot(transition.finalRoute, ctx, transition);
      this.currentRoute = transition.finalRoute;

      // Load components
      await this.updateNode(transition, transition.routeTree.root);
    }

    this.navigated = true;
    this.events.publish(new NavigationEndEvent(
      transition.id,
      transition.route,
      this.currentRoute,
    ));
    this.lastSuccessfulNavigation = this.activeNavigation;
    this.activeNavigation = null;
    this.applyHistoryState(transition);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    transition.resolve!(true);

    if (this.nextTransition !== null) {
      this.logger.trace(`onTransitionCompleted(transition:${transition}) -> scheduling nextTransition: ${this.nextTransition}`);
      this.scheduler.queueMacroTask(
        () => {
          // nextTransition is allowed to change up until the point when it's actually time to process it,
          // so we need to check it for null again when the scheduled task runs.
          if (this.nextTransition !== null) {
            this.dequeue(this.nextTransition).catch(function (reason) {
              // TODO: handle this properly
              return Promise.reject(reason);
            });
          }
        },
      );
    }
  }

  private async updateNode(
    transition: Transition,
    node: RouteNode,
  ): Promise<void> {
    this.logger.trace(`updateNode(transition:${transition},node:${node})`);

    const ctx = node.context;
    if (ctx === null) {
      throw new Error(`Unexpected null context at ${node}`);
    }

    // The root is simply a marker context for the component holding the top-level viewports.
    // It itself does not needed to be loaded.
    if (ctx !== ctx.root) {
      const viewport = ctx.viewportAgent;
      if (viewport === null) {
        throw new Error(`Unexpected null viewportAgent at ${ctx}`);
      }

      await viewport.update(transition, node);
    }

    RouteTreeCompiler.compileResidue(transition.finalRoute, ctx, transition);

    await Promise.all(node.children.map(async child => {
      await this.updateNode(transition, child);
    }));
  }

  private applyHistoryState(
    transition: Transition,
  ): void {
    switch (transition.options.getHistoryStrategy(this.currentRoute.raw)) {
      case 'none':
        // do nothing
        break;
      case 'push':
        this.locationMgr.pushState(
          toManagedState(transition.options.state, transition.id),
          transition.options.title ?? '',
          transition.finalRoute.raw,
        );
        break;
      case 'replace':
        this.locationMgr.replaceState(
          toManagedState(transition.options.state, transition.id),
          transition.options.title ?? '',
          transition.finalRoute.raw,
        );
        break;
    }
  }

  private getNavigationOptions(options?: INavigationOptions): NavigationOptions {
    return NavigationOptions.create({
      ...this.options,
      ...options,
    });
  }
}

/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
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
} from './route-context';
import {
  IRouterEvents,
  NavigationStartEvent,
  NavigationEndEvent,
  NavigationCancelEvent,
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
  RouteNode,
  RouteTreeCompiler,
} from './route-tree';
import {
  IViewportInstruction,
  NavigationInstruction,
  RouteContextLike,
  ViewportInstructionTree,
  Params,
} from './instructions';

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
export type ValueOrFunc<T extends string> = T | ((instructions: ViewportInstructionTree) => T);
function valueOrFuncToValue<T extends string>(instructions: ViewportInstructionTree, valueOrFunc: ValueOrFunc<T>): T {
  if (typeof valueOrFunc === 'function') {
    return valueOrFunc(instructions);
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
  public getRoutingMode(instructions: ViewportInstructionTree): RoutingMode {
    return valueOrFuncToValue(instructions, this.routingMode);
  }
  /** @internal */
  public getQueryParamsStrategy(instructions: ViewportInstructionTree): QueryParamsStrategy {
    return valueOrFuncToValue(instructions, this.queryParamsStrategy);
  }
  /** @internal */
  public getFragmentStrategy(instructions: ViewportInstructionTree): FragmentStrategy {
    return valueOrFuncToValue(instructions, this.fragmentStrategy);
  }
  /** @internal */
  public getHistoryStrategy(instructions: ViewportInstructionTree): HistoryStrategy {
    return valueOrFuncToValue(instructions, this.historyStrategy);
  }
  /** @internal */
  public getSameUrlStrategy(instructions: ViewportInstructionTree): SameUrlStrategy {
    return valueOrFuncToValue(instructions, this.sameUrlStrategy);
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
    public readonly queryParams: Params | null,
    /**
     * Specify the hash fragment for the new URL.
     */
    public readonly fragment: string,
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    public readonly state: Params | null,
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
    public readonly instructions: ViewportInstructionTree,
    public readonly trigger: 'popstate' | 'hashchange' | 'api',
    public readonly options: NavigationOptions,
    public readonly prevNavigation: Navigation | null,
    // Set on next navigation, this is the route after all redirects etc have been processed.
    public finalInstructions: ViewportInstructionTree | undefined,
  ) { }

  public static create(input: Navigation): Navigation {
    return new Navigation(
      input.id,
      input.instructions,
      input.trigger,
      input.options,
      input.prevNavigation,
      input.finalInstructions,
    );
  }

  public toString(): string {
    return `Navigation(id:${this.id},route:'${this.instructions}',trigger:'${this.trigger}')`;
  }
}

export class Transition {
  private constructor(
    public readonly id: number,
    public readonly prevInstructions: ViewportInstructionTree,
    public readonly instructions: ViewportInstructionTree,
    public finalInstructions: ViewportInstructionTree,
    public readonly trigger: 'popstate' | 'hashchange' | 'api',
    public readonly options: NavigationOptions,
    public readonly managedState: ManagedState | null,
    public readonly previousRouteTree: RouteTree,
    public routeTree: RouteTree,
    public readonly promise: Promise<boolean> | null,
    public readonly resolve: ((success: boolean) => void) | null,
    public readonly reject: ((err: unknown) => void) | null,
  ) { }

  public static create(
    input: Transition,
  ): Transition {
    return new Transition(
      input.id,
      input.prevInstructions,
      input.instructions,
      input.finalInstructions,
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
    return `Transition(id:${this.id},trigger:'${this.trigger}',instructions:'${this.instructions}')`;
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
        ViewportInstructionTree.create(''),
        RouteNode.create({
          context: ctx,
          instruction: null,
          component: ctx.definition.component,
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
        prevInstructions: this.instructions,
        instructions: this.instructions,
        finalInstructions: this.instructions,
        trigger: 'api',
        options: NavigationOptions.DEFAULT,
        managedState: null,
        previousRouteTree: this.routeTree.clone(),
        routeTree: this.routeTree,
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

  private instructions: ViewportInstructionTree = ViewportInstructionTree.create('');

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
          const options = NavigationOptions.create({
            ...this.options,
            historyStrategy: 'replace',
          });
          const instructions = ViewportInstructionTree.create(e.url, options);
          // The promise will be stored in the transition. However, unlike `goto()`, `start()` does not return this promise in any way.
          // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
          // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
          // So we do want to solve this at some point.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.enqueue(instructions, e.trigger, state, null);
        },
      );
    });

    if (!this.navigated && performInitialNavigation) {
      return this.goto(this.locationMgr.getPath(), { historyStrategy: 'replace' });
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
   * // Use direct routing syntax to goto 'product-detail' with parameter id=37, as a child of the current component, in the next available sibling viewport.
   * router.goto('+product-detail(id=37)');
   * // Load the route 'product-detail', as a child of the current component, with child route '37'.
   * router.goto('product-detail/37', { context: this });
   * ```
   */
  public goto(
    path: string,
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided paths as siblings.
   *
   * Examples:
   *
   * ```ts
   * router.goto(['book-detail(20)', 'author-detail(11)']);
   * router.goto(['category/50/product/20', 'widget/30'], { routingMode: 'configured-only' });
   * router.goto(['category/50/product/20', 'widget(id=30)]);
   * ```
   */
  public goto(
    paths: readonly string[],
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component type. Must be a custom element.
   *
   * Examples:
   *
   * ```ts
   * router.goto(ProductList);
   * router.goto(CustomElement.define({ name: 'greeter', template: 'Hello!' }));
   * ```
   */
  public goto(
    componentType: RouteType,
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component types. Must be custom elements.
   *
   * Examples:
   *
   * ```ts
   * router.goto([MemberList, OrganizationList]);
   * ```
   */
  public goto(
    componentTypes: readonly RouteType[],
    options?: INavigationOptions,
  ): Promise<boolean>;
  /**
   * Loads the provided component definition. May or may not be pre-compiled.
   *
   * Examples:
   *
   * ```ts
   * router.goto({ name: 'greeter', template: 'Hello!' });
   * ```
   */
  public goto(
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
   * router.goto(greeter);
   * ```
   */
  public goto(
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
   * router.goto({ component: 'product-detail', parameters: { id: 37 } })
   * router.goto({ component: ProductDetail, parameters: { id: 37 } })
   * router.goto({ component: 'category(id=50)', children: ['product(id=20)'] })
   * router.goto({ component: 'category(id=50)', children: [{ component: 'product', parameters: { id: 20 } }] })
   * router.goto({
   *   component: CustomElement.define({
   *     name: 'greeter',
   *     template: 'Hello, ${name}!'
   *   }, class {
   *     goto(instruction) {
   *       this.name = instruction.parameters.name;
   *     }
   *   }),
   *   parameters: { name: 'John' }
   * })
   * ```
   */
  public goto(
    viewportInstruction: IViewportInstruction,
    options?: INavigationOptions,
  ): Promise<boolean>;
  public goto(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): Promise<boolean>;
  public goto(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): Promise<boolean> {
    const instructions = this.createViewportInstructions(instructionOrInstructions, options);

    this.logger.trace(`goto(instructions:${instructions})`);

    return this.enqueue(instructions, 'api', null, null);
  }

  public isActive(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    context: RouteContextLike,
  ): boolean {
    const ctx = this.getContext(context);
    const instructions = this.createViewportInstructions(instructionOrInstructions, { context: ctx });

    this.logger.trace(`isActive(instructions:${instructions},ctx:${ctx})`);

    // TODO: incorporate potential context offset by `../` etc in the instructions
    return this.routeTree.contains(instructions);
  }

  private createViewportInstructions(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): ViewportInstructionTree {
    return ViewportInstructionTree.create(
      instructionOrInstructions,
      this.getNavigationOptions(options),
    );
  }

  private async enqueue(
    instructions: ViewportInstructionTree,
    trigger: 'popstate' | 'hashchange' | 'api',
    managedState: ManagedState | null,
    failedTransition: Transition | null,
  ): Promise<boolean> {
    const lastTransition = this.currentTransition;
    lastTransition.finalInstructions = this.instructions;

    if (
      trigger !== 'api' &&
      lastTransition.trigger === 'api' &&
      lastTransition.instructions.equals(instructions)
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
      // Ensure that `await router.goto` only resolves when the transition truly finished, so chain forward on top of
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
      prevInstructions: lastTransition.finalInstructions,
      finalInstructions: instructions,
      instructions,
      options: instructions.options,
      promise,
      resolve,
      reject,
      previousRouteTree: this.routeTree.clone(),
      routeTree: this.routeTree,
    });

    this.logger.debug(`Scheduling transition: ${nextTransition}`);

    if (this.activeNavigation === null) {
      // The promise for nextTransition is awaited a few lines down below: `const result = await promise;`
      this.dequeue(nextTransition).catch(function (err) {
        // Catch any errors that might be thrown by `dequeue` and reject the original promise which is awaited down below
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        nextTransition.reject!(err);
      });
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
      instructions: transition.instructions,
      trigger: transition.trigger,
      options: transition.options,
      prevNavigation,
      finalInstructions: transition.finalInstructions,
    });

    const routeChanged = !transition.instructions.equals(this.instructions);
    const shouldProcessRoute = routeChanged || transition.options.getSameUrlStrategy(this.instructions) === 'reload';

    if (shouldProcessRoute) {
      this.logger.trace(() => `dequeue(transition:${transition}) - processing route`);

      this.events.publish(new NavigationStartEvent(
        transition.id,
        transition.instructions,
        transition.trigger,
        transition.managedState,
      ));

      // If user triggered a new transition in response to the NavigationStartEvent
      // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
      if (this.nextTransition !== null) {
        this.logger.debug(() => `dequeue(transition:${transition}) - aborting because a new transition was queued in response to the NavigationStartEvent`);
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
        finalInstructions: transition.finalInstructions,
      });

      // TODO: run global guards
      //
      //
      // ---

      RouteTreeCompiler.compileRoot(this.routeTree, transition.finalInstructions, ctx);
      this.instructions = transition.finalInstructions;

      const canLeave = await this.runCanLeave(transition);
      if (canLeave === false) {
        this.logger.trace(() => `dequeue(transition:${transition}) - canLeave returned false, canceling navigation`);

        this.cancelNavigation(transition, 'canLeave returned false');
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        transition.resolve!(false);
        this.runNextTransition(transition);

        return;
      }

      // Load components
      await this.updateNode(transition, transition.routeTree.root);
    } else {
      this.logger.trace(() => `dequeue(transition:${transition}) - NOT processing route`);
    }

    this.navigated = true;
    this.events.publish(new NavigationEndEvent(
      transition.id,
      transition.instructions,
      this.instructions,
    ));
    this.lastSuccessfulNavigation = this.activeNavigation;
    this.activeNavigation = null;
    this.applyHistoryState(transition);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    transition.resolve!(true);

    this.runNextTransition(transition);
  }

  private async runCanLeave(
    transition: Transition,
  ): Promise<boolean> {
    let currentNodes = transition.previousRouteTree.root.children;
    let nextNodes = transition.routeTree.root.children;

    while (currentNodes.length > 0) {
      this.logger.trace(() => `runCanLeave(nodes:${currentNodes.map(String).join(',')},transition:${transition})`);

      const results = await Promise.all(
        currentNodes.map(async current => {
          // TODO: put viewports in a map beforehand?
          const next = nextNodes.find(x => x.context.viewportAgent === current.context.viewportAgent);

          if (next?.component === current.component) {
            this.logger.trace(() => `runCanLeave() - skipping canLeave invocation because component did not change for ${current}`);
            // TODO: add "activationStrategy"-like config to invoke lifecycle even if everything is identical, or if only params changed, etc
            return true;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const result = await current.context.viewportAgent!.componentAgent!.canLeave(next ?? null);
            this.logger.trace(() => `runCanLeave() - ${current} returned ${result}`);
            return result;
          }
        })
      );

      if (results.some(x => x !== true)) {
        return false;
      }

      // Drill down one 'layer' at a time, this allows parent `canEnter` to deterministically prevent children from ever starting to load
      // eslint-disable-next-line require-atomic-updates
      currentNodes = currentNodes.flatMap(x => x.children);
      nextNodes = nextNodes.flatMap(x => x.children);
    }

    return true;
  }

  private async updateNode(
    transition: Transition,
    node: RouteNode,
  ): Promise<void> {
    this.logger.trace(() => `updateNode(node:${node},transition:${transition})`);

    const ctx = node.context;
    if (ctx === null) {
      throw new Error(`Unexpected null context at ${node}`);
    }

    await ctx.update();

    RouteTreeCompiler.compileResidue(this.routeTree, transition.finalInstructions, ctx);

    await Promise.all(node.children.map(async child => {
      await this.updateNode(transition, child);
    }));
  }

  private applyHistoryState(
    transition: Transition,
  ): void {
    switch (transition.options.getHistoryStrategy(this.instructions)) {
      case 'none':
        // do nothing
        break;
      case 'push':
        this.locationMgr.pushState(
          toManagedState(transition.options.state, transition.id),
          transition.options.title ?? '',
          transition.finalInstructions.toUrl(),
        );
        break;
      case 'replace':
        this.locationMgr.replaceState(
          toManagedState(transition.options.state, transition.id),
          transition.options.title ?? '',
          transition.finalInstructions.toUrl(),
        );
        break;
    }
  }

  private cancelNavigation(
    transition: Transition,
    reason: unknown,
  ): void {
    this.cancelUpdates(transition.routeTree.root);
    this.activeNavigation = null;
    this.events.publish(new NavigationCancelEvent(
      transition.id,
      transition.instructions,
      reason,
    ));
  }

  private cancelUpdates(
    node: RouteNode,
  ): void {
    node.context.viewportAgent?.cancelUpdate();
    for (const child of node.children) {
      this.cancelUpdates(child);
    }
  }

  private runNextTransition(
    transition: Transition,
  ): void {
    if (this.nextTransition !== null) {
      this.logger.trace(() => `runNextTransition(transition:${transition}) -> scheduling nextTransition: ${this.nextTransition}`);
      this.scheduler.queueMacroTask(
        () => {
          // nextTransition is allowed to change up until the point when it's actually time to process it,
          // so we need to check it for null again when the scheduled task runs.
          const $nextTransition = this.nextTransition;
          if ($nextTransition !== null) {
            this.dequeue($nextTransition).catch(function (reason) {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              $nextTransition.reject!(reason);
            });
          }
        },
      );
    }
  }

  private getNavigationOptions(options?: INavigationOptions): NavigationOptions {
    return NavigationOptions.create({
      ...this.options,
      ...options,
    });
  }
}

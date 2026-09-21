---
description: Router API contracts for navigation, configuration, route state, events, and link resources.
---

# API Reference

Use this page to look up navigation methods, configuration options, route state, and router resources. For choosing between routing-context navigation and application URL navigation, start with [navigating](./navigating.md). Type excerpts focus on the members relevant to each task; package declarations provide the full overload sets.

## Core Router

### IRouter / Router

The application-wide router. `load()` interprets contextual routing instructions and starts from the root unless a context is supplied. `navigate()` resolves an application URL reference against the last successful router location. Use `IContextRouter` when instructions should start from the component's owning routing context.

```typescript
interface IRouter {
  /** Current route tree representing active routes */
  readonly routeTree: RouteTree;

  /** Current transition (navigation in progress or last completed) */
  readonly currentTr: Transition;

  /** Whether a navigation is currently in progress */
  readonly isNavigating: boolean;

  /** Router configuration options */
  readonly options: Readonly<RouterOptions>;

  /**
   * Navigate to a route.
   * @returns Promise resolving to true if navigation succeeded, false if cancelled
   */
  load(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions
  ): boolean | Promise<boolean>;

  /** Navigate relative to the last successful application URL. */
  navigate(reference: string, options?: INavigationBehaviorOptions): Promise<boolean>;

  /** Resolve an application URL reference to a browser-ready href. */
  createHref(reference: string): string;

  /**
   * Check if a given instruction is currently active.
   */
  isActive(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    context: RouteContextLike
  ): boolean;

  /**
   * Generate a path relative to the context selected by instruction prefixes.
   */
  generatePath(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    context?: RouteContextLike
  ): string | Promise<string>;

  /**
   * Manually update the document title based on current route tree.
   */
  updateTitle(): string;

  /**
   * Start the router. Called automatically by RouterConfiguration.
   * @param performInitialNavigation Whether to navigate to current URL
   */
  start(performInitialNavigation: boolean): void | Promise<boolean>;

  /**
   * Stop the router and cease listening for location changes.
   */
  stop(): void;
}
```

**Usage:**

```typescript
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private readonly router = resolve(IRouter);

  async goToProducts() {
    await this.router.load('products');
  }
}
```

### Application URL methods

`navigate(reference, options?)` and `createHref(reference)` accept application URL references, such as `/reports`, `../reports`, `?page=2`, or `#details`. A leading `/` selects the application root. Omit the deployment prefix and the outer hash-routing marker. Full document URLs, including same-origin URLs, are rejected.

The base is the canonical location of the last successful navigation, including navigation with `historyStrategy: 'none'`. Pending, canceled, and failed transitions do not replace it. Relative references follow URL segment rules, independently of routing contexts. Trailing separators and `/index.html` are normalized when the route is recognized; do not assume a trailing slash from a browser visit is retained in the base.

| Method | Result |
| --- | --- |
| `navigate()` | A promise resolving to `true` on completion or `false` on guard cancellation. Invalid input can throw synchronously; transition failures reject the promise. |
| `createHref()` | A browser-ready href in the configured URL mode and deployment location. Synchronous; does not navigate or verify that the route exists. |

Put query and fragment data in the reference. The behavior options accepted by `navigate()` do not include `context`, `queryParams`, or `fragment`.

`createHref()` returns an output for the browser, not another input for `navigate()`. Keep the original application reference if both operations are needed:

```typescript
const reference = '/reports?period=month';
const href = router.createHref(reference); // Publish in a native link.
await router.navigate(reference);         // Navigate within the application.
```

Use a `try`/`catch` around `await router.navigate(...)` to handle both input validation and transition errors. A validation error raised before enqueueing has no `navigation-error` event. See [application URL navigation](./application-url-navigation.md) for complete examples.

### IContextRouter

A router bound to the routing context in which it is resolved. Its `load()` method uses that context unless navigation options override it; its `generatePath()` and `isActive()` methods use the bound context.

```typescript
interface IContextRouter {
  load(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
    options?: INavigationOptions,
  ): boolean | Promise<boolean>;

  generatePath(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
  ): string | Promise<string>;

  isActive(
    instructionOrInstructions: NavigationInstruction | readonly NavigationInstruction[],
  ): boolean;
}
```

```typescript
import { resolve } from '@aurelia/kernel';
import { IContextRouter } from '@aurelia/router';

export class AdminLayout {
  private readonly router = resolve(IContextRouter);

  openReports() {
    return this.router.load('reports');
  }
}
```

Here `reports` is a child route available to `AdminLayout`. It does not become relative to a deeper page merely because that page is active.

### Generated paths

`IRouter.generatePath()`, `IContextRouter.generatePath()`, and `IRouteContext.generateRelativePath()` return a path relative to the context selected by the instruction prefixes. A leading `../` selects a parent routing context and is consumed; it is not retained in the generated result. Replay that path from the selected context, which may differ from the caller's original context.

For a path to consume through the root router, use `IRouteContext.generateRootedPath()` and `IRouter.load()` with its default root context. These generated paths omit the deployment base; history-mode output is not necessarily slash-prefixed, and hash-mode rooted output includes `/#/`. They are not interchangeable with browser-ready hrefs or application URL references.

For a contextual anchor, `load` retains the selected instruction context and writes its browser href. See [path generation](./navigating.md#path-generation) for examples.

---

### Transition

Represents an in-progress or completed navigation transition. Access via `router.currentTr`.

```typescript
class Transition {
  /** Unique identifier for this transition */
  readonly id: number;

  /** Instructions before this navigation */
  readonly prevInstructions: ViewportInstructionTree;

  /** Original instructions for this navigation */
  readonly instructions: ViewportInstructionTree;

  /** Final instructions after redirects/guards */
  finalInstructions: ViewportInstructionTree;

  /** Whether instructions changed from previous navigation */
  readonly instructionsChanged: boolean;

  /** What triggered this navigation: 'api' | 'popstate' | 'hashchange' */
  readonly trigger: RoutingTrigger;

  /** Navigation options for this transition */
  readonly options: NavigationOptions;

  /** Browser history state if available */
  readonly managedState: ManagedState | null;

  /** Route tree before this navigation */
  readonly previousRouteTree: RouteTree;

  /** Route tree for this navigation */
  routeTree: RouteTree;

  /** Promise that resolves when navigation completes */
  readonly promise: Promise<boolean> | null;

  /** Whether this transition failed due to unknown route */
  readonly erredWithUnknownRoute: boolean;

  /** Error that occurred during navigation, if any */
  error: unknown;

  /** Result of guard checks: true, false, or redirect instructions */
  guardsResult: boolean | ViewportInstructionTree;
}
```

---

### isManagedState / toManagedState

Utility functions for working with router-managed browser history state.

```typescript
/**
 * Check if a history state object was created by the router.
 */
function isManagedState(state: {} | null): state is ManagedState;

/**
 * Convert a state object to router-managed state by adding navigation ID.
 */
function toManagedState(state: {} | null, navId: number): ManagedState;

type ManagedState = {
  [k: string]: unknown;
  [AuNavId]: number;
};

/** Constant key used to identify router-managed state */
const AuNavId = 'au-nav-id';
```

---

## Configuration

### RouterConfiguration

Static object for registering and customizing the router.

```typescript
const RouterConfiguration: {
  /**
   * Register router with default settings.
   */
  register(container: IContainer): IContainer;

  /**
   * Register router with custom options.
   */
  customize(options?: IRouterConfigurationOptions): IRegistry;
};

interface IRouterConfigurationOptions extends IRouterOptions {
  /** Deployment path override (otherwise inferred from document.baseURI) */
  basePath?: string | null;
}
```

**Usage:**

```typescript
import { RouterConfiguration } from '@aurelia/router';

Aurelia.register(
  RouterConfiguration.customize({
    useUrlFragmentHash: false,
    activeClass: 'active',
  })
);
```

---

### RouterOptions / IRouterOptions

Configuration options for the router.

```typescript
interface IRouterOptions {
  /** Use hash-based routing (#/path) instead of pushState. Default: false */
  useUrlFragmentHash?: boolean;

  /** Intercept eligible href clicks; does not disable href rewriting. Default: true */
  useHref?: boolean;

  /** Preserve the current document path/query in hash mode. Default: false */
  preserveHashDocument?: boolean;

  /** Load all route configurations at startup. Default: false */
  useEagerLoading?: boolean;

  /** History interaction strategy. Default: 'push' */
  historyStrategy?: HistoryStrategy | ((instructions: ViewportInstructionTree) => HistoryStrategy);

  /** Custom document title builder function. Return null to skip document title updates */
  buildTitle?: ((transition: Transition) => string | null) | null;

  /** Generate navigation model for menus. Default: true */
  useNavigationModel?: boolean;

  /** CSS class for active routes (used by load attribute). Default: null */
  activeClass?: string | null;

  /** Restore previous route tree on navigation error. Default: true */
  restorePreviousRouteTreeOnError?: boolean;

  /**
   * Treat query params as route params. Default: false
   * @deprecated Will be removed in next major version
   */
  treatQueryAsParameters?: boolean;
}

type HistoryStrategy = 'none' | 'replace' | 'push';
```

---

### NavigationOptions / INavigationOptions

Options for `load()` calls. Query and fragment can be supplied here; route parameters belong in an instruction's `params`. For `navigate()`, use the narrower `INavigationBehaviorOptions` below.

```typescript
interface INavigationOptions {
  /** Override router's history strategy for this navigation */
  historyStrategy?: HistoryStrategy | ((instructions: ViewportInstructionTree) => HistoryStrategy);

  /** Document title override for this navigation when no custom buildTitle is configured */
  title?: string | ((node: RouteNode) => string | null) | null;

  /** Separator between hierarchical titles. Default: ' | ' */
  titleSeparator?: string;

  /** Starting routing context; null selects root */
  context?: RouteContextLike | null;

  /** Query string parameters */
  queryParams?: Params | null;

  /** URL hash fragment */
  fragment?: string;

  /** History state object */
  state?: Params | null;

  /** Override the transition plan for this navigation's targets */
  transitionPlan?: TransitionPlan | null;

  /** Mark as back navigation (affects transition behavior) */
  isBack?: boolean;
}
```

---

### INavigationBehaviorOptions

Options accepted by `router.navigate()`. The application URL reference supplies the destination; these options control the transition and its browser-history entry.

```typescript
interface INavigationBehaviorOptions extends Pick<
  INavigationOptions,
  'historyStrategy' | 'title' | 'titleSeparator' | 'state' | 'transitionPlan'
> {}
```

See [application URL navigation](./application-url-navigation.md) for reference-resolution rules and examples.

---

## Route Configuration

### @route Decorator

Decorator for configuring routes on a component class.

```typescript
function route(config: IRouteConfig): ClassDecorator;
function route(path: string): ClassDecorator;
```

**Usage:**

```typescript
import { route } from '@aurelia/router';
import { Home } from './home';
import { About } from './about';

@route({
  routes: [
    { path: '', component: Home },
    { path: 'about', component: About },
  ]
})
export class MyApp {}

// Or simple path-only usage:
@route('products/:id')
export class ProductDetail {}
```

---

### RouteConfig / IRouteConfig

Route configuration interface and class.

```typescript
interface IRouteConfig {
  /** Route identifier for href generation */
  readonly id?: string | null;

  /** URL path pattern(s) to match */
  readonly path?: string | string[] | null;

  /** Title part when route is active */
  readonly title?: string | ((node: RouteNode) => string | null) | null;

  /** Redirect to another route when matched */
  readonly redirectTo?: string | null;

  /** Case-sensitive path matching. Default: false */
  readonly caseSensitive?: boolean;

  /** Component reentry behavior */
  readonly transitionPlan?: TransitionPlanOrFunc | null;

  /** Target viewport name */
  readonly viewport?: string | null;

  /** Custom route metadata */
  readonly data?: Record<string, unknown>;

  /** Child routes */
  readonly routes?: readonly Routeable[];

  /** Fallback for unknown child routes */
  readonly fallback?: Routeable | FallbackFunction | null;

  /** Include in navigation model. Default: true */
  readonly nav?: boolean;
}

interface IChildRouteConfig extends IRouteConfig {
  /** Component to load (required for child routes) */
  readonly component: Routeable;
}

interface IRedirectRouteConfig extends Pick<
  IRouteConfig, 'caseSensitive' | 'redirectTo' | 'path'
> {}

type TransitionPlan = 'none' | 'replace' | 'invoke-lifecycles';
type TransitionPlanOrFunc = TransitionPlan | ((current: RouteNode, next: RouteNode) => TransitionPlan);
```

---

### Routeable

Union type for anything that can be loaded as a route.

```typescript
type Routeable = string | IChildRouteConfig | IRedirectRouteConfig | RouteableComponent;
```

---

### RouteableComponent

Union type for component references in routes.

```typescript
type RouteableComponent =
  | RouteType                              // Class reference
  | (() => RouteType)                      // Factory function
  | Promise<IModule>                       // Dynamic import
  | CustomElementDefinition                // Element definition
  | IRouteViewModel;                       // Component instance
```

---

### FallbackFunction

Function signature for dynamic fallback resolution.

```typescript
type FallbackFunction = (
  viewportInstruction: IViewportInstruction,
  routeNode: RouteNode,
  context: IRouteContext
) => Routeable | null;
```

---

## Navigation Instructions

### NavigationInstruction

Union type for all navigation instruction formats.

```typescript
type NavigationInstruction =
  | string                    // Path or component name
  | IViewportInstruction      // Detailed instruction
  | RouteableComponent        // Component reference
  | NavigationStrategy;       // Programmatic strategy
```

---

### IViewportInstruction / ViewportInstruction

An instruction with optional parameters, viewport, and child instructions. The author-facing fields are:

```typescript
interface IViewportInstruction {
  /** Component to load (name, class, or definition) */
  readonly component: string | RouteableComponent;

  /** Target viewport name */
  readonly viewport?: string | null;

  /** Route parameter values, before URL encoding */
  readonly params?: Params | null;

  /** Child navigation instructions */
  readonly children?: readonly NavigationInstruction[];
}
```

**Usage:**

```typescript
router.load({
  component: ProductDetail,
  params: { id: '123' },
  viewport: 'main'
});
```

The optional `recognizedRoute` member carries an already recognized route. Application-authored instructions normally omit it.

Readonly instruction arrays are accepted by navigation and path-generation APIs. Constructing an instruction tree copies the supplied parameter values; it does not freeze the application's parameter object. Later edits to that object do not change an instruction tree already constructed from it. Supply unencoded parameter values and let the router encode the generated path.

---

### NavigationStrategy

Select a component during route resolution. The callback receives the instruction, its routing context, the route node, and the recognized route.

```typescript
class NavigationStrategy {
  constructor(
    getComponent: (
      instruction: IViewportInstruction,
      context: IRouteContext,
      node: RouteNode,
      route: RecognizedRoute<unknown>,
    ) => string | RouteType | Promise<IModule> | CustomElementDefinition,
  );
}
```

A synchronous callback can return a component class. For lazy loading, return a module promise such as `import('./admin-dashboard')`; a promise resolving directly to a component class is not the callback's return contract.

```typescript
const user = await authService.getUser();

await router.load(new NavigationStrategy(() =>
  user.isAdmin ? AdminDashboard : UserDashboard
));
```

---

### Params

Type for route parameters.

```typescript
type Params = Record<string, string | undefined>;
```

---

## Route Context

### IRouteContext / RouteContext

Context for a routed component, providing access to route information and navigation.

```typescript
interface IRouteContext {
  /** Parent route context (null for root) */
  readonly parent: IRouteContext | null;

  /** Root route context */
  readonly root: IRouteContext;

  /** Whether this is the root context */
  readonly isRoot: boolean;

  /** Current route node */
  readonly node: RouteNode;

  /** Viewport agent managing this context */
  readonly vpa: ViewportAgent;

  /** DI container for this route */
  readonly container: IContainer;

  /** Route configuration context */
  readonly routeConfigContext: IRouteConfigContext;

  /**
   * Get aggregated route parameters from this context and ancestors.
   */
  getRouteParameters<TParams extends Record<string, unknown> = Params>(): Readonly<TParams>;

  getRouteParameters<
    TParams extends Record<string, unknown> = Params,
    TStrategy extends RouteParameterMergeStrategy = RouteParameterMergeStrategy,
  >(options: RouteParametersOptions<TStrategy>): RouteParametersResult<TStrategy, TParams>;

  /**
   * Generate a path for consumption from the application routing root.
   */
  generateRootedPath(
    instructions: NavigationInstruction | readonly NavigationInstruction[]
  ): string | Promise<string>;

  /**
   * Generate a path relative to the context selected by instruction prefixes.
   */
  generateRelativePath(
    instructions: NavigationInstruction | readonly NavigationInstruction[]
  ): string | Promise<string>;
}
```

**Usage:**

```typescript
import { IRouteContext } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  private readonly context = resolve(IRouteContext);

  get allParams() {
    return this.context.getRouteParameters({
      mergeStrategy: 'parent-first',
      includeQueryParams: true
    });
  }
}
```

---

### RouteParametersOptions

`getRouteParameters()` aggregates the active context's parameters and its ancestors. The result is a frozen snapshot; call again after navigation to read the new state. There is no promise of the same object identity between calls.

```typescript
type RouteParameterMergeStrategy = 'child-first' | 'parent-first' | 'append' | 'by-route';
type RouteParameterValue = string | readonly string[];

type RouteParametersOptions<TStrategy extends RouteParameterMergeStrategy = 'child-first'> =
  { includeQueryParams?: boolean } & (
    TStrategy extends 'child-first'
      ? { mergeStrategy?: 'child-first' }
      : { mergeStrategy: TStrategy }
  );
```

| Strategy | Result |
| --- | --- |
| `'child-first'` | One value per name; nearer contexts take precedence. The default. |
| `'parent-first'` | One value per name; ancestor contexts take precedence. |
| `'append'` | An array of values per name, ordered from ancestors to descendants. A repeated query value can itself be an array. |
| `'by-route'` | Parameters grouped by route ID, or by the context's friendly path when there is no ID. |

`includeQueryParams` defaults to the router's `treatQueryAsParameters` setting. Set it explicitly when the caller needs query values. This aggregation API is separate from a lifecycle hook's `params` argument, which contains that route's parameters and, if configured, its query values; it does not automatically merge ancestor parameters.

The return type in the method signature above is represented by the following conditional type. It is shown for reference, not exported from the package entry point:

```typescript
type RouteParametersResult<
  TStrategy extends RouteParameterMergeStrategy,
  TParams extends Record<string, unknown>,
> = TStrategy extends 'append'
  ? Readonly<Record<string, readonly RouteParameterValue[]>>
  : TStrategy extends 'by-route'
    ? Readonly<Record<string, Readonly<Record<string, RouteParameterValue>>>>
    : Readonly<TParams>;
```

---

### RouteContextLike

Union type for values that can resolve to a route context.

```typescript
type RouteContextLike =
  | IRouteContext
  | ICustomElementViewModel
  | ICustomElementController
  | HTMLElement;
```

---

## Route Tree

### RouteTree

Tree representing the current route state. Read it to inspect active routes; navigate through the router to change that state.

```typescript
class RouteTree {
  /** Root route node */
  readonly root: RouteNode;

  /** Navigation options used for this tree */
  readonly options: NavigationOptions;

  /** Current query parameters */
  readonly queryParams: Readonly<URLSearchParams>;

  /** Current URL fragment */
  readonly fragment: string | null;
}
```

---

### RouteNode

A node representing one active route in the hierarchy. Its configured path can consume more than one URL segment.

```typescript
class RouteNode {
  /** Original matched path segment */
  readonly path: string;

  /** Final path after redirects */
  readonly finalPath: string;

  /** Route context for this node */
  readonly context: IRouteContext;

  /** Original viewport instruction */
  readonly instruction: ViewportInstruction | null;

  /** Route parameters */
  readonly params: Readonly<Params>;

  /** Query parameters */
  readonly queryParams: Readonly<URLSearchParams>;

  /** URL fragment */
  readonly fragment: string | null;

  /** Custom route data */
  readonly data: Readonly<Record<string, unknown>>;

  /** This route node's title part */
  title: string | ((node: RouteNode) => string | null) | null;

  /** Compose this node and its children into a title string */
  getTitle(separator: string): string | null;

  /** Component definition */
  readonly component: CustomElementDefinition;

  /** Child route nodes */
  readonly children: RouteNode[];

  /** Root node reference */
  readonly root: RouteNode;
}
```

---

## Current Route

### ICurrentRoute / CurrentRoute

Singleton tracking the currently active route. Updated after navigation completes.

```typescript
interface ICurrentRoute {
  /** Current path (without query/fragment) */
  readonly path: string;

  /** Serialized route URL, with query/fragment and the configured hash wrapper; no deployment base */
  readonly url: string;

  /** Current page title */
  readonly title: string;

  /** Current query parameters */
  readonly query: URLSearchParams;

  /** Hierarchical parameter information */
  readonly parameterInformation: readonly ParameterInformation[];
}

interface ParameterInformation {
  /** Route configuration for this segment */
  readonly config: RouteConfig | null;

  /** Viewport name */
  readonly viewport: string | null;

  /** Route parameters for this segment */
  readonly params: Readonly<Params> | null;

  /** Child parameter information */
  readonly children: readonly ParameterInformation[];
}
```

`ICurrentRoute` updates on `navigation-end`, after the incoming page's lifecycle hooks. During `loading()`, use the hook's `params` and `next: RouteNode` arguments for the incoming route. See [current route](./current-route.md) for timing, event subscriptions, and query-driven refresh. Its `url` is neither the full document URL nor a general-purpose input for `navigate()`; use `createHref()` when producing a browser link from an application reference.

---

## Navigation Model

### INavigationModel / INavigationRoute

View-friendly route information for building navigation menus.

```typescript
interface INavigationModel {
  /** Collection of navigation routes */
  readonly routes: readonly INavigationRoute[];

  /** Wait for async route configurations to resolve */
  resolve(): Promise<void> | void;
}

interface INavigationRoute {
  /** Route identifier */
  readonly id: string | null;

  /** Route path(s) */
  readonly path: string[];

  /** Route title */
  readonly title: string | ((node: RouteNode) => string | null) | null;

  /** Custom route data */
  readonly data: Record<string, unknown>;

  /** Whether this route is currently active */
  readonly isActive: boolean;
}
```

**Usage:**

```typescript
import { IRouteContext, type INavigationModel } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavBar {
  readonly navModel: INavigationModel | null =
    resolve(IRouteContext).routeConfigContext.navigationModel;

  async binding(): Promise<void> {
    await this.navModel?.resolve();
  }
}
```

The model is `null` when `useNavigationModel` is disabled. Check for its presence before rendering a menu that consumes `navModel.routes`.

---

## Router Events

### IRouterEvents / RouterEvents

Event publisher for router lifecycle events.

```typescript
interface IRouterEvents {
  /** Publish an event */
  publish(event: RouterEvent): void;

  /** Subscribe to an event */
  subscribe<T extends RouterEvent['name']>(
    event: T,
    callback: (message: NameToEvent[T]) => void
  ): IDisposable;
}

type RouterEvent =
  | LocationChangeEvent
  | NavigationStartEvent
  | NavigationEndEvent
  | NavigationCancelEvent
  | NavigationErrorEvent;
```

---

### Event Types

```typescript
class LocationChangeEvent {
  readonly name: 'au:router:location-change';
  readonly id: number;
  readonly url: string;
  readonly trigger: 'popstate' | 'hashchange';
  readonly state: {} | null;
}

class NavigationStartEvent {
  readonly name: 'au:router:navigation-start';
  readonly id: number;
  readonly instructions: ViewportInstructionTree;
  readonly trigger: RoutingTrigger;           // 'api' | 'popstate' | 'hashchange'
  readonly managedState: ManagedState | null;
}

class NavigationEndEvent {
  readonly name: 'au:router:navigation-end';
  readonly id: number;
  readonly instructions: ViewportInstructionTree;
  readonly finalInstructions: ViewportInstructionTree;
}

class NavigationCancelEvent {
  readonly name: 'au:router:navigation-cancel';
  readonly id: number;
  readonly instructions: ViewportInstructionTree;
  readonly reason: unknown;
}

class NavigationErrorEvent {
  readonly name: 'au:router:navigation-error';
  readonly id: number;
  readonly instructions: ViewportInstructionTree;
  readonly error: unknown;
}
```

**Usage:**

```typescript
import { IRouterEvents, NavigationEndEvent } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';
import { trackPageView } from './analytics'; // The application's analytics adapter.

export class Analytics {
  constructor() {
    resolve(IRouterEvents).subscribe(
      'au:router:navigation-end',
      (event: NavigationEndEvent) => {
        trackPageView(event.finalInstructions.toPath());
      }
    );
  }
}
```

---

## Lifecycle Hooks

### IRouteViewModel

Interface for routed components with lifecycle hooks.

```typescript
interface IRouteViewModel extends ICustomElementViewModel {
  /**
   * Dynamically provide route configuration.
   * Called after component creation, before canLoad.
   */
  getRouteConfig?(
    parentConfig: IRouteConfig | null,
    routeNode: RouteNode | null
  ): IRouteConfig | Promise<IRouteConfig>;

  /**
   * Guard: Can this component be loaded?
   * Return false to cancel, string/instruction to redirect.
   */
  canLoad?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): boolean | NavigationInstruction | NavigationInstruction[]
    | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;

  /**
   * Pre-activation hook. Fetch data, prepare state.
   */
  loading?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): void | Promise<void>;

  /**
   * Post-activation hook. Track analytics, trigger effects.
   */
  loaded?(
    params: Params,
    next: RouteNode,
    current: RouteNode | null,
    options: INavigationOptions
  ): void | Promise<void>;

  /**
   * Guard: Can this component be unloaded?
   * Return false to prevent navigation away.
   */
  canUnload?(
    next: RouteNode | null,
    current: RouteNode,
    options: INavigationOptions
  ): boolean | Promise<boolean>;

  /**
   * Pre-deactivation hook. Cleanup, save state.
   */
  unloading?(
    next: RouteNode | null,
    current: RouteNode,
    options: INavigationOptions
  ): void | Promise<void>;
}
```

---

## Custom Elements & Attributes

### ViewportCustomElement

The `<au-viewport>` custom element that renders routed components.

```typescript
class ViewportCustomElement {
  /** Viewport name (default: 'default') */
  name: string;

  /** Comma-separated component names that can use this viewport */
  usedBy: string;

  /** Default component to load when viewport is empty */
  default: string;

  /** Fallback for unknown routes */
  fallback: Routeable | FallbackFunction;
}
```

**Usage:**

```html
<au-viewport></au-viewport>
<au-viewport name="sidebar" default="side-menu"></au-viewport>
<au-viewport name="modal" fallback="not-found"></au-viewport>
```

---

### LoadCustomAttribute

The `load` custom attribute for declarative navigation.

```typescript
class LoadCustomAttribute {
  /** Navigation instruction (route ID, path, or component); primary bindable */
  route: unknown;

  /** Route parameters */
  params?: Params;

  /** Attribute to set on host element (default: 'href') */
  attribute: string;

  /** Active-route output; binds from the attribute to the view model */
  active: boolean;

  /** Optional explicit context; otherwise use the owning routing context */
  context?: IRouteContext;
}
```

**Usage:**

```html
<a load="products">Products</a>
<a load="route: product-detail; params.bind: { id: item.id }">View</a>
<a load="route: dashboard; active.bind: dashboardActive"
   class.bind="dashboardActive ? 'is-active' : ''">Dashboard</a>
```

---

### HrefCustomAttribute

The `href` custom attribute interprets routing instructions in the owning routing context and writes the corresponding browser href. `useHref: false` disables click interception but does not stop that rewriting. Use `external` for a native document link.

```typescript
class HrefCustomAttribute {
  /** Target instruction (string path or component) */
  value: unknown;
}
```

**Usage:**

```html
<a href="products">Products</a>
<a href="mailto:test@example.com" external>Email</a>
```

---

### UrlCustomAttribute

An opt-in `url` attribute for [application URL links](./application-url-navigation.md#declarative-links). Register `UrlCustomAttribute` explicitly; it is not included in `RouterConfiguration` or `DefaultResources`.

```typescript
class UrlCustomAttribute {
  /** Application URL reference; null or undefined removes the href. */
  value: string | null | undefined;
}
```

```html
<a url="../reports">Reports</a>
<a url.bind="destination">Open</a>
```

The attribute updates its `href` after successful navigation. Ordinary clicks use the application destination captured when that href was published; they do not re-resolve the original relative text during an in-progress navigation. Use it without `load` or an authored `href` on the same element. Clicks targeting another browsing context, downloads, modifier-key clicks, and already-canceled clicks retain browser ownership. Unlike `load`, `url` has no active-route output.

---

## Location Management

### ILocationManager

Interface for browser location interaction. Override for custom environments.

```typescript
interface ILocationManager {
  startListening(): void;
  stopListening(): void;
  handleEvent(event: PopStateEvent | HashChangeEvent): void;
  pushState(state: {} | null, title: string, url: string): void;
  replaceState(state: {} | null, title: string, url: string): void;
  getPath(): string;
  addBaseHref(path: string): string;
  removeBaseHref(path: string): string;
}
```

---

## State Management

### IStateManager

Interface for scroll state persistence during navigation.

```typescript
interface IStateManager {
  /** Save scroll positions for a component */
  saveState(controller: ICustomElementController): void;

  /** Restore scroll positions for a component */
  restoreState(controller: ICustomElementController): void;
}
```

The default implementation records and restores scroll offsets for descendants of the supplied controller's host when these methods are called. Router transitions do not automatically invoke this service, and it does not implement fragment-to-element scrolling.

---

## URL Parsing

### IUrlParser

Interface for URL parsing and stringification.

```typescript
interface IUrlParser {
  /** Parse a URL string into components */
  parse(value: string): ParsedUrl;

  /** Build a URL string from components */
  stringify(
    path: string,
    query: Readonly<URLSearchParams>,
    fragment: string | null,
    isRooted: boolean
  ): string;
}

// Shape returned by parse(); ParsedUrl is not exported from the package entry point.
interface ParsedUrl {
  readonly path: string;
  readonly query: Readonly<URLSearchParams>;
  readonly fragment: string | null;
}
```

`IUrlParser` describes the exported parser utilities. `RouterConfiguration.customize()` selects the built-in parser through `useUrlFragmentHash`; it does not expose a custom-parser option. The internal `RouterOptions._urlParser` member is not a supported mutation hook.

### pathUrlParser / fragmentUrlParser

Built-in URL parser implementations.

```typescript
/** Parser for pushState routing (/path/to/route) */
const pathUrlParser: IUrlParser;

/** Parser for hash routing (#/path/to/route) */
const fragmentUrlParser: IUrlParser;
```

---

## Route Expression (Advanced)

These classes represent the AST for parsed route expressions. Useful for advanced scenarios like custom route matching.

```typescript
class RouteExpression { /* Root expression */ }
class CompositeSegmentExpression { /* Multiple sibling segments (a+b) */ }
class ScopedSegmentExpression { /* Parent/child segments (a/b) */ }
class SegmentGroupExpression { /* Grouped segments ((a+b)) */ }
class SegmentExpression { /* Single segment */ }
class ComponentExpression { /* Component reference */ }
class ViewportExpression { /* Viewport reference (@name) */ }
class ParameterListExpression { /* Parameter list ((a=1,b=2)) */ }
class ParameterExpression { /* Single parameter */ }
```

---

## Type Exports

Additional type exports for TypeScript users:

```typescript
// Typed navigation instructions
type ITypedNavigationInstruction_string
type ITypedNavigationInstruction_ViewportInstruction
type ITypedNavigationInstruction_CustomElementDefinition
type ITypedNavigationInstruction_Promise
type ITypedNavigationInstruction_IRouteViewModel

// Route types
type RouteType = CustomElementType & { ... }

// Viewport interface
interface IViewport {
  readonly name: string;
  readonly usedBy: string;
  readonly default: string;
  readonly fallback: Routeable | FallbackFunction;
}
```

---

## Default Registrations

```typescript
/** Router singleton registration */
const RouterRegistration: IRegistry;

/** Default component registrations */
const DefaultComponents: IRegistry[];

/** Default resource registrations (viewport, load, href) */
const DefaultResources: IRegistry[];
```

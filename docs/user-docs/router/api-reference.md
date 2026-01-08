---
description: Complete API reference for @aurelia/router exports, interfaces, classes, and types.
---

# API Reference

This page documents all public exports from `@aurelia/router`. Use it as a quick lookup for types, interfaces, classes, and functions.

## Core Router

### IRouter / Router

The main router interface and implementation. Inject `IRouter` to navigate programmatically.

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
    path: string | NavigationInstruction | NavigationInstruction[],
    options?: INavigationOptions
  ): boolean | Promise<boolean>;

  /**
   * Check if a given instruction is currently active.
   */
  isActive(
    instructionOrInstructions: NavigationInstruction | NavigationInstruction[],
    context: RouteContextLike
  ): boolean;

  /**
   * Generate a URL path from navigation instructions without navigating.
   */
  generatePath(
    instructionOrInstructions: NavigationInstruction | NavigationInstruction[],
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
  /** Custom routing base path (overrides document.baseURI) */
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

  /** Enable href attribute processing. Default: true */
  useHref?: boolean;

  /** History interaction strategy. Default: 'push' */
  historyStrategy?: HistoryStrategy | ((instructions: ViewportInstructionTree) => HistoryStrategy);

  /** Custom title builder function. Return null to skip title updates */
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

Options for individual navigation calls.

```typescript
interface INavigationOptions {
  /** Override router's history strategy for this navigation */
  historyStrategy?: HistoryStrategy | ((instructions: ViewportInstructionTree) => HistoryStrategy);

  /** Page title for this navigation */
  title?: string | ((node: RouteNode) => string | null) | null;

  /** Separator between hierarchical titles. Default: ' | ' */
  titleSeparator?: string;

  /** Navigation context for relative navigation */
  context?: RouteContextLike | null;

  /** Query string parameters */
  queryParams?: Params | null;

  /** URL hash fragment */
  fragment?: string;

  /** History state object */
  state?: Params | null;

  /** Override route's transition plan */
  transitionPlan?: TransitionPlan | null;

  /** Mark as back navigation (affects transition behavior) */
  isBack?: boolean;
}
```

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
  id?: string | null;

  /** URL path pattern(s) to match */
  path?: string | string[] | null;

  /** Page title when route is active */
  title?: string | ((node: RouteNode) => string | null) | null;

  /** Redirect to another route when matched */
  redirectTo?: string | null;

  /** Case-sensitive path matching. Default: false */
  caseSensitive?: boolean;

  /** Component reentry behavior */
  transitionPlan?: TransitionPlan | TransitionPlanOrFunc | null;

  /** Target viewport name */
  viewport?: string | null;

  /** Custom route metadata */
  data?: Record<string, unknown>;

  /** Child routes */
  routes?: readonly Routeable[];

  /** Fallback for unknown child routes */
  fallback?: Routeable | FallbackFunction | null;

  /** Include in navigation model. Default: true */
  nav?: boolean;
}

interface IChildRouteConfig extends IRouteConfig {
  /** Component to load (required for child routes) */
  component: Routeable;
}

interface IRedirectRouteConfig {
  path: string | string[];
  redirectTo: string;
  caseSensitive?: boolean;
}

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

Detailed navigation instruction targeting a specific viewport.

```typescript
interface IViewportInstruction {
  /** Component to load (name, class, or definition) */
  component: string | RouteableComponent;

  /** Target viewport name */
  viewport?: string | null;

  /** Route parameters */
  params?: Params | null;

  /** Child navigation instructions */
  children?: readonly NavigationInstruction[];

  /** Pre-recognized route (internal) */
  recognizedRoute?: RecognizedRoute | null;
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

---

### NavigationStrategy

Class for programmatic/lazy component selection.

```typescript
class NavigationStrategy {
  constructor(
    getComponent: () => RouteableComponent | Promise<RouteableComponent>
  );
}
```

**Usage:**

```typescript
router.load(new NavigationStrategy(async () => {
  const user = await authService.getUser();
  return user.isAdmin ? AdminDashboard : UserDashboard;
}));
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
  getRouteParameters<T extends Record<string, unknown> = Params>(
    options?: RouteParametersOptions
  ): T;

  /**
   * Generate an absolute URL path from instructions.
   */
  generateRootedPath(
    instructions: NavigationInstruction | NavigationInstruction[]
  ): string | Promise<string>;

  /**
   * Generate a relative URL path from instructions.
   */
  generateRelativePath(
    instructions: NavigationInstruction | NavigationInstruction[]
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

Options for `getRouteParameters()`.

```typescript
type RouteParameterMergeStrategy = 'child-first' | 'parent-first' | 'append' | 'by-route';

interface RouteParametersOptions {
  /** How to merge parameters from parent/child routes */
  mergeStrategy?: RouteParameterMergeStrategy;

  /** Include query string parameters */
  includeQueryParams?: boolean;
}
```

| Strategy | Description |
|----------|-------------|
| `'child-first'` | Child parameters override parent (default) |
| `'parent-first'` | Parent parameters override child |
| `'append'` | Collect all values as arrays |
| `'by-route'` | Group parameters by route |

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

Immutable tree representing the current route state.

```typescript
class RouteTree {
  /** Root route node */
  readonly root: RouteNode;

  /** Navigation options used for this tree */
  readonly options: NavigationOptions;

  /** Current query parameters */
  readonly queryParams: URLSearchParams;

  /** Current URL fragment */
  readonly fragment: string | null;
}
```

---

### RouteNode

A node in the route tree representing a single route segment.

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

  /** Page title */
  readonly title: string | ((node: RouteNode) => string | null) | null;

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

  /** Full current URL */
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

**Important timing note:** `ICurrentRoute` is updated **after** all lifecycle hooks complete. Use router events for immediate access during navigation.

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
import { IRouteContext, INavigationModel } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class NavBar {
  private readonly navModel: INavigationModel =
    resolve(IRouteContext).routeConfigContext.navigationModel;

  async binding() {
    await this.navModel.resolve();
  }
}
```

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
  ): boolean | NavigationInstruction | NavigationInstruction[] | Promise<...>;

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
  /** Navigation instruction (route id, path, or component) */
  value: unknown;

  /** Route parameters */
  params: Params;

  /** Attribute to set on host element (default: 'href') */
  attribute: string;

  /** Whether this route is currently active (readonly) */
  readonly active: boolean;

  /** Navigation context for relative navigation */
  context: IRouteContext;
}
```

**Usage:**

```html
<a load="products">Products</a>
<a load="route: product-detail; params.bind: { id: item.id }">View</a>
<a load="dashboard" active.class="is-active">Dashboard</a>
```

---

### HrefCustomAttribute

The `href` custom attribute for link interception.

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

The default implementation (`ScrollStateManager`) automatically saves and restores scroll positions during route transitions.

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
    query: URLSearchParams,
    fragment: string | null,
    isRooted?: boolean
  ): string;
}

interface ParsedUrl {
  path: string;
  query: URLSearchParams;
  fragment: string | null;
}
```

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

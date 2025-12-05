# Aurelia 1 to Aurelia 2: Complete Migration Guide

Welcome to the comprehensive guide for migrating from Aurelia 1 to Aurelia 2! This guide will walk you through every aspect of the migration process, highlighting what's changed, what's improved, and what you need to know to successfully upgrade your application.

Aurelia 2 represents a significant evolution of the framework, bringing modern JavaScript features, improved performance, better tooling support, and a more streamlined developer experience. While many core concepts remain familiar, there are important changes that will make your applications more maintainable and powerful.

---

## Table of Contents

1. [Application Bootstrapping](#application-bootstrapping)
2. [Components and Templates](#components-and-templates)
3. [Component Lifecycle](#component-lifecycle)
4. [Dependency Injection](#dependency-injection)
5. [Logging System](#logging-system)
6. [Router and Navigation](#router-and-navigation)
7. [Data Binding](#data-binding)
8. [Template Features](#template-features)
9. [What's New in Aurelia 2](#whats-new-in-aurelia-2)
10. [Migration Checklist](#migration-checklist)

---

## Application Bootstrapping

### The HTML Entry Point

The way you initialize your Aurelia application has been simplified and modernized.

{% tabs %}
{% tab title="Aurelia 1" %}
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My Aurelia App</title>
  </head>
  <body aurelia-app="main">
    <script src="scripts/vendor-bundle.js" data-main="aurelia-bootstrapper"></script>
  </body>
</html>
```

The `aurelia-app` attribute told the framework where to find your main configuration file, and you had to include the aurelia-bootstrapper script.
{% endtab %}

{% tab title="Aurelia 2" %}
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My Aurelia App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body>
    <my-app></my-app>
  </body>
</html>
```

Much cleaner! You simply place your root component's element in the HTML. No special attributes or bootstrap scripts needed. Your bundler configuration determines which JavaScript file serves as the entry point.
{% endtab %}
{% endtabs %}

### Application Configuration and Startup

The main configuration file has been significantly streamlined, with a more intuitive API and better bundler compatibility.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
// src/main.ts
export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .globalResources(PLATFORM.moduleName('./shared/nav-bar'));

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  aurelia.start()
    .then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
```

**Key concepts in v1:**
- **`PLATFORM.moduleName`**: Required for Webpack compatibility - you had to wrap every module reference
- **`standardConfiguration()`**: Loaded default framework features
- **`globalResources()`**: Made components available app-wide
- **`feature()`**: Loaded grouped functionality
- **`plugin()`**: Added third-party packages
- **`setRoot()`**: Defined the root component
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
// src/main.ts
import Aurelia, { RouterConfiguration, LoggerConfiguration, LogLevel } from 'aurelia';
import { MyApp } from './my-app';

// Quick startup (recommended for most apps)
Aurelia
  .register(RouterConfiguration)
  .app(MyApp)
  .start();

// Or with more configuration
Aurelia
  .register(
    RouterConfiguration.customize({ useUrlFragmentHash: false }),
    LoggerConfiguration.create({
      level: LogLevel.debug,
      sinks: [ConsoleSink]
    })
  )
  .app(MyApp)
  .start();

// Or verbose startup for advanced scenarios
const au = new Aurelia();
au.register(
  RouterConfiguration,
  // Register global components
  NavBarComponent,
  FooterComponent
);
au.app({
  host: document.querySelector('my-app'),
  component: MyApp
});
await au.start();
```

**What's improved in v2:**
- **No more `PLATFORM.moduleName`**: Works with any bundler out of the box
- **Fluent API**: Chain registration and startup calls naturally
- **Type safety**: Full TypeScript support with IntelliSense
- **Flexible registration**: Multiple ways to register components and features
- **Better async support**: Native Promise support throughout
{% endtab %}
{% endtabs %}

### Registering Global Resources

Making components available throughout your app is now more flexible and type-safe.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
// Individual registration
aurelia.use.globalResources(
  PLATFORM.moduleName('shared/value-converters/date-format'),
  PLATFORM.moduleName('shared/components/loading-spinner')
);

// Feature-based registration
// resources/index.ts
export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    PLATFORM.moduleName('./value-converters/date-format'),
    PLATFORM.moduleName('./components/loading-spinner')
  ]);
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
// Method 1: Direct registration
Aurelia
  .register(
    DateFormatValueConverter,
    LoadingSpinnerComponent,
    RouterConfiguration
  )
  .app(MyApp)
  .start();

// Method 2: Registry pattern (recommended)
// shared/registry.ts
export * from './value-converters/date-format';
export * from './components/loading-spinner';
export * from './custom-attributes/tooltip';

// main.ts
import * as SharedResources from './shared/registry';

Aurelia
  .register(SharedResources)
  .app(MyApp)
  .start();

// Method 3: Plugin-style with configuration
// shared/shared-plugin.ts
export const SharedPlugin = {
  register(container: IContainer) {
    container.register(
      DateFormatValueConverter,
      LoadingSpinnerComponent,
      TooltipCustomAttribute
    );
  },
  customize(callback: (options: SharedOptions) => void) {
    // Custom configuration logic
    return this;
  }
};
```
{% endtab %}
{% endtabs %}

---

## Components and Templates

### Component Structure

Components in Aurelia 2 maintain the same view-model pairing but with enhanced conventions and flexibility.

{% tabs %}
{% tab title="Aurelia 1" %}
```html
<!-- src/app.html -->
<require from="./shared/nav-bar"></require>
<require from="./styles.css"></require>

<template>
  <nav-bar router.bind="router"></nav-bar>
  <div class="content">
    <h1>${message}</h1>
    <router-view></router-view>
  </div>
</template>
```

```typescript
// src/app.ts
import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@autoinject
export class App {
  public message: string;

  constructor(private router: Router) {
    this.message = 'Welcome to Aurelia!';
  }
}
```

```css
/* src/app.css - had to be manually required */
.content {
  padding: 20px;
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
```html
<!-- src/my-app.html -->
<import from="./shared/nav-bar"></import>

<nav-bar router.bind="router"></nav-bar>
<div class="content">
  <h1>${message}</h1>
  <au-viewport></au-viewport>
</div>
```

```typescript
// src/my-app.ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class MyApp {
  public message = 'Welcome to Aurelia 2!';
  private router: IRouter = resolve(IRouter);

  // Constructor injection still works
  // constructor(@IRouter private router: IRouter) {}
}
```

```css
/* src/my-app.css - automatically loaded by convention! */
.content {
  padding: 20px;
  container-type: inline-size; /* Modern CSS features work great */
}
```

**Key improvements:**
- **`<import>` vs `<require>`**: More intuitive import syntax
- **Auto-CSS loading**: CSS files with matching names are loaded automatically
- **`resolve()` function**: Alternative to constructor injection for better composability
- **No `<template>` wrapper**: Optional in v2 for cleaner templates
- **Modern CSS support**: Full compatibility with modern CSS features
{% endtab %}
{% endtabs %}

### Template Syntax Enhancements

Aurelia 2 maintains familiar binding syntax while adding powerful new features.

{% tabs %}
{% tab title="Aurelia 1" %}
```html
<template>
  <!-- Basic binding -->
  <div class="user-card ${isActive ? 'active' : ''}">
    <img src.bind="user.avatar" alt="Avatar">
    <span>${user.name}</span>
  </div>

  <!-- Conditional rendering -->
  <div if.bind="showDetails">
    <p>${user.bio}</p>
  </div>

  <!-- Repeating -->
  <ul>
    <li repeat.for="item of items" class="${$index % 2 === 0 ? 'even' : 'odd'}">
      ${item.name}
    </li>
  </ul>
</template>
```
{% endtab %}

{% tab title="Aurelia 2" %}
```html
<!-- No <template> wrapper needed -->
<div class="user-card" active.class="isActive">
  <img src.bind="user.avatar" alt="Avatar">
  <span>${user.name}</span>
</div>

<!-- CSS class binding made easy -->
<button
  class="btn"
  primary.class="isPrimary"
  loading.class="isLoading"
  disabled.class="isDisabled">
  ${buttonText}
</button>

<!-- Lambda expressions in templates -->
<ul>
  <li repeat.for="user of users.filter(u => u.isActive)">
    ${user.name}
  </li>
</ul>
```

**New features in v2:**
- **Lambda expressions**: Filter and transform data directly in templates
{% endtab %}
{% endtabs %}

---

## Component Lifecycle

The component lifecycle has been expanded and refined with more hooks and better async support.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
export class UserProfile {
  private user: User;

  // Component lifecycle hooks
  constructor() {
    // Basic initialization only
  }

  created() {
    // Called after the component is created
    this.initializeDefaults();
  }

  bind() {
    // Called when binding begins
    this.loadUserData();
  }

  attached() {
    // Called when added to DOM
    this.setupEventListeners();
  }

  unbind() {
    // Called when unbinding
    this.cleanup();
  }

  detached() {
    // Called when removed from DOM
    this.removeEventListeners();
  }
}
```

**V1 Lifecycle Order:**
constructor → created → bind → attached → detached → unbind
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
import { ICustomElementController } from 'aurelia';

export class UserProfile {
  private user: User;

  constructor() {
    // Basic initialization - same as v1
  }

  // NEW: Modify component definition before hydration
  define(controller: ICustomElementController, definition: CustomElementDefinition) {
    // Rare use case - modify component behavior dynamically
    return { ...definition, shadowOptions: { mode: 'open' } };
  }

  // NEW: Add contextual DI registrations
  hydrating(controller: ICustomElementController) {
    // Register services that child components might need
    controller.container.register(UserService.singleton());
  }

  // NEW: Final setup before child creation
  hydrated(controller: ICustomElementController) {
    // All child components are about to be created
  }

  created(controller: ICustomElementController) {
    // Same as v1 but with controller access
    this.initializeDefaults();
  }

  // Enhanced with async support and better parameters
  async binding(initiator: IHydratedController, parent: IHydratedController | null) {
    // Can return Promise to block child binding until resolved
    await this.loadUserData();
  }

  // NEW: Called after all bindings are set
  bound(initiator: IHydratedController, parent: IHydratedController | null) {
    // Values from let, from-view, and ref bindings are now available
    this.processBindingData();
  }

  // NEW: Called when attaching to DOM (before attached)
  async attaching(initiator: IHydratedController, parent: IHydratedController | null) {
    // Can return Promise for entrance animations
    return this.animateIn();
  }

  attached(initiator: IHydratedController) {
    // Same concept as v1 but only receives initiator parameter
    this.setupEventListeners();
  }

  // NEW: Called when detaching from DOM (before detached)
  async detaching(initiator: IHydratedController, parent: IHydratedController | null) {
    // Can return Promise for exit animations
    return this.animateOut();
  }

  unbinding(initiator: IHydratedController, parent: IHydratedController | null) {
    // Enhanced with better parameters
    this.cleanup();
  }

  // NEW: Final cleanup when component is permanently discarded
  dispose() {
    // One-time cleanup for memory leak prevention
    this.finalCleanup();
  }
}
```

**V2 Lifecycle Order:**
constructor → define → hydrating → hydrated → created → binding → bound → attaching → attached → detaching → unbinding → dispose

**Key improvements:**
- **More granular control**: Additional hooks for different stages
- **Better async support**: Return Promises to control timing
- **Enhanced parameters**: Controllers provide more context
- **Proper cleanup**: `dispose` hook for final cleanup
{% endtab %}
{% endtabs %}

---

## Dependency Injection

Aurelia 2's DI system has been significantly enhanced with better type safety and more flexible registration options.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
import { autoinject, Container } from 'aurelia-framework';

// Service registration
const container = new Container();
container.registerSingleton(UserService);
container.registerTransient(ApiClient);
container.registerInstance(IConfig, { apiUrl: '/api' });

// Using services
@autoinject
export class UserManager {
  constructor(
    private userService: UserService,
    private apiClient: ApiClient
  ) {}
}

// Manual injection
export class UserManager {
  static inject = [UserService, ApiClient];

  constructor(userService, apiClient) {
    this.userService = userService;
    this.apiClient = apiClient;
  }
}

// Resolvers
import { Lazy, All, Optional, Parent, Factory, NewInstance } from 'aurelia-framework';

@autoinject
export class ComplexService {
  constructor(
    @Lazy(ExpensiveService) private expensiveServiceFactory: () => ExpensiveService,
    @All(IPlugin) private plugins: IPlugin[],
    @Optional(IOptionalService) private optionalService: IOptionalService
  ) {}
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
import { DI, Registration, resolve, inject, singleton, transient } from 'aurelia';

// Service registration - more flexible and type-safe
const container = DI.createContainer();
container.register(
  Registration.singleton(UserService, UserService),
  Registration.transient(ApiClient, ApiClient),
  Registration.instance(IConfig, { apiUrl: '/api' })
);

// Using services - property injection with resolve() (recommended)
export class UserManager {
  // Property injection with resolve() - clean and flexible
  private userService = resolve(UserService);
  private apiClient = resolve(ApiClient);

  // Note: Constructor injection also works, but resolve() is the recommended pattern
}

// Decorator-based registration
@singleton()
export class UserService {
  // Automatically registered as singleton
}

@transient()
export class TemporaryService {
  // New instance every time
}

// Interface creation made easy
export const IUserService = DI.createInterface<IUserService>(
  'IUserService',
  x => x.singleton(UserService) // Default implementation
);
export type IUserService = UserService;

// Enhanced resolvers
import { lazy, all, optional, factory, newInstanceOf, newInstanceForScope } from 'aurelia';

export class ComplexService {
  // Property injection with resolvers
  private expensiveService = resolve(lazy(ExpensiveService));
  private plugins = resolve(all(IPlugin));
  private optionalService = resolve(optional(IOptionalService));
  private serviceFactory = resolve(factory(SomeService));
  private uniqueInstance = resolve(newInstanceOf(SomeService));

  useServices() {
    const expensive = this.expensiveService(); // Lazy evaluation
    this.plugins.forEach(plugin => plugin.execute());
  }
}

// Create injectable services with default implementations
export const INotificationService = DI.createInterface<INotificationService>(
  'INotificationService',
  x => x.singleton(ToastNotificationService)
);

export interface INotificationService {
  notify(message: string): void;
  error(message: string): void;
}
```

**Key improvements:**
- **`resolve()` function**: Clean property injection without constructor bloat
- **Better type safety**: Full TypeScript support with interfaces
- **`DI.createInterface()`**: Create typed injection tokens with defaults
- **Flexible registration**: Multiple patterns for different needs
- **Enhanced resolvers**: More powerful dependency resolution strategies
{% endtab %}
{% endtabs %}

---

## Logging System

The logging system has been completely redesigned with a more powerful and flexible architecture.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
// main.ts
import * as LogManager from 'aurelia-logging';
import { ConsoleAppender } from 'aurelia-logging-console';

export function configure(aurelia) {
  LogManager.addAppender(new ConsoleAppender());
  LogManager.setLevel(LogManager.logLevel.debug);

  aurelia.start().then(() => aurelia.setRoot());
}

// Custom appender
export class CustomAppender {
  debug(logger, ...rest) {
    console.debug(`DEBUG [${logger.id}]`, ...rest);
  }

  info(logger, ...rest) {
    console.info(`INFO [${logger.id}]`, ...rest);
  }

  warn(logger, ...rest) {
    console.warn(`WARN [${logger.id}]`, ...rest);
  }

  error(logger, ...rest) {
    console.error(`ERROR [${logger.id}]`, ...rest);
  }
}

// Using logger
import { getLogger } from 'aurelia-logging';

export class UserService {
  private logger = getLogger('UserService');

  loadUser(id: string) {
    this.logger.debug(`Loading user ${id}`);
  }
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
// main.ts - Simple setup
import Aurelia, { LoggerConfiguration, LogLevel, ConsoleSink } from 'aurelia';

Aurelia
  .register(LoggerConfiguration.create({
    level: LogLevel.debug,
    sinks: [ConsoleSink]
  }))
  .app(MyApp)
  .start();

// Advanced setup with custom sinks
import { sink, ISink, ILogEvent } from '@aurelia/kernel';

@sink({ handles: [LogLevel.warn, LogLevel.error] })
export class RemoteLogSink implements ISink {
  handleEvent(event: ILogEvent): void {
    // Send to remote logging service
    fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify({
        level: event.level,
        message: event.toString(),
        timestamp: new Date().toISOString()
      })
    });
  }
}

// Multiple sinks with different configurations
Aurelia
  .register(LoggerConfiguration.create({
    level: LogLevel.trace,
    sinks: [ConsoleSink, RemoteLogSink, FileLogSink]
  }))
  .app(MyApp)
  .start();

// Using logger - recommended property injection with resolve()
import { resolve } from '@aurelia/kernel';
import { ILogger } from '@aurelia/kernel';

export class UserService {
  private logger = resolve(ILogger).scopeTo('UserService');

  async loadUser(id: string) {
    this.logger.debug(`Loading user ${id}`);

    try {
      const user = await this.api.getUser(id);
      this.logger.info(`User ${id} loaded successfully`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to load user ${id}`, error);
      throw error;
    }
  }
}
```

**Key improvements:**
- **Sink-based architecture**: More flexible than appenders
- **Better type safety**: Full TypeScript support
- **Dependency injection**: Seamless integration with DI system
- **Scoped loggers**: Easy categorization and filtering
- **Multiple outputs**: Send logs to different destinations simultaneously
{% endtab %}
{% endtabs %}

---

## Router and Navigation

The router has been redesigned with a focus on type safety, better performance, and modern navigation patterns.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
// Router configuration
export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'My App';
    config.map([
      { route: ['', 'home'], name: 'home', moduleId: 'pages/home', nav: true, title: 'Home' },
      { route: 'users/:id', name: 'user', moduleId: 'pages/user-detail', title: 'User' },
      { route: 'admin/*path', name: 'admin', moduleId: 'areas/admin/index', title: 'Admin' }
    ]);

    this.router = router;
  }
}

// Lifecycle hooks
export class UserDetail {
  user: User;

  canActivate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction) {
    // Check if user can access this route
    if (!this.authService.isAuthenticated()) {
      return new Redirect('login');
    }
    return true;
  }

  activate(params: any, routeConfig: RouteConfig, navigationInstruction: NavigationInstruction) {
    // Load data for the route
    return this.userService.getUser(params.id).then(user => {
      this.user = user;
    });
  }

  canDeactivate() {
    // Check if user can leave
    if (this.hasUnsavedChanges()) {
      return confirm('You have unsaved changes. Are you sure you want to leave?');
    }
    return true;
  }

  deactivate() {
    // Cleanup when leaving
    this.cleanup();
  }
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
// Router configuration - declarative and type-safe
import { route } from '@aurelia/router';

@route({
  routes: [
    { path: ['', 'home'], component: HomePage, title: 'Home' },
    { path: 'users/:id', component: UserDetailPage, title: 'User Details' },
    { path: 'admin/*', component: AdminArea, title: 'Admin' }
  ]
})
export class MyApp {
  // Router is automatically available
}

// Enhanced lifecycle hooks with better typing
import { IRouteViewModel, Params, RouteNode, NavigationInstruction } from '@aurelia/router';

export class UserDetailPage implements IRouteViewModel {
  user: User;

  // Renamed and enhanced lifecycle hooks
  canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null
  ): boolean | NavigationInstruction | Promise<boolean | NavigationInstruction> {

    if (!this.authService.isAuthenticated()) {
      return { component: 'login', parameters: { returnUrl: next.path } };
    }
    return true;
  }

  async loading(params: Params, next: RouteNode, current: RouteNode | null): Promise<void> {
    // Load data - much cleaner async support
    this.user = await this.userService.getUser(params.id);

    // Set dynamic title based on loaded data
    next.setTitle(`User: ${this.user.name}`);
  }

  canUnload(next: RouteNode | null, current: RouteNode): boolean | Promise<boolean> {
    if (this.hasUnsavedChanges()) {
      return this.platform.window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
    }
    return true;
  }

  unloading(next: RouteNode | null, current: RouteNode): void {
    this.cleanup();
  }
}

// Advanced routing with lazy loading and guards
@route({
  routes: [
    {
      path: 'dashboard',
      component: import('./pages/dashboard'),  // Lazy loading
      title: 'Dashboard',
      data: { requiresAuth: true }  // Route metadata
    },
    {
      path: 'users/:id/edit',
      component: UserEditPage,
      title: 'Edit User',
      data: { requiresPermission: 'users:edit' }
    }
  ]
})
export class MyApp {
  // Global navigation hooks can be defined here
}
```

**Key improvements:**
- **Declarative routing**: Routes defined with decorators and configuration objects
- **Better lifecycle hooks**: `canLoad/loading` vs `canActivate/activate`, `canUnload/unloading` vs `canDeactivate/deactivate`
- **Type safety**: Full TypeScript support throughout
- **Lazy loading**: Built-in support for code splitting
- **Enhanced parameters**: Better access to route context and navigation state
- **Dynamic titles**: Easy to set page titles based on loaded data
{% endtab %}
{% endtabs %}

---

## Data Binding

Data binding has been enhanced with better performance, new features, and more intuitive syntax.

{% tabs %}
{% tab title="Aurelia 1" %}
```html
<template>
  <!-- Basic binding -->
  <input value.bind="name" />
  <input value.two-way="email" />
  <span textcontent.bind="message"></span>

  <!-- Event binding -->
  <button click.trigger="save()">Save</button>
  <button click.delegate="delete($event)">Delete</button>

  <!-- Class binding -->
  <div class="card ${isActive ? 'active' : ''}">Content</div>

  <!-- Style binding -->
  <div style="color: ${textColor}; background: ${bgColor}">Styled</div>

  <!-- Conditional rendering -->
  <div if.bind="showDetails">Details here</div>
  <div show.bind="isVisible">Visible content</div>

  <!-- Repeating -->
  <ul>
    <li repeat.for="item of items">${item.name}</li>
  </ul>

  <!-- Value converters -->
  <span>${date | dateFormat:'MM/dd/yyyy'}</span>
  <input value.bind="amount | number:'2.0-2'">

  <!-- Binding behaviors -->
  <input value.bind="query & debounce:500">
  <div scroll.bind="scrollPosition & throttle:100">
</template>
```

```typescript
// Computed properties needed @computedFrom
import { computedFrom } from 'aurelia-framework';

export class UserProfile {
  firstName: string;
  lastName: string;

  @computedFrom('firstName', 'lastName')
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
```html
<!-- Enhanced binding with new features -->

<!-- Basic binding - same as v1 -->
<input value.bind="name" />
<input value.two-way="email" />
<span textcontent.bind="message"></span>

<!-- Event binding - enhanced -->
<button click.trigger="save()">Save</button>
<!-- Event binding can now return functions -->
<button click.trigger="getClickHandler()">Dynamic Handler</button>

<!-- CSS class binding - much easier! -->
<div class="card" active.class="isActive" loading.class="isLoading">
  Content
</div>

<!-- Style binding - same syntax -->
<div style="color: ${textColor}; background: ${bgColor}">Styled</div>

<!-- Conditional rendering - same -->
<div if.bind="showDetails">Details here</div>
<div show.bind="isVisible">Visible content</div>

<!-- Lambda expressions in templates! -->
<ul>
  <li repeat.for="user of users.filter(u => u.isActive)">
    ${user.name}
  </li>
</ul>

<!-- Array method observation -->
<p>Total: ${items.reduce((sum, item) => sum + item.price, 0)}</p>

<!-- Value converters - same syntax -->
<span>${date | dateFormat:'MM/dd/yyyy'}</span>
<input value.bind="amount | number:'2.0-2'">

<!-- Binding behaviors - same syntax -->
<input value.bind="query & debounce:500">
<div scroll.bind="scrollPosition & throttle:100">

<!-- Enhanced ref binding -->
<input ref="emailInput" value.bind="email">
<custom-component component.ref="myComponent">
</custom-component>
```

```typescript
// Computed properties - no decorator needed!
export class UserProfile {
  firstName: string;
  lastName: string;

  // Automatically computed - Aurelia 2 figures it out
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  // Complex computations work automatically
  get filteredItems() {
    return this.items
      .filter(item => item.isActive)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
```

**Key improvements:**
- **`.class` binding**: Clean conditional CSS classes
- **Automatic computation**: No need for `@computedFrom` decorator
- **Lambda expressions**: Filter and transform data in templates
- **Better ref binding**: `component.ref` for accessing component instances
- **Function return in events**: Event handlers can return functions
{% endtab %}
{% endtabs %}

---

## What's New in Aurelia 2

Beyond the improvements to existing features, Aurelia 2 introduces several entirely new capabilities:

### Shadow DOM Support

```typescript
import { useShadowDOM } from '@aurelia/runtime-html';

@useShadowDOM({ mode: 'open' })
@customElement({
  name: 'isolated-component',
  template: '<div class="content"><slot></slot></div>',
  style: '.content { padding: 20px; color: blue; }' // Encapsulated styles!
})
export class IsolatedComponent {
  // Styles won't leak out, external styles won't leak in
}
```

### Custom Attribute Patterns

Create your own binding syntax!

```typescript
import { attributePattern } from '@aurelia/template-compiler';

// Enable Angular-like syntax: <input [disabled]="isDisabled">
@attributePattern({ pattern: '[PART]', symbols: '[]' })
export class AngularStyleBinding {
  ['[PART]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'to-view');
  }
}
```

### Enhanced Custom Elements

```typescript
import { customElement, processContent, viewResources } from '@aurelia/runtime-html';

@processContent((node, platform) => {
  // Transform template content at compile time
  const slots = node.querySelectorAll('template[slot]');
  // Process slots, add default content, etc.
  return true; // Continue processing
})
@customElement({
  name: 'enhanced-card',
  template: `
    <div class="card">
      <header class="card-header">
        <slot name="header">Default Header</slot>
      </header>
      <div class="card-body">
        <slot>Default Content</slot>
      </div>
    </div>
  `,
  style: `
    .card { border: 1px solid #ccc; border-radius: 4px; }
    .card-header { background: #f5f5f5; padding: 1rem; }
    .card-body { padding: 1rem; }
  `
})
export class EnhancedCard {
  // Advanced component features
}
```

### Watch Decorator for Advanced Observation

```typescript
import { watch } from '@aurelia/runtime-html';

export class SearchComponent {
  searchTerm: string = '';
  results: SearchResult[] = [];

  @watch('searchTerm')
  async searchTermChanged(newValue: string, oldValue: string) {
    if (newValue.length > 2) {
      this.results = await this.searchService.search(newValue);
    } else {
      this.results = [];
    }
  }
}
```

---

## Migration Checklist

Use this checklist to ensure you've covered all aspects of your migration:

### 🏗️ **Project Setup**
- [ ] Update HTML entry point (remove `aurelia-app`, add root component)
- [ ] Rewrite main.ts bootstrapping code
- [ ] Update package.json dependencies
- [ ] Configure bundler for Aurelia 2 (no `PLATFORM.moduleName` needed)
- [ ] Set up TypeScript configuration for better type checking

### 🧩 **Components**
- [ ] Convert `<require>` to `<import>` in templates
- [ ] Remove `<template>` wrappers (optional)
- [ ] Update component lifecycle hooks (`canActivate` → `canLoad`, etc.)
- [ ] Add CSS files with matching names for auto-loading
- [ ] Update any custom element/attribute decorators

### 🔗 **Data Binding**
- [ ] Replace complex class binding with `.class` syntax
- [ ] Remove `@computedFrom` decorators
- [ ] Test lambda expressions in templates
- [ ] Update any custom value converters or binding behaviors

### 🚦 **Routing**
- [ ] Convert router configuration to declarative `@route` syntax
- [ ] Update lifecycle hooks: `canActivate` → `canLoad`, `activate` → `loading`, etc.
- [ ] Update `<router-view>` to `<au-viewport>`
- [ ] Test navigation and parameter passing
- [ ] Update any router hooks/guards

### 💉 **Dependency Injection**
- [ ] Convert `@autoinject` to `resolve()` or `@inject()`
- [ ] Update service registration to use new `Registration` API
- [ ] Create interface tokens with `DI.createInterface()`
- [ ] Update resolver usage (`Lazy` → `lazy`, etc.)
- [ ] Test all dependency injection scenarios

### 📝 **Logging**
- [ ] Replace LogManager setup with LoggerConfiguration
- [ ] Convert custom appenders to sinks
- [ ] Update components to use injected ILogger
- [ ] Test logging output and configuration

### 🎨 **Templates and Features**
- [ ] Test all template binding scenarios
- [ ] Verify custom elements/attributes work correctly
- [ ] Update any template controllers
- [ ] Test conditionals, repeaters, and value converters
- [ ] Verify event binding and handling

### 🧪 **Testing**
- [ ] Update test setup for Aurelia 2
- [ ] Update component testing approach
- [ ] Test lifecycle hooks in test environment
- [ ] Verify dependency injection in tests
- [ ] Update any integration tests

### 🔧 **Advanced Features**
- [ ] Consider adding Shadow DOM where appropriate
- [ ] Implement any custom attribute patterns needed
- [ ] Set up enhanced state management if needed
- [ ] Add watch decorators for complex observation scenarios

---

## Conclusion

Migrating from Aurelia 1 to Aurelia 2 brings significant benefits: better performance, improved developer experience, enhanced type safety, and modern JavaScript features. While there are changes to learn, the core concepts remain familiar, and the improvements make building applications more enjoyable and maintainable.

The enhanced DI system, redesigned router, automatic observation, and new template features make Aurelia 2 a powerful platform for building modern web applications. Take your time with the migration, test thoroughly, and don't hesitate to leverage the new features that make development more productive.

Remember that Aurelia 2 maintains the same philosophy of convention over configuration and stays out of your way, while providing powerful tools when you need them. The migration effort will be rewarded with a more maintainable, performant, and developer-friendly application.

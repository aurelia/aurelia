# Cheat Sheet

## Cheat Sheet

A quick reference for different aspects of Aurelia with minimal explanation.

For routing-specific shortcuts go to the [router quick reference](../router/quick-reference.md); it distills the most common `@aurelia/router` recipes from this page and the deeper guides.

## Bootstrapping

### Simple

**src/main.ts**

```typescript
import { Aurelia } from 'aurelia';
import { AppRoot } from './app-root';

const app = new Aurelia();
await app.app({
  component: AppRoot,
  host: document.querySelector('app-root'),
}).start();
```

### Script tag (Vanilla JS)

Note: you can copy-paste the markup below into an html file and open it directly in the browser. There is no need for any tooling for this example.

**index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Aurelia 2 Script Example</title>
  
  <!-- Performance optimizations -->
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/aurelia@latest/+esm" crossorigin fetchpriority="high">
</head>
<body>
  <app-root></app-root>

  <script type="module">
    import { Aurelia, CustomElement } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';

    const AppRoot = CustomElement.define({
      name: 'app-root',
      template: '${message}',
    }, class {
      message = 'Hello world!';
    });

    new Aurelia().app({ component: AppRoot, host: document.querySelector('app-root') }).start();
  </script>
</body>
</html>
```

### Script tag (Vanilla JS - enhance)

Note: you can copy-paste the markup below into an html file and open it directly in the browser. There is no need for any tooling for this example.

**index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  
  <!-- Performance optimizations -->
  <link rel="dns-prefetch" href="//cdn.jsdelivr.net">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="modulepreload" href="https://cdn.jsdelivr.net/npm/aurelia@latest/+esm" crossorigin fetchpriority="high">
</head>
<body>
  ${message}
  <script type="module">
    import { Aurelia } from 'https://cdn.jsdelivr.net/npm/aurelia@latest/+esm';

    const aurelia = new Aurelia();
    await aurelia.enhance({ component: { message: 'Hello world!' }, host: document.body }).start();
    await aurelia.enhance({ component: { title: 'Aurelia' }, host: document.head }).start();
  </script>
</body>
</html>
```

### Multi-root

Note: the sample below mainly demonstrates stopping an existing instance of Aurelia and starting a new one with a different root and host. Do not consider this a complete example of a proper way to separate a private app root from public view, which is a topic of its own.

**src/main.ts**

```typescript
import { Aurelia } from 'aurelia';
import { LoginWall } from './login-wall';

const app = new Aurelia();
await app.app({
  component: LoginWall,
  host: document.querySelector('login-wall'),
}).start();
```

**src/login-wall.ts**

```typescript
import { Aurelia } from 'aurelia';
import { AppRoot } from './app-root';

export class LoginWall {
  constructor(private aurelia: Aurelia) {}

  async login() {
    await this.aurelia.stop();

    const newApp = new Aurelia();
    await newApp.app({
      component: AppRoot,
      host: document.querySelector('app-root'),
    }).start();
  }
}
```

### Advanced (low-level)

When you need more control over the wireup and/or want to override some of the defaults wrapped by the 'aurelia' package and/or maximize tree-shaking of unused parts of the framework:

```typescript
import { DI, Registration } from '@aurelia/kernel';
import {
  Aurelia,
  IPlatform,

  ITemplateCompilerRegistration,
  INodeObserverLocatorRegistration,

  DebounceBindingBehaviorRegistration,
  OneTimeBindingBehaviorRegistration,
  IfRegistration,
  ElseRegistration,
  RepeatRegistration,

  RefAttributePatternRegistration,
  DotSeparatedAttributePatternRegistration,

  DefaultBindingCommandRegistration,
  OneTimeBindingCommandRegistration,
  FromViewBindingCommandRegistration,
  ToViewBindingCommandRegistration,
  TwoWayBindingCommandRegistration,
  ForBindingCommandRegistration,
  TriggerBindingCommandRegistration,

  PropertyBindingRenderer,
  IteratorBindingRenderer,
  RefBindingRenderer,
  CustomElementRenderer,
  TemplateControllerRenderer,
  ListenerBindingRenderer,
  TextBindingRenderer,
} from '@aurelia/runtime-html';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { AppRoot } from './app-root';

const container = DI.createContainer();
container.register(
  Registration.instance(IPlatform, BrowserPlatform.getOrCreate(globalThis)),

  // Default framework components
  ITemplateCompilerRegistration,
  INodeObserverLocatorRegistration,

  // Commonly used framework resources (only a small selection)
  DebounceBindingBehaviorRegistration, // &debounce
  OneTimeBindingBehaviorRegistration, // &oneTime
  IfRegistration, // if (if.bind)
  ElseRegistration, // else
  RepeatRegistration, // repeat (repeat.for)

  // Aurelia binding syntax
  RefAttributePatternRegistration, // ref
  DotSeparatedAttributePatternRegistration, // target.command (e.g. value.two-way, if.bind)

  // Commonly used Aurelia binding commands (only a small selection)
  DefaultBindingCommandRegistration, // .bind
  OneTimeBindingCommandRegistration, // .one-time
  FromViewBindingCommandRegistration, // .from-view
  ToViewBindingCommandRegistration, // .to-view
  TwoWayBindingCommandRegistration, // .two-way
  ForBindingCommandRegistration, // .for
  TriggerBindingCommandRegistration, // .trigger

  // Commonly used Aurelia renderers (only a small selection)
  PropertyBindingRenderer, // .bind, .one-time, .to-view, .from-view, .two-way bindings
  IteratorBindingRenderer, // .for bindings
  RefBindingRenderer, // ref bindings
  CustomElementRenderer, // custom element hydration
  TemplateControllerRenderer, // template controller hydration (if, repeat)
  ListenerBindingRenderer, // .trigger, .capture bindings
  TextBindingRenderer, // ${} text bindings
);

await new Aurelia(container).app({
  component: AppRoot,
  host: document.querySelector('app-root'),
}).start();
```

## Custom elements

### With conventions

```typescript
import { bindable, IHttpClient, resolve } from 'aurelia';
export class ProductDetailCustomElement {
  static dependencies = [ImageViewerCustomElement, CurrencyValueConverter];
  static containerless = true;
  @bindable product: Product;
  readonly http: IHttpClient = resolve(IHttpClient);
}
```

### Without conventions

```typescript
import { customElement, bindable, IHttpClient, resolve } from 'aurelia';
import template from './product-detail.html';
@customElement({
  name: 'product-detail',
  template,
  dependencies: [ImageViewerCustomElement, CurrencyValueConverter],
  shadowOptions: { mode: 'open' },
})
export class ProductDetail {
  @bindable product: Product;
  readonly http: IHttpClient = resolve(IHttpClient);
}
```

### Vanilla JS

```typescript
import { CustomElement, IHttpClient } from 'aurelia';
export const ProductDetail = CustomElement.define({
  name: 'product-detail',
  template: '<div>...</div>',
  dependencies: [ImageViewerCustomElement, CurrencyValueConverter],
  shadowOptions: { mode: 'open' },
  bindables: ['product'],
}, class {
  static inject = [IHttpClient];
  constructor(http) { this.http = http; }
});
```

## Custom attributes

### With conventions

```typescript
import { bindable } from 'aurelia';
export class RippleCustomAttribute {
  @bindable color: string;
}
```

### Without conventions

```typescript
import { bindable, customAttribute } from 'aurelia';
@customAttribute('ripple')
export class Ripple {
  @bindable color: string;
}
```

### Vanilla JS

```typescript
import { CustomAttribute } from 'aurelia';
export const Ripple = CustomAttribute.define({
  name: 'ripple',
  bindables: ['color'],
}, class {

});
```

## Template controllers

### With conventions

```typescript
import { IViewFactory, IRenderLocation, ISyntheticView, resolve } from 'aurelia';
export class NoopTemplateController {
  view: ISyntheticView = resolve(IViewFactory)
    .create()
    .setLocation(resolve(IRenderLocation));
}
```

### Without conventions

```typescript
import { templateController, IViewFactory, IRenderLocation, ISyntheticView, resolve } from 'aurelia';
@templateController('noop')
export class Noop {
  view: ISyntheticView = resolve(IViewFactory)
    .create()
    .setLocation(resolve(IRenderLocation));
}
```

### Vanilla JS

```typescript
import { CustomAttribute, IViewFactory, IRenderLocation } from 'aurelia';
export const Noop = CustomAttribute.define({
  name: 'noop',
  isTemplateController: true,
}, class {
  static inject = [IViewFactory, IRenderLocation];
  constructor(factory, location) {
    this.view = factory.create().setLocation(location);
  }
});
```

## Binding behaviors

### With conventions

```typescript
import { ILogger, resolve } from 'aurelia';
export class LogBindingBehavior {
  constructor(
    readonly logger: ILogger = resolve(ILogger),
  ) {}
  bind(...args) {
    this.logger.debug('bind', ...args);
  }
  unbind(...args) {
    this.logger.debug('unbind', ...args);
  }
}
```

### Without conventions

```typescript
import { ILogger, bindingBehavior, resolve } from 'aurelia';
@bindingBehavior('log')
export class Log {
  constructor(
    readonly logger: ILogger = resolve(ILogger),
  ) {}
  bind(...args) {
    this.logger.debug('bind', ...args);
  }
  unbind(...args) {
    this.logger.debug('unbind', ...args);
  }
}
```

### Vanilla JS

```typescript
import { ILogger, BindingBehavior } from 'aurelia';
export const Log = BindingBehavior.define({
  name: 'log',
}, class {
  static inject = [ILogger];
  constructor(logger) { this.logger = logger; }
  bind(...args) {
    this.logger.debug('bind', ...args);
  }
  unbind(...args) {
    this.logger.debug('unbind', ...args);
  }
});
```

## Value converters

### With conventions

```typescript
export class JsonValueConverter {
  toView(value) {
    return JSON.stringify(value);
  }
}
```

### Without conventions

```typescript
import { valueConverter } from 'aurelia';
@valueConverter('json')
export class Json {
  toView(value) {
    return JSON.stringify(value);
  }
}
```

### Vanilla JS

```typescript
import { ValueConverter } from 'aurelia';
export const Json = ValueConverter.define({
  name: 'json',
}, class {
  toView(value) {
    return JSON.stringify(value);
  }
});
```

## Attribute patterns

```typescript
import { attributePattern, AttrSyntax } from '@aurelia/template-compiler';

@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class BananaInBox {
  '[(PART)]'(rawName: string, rawValue: string, parts: readonly string[]): AttrSyntax {
    return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
  }
}
```

## Binding commands / instruction renderer

## CSS Classes & Styles

```html
<!-- Dynamic classes -->
<div class="base-class" class.bind="dynamicClass">
<div class="nav-item" active.class="isActive">
<div class.bind="isSelected ? 'selected' : 'normal'">

<!-- Dynamic styles -->
<div style.bind="{ color: textColor, fontSize: size + 'px' }">
<div background-color.style="bgColor">
<div style.bind="`width: ${width}px; height: ${height}px`">
```

## Observable Properties

```typescript
import { observable } from '@aurelia/runtime';

export class MyComponent {
  @observable searchText = '';
  @observable selectedItem = null;

  // Automatically called when searchText changes
  searchTextChanged(newValue, oldValue) {
    this.filterItems(newValue);
  }

  // Automatically called when selectedItem changes  
  selectedItemChanged(newItem) {
    if (newItem) {
      this.onItemSelected(newItem);
    }
  }
}
```

## Templating syntax

```html
<!-- Render the 'firstName' and 'lastName' properties interpolated with some static text (reactive) -->
<div>Hello, ${firstName} ${lastName}</div>
<!-- Render the 'bgColor' property as a class name, interpolated with some static text (reactive) -->
<div class="col-md-4 bg-${bgColor}">

<!-- Bind the `someProp` property of the declaring component to the `prop` property of the declared component -->
<my-component prop.bind="someProp">
<!-- prop.bind is shorthand for prop.bind="prop" (when attr value is omitted, the left side of the dot is used as the value) -->
<my-component prop.bind>
<!-- This is another flavor of interpolation but in normal JS syntax, using .bind -->
<div class.bind="`col-md-4 bg-${bgColor}`">
<!-- Conditionally add the 'active' class (the "old-fashioned" way) -->
<li class="isActive ? 'active' : ''">
<!-- Conditionally add the 'active' class (the cleaner way) -->
<li active.class="isActive">
<!-- Bind to the 'style' attribute (the "old-fashioned" way) -->
<li style="background: ${bg}">
<!-- Bind to the 'style' attribute (the cleaner way) -->
<li background.style="bg">
<!-- Listen to the 'blur' event using a direct event listener on the element -->
<input blur.trigger="onBlur()">
<!-- Listen to the 'click' event using a event listener (only works with bubbling events) -->
<button click.trigger="onClick()">
<!-- Directly work with the event using the `$event` magic property -->
<form submit.trigger="$event.preventDefault()">
<!-- Set this html element to the 'nameInput' property on the declaring component -->
<input ref="nameInput">
<!-- Set the component instance of this <my-component> custom element
     to the 'myComponentViewModel' property on the declaring component -->
<my-component component.ref="myComponentViewModel">
<!-- Automatic two-way binding to an input (convention, equivalent to value.two-way) -->
<input value.bind="name">
<!-- Manual two-way binding to an input -->
<input value.to-view="name" change.trigger="handleNameChange($event.target.value)">

<!-- Debounce the notification when input value change for 200ms -->
<input value.bind="name & debounce">
<!-- Debounce the notification when input value change for 500ms -->
<input value.bind="name & debounce:500">
<!-- Throttle the notification when input value change for 200ms -->
<input value.bind="name & throttle">
<!-- Throttle the notification when input value change for 500ms -->
<input value.bind="name & throttle:500">

<!-- Render the 'message' property (non-reactive) -->
<div>${message & oneTime}</div>
<!-- Render the 'message' property (when the 'update' signal is sent manually) -->
<div>${message & signal:'update'}</div>
<!-- Render the 'timestamp' property formatted by the 'formatDate' ValueConverter -->
<div>${timestamp | formatDate}</div>
```

## Built-in custom attributes & template controllers (AKA directives)

```html
<!-- Conditionally render this nav-link (element is not created and will not exist in DOM if false) -->
<nav-link if.bind="isLoggedIn">
<!-- Conditionally display this nav-link (element is only hidden via CSS if false, and will always be created and exist in DOM) -->
<nav-link show.bind="isLoggedIn">
<!-- Conditionally hide this nav-link (element is only hidden via CSS if true, and will always be created and exist in DOM) -->
<nav-link hide.bind="isAnonymous">
<!-- Conditionally render one thing or the other -->
<p if.bind="product.stockQty > 0">${product.stockQty}</p>
<p else>Out of stock!</p>
<!-- Conditionally render one or more out of several things based on a condition -->
<template switch.bind="status">
  <span case="received">Order received.</span>
  <span case="dispatched">On the way.</span>
  <span case="processing">Processing your order.</span>
  <span case="delivered">Delivered.</span>
</template>
<!-- Render a list of items -->
<div repeat.for="item of items">${item}</div>
<!-- Render something on a different location in the DOM -->
<modal-dialog portal="app-root">
<!-- Create a slot for content projection -->
<my-component>
  <div au-slot="header">Header content</div>
  <div au-slot="footer">Footer content</div>
  <div au-slot>Default slot content</div>
</my-component>
<!-- Create a new binding scope with a specific object -->
<div with.bind="user">
  <p>${firstName} ${lastName}</p>
  <p>${email}</p>
</div>
```


## Lifecycle hooks

### Migrating from v1

* Rename `bind` to `binding`
  * If you had timing issues in `bind` and used the `queueMicroTask` to add some delay (or used `attached` for things that really _should_ be in `bind`), you could try using `bound` instead (and remove the `queueMicroTask`). This hook was added to address some edge cases where you need information that's not yet available in `bind`, such as `from-view` bindings and `ref`s.
  * If you used `CompositionTransaction` in the `bind` hook to await async work, you can remove that and simply return a promise (or use `async`/`await`) in `binding` instead. The promise will be awaited by the framework before rendering the component or binding and of its children.
* Rename `attached` to `attaching`
  * If you had timing issues in `attached` and used `queueMicroTask` or even `queueTask` to add some delay, you can probably remove the `queueMicroTask` / `queueTask` and keep your logic in the `attached` hook. Where `attaching` is the new "called as soon as _this_ thing is added to the DOM", `attached` now runs much later than it did in v1 and guarantees that all child components have been attached as well.
* Rename `unbind` to `unbinding` (there is no `unbound`)
* Rename `detached` to `detaching` (there is no more `detached`)
  * If you _really_ need to run logic _after_ the component is removed from the DOM, use `unbinding` instead.
* If you need the `owningView`, consider the interface shown below: what was "view" in v1 is now called "controller", and what was called "owningView" in v1 is now called "parentController" (or simply parent in this case). You can inject it via DI using `resolve(IController)`, therefore it's no longer passed-in as an argument to `created`.

### The view model interfaces

You can import and implement these in your components as a type-checking aid, but this is optional.

```typescript
interface ICustomElementViewModel {
  define(
    controller: IDryCustomElementController,
    parentContainer: IContainer,
    definition: CustomElementDefinition): PartialCustomElementDefinition | void
  hydrating(controller: IContextualCustomElementController): void;
  hydrated(controller: ICompiledCustomElementController): void;
  created(controller: ICustomElementController): void;

  binding(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void>;
  bound(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void>;
  attaching(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void>;
  attached(initiator: IHydratedController): void | Promise<void>;

  detaching(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void>;
  unbinding(initiator: IHydratedController, parent: IHydratedController | null): void | Promise<void>;

  dispose(): void;

  accept(visitor: ControllerVisitor): void | true;
}

interface ICustomAttributeViewModel {
  link(
    flags: LifecycleFlags,
    controller: IHydratableController,
    childController: ICustomAttributeController,
    target: INode,
    instruction: Instruction): void;
  created(controller: ICustomAttributeController): void;

  binding(initiator: IHydratedController, parent: IHydratedController): void | Promise<void>;
  bound(initiator: IHydratedController, parent: IHydratedController): void | Promise<void>;
  attaching(initiator: IHydratedController, parent: IHydratedController): void | Promise<void>;
  attached(initiator: IHydratedController): void | Promise<void>;

  detaching(initiator: IHydratedController, parent: IHydratedController): void | Promise<void>;
  unbinding(initiator: IHydratedController, parent: IHydratedController): void | Promise<void>;

  dispose(): void;

  accept(visitor: ControllerVisitor): void | true;
}

interface IRouteViewModel extends ICustomElementViewModel {
  canLoad(
    params: Params,
    next: RouteNode,
    current: RouteNode | null): boolean | NavigationInstruction | NavigationInstruction[] | Promise<boolean | NavigationInstruction | NavigationInstruction[]>;
  loading(
    params: Params,
    next: RouteNode,
    current: RouteNode | null): void | Promise<void>;
  canUnload(
    next: RouteNode | null,
    current: RouteNode): boolean | Promise<boolean>;
  unload(
    next: RouteNode | null,
    current: RouteNode): void | Promise<void>;
}
```

## Dependency Injection

### Migrating from v1

Most stuff from v1 will still work as-is, but we do recommend that you consider using `DI.createInterface` liberally to create injection tokens, both within your app as well as when authoring plugins.

Consumers can use these as either parameter decorators or as direct values to `.get(...)` / `static inject = [...]`.

The benefit of parameter decorators is that they also work in Vanilla JS with babel and will work natively in browsers (without any tooling) once they implement them.

They are, therefore, generally the more forward-compatible and consumer-friendly option.

### Creating an interface

Note: this is a multi-purpose "injection token" that can be used as a plain value (also in VanillaJS) or as a parameter decorator (in TypeScript only)

#### Strongly-typed with default

Useful when you want the parameter decorator and don't need the interface itself.

```typescript
export class ApiClient {
  async getProducts(filter) { /* ... */ }
}
export interface IApiClient extends ApiClient {}
export const IApiClient = DI.createInterface<IApiClient>('IApiClient', x => x.singleton(ApiClient));
```

#### No default (more loosely coupled)

```typescript
export interface IApiClient {
  getProducts(filter): Promise<Product[]>;
}
export const IApiClient = DI.createInterface<IApiClient>('IApiClient');

// Needs to be explicitly registered with the container when no default is provided
container.register(Registration.singleton(IApiClient, ApiClient));
```

### Injecting an interface

```typescript
// Note: in the future there will be a convention where the decorator is no longer necessary with interfaces
export class MyComponent {
  private api: IApiClient = resolve(IApiClient);
}
// Once the convention is in place:
export class MyComponent {
  constructor(private api: IApiClient) {}
}
```

### Registration types

#### Creating resolvers explicitly

This is more loosely coupled (keys can be declared independently of their implementations) but results in more boilerplate. More typical for plugins that want to allow effective tree-shaking, and less typical in apps.

These can be provided directly to e.g. `au.register(dep1, dep2)` as global dependencies (available in all components) or to the `static dependencies = [dep1, dep1]` of components as local dependencies.

```typescript
Registration.singleton(key, SomeClass); // Single container-wide instance
Registration.transient(key, SomeClass); // New instance per injection
Registration.callback(key, (container) => /* some factory fn */); // Callback invoked each time
Registration.cachedCallback(key, (container) => /* some factory fn */); // Callback invoked only once and then cached
Registration.aliasTo(originalKey, aliasKey);
Registration.instance(key, someInstance);
```

#### Decorating classes

```typescript
// Registers in the root container
@singleton
export class SomeClass {}

// Registers in the requesting container
@singleton({ scoped: true })
export class SomeClass {}

@transient
export class SomeClass {}
```

### Customizing injection

```typescript
export class MyLogger {
  // Resolve all dependencies associated with a key (zero to many)
  private sinks: ISink[] = resolve(all(ISink));
}

export class MyComponent {
  // Resolve a factory function that returns the dependency when called
  private getFoo: () => IFoo = resolve(lazy(IFoo));

  doStuff() {
    const foo = this.getFoo();
  }
}

export class MyComponent {
  // Explicitly opt-out of DI for one or more parameters (if default parameters must be respected)
  constructor(@ignore private name: string = 'my-component') {}
}

export class MyComponent {
  // Yield undefined (instead of throwing) if no registration exists
  private foo: IFoo = resolve(optional(IFoo));
}

export class MyComponent {
  // Explicitly create a new instance, even if the key is already registered as a singleton
  private foo: IFoo = resolve(newInstanceOf(IFoo));
}

// Extend Window type for custom added properties or e.g. third party libraries like Redux DevTools which do so, yet inject the actual window object
export interface IReduxDevTools extends Window {
  devToolsExtension?: DevToolsExtension;
  __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension;
}

export class MyComponent {
  // Note that the type itself is not responsible for resolving the proper key but the decorator
  private window: IReduxDevTools = resolve(IWindow);
}
```

### Using lifecycle hooks in a non-blocking fashion but keeping things awaitable

#### Example that blocks rendering (but is simplest to develop)

```html
<div>${data}</div>
```

```typescript
export class MyComponent {
  async loading(params) {
    this.data = await loadData(params.id);
  }
}
```

#### Example that does not block rendering and avoids race conditions (without task queue)

```html
<div if.bind="loadDataPromise">Loading...</div>
<div else>...</div>
```

```typescript
export class MyComponent {
  loading(params) {
    this.loadDataPromise = loadData(params.id).then(data => {
      this.data = data;
      this.loadDataPromise = null;
    });
  }
  unload() {
    return this.loadDataPromise;
  }
}
```

#### Example that does not block rendering and avoids race conditions (_with_ task queue)

```html
<div if.bind="loadDataTask">Loading...</div>
<div else>...</div>
```

```typescript
import { resolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';

export class MyComponent {
  private readonly platform = resolve(IPlatform);

  loading(params) {
    this.loadDataTask = this.platform.taskQueue.queueTask(async () => {
      this.data = await loadData(params.id);
      this.loadDataTask = null;
    });
  }
}
```

**Apply the practices above consistently, and you'll reap the benefits**:

```typescript
import { resolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';

// Await all pending tasks (useful in unit, integration and e2e tests)
const platform = resolve(IPlatform);
await Promise.all([
  platform.taskQueue.yield(),
  platform.domQueue.yield(),
]);
```

In the future, time-slicing will be enabled via these TaskQueue APIs as well, which will allow you to easily chunk work that's been dispatched via the task queues.

## Router & Navigation

### Route Configuration

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter, route } from '@aurelia/router';

@route({
  routes: [
    { path: '', component: () => import('./home'), title: 'Home' },
    { path: '/products/:id', component: () => import('./product-detail'), title: 'Product' },
    { path: '/about', component: () => import('./about'), title: 'About' },
  ]
})
export class AppRoot {
  constructor(private router: IRouter = resolve(IRouter)) {}
}
```

### Navigation

```typescript
import { resolve } from '@aurelia/kernel';

export class MyComponent {
  constructor(private router: IRouter = resolve(IRouter)) {}

  // Navigate to a route
  goToProduct(id: string) {
    this.router.load('/products/' + id);
  }

  // Navigate with parameters
  goToProductWithQuery(id: string) {
    this.router.load('/products/' + id + '?tab=reviews');
  }

  // Check if route is active
  isActive(path: string): boolean {
    return this.router.isActive(path);
  }
}
```

### Router Viewports

```html
<!-- Default viewport -->
<au-viewport></au-viewport>

<!-- Named viewport -->
<au-viewport name="sidebar"></au-viewport>

<!-- Multiple viewports -->
<au-viewport name="main"></au-viewport>
<au-viewport name="aside"></au-viewport>
```

### Router Links in Templates

```html
<!-- Basic router link -->
<a href="/products">Products</a>

<!-- Router link with parameters -->
<a href="/products/${product.id}">View Product</a>

<!-- Active class styling -->
<a href="/products" class="${router.isActive('/products') ? 'active' : ''}">Products</a>
```

## Validation

### Basic Validation Rules

```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';

export class UserForm {
  name: string = '';
  email: string = '';
  age: number = 0;

  private readonly validationRules = resolve(IValidationRules);

  constructor() {
    this.validationRules
      .on(this)
      .ensure('name')
        .required()
        .minLength(2)
        .maxLength(50)
      .ensure('email')
        .required()
        .email()
      .ensure('age')
        .required()
        .min(18)
        .max(120);
  }
}
```

### Validation Controller

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

export class UserForm {
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  async submit() {
    const result = await this.validationController.validate();
    if (result.valid) {
      // Submit form
    }
  }
}
```

### Template Validation Display

```html
<form>
  <input type="text" value.bind="name">
  <div class="error" repeat.for="error of validationController.errors">
    <span if.bind="error.propertyName === 'name'">${error.message}</span>
  </div>

  <button type="submit" click.trigger="submit()">Submit</button>
</form>
```

## Animation

### CSS Animations

```typescript
import { AnimationEvent } from '@aurelia/runtime-html';

export class FadeInOut {
  enter(element: Element): void {
    element.classList.add('fade-in');
  }

  leave(element: Element): Promise<void> {
    return new Promise(resolve => {
      element.classList.add('fade-out');
      element.addEventListener('animationend', () => resolve(), { once: true });
    });
  }
}
```

### Web Animations API

```typescript
export class SlideAnimation {
  enter(element: Element): Animation {
    return element.animate([
      { transform: 'translateX(-100%)' },
      { transform: 'translateX(0)' }
    ], {
      duration: 300,
      easing: 'ease-out'
    });
  }

  leave(element: Element): Animation {
    return element.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(100%)' }
    ], {
      duration: 300,
      easing: 'ease-in'
    });
  }
}
```

### Router Transition Animations

```typescript
@route({
  routes: [
    {
      path: '/page1',
      component: () => import('./page1'),
      transitionPlan: {
        enter: 'slide-in-right',
        leave: 'slide-out-left'
      }
    }
  ]
})
export class AppRoot {}
```

### Programmatic Animations

```typescript
export class MyComponent {
  async animateElement() {
    const element = document.querySelector('.my-element');
    await element.animate([
      { opacity: 0, transform: 'scale(0.5)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 500 }).finished;
  }
}
```

## UI Composition

### au-compose

```html
<!-- Compose with component -->
<au-compose component.bind="MyComponent" model.bind="data"></au-compose>

<!-- Compose with view-model -->
<au-compose view-model.bind="viewModel" model.bind="data"></au-compose>

<!-- Compose with template -->
<au-compose template.bind="htmlTemplate" model.bind="data"></au-compose>
```

### Programmatic Composition

```typescript
import { ICompositionRoot } from '@aurelia/runtime-html';

export class MyComponent {
  constructor(private compositionRoot: ICompositionRoot = resolve(ICompositionRoot)) {}

  async composeComponent() {
    const composition = await this.compositionRoot.compose({
      component: MyDynamicComponent,
      host: this.containerElement,
      model: { data: 'example' }
    });

    return composition;
  }
}
```

## Synthetic Views

### Creating Synthetic Views

```typescript
import { IViewFactory, IRenderLocation, ISyntheticView } from '@aurelia/runtime-html';

export class MyComponent {
  constructor(
    private viewFactory: IViewFactory = resolve(IViewFactory),
    private renderLocation: IRenderLocation = resolve(IRenderLocation)
  ) {}

  createView(): ISyntheticView {
    const view = this.viewFactory
      .create()
      .setLocation(this.renderLocation);

    view.activate(this, null);
    return view;
  }
}
```

### Template Controllers with Synthetic Views

```typescript
import { templateController, IViewFactory, IRenderLocation } from '@aurelia/runtime-html';

@templateController('my-repeat')
export class MyRepeat {
  items: any[] = [];

  constructor(
    private viewFactory: IViewFactory = resolve(IViewFactory),
    private renderLocation: IRenderLocation = resolve(IRenderLocation)
  ) {}

  itemsChanged() {
    // Create views for each item
    this.items.forEach(item => {
      const view = this.viewFactory.create().setLocation(this.renderLocation);
      view.activate(item, null);
    });
  }
}
```

## Shadow DOM & Slots

### Shadow DOM Setup

```typescript
@customElement({
  name: 'my-card',
  template: `
    <div class="card">
      <div class="header">
        <au-slot name="header">Default Header</au-slot>
      </div>
      <div class="content">
        <au-slot>Default Content</au-slot>
      </div>
    </div>
  `,
  shadowOptions: { mode: 'open' }
})
export class MyCard {}
```

### Using Slots

```html
<my-card>
  <div au-slot="header">
    <h2>Custom Header</h2>
  </div>
  <div au-slot>
    <p>Custom content goes here</p>
  </div>
</my-card>
```

### Replaceable Parts

```typescript
@customElement({
  name: 'data-table',
  template: `
    <table>
      <thead>
        <tr>
          <th repeat.for="column of columns">
            <au-slot name="header" model.bind="column">
              ${column.title}
            </au-slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr repeat.for="row of rows">
          <td repeat.for="column of columns">
            <au-slot name="cell" model.bind="{ row, column }">
              ${row[column.key]}
            </au-slot>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class DataTable {
  @bindable columns: Column[] = [];
  @bindable rows: any[] = [];
}
```

## UI Virtualization

### Virtual Repeat

```html
<!-- Basic virtual repeat -->
<div virtual-repeat.for="item of items" style="height: 50px;">
  ${item.name}
</div>

<!-- Virtual repeat with custom item height -->
<div virtual-repeat.for="item of items" item-height="75">
  <div class="item">${item.name}</div>
</div>
```

### Virtual Repeat Configuration

```typescript
export class VirtualList {
  items: any[] = [];

  // Configure virtual repeat
  virtualRepeatConfig = {
    itemHeight: 60,
    bufferSize: 10,
    scrollingEnabled: true
  };
}
```

```html
<div virtual-repeat.for="item of items"
     item-height.bind="virtualRepeatConfig.itemHeight"
     buffer-size.bind="virtualRepeatConfig.bufferSize">
  ${item.name}
</div>
```

## Testing

### Component Testing

```typescript
import { TestContext } from '@aurelia/testing';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('should render correctly', async () => {
    const { startPromise, tearDown, component } = TestContext.create(
      '<my-component name.bind="name"></my-component>',
      MyComponent,
      { name: 'Test' }
    );

    await startPromise;

    expect(component.name).toBe('Test');

    await tearDown();
  });
});
```

### Integration Testing

```typescript
import { TestContext } from '@aurelia/testing';
import { AppRoot } from './app-root';

describe('App Integration', () => {
  it('should navigate between routes', async () => {
    const { startPromise, tearDown, app } = TestContext.create(
      '<app-root></app-root>',
      AppRoot
    );

    await startPromise;

    // Test navigation
    const router = app.container.get(IRouter);
    await router.load('/products');

    expect(router.isActive('/products')).toBe(true);

    await tearDown();
  });
});
```

## Internationalization (i18n)

### Basic Setup

```typescript
import { I18N } from '@aurelia/i18n';

export class MyComponent {
  constructor(private i18n: I18N = resolve(I18N)) {}

  created() {
    this.i18n.setLocale('en');
  }
}
```

### Template Usage

```html
<!-- Simple translation -->
<p>${'hello' | t}</p>

<!-- Translation with parameters -->
<p>${'welcome' | t: { name: user.name }}</p>

<!-- Translation with attributes -->
<input type="text" placeholder="${'enter_name' | t}">

<!-- Date/number formatting -->
<p>${date | df}</p>
<p>${amount | nf}</p>
```

### Programmatic Usage

```typescript
export class MyComponent {
  constructor(private i18n: I18N = resolve(I18N)) {}

  getTranslation() {
    const message = this.i18n.tr('hello');
    const parameterized = this.i18n.tr('welcome', { name: 'John' });
    return { message, parameterized };
  }

  changeLanguage(locale: string) {
    this.i18n.setLocale(locale);
  }
}
```

## State Management

### Observable State

```typescript
import { observable } from '@aurelia/runtime';

export class AppState {
  @observable user: User | null = null;
  @observable isLoading: boolean = false;
  @observable items: Item[] = [];

  userChanged(newUser: User | null) {
    // React to user changes
    console.log('User changed:', newUser);
  }
}
```

### Store Pattern

```typescript
import { resolve, IEventAggregator } from '@aurelia/kernel';

export class UserStore {
  private users: User[] = [];

  constructor(private eventAggregator: IEventAggregator = resolve(IEventAggregator)) {}

  async loadUsers() {
    this.users = await this.userService.getUsers();
    this.eventAggregator.publish('users:loaded', this.users);
  }

  addUser(user: User) {
    this.users.push(user);
    this.eventAggregator.publish('user:added', user);
  }

  getUsers(): User[] {
    return [...this.users];
  }
}
```

```typescript
import { resolve, IEventAggregator } from '@aurelia/kernel';

export class UserList {
  users: User[] = [];

  constructor(
    private userStore: UserStore = resolve(UserStore),
    private eventAggregator: IEventAggregator = resolve(IEventAggregator)
  ) {}

  binding() {
    this.users = this.userStore.getUsers();
    this.eventAggregator.subscribe('users:loaded', (users: User[]) => {
      this.users = users;
    });
  }
}
```

## Dialog & Modal

### Dialog Setup

```typescript
import { IDialogService } from '@aurelia/dialog';

export class MyComponent {
  constructor(private dialogService: IDialogService = resolve(IDialogService)) {}

  async openDialog() {
    const result = await this.dialogService.open({
      component: () => import('./my-dialog'),
      model: { title: 'Confirm Action' }
    });

    if (!result.wasCancelled) {
      console.log('Dialog result:', result.output);
    }
  }
}
```

### Dialog Component

```typescript
import { IDialogController } from '@aurelia/dialog';

@customElement({
  name: 'my-dialog',
  template: `
    <div class="dialog">
      <h2>\${model.title}</h2>
      <p>Are you sure you want to continue?</p>
      <button click.trigger="cancel()">Cancel</button>
      <button click.trigger="confirm()">Confirm</button>
    </div>
  `
})
export class MyDialog {
  constructor(private controller: IDialogController = resolve(IDialogController)) {}

  activate(model: any) {
    this.model = model;
  }

  cancel() {
    this.controller.cancel();
  }

  confirm() {
    this.controller.ok('confirmed');
  }
}
```

## HTTP Client

### Basic Setup

```typescript
import { resolve } from '@aurelia/kernel';
import { IHttpClient } from '@aurelia/fetch-client';

export class ApiService {
  constructor(private http: IHttpClient = resolve(IHttpClient)) {}

  async getUsers(): Promise<User[]> {
    const response = await this.http.fetch('/api/users');
    return response.json();
  }

  async createUser(user: User): Promise<User> {
    const response = await this.http.fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
}
```

### Service Usage

```typescript
export class UserManager {
  users: User[] = [];

  constructor(private apiService: ApiService = resolve(ApiService)) {}

  async loadUsers() {
    try {
      this.users = await this.apiService.getUsers();
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }

  async addUser(userData: Partial<User>) {
    try {
      const newUser = await this.apiService.createUser(userData as User);
      this.users.push(newUser);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }
}
```

### HTTP Client Configuration

```typescript
import { HttpClientConfiguration } from '@aurelia/fetch-client';

export const HttpConfig = {
  register(container: IContainer) {
    container.register(
      HttpClientConfiguration.customize(config => {
        config
          .useStandardConfiguration()
          .withBaseUrl('/api')
          .withDefaults({
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })
          .withInterceptor({
            request(request) {
              console.log('Request:', request);
              return request;
            },
            response(response) {
              console.log('Response:', response);
              return response;
            }
          });
      })
    );
  }
};
```

## Integration (plugins, shared components, etc)

### Migrating from v1

One of the biggest differences compared to Aurelia v1 is the way integrations work.

In v1, you would have a `configure` function like so:

**index.ts** (producer)

```typescript
export function configure(config: FrameworkConfiguration) {
  config.globalResources(['./my-component', './my-component-2']);
}
```

Which would then be consumed as either a `plugin` or a `feature` like so:

**main.ts** (consumer)

#### consumer

```typescript
aurelia.use.plugin('producer');
// or
aurelia.use.feature('./producer');
```

In v2 the string-based conventions are no longer a thing. We use native ES modules now. And there are no more different APIs for resources, plugins and features. Instead, everything is a dependency that can be registered to a container, its behavior may be altered by specific metadata that's added by framework decorators.

The most literal translation from v1 to v2 of the above, would be as follows:

**index.ts** (producer)

```typescript
import { MyComponent } from './my-component';
import { MyComponent2 } from './my-component-2';
export const Producer = {
  register(container: IContainer) {
    container.register(MyComponent, MyComponent2);
  },
};
```

**main.ts** (consumer)

#### consumer

```typescript
au.register(Producer);
```

### The `register` method

In Aurelia v2, everything (including the framework itself) is glued together via DI. The concept is largely the same whether you're building a plugin, a shared component or a service class.

The producer (or the `export`ing side) exposes an object with a `register` method, and the consumer (the `import`ing side) passes that object into its `au.register` call (for global registration) or into the `dependencies` array of a custom element (for local registration).

The DI container calls that `register` method and passes itself in as the only argument. The producer can then register resources / components / tasks to that container. Internally, things like resources and tasks have special metadata associated with them which allows the framework to discover and consume them at the appropriate times.

Below are some examples of how integrations can be produced and consumed:

#### 1.1 Simple object literal with a register method

**index.ts** (producer)

```typescript
export const MyPluginConfiguration = {
  register(container: IContainer) {
    container.register(
      ...PluginResources,
      ...PluginComponents,
    );
  },
};
```

**main.ts** (consumer)

```typescript
import { Aurelia } from 'aurelia';

new Aurelia().register(MyPluginConfiguration).app(...);
```

#### 1.2 A function that returns an object literal with a register method (to pass in e.g. plugin options)

**index.ts** (producer)

```typescript
function configure(container: IContainer, config: MyPluginConfig) {
  switch (config.storageType) {
    case 'localStorage':
      container.register(LocalStorageProvider);
      break;
    case 'indexedDB':
    default:
      container.register(IndexedDBProvider);
      break;
  }
}
export const MyPluginConfiguration = {
  register(container: IContainer) {
    configure(container, MyPluginConfig.DEFAULT);
  },
  customize(config: MyPluginConfig) {
    return {
      register(container: IContainer) {
        configure(container, config);
      },
    };
  },
};
```

**main.ts** (consumer)

```typescript
import { Aurelia } from 'aurelia';

new Aurelia().register(MyPluginConfiguration).app(...);
// OR
new Aurelia().register(MyPluginConfiguration.customize({ storageType: 'localStorage' })).app(...)
```

#### 1.3 An interface

**index.ts** (producer)

```typescript
export const IStorageClient = DI.createInterface<IStorageClient>('IStorageClient', x => x.singleton(LocalStorageClient));
```

Interfaces and classes do not need to be registered explicitly. They can immediately be injected. The container will "jit register" them the first time they are requested.

#### 1.4 A class (typically a resource)

**index.ts** (producer)

```typescript
@customElement({ name: 'name-tag', template: `<span>\${name}</span>` })
export class NameTag {}
```

**main.ts** (consumer)

To register it as a global resource (available in all components)

```typescript
import { Aurelia } from 'aurelia';

new Aurelia().register(NameTag).app(...);
```

OR:

**name-list.ts** (consumer)

To register it as a local resource (available only in that specific custom element)

```typescript
export class NameListCustomElement {
  static dependencies = [NameTag];
}
// OR
@customElement({ ..., dependencies: [NameTag] })
export class NameListCustomElement {}
```

#### 1.5 A (module-like) object with any of the above as its properties

**resources/index.ts** (producer)

```typescript
export * from './my-button';
export * from './my-input';
export * from './my-nav';
```

**main.ts** (consumer)

```typescript
import { Aurelia } from 'aurelia';
import * as GlobalResources from './resources';

new Aurelia().register(GlobalResources).app(...);
```

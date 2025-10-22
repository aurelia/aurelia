# Migrating to Aurelia 2

Aurelia 2 is a complete rewrite of Aurelia that shares many of the same loved and familiar features of Aurelia 1. Understandably, in the spirit of progress, not everything is the same. In this section, we are going to guide you through what has changed and how you can migrate over your Aurelia 1 applications to Aurelia 2.

## MIGRATION WORKFLOW

### Option 1: Quick Start with Compat Package (Recommended for Initial Migration)

The fastest way to get your AU1 application running in AU2 is to use the compatibility package. This approach lets you get a working AU2 application first, then gradually migrate features.

**Step 1: Create a new AU2 project**
```bash
npx makes aurelia new-project
cd new-project
npm install @aurelia/compat-v1
```

**Step 2: Copy your AU1 source files**
- Copy your `src/` directory from your AU1 project
- Copy any custom configuration files (excluding `aurelia_project/`)

**Step 3: Update your main.ts**
```typescript
import { Aurelia } from 'aurelia';
import { compatRegistration } from '@aurelia/compat-v1';
import { MyApp } from './my-app';

Aurelia
  .register(compatRegistration)
  .app(MyApp)
  .start();
```

**Step 4: Update package.json dependencies**
Remove AU1 dependencies and ensure you have the AU2 equivalents:
- Remove: `aurelia-framework`, `aurelia-bootstrapper`, etc.
- Add: `aurelia`, `@aurelia/compat-v1`

### Option 2: Manual Migration (For New AU2 Features)

If you want to fully embrace AU2 features from the start:

**Step 1: Project Structure**
```
src/
  main.ts          # Entry point (same location as AU1)
  my-app.ts        # Root component (skeleton default)
  my-app.html      # Root template (skeleton default)
  components/      # Your components
  resources/       # Custom elements, attributes, etc.
```

**Step 2: Bootstrapping Migration**

AU1 main.ts:
```typescript
import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'));

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
```

AU2 main.ts:
```typescript
import { Aurelia } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .app(MyApp)
  .start();
```

**Step 3: Router Migration**

AU1 router config:
```typescript
import { Router, RouterConfiguration } from 'aurelia-router';

export class App {
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router): void {
    config.title = 'My App';
    config.map([
      { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('./home') }
    ]);
    this.router = router;
  }
}
```

AU2 router config:
```typescript
import { IRoute } from '@aurelia/router';

export class App {
  static routes: IRoute[] = [
    { path: ['', 'home'], component: () => import('./home') }
  ];
}
```

**Navigation in AU2:**
```typescript
import { IRouter, resolve } from 'aurelia';

export class MyComponent {
  private readonly router = resolve(IRouter);

  async navigateToHome() {
    await this.router.load('home');
  }
}
```

### Critical Breaking Changes That Require Code Changes

#### 1. Compose Element - MAJOR BREAKING CHANGE

**AU1 compose:**
```html
<!-- AU1 - used module paths -->
<compose view-model.bind="'./components/user-card'" model.bind="user"></compose>
<compose view.bind="'./templates/user-template.html'" view-model.bind="user"></compose>
```

**AU2 au-compose - DOES NOT WORK WITH MODULE PATHS:**
```html
<!-- AU2 - requires imported components or template strings -->
<au-compose component.bind="UserCard" model.bind="user"></au-compose>
<au-compose template.bind="userTemplate" model.bind="user"></au-compose>
```

**Migration Required:**
```typescript
// AU1 - Dynamic module loading with strings
export class MyComponent {
  componentPath = './components/user-card';
}

// AU2 - Must import components or use template strings
import { UserCard } from './components/user-card';

export class MyComponent {
  userCard = UserCard;  // Component class
  // OR
  userTemplate = '<div>${name}</div>';  // Template string
}
```

**If you need dynamic component loading in AU2, you must create a module loader:**
```typescript
// Custom loader for dynamic components
const componentMap = new Map([
  ['user-card', () => import('./components/user-card')],
  ['admin-panel', () => import('./components/admin-panel')]
]);

async loadComponent(name: string) {
  const loader = componentMap.get(name);
  if (loader) {
    const module = await loader();
    return module.default || module[Object.keys(module)[0]];
  }
  return null;
}
```

#### 2. Module Loading - No More PLATFORM.moduleName

**AU1:**
```typescript
config.map([
  { route: 'users', moduleId: PLATFORM.moduleName('./pages/users') }
]);
```

**AU2:**
```typescript
static routes: IRoute[] = [
  { path: 'users', component: () => import('./pages/users') }
];
```

**AU1 feature loading:**
```typescript
aurelia.use.feature(PLATFORM.moduleName('resources/index'));
```

**AU2 - Create a resources array to register globally:**
```typescript
// resources/index.ts - AU2 pattern
import { MyCustomElement } from './my-custom-element';
import { MyValueConverter } from './my-value-converter';
import { MyBindingBehavior } from './my-binding-behavior';

export const GlobalResources = [
  MyCustomElement,
  MyValueConverter,
  MyBindingBehavior,
];
```

```typescript
// main.ts
import { GlobalResources } from './resources/index';
import { MyApp } from './my-app';

Aurelia
  .register(...GlobalResources)
  .app(MyApp)
  .start();
```

#### 3. Other Critical Changes

1. **Binding commands**: Replace `.delegate` with `.trigger`
2. **Replaceable parts**: Replace with `<au-slot>` elements  
3. **View decorators**: Replace `@noView`/`@inlineView` with `template` property
4. **Event preventDefault**: No longer automatic - use `.trigger:prevent` when needed

## COMPAT PACKAGE

An quickest way to get an application in v1 up an running in v2 is to include the compat package. It can be done via 2 steps:

1. installing the compat package via
  ```
  npm install @aurelia/compat-v1
  ```
2. include the compat package into your app:
  ```ts
  import { compatRegistration } from '@aurelia/compat-v1';

  ...
  Aurelia
    .register(compatRegistration, ...)
    .app(...)
    .start()
  ```

## BREAKING CHANGES

### Event

In v2, `preventDefault` is no longer called by default. This breaking change could show up in unexpected places:
- click events: in v1, clicking on a button inside a form will not submit the form, while it will in v2, as the click event default behavior is no longer prevented
    {% hint style="info" %}
    Even though clicking default behavior is not prevented, form submission without an action will not reload the page as this default behavior is still prevented in v2, so you don't need to add `:prevent` to every button `click`, or form `submit` listener.
    {% endhint %}

- drag events: in v1, implementing drag/drop will have `preventDefault` called automatically, but in v2, they will need to be explicitly called by the application

Sometimes, if it's desirable to call `preventDefault` in an event binding, use `prevent` modifier, like the following example:

```html
<button click.trigger:prevent="doWork()">Submit manually</button>

<div dragstart.trigger="prepareDragdrop()" drop.trigger:prevent="onDrop()">
```

Read more about modifiers in [event modifier doc here](../../templates/template-syntax/event-binding.md#event-modifiers)

### Scope selection

In v2, when trying to bind with a non-existent property, the closest boundary scope (scope of the owning custom element) will be selected, instead of the immediate scope of the binding (v1 behavior).

### Internal binding property `observeProperty` has been renamed to `observe`

In v1, if you happen to use `.observeProperty` method from bindings in your application/library, then change it to `observe` instead. The parameters of the signature remain the same.

### Internal binding property `sourceExpression` has been renamed to `ast`

In v1, if you happen to use `.sourceExpression` property from bindings in your application/library, then change it to `ast` instead. The type of the property remains the same.

### Enhance API changes:

In v1, `enhance` method on an `Aurelia` instance has the signature:

```typescript
class Aurelia {
  ...

  enhance(elementOrConfig: Element | IEnhancementConfig): View;
}
```

In v2, `enhance` method on an `Aurelia` instance has the signature:

```typescript
interface IAurelia {
  ...

  enhance(enhancementConfig: IEnhancementConfig): IEnhancedView;
}
```

Parent container and resources can be specified through this config.

### View model ref binding (view-model.ref="...")

In v2, in order to get a reference to the underlying component view model, use `component.ref` instead of view-model.ref
This is to make terminologies consistent as we are moving towards component oriented terms.

### If attribute (if.bind="...")

* The primary property of `If` has been renamed from `condition` to `value`. If you are using `if.bind`, you are not affected. If you are using the multi prop binding syntax, the template looks like this:

```html
<div if="condition.bind: yes">
```

Change it to:

```html
<div if="value.bind: yes">
```

## Binding Engine

* `BindingEngine` has been removed in v2, but can still be imported from `@aurelia/compat-v1` package for ease of migration. The `collectionObserver` method on the compat package of `BindingEngine` is not the same with v1, per the follow comparison:
  v2
  ```ts
  collectionObserver(collection): { subscribe: (callback: (collection, indexMap)) => { dispose(): void } }
  ```
  v1
  ```ts
  collectionObserver(collection): { subscribe: (callback: (collection, splices)) => { dispose(): void } }
  ```

## Binding commands

- `.delegate` command has been removed, use `.trigger` instead. With shadow DOM, even though `.delegate` works, it doesn't feel as natural as `.trigger`, and the performance benefits `.delegate` command used to give when browsers were slow adding many event listeners is no longer as big.
- `.call` command has been removed, use lambda functions instead to create function that preserves the `this` context. Refer to [lambda expression](../../templates/lambda-expressions.md)

## Compose

- `<compose>` has been renamed to `<au-compose>`. The bindable properties of this component have also been changed:
  - viewModel -> component
  - view -> template
  - model remains the same

- Examples migration fix:
  ```html
  v1:
  <compose view.bind="...">
  <compose view-model.bind="...">

  v2:
  <au-compose template.bind="...">
  <au-compose component.bind="...">
  ```

- In Aurelia 2, all bindings are passed through to the underlying custom element
composition, so `component.ref` (`view-model.ref` in v1) no longer means getting a reference to the composer, but the composed view model instead.

Read more about dynamic composition in v2 in this [dynamic composition doc](../../getting-to-know-aurelia/dynamic-composition.md) and [dynamic ui composition doc](../../app-basics/dynamic-ui-composition.md).

## Replaceable & replaceable part

If you are using `replaceable`/`part`/`repaceable-part` combo in your v1 applications, you'll need to replace them with `<au-slot>` elements and `au-slot` attributes.
Refer to the [au slot doc](../../components/shadow-dom-and-slots.md#au-slot) for more information.

## View decorators

When migrating from v1, it is possible to encounter the `@noView` and `@inlineView` decorators. These decorators are no longer available from the core packages in v2. Instead, use the [`template` property](../../components/components.md) of the custom element decorator.

For the ease of migration, the `@noView` and `@inlineView` decorators are made available from the `@aurelia/compat-v1` package. FOllowing are some example usages.

- Use the `@inlineView` decorator to define the template of a custom element.

  ```typescript
  import { customElement } from 'aurelia';
  import { inlineView } from '@aurelia/compat-v1';

  @inlineView('foo-bar')
  @customElement('app-loader')
  export class AppLoader {
    //...
  }
  ```
- Use the `@noView` decorator to define a custom element without a view.

  ```typescript
  import { customElement } from 'aurelia';
  import { noView } from '@aurelia/compat-v1';

  @noView
  @customElement('loading-indicator')
  export class LoadingIndicator {
    // ...
  }
  ```

## General changes

* Custom attributes are no longer considered to have a binding to the primary bindable when their template usage is with an empty string, like the following examples:
    ```html
    <div my-attr>
    <div my-attr="">
    ```
    Both of the above usages will be considered as "plain" usage, to avoid overriding the defaul value in the custom attribute component instance.
* Templates no longer need to have `<template>` tags as the start and ending tags. Templates can be pure HTML with enhanced Aurelia markup but `<template>` doesn't need to be explicitly defined.
* `PLATFORM.moduleName` is gone. This was to address a limitation in Aurelia 1. Aurelia 2 now works well with all bundlers and does not require the addition of this code to use code splitting or tell the bundler where template code is.
* Better intellisense support for TypeScript applications. Using the new injection interfaces, you can now inject strongly typed Aurelia packages such as Fetch Client, Router or Internationalization. These packages are prefixed with an "I" such as `IHttpClient`, `IRouter` and so on.
* empty binding expressions are automatically inferred based on the target of the binding, like the following example:
    ```html
    <input value.bind>
    <input value.bind="">
    ```
    means:
    ```html
    <input value.bind="value">
    ```
    This is automatically applied to `.bind`/`.one-time`/`.to-view`/`.from-view`/`.two-way`/`.attr` binding commands.
* `@computedFrom` decorator should be imported from `@aurelia/compat-v1` package, though dependencies of getters are tracked automatically via Proxy, it's not necessary to use `@computedFrom` unless an application wants to control how to track.
* During the deactivation of a template, like a custom element, an if, or repeat view etc..., the bindings inside will not react to changes, which could mean that DOM will not be updated during the deactivation cycles. 

## Plugins:

### Web-Components plugin

* Remove automatic `au-` prefix
* Remove auto-conversion of Aurelia element -> WC element. Applications need to explicitly define this. This should make mix-matching & controlling things easier.

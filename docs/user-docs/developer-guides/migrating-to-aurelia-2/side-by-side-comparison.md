# Side-by-side comparison

## Bootstrapping

### The hosting page

The first entry point of an Aurelia application is the main HTML page-loading and hosting.

{% tabs %}
{% tab title="Aurelia 1" %}
```markup
<!-- index.ejs -->
​
<!DOCTYPE html>
<html>
   <head>
      <meta charset="utf-8">
      <title>Aurelia</title>
   </head>
   <body aurelia-app="main">
      <script src="scripts/vendor-bundle.js"
         data-main="aurelia-bootstrapper"></script>
   </body>
</html>
```

`aurelia-app` attribute helps us to introduce our entry point, the`main.ts`file, which includes the configurations of the project.
{% endtab %}

{% tab title="Aurelia 2" %}
```markup
<!-- index.ejs -->
​
<!DOCTYPE html>
<html>
​
<head>
  <meta charset="utf-8">
  <title>Aurelia</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
​
<body>
  <my-app></my-app>
</body>
​
</html>
```

In Aurelia 2, it is a little different, you need to call your root component (`<my-app>` in this example) but

**What happened to `aurelia-app`?**

There is no`aurelia-app`in Aurelia 2. The`main.ts`file will detect via the project configuration.

```javascript
// webpack.config.js
​
// ...
entry: test ? './test/all-spec.ts' :  './src/main.ts' /*Here*/,
// ...
```
{% endtab %}
{% endtabs %}

### The main module

All the initial settings for starting and working with an Aurelia project are done in this file.

{% tabs %}
{% tab title="Aurelia 1" %}
```typescript
// src/main(.js|.ts)
​
export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .globalResources(PLATFORM.moduleName('./bar/nav-bar'));
​
  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');
​
  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }
​
  aurelia.start()
         .then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
```

**What does `PLATFORM.moduleName` do?**

Whenever you reference a module by string, you need to use`PLATFORM.moduleName("moduleName")`to wrap the bare string. `PLATFORM.moduleName` is designed to teach`Webpack`about Aurelia's dynamic loading behavior.

**What is a `globalResources`?**

When you create a view in Aurelia, it is completely encapsulated so you must`require`components into an Aurelia view. However, certain components are used so frequently across views that it can become very tedious to import them over and over again. To solve this problem, Aurelia lets you explicitly declare certain "view resources" as global.

**What is a `feature`?**

Sometimes you have a whole group of components or related functionality that collectively form a "feature". This "feature" may even be owned by a particular set of developers on your team. You want these developers to be able to manage the configuration and resources of their own feature, without interfering with the other parts of the app. For this scenario, Aurelia provides the "feature".

**What is a `plugin`?**

Similar to features, you can install 3rd party plugins. The main difference is that a "feature" is provided internally by your application, while a plugin is installed from a 3rd party source through your package manager.

**What does `setRoot()` do?**

Instantiates the root component and adds it to the DOM.
{% endtab %}

{% tab title="Aurelia 2" %}
```typescript
// src/main(.js|.ts)
​
import Aurelia, { RouterConfiguration } from 'aurelia';
import { MyApp } from './my-app';
​
Aurelia
  .register(RouterConfiguration.customize({ useUrlFragmentHash: false }))
  .app(MyApp)
  .start();
```

One of the best and most exciting changes has been made in this section.

**What happened to `PLATFORM.moduleName`?**

Aurelia 2 works with any bundler without limitation or specific configuration so I'm sure you guessed it, you don't need `PLATFORM.moduleName("moduleName")` anymore.

**Is `globalResources`still supported?**

Yes, Any component or class you add to the application`register()`will be globally accessible through DI.

**How can I have a `plugin`?**

If you are creating a`plugin` , then the usual practice is to `export` a configuration object. That can be registered in the client code. As a best practice, we recommend an alternate approach to registering each component individually in this way. Instead, create a folder where you keep all your shared components. In that folder, create a `registry.ts` module where you re-export your components. Then, import that registry module and pass it to the application's register method at startup.

For example:

```typescript
// components/registry.ts
​
export * from './say-hello';
export * from './name-tag';
```

```typescript
// main.ts
​
import Aurelia from 'aurelia';
import { App } from './app';
import * as globalComponents from './components/registry';
​
Aurelia
  .register(
    globalComponents // This globalizes all the exports of the registry.
  )
  .app(App)
  .start();
```

**What happened to `feature`?**

This is conceptually similar to`plugin`so you can do the same for internal use.

**Where is the `setRoot()`?**

The `app()`method is equivalent of the `setRoot()`.
{% endtab %}
{% endtabs %}

## Components

### The Root Component

The root of any Aurelia application is a `single` component, which contains everything within the application, actually, the root component.

{% tabs %}
{% tab title="Aurelia 1" %}
```markup
<!-- View -->
<!-- src/app.html -->
​
<require from="./styles.css"></require>
<require from="./nav-bar.html"></require>
<template>
    <h1>${message}</h1>
</template>
```

```typescript
// ViewModel
// src/app(.js|.ts)
​
export class App {
    constructor() {
        this.message = 'Hello World!';
    }
}
```

* To import any style, component or etc, you should use`require`.
* Wrapping the whole HTML content via`template`is`necessary`.
{% endtab %}

{% tab title="Aurelia 2" %}
```markup
<!-- View -->
<!-- src/my-app.html -->
​
<import from="./welcome"></import>
<import from="./about.html"></import>
<div class="message">${message}</div>
```

```typescript
// ViewModel
// src/my-app(.js|.ts)
​
export class MyApp {
  public message = 'Hello World!';
}
```

```css
/* Style */
/* src/my-app.css */
​
nav {
  background: #eee;
  display: flex;
}
a {
  padding: 10px;
  text-decoration: none;
  color: black;
}
a:hover {
  background-color: darkgray;
}
.load-active {
  background-color: lightgray;
}
```

* Unlike version 1, There is a convention for loading your CSS file when the name is the same as the component,  just like `my-app.css`, so you don't need to import it manually.
* To import any style, component or etc you should use `import`. An alternative to `require` in version 1. By default, the components you create aren't global. What that means is that you can't use a component within another component, unless that component has been imported.

```markup
<import from="./name-tag">
​
<h2>${message} <name-tag name.bind="to"></name-tag>!</h2>
<button click.trigger="leave()">Leave</button>
```

* Wrapping the whole HTML content via `template` is `optional`.
{% endtab %}
{% endtabs %}

### The Component Life-cycle

Every component instance has a life-cycle that you can tap into. This makes it easy for you to perform various actions at particular times

| Name        | Aurelia 1   | Asyncable | Description |
| ----------- | ----------- | --------- | ----------- |
| constructor | constructor | **✗**     |             |
| define      | **✗**       | **✗**     |             |
| hydrating   | **✗**       | **✗**     |             |
| hydrated    | **✗**       | **✗**     |             |
| created     | created     | **✗**     |             |
| binding     | bind        | **✓**     |             |
| bound       | **✗**       | **✓**     |             |
| attaching   | **✗**       | **✓**     |             |
| attached    | attached    | **✓**     |             |
| detaching   | **✗**       | **✓**     |             |
| unbinding   | unbind      | **✓**     |             |
| dispose     | **✗**       | **✗**     |             |

{% hint style="info" %}
Aurelia 1 has a restriction and the community made an [afterAttached](https://github.com/aurelia-ui-toolkits/aurelia-after-attached-plugin) plugin that is called after all child components are attached, and after all two-way bindings have completed. The`attached`life-cycle in version 2 covers this scenario.
{% endhint %}

**Which life-cycle hooks are most used?**

Such cases can be summarized.

| Name      | When using it                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------- |
| binding   | Fetch data (working with API services & Ajax calls), initialize data/subscriptions.               |
| bound     | Any work that relies on fromView/twoWay binding data coming from children, Defining router hooks. |
| attached  | Use anything (like third-party libraries) that touches the DOM.                                   |
| unbinding | Cleanup data/subscriptions, maybe persist some data for the next activation.                      |
| dispose   | One way cleanup all the references/resources. This is invoked only once and is irreversible       |

## Dependency injection

A dependency injection container is a tool that can simplify the process of decomposing such a system. Oftentimes, when developers go through the work of destructuring a system, they introduce a new complexity of "re-assembling" the smaller parts again at runtime. This is what a dependency injection container can do for you, using simple declarative hints.

## Registering services

| Aurelia 1                                                | Aurelia 2                                                              | Description |
| -------------------------------------------------------- | ---------------------------------------------------------------------- | ----------- |
| container.createChild()                                  | DI.createContainer()                                                   | -           |
| container.registerSingleton(key: any, fn?: Function)     | Registration.singleton(key: any, value: Function): IRegistration       | -           |
| container.registerTransient(key: any, fn?: Function)     | Registration.transient(key: any, value: Function): IRegistration       | -           |
| container.registerInstance(key: any, instance?: any)     | Registration.transient(key: any, value: any): IRegistration            | -           |
| container.registerHandler(key, handler)                  | Registration.callback(key: any, value: ResolveCallback): IRegistration | -           |
| container.registerResolver(key: any, resolver: Resolver) | container.registerResolver(key: any, resolver: IResolver)              | -           |
| container.autoRegister(key: any, fn?: Function           | **✗**                                                                  | -           |
| **✗**                                                    | Registration.alias(originalKey: any, aliasKey: any): IRegistration     | -           |

## Resolving services

| Aurelia 1                | Aurelia 2                   | Description |
| ------------------------ | --------------------------- | ----------- |
| container.get(MyService) | container.get(MyService)    | -           |
| **✗**                    | container.getAll(MyService) | -           |

## Registration strategies

| Name       | Aurelia 1 & 2 | Description |
| ---------- | ------------- | ----------- |
| @singleton | **✓**         | -           |
| @transient | **✓**         | -           |

## Resolvers

```typescript
// Aurelia 2
import { inject, lazy, all, optional, newInstanceOf, factory } from "@aurelia/kernel";
```

| Aurelia 1                          | Aurelia 2                               | Description |
| ---------------------------------- | --------------------------------------- | ----------- |
| @inject(MyService)                 | @inject(MyService)                      | -           |
| @autoinject()                      | **✗**                                   |             |
| @inject(Lazy.of(MyService))        | @inject(lazy(MyService))                | -           |
| @inject(All.of(MyService))         | @inject(all(MyService))                 | -           |
| @inject(Optional.of(MyService))    | @inject(optional(MyService))            | -           |
| @inject(Parent.of(MyService))      | **✗**                                   | -           |
| @inject(Factory.of(MyService))     | @inject(factory(MyService))             | -           |
| @inject(NewInstance.of(MyService)) | @inject(newInstanceForScope(MyService)) | -           |
| **✗**                              | @inject(newInstanceOf(MyService))       | -           |

## Logging

Writing debug output while developing is great. This is how you can do this with Aurelia.

{% tabs %}
{% tab title="Aurelia 1" %}
Write an appender.

```typescript
export class ConsoleAppender {
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
```

In the `main(.js|.ts)`

```typescript
import * as LogManager from 'aurelia-logging';
import { ConsoleAppender } from 'aurelia-logging-console';
export function configure(aurelia) {
    aurelia.use.standardConfiguration();
    
    LogManager.addAppender(new ConsoleAppender());
    LogManager.setLevel(LogManager.logLevel.debug);
    
    aurelia.start().then(() => aurelia.setRoot());
}
```
{% endtab %}

{% tab title="Aurelia 2" %}
You can register `LoggerConfiguration` as following

```typescript
// main(.js|.ts)
​
import Aurelia, { ConsoleSink, LoggerConfiguration, LogLevel } from 'aurelia';
import { MyApp } from './my-app';
​
Aurelia
  // Here
  .register(LoggerConfiguration.create({
    level: LogLevel.trace,
    sinks: [ConsoleSink]
  }))
  .app(MyApp)
  .start();
​
```

Usage

```typescript
import { ILogger } from "@aurelia/kernel";
​
export class MyApp {
    constructor(@ILogger private readonly logger: ILogger /* Here */) {
        logger.warn("warning!");
    }
}
```

**How to write an `appender`?**

```typescript
import { IConsoleLike } from '@aurelia/kernel';
​
class ConsoleAppender implements IConsoleLike {
  public debug(...args: unknown[]): void {
    console.debug(...args);
  }
​
  public info(...args: unknown[]): void {
    console.info(...args);
  }
​
  public warn(...args: unknown[]): void {
    console.warn(...args);
  }
​
  public error(...args: unknown[]): void {
    console.error(...args);
  }
}
```

**How to write a `sink`?**

```typescript
import { LogLevel } from 'aurelia';
import { sink, ISink, ILogEvent, } from '@aurelia/kernel';
​
@sink({ handles: [LogLevel.debug] })
class EventLog implements ISink {
  public readonly log: ILogEvent[] = [];
  public handleEvent(event: ILogEvent): void {
    this.log.push(event);
  }
}
```

**How to register `appender` and `sink` into the Aurelia container?**

```typescript
import { LoggerConfiguration, LogLevel } from 'aurelia';
​
// Instantiation
const consoleLogger = new ConsoleAppender();
​
Aurelia
  // Registration
  .register(LoggerConfiguration.create({
    $console: consoleLogger,
    level: LogLevel.trace,
    sinks: [EventLog]
  }))
  .app(MyApp)
  .start();
```

Finally, The usage

```typescript
import { ILogger } from "@aurelia/kernel";
​
export class MyApp {
    constructor(@ILogger logger: ILogger) {
        logger.debug("debug!");
    }
}
```
{% endtab %}
{% endtabs %}

## Router

### Routing Life-cycle

{% tabs %}
{% tab title="Aurelia 1" %}
| Name          | Description                          |
| ------------- | ------------------------------------ |
| canActivate   | if the component can be activated.   |
| activate      | when the component gets activated.   |
| canDeactivate | if the component can be deactivated. |
| deactivate    | when the component gets deactivated. |
{% endtab %}

{% tab title="Aurelia 2" %}
| Name      | Aurelia 1     | Asyncable | Description |
| --------- | ------------- | --------- | ----------- |
| canLoad   | canActivate   | **✓**     |             |
| loading   | activate      | **✓**     |             |
| canUnload | canDeactivate | **✓**     |             |
| unloading | deactivate    | **✓**     |             |
{% endtab %}
{% endtabs %}

## Binding

### String Interpolation

| Name | Aurelia 1 & 2 | Description |
| ---- | ------------- | ----------- |
| ${ } | **✓**         |             |

### Binding HTML and SVG Attributes

| Name      | Aurelia 1 & 2 | Description |
| --------- | ------------- | ----------- |
| one-way   | **✓**         |             |
| to-view   | **✓**         |             |
| from-view | **✓**         |             |
| two-way   | **✓**         |             |
| one-time  | **✓**         |             |
| bind      | **✓**         |             |

### Referencing DOM Elements

| Name | Aurelia 1 & 2 | Description |
| ---- | ------------- | ----------- |
| ref  | **✓**         |             |
| view-model.ref  | **✓**         |             |

### Passing Function References

| Name | Aurelia 1 & 2 | Description |
| ---- | ------------- | ----------- |
| call | **✓**         |             |

### DOM Events

| Name     | Aurelia 1 & 2 | Description |
| -------- | ------------- | ----------- |
| trigger  | **✓**         |             |
| delegate | **✓**         |             |
| capture  | **✓**         |             |

{% hint style="info" }
In v2, if an expression return a function, that function will be use as the handler for the event. V1 only evaluates the expression.
{% endhint }

### Contextual Properties

**General**

| Name  | Aurelia 1 & 2 | Description                                                               |
| ----- | ------------- | ------------------------------------------------------------------------- |
| $this | **✓**         | The view-model that your binding expressions are being evaluated against. |

**Event**

| Name   | Aurelia 1 & 2 | Description                                                     |
| ------ | ------------- | --------------------------------------------------------------- |
| $event | **✓**         | The DOM Event in `delegate`, `trigger`, and `capture` bindings. |

**Repeater**

| Name                         | Aurelia 1 | Aurelia 2 | Description |
| ---------------------------- | --------- | --------- | ----------- |
| $parent                      | **✓**     | **✓**     |             |
| $parent.$parent.$parent.name | **✓**     | **✓**     |             |
| $index                       | **✓**     | **✓**     |             |
| $first                       | **✓**     | **✓**     |             |
| $last                        | **✓**     | **✓**     |             |
| $even                        | **✓**     | **✓**     |             |
| $odd                         | **✓**     | **✓**     |             |
| $length                      | **✗**     | **✓**     |             |

### @computedFrom

`@computedFrom` tells the binding system which expressions to observe. When those expressions change, the binding system will re-evaluate the property (execute the getter).

| Aurelia 1 | Aurelia 2 |
| --------- | --------- |
| **✓**     | **✗**     |

{% hint style="info" %}
In Aurelia 2, The framework automatically computes observation without the need for any configuration or decorator.
{% endhint %}

### Observation in template

| type | example | type | Aurelia 1 | Aurelia 2 |
| - | - | - | - | - |
| property | `${a}` | syntax: | **✓** | **✓** |
| | | observation: | **✓** | **✓** |
| member | `${a.b}` | syntax: | **✓** | **✓** |
| | | observation: | **✓** | **✓** |
| value conveter | `${a \| convert: value }` | syntax: | **✓** | **✓** |
| | | observation: | **✓** | **✓** |
| binding behavior | `${a & behavior: config }` | syntax: | **✓** | **✓** |
| | | observation: | **✗** | **✗** |
| function call | `${doThing(param)}` | syntax: | **✓** | **✓** |
| | | observation: | **✓** | **✓** |
| array methods | `${items.join(', ')}` | syntax: | **✓** | **✓** |
| | | observation (on array): | **✗** | **✓** |
| lambda | `${items.filter(x => x.v > 70)}` | syntax: | **✗** | **✓** |
| | | observation: | **✗** | **✓** |

### @attributePattern

This feature is totally new for Aurelia 2.

```typescript
// Angular binding syntax simulation

// <input [disabled]="condition ? true : false">
@attributePattern({ pattern: '[PART]', symbols: '[]' })
export class AngularOneWayBindingAttributePattern {
    public ['[PART]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'one-way');
    }
}

// <input [(ngModel)]="name">
@attributePattern({ pattern: '[(PART)]', symbols: '[()]' })
export class AngularTwoWayBindingAttributePattern {
    public ['[(PART)]'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, rawValue, parts[0], 'two-way');
    }
}

// <input #phone placeholder="phone number" />
@attributePattern({ pattern: '#PART', symbols: '#' })
export class AngularSharpRefAttributePattern {
    public ['#PART'](rawName: string, rawValue: string, parts: string[]): AttrSyntax {
        return new AttrSyntax(rawName, parts[0], 'element', 'ref');
    }
}
```

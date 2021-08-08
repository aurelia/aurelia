---
description: The basics of the web-component plugin for Aurelia.
---

# Web-Component

## Introduction

TODO...

## Installing The Plugin

To use the plugin, import the interface `IWcElementRegistry` interface from `@aurelia/runtime-html` module and start defining web-component custom elements by calling method `define` on the instance of `IWcElementRegistry`.

WC custom elements can be defined at any time, either at application start time or later. Applications are responsible for ensuring names are unique.

Extending built-in elements is supported via the 3rd parameter of the `define` call, like the `define` call on the global `window.customElements.define` call.

## How it works

* Each of WC custom element will be backed by a view model, like a normal Aurelia element component.
* For each `define` call, a corresponding native custom element class will be created and defined.
* Each of the bindable property on the backing Aurelia view model will be converted to a reactive attribute (via `observedAttributes`) and reactive property (on the prototype of the extended HTML Element class created).
* Slot: `[au-slot]` is not supported when upgrading an existing element. `slot` can be used as a normal WC custom element.

Notes:
* WC custom element works independently with Aurelia component. This means the same class can be both a WC custom element and Aurelia element component. Though this should be avoided as it could result in double rendering.
* `containerless` mode is not supported, use extend-built-in instead if you want to avoid wrappers.
* the defined WC custom elements will continue working even after the owning Aurelia application has stopped.
* `template` info will be retrieved & compiled only once per `define` call, changing it after this call won't have any effects.
* `bindables` info will be retrieved & compiled only once per `define` call, changing it after this call won't have any effects.

## Examples

{% hint style="info" %}
For simplicity, all the examples below are defining elements at the start of an application, but they can be defined at any time.
{% endhint %}

1. Defining a `tick-clock` element

```typescript
import { Aurelia, IWcElementRegistry } from 'aurelia';

Aurelia
  .register(
    AppTask.beforeCreate(IWcElementRegistry, registry => {
      registry.define('tick-clock', class TickClock {
        static template = '${message}';

        constructor() {
          this.time = Date.now();
        }

        attaching() {
          this.intervalId = setInterval(() => {
            this.message = `${Date.now() - this.time} seconds passed.`;
          }, 1000)
        }

        detaching() {
          clearInterval(this.intervalId);
        }
      })
    })
  )
  .app(class App {})
  .start();
```

2. Defining a `tick-clock` element using shadow DOM with `open` mode

```typescript
import { Aurelia, IWcElementRegistry } from 'aurelia';

Aurelia
  .register(
    AppTask.beforeCreate(IWcElementRegistry, registry => {
      registry.define('tick-clock', class TickClock {
        static template = '${message}';
        static shadowOptions = { mode: 'open' };

        constructor() {
          this.time = Date.now();
        }

        attaching() {
          this.intervalId = setInterval(() => {
            this.message = `${Date.now() - this.time} seconds passed.`;
          }, 1000)
        }

        detaching() {
          clearInterval(this.intervalId);
        }
      })
    })
  )
  .app(class App {})
  .start();
```

3. Injecting the host element into the view model

```typescript
import { INode, Aurelia, IWcElementRegistry } from 'aurelia';

Aurelia
  .register(
    AppTask.beforeCreate(IWcElementRegistry, registry => {
      registry.define('tick-clock', class TickClock {
        static template = '${message}';
        static shadowOptions = { mode: 'open' };

        // all these injections result in the same instance
        // listing them all here so that applications can use what they prefer
        // based on HTMLElement 
        static inject = [INode, Element, HTMLElement];

        constructor(node, element, htmlElement) {
          node === element;
          element === htmlElement;
          this.time = Date.now();
        }

        attaching() {
          this.intervalId = setInterval(() => {
            this.message = `${Date.now() - this.time} seconds passed.`;
          }, 1000)
        }

        detaching() {
          clearInterval(this.intervalId);
        }
      })
    })
  )
  .app(class App {})
  .start();
```

4. Defining a `tick-clock` element with `format` bindable property for formatting

```typescript
import { INode, Aurelia, IWcElementRegistry } from 'aurelia';

document.body.innerHTML = '<tick-clock format="short"></tick-clock>';

Aurelia
  .register(
    AppTask.beforeCreate(IWcElementRegistry, registry => {
      registry.define('tick-clock', class TickClock {
        static template = '${message}';
        static shadowOptions = { mode: 'open' };
        static bindables = ['format'];

        // all these injections result in the same instance
        // listing them all here so that applications can use what they prefer
        // based on HTMLElement 
        static inject = [INode, Element, HTMLElement];

        constructor(node, element, htmlElement) {
          node === element;
          element === htmlElement;
          this.time = Date.now();
        }

        attaching() {
          this.intervalId = setInterval(() => {
            this.message = `${Date.now() - this.time} ${this.format === 'short' ? 's' : 'seconds'} passed.`;
          }, 1000)
        }

        detaching() {
          clearInterval(this.intervalId);
        }
      })
    })
  )
  .app(class App {})
  .start();
```

4. Defining a `tick-clock` element extending built-in `div` element:

```typescript
import { Aurelia, IWcElementRegistry } from 'aurelia';

document.body.innerHTML = '<div is="tick-clock"></div>'

Aurelia
  .register(
    AppTask.beforeCreate(IWcElementRegistry, registry => {
      registry.define('tick-clock', class TickClock {
        static template = '${message}';

        constructor() {
          this.time = Date.now();
        }

        attaching() {
          this.intervalId = setInterval(() => {
            this.message = `${Date.now() - this.time} seconds passed.`;
          }, 1000)
        }

        detaching() {
          clearInterval(this.intervalId);
        }
      })
    }, { extends: 'div' })
  )
  .app(class App {})
  .start();
```

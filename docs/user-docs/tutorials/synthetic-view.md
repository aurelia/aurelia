---
description: >-
  Learn how you can dynamically synthesize views from templates generated on
  runtime.
---

# Synthetic view

Synthetic views in Aurelia are a powerful feature that allows developers to generate and manage UI templates entirely through code dynamically. Unlike traditional views, which are pre-defined in HTML, synthetic views offer a higher degree of flexibility and control, making them ideal for scenarios where the UI needs to be constructed or altered on the fly based on various conditions or data sources.

In this tutorial, we'll explore creating and using synthetic views in Aurelia, utilizing lower-level APIs like ViewFactory and Controller. This approach provides a deeper understanding of how Aurelia manages views and offers more control over the view lifecycle and rendering process.

While you can use the `enhance` API to hydrate dynamically (on runtime) generated templates, this tutorial shows some primitives to do the same with more controls.

## What we will be building

In this tutorial, we will build a simple application demonstrating the power of synthetic views. Our application will include:

- **Two Custom Elements:** We'll start by writing two custom elements - `normal-text` and `value-text`. These elements will be simplistic, focusing on displaying bound values in different HTML tags (`<span>` and `<strong>`, respectively).
- **Dynamic Template Construction:** We'll then dynamically construct a template at runtime using these custom elements. This step will showcase how to build a view from scratch using JavaScript.
- **Utilizing Aurelia's Lower-Level APIs:** Finally, we will delve into lower-level Aurelia APIs like ViewFactory and Controller. This will demonstrate how to hydrate (or activate) the template, bringing our dynamic view to life.

Through these steps, you'll learn not just how to create synthetic views, but also understand the scenarios where they are particularly beneficial.

{% hint style="success" %}
You can see a working example [here](https://stackblitz.com/edit/typescript-hh9a1e).
{% endhint %}

## Prerequisites

Before going any further, you should be familiar with some basic Aurelia concepts and some fundamental Javascript ones. While these are not hard prerequisites, please know that some concepts used in this tutorial out of context might be confusing or difficult to understand.

* Creating a new Aurelia app. This won't be covered in this tutorial; you can take a look at the other tutorials.
* You have familiarized yourself with the [Aurelia template syntax](../templates/template-syntax.md).
* You have familiarized yourself with [components in Aurelia](../components/components.md).
* You are familiar with [Dependency Injection](../getting-to-know-aurelia/dependency-injection-di/). You don't need to be a master of it; you just need to be familiar with its existence and why it matters in Aurelia.
* Native Web APIs, such as [`createElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement).

## Why Use Synthetic Views

Synthetic views are particularly useful in scenarios where the content of a view is not known at design time or needs to be dynamically constructed based on runtime data. This makes them a go-to solution for:

- **Dynamic Content Rendering:** Creating views on the fly based on user interactions, data changes, or dynamic content requirements.
- **Complex UI Manipulations:** Constructing UIs with a level of complexity that isn't easily achievable with static templates.
- **Performance Optimization:** Tailoring the view creation and rendering process for specific performance requirements, as synthetic views can be fine-tuned for optimal performance in dynamic UI scenarios.

By the end of this tutorial, you'll have a clearer understanding of how and when to leverage synthetic views in your Aurelia applications, enhancing both flexibility and user experience.

## Custom elements

First, let us write some custom elements. These custom elements will be rather simplistic in nature so that we don't get tangled in the logic of complex custom elements too much. To this end, we will have two custom elements, namely `normal-text` and `value-text`. These custom elements display a bound `value` inside a `<span>` and a `<strong>` element, respectively, as shown in the following code fragment.

{% tabs %}
{% tab title="custom-elements.ts" %}
```typescript
import { bindable, customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'normal-text',

  //the template is inlined for ease of demonstration; feel free to import the template from an external html file.
  template: '<span>NT: ${value}</span>',
})
export class NormalText {
  @bindable value: unknown;
}

@customElement({
  name: 'value-text',

  //the template is inlined for ease of demonstration; feel free to import the template from an external html file.
  template: '<strong>VT: ${value}</strong>',
})
export class ValueText {
  @bindable value: unknown;
}
```
{% endtab %}

{% tab title="main.ts" %}
```typescript
import { Aurelia, StandardConfiguration } from '@aurelia/runtime-html';
import { NormalText, ValueText } from './custom-elements';

(async function () {
  await new Aurelia()
    .register(
      StandardConfiguration,

      /*--- Register the custom elements ---*/
      NormalText,
      ValueText,
    )
    //...
    ;
})().catch(console.error);
```
{% endtab %}
{% endtabs %}

Make sure that you have registered those custom elements.

## Setup the `App`

Let us assume that the starting point of our app is as follows.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import { ICustomElementViewModel } from '@aurelia/runtime-HTML';
import { customElement } from 'aurelia';
import template from './app.html';

@customElement({ name: 'app', template })
export class App {
  private containerEl: HTMLDivElement;
  private readonly bc = { value: 'Hello Aurelia!' };

  private async add() {
    // TODO add code here to compose dynamic template and hydrate
  }

  private async remove() {
    // TODO add code here to remove the hydrated
  }
}
```
{% endtab %}

{% tab title="app.html" %}
```html
${bc.message} <br>

<!-- we would like to add the hydrated custom elements when this button is clicked -->
<button click.delegate="add()">Add CEs</button>

<!-- we would like to remove the hydrated custom elements when this button is clicked -->
<button click.delegate="remove()">Remove CEs</button>

<br>
<!-- This is where we would like add our hydrated elements -->
<div ref="containerEl"></div>
```
{% endtab %}
{% endtabs %}

The idea is to add the dynamically generated and hydrated nodes in the `div[ref=containerEl]` using the `add` method and remove those using the `remove` method.

## Synthesize the view

The process of dynamically adding the hydrated nodes can be broadly divided into the following steps:

1. Create the DOM fragment under a single root node.
2. Add the root node to the DOM.
3. Convert the root node to a render location where Aurelia can add the hydrated nodes later.
4. Create a `ViewFactory`.
5. Activate an `ISyntheticView` using the view factory.

We generate the DOM fragment in the first step using simple Web APIs. Our goal for this tutorial is to create the following DOM fragment.

```html
<normal-text value.bind></normal-text>
<br>
<value-text value.bind></value-text>
```

{% hint style="info" %}
The dynamically generated nodes need not necessarily be only custom elements. Native elements can also be hydrated the same way.
{% endhint %}

To this end, we inject a `IPlatform` instance to our `App` instead of directly using the global Web APIs. This is recommended because it makes the testing easier.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import {
  IPlatform,
  //...
} from '@aurelia/runtime-html';
//...

export class App {
  //...
  public constructor(
    @IPlatform private readonly platform: IPlatform,
  ){}
}
```
{% endtab %}
{% endtabs %}

Next we proceed to prepare the DOM fragment inside the `add` method.

{% tabs %}
{% tab title="app.ts" %}
```typescript
//...
export class App {
  //...
  public async add() {

    // Step#1: Create the template.
    const doc = this.platform.document;
    // synthetic view root
    const template: HTMLTemplateElement = doc.createElement('template');
    const content = template.content;

    const normalText = doc.createElement('normal-text');
    normalText.setAttribute('value.bind', '');

    const valueText = doc.createElement('value-text');
    valueText.setAttribute('value.bind', '');

    content.append(
      normalText,
      doc.createElement('br'),
      valueText
    );
  }
}
```
{% endtab %}
{% endtabs %}

In the next step we need to add this fragment to the DOM and to this end we would like to use the `div[ref=containerEl]` to be the parent of the `template`.

{% tabs %}
{% tab title="app.ts" %}
```typescript
//...
export class App {
  //...
  public async add() {
    //...
    // Step#2: Add the template to the DOM
    this.containerEl.append(template);
  }
}
```
{% endtab %}
{% endtabs %}

Then we convert the `template` to a render location. This process adds a marker, as render location, in the DOM where the hydrated nodes will be attached later.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import {
  convertToRenderLocation,
  //...
} from '@aurelia/runtime-html';
//...
export class App {
  //...
  public async add() {
    //...
    // Step#3: Convert the node to a render location so that Aurelia can attach the hydrated nodes back to correct location during activate
    const loc = convertToRenderLocation(template);
  }
}
```
{% endtab %}
{% endtabs %}

After that we need to create a view factory from the template. The objective of creating a view factory is simply, as the name already suggests, to create a view later from it.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import {
  CustomElementDefinition,
  CustomElement,
  ViewFactory,
  //...
} from '@aurelia/runtime-html';
import {
  IContainer,
  //...
} from 'aurelia';
//...
export class App {
  //...
  public constructor(
    @IContainer private readonly container: IContainer,
    //...
  ){}

  public async add() {
    //...
    // Step#4: Create view factory
    // create a custom-element definition from the template.
    // The view later will be created from this definition
    const definition = CustomElementDefinition.create({
      // we have used here a auto-generated name to avoid collision; you may choose an explicit name if you want to.
      name: CustomElement.generateName(),
      template,
    });
    const factory = new ViewFactory(this.container, definition);
  }
}
```
{% endtab %}
{% endtabs %}

Note that to create the view factory, we need a container, which is injected via the `App` constructor.

With that, our preparation is almost done. The next step involves creating a view from the view factory and activating it.

To activate the view, however, we need to use a "parent" controller. This is needed as a hierarchical structure is maintained on the controller level. Because we are creating the view from `App`, it makes sense to use the controller from the `App` to this end. Aurelia adds a controller to every view custom element view model (as well as custom attribute view model) once the view model is created.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import {
  ICustomElementViewModel,
  ICustomElementController,
  //...
} from '@aurelia/runtime-html';
//...
export class App implements ICustomElementViewModel {
  //...
  // This is set by the controller after this instance is constructed.
  public readonly $controller!: ICustomElementController<this>;
  //...
}
```
{% endtab %}
{% endtabs %}

We use this controller to create the view from the view factory.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import {
  ISyntheticView,
  LifecycleFlags,
  //...
} from '@aurelia/runtime-html';
import {
  Scope,
  //...
} from '@aurelia/runtime';
//...
export class App implements ICustomElementViewModel {
  private view: ISyntheticView | undefined;
  private readonly bc = { value: 'Hello Aurelia!' };
  //...

  public async add() {
    //...
    // Step#5: Create and activate view
    const view = this.view = factory
      .create(controller)
      .setLocation(loc); //<-- render location created in Step#2

    // binds the view with the given scope and attaches it to the DOM
    await view.activate(
      view,
      controller,
      LifecycleFlags.none,
      Scope.create(this.bc),
    );
  }
}
```
{% endtab %}
{% endtabs %}

In this step, the view is created from the factory, and the render location is set. Subsequently, the view is activated, which involves mainly binding the view with the given scope and attaching the hydrated nodes to the render location.

In this example, a new scope is created to bind the view for simplicity. However, if you want to avoid that, you may reuse the same scope from the `controller` itself (see [example](https://stackblitz.com/edit/typescript-pzef4n?file=app%2Fapp.ts)) or use that as parent scope depending on your need. To know more about scope and context, refer to the respective [documentation](../components/scope-and-binding-context.md). Once the activation is complete you can see the hydrated nodes in DOM.

## Remove the view

You may have noticed that we have stored the view in the `App#view` property. Removing involves simply deactivating the view.

{% tabs %}
{% tab title="app.ts" %}
```typescript
//...
export class App implements ICustomElementViewModel {
  //...
  private async remove() {
    await this.view.deactivate(view, this.$controller, LifecycleFlags.none);
  }
}
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Note that the `view` can be kept around, activated, or deactivated on-demand.
{% endhint %}

It also might be a good idea to dispose of the `view` from the `dispose` hook of the view model to ensure systematic disposal of the view and the associated resources.

{% tabs %}
{% tab title="app.ts" %}
```typescript
import {
  Controller,
  //...
} from '@aurelia/runtime-html';
//...
export class App implements ICustomElementViewModel {
  //...
  public dispose() {
    (this.view as Controller).dispose();
    this.view = undefined;
  }
}
```
{% endtab %}
{% endtabs %}

### Live example

You can see the live example below. It involves some trivial guard conditions; other than that, it is mostly the same.

{% embed url="https://stackblitz.com/edit/typescript-hh9a1e?ctl=1&embed=1&file=app/app.ts" %}

## Additional Examples

### Dynamic Form Generation

In an application where the form fields need to be generated based on user selections or data retrieved from an API, synthetic views can be used to dynamically create and render these forms.

```typescript
// app.ts
import { customElement, ICustomElementViewModel, ICustomElementController, LifecycleFlags, Scope, ISyntheticView, ViewFactory, convertToRenderLocation, IPlatform } from '@aurelia/runtime-html';
import { IContainer } from 'aurelia';

@customElement({ name: 'app', template: '<div ref="containerEl"></div>' })
export class App implements ICustomElementViewModel {
  private containerEl: HTMLElement;
  private view: ISyntheticView | undefined;

  constructor(@IPlatform private readonly platform: IPlatform, @IContainer private readonly container: IContainer) {}

  public attached() {
    this.addDynamicForm();
  }

  private async addDynamicForm() {
    // Create a synthetic view for the form
    const formTemplate = this.platform.document.createElement('template');
    formTemplate.innerHTML = `
      <input type="text" placeholder="Name">
      <input type="email" placeholder="Email">
      <button type="submit">Submit</button>
    `;

    // Convert to render location
    this.containerEl.appendChild(formTemplate);
    const renderLocation = convertToRenderLocation(formTemplate);

    // Create and activate view
    const factory = new ViewFactory(this.container, { name: 'dynamic-form', template: formTemplate });
    const controller = this.container.get(ICustomElementController);
    this.view = factory.create(controller).setLocation(renderLocation);
    await this.view.activate(this.view, controller, LifecycleFlags.fromBind, Scope.create({}));
  }
}
```

### Real-Time Data Display

This example illustrates a scenario where a component needs to display real-time data updates, such as a stock ticker or live feed. Synthetic views are ideal for this because they can efficiently update the UI in response to data changes without rerendering the entire view.

```typescript
// app.ts
import { customElement, ICustomElementViewModel, ICustomElementController, LifecycleFlags, Scope, ISyntheticView, ViewFactory, convertToRenderLocation, IPlatform } from '@aurelia/runtime-html';
import { IContainer } from 'aurelia';

interface LiveData {
  id: number;
  value: string;
}

@customElement({ name: 'live-data-app', template: '<div ref="liveDataContainer"></div>' })
export class LiveDataApp implements ICustomElementViewModel {
  private liveDataContainer: HTMLElement;
  private view: ISyntheticView | undefined;
  private liveData: LiveData[] = [];

  constructor(@IPlatform private readonly platform: IPlatform, @IContainer private readonly container: IContainer) {
    // Simulate live data updates
    setInterval(() => this.updateLiveData(), 1000);
  }

  private async updateLiveData() {
    // Update live data
    this.liveData.push({ id: this.liveData.length, value: `Data ${this.liveData.length}` });

    // Create and update view with new data
    if (!this.view) {
      const template = this.platform.document.createElement('template');
      template.innerHTML = this.liveData.map(data => `<div>Live Data: ${data.value}</div>`).join('');
      this.liveDataContainer.appendChild(template);
      const renderLocation = convertToRenderLocation(template);
      const factory = new ViewFactory(this.container, { name: 'live-data-view', template });
      const controller = this.container.get(ICustomElementController);
      this.view = factory.create(controller).setLocation(renderLocation);
      await this.view.activate(this.view, controller, LifecycleFlags.fromBind, Scope.create({}));
    } else {
      // Update existing view with new data
      this.view.nodes.firstChild.textContent = this.liveData.map(data => `Live Data: ${data.value}`).join('');
    }
  }
}
```

In this example, the component LiveDataApp simulates receiving live data updates. It uses a synthetic view to render this data dynamically. When new data arrives, the view is efficiently updated without needing to rerender the entire component.

These examples demonstrate two different, but common scenarios where synthetic views can be particularly useful: dynamically generating content based on data and updating content in real-time. They illustrate the flexibility and power of synthetic views in handling dynamic and changing content in an Aurelia application.

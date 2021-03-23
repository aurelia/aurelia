# Components

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

| Name | Aurelia 1 | Asyncable | Description |
| :--- | :--- | :--- | :--- |
| constructor | constructor | **✗** |  |
| define | **✗** | **✓** |  |
| hydrating | **✗** | **✓** |  |
| hydrated | **✗** | **✓** |  |
| created | created | **✓** |  |
| binding | bind | **✓** |  |
| bound | **✗** | **✓** |  |
| attaching | **✗** | **✓** |  |
| attached | attached | **✓** |  |
| detaching | **✗** | **✓** |  |
| unbinding | unbind | **✓** |  |
| dispose | detached | **✓** |  |

{% hint style="info" %}
Aurelia 1 has a restriction and the community made an [afterAttached](https://github.com/aurelia-ui-toolkits/aurelia-after-attached-plugin) plugin that is called after all child components are attached, and after all two-way bindings have completed. The`attached`life-cycle in version 2 covers this scenario.
{% endhint %}

**Which life-cycle hooks are most used?**

Such cases can be summarized.

| Name | When using it |
| :--- | :--- |
| binding | Fetch data \(working with API services & Ajax calls\), initialize data/subscriptions. |
| bound | Any work that relies on fromView/twoWay binding data coming from children, Defining router hooks. |
| attached | Use anything \(like third-party libraries\) that touches the DOM. |
| unbinding | Persisting data. |
| dispose | Cleanup data/subscriptions. |


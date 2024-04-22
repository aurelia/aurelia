---
description: >-
  Learn how to manipulate the DOM from the usage-side of a custom element using the processContent hook.
---

# The 'processContent' hook

There are scenarios where we would like to transform the template provided by the usage-side.
The 'processContent' hook lets us define a pre-compilation hook to make that transformation.

The signature of the hook function is as follows.

```typescript
// pseudo-code; `typeof TCustomElement` doesn't work in Generics form.
<TCustomElement>(this: typeof TCustomElement, node: INode, platform: IPlatform) => boolean | void;
```

There are two important things to note here.

First is the `node` argument.
It is the DOM tree on the usage-side for the custom element.
For example, if there is a custom element named `my-element`, on which a 'processContent' hook is defined, and it is used somewhere as shown in the following markup, then when the hook is invoked, the `node` argument will provide the DOM tree that represents the following markup.

```html
<my-element>
 <foo></foo>
 <bar></bar>
</my-element>
```
Then inside the hook this DOM tree can be transformed/mutated into a different DOM tree.
The mutation can be addition/removal of attributes or element nodes.

Second is the return type `boolean | void`.
Returning from this function is optional.
Only an explicit `false` return value results in skipping the compilation (and thereby enhancing) of the child nodes in the DOM tree.
The implication of skipping the compilation of the child nodes is that Aurelia will not touch those DOM fragments and will be kept as it is.
In other words, if the mutated node contains custom elements, custom attributes, or template controllers, those will not be hydrated.

The `platform` argument is just the helper to have platform-agnostic operations as it abstracts the platform.
Lastly the `this` argument signifies that the hook function always gets bound to the custom element class function for which the hook is defined.

The most straight forward way to define the hook is to use the `processContent` property while defining the custom-element.

```typescript
import { customElement, INode, IPlatform } from '@aurelia/runtime-html';

// Use a standalone function
function processContent(node: INode, platform: IPlatform) { }
@customElement({ name: 'my-element', processContent })
export class MyElement { }

// ... or use a static method named 'processContent' (convention)
@customElement({ name: 'my-element' })
export class MyElement {
  static processContent(node: INode, platform: IPlatform) { }
}
```

Apart from this, there is also the `@processContent` decorator which can used class-level or method-level.

```typescript
import { customElement, INode, IPlatform, processContent } from '@aurelia/runtime-html';

// ...or a standalone method
function processContent(this: typeof MyElement, node: INode, platform: IPlatform) { }
@processContent(processContent)
export class MyElement {
}

// ...or the method-level decorator
export class MyElement {
  @processContent()
  static processContent(node: INode, platform: IPlatform) { }
}
```

That's the API.
Now let us say consider an example.
Let us say that we want to create a custom elements that behaves as a tabs control.
That is this custom element shows different sets of information grouped under a set of headers, and when the header is clicked the associated content is shown.
To this end, we can conceptualize the markup for this custom element as follows.

```html
<!--tabs.html-->
<div class="header">
  <au-slot name="header"></au-slot>
</div>
<div class="content">
  <au-slot name="content"></au-slot>
</div>
```

The markup has 2 slots for the header and content projection.
While using the `tabs` custom element we want to have the following markup.

{% hint style="info" %}
If you are unfamiliar with the `au-slot` then visit the [documentation](#au-slot).
'processContent' can be very potent with `au-slot`.
{% endhint %}

```html
<!--app.html-->
<tabs>
  <tab header="Tab one">
    <span>content for first tab.</span>
  </tab>
  <tab header="Tab two">
    <span>content for second tab.</span>
  </tab>
  <tab header="Tab three">
    <span>content for third tab.</span>
  </tab>
</tabs>
```

Now note that there is no custom element named `tab`.
The idea is to keep the usage-markup as much dev-friendly as possible, so that it is easy to maintain, and the semantics are quite clear.
Also it is easy to refactor as now we know which parts belong together.
To support this usage-syntax we will use the 'processContent' hook to rearrange the DOM tree, so that the nodes are correctly projected at the end.
A prototype implementation is shown below.

```typescript
// tabs.ts
import { INode, IPlatform, processContent } from '@aurelia/runtime-html';

class Tabs {

  @processContent()
  public static processTabs(node: INode, p: IPlatform): boolean {
    const el = node as Element;

    // At first we prepare two templates that will provide the projections to the `header` and `content` slot respectively.
    const headerTemplate = p.document.createElement('template');
    headerTemplate.setAttribute('au-slot', 'header');
    const contentTemplate = p.document.createElement('template');
    contentTemplate.setAttribute('au-slot', 'content');

    // Query the `<tab>` elements present in the `node`.
    const tabs = toArray(el.querySelectorAll('tab'));
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];

      // Add header.
      const header = p.document.createElement('button');
      // Add a class binding to mark the active tab.
      header.setAttribute('class.bind', `activeTabId=='${i}'?'active':''`);
      // Add a click delegate to activate a tab.
      header.setAttribute('click.delegate', `showTab('${i}')`);
      header.appendChild(p.document.createTextNode(tab.getAttribute('header')));
      headerTemplate.content.appendChild(header);

      // Add content.
      const content = p.document.createElement('div');
      // Show the content if the tab is activated.
      content.setAttribute('if.bind', `activeTabId=='${i}'`);
      content.append(...toArray(tab.childNodes));
      contentTemplate.content.appendChild(content);

      el.removeChild(tab);
    }
    // Set the first tab as the initial active tab.
    el.setAttribute('active-tab-id', '0');

    el.append(headerTemplate, contentTemplate);
  }

  @bindable public activeTabId: string;
  public showTab(tabId: string) {
    this.activeTabId = tabId;
  }
}
```

<!-- TODO add a live example later after a new dev version is released post merge of #1068. -->

**Example transformation function for default `[au-slot]`**

If you have used [`au-slot`](#au-slot), you might have noticed that in order to provide a projection the usage of `[au-slot]` attribute is mandatory, even if the projections are targeted to the default `au-slot`.
With the help of the 'processContent' hook we can workaround this minor inconvenience.
The following is a sample transformation function that loops over the direct children under `node` and demotes the nodes without any `[au-slot]` attribute to a synthetic `template[au-slot]` node.

```typescript
processContent(node: INode, p: IPlatform) {
  const projection = p.document.createElement('template');
  projection.setAttribute('au-slot', '');
  const content = projection.content;
  for (const child of toArray(node.childNodes)) {
    if (!(child as Element).hasAttribute('au-slot')) {
      content.append(child);
    }
  }
  if (content.childElementCount > 0) {
    node.appendChild(projection);
  }
}
```

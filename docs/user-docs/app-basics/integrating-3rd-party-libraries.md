# Integrating 3rd Party Libraries

One of Aurelia's biggest strengths is that it plays nicely with most pre-existing third-party libraries in the ecosystem. Because of Aurelia's unique reactive based binding system that does not require a virtual DOM, it means any third-party library that touches the dom can be used in Aurelia easily.

## jQuery

First, make sure you install jQuery, as well as the types:

```
npm install jquery
npm install @types/jquery -D
```

Inside of your compononent or routeable view-model, you import jQuery and define the `attached` lifecycle hook which is the best place to initialize any code that requires touching the dom.

```typescript
import $ from 'jquery';

export class MyComponent {
    attached(): void {
        // Use jQuery to interact with the dom here or initialize jQuery plugins, etc
    }
}
```

### Injecting The Component Element

You can obtain a reference to the HTML element for our custom element. This will allow you to query the contents of the custom element and call jQuery on the HTML.

```typescript
import { inject } from 'aurelia';

import $ from 'jquery';

@inject(Element)
export class MyComponent {
    constructor(private element: HTMLElement) {
    }
    
    attached(): void {
      $(this.element).addClass('myClass');
    }
}
```

The above code will add a new class to our HTML element using jQuery. You could replace this with a plugin call or anything else.

## Bootstrap

The popular CSS and Javascript UI library ships with both CSS styling as well as Javascript for various features. Integrating Bootstrap is super easy in Aurelia.

```
npm install bootstrap
```

Inside of your main application file, whether it is `my-app.ts` or `main.ts` we will import the CSS and Javascript, so it is included at the root of your application. We will assume that you are putting this into your main application file, if you created an app using the CLI, you'll have a `my-app.ts` file by default.

```typescript
import 'bootstrap'; // Import the Javascript
import 'bootstrap/dist/css/bootstrap.css'; // Import the CSS
```

{% hint style="warning" %}
**Using CSS Modules or Shadow DOM**

If you are using CSS Modules and/or Shadow DOM, global CSS styles from Bootstrap will not work properly in the way described. In the case of CSS Modules, class names get rewritten into randomly named strings and Shadow DOM is designed to work in isolation per use. For these instances, adding Bootstrap into a global stylesheet and importing that where needed should fix the problem. This is a limitation of these standards and not Aurelia itself.
{% endhint %}

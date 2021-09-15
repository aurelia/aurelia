---
description: Not all components have a view template
---

# Viewless Components

If you worked with Aurelia 1, you might have been familiar with a feature called `@noView` that allowed you to mark your components as viewless \(they had a view model, but no accompanying view\). You are probably thinking, "This sounds a lot like a custom attribute", however, there are situations where a custom element without a view is needed.

One prime example of a viewless component is a loading indicator using the nprogress library.

```typescript
import nprogress from 'nprogress';
import { bindable, customElement } from 'aurelia';

import 'nprogress/nprogress.css';

@customElement({
    name: 'loading-indicator'
})
export class LoadingIndicator {
  @bindable loading = false;

  loadingChanged(newValue) {
    if (newValue) {
      nprogress.start();
    } else {
      nprogress.done();
    }
  }
}
```

In this particular example, the nprogress library handles adding and removing styles/elements from the DOM, so we omit the template in this instance. Notice how unlike Aurelia 1, we didn't need to add anything?

While a viewless component is a very specific need and in many cases, a custom attribute is a better option, by omitting the `template` property of `customElement` you can achieve the same thing.


---
description: >-
  The template compiler is used by Aurelia under the hood to process templates
  and provides hooks and APIs allowing you intercept and modify how this
  behavior works in your applications.
---

# Using the template compiler

## Hooks

There are scenarios where an application wants to control how to preprocess a template before it is compiled. There could be various reasons, such as accessibility validation, adding debugging attributes etc...

Aurelia supports this via template compiler hooks, enabled with the default template compiler. To use these features, declare and then register the desired hooks with either global (at startup) or local container (at dependencies (runtime) or `<import>` with convention).

An example of declaring global hooks that will be called for every template:

### With VanillaJS

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

Aurelia
  .register(TemplateCompilerHooks.define(class {
    compiling(template: HTMLElement) {
      element.querySelector('table').setAttribute(someAttribute, someValue);
    }
  }))
```

### With decorator

```typescript
import Aurelia, { templateCompilerHooks } from 'aurelia';

@templateCompilerHooks
class MyTableHook1 {
  compiling(template) {...}
}
// paren ok too
@templateCompilerHooks()
class MyTableHook1 {
  compiling(template) {...}
}

Aurelia.register(MyTableHook1);
```

### Supported hooks

* **compiling**: this hook will be invoked before the template compiler starts compiling a template. Use this hook if there need to be any changes to a template before any compilation.

### Hooks invocation order

All hooks from local and global registrations will be invoked: local first, then global.

## Compilation Behavior

The default compiler will remove all binding expressions while compiling a template. This is to clean the rendered HTML and increase the performance of cloning compiled fragments.

Though this is not always desirable for debugging, it could be hard to figure out what element mapped to the original part of the code. To enable an easier debugging experience, the default compiler has a property `debug` that when set to `true` will keep all expressions intact during the compilation.

This property can be set early in an application lifecycle via `AppTask`, so that all the rendered HTML will keep their original form. An example of doing this is:

```typescript
import Aurelia, { AppTask, ITemplateCompiler } from 'aurelia';
import { MyApp } from './my-app';

Aurelia
  .register(AppTask.creating(ITemplateCompiler, compiler => compiler.debug = true))
  .app(MyApp)
  .start();
```

List of attributes that are considered expressions:

* containerless
* as-element
* ref
* attr with binding expression (`attr.command="..."`)
* attr with interpolation (`attr="${someExpression}"`)
* custom attribute
* custom element bindables

## Scenarios

Now that we understand how the template compiler works let's create fun scenarios showcasing how you might use it in your Aurelia applications.

### Feature Flagging in Templates

If your application uses feature flags to toggle features on and off, you may want to modify templates based on these flags conditionally.

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

class FeatureFlagHook {
  constructor(private featureFlags: Record<string, boolean>) {}

  compiling(template: HTMLElement) {
    const featureElements = template.querySelectorAll('[data-feature]');
    for (const element of featureElements) {
      const featureName = element.getAttribute('data-feature');
      if (!this.featureFlags[featureName]) {
        element.parentNode.removeChild(element);
      }
    }
  }
}

const activeFeatureFlags = {
  'new-ui': true,
  'beta-feature': false
};

Aurelia.register(TemplateCompilerHooks.define(new FeatureFlagHook(activeFeatureFlags)))
  .app(MyApp)
  .start();
```

Here, elements with a `data-feature` attribute will be removed from the template if the corresponding feature flag is set to `false`, allowing for easy management of feature rollouts.

### Auto-Generating Form Field IDs for Label Association

For accessibility purposes, form fields must associate `label` elements with matching `for` and `id` attributes. We can automate this process during template compilation.

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

class FormFieldHook {
  private fieldCounter = 0;

  compiling(template: HTMLElement) {
    const formFields = template.querySelectorAll('input, textarea, select');
    for (const field of formFields) {
      if (!field.hasAttribute('id')) {
        const uniqueId = `form-field-${this.fieldCounter++}`;
        field.setAttribute('id', uniqueId);
        
        const label = template.querySelector(`label[for="${field.getAttribute('name')}"]`);
        if (label) {
          label.setAttribute('for', uniqueId);
        }
      }
    }
  }
}

Aurelia.register(TemplateCompilerHooks.define(new FormFieldHook()))
  .app(MyApp)
  .start();
```

In this use case, the hook generates a unique `id` for each form field that doesn't already have one and updates the corresponding `label`'s `for` attribute to match. This ensures that form fields are properly labelled for screen readers and other assistive technologies.

### Automatic ARIA Role Assignment

To enhance accessibility, you might want to automatically assign ARIA roles to certain elements based on their class or other attributes to make your application more accessible without manually annotating each element.

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

class AriaRoleHook {
  compiling(template: HTMLElement) {
    const buttons = template.querySelectorAll('.btn');
    for (const button of buttons) {
      if (!button.hasAttribute('role')) {
        button.setAttribute('role', 'button');
      }
    }
  }
}

Aurelia.register(TemplateCompilerHooks.define(new AriaRoleHook()))
  .app(MyApp)
  .start();
```

This hook assigns the `role="button"` to all elements that have the `.btn` class and do not already have a role defined. This helps ensure that custom-styled buttons are accessible.

### Content Security Policy (CSP) Compliance

If your application needs to comply with strict Content Security Policies, you should ensure that inline styles are not used within your templates. A template compiler hook can help you enforce this policy.

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

class CSPHook {
  compiling(template: HTMLElement) {
    const elementsWithInlineStyles = template.querySelectorAll('[style]');
    for (const element of elementsWithInlineStyles) {
      console.warn(`Inline style removed from element for CSP compliance:`, element);
      element.removeAttribute('style');
    }
  }
}

Aurelia.register(TemplateCompilerHooks.define(new CSPHook()))
  .app(MyApp)
  .start();
```

This hook scans for any elements with inline `style` attributes and removes them, logging a warning for developers to take notice and refactor the styles into external stylesheets.

### Lazy Loading Image Optimization

For performance optimization, you should implement lazy loading for images. The template compiler can automatically add lazy loading attributes to your image tags.

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

class LazyLoadingHook {
  compiling(template: HTMLElement) {
    const images = template.querySelectorAll('img:not([loading])');
    for (const img of images) {
      img.setAttribute('loading', 'lazy');
    }
  }
}

Aurelia.register(TemplateCompilerHooks.define(new LazyLoadingHook()))
  .app(MyApp)
  .start();
```

This hook finds all `img` elements without a `loading` attribute and sets it to `lazy`, instructing the browser to defer loading the image until it is near the viewport.

### Dynamic Theme Class Injection

If your application supports multiple themes, you can use a template compiler hook to inject the relevant theme class into the root of your templates based on user preferences.

```typescript
import Aurelia, { TemplateCompilerHooks } from 'aurelia';

class ThemeClassHook {
  constructor(private currentTheme: string) {}

  compiling(template: HTMLElement) {
    const rootElement = template.querySelector(':root');
    if (rootElement) {
      rootElement.classList.add(`theme-${this.currentTheme}`);
    }
  }
}

const userSelectedTheme = 'dark'; // For example, a dark theme
Aurelia.register(TemplateCompilerHooks.define(new ThemeClassHook(userSelectedTheme)))
  .app(MyApp)
  .start();
```

This hook adds a theme-specific class to the root element of every template, allowing for theme-specific styles to be applied consistently across the application.

## Node APIs used

The default template compiler will turn a template, either in string or already an element, into an element before the compilation. During the compilation, these APIs on the `Node` & `Element` classes are accessed and invoked:

* `Node.prototype.nodeType`
* `Node.prototype.nodeName`
* `Node.prototype.childNodes`
* `Node.prototype.childNode`
* `Node.prototype.firstChild`
* `Node.prototype.textContent`
* `Node.prototype.parentNode`
* `Node.prototype.appendChild`
* `Node.prototype.insertBefore`
* `Element.prototype.attributes`
* `Element.prototype.hasAttribute`
* `Element.prototype.getAttribute`
* `Element.prototype.setAttribute`
* `Element.prototype.classList.add`

If it is desirable to use the default template compiler in any environment other than HTML, ensure the template compiler can hydrate the input string or object into some object with the above APIs.

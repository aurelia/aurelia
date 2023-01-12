---
description: A closer look at registering the Aurelia Validation plugin
---

# Plugin Configuration

Like all Aurelia plugins, you'll usually configure them inside your file. Importing the configuration object from the validation package and passing it into the `register` method provided by Aurelia is all you need to do to register it.

In the previous step [here](validation-tutorial.md), we already went over this. Make sure you have the plugin and relevant adapters installed before continuing.

```typescript
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

Aurelia
  .register(ValidationHtmlConfiguration)
  .app(component)
  .start();
```

This sets up the plugin with the required dependency registrations. You can also customize the validation plugin via the `customize` method, which provides an options object we can use to configure default settings.

```typescript
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

Aurelia
  .register(ValidationHtmlConfiguration.customize((options) => {
    // customization callback
    options.DefaultTrigger = customDefaultTrigger;
  }))
  .app(component)
  .start();
```

The following options are available for customization.

* From `@aurelia/validation`
  * `ValidatorType`: Custom implementation of `IValidator`. Defaults to `StandardValidator`.
  * `MessageProviderType`: Custom implementation of `IValidationMessageProvider`. Defaults to `ValidationMessageProvider`.
  * `ValidationControllerFactoryType`: Custom implementation of the factory for `IValidationController`; Defaults to `ValidationControllerFactory`.
  * `CustomMessages`: Custom validation messages.
* From `@aurelia/validation-html`
  * `HydratorType`: Custom implementation of `IValidationHydrator`. Defaults to `ModelValidationHydrator`.
  * `DefaultTrigger`: Default validation trigger. Defaults to `blur`.
  * `UseSubscriberCustomAttribute`: Use the `validation-errors` custom attribute. Defaults to `true`.
  * `SubscriberCustomElementTemplate`: Custom template for `validation-container` custom element. Defaults to the default template of the custom element.

These options are explained in detail in their respective sections. Note that the categorization of the options is done with the intent of clarifying the origin package of each option. However, as the `@aurelia/validation-html` wraps `@aurelia/validation` all the customization options are available when the `@aurelia/validation-html` package is registered.

The `@aurelia/validation-i18n` package is skipped intentionally for now, as discussed in detail [later](i18n-internationalization.md).

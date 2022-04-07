---
description: How to register and use the Aurelia Validation plugin
---

# Registering the Plugin

The plugin can be registered as follows. If you have not installed the Aurelia Validation plugin and any relevant adapters \(such as validation-html\), please go to the first step and do so before proceeding.

```typescript
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

Aurelia
  .register(ValidationHtmlConfiguration)
  .app(component)
  .start();
```

This sets up the plugin with the required dependency registrations. The registration can be customized as well as shown below.

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

Following options are available for customizations.

* From `@aurelia/validation`
  * `ValidatorType`: Custom implementation of `IValidator`. Defaults to `StandardValidator`.
  * `MessageProviderType`: Custom implementation of `IValidationMessageProvider`. Defaults to `ValidationMessageProvider`.
  * `ValidationControllerFactoryType`: Custom implementation of factory for `IValidationController`; Defaults to `ValidationControllerFactory`.
  * `CustomMessages`: Custom validation messages.
* From `@aurelia/validation-html`
  * `HydratorType`: Custom implementation of `IValidationHydrator`. Defaults to `ModelValidationHydrator`.
  * `DefaultTrigger`: Default validation trigger. Defaults to `blur`.
  * `UseSubscriberCustomAttribute`: Use the `validation-errors` custom attribute. Defaults to `true`.
  * `SubscriberCustomElementTemplate`: Custom template for `validation-container` custom element. Defaults to the default template of the custom element.

These options are explained in details in the respective sections. Note that the categorization of the options are done with the intent of clarifying the origin package of each option. However, as the `@aurelia/validation-html` wraps `@aurelia/validation` all the customization options are available when the `@aurelia/validation-html` package is registered.

The `@aurelia/validation-i18n` package is skipped intentionally for now, as it is discussed in details [later](i18n-internationalization.md).


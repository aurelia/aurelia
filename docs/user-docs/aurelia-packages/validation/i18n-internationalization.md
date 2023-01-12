---
description: Display validation errors in other languages.
---

# I18n Internationalization

If you are already using the `aurelia/i18n` plugin, you would also naturally want localization support for validation. The package provides out-of-the-box localization support.&#x20;

The plugin has a dependency on [`@aurelia/i18n` package](https://github.com/aurelia/aurelia/tree/96e6b82da8095ba591c0fb93c0b1600519d9c022/docs/user-docs/validation/internationalization.md). It assumes that the `@aurelia/i18n` package is correctly registered/configured and uses the I18N services to provide the translations.

To add localization support, you must first register the plugin.

```typescript
import Aurelia from 'aurelia';
import { ValidationI18nConfiguration } from '@aurelia/validation-i18n'; // <-- get the configuration
import { I18nConfiguration } from '@aurelia/i18n';
import { MyApp } from './my-app';
import * as en from "./locales/en.json";
import * as de from "./locales/de.json";

Aurelia
  .register(
    I18nConfiguration.customize((options) => { // <-- take care of I18N configuration as you see fit
      options.initOptions = {
        resources: {
          en: { translation: en },
          de: { translation: de },
        }
      };
    }),
    ValidationI18nConfiguration // <-- register the configuration
  )
  .app(MyApp)
  .start();
```

Note that the `@aurelia/validation-i18n` wraps the `@aurelia/validation` plugin. Stated differently, it [customizes](broken-reference) the `@aurelia/validation` plugin with custom implementations of the following:

* Validation controller factory ( see the `ValidationControllerFactoryType` customization option): This ensures that the validation controller reacts to locale change.
* Message provider (see the `MessageProviderType` customization option): This ensures that localized error message templates and property names are used to create the error messages. With this place, the evaluation `expr` in `withMessageKey(expr)` is used as an I18N key, and the value is looked up in the I18N resources. This also happens for the display names of the properties, where the property name is used as the I18N key.

Check the demo to see this in action.

{% embed url="https://stackblitz.com/edit/au2-validation-localization" %}

All the configuration options of the `@aurelia/validation` plugin are also available from `@aurelia/validation-i18n`. This means it even allows you to provide your implementation of a message provider or validation controller factory! Apart from that, it has two additional configuration options that dictate how the value of the I18N keys is looked up.

*   `DefaultNamespace`

    By default, the value of the keys is searched in `translation` namespace. Using this configuration option that can be changed. This is useful if you want to separate the validation resources from your regular 18N resources. See the example below.

{% embed url="https://stackblitz.com/edit/au2-validation-localization-defaultnamespace?ctl=1" %}

*   `DefaultKeyPrefix`

    Instead of using a separate namespace, a key prefix can be used for the keys related to validation resources. This is shown in the example below.

{% embed url="https://stackblitz.com/edit/au2-validation-localization-defaultkeyprefix?ctl=1" %}

Naturally, the `DefaultNamespace` and the `DefaultKeyPrefix` can be used together.

{% embed url="https://stackblitz.com/edit/au2-validation-localization-defaultnamespace-defaultkeyprefix?ctl=1" %}

It should not come as any surprise that localization also works for [model-based rules](model-based-validation.md) when appropriate `messageKey` is specified in the rule definition.

{% embed url="https://stackblitz.com/edit/au2-validation-localization-model-based-rules?ctl=1" %}

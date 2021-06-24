# Validate Binding Behavior

The `validate` binding behavior, as the name suggests adds the validation behavior to a property binding. In other words, it "mark"s the associated property binding as a target for validation, by registering the binding to the validation controller. This is how the validation controller comes to know of the bindings that needs to be validated when `validationController.validate()` method is called.

You must have noticed plenty example of the `validate` binding behavior in the demos so far. For completeness, this can be used as follows.

```markup
<html-element target.bind="source & validate:[trigger]:[validationController]:[rules]"></html-element>
```

Note that the binding behavior has three optional arguments, namely trigger, validation controller, and rules.

## Validation trigger

This dictates when the validation is performed. The valid values are as follows.

* `manual`: Use the validation controller's `validate()` method to validate all bindings.

{% embed url="https://stackblitz.com/edit/au2-validation-trigger-manual?ctl=1" caption="" %}

* `blur`:  Validate the binding when the binding's target element fires a DOM "blur" event.

{% embed url="https://stackblitz.com/edit/au2-validation-trigger-blur?ctl=1" caption="" %}

* `focusout`:  Validate the binding when the binding's target element fires a DOM "focusout" event. This is useful when the actual input is wrapped in a custom element and the `validate` binding behavior is used on the custom element. In that case the `blur` trigger does not work as the `blur` event does not bubble. See the difference in action below.

{% embed url="https://stackblitz.com/edit/au2-validation-trigger-focusout?ctl=1" caption="" %}

* `change`: Validate the binding when the source property property is updated \(usually triggered by some change in view\).

{% embed url="https://stackblitz.com/edit/au2-validation-trigger-change?ctl=1" caption="" %}

* `changeOrBlur`: Validate the binding when the binding's target element fires a DOM "blur" event as well as when the source property is updated.

{% embed url="https://stackblitz.com/edit/au2-validation-trigger-changeorblur?ctl=1" caption="" %}

* `changeOrFocusout`: Validate the binding when the binding's target element fires a DOM "focusout" event as well as when the source property is updated.

{% embed url="https://stackblitz.com/edit/au2-validation-trigger-changeorfocusout?ctl=1" caption="" %}

There is an important point to note about the `changeOrEVENT` triggers. The change-triggered validation is ineffective till the associated property is validated once, either by manually calling `ValidationController#validate` or by event-triggered \(`blur` or `focusout`\) validation. This prevents showing validation failure message immediately in case of an incomplete input, which might be the case if validation is triggered for every change. Note the distinction made between incomplete and invalid input. The event-triggered validation is ineffective until the property is dirty; i.e. any changes were made to the property. This prevents showing a validation failure message when there is a `blur` or `focusout` event without changing the property. This behavior delays "punish"ing the user and "reward"s eagerly.

The examples aboves shows an explicit usage of trigger. However this is a optional value; when used it overrides the default trigger configured. When the value is omitted the default trigger is used for that instance. The default validation trigger is `focusout`, although it can be changed using the `DefaultTrigger` registration customization option.

```typescript
import { ValidationHtmlConfiguration, ValidationTrigger } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

Aurelia
  .register(ValidationHtmlConfiguration.customize((options) => {
    // customization callback
    options.DefaultTrigger = ValidationTrigger.changeOrFocusout;
  }))
  .app(component)
  .start();
```

## Explicit validation controller

The binding behavior by default registers the binding to the closest \(in terms of dependency injection container\) available instance of validation controller. Note that the validation controller instance can be made available for the scope using the `@newInstanceForScope` decorator \(refer [Injecting a controller instance](validation-controller.md#injecting-a-controller-instance) for more details\). If no instance of validation controller is available, it throws error.

However, an instance of validation can be explicitly bound to the binding behavior, using the positional argument. This is useful when you need to use multiple instances of validation controller to perform different set of validation. In the example below, there are two injected controllers and the property `person.age` the `validationController2` is used. Playing with the example you can see that the `person.age` does not get validated by the scoped validation controller instance.

{% embed url="https://stackblitz.com/edit/au2-validation-validate-controller?ctl=1" caption="" %}


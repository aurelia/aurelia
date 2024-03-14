---
description: How to display validation errors in your UI.
---

# Displaying Errors

The validation controller maintains the active list of validation results which can be iterated to display the errors in UI.

```html
<ul>
  <li repeat.for="result of validationController.results">
    <template if.bind="!result.valid">${result}</template>
  </li>
</ul>
```

{% embed url="https://stackblitz.com/edit/au2-validation-display-errors?ctl=1" caption="" %}

There are also some out-of-the-box components that can be used to display the errors. These are discussed in the following sections.

## `validation-errors` custom attribute

This custom attribute can be used to bind the errors for children the target elements.

```html
<div validation-errors.from-view="nameErrors"> <!--binds all errors for name to the "nameErrors" property-->
  <input value.bind="person.name & validate">
  <div>
    <span repeat.for="error of nameErrors">${error.result.message}</span>
  </div>
</div>
<div validation-errors.from-view="ageErrors"> <!--binds all errors for age to the "ageErrors" property-->
  <input value.bind="person.age & validate">
  <div>
    <span repeat.for="error of ageErrors">${error.result.message}</span>
  </div>
</div>
```

Note that this in itself does not show any error, unless errors are iterated to be bound with the view. An example can be seen below.

{% embed url="https://stackblitz.com/edit/au2-validation-validation-errors-ca?ctl=1" caption="" %}

A point to note is that multiple validation targets can also be used for a single `validation-errors` custom attribute, and the errors for multiple targets will be captured the same way.

```html
<div validation-errors.from-view="errors"> <!--binds all errors for name, and age to the "errors" property-->
  <input value.bind="person.name & validate">
  <input value.bind="person.age & validate">
  <div>
    <span repeat.for="error of errors">${error.result.message}</span>
  </div>
</div>
```

The usage of this custom element can be deactivated by using `UseSubscriberCustomAttribute` configuration option.

```typescript
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

Aurelia
  .register(ValidationHtmlConfiguration.customize((options) => {
    // customization callback
    options.UseSubscriberCustomAttribute = false;
  }))
  .app(component)
  .start();
```

This is useful if you have a custom attribute of the same name, and want to use that over this out-of-the-box custom attribute.

### `validation-container` custom element

The `validation-container`custom element also has similar goal of capturing the validation errors for the children target elements. Additionally, it provides a template to display the errors as well. This helps in reducing the boilerplate created by the `validation-errors` custom attribute. For example, using this custom element, displaying the errors reduces to the following.

```html
<validation-container>
  <input value.bind="person.name & validate">
</validation-container>
<validation-container>
  <input value.bind="person.age & validate">
</validation-container>
```

{% embed url="https://stackblitz.com/edit/au2-validation-validation-container-ce?ctl=1" caption="" %}

There are couple of important points to note about the examples shown above. The first validation target shown in the example uses the default template of the custom element. This custom element template is based on two `slot`s as shown below.

```html
<slot>
  <!--meant for validation target-->
</slot>
<slot name='secondary'>
  <!--here goes error-->
</slot>
```

The results of using the default template may not also suite your app or esthetics. However content can be injected into the slot from Light DOM \(in case you are unfamiliar with the concepts, you are encouraged to give this [excellent article](https://developers.google.com/web/fundamentals/web-components/shadowdom#styling) a read\) as shown in the example. Although traditionally the default slot is meant for the validation target\(s\), it can also be used to inject the error template, as shown in the example above.

It is quite understandable that the CSS-containment of the Shadow DOM can come in the way of styling the custom element as per your need. It can be argued that this can be facilitated using CSS variables extensively. However, there is a far easy alternative to reach the same goal is offered by facilitating the customization of the whole template. To this end, use the `SubscriberCustomElementTemplate` configuration option.

{% embed url="https://stackblitz.com/edit/au2-validation-validation-container-ce-custom-template?ctl=1" caption="" %}

There is another aspect of this configuration option. When a `null`, `undefined`, or '' \(empty string\) is used as the value for this configuration option, it deactivates the usage of this custom element. This is in sense similar to the `UseSubscriberCustomAttribute` configuration option.

### `ValidationResultPresenterService`

Unlike the previous two approaches, this is a standalone service that manipulates the DOM directly. That it adds elements to DOM for every new errors and removes elements from DOM that are associated with old errors.

To use this, you need to instantiate it and register it with the validation controller.

```typescript
import { IValidationController, ValidationResultPresenterService } from '@aurelia/validation';

export class MyApp {
  private presenter: ValidationResultPresenterService;

  public constructor(
     @newInstanceForScope(IValidationController) private validationController: IValidationController,
  ) {
      this.presenter = new ValidationResultPresenterService();
      this.validationController.addSubscriber(this.presenter);
  }
}
```

{% embed url="https://stackblitz.com/edit/au2-validation-validation-validationresultpresenterservice?ctl=1" caption="" %}

The error rendering process can be completely overridden in the child classes. The use methods for overriding are described below.

* `add`: this adds a new error to DOM. Override this if you want to completely change the process of adding new errors.
* `remove`: this removes an old error from the DOM. Override this if you want to completely change the process of removing old errors.
* `getValidationMessageContainer`: As the name suggests it provides container element with respect to current target. The default behavior is to look for an element with the attribute `validation-result-container` that is contained by the parent element of the current target element. If there is none found a `div` is created with the attribute and appended to the parent element.
* `showResults`: This is the method that appends the errors to the container. By default a `span` with the error message is added for every errors whereas the valid results are skipped.

To avoid direct DOM manipulation, it is highly encouraged to use the previously mentioned custom attribute, and custom element.

> One commonality across these components is that all these are different implementations of the [`ValidationResultsSubscriber` interface](validation-controller.md#addSubscriber-and-removeSubscriber).


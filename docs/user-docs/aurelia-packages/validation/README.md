# Validation

This guide explains how to validate the user input for your app using the validation plugin. The plugin gives you enough flexibility to write your own rules rather than being tied to any external validation library.

{% hint style="success" %}
**Here's what you'll learn...**

* How to register and customize the plugin
* How to define the validation rules
* How to validate the data
* How to apply model-based validation rules
{% endhint %}

> Note If you have already used the `aurelia-validation` plugin previously and are migrating your existing Aurelia app to Aurelia vNext then [jump straight to the migration guide](../../developer-guides/migrating-to-aurelia-2/).

### Install and register the plugin

You need to install two packages to use Aurelia validation. The core validation plugin `@aurelia/validation` and an adapter. Currently, only one adapter is available for validating HTML-based applications.

#### Installation

```bash
npm i @aurelia/validation @aurelia/validation-html
```

#### Register

```typescript
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import Aurelia from 'aurelia';

Aurelia
  .register(ValidationHtmlConfiguration)
  .app(component)
  .start();
```

### Quick rundown

To use the validation plugin, all you have to do is inject the validation controller as well as the validation rules object to register validation rules.

{% tabs %}
{% tab title="Typescript" %}
```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class AwesomeComponent {
  private person: Person; // Let us assume that we want to validate instance of Person class
  public constructor(
    private validationController: IValidationController = resolve(newInstanceForScope(IValidationController)),
    validationRules: IValidationRules = resolve(IValidationRules)
  ) {
    this.person = new Person();

    validationRules
      .on(this.person)
      .ensure('name')
        .required()
      .ensure('age')
        .required()
        .min(42);
  }

  public async submit() {
    const result = await this.validationController.validate();
    if(result.valid) {
      // Yay!! make that fetch now
    }
  }
}
```
{% endtab %}

{% tab title="Javascript" %}
```javascript
import { inject, resolve, newInstanceForScope } from '@aurelia/kernel'
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

@inject(IValidationRules)

export class AwesomeComponent {
  validationController = resolve(newInstanceForScope(IValidationController));

  constructor(validationRules) {
    this.person = new Person();

    validationRules
      .on(this.person)
      .ensure('name')
        .required()
      .ensure('age')
        .required()
        .min(42);
  }

 async submit() {
    const result = await this.validationController.validate();

    if(result.valid) {
      // Yay!! make that fetch now
    }
  }
}
```
{% endtab %}
{% endtabs %}

Inside our HTML, we use the `validate` binding behavior to signal to Aurelia that we want to validate these bindings. You might notice that both `name` and `age` appear in our view model above where we set some rules up.

```html
<form submit.delegate="submit()">
  <input value.bind="person.name & validate">
  <input value.bind="person.age & validate">
</form>
```

> `resolve(newInstanceForScope(IValidationController))` injects a new instance of validation controller which is made available to the children of `awesome-component`. More on validation controller [later](broken-reference/).

### Demo

A playable demo can be seen below if you want to see the validation plugin in action. You can try adding new properties and playing around with the code to learn how to use the validation plugin.

{% embed url="https://stackblitz.com/edit/au2-validation-required" %}

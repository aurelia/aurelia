# Validating form input

This guide explains how to validate the user input for your app using the validation plugin. The plugin gives you enough flexibility to write your own rules rather than being tied to any external validation library.

{% hint style="success" %}
**Here's what you'll learn...**

* How to register and customize the plugin
* How to define the validation rules
* How to validate the data
* How to apply model-based validation rules
{% endhint %}

> Note If you have already used the `aurelia-validation` plugin previously and are migrating your existing Aurelia app to Aurelia vNext then [jump straight to the migration guide](migration-guide.md).

* Install the plugin using:

  ```bash
  npm i @aurelia/validation @aurelia/validation-html
  ```

* Register the plugin in your app with:

  ```typescript
  import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
  import Aurelia from 'aurelia';

  Aurelia
    .register(ValidationHtmlConfiguration)
    .app(component)
    .start();
  ```

* Inject the infra to your view-model and define rules, and use `validate` binding behavior in your markup.

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

  ```html
  <form submit.delegate="submit()">
    <input value.bind="person.name & validate">
    <input value.bind="person.age & validate">
  </form>
  ```

  > `newInstanceForScope(IValidationController)` resolves a new instance of validation controller which is made available to the children of `awesome-component`. More on validation controller [later](validation-controller.md).

Here is one similar playable demo, if you want to explore on your own!

{% embed url="https://stackblitz.com/edit/au2-validation-required" caption="" %}


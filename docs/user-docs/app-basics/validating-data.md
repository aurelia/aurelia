---
description: Ensure data quality and correctness for your Aurelia app.
---

# Validating Data

This documentation explains how to validate the user input for your app using the validation plugin.
The plugin gives you enough flexibility to write your own rules rather than being tied to any external validation library.

{% hint style="success" %}
**Here's what you'll learn...**

* How to register and customize the plugin
* How to define the validation rules
* How to validate the data
* How to apply model-based validation rules
{% endhint %}

> Note If you have already used the `aurelia-validation` plugin previously and are migrating your existing Aurelia app to Aurelia vNext then [jump straight to the migration guide](validating-data.md#migration-guide-and-breaking-changes).

## Getting started

* Install the plugin using:

  ```bash
  npm i @aurelia/validation
  ```

* Register the plugin in your app with:

  ```typescript
  import { ValidationConfiguration } from '@aurelia/validation';
  import Aurelia from 'aurelia';

  Aurelia
    .register(ValidationConfiguration)
    .app(component)
    .start();
  ```

* Inject the infra to your view-model and define rules, and use `validate` binding behavior in your markup.

  {% tabs %}
  {% tab title="awesome-component.ts" %}
  ```typescript
  import { IValidationController, IValidationRules } from '@aurelia/validation';

  export class AwesomeComponent {
    private person: Person; // Let's assume that we want to validate instance of Person class
    public constructor(
      @newInstanceForScope(IValidationController) private validationController: IValidationController,
      @IValidationRules validationRules: IValidationRules
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

  {% tab title="awesome-component.html" %}
  ```html
  <form submit.delegate="submit()">
    <input value.bind="person.name & validate">
    <input value.bind="person.age & validate">
  </form>
  ```
  {% endtab %}
  {% endtabs %}

  > `@newInstanceForScope(IValidationController)` injects a new instance of validation controller which is made available to the children of `awesome-component`. More on validation controller [later](TODO).

That's all you need to do to get started with the plugin.
However, read on to understand how the plugin functions, and offers flexible API to support your app.

## How does it work

This section gives a simplified overview of how this plugin works, so that you can use it more confidence.
If this section not understandable now, or if you are starting new with the plugin, you can skip this section for now, and revisit later.

- The validationRules (`IValidationRules` instance) allows defining validation rules on a class or object/instance. The defined rules are stored as metadata in a global registry.
  ![Define rules](../../images/validation/seq-define-rules.svg)
- The instance of `PropertyRule` instance hold the collection of rules defined for a property. In simplified terms it can be described by the diagram below.
  ![Rules class diagram](../../images/validation/class-rules.svg)
- The validator (`IValidator` instance) allows you to execute a validate instruction, which instructs which object and property needs to be validated (more details on the validation instruction discussed [later](TODO)). The validator gets the matching rules from the RulesRegistry (see the diagram above), and executes those.
  ![Rules class diagram](../../images/validation/seq-validator.svg)
- The last piece of the puzzle is to getting the rules executed on demand. For this the validation controller (`IValidationController` instance) is used along with the `validate` binding behavior (more on these later). The binding behavior registers the property binding with the validation controller, and on configured event, instructs the controller to validate the binding. The validation controller eventually ends up invoking the `IValidator#validate` with certain instruction which triggers the workflow shown in the last diagram.
  ![Rules class diagram](../../images/validation/seq-validation-controller.svg)

## Migration Guide and Breaking Changes
TODO

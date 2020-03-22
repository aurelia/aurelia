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
  ```mermaid
  sequenceDiagram
    ViewModel->>ValidationRules: Start defining validation rules on target
    ValidationRules->>RulesRegistry: Set validation rules on target
    RulesRegistry->>RulesRegistry: Set rules metadata annotation on object
    ValidationRules->>ViewModel: Handle to define further rules
    ViewModel->>ValidationRules: Define rule on property 'x'
    ValidationRules->>ViewModel: PropertyRule instance for `x`with a collection of rules
    Note over ViewModel,ValidationRules: Further rules and customizations<br/>definition.
  ```
- The instance of `PropertyRule` instance hold the collection of rules defined for a property. In simplified terms it can be described by the diagram below.
  ```mermaid
  classDiagram
    BaseValidationRule <|-- RequiredRule
    BaseValidationRule <|-- RegexRule
    BaseValidationRule <|-- CustomRule
    PropertyRule o-- BaseValidationRule

    class PropertyRule {
      +RuleProperty property
      +BaseValidationRule[][] $rules
      +validate(args) Promise~ValidationResult[]~
    }
    class BaseValidationRule {
      +execute(value, object) boolean
      +canExecute(object) boolean
    }
    class RequiredRule {
    }
    class RegexRule {
    }
    class CustomRule {
    }
  ```
- The validator (`IValidator` instance) allows you to execute a validate instruction, which instructs which object and property needs to be validated (more details on the validation instruction discussed [later](TODO)). The validator gets the matching rules from the RulesRegistry (see the diagram above), and executes those.
  ```mermaid
  sequenceDiagram
    Validator->>RulesRegistry: Get rules for object
    RulesRegistry->>Validator: rules[]
    loop property rule
      Validator->>PropertyRule: validate() (async)
      loop rule in $rules
        PropertyRule->>PropertyRule: execute rule (async)
        opt invalid
          PropertyRule->>MessageProvider: get validation message
          MessageProvider->>PropertyRule: validation message
        end
      end
      PropertyRule->>Validator: ValidationResults[]
    end
    Validator->>Validator: flatten results and return
  ```
- The last piece of the puzzle is to getting the rules executed on demand. For this the validation controller (`IValidationController` instance) is used along with the `validate` binding behavior (more on these later). The binding behavior registers the property binding with the validation controller, and on configured event, instructs the controller to validate the binding. The validation controller eventually ends up invoking the `IValidator#validate` with certain instruction which triggers the workflow shown in the last diagram.
  ```mermaid
  sequenceDiagram
    participant VM/BB
    participant VC as ValidationController
    participant V as Validator
    note left of VM/BB: ViewModel or<br/>BindingBehavior

    VM/BB->>VC: validate(instruction?) (async)
    alt instruction present
      VC->>V: validate(instruction) (async)
      V->>VC: Validation results
    else
      loop every binding
        VC->>VC: create instruction for binding
        VC->>V: validate(instruction_binding) (async)
      V->>VC: Validation results
      end
      loop every object
        VC->>VC: create instruction for object
        VC->>V: validate(instruction_object) (async)
      V->>VC: Validation results
      end
    end
    VC->>VC: process the results in terms of old and new results
    loop every subscriber
      VC->>Subscriber: notify
    end
    VC->>VM/BB: result
  ```

## Migration Guide and Breaking Changes
TODO

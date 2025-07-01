---
description: >-
  Familiarize yourself with the Aurelia Validation plugin and how it all pieces
  together.
---

# Architecture

## Overview

There are three different interrelated packages for validation. The relation between the packages are depicted in the following diagram.

![Architecture](<../../.gitbook/assets/architecture (1) (1) (1) (1) (1) (1) (1).svg>)

* `@aurelia/validation`: Provides the core validation functionality. Hosts the validator, out-of-the-box rule implementations, and the validation message provider.
* `@aurelia/validation-html`: Provides the view-specific functionalities such as validation controller, `validate` binding behavior, and subscribers. It wraps the `@aurelia/validation` package so that you do not need to register both packages.
* `@aurelia/validation-i18n`: Provides localized implementation of the validation message provider and validation controller. Wraps the `@aurelia/validation-html` package.

The rest of the document assumes that validation is view is more common scenario. For that reason, the demos are mostly integrated with view.

## How does it work

* The validationRules (`IValidationRules` instance) allows defining validation rules on a class or object/instance. The defined rules are stored as metadata in a global registry.

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

* The instance of `PropertyRule` instance hold the collection of rules defined for a property. In simplified terms it can be described by the diagram below.

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
    +execute(value, object) boolean
  }
  class RegexRule {
    +execute(value, object) boolean
  }
  class CustomRule {
    +execute(value, object) boolean
  }
```

* The validator (`IValidator` instance) allows you to execute a [validate instruction](broken-reference), which instructs which object and property needs to be validated. The validator gets the matching rules from the RulesRegistry (see the diagram above), and executes those.

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
* The last piece of the puzzle is to getting the rules executed on demand. For this the validation controller (`IValidationController` instance) is used along with the `validate` binding behavior (more on these later). The binding behavior registers the property binding with the validation controller, and on configured event, instructs the controller to validate the binding. The validation controller eventually ends up invoking the `IValidator#validate` with certain instruction which triggers the workflow shown in the last diagram. The following diagram shows a simplified version of this.

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
  else not present
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

The following sections describe the API in more detail, which will help understanding the concepts further.

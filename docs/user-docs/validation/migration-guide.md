---
description: Creating and customing Aurelia Validation rules to ensure data is validated.
---

# Migration Guide & Breaking Changes

This section outlines the breaking changes introduced by `@aurelia/validation*` as compared to the predecessor `aurelia-validation`. However, it is recommended that you read the documentation as there are many new features that has been added.

* Instead of a single validation package, the functionalities are arranged in [three different packages](architecture.md). These are `@aurelia/validation` \(provides core functionalities\), `@aurelia/validation-html` \(provides integration with view\), and `@aurelia/validation-i18n` \(provides localization support for validation in view\).
* Usage of `ValidationRules` in terms of defining rules is bit different. The example below shows the difference. Refer the [Defining rules](defining-rules.md) section for the details.

  ```typescript
  // aurelia-validation
    ValidationRules
      .ensure('firstName')
        .required()
      .on(this.person);

  // @aurelia/validation
  import { IValidationRules } from '@aurelia/validation';
  //...
  constructor(
    @IValidationRules validationRules: IValidationRules
  ) {
    ValidationRules
      .on(this.person)
      .ensure('firstName')
        .required();
  }
  ```

* Named registration of reusable custom rules is not supported any longer in favor of simply using an instance of the rule implementation. The example below shows the difference. Refer the [Customizing rules](defining-rules.md#customizing-rules) section for the details.

  ```typescript
  // aurelia-validation
  ValidationRules.customRule(
    'customRule',
    // rule body
    // rule config
  );

  ValidationRules
    .ensure('property')
      .satisfiesRule('customRule' ...);

  // @aurelia/validation
  class CustomRule extends BaseValidationRule { // of implements IValidationRule
    // rule config
    public execute() {
      // rule body
    }
  }

  validationRules
    .on(obj)
    .ensure('property')
      .satisfiesRule(new CustomRule(...));
  ```

* Validator interface has been changed to have only one method named `validate` equipped with validate instruction. Refer the [Validator and validate instruction](defining-rules.md#validator-and-validate-instruction) section for the details.
* Usage of validation controller factory is changed. Instead of using `controllerFactory.createForCurrentScope();` you need to use the argument decorator `@newInstanceForScope(IValidationController)` syntax. Refer the [Injecting a controller instance](validation-controller.md#injecting-a-controller-instance) section for the details.
* No validation renderer in favor of `ValidationResultsSubscriber`. Refer the [`addSubscriber` and `removeSubscriber`](validation-controller.md#addSubscriber-and-removeSubscriber) section for the details.


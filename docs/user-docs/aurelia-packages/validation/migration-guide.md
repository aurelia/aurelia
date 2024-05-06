---
description: Creating and customing Aurelia Validation rules to ensure data is validated.
---

# Migration Guide & Breaking Changes

This section outlines the breaking changes introduced by `@aurelia/validation*` as compared to the predecessor `aurelia-validation`. However, it is recommended that you read the documentation, as many new features have been added.

## A list of differences

### Functionality is now in three different packages

Instead of a single validation package, the functionalities are arranged in [three different packages](./). These are `@aurelia/validation` (provides core functionalities), `@aurelia/validation-html` (provides integration with the view), and `@aurelia/validation-i18n` (provides localization support for validation in view).

### Rules are defined differently using ValidationRules

Usage of `ValidationRules` in terms of defining rules is a bit different. The example below shows the difference. Refer to the [Defining rules](defining-rules.md) section for the details.

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
  validationRules: IValidationRules = resolve(IValidationRules)
) {
  ValidationRules
    .on(this.person)
    .ensure('firstName')
      .required();
}
```

### Named registration of custom rules is no longer supported

Named registration of reusable custom rules is no longer supported in favor of simply using an instance of the rule implementation. The example below shows the difference. Refer to the [Customizing rules](defining-rules.md) section for the details.

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

### The validator interface only has one method

The validator interface has been changed to have only one `validate` method equipped with validation instructions. Refer to the [Validator and validate instruction](validate-binding-behavior.md) section for the details.

### Validation controller factory usage changed

The usage of the validation controller factory is changed. Instead of using `controllerFactory.createForCurrentScope();` , you need to inject the `newInstanceForScope(IValidationController)` (example: `resolve(newInstanceForScope(IValidationController))`). Refer to the [Injecting a controller instance](validation-controller.md) section for the details.

### Validation renderer has been removed

No validation renderer in favor of `ValidationResultsSubscriber`. Refer to the [`addSubscriber` and `removeSubscriber`](validation-controller.md#addsubscriber-and-removesubscriber) section for the details.

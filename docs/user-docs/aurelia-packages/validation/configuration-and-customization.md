# Configuration and Customization

Aurelia's validation system is highly customizable, allowing you to configure validation behavior, replace core components, and customize how validation integrates with your application. This guide covers all available configuration options.

## Overview

The validation system provides two levels of configuration:

1. **Core Validation Configuration** (`ValidationConfiguration`) - Configure the core validation engine
2. **HTML Integration Configuration** (`ValidationHtmlConfiguration`) - Configure how validation integrates with HTML/UI

## Basic Configuration

### Using Default Configuration

The simplest way to register validation is with the default configuration:

```typescript
import Aurelia from 'aurelia';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { MyApp } from './my-app';

Aurelia
  .register(ValidationHtmlConfiguration)
  .app(MyApp)
  .start();
```

### Customizing Configuration

Use the `.customize()` method to modify configuration options:

```typescript
import Aurelia from 'aurelia';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { ValidationTrigger } from '@aurelia/validation-html';
import { MyApp } from './my-app';

Aurelia
  .register(
    ValidationHtmlConfiguration.customize((options) => {
      // Change when validation triggers
      options.DefaultTrigger = ValidationTrigger.change;

      // Disable the validation-errors custom attribute
      options.UseSubscriberCustomAttribute = false;

      // Use a custom error container template
      options.SubscriberCustomElementTemplate = `
        <div class="custom-error-container">
          <span class="error-icon">⚠</span>
          <span class="error-text">\${error.result.message}</span>
        </div>
      `;
    })
  )
  .app(MyApp)
  .start();
```

## HTML Configuration Options

### DefaultTrigger

Controls when validation automatically runs for inputs using the `& validate` binding behavior.

**Type:** `ValidationTrigger` enum

**Default:** `ValidationTrigger.focusout`

**Available Triggers:**
- `ValidationTrigger.blur` - Validate when input loses focus
- `ValidationTrigger.focusout` - Validate when input or any descendant loses focus
- `ValidationTrigger.change` - Validate immediately on every change
- `ValidationTrigger.changeOrBlur` - Validate on change after first blur
- `ValidationTrigger.changeOrFocusout` - Validate on change after first focusout
- `ValidationTrigger.manual` - Only validate when explicitly called

**Example:**

```typescript
ValidationHtmlConfiguration.customize((options) => {
  // Validate immediately on every keystroke
  options.DefaultTrigger = ValidationTrigger.change;
});
```

You can also override the trigger per-binding in your templates:

```html
<!-- Use change trigger for this specific input -->
<input type="text" value.bind="username & validate:change">

<!-- Use manual trigger - only validate when controller.validate() is called -->
<input type="text" value.bind="email & validate:manual">
```

### UseSubscriberCustomAttribute

Controls whether the `validation-errors` custom attribute is registered.

**Type:** `boolean`

**Default:** `true`

**When to disable:**
Set to `false` if you don't need the `validation-errors` attribute (e.g., if you're using a custom error presentation strategy).

**Example:**

```typescript
ValidationHtmlConfiguration.customize((options) => {
  // Disable validation-errors attribute
  options.UseSubscriberCustomAttribute = false;
});
```

### SubscriberCustomElementTemplate

Customizes the template used for the validation container custom element.

**Type:** `string`

**Default:**
```html
<span class="\${error.result.valid ? 'validation-valid' : 'validation-error'}">\${error.result.message}</span>
```

**Usage:**

```typescript
ValidationHtmlConfiguration.customize((options) => {
  options.SubscriberCustomElementTemplate = `
    <div class="error-message \${error.result.valid ? 'valid' : 'invalid'}">
      <i class="icon-\${error.result.valid ? 'check' : 'warning'}"></i>
      <span>\${error.result.message}</span>
    </div>
  `;
});
```

**Template Context:**
The template has access to an `error` property with the following structure:
```typescript
{
  result: ValidationResult  // Contains: valid, message, propertyName, object, rule, etc.
}
```

### ValidationControllerFactoryType

Specifies the factory class used to create validation controller instances.

**Type:** `Class<IFactory<Constructable<IValidationController>>>`

**Default:** `ValidationControllerFactory`

**When to customize:**
Create a custom factory if you need to modify how validation controllers are instantiated or add custom behavior to all controllers.

**Example:**

```typescript
import { IFactory, Constructable, IContainer, Key } from '@aurelia/kernel';
import { IValidationController, ValidationController } from '@aurelia/validation-html';

export class CustomValidationControllerFactory implements IFactory<Constructable<IValidationController>> {
  public Type: Constructable<IValidationController> = undefined!;

  public registerTransformer(): boolean {
    return false;
  }

  public construct(container: IContainer, dynamicDependencies?: Key[]): IValidationController {
    const controller = container.invoke(ValidationController, dynamicDependencies);

    // Add custom initialization
    console.log('Custom validation controller created');

    return controller;
  }
}

// Register the custom factory
ValidationHtmlConfiguration.customize((options) => {
  options.ValidationControllerFactoryType = CustomValidationControllerFactory;
});
```

## Core Validation Options

These options configure the core validation engine and can be set using `ValidationConfiguration` or through `ValidationHtmlConfiguration`.

### ValidatorType

Specifies the validator implementation to use.

**Type:** `Class<IValidator>`

**Default:** `StandardValidator`

**When to customize:**
Create a custom validator if you need to modify core validation behavior or add custom validation processing logic.

**Example:**

```typescript
import { IValidator, StandardValidator, ValidateInstruction } from '@aurelia/validation';

export class CustomValidator extends StandardValidator {
  public async validate(instruction: ValidateInstruction): Promise<ValidationResult[]> {
    console.log('Custom validation starting...');
    const results = await super.validate(instruction);
    console.log('Custom validation completed with', results.length, 'results');
    return results;
  }
}

ValidationHtmlConfiguration.customize((options) => {
  options.ValidatorType = CustomValidator;
});
```

### MessageProviderType

Specifies the message provider implementation for validation error messages.

**Type:** `Class<IValidationMessageProvider>`

**Default:** `ValidationMessageProvider`

**When to customize:**
Replace the message provider to customize how validation messages are parsed, interpolated, or retrieved.

**Example:**

```typescript
import {
  IValidationMessageProvider,
  ValidationMessageProvider,
  IValidationRule
} from '@aurelia/validation';
import { Interpolation, PrimitiveLiteralExpression } from '@aurelia/expression-parser';

export class CustomMessageProvider extends ValidationMessageProvider {
  public getMessage(rule: IValidationRule): Interpolation | PrimitiveLiteralExpression {
    // Add custom logic for message retrieval
    const message = super.getMessage(rule);

    // You could modify messages, add prefixes, etc.
    console.log('Getting message for rule:', rule);

    return message;
  }
}

ValidationHtmlConfiguration.customize((options) => {
  options.MessageProviderType = CustomMessageProvider;
});
```

### CustomMessages

Provides custom messages for validation rules, either globally or for specific rules.

**Type:** `ICustomMessage[]`

**Default:** `[]`

**Structure:**
```typescript
interface ICustomMessage {
  rule?: string;          // Rule name (e.g., 'required', 'email')
  messageKey?: string;    // Message key for the rule
  message: string;        // The custom message template
}
```

**Example:**

```typescript
ValidationHtmlConfiguration.customize((options) => {
  options.CustomMessages = [
    // Override default "required" message
    {
      rule: 'required',
      message: 'This field cannot be empty.'
    },

    // Override email validation message
    {
      rule: 'email',
      message: 'Please provide a valid email address.'
    },

    // Custom message for specific messageKey
    {
      messageKey: 'minLength',
      message: '${$displayName} needs at least ${$rule.length} characters.'
    },

    // Global fallback message
    {
      message: 'The value you entered is not valid.'
    }
  ];
});
```

Messages can use interpolation:
- `${$displayName}` - The display name of the property
- `${$value}` - The current value
- `${$object}` - The object being validated
- `${$rule.propertyName}` - Access rule properties (e.g., `${$rule.min}`, `${$rule.max}`)

### HydratorType

Specifies the hydrator implementation for deserializing validation rules from data (e.g., JSON from a server).

**Type:** `Class<IValidationExpressionHydrator>`

**Default:** `ModelValidationExpressionHydrator`

**When to customize:**
Replace the hydrator if you need to support a different rule serialization format or add support for custom rule types in model-based validation.

**Example:**

```typescript
import {
  ModelValidationExpressionHydrator,
  IValidationRule,
  IValidationRules
} from '@aurelia/validation';

export class CustomHydrator extends ModelValidationExpressionHydrator {
  protected hydrateRule(ruleName: string, ruleConfig: any): IValidationRule {
    // Handle custom rule types
    switch (ruleName) {
      case 'customRule':
        return new CustomRule(ruleConfig.customProperty);
      default:
        return super.hydrateRule(ruleName, ruleConfig);
    }
  }
}

ValidationHtmlConfiguration.customize((options) => {
  options.HydratorType = CustomHydrator;
});
```

## Complete Configuration Example

Here's a comprehensive example showing multiple customization options:

```typescript
import Aurelia from 'aurelia';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';
import { ValidationTrigger } from '@aurelia/validation-html';
import { MyApp } from './my-app';

Aurelia
  .register(
    ValidationHtmlConfiguration.customize((options) => {
      // HTML-specific options
      options.DefaultTrigger = ValidationTrigger.changeOrFocusout;
      options.UseSubscriberCustomAttribute = true;
      options.SubscriberCustomElementTemplate = `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-circle"></i>
          \${error.result.message}
        </div>
      `;

      // Core validation options
      options.CustomMessages = [
        {
          rule: 'required',
          message: '⚠ ${$displayName} is required.'
        },
        {
          rule: 'email',
          message: '📧 Please enter a valid email address.'
        },
        {
          rule: 'minLength',
          message: '${$displayName} must have at least ${$rule.length} characters.'
        },
        {
          rule: 'maxLength',
          message: '${$displayName} cannot exceed ${$rule.length} characters.'
        },
        {
          rule: 'range',
          message: '${$displayName} must be between ${$rule.min} and ${$rule.max}.'
        }
      ];

      // Use custom implementations if needed
      // options.ValidatorType = CustomValidator;
      // options.MessageProviderType = CustomMessageProvider;
      // options.HydratorType = CustomHydrator;
      // options.ValidationControllerFactoryType = CustomControllerFactory;
    })
  )
  .app(MyApp)
  .start();
```

## Per-Component Customization

You can also customize validation on a per-component basis by manually registering validation rules with custom settings:

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class MyForm {
  private validationController = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  public username: string = '';

  public constructor() {
    this.validationRules
      .on(this)
      .ensure('username')
      .required()
      .withMessage('Username cannot be empty!') // Custom message for this rule
      .minLength(3)
      .withMessage('Username too short - need at least 3 characters.');
  }
}
```

## See Also

- [Registering the Plugin](registering-the-plugin.md) - Basic plugin registration
- [Model-Based Validation](model-based-validation.md) - Using the hydrator for JSON rules
- [Validation Controller](validation-controller.md) - Working with validation controllers
- [Displaying Errors](displaying-errors.md) - Customizing error presentation

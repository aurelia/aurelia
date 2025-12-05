# State-Based Validation

State-based validation allows you to create validation rules that can fail in multiple ways, each with its own specific error message. This is particularly useful for complex validation scenarios where a single property might fail validation for different reasons depending on its state.

## Overview

The `StateRule` class enables you to define validation logic that evaluates to different states, where only one state is considered valid. Each state can have its own custom error message, making it easy to provide specific feedback to users based on why the validation failed.

## Basic Usage

State-based validation is implemented using the `satisfiesState()` method on the validation rules fluent API. Here's how to use it:

```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';

export class RegistrationForm {
  private validationRules = resolve(IValidationRules);

  public username: string = '';

  public constructor() {
    this.validationRules
      .on(this)
      .ensure('username')
      .satisfiesState(
        'valid',
        (value: string) => {
          if (!value) return 'empty';
          if (value.length < 3) return 'tooShort';
          if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'invalidChars';
          return 'valid';
        },
        {
          empty: 'Username is required.',
          tooShort: 'Username must be at least 3 characters.',
          invalidChars: 'Username can only contain letters, numbers, and underscores.'
        }
      );
  }
}
```

## How It Works

The `satisfiesState()` method takes three parameters:

1. **validState**: The state value that represents a successful validation (e.g., `'valid'`)
2. **stateFunction**: A function that evaluates the value and returns the current state
3. **messages**: An object mapping each possible state to its error message

When validation runs:
- The `stateFunction` is called with the current value
- It returns a state (any `PropertyKey` type: string, number, or symbol)
- If the returned state matches `validState`, validation passes
- If the returned state is different, validation fails with the corresponding message

## Async State Validation

The state function can also be asynchronous, allowing you to perform server-side validation or other async operations:

```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';

export class AccountSettings {
  private validationRules = resolve(IValidationRules);
  private userService = resolve(IUserService);

  public email: string = '';

  public constructor() {
    this.validationRules
      .on(this)
      .ensure('email')
      .satisfiesState(
        'available',
        async (value: string, obj?: AccountSettings) => {
          if (!value) return 'empty';
          if (!this.isValidEmail(value)) return 'invalid';

          const isAvailable = await this.userService.checkEmailAvailability(value);
          return isAvailable ? 'available' : 'taken';
        },
        {
          empty: 'Email address is required.',
          invalid: 'Please enter a valid email address.',
          taken: 'This email address is already in use.'
        }
      );
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

## Access to Object Context

The state function receives both the property value and the object being validated, allowing you to create complex validation logic that depends on other properties:

```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';

export class PasswordForm {
  private validationRules = resolve(IValidationRules);

  public password: string = '';
  public confirmPassword: string = '';

  public constructor() {
    this.validationRules
      .on(this)
      .ensure('confirmPassword')
      .satisfiesState(
        'match',
        (value: string, obj?: PasswordForm) => {
          if (!value) return 'empty';
          if (!obj) return 'noContext';
          if (value !== obj.password) return 'mismatch';
          return 'match';
        },
        {
          empty: 'Please confirm your password.',
          noContext: 'Unable to validate password confirmation.',
          mismatch: 'Passwords do not match.'
        }
      );
  }
}
```

## Complete Example

Here's a comprehensive example showing state-based validation in a user registration form:

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class UserRegistration {
  private validationController = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);
  private userService = resolve(IUserService);

  public username: string = '';
  public email: string = '';
  public age: number = 0;

  public constructor() {
    this.validationRules
      .on(this)

      // Username validation with multiple failure modes
      .ensure('username')
      .satisfiesState(
        'valid',
        (value: string) => {
          if (!value) return 'empty';
          if (value.length < 3) return 'tooShort';
          if (value.length > 20) return 'tooLong';
          if (!/^[a-zA-Z]/.test(value)) return 'mustStartWithLetter';
          if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'invalidChars';
          return 'valid';
        },
        {
          empty: 'Username is required.',
          tooShort: 'Username must be at least 3 characters.',
          tooLong: 'Username cannot exceed 20 characters.',
          mustStartWithLetter: 'Username must start with a letter.',
          invalidChars: 'Username can only contain letters, numbers, and underscores.'
        }
      )

      // Email validation with availability check
      .ensure('email')
      .satisfiesState(
        'available',
        async (value: string) => {
          if (!value) return 'empty';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'invalid';

          const available = await this.userService.checkEmailAvailability(value);
          return available ? 'available' : 'taken';
        },
        {
          empty: 'Email address is required.',
          invalid: 'Please enter a valid email address.',
          taken: 'This email address is already registered.'
        }
      )

      // Age validation with different restrictions
      .ensure('age')
      .satisfiesState(
        'valid',
        (value: number) => {
          if (value === 0 || value === null || value === undefined) return 'empty';
          if (value < 13) return 'tooYoung';
          if (value > 120) return 'tooOld';
          return 'valid';
        },
        {
          empty: 'Age is required.',
          tooYoung: 'You must be at least 13 years old to register.',
          tooOld: 'Please enter a valid age.'
        }
      );
  }

  public async submit(): Promise<void> {
    const result = await this.validationController.validate();

    if (result.valid) {
      await this.userService.register({
        username: this.username,
        email: this.email,
        age: this.age
      });
    }
  }
}
```

## Important Notes

- **Serialization**: `StateRule` instances cannot be serialized to JSON. If you attempt to serialize a state rule, you'll receive a warning in development mode.
- **Message Keys**: The state returned by your function becomes the message key. Ensure all possible states have corresponding messages in the messages object.
- **Valid State**: Any state value can be used as the valid state - it doesn't have to be the string `'valid'`. You could use numbers, symbols, or any other `PropertyKey` value.
- **Dynamic Messages**: The messages are evaluated at runtime, so you can include interpolation expressions in them just like standard validation rules.

## When to Use State-Based Validation

State-based validation is ideal when:

- A single property can fail validation in multiple distinct ways
- You want to provide specific, contextual error messages for each failure mode
- Your validation logic involves complex conditional checks
- You need to perform async validation with multiple possible outcomes
- Standard validation rules become unwieldy due to multiple `.when()` conditions

For simpler scenarios where a property only needs one type of validation, stick to the standard validation rules like `.required()`, `.matches()`, etc.

---
description: Outcome-focused validation scenarios that show how to wire Aurelia's validation controller, rules, and presenters for real forms.
---

# Validation Outcome Recipes

These recipes start with the result you want and walk through the minimal steps to get there with `@aurelia/validation` + `@aurelia/validation-html`.

## 1. Instant inline validation feedback

**Goal:** Highlight invalid inputs as soon as a user blurs a field, with errors listed next to each control.

### Steps

1. Register the HTML adapter as usual:
   ```typescript
   Aurelia.register(ValidationHtmlConfiguration);
   ```
2. In your form component, define rules for the model:
   ```typescript
   import { IValidationRules } from '@aurelia/validation';
   import { IValidationController } from '@aurelia/validation-html';
   import { newInstanceForScope, resolve } from '@aurelia/kernel';

   export class SignupForm {
     person = { name: '', email: '' };
     controller = resolve(newInstanceForScope(IValidationController));

     constructor(private rules = resolve(IValidationRules)) {
       this.rules
         .on(this.person)
         .ensure('name').required()
         .ensure('email').required().email();
     }
   }
   ```
3. Use the `validate` binding behavior with a trigger (`changeOrBlur` fires on blur and subsequent edits) and capture errors with the `validation-errors` attribute:
   ```html
   <form submit.trigger="controller.validate()">
     <div validation-errors.from-view="nameErrors">
       <label>
         Name
         <input value.bind="person.name & validate:changeOrBlur">
       </label>
       <ul if.bind="nameErrors?.length">
         <li repeat.for="error of nameErrors">${error.result.message}</li>
       </ul>
     </div>

     <div validation-errors.from-view="emailErrors">
       <label>
         Email
         <input value.bind="person.email & validate:changeOrBlur">
       </label>
       <p class="error" repeat.for="error of emailErrors">${error.result.message}</p>
     </div>
   </form>
   ```

### Checklist

- Typing and blurring a field shows validation messages immediately.
- Submitting runs `controller.validate()` and prevents submission when `result.valid` is false.
- Removing the `validation-errors` attribute stops error collections, confirming the bindings are wired correctly.

## 2. Step-by-step wizard gating

**Goal:** Prevent users from advancing to the next wizard step until the current step’s model is valid, while keeping previous steps untouched.

### Steps

1. Model each step separately and register them with the controller:
   ```typescript
   export class CheckoutWizard {
     shipping = { street: '', city: '' };
     payment = { cardNumber: '', expiry: '' };
     controller = resolve(newInstanceForScope(IValidationController));

     constructor(private rules = resolve(IValidationRules)) {
       this.rules.on(this.shipping)
         .ensure('street').required()
         .ensure('city').required();

       this.rules.on(this.payment)
         .ensure('cardNumber').required().matches(/^[0-9]{16}$/)
         .ensure('expiry').required();
     }

     async goTo(step: 'shipping' | 'payment') {
       const target = step === 'payment' ? this.shipping : this.payment;
       const { valid } = await this.controller.validate({ object: target });
       if (!valid) return;
       this.currentStep = step;
     }
   }
   ```
2. Bind each step’s inputs to the respective object and call `goTo('payment')` on the “Continue” button.
3. Use `controller.reset({ object: this.payment })` when users move backward so stale errors disappear.

### Checklist

- Clicking “Continue” on shipping does nothing until the required fields pass validation.
- Moving back to shipping clears payment errors (thanks to `controller.reset`).
- Each step validates only its own object, so partial progress is preserved.

## 3. Merge API validation errors

**Goal:** Display server-side validation failures next to the relevant controls after submitting the form.

### Steps

1. Submit the form through the controller so client rules run first:
   ```typescript
   async submit() {
     const result = await this.controller.validate();
     if (!result.valid) return;

     const response = await saveUser(this.person);
     if (!response.ok) {
       const payload = await response.json();
       payload.errors.forEach(err => {
         this.controller.addError(err.message, this.person, err.property);
       });
     }
   }
   ```
2. Store references to server errors (the return value from `addError`) and call `controller.removeError(error)` after the next successful submission or when the user edits that field.

### Checklist

- When the API returns `{ errors: [{ property: 'email', message: 'Email already used' }] }`, the message appears under the email input without reloading.
- Editing the field and re-validating removes the manual error via `removeError`.
- Server-only properties (like `paymentToken`) can still be surfaced by passing a `propertyName` even if there is no binding.

## 4. Validate only changed fields on large forms

**Goal:** Skip expensive validation when only one field changes by using validation triggers strategically.

### Steps

1. Leave the global configuration at the default `focusout` trigger.
2. Override the behavior per binding using `& validate:manual` for fields that should only validate on submit.
3. Call `controller.validate({ object: this.model, propertyName: 'taxId' })` inside a watcher or setter when you do want to validate a single property.

### Checklist

- Fields marked with `validate:manual` don’t show inline errors until submit.
- Calling `validate({ propertyName })` updates only the specified property’s errors.
- The controller’s `results` array stays small even on big forms.

## 5. Cross-field confirmation (password + confirm password)

**Goal:** Enforce matching values across multiple properties while keeping the error message attached to the confirmation input.

### Steps

1. Define both rules within the same `on(this.account)` chain so the validator has access to the whole object:
   ```typescript
   export class AccountForm {
     account = { password: '', confirmPassword: '' };
     controller = resolve(newInstanceForScope(IValidationController));

     constructor(private rules = resolve(IValidationRules)) {
       this.rules.on(this.account)
         .ensure('password')
           .required()
           .minLength(8)
         .ensure('confirmPassword')
           .required()
           .satisfies((value, obj) => value === obj.password)
             .withMessage('Passwords must match');
     }
   }
   ```
2. Bind both inputs with `& validate:changeOrBlur` so the confirmation field updates when either value changes.
3. Optionally call `controller.validate({ object: this.account, propertyName: 'confirmPassword' })` inside a watcher for instant feedback.

### Checklist

- Editing the primary password re-validates the confirmation rule.
- The error message appears under the confirm field, not both fields.
- Submitting the form when passwords differ keeps the user on the form with clear feedback.

## 6. Async validation against a backend

**Goal:** Check username availability by calling an API and surface the response inline without spamming the server.

### Steps

1. Create an async rule that calls your service and returns `true` or `false`:
   ```typescript
   export class UsernameForm {
     model = { username: '' };
     controller = resolve(newInstanceForScope(IValidationController));

     constructor(private rules = resolve(IValidationRules), private users = resolve(UserService)) {
       this.rules.on(this.model)
         .ensure('username')
           .required()
           .satisfies(async value => {
             if (!value) return false;
             return await this.users.isAvailable(value);
           })
           .withMessage('That username is already taken');
     }

     async checkAvailability() {
       await this.controller.validate({ object: this.model, propertyName: 'username' });
     }
   }
   ```
2. Trigger `checkAvailability` from a blur handler or a debounced input event to limit API calls.
3. Display errors with `validation-errors` or `validation-container` as in earlier recipes.

### Checklist

- Valid values resolve quickly and remove the error state.
- The API only executes when the field changes or loses focus (thanks to the explicit call).
- Network errors can be translated to user-friendly messages by catching exceptions inside `satisfies`.

## Validation flow cheat sheet

| Outcome | Use this controller call | Template helpers |
| --- | --- | --- |
| Validate everything before submit | `controller.validate()` | `& validate` on inputs |
| Validate one object/step | `controller.validate({ object })` | Bind errors via `validation-errors` |
| Validate one property on demand | `controller.validate({ object, propertyName: 'email' })` | `validate:manual` on that input |
| Display API errors | `controller.addError(message, object, 'property')` | Render via `validation-errors` |

Refer back to the core docs for deeper dives:
- [Validation controller](./validation-controller.md)
- [Validate binding behavior](./validate-binding-behavior.md)
- [Displaying errors](./displaying-errors.md)

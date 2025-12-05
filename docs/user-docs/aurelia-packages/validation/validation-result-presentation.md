# Validation Result Presentation

The Validation Result Presenter Service is responsible for automatically displaying validation error messages in the DOM. It creates and manages error containers, making it easy to show validation feedback to users without manual DOM manipulation.

## Overview

When validation errors occur, the `ValidationResultPresenterService` automatically:
- Creates error message containers in the DOM
- Populates containers with error messages
- Removes error messages when validation passes
- Manages the lifecycle of error elements

This service works behind the scenes as a subscriber to the validation controller, responding to validation events automatically.

## How It Works

The presenter service uses special data attributes to identify and manage validation error containers:

- `validation-result-id`: Identifies individual error message elements
- `validation-result-container`: Marks the container that holds error messages

When a validation error occurs for a form element, the service:
1. Finds the parent element of the validated input
2. Looks for an existing `[validation-result-container]` element
3. If not found, creates a new `<div validation-result-container>` element
4. Adds error messages as `<span validation-result-id="{id}">` elements inside the container

## Default Behavior

By default, when you use the `& validate` binding behavior, error messages are automatically displayed:

```html
<!-- my-form.html -->
<form>
  <div>
    <input type="text" value.bind="username & validate" placeholder="Username">
    <!-- Error container will be auto-created here if validation fails -->
  </div>

  <div>
    <input type="email" value.bind="email & validate" placeholder="Email">
    <!-- Error container will be auto-created here if validation fails -->
  </div>
</form>
```

```typescript
// my-form.ts
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class MyForm {
  private validationController = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  public username: string = '';
  public email: string = '';

  public constructor() {
    this.validationRules
      .on(this)
      .ensure('username')
      .required()
      .minLength(3)
      .ensure('email')
      .required()
      .email();
  }
}
```

When validation fails, the DOM will automatically look like this:

```html
<div>
  <input type="text" value="ab" placeholder="Username">
  <div validation-result-container>
    <span validation-result-id="1">Username must be at least 3 characters.</span>
  </div>
</div>
```

## Styling Error Containers

You can style the auto-generated error containers using CSS:

```css
/* Target the error container */
[validation-result-container] {
  margin-top: 4px;
  padding: 8px;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 4px;
}

/* Target individual error messages */
[validation-result-id] {
  display: block;
  color: #c00;
  font-size: 0.875rem;
  margin: 2px 0;
}

/* Show only the first error if you have multiple */
[validation-result-id]:not(:first-child) {
  display: none;
}
```

## Pre-creating Error Containers

Instead of letting the service auto-create containers, you can pre-create them in your markup for better control:

```html
<form>
  <div>
    <label for="username">Username</label>
    <input id="username" type="text" value.bind="username & validate">
    <!-- Pre-create the container with custom styling -->
    <div validation-result-container class="error-messages"></div>
  </div>

  <div>
    <label for="email">Email</label>
    <input id="email" type="email" value.bind="email & validate">
    <div validation-result-container class="error-messages"></div>
  </div>
</form>
```

## DOM Structure

Understanding the generated DOM structure is important for styling and customization:

```html
<!-- Before validation -->
<div>
  <input type="text" value.bind="username & validate">
</div>

<!-- After validation fails with 2 errors -->
<div>
  <input type="text" value="">
  <div validation-result-container>
    <span validation-result-id="1">Username is required.</span>
  </div>
</div>

<!-- After user enters invalid value -->
<div>
  <input type="text" value="ab">
  <div validation-result-container>
    <span validation-result-id="2">Username must be at least 3 characters.</span>
  </div>
</div>

<!-- After validation passes -->
<div>
  <input type="text" value="valid-username">
  <div validation-result-container>
    <!-- Container remains but is empty -->
  </div>
</div>
```

## Using the Service Directly

You can inject and use the `ValidationResultPresenterService` directly for custom error presentation:

```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationResultPresenterService } from '@aurelia/validation-html';
import { ValidationResult } from '@aurelia/validation';

export class CustomErrorHandler {
  private presenter = resolve(IValidationResultPresenterService);

  public showCustomError(target: Element, message: string): void {
    // Create a manual validation result
    const result = new ValidationResult(false, message, undefined, {}, undefined, undefined, true);

    // Add the error to the target element
    this.presenter.add(target, [result]);
  }

  public clearErrors(target: Element): void {
    const container = this.presenter.getValidationMessageContainer(target);
    if (container) {
      container.innerHTML = '';
    }
  }
}
```

## Service API

The `ValidationResultPresenterService` implements the following interface:

### handleValidationEvent(event: ValidationEvent): void

Called automatically by the validation controller when validation results change. This is the primary integration point.

### add(target: Element, results: ValidationResult[]): void

Manually add validation errors to a target element.

**Parameters:**
- `target`: The DOM element associated with the validation
- `results`: Array of ValidationResult objects to display

### remove(target: Element, results: ValidationResult[]): void

Manually remove validation errors from a target element.

**Parameters:**
- `target`: The DOM element to remove errors from
- `results`: Array of ValidationResult objects to remove

### getValidationMessageContainer(target: Element): Element | null

Get or create the validation message container for a target element.

**Parameters:**
- `target`: The validated input element

**Returns:** The container element, or `null` if the target has no parent

**Behavior:**
- Searches for existing `[validation-result-container]` in the parent element
- If not found, creates a new `<div validation-result-container>`
- Appends the new container to the target's parent element

## Custom Presenter Implementation

You can create a custom presenter by implementing the `ValidationResultsSubscriber` interface:

```typescript
import { DI } from '@aurelia/kernel';
import { ValidationEvent, ValidationResultsSubscriber } from '@aurelia/validation-html';

export interface ICustomPresenter extends CustomPresenter {}
export const ICustomPresenter = DI.createInterface<ICustomPresenter>('ICustomPresenter');

export class CustomPresenter implements ValidationResultsSubscriber {
  public handleValidationEvent(event: ValidationEvent): void {
    // Handle validation events
    if (event.kind === 'validate') {
      for (const { result, targets } of event.addedResults) {
        if (!result.valid) {
          this.showError(targets, result.message!);
        }
      }
    } else if (event.kind === 'reset') {
      for (const { targets } of event.removedResults) {
        this.clearErrors(targets);
      }
    }
  }

  private showError(targets: Element[], message: string): void {
    // Custom error display logic
    for (const target of targets) {
      target.classList.add('has-error');
      const errorEl = document.createElement('div');
      errorEl.className = 'custom-error';
      errorEl.textContent = message;
      target.parentElement?.appendChild(errorEl);
    }
  }

  private clearErrors(targets: Element[]): void {
    // Custom error clearing logic
    for (const target of targets) {
      target.classList.remove('has-error');
      target.parentElement?.querySelector('.custom-error')?.remove();
    }
  }
}
```

Register and use your custom presenter:

```typescript
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

export class MyComponent {
  private validationController = resolve(newInstanceForScope(IValidationController));
  private customPresenter = resolve(ICustomPresenter);

  public constructor() {
    // Register your custom presenter
    this.validationController.addSubscriber(this.customPresenter);
  }
}
```

## Integration with validation-errors Attribute

The presenter service works alongside the `validation-errors` custom attribute, which provides programmatic access to errors. See the [Displaying Errors](displaying-errors.md) documentation for more information on using `validation-errors`.

## Advanced Scenarios

### Grouping Errors

Display all errors in a central location instead of next to each input:

```html
<form>
  <!-- All inputs without individual error containers -->
  <input type="text" value.bind="username & validate">
  <input type="email" value.bind="email & validate">
  <input type="password" value.bind="password & validate">

  <!-- Central error display -->
  <div class="error-summary">
    <ul if.bind="validationController.results.length">
      <li repeat.for="error of validationController.results" if.bind="!error.valid">
        ${error.message}
      </li>
    </ul>
  </div>
</form>
```

### Conditional Error Display

Show errors only after the user has attempted to submit:

```typescript
export class MyForm {
  private validationController = resolve(newInstanceForScope(IValidationController));
  public showErrors: boolean = false;

  public async submit(): Promise<void> {
    const result = await this.validationController.validate();

    if (!result.valid) {
      this.showErrors = true;
      return;
    }

    // Process form...
  }
}
```

```html
<form>
  <div>
    <input type="text" value.bind="username & validate">
    <div validation-result-container if.bind="showErrors"></div>
  </div>
</form>
```

## Important Notes

- The presenter service is automatically registered when you use `ValidationHtmlConfiguration`
- Error containers are created in the parent element of the validated input
- Each error message has a unique `validation-result-id` based on the ValidationResult's internal ID
- The service automatically handles adding and removing error messages as validation state changes
- Empty error containers remain in the DOM after errors are cleared (they can be hidden with CSS)

## See Also

- [Displaying Errors](displaying-errors.md) - Using the validation-errors attribute
- [Validation Controller](validation-controller.md) - Managing validation lifecycle
- [Validate Binding Behavior](validate-binding-behavior.md) - Marking inputs for validation

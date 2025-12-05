# Form Submission

Learn how to handle form submissions with proper state management, error handling, and user feedback.

## Basic Form Submission

```typescript
export class ContactForm {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  async handleSubmit() {
    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formData)
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      this.successMessage = 'Form submitted successfully!';
      this.resetForm();
    } catch (error) {
      this.errorMessage = 'Failed to submit form. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    this.formData = { name: '', email: '', message: '' };
  }
}
```

```html
<form submit.trigger="handleSubmit()">
  <div class="form-group">
    <label>Name</label>
    <input value.bind="formData.name" required />
  </div>

  <div class="form-group">
    <label>Email</label>
    <input type="email" value.bind="formData.email" required />
  </div>

  <div class="form-group">
    <label>Message</label>
    <textarea value.bind="formData.message" required></textarea>
  </div>

  <div if.bind="successMessage" class="alert alert-success">
    ${successMessage}
  </div>

  <div if.bind="errorMessage" class="alert alert-error">
    ${errorMessage}
  </div>

  <button type="submit" disabled.bind="isSubmitting">
    ${isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

## Preventing Default Submission

```html
<!-- Method 1: Use submit.trigger (recommended) -->
<form submit.trigger="handleSubmit()">
  <!-- form fields -->
</form>

<!-- Method 2: Prevent default in handler -->
<form submit.trigger="handleSubmit($event)">
  <!-- form fields -->
</form>
```

```typescript
handleSubmit(event?: Event) {
  event?.preventDefault();
  // your logic
}
```

## Validation Before Submission

```typescript
export class ValidatedForm {
  formData = { name: '', email: '' };

  get isValid(): boolean {
    return this.formData.name.length > 0 &&
           this.formData.email.includes('@');
  }

  handleSubmit() {
    if (!this.isValid) {
      alert('Please fill out all required fields');
      return;
    }

    // Submit form
  }
}
```

```html
<form submit.trigger="handleSubmit()">
  <!-- fields -->
  <button type="submit" disabled.bind="!isValid">Submit</button>
</form>
```

## Submission State Management

```typescript
interface SubmissionState {
  isSubmitting: boolean;
  success: boolean;
  error: string | null;
  attempts: number;
}

export class StatefulForm {
  formData = { /* ... */ };

  state: SubmissionState = {
    isSubmitting: false,
    success: false,
    error: null,
    attempts: 0
  };

  get canSubmit(): boolean {
    return !this.state.isSubmitting && this.state.attempts < 3;
  }

  async handleSubmit() {
    if (!this.canSubmit) return;

    this.state.isSubmitting = true;
    this.state.error = null;
    this.state.success = false;

    try {
      await this.submitData();
      this.state.success = true;

      setTimeout(() => this.resetForm(), 2000);
    } catch (error) {
      this.state.error = error.message;
      this.state.attempts++;
    } finally {
      this.state.isSubmitting = false;
    }
  }

  private async submitData() {
    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.formData)
    });

    if (!response.ok) {
      throw new Error('Submission failed');
    }

    return response.json();
  }

  resetForm() {
    this.formData = { /* reset */ };
    this.state = {
      isSubmitting: false,
      success: false,
      error: null,
      attempts: 0
    };
  }
}
```

## Optimistic UI Updates

```typescript
export class OptimisticForm {
  items: Item[] = [];
  optimisticItem: Item | null = null;

  async addItem(item: Item) {
    // Add optimistically
    this.optimisticItem = { ...item, id: 'temp-' + Date.now() };
    this.items.push(this.optimisticItem);

    try {
      const result = await this.saveItem(item);

      // Replace optimistic item with real one
      const index = this.items.indexOf(this.optimisticItem);
      this.items[index] = result;
      this.optimisticItem = null;
    } catch (error) {
      // Remove optimistic item on error
      this.items = this.items.filter(i => i !== this.optimisticItem);
      this.optimisticItem = null;
      alert('Failed to add item');
    }
  }
}
```

## Debounced Auto-Save

```typescript
export class AutoSaveForm {
  formData = { title: '', content: '' };
  saveStatus: 'saved' | 'saving' | 'unsaved' = 'saved';
  saveTimer: any = null;

  formDataChanged() {
    this.saveStatus = 'unsaved';

    // Clear existing timer
    clearTimeout(this.saveTimer);

    // Set new timer for auto-save
    this.saveTimer = setTimeout(() => {
      this.autoSave();
    }, 2000);
  }

  async autoSave() {
    this.saveStatus = 'saving';

    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.formData)
      });

      this.saveStatus = 'saved';
    } catch (error) {
      this.saveStatus = 'unsaved';
    }
  }

  detaching() {
    clearTimeout(this.saveTimer);
  }
}
```

```html
<form>
  <input value.bind="formData.title" input.trigger="formDataChanged()" />
  <textarea value.bind="formData.content" input.trigger="formDataChanged()"></textarea>

  <span class="save-status">
    <span if.bind="saveStatus === 'saved'">✓ Saved</span>
    <span if.bind="saveStatus === 'saving'">Saving...</span>
    <span if.bind="saveStatus === 'unsaved'">Unsaved changes</span>
  </span>
</form>
```

## Rate Limiting

```typescript
export class RateLimitedForm {
  lastSubmission: Date | null = null;
  cooldownMs = 30000; // 30 seconds

  get canSubmit(): boolean {
    if (!this.lastSubmission) return true;

    const timeSince = Date.now() - this.lastSubmission.getTime();
    return timeSince > this.cooldownMs;
  }

  get cooldownRemaining(): number {
    if (!this.lastSubmission) return 0;

    const timeSince = Date.now() - this.lastSubmission.getTime();
    const remaining = this.cooldownMs - timeSince;
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  async handleSubmit() {
    if (!this.canSubmit) {
      alert(`Please wait ${this.cooldownRemaining} seconds before submitting again`);
      return;
    }

    // Submit form
    await this.submitData();
    this.lastSubmission = new Date();
  }
}
```

## Multi-Step Forms

See the [Template Recipes collection](../recipes/README.md) for complete examples, including community-contributed multi-step flows.

## Best Practices

1. **Always provide feedback** - Show loading, success, and error states
2. **Disable submit button** - Prevent multiple submissions
3. **Handle errors gracefully** - Show user-friendly error messages
4. **Validate before submitting** - Client-side validation for UX
5. **Reset form after success** - Clear form or redirect user
6. **Implement rate limiting** - Prevent spam submissions
7. **Use proper HTTP methods** - POST for creation, PUT/PATCH for updates

## Common Patterns

### Submit on Enter Key

```html
<form submit.trigger="handleSubmit()">
  <input value.bind="query" keydown.trigger:enter="handleSubmit()" />
</form>
```

### Confirm Before Submit

```typescript
handleSubmit() {
  if (!confirm('Are you sure you want to submit?')) {
    return;
  }
  // Proceed with submission
}
```

### Redirect After Success

```typescript
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class FormWithRedirect {
  private readonly router = resolve(IRouter);

  async handleSubmit() {
    await this.submitData();
    this.router.load('/success');
  }
}
```

## Related

- [Form Basics](README.md)
- [Validation](validation.md)
- [File Uploads](file-uploads.md)
- [Form Examples](examples.md)

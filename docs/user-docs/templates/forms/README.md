# Forms and Input Handling

Forms are the cornerstone of interactive web applications. Whether you're building simple contact forms, complex data-entry systems, or dynamic configuration interfaces, Aurelia provides a comprehensive and performant forms system.

{% hint style="info" %}
This guide assumes familiarity with Aurelia's binding system and template syntax. For fundamentals, see [Template Syntax & Features](../template-syntax/overview.md) first.
{% endhint %}

## Quick Navigation

- **[Basic Inputs](#basic-input-binding)** - Text, textarea, number, date inputs
- **[Collections](collections.md)** - Checkboxes, radios, multi-select, arrays
- **[Form Submission](submission.md)** - Submit forms, handle events
- **[File Uploads](file-uploads.md)** - Handle file inputs and uploads
- **[Validation Plugin](../../aurelia-packages/validation/README.md)** - Integrate with @aurelia/validation

## Understanding Aurelia's Form Architecture

Aurelia's forms system is built on sophisticated observer patterns that provide automatic synchronization between your view models and form controls.

### Data Flow Architecture

```
User Input → DOM Event → Observer → Binding → View Model → Reactive Updates
     ↑                                                            ↓
Form Element ← DOM Update ← Binding ← Property Change ← View Model
```

**Key Components:**

1. **Observers**: Monitor DOM events and property changes
2. **Bindings**: Connect observers to view model properties
3. **Collection Observers**: Handle arrays, Sets, and Maps efficiently
4. **Mutation Observers**: Track dynamic DOM changes
5. **Value Converters & Binding Behaviors**: Transform and control data flow

### Automatic Change Detection

Aurelia automatically observes:
- **Text inputs**: `input`, `change`, `keyup` events
- **Checkboxes/Radio**: `change` events with array synchronization
- **Select elements**: `change` events with mutation observation
- **Collections**: Array mutations, Set/Map changes
- **Object properties**: Deep property observation

This means you typically don't need manual event handlers—Aurelia handles the complexity automatically while providing hooks for customization when needed.

## Basic Input Binding

Aurelia provides intuitive two-way binding for all standard form elements. Let's start with the fundamentals.

### Simple Text Inputs

The foundation of most forms is text input binding:

```html
<form submit.trigger="handleSubmit()">
  <div class="form-group">
    <label for="email">Email:</label>
    <input id="email"
           type="email"
           value.bind="email"
           placeholder.bind="emailPlaceholder" />
  </div>
  <div class="form-group">
    <label for="password">Password:</label>
    <input id="password"
           type="password"
           value.bind="password" />
  </div>
  <button type="submit" disabled.bind="!isFormValid">Login</button>
</form>
```

```typescript
export class LoginComponent {
  email = '';
  password = '';
  emailPlaceholder = 'Enter your email address';

  get isFormValid(): boolean {
    return this.email.length > 0 && this.password.length >= 8;
  }

  handleSubmit() {
    if (this.isFormValid) {
      console.log('Submitting:', { email: this.email, password: this.password });
    }
  }
}
```

**Key points:**
- Use `value.bind` for two-way binding
- Form inputs default to two-way binding automatically
- Computed properties (like `isFormValid`) automatically update

### Textarea Binding

Textareas work identically to text inputs:

```html
<div class="form-group">
  <label for="comments">Comments:</label>
  <textarea id="comments"
            value.bind="comments"
            rows="4"
            maxlength.bind="maxCommentLength"></textarea>
  <small>${comments.length}/${maxCommentLength} characters</small>
</div>
```

```typescript
export class FeedbackForm {
  comments = '';
  maxCommentLength = 500;
}
```

### Number and Date Inputs

Browser form controls always provide string values unless you bind to their typed DOM properties. Use Aurelia's `value-as-*` bindings when you need numbers or dates in your view-model.

```html
<div class="form-group">
  <label for="age">Age:</label>
  <input id="age"
         type="number"
         value-as-number.bind="age"
         min="18"
         max="120" />
</div>

<div class="form-group">
  <label for="birthdate">Birth Date:</label>
  <input id="birthdate"
         type="date"
         value-as-date.bind="birthDate" />
</div>

<div class="form-group">
  <label for="appointment">Appointment Time:</label>
  <input id="appointment"
         type="datetime-local"
         value-as-date.bind="appointmentTime" />
</div>
```

```typescript
export class ProfileForm {
  age = 25;
  birthDate = new Date('1998-01-01');
  appointmentTime = new Date();

  get isAdult(): boolean {
    return this.age >= 18;
  }
}
```

`value-as-number` binds to the input's `valueAsNumber`, so `age` is a `number` (or `NaN` when the field is empty/invalid). `value-as-date` binds to `valueAsDate`, giving you a `Date | null`. If you keep `value.bind`, the value remains a string—convert it before serializing to JSON for APIs.

### Input Types and Binding

Aurelia supports all HTML5 input types:

| Type | Value | Common Use |
|------|-------|------------|
| `text` | string | General text input |
| `email` | string | Email addresses |
| `password` | string | Password fields |
| `number` | string (use `value-as-number` for `number`) | Numeric input |
| `tel` | string | Phone numbers |
| `url` | string | Website URLs |
| `search` | string | Search queries |
| `date` | string (use `value-as-date` for `Date`) | Date selection |
| `time` | string | Time selection |
| `datetime-local` | string (use `value-as-date` for `Date`) | Date and time |
| `color` | string | Color picker |
| `range` | string (use `value-as-number` for `number`) | Slider input |

### Binding Modes

While `value.bind` is automatic two-way binding, you can be explicit:

```html
<!-- Two-way binding (default for inputs) -->
<input value.two-way="username">

<!-- One-way (view model → view) -->
<input value.one-way="displayName">

<!-- From view (view → view model) -->
<input value.from-view="searchQuery">

<!-- One-time (set once, no updates) -->
<input value.one-time="initialValue">
```

**When to use each:**
- `.bind` - Default, use for most form inputs
- `.two-way` - Explicit two-way, same as `.bind` for inputs
- `.one-way` - Read-only inputs, display-only values
- `.from-view` - Capture input without updating view
- `.one-time` - Static initial values

### Real-World Example

Here's a complete user registration form:

```html
<form submit.trigger="register()" class="registration-form">
  <h2>Create Account</h2>

  <!-- Username -->
  <div class="form-group">
    <label for="username">Username *</label>
    <input id="username"
           type="text"
           value.bind="form.username"
           required
           minlength="3"
           maxlength="20">
    <small>3-20 characters</small>
  </div>

  <!-- Email -->
  <div class="form-group">
    <label for="email">Email *</label>
    <input id="email"
           type="email"
           value.bind="form.email"
           required>
  </div>

  <!-- Password -->
  <div class="form-group">
    <label for="password">Password *</label>
    <input id="password"
           type="password"
           value.bind="form.password"
           required
           minlength="8">
    <small>At least 8 characters</small>
  </div>

  <!-- Confirm Password -->
  <div class="form-group">
    <label for="confirmPassword">Confirm Password *</label>
    <input id="confirmPassword"
           type="password"
           value.bind="form.confirmPassword"
           required>
    <span if.bind="form.password !== form.confirmPassword" class="error">
      Passwords must match
    </span>
  </div>

  <!-- Age -->
  <div class="form-group">
    <label for="age">Age</label>
    <input id="age"
           type="number"
           value.bind="form.age"
           min="13"
           max="120">
  </div>

  <!-- Bio -->
  <div class="form-group">
    <label for="bio">Bio</label>
    <textarea id="bio"
              value.bind="form.bio"
              maxlength="500"
              rows="4"></textarea>
    <small>${form.bio.length}/500 characters</small>
  </div>

  <!-- Submit -->
  <button type="submit"
          disabled.bind="!isFormValid"
          class="btn-primary">
    Create Account
  </button>
</form>
```

```typescript
export class Registration {
  form = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: null,
    bio: ''
  };

  get isFormValid(): boolean {
    return this.form.username.length >= 3 &&
           this.form.email.includes('@') &&
           this.form.password.length >= 8 &&
           this.form.password === this.form.confirmPassword;
  }

  register() {
    if (this.isFormValid) {
      console.log('Registering user:', this.form);
      // API call here
    }
  }
}
```

## Next Steps

Now that you understand basic form inputs, explore:

- **[Collections](collections.md)** - Checkboxes, radio buttons, and multi-select
- **[Validation Plugin](../../aurelia-packages/validation/README.md)** - Integrate form validation
- **[File Uploads](file-uploads.md)** - Handle file inputs
- **[Form Submission](submission.md)** - Submit and process forms
- **[Template Recipes](../recipes/README.md)** - Real-world examples

## Quick Tips

1. **Always use labels** - Associate labels with inputs using `for` attribute
2. **Validate on submit** - Don't validate every keystroke unless needed
3. **Provide feedback** - Show errors clearly after user completes input
4. **Use computed properties** - Let Aurelia handle form state reactively
5. **Keep it simple** - Don't overcomplicate with manual DOM manipulation

## Common Pitfalls

- **Forgetting `.bind`** - Must use `.bind` for two-way binding
- **Type mismatches** - Number inputs return strings, convert if needed
- **Direct object mutation** - Use `this.form.prop = value`, not `form[prop] = value`
- **Missing labels** - Always include labels for accessibility

## Related Documentation

- [Template Syntax Overview](../template-syntax/overview.md)
- [Attribute Binding](../template-syntax/attribute-binding.md)
- [Event Binding](../template-syntax/event-binding.md)
- [Validation Plugin](../../aurelia-packages/validation/README.md)

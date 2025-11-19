# Advanced Form Patterns

Complex form scenarios with multi-step wizards, dynamic fields, conditional validation, and more.

{% hint style="success" %}
**What you'll learn...**

* Multi-step wizard forms with progress tracking
* Dynamic forms (add/remove fields at runtime)
* Conditional validation based on field dependencies
* Form state management (dirty, pristine, touched)
* Autosave and draft management
* Complex file uploads with preview and progress
* Form arrays (repeating field groups)
{% endhint %}

## Prerequisites

All examples assume you have the validation plugin installed and configured:

```bash
npm install @aurelia/validation @aurelia/validation-html
```

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';

Aurelia.register(ValidationHtmlConfiguration)
  .app(component)
  .start();
```

See [Validation documentation](../../aurelia-packages/validation/README.md) for setup details.

---

## Multi-Step Wizard Forms

Multi-step forms break complex forms into manageable steps, improving user experience and completion rates.

### Complete Example: User Onboarding Wizard

```typescript
// src/components/onboarding-wizard.ts
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface UserProfile {
  // Step 1: Account
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Personal Info
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;

  // Step 3: Preferences
  newsletter: boolean;
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
}

export class OnboardingWizard {
  private currentStep = 1;
  private readonly totalSteps = 3;

  private profile: UserProfile = {
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    newsletter: true,
    notifications: true,
    theme: 'light',
    language: 'en'
  };

  private validation = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.setupValidation();
  }

  private setupValidation() {
    // Step 1 validation rules
    this.validationRules
      .on(this.profile)
      .ensure('email')
        .required()
        .email()
        .when(() => this.currentStep === 1)
      .ensure('password')
        .required()
        .minLength(8)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number')
        .when(() => this.currentStep === 1)
      .ensure('confirmPassword')
        .required()
        .satisfies((value: string) => value === this.profile.password)
        .withMessage('Passwords must match')
        .when(() => this.currentStep === 1)

      // Step 2 validation rules
      .ensure('firstName')
        .required()
        .minLength(2)
        .when(() => this.currentStep === 2)
      .ensure('lastName')
        .required()
        .minLength(2)
        .when(() => this.currentStep === 2)
      .ensure('dateOfBirth')
        .required()
        .satisfies((value: string) => {
          const age = this.calculateAge(new Date(value));
          return age >= 18 && age <= 120;
        })
        .withMessage('You must be at least 18 years old')
        .when(() => this.currentStep === 2)
      .ensure('phone')
        .required()
        .matches(/^\+?[\d\s\-()]+$/)
        .withMessage('Please enter a valid phone number')
        .when(() => this.currentStep === 2);
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  async next() {
    // Validate current step before proceeding
    const result = await this.validation.validate();

    if (!result.valid) {
      return; // Stay on current step if validation fails
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previous() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  async submit() {
    // Validate all steps
    const result = await this.validation.validate();

    if (!result.valid) {
      // Find first step with errors
      const firstErrorStep = this.findFirstErrorStep(result.results);
      this.currentStep = firstErrorStep;
      return;
    }

    // Submit the form
    try {
      await this.saveProfile(this.profile);
      console.log('Profile saved successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  private findFirstErrorStep(results: any[]): number {
    const step1Fields = ['email', 'password', 'confirmPassword'];
    const step2Fields = ['firstName', 'lastName', 'dateOfBirth', 'phone'];

    for (const result of results) {
      if (!result.valid) {
        if (step1Fields.includes(result.propertyName)) return 1;
        if (step2Fields.includes(result.propertyName)) return 2;
      }
    }

    return this.currentStep;
  }

  private async saveProfile(profile: UserProfile): Promise<void> {
    // API call to save profile
    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      throw new Error('Failed to save profile');
    }
  }

  get progress(): number {
    return (this.currentStep / this.totalSteps) * 100;
  }

  get isFirstStep(): boolean {
    return this.currentStep === 1;
  }

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }
}
```

```html
<!-- src/components/onboarding-wizard.html -->
  <div class="wizard">
    <!-- Progress bar -->
    <div class="wizard-progress">
      <div class="wizard-progress-bar" style="width: ${progress}%"></div>
      <div class="wizard-steps">
        <div class="wizard-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}">
          <span class="step-number">1</span>
          <span class="step-label">Account</span>
        </div>
        <div class="wizard-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}">
          <span class="step-number">2</span>
          <span class="step-label">Personal Info</span>
        </div>
        <div class="wizard-step ${currentStep >= 3 ? 'active' : ''}">
          <span class="step-number">3</span>
          <span class="step-label">Preferences</span>
        </div>
      </div>
    </div>

    <!-- Step 1: Account -->
    <div class="wizard-content" if.bind="currentStep === 1">
      <h2>Create Your Account</h2>

      <div class="form-field">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          value.bind="profile.email & validate"
          placeholder="you@example.com">
      </div>

      <div class="form-field">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          value.bind="profile.password & validate"
          placeholder="Min. 8 characters">
      </div>

      <div class="form-field">
        <label for="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value.bind="profile.confirmPassword & validate">
      </div>
    </div>

    <!-- Step 2: Personal Info -->
    <div class="wizard-content" if.bind="currentStep === 2">
      <h2>Tell Us About Yourself</h2>

      <div class="form-row">
        <div class="form-field">
          <label for="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value.bind="profile.firstName & validate">
        </div>

        <div class="form-field">
          <label for="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value.bind="profile.lastName & validate">
        </div>
      </div>

      <div class="form-field">
        <label for="dateOfBirth">Date of Birth</label>
        <input
          type="date"
          id="dateOfBirth"
          value.bind="profile.dateOfBirth & validate">
      </div>

      <div class="form-field">
        <label for="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          value.bind="profile.phone & validate"
          placeholder="+1 (555) 123-4567">
      </div>
    </div>

    <!-- Step 3: Preferences -->
    <div class="wizard-content" if.bind="currentStep === 3">
      <h2>Customize Your Experience</h2>

      <div class="form-field">
        <label>
          <input type="checkbox" checked.bind="profile.newsletter">
          Subscribe to newsletter
        </label>
      </div>

      <div class="form-field">
        <label>
          <input type="checkbox" checked.bind="profile.notifications">
          Enable notifications
        </label>
      </div>

      <div class="form-field">
        <label for="theme">Theme</label>
        <select id="theme" value.bind="profile.theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div class="form-field">
        <label for="language">Language</label>
        <select id="language" value.bind="profile.language">
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>

    <!-- Navigation -->
    <div class="wizard-actions">
      <button
        type="button"
        click.trigger="previous()"
        disabled.bind="isFirstStep"
        class="btn btn-secondary">
        Previous
      </button>

      <button
        if.bind="!isLastStep"
        type="button"
        click.trigger="next()"
        class="btn btn-primary">
        Next
      </button>

      <button
        if.bind="isLastStep"
        type="button"
        click.trigger="submit()"
        class="btn btn-success">
        Complete
      </button>
    </div>
  </div>
```

**Key Features**:
- Step-by-step validation (only validate current step)
- Progress indicator
- Conditional validation rules with `.when()`
- Navigate to first step with errors on final submit
- Accessible navigation buttons

---

## Dynamic Forms (Add/Remove Fields)

Forms where users can add or remove fields at runtime, like adding multiple email addresses or phone numbers.

### Complete Example: Contact Form with Dynamic Emails

```typescript
// src/components/dynamic-contact-form.ts
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface EmailEntry {
  id: string;
  address: string;
  label: string;
  isPrimary: boolean;
}

interface ContactForm {
  name: string;
  company: string;
  emails: EmailEntry[];
  notes: string;
}

export class DynamicContactForm {
  private form: ContactForm = {
    name: '',
    company: '',
    emails: [this.createEmailEntry(true)],
    notes: ''
  };

  private validation = resolve(newInstanceForScope(IValidationController));
  private nextId = 1;
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.setupValidation();
  }

  private createEmailEntry(isPrimary = false): EmailEntry {
    return {
      id: `email-${this.nextId++}`,
      address: '',
      label: isPrimary ? 'Primary' : 'Secondary',
      isPrimary
    };
  }

  private setupValidation() {
    this.validationRules
      .on(this.form)
      .ensure('name')
        .required()
        .minLength(2)
      .ensure('company')
        .required()
      .ensure('emails')
        .required()
        .minItems(1)
        .withMessage('At least one email is required')
        .satisfies((emails: EmailEntry[]) =>
          emails.every(e => this.isValidEmail(e.address))
        )
        .withMessage('All email addresses must be valid')
        .satisfies((emails: EmailEntry[]) =>
          emails.filter(e => e.isPrimary).length === 1
        )
        .withMessage('Exactly one primary email is required');
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  addEmail() {
    this.form.emails.push(this.createEmailEntry());
  }

  removeEmail(id: string) {
    // Don't allow removing the last email
    if (this.form.emails.length <= 1) {
      return;
    }

    const index = this.form.emails.findIndex(e => e.id === id);
    if (index === -1) return;

    const wasRemoved = this.form.emails[index];
    this.form.emails.splice(index, 1);

    // If we removed the primary, make the first one primary
    if (wasRemoved.isPrimary && this.form.emails.length > 0) {
      this.form.emails[0].isPrimary = true;
      this.form.emails[0].label = 'Primary';
    }

    // Revalidate after removal
    this.validation.validate();
  }

  setPrimary(id: string) {
    // Only one email can be primary
    this.form.emails.forEach(email => {
      email.isPrimary = email.id === id;
      email.label = email.isPrimary ? 'Primary' : 'Secondary';
    });
  }

  async submit() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    console.log('Form submitted:', this.form);
    // API call here
  }

  get canRemoveEmail(): boolean {
    return this.form.emails.length > 1;
  }
}
```

```html
<!-- src/components/dynamic-contact-form.html -->
  <form submit.trigger="submit()">
    <h2>Contact Information</h2>

    <div class="form-field">
      <label for="name">Name *</label>
      <input
        type="text"
        id="name"
        value.bind="form.name & validate">
    </div>

    <div class="form-field">
      <label for="company">Company *</label>
      <input
        type="text"
        id="company"
        value.bind="form.company & validate">
    </div>

    <!-- Dynamic email fields -->
    <div class="form-section">
      <div class="section-header">
        <h3>Email Addresses *</h3>
        <button
          type="button"
          click.trigger="addEmail()"
          class="btn btn-small btn-secondary">
          + Add Email
        </button>
      </div>

      <div
        repeat.for="email of form.emails"
        class="email-entry"
        id.bind="email.id">

        <div class="form-row">
          <div class="form-field flex-grow">
            <label for="${email.id}-address">${email.label}</label>
            <input
              type="email"
              id="${email.id}-address"
              value.bind="email.address"
              placeholder="email@example.com">
          </div>

          <div class="form-field-actions">
            <label class="radio-label">
              <input
                type="radio"
                name="primaryEmail"
                checked.bind="email.isPrimary"
                change.trigger="setPrimary(email.id)">
              Primary
            </label>

            <button
              type="button"
              click.trigger="removeEmail(email.id)"
              disabled.bind="!canRemoveEmail"
              class="btn btn-small btn-danger"
              aria-label="Remove email">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="form-field">
      <label for="notes">Notes</label>
      <textarea
        id="notes"
        value.bind="form.notes"
        rows="4"></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Save Contact</button>
  </form>
```

**Key Features**:
- Add/remove email entries dynamically
- Ensure at least one email exists
- Automatically handle primary email when removing
- Validate all emails in the array
- Unique IDs for each entry (accessibility and key binding)

---

## Conditional Validation (Field Dependencies)

Validation rules that change based on the values of other fields.

### Complete Example: Shipping Form

```typescript
// src/components/shipping-form.ts
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface ShippingForm {
  sameAsBilling: boolean;

  // Billing address
  billingStreet: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;

  // Shipping address (only required if different)
  shippingStreet: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;

  // Shipping method
  shippingMethod: 'standard' | 'express' | 'overnight' | '';

  // Signature required (only for overnight)
  signatureRequired: boolean;

  // International customs (only for international)
  customsValue: number;
  customsDescription: string;
}

export class ShippingFormComponent {
  private form: ShippingForm = {
    sameAsBilling: true,
    billingStreet: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    shippingStreet: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
    shippingMethod: '',
    signatureRequired: false,
    customsValue: 0,
    customsDescription: ''
  };

  private validation = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.setupValidation();
  }

  private setupValidation() {
    this.validationRules
      .on(this.form)
      // Billing address (always required)
      .ensure('billingStreet')
        .required()
      .ensure('billingCity')
        .required()
      .ensure('billingState')
        .required()
      .ensure('billingZip')
        .required()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Please enter a valid ZIP code')
      .ensure('billingCountry')
        .required()

      // Shipping address (required only if different from billing)
      .ensure('shippingStreet')
        .required()
        .when(() => !this.form.sameAsBilling)
      .ensure('shippingCity')
        .required()
        .when(() => !this.form.sameAsBilling)
      .ensure('shippingState')
        .required()
        .when(() => !this.form.sameAsBilling)
      .ensure('shippingZip')
        .required()
        .when(() => !this.form.sameAsBilling)
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Please enter a valid ZIP code')
        .when(() => !this.form.sameAsBilling)
      .ensure('shippingCountry')
        .required()
        .when(() => !this.form.sameAsBilling)

      // Shipping method
      .ensure('shippingMethod')
        .required()
        .withMessage('Please select a shipping method')

      // Customs info (required for international shipments)
      .ensure('customsValue')
        .required()
        .min(0.01)
        .withMessage('Customs value must be greater than 0')
        .when(() => this.isInternationalShipment)
      .ensure('customsDescription')
        .required()
        .minLength(10)
        .withMessage('Please provide a detailed description for customs')
        .when(() => this.isInternationalShipment);
  }

  get isInternationalShipment(): boolean {
    const destCountry = this.form.sameAsBilling
      ? this.form.billingCountry
      : this.form.shippingCountry;

    return destCountry !== 'US';
  }

  get isOvernightShipping(): boolean {
    return this.form.shippingMethod === 'overnight';
  }

  sameAsBillingChanged() {
    if (this.form.sameAsBilling) {
      // Clear shipping address when using billing address
      this.form.shippingStreet = '';
      this.form.shippingCity = '';
      this.form.shippingState = '';
      this.form.shippingZip = '';
      this.form.shippingCountry = this.form.billingCountry;
    }

    // Revalidate after toggling
    this.validation.validate();
  }

  async submit() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    console.log('Shipping form submitted:', this.form);
  }
}
```

```html
<!-- src/components/shipping-form.html -->
  <form submit.trigger="submit()">
    <h2>Billing Address</h2>

    <div class="form-field">
      <label for="billingStreet">Street Address *</label>
      <input
        type="text"
        id="billingStreet"
        value.bind="form.billingStreet & validate">
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="billingCity">City *</label>
        <input
          type="text"
          id="billingCity"
          value.bind="form.billingCity & validate">
      </div>

      <div class="form-field">
        <label for="billingState">State *</label>
        <input
          type="text"
          id="billingState"
          value.bind="form.billingState & validate">
      </div>

      <div class="form-field">
        <label for="billingZip">ZIP Code *</label>
        <input
          type="text"
          id="billingZip"
          value.bind="form.billingZip & validate">
      </div>
    </div>

    <div class="form-field">
      <label for="billingCountry">Country *</label>
      <select id="billingCountry" value.bind="form.billingCountry & validate">
        <option value="US">United States</option>
        <option value="CA">Canada</option>
        <option value="MX">Mexico</option>
        <option value="UK">United Kingdom</option>
        <option value="FR">France</option>
      </select>
    </div>

    <hr>

    <h2>Shipping Address</h2>

    <div class="form-field">
      <label>
        <input
          type="checkbox"
          checked.bind="form.sameAsBilling"
          change.trigger="sameAsBillingChanged()">
        Same as billing address
      </label>
    </div>

    <!-- Only show shipping address fields if different from billing -->
    <div if.bind="!form.sameAsBilling">
      <div class="form-field">
        <label for="shippingStreet">Street Address *</label>
        <input
          type="text"
          id="shippingStreet"
          value.bind="form.shippingStreet & validate">
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="shippingCity">City *</label>
          <input
            type="text"
            id="shippingCity"
            value.bind="form.shippingCity & validate">
        </div>

        <div class="form-field">
          <label for="shippingState">State *</label>
          <input
            type="text"
            id="shippingState"
            value.bind="form.shippingState & validate">
        </div>

        <div class="form-field">
          <label for="shippingZip">ZIP Code *</label>
          <input
            type="text"
            id="shippingZip"
            value.bind="form.shippingZip & validate">
        </div>
      </div>

      <div class="form-field">
        <label for="shippingCountry">Country *</label>
        <select id="shippingCountry" value.bind="form.shippingCountry & validate">
          <option value="US">United States</option>
          <option value="CA">Canada</option>
          <option value="MX">Mexico</option>
          <option value="UK">United Kingdom</option>
          <option value="FR">France</option>
        </select>
      </div>
    </div>

    <hr>

    <h2>Shipping Method</h2>

    <div class="form-field">
      <label for="shippingMethod">Method *</label>
      <select id="shippingMethod" value.bind="form.shippingMethod & validate">
        <option value="">Select shipping method</option>
        <option value="standard">Standard (5-7 days) - $5.99</option>
        <option value="express">Express (2-3 days) - $14.99</option>
        <option value="overnight">Overnight - $29.99</option>
      </select>
    </div>

    <!-- Only show signature option for overnight shipping -->
    <div if.bind="isOvernightShipping" class="form-field">
      <label>
        <input type="checkbox" checked.bind="form.signatureRequired">
        Signature required upon delivery
      </label>
    </div>

    <!-- Only show customs fields for international shipments -->
    <div if.bind="isInternationalShipment">
      <hr>
      <h2>Customs Information</h2>

      <div class="form-field">
        <label for="customsValue">Declared Value (USD) *</label>
        <input
          type="number"
          id="customsValue"
          value.bind="form.customsValue & validate"
          step="0.01"
          min="0">
      </div>

      <div class="form-field">
        <label for="customsDescription">Description *</label>
        <textarea
          id="customsDescription"
          value.bind="form.customsDescription & validate"
          rows="3"
          placeholder="Detailed description of contents for customs"></textarea>
      </div>
    </div>

    <button type="submit" class="btn btn-primary">Continue to Payment</button>
  </form>
```

**Key Features**:
- Conditional field visibility with `if.bind`
- Conditional validation with `.when()`
- Fields depend on checkbox state
- Fields depend on select values
- Automatic revalidation when dependencies change

---

## Form State Management (Dirty, Pristine, Touched)

Track whether forms have been modified and warn users before losing changes.

### Complete Example: Article Editor with Unsaved Changes Warning

```typescript
// src/components/article-editor.ts
import { IRouter, RouteNode } from '@aurelia/router';
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface Article {
  id: string | null;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
}

export class ArticleEditor {
  private article: Article = {
    id: null,
    title: '',
    content: '',
    tags: [],
    published: false
  };

  private originalArticle: Article;
  private isDirty = false;
  private isSaving = false;
  private lastSaved: Date | null = null;
  private autosaveTimer: any = null;

  private validation = resolve(newInstanceForScope(IValidationController));
  private router = resolve(IRouter);
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.validationRules
      .on(this.article)
      .ensure('title')
        .required()
        .minLength(5)
      .ensure('content')
        .required()
        .minLength(50);

    // Store original state
    this.originalArticle = JSON.parse(JSON.stringify(this.article));

    // Setup autosave
    this.setupAutosave();
  }

  binding() {
    // Track changes to mark form as dirty
    this.watchForChanges();
  }

  detaching() {
    // Clean up autosave timer
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
    }
  }

  private watchForChanges() {
    // Simple dirty checking - compare current to original
    // In production, consider using a more robust solution
    const checkDirty = () => {
      this.isDirty = JSON.stringify(this.article) !== JSON.stringify(this.originalArticle);
    };

    // Check after each property change
    // You could use @observable or watch the properties more elegantly
    setInterval(checkDirty, 500);
  }

  private setupAutosave() {
    // Autosave every 30 seconds if dirty
    this.autosaveTimer = setInterval(() => {
      if (this.isDirty && !this.isSaving) {
        this.saveDraft();
      }
    }, 30000);
  }

  async saveDraft() {
    if (this.isSaving) return;

    this.isSaving = true;

    try {
      // Save to localStorage as draft
      localStorage.setItem('article-draft', JSON.stringify(this.article));
      this.lastSaved = new Date();

      console.log('Draft saved');
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async publish() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    this.isSaving = true;

    try {
      this.article.published = true;
      await this.saveArticle();

      // Update original state
      this.originalArticle = JSON.parse(JSON.stringify(this.article));
      this.isDirty = false;

      // Clear draft
      localStorage.removeItem('article-draft');

      // Navigate away
      await this.router.load('/articles');
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      this.isSaving = false;
    }
  }

  async save() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    this.isSaving = true;

    try {
      this.article.published = false;
      await this.saveArticle();

      // Update original state
      this.originalArticle = JSON.parse(JSON.stringify(this.article));
      this.isDirty = false;

      // Clear draft
      localStorage.removeItem('article-draft');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      this.isSaving = false;
    }
  }

  private async saveArticle(): Promise<void> {
    const response = await fetch('/api/articles', {
      method: this.article.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.article)
    });

    if (!response.ok) {
      throw new Error('Failed to save article');
    }

    const saved = await response.json();
    this.article.id = saved.id;
  }

  // Router lifecycle hook - prevent navigation if dirty
  canUnload(next: RouteNode | null, current: RouteNode): boolean {
    if (!this.isDirty) {
      return true;
    }

    // Show confirmation dialog
    return confirm('You have unsaved changes. Are you sure you want to leave?');
  }

  get lastSavedText(): string {
    if (!this.lastSaved) {
      return 'Never saved';
    }

    const seconds = Math.floor((Date.now() - this.lastSaved.getTime()) / 1000);

    if (seconds < 60) {
      return 'Saved just now';
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `Saved ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      const hours = Math.floor(seconds / 3600);
      return `Saved ${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
  }
}
```

```html
<!-- src/components/article-editor.html -->
  <div class="article-editor">
    <!-- Status bar -->
    <div class="editor-status">
      <span class="status-indicator ${isDirty ? 'dirty' : 'clean'}">
        ${isDirty ? 'Unsaved changes' : 'All changes saved'}
      </span>
      <span class="last-saved">${lastSavedText}</span>
      <span if.bind="isSaving" class="saving-indicator">Saving...</span>
    </div>

    <!-- Editor form -->
    <div class="form-field">
      <label for="title">Title *</label>
      <input
        type="text"
        id="title"
        value.bind="article.title & validate"
        placeholder="Enter article title">
    </div>

    <div class="form-field">
      <label for="content">Content *</label>
      <textarea
        id="content"
        value.bind="article.content & validate"
        rows="20"
        placeholder="Write your article..."></textarea>
    </div>

    <div class="form-field">
      <label for="tags">Tags (comma-separated)</label>
      <input
        type="text"
        id="tags"
        value.bind="article.tags"
        placeholder="javascript, aurelia, web development">
    </div>

    <!-- Actions -->
    <div class="editor-actions">
      <button
        type="button"
        click.trigger="saveDraft()"
        disabled.bind="!isDirty || isSaving"
        class="btn btn-secondary">
        Save Draft
      </button>

      <button
        type="button"
        click.trigger="save()"
        disabled.bind="isSaving"
        class="btn btn-primary">
        ${isSaving ? 'Saving...' : 'Save'}
      </button>

      <button
        type="button"
        click.trigger="publish()"
        disabled.bind="isSaving"
        class="btn btn-success">
        ${isSaving ? 'Publishing...' : 'Publish'}
      </button>
    </div>
  </div>
```

**Key Features**:
- Dirty state tracking (compare current vs original)
- Autosave to localStorage every 30 seconds
- Last saved timestamp with human-readable formatting
- Prevent navigation with `canUnload` router hook
- Visual indicators for save state
- Disable actions while saving

---

## Form Arrays (Repeating Field Groups)

Form arrays allow users to add/remove entire groups of fields, like invoice line items or multiple addresses.

### Complete Example: Invoice Form with Line Items

```typescript
// src/components/invoice-form.ts
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export class InvoiceForm {
  private invoice: Invoice = {
    invoiceNumber: this.generateInvoiceNumber(),
    customerName: '',
    customerEmail: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [this.createLineItem()],
    subtotal: 0,
    tax: 0,
    total: 0
  };

  private readonly taxRate = 0.08; // 8% tax
  private nextItemId = 1;

  private validation = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.setupValidation();
  }

  private generateInvoiceNumber(): string {
    return `INV-${Date.now()}`;
  }

  private createLineItem(): LineItem {
    return {
      id: `item-${this.nextItemId++}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
  }

  private setupValidation() {
    this.validationRules
      .on(this.invoice)
      .ensure('invoiceNumber')
        .required()
      .ensure('customerName')
        .required()
        .minLength(2)
      .ensure('customerEmail')
        .required()
        .email()
      .ensure('invoiceDate')
        .required()
      .ensure('dueDate')
        .required()
        .satisfies((value: string) => {
          if (!value || !this.invoice.invoiceDate) return true;
          return new Date(value) >= new Date(this.invoice.invoiceDate);
        })
        .withMessage('Due date must be after invoice date')
      .ensure('items')
        .required()
        .minItems(1)
        .withMessage('At least one line item is required')
        .satisfies((items: LineItem[]) =>
          items.every(item =>
            item.description.trim().length > 0 &&
            item.quantity > 0 &&
            item.unitPrice >= 0
          )
        )
        .withMessage('All line items must be complete');
  }

  addLineItem() {
    this.invoice.items.push(this.createLineItem());
  }

  removeLineItem(id: string) {
    if (this.invoice.items.length <= 1) {
      return; // Must have at least one item
    }

    const index = this.invoice.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.invoice.items.splice(index, 1);
      this.calculateTotals();
    }
  }

  duplicateLineItem(id: string) {
    const index = this.invoice.items.findIndex(item => item.id === id);
    if (index !== -1) {
      const original = this.invoice.items[index];
      const duplicate = {
        ...original,
        id: `item-${this.nextItemId++}`
      };
      this.invoice.items.splice(index + 1, 0, duplicate);
      this.calculateTotals();
    }
  }

  updateLineItem(item: LineItem) {
    item.total = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  private calculateTotals() {
    this.invoice.subtotal = this.invoice.items.reduce(
      (sum, item) => sum + item.total,
      0
    );

    this.invoice.tax = this.invoice.subtotal * this.taxRate;
    this.invoice.total = this.invoice.subtotal + this.invoice.tax;
  }

  async submit() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    console.log('Invoice submitted:', this.invoice);
    // API call to save invoice
  }

  get canRemoveItem(): boolean {
    return this.invoice.items.length > 1;
  }
}
```

```html
<!-- src/components/invoice-form.html -->
  <form submit.trigger="submit()" class="invoice-form">
    <h2>Create Invoice</h2>

    <!-- Invoice Header -->
    <div class="invoice-header">
      <div class="form-row">
        <div class="form-field">
          <label for="invoiceNumber">Invoice Number *</label>
          <input
            type="text"
            id="invoiceNumber"
            value.bind="invoice.invoiceNumber & validate"
            readonly>
        </div>

        <div class="form-field">
          <label for="invoiceDate">Invoice Date *</label>
          <input
            type="date"
            id="invoiceDate"
            value.bind="invoice.invoiceDate & validate">
        </div>

        <div class="form-field">
          <label for="dueDate">Due Date *</label>
          <input
            type="date"
            id="dueDate"
            value.bind="invoice.dueDate & validate">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="customerName">Customer Name *</label>
          <input
            type="text"
            id="customerName"
            value.bind="invoice.customerName & validate">
        </div>

        <div class="form-field">
          <label for="customerEmail">Customer Email *</label>
          <input
            type="email"
            id="customerEmail"
            value.bind="invoice.customerEmail & validate">
        </div>
      </div>
    </div>

    <!-- Line Items -->
    <div class="invoice-items">
      <div class="items-header">
        <h3>Line Items</h3>
        <button
          type="button"
          click.trigger="addLineItem()"
          class="btn btn-secondary btn-small">
          + Add Item
        </button>
      </div>

      <div class="items-table">
        <div class="items-table-header">
          <div class="col-description">Description</div>
          <div class="col-quantity">Qty</div>
          <div class="col-price">Unit Price</div>
          <div class="col-total">Total</div>
          <div class="col-actions">Actions</div>
        </div>

        <div
          repeat.for="item of invoice.items"
          class="line-item"
          id.bind="item.id">

          <div class="col-description">
            <input
              type="text"
              value.bind="item.description"
              change.trigger="updateLineItem(item)"
              placeholder="Item description"
              aria-label="Description for item ${$index + 1}">
          </div>

          <div class="col-quantity">
            <input
              type="number"
              value.bind="item.quantity"
              change.trigger="updateLineItem(item)"
              min="1"
              step="1"
              aria-label="Quantity for item ${$index + 1}">
          </div>

          <div class="col-price">
            <input
              type="number"
              value.bind="item.unitPrice"
              change.trigger="updateLineItem(item)"
              min="0"
              step="0.01"
              aria-label="Unit price for item ${$index + 1}">
          </div>

          <div class="col-total">
            $${item.total | numberFormat:'0.00'}
          </div>

          <div class="col-actions">
            <button
              type="button"
              click.trigger="duplicateLineItem(item.id)"
              class="btn btn-icon"
              title="Duplicate"
              aria-label="Duplicate item ${$index + 1}">
              📋
            </button>

            <button
              type="button"
              click.trigger="removeLineItem(item.id)"
              disabled.bind="!canRemoveItem"
              class="btn btn-icon btn-danger"
              title="Remove"
              aria-label="Remove item ${$index + 1}">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="invoice-totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${invoice.subtotal | numberFormat:'0.00'}</span>
      </div>
      <div class="total-row">
        <span>Tax (${taxRate * 100}%):</span>
        <span>$${invoice.tax | numberFormat:'0.00'}</span>
      </div>
      <div class="total-row total-row-grand">
        <span>Total:</span>
        <span>$${invoice.total | numberFormat:'0.00'}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">
        Save Invoice
      </button>
    </div>
  </form>
```

**Key Features**:
- Add/remove line items dynamically
- Duplicate line items
- Auto-calculate line totals and invoice totals
- Validate entire array of items
- Prevent removing last item
- Unique IDs for each line item
- Accessible labels for screen readers

---

## Complex File Uploads with Preview & Progress

Handle multiple file uploads with image previews, progress tracking, and validation.

### Complete Example: Image Gallery Upload

```typescript
// src/components/image-upload.ts
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export class ImageUpload {
  private files: UploadedFile[] = [];
  private dragOver = false;
  private nextId = 1;

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly maxFiles = 10;
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  private validation = resolve(newInstanceForScope(IValidationController));

  constructor(
    @IValidationRules validationRules: IValidationRules = resolve(IValidationRules)
  ) {
    validationRules
      .on(this)
      .ensure('files')
        .required()
        .minItems(1)
        .withMessage('Please upload at least one image')
        .satisfies((files: UploadedFile[]) => files.length <= this.maxFiles)
        .withMessage(`Maximum ${this.maxFiles} images allowed`);
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    this.addFiles(files);

    // Clear input so same file can be selected again
    input.value = '';
  }

  handleDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver = false;

    const files = Array.from(event.dataTransfer?.files || []);
    this.addFiles(files);
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver = true;
  }

  handleDragLeave() {
    this.dragOver = false;
  }

  private addFiles(files: File[]) {
    for (const file of files) {
      // Check if we've reached the limit
      if (this.files.length >= this.maxFiles) {
        alert(`Maximum ${this.maxFiles} files allowed`);
        break;
      }

      // Validate file type
      if (!this.allowedTypes.includes(file.type)) {
        alert(`${file.name}: Invalid file type. Only images allowed.`);
        continue;
      }

      // Validate file size
      if (file.size > this.maxFileSize) {
        alert(`${file.name}: File too large. Maximum ${this.maxFileSize / 1024 / 1024}MB.`);
        continue;
      }

      // Create uploaded file entry
      const uploadedFile: UploadedFile = {
        id: `file-${this.nextId++}`,
        file,
        preview: '',
        progress: 0,
        status: 'pending'
      };

      this.files.push(uploadedFile);

      // Generate preview
      this.generatePreview(uploadedFile);
    }
  }

  private generatePreview(uploadedFile: UploadedFile) {
    const reader = new FileReader();

    reader.onload = (e) => {
      uploadedFile.preview = e.target?.result as string;
    };

    reader.readAsDataURL(uploadedFile.file);
  }

  removeFile(id: string) {
    const index = this.files.findIndex(f => f.id === id);
    if (index !== -1) {
      this.files.splice(index, 1);
    }
  }

  async uploadFile(uploadedFile: UploadedFile) {
    if (uploadedFile.status === 'uploading' || uploadedFile.status === 'complete') {
      return;
    }

    uploadedFile.status = 'uploading';
    uploadedFile.progress = 0;

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile.file);

      // Simulate upload with progress
      await this.simulateUpload(uploadedFile);

      uploadedFile.status = 'complete';
      uploadedFile.progress = 100;
    } catch (error) {
      uploadedFile.status = 'error';
      uploadedFile.error = error.message || 'Upload failed';
    }
  }

  private async simulateUpload(uploadedFile: UploadedFile): Promise<void> {
    // In real implementation, use XMLHttpRequest or fetch with progress
    return new Promise((resolve) => {
      const duration = 2000; // 2 seconds
      const interval = 100; // Update every 100ms
      const increment = (interval / duration) * 100;

      const timer = setInterval(() => {
        uploadedFile.progress += increment;

        if (uploadedFile.progress >= 100) {
          clearInterval(timer);
          uploadedFile.progress = 100;
          resolve();
        }
      }, interval);
    });
  }

  async uploadAll() {
    const pending = this.files.filter(f => f.status === 'pending' || f.status === 'error');

    for (const file of pending) {
      await this.uploadFile(file);
    }
  }

  async submit() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    // Upload any pending files
    await this.uploadAll();

    // Check if all uploaded successfully
    const hasErrors = this.files.some(f => f.status === 'error');
    if (hasErrors) {
      alert('Some files failed to upload. Please try again.');
      return;
    }

    console.log('All files uploaded successfully!', this.files);
  }

  get uploadedCount(): number {
    return this.files.filter(f => f.status === 'complete').length;
  }

  get totalSize(): string {
    const bytes = this.files.reduce((sum, f) => sum + f.file.size, 0);
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  }
}
```

```html
<!-- src/components/image-upload.html -->
  <div class="image-upload">
    <h2>Upload Images</h2>

    <!-- Drop Zone -->
    <div
      class="drop-zone ${dragOver ? 'drag-over' : ''}"
      drop.trigger="handleDrop($event)"
      dragover.trigger="handleDragOver($event)"
      dragleave.trigger="handleDragLeave()">

      <div class="drop-zone-content">
        <p class="drop-zone-icon">📁</p>
        <p class="drop-zone-text">Drag & drop images here</p>
        <p class="drop-zone-or">or</p>

        <label for="fileInput" class="btn btn-primary">
          Choose Files
        </label>
        <input
          type="file"
          id="fileInput"
          change.trigger="handleFileSelect($event)"
          multiple
          accept="${allowedTypes.join(',')}"
          style="display: none;">

        <p class="drop-zone-hint">
          Maximum ${maxFiles} files, ${maxFileSize / 1024 / 1024}MB each
        </p>
      </div>
    </div>

    <!-- File List -->
    <div if.bind="files.length > 0" class="file-list">
      <div class="file-list-header">
        <h3>Selected Files (${files.length}/${maxFiles})</h3>
        <div class="file-list-stats">
          <span>${uploadedCount} uploaded</span>
          <span>${totalSize} total</span>
        </div>
      </div>

      <div class="file-grid">
        <div
          repeat.for="file of files"
          class="file-item file-item-${file.status}">

          <!-- Preview -->
          <div class="file-preview">
            <img
              if.bind="file.preview"
              src.bind="file.preview"
              alt="${file.file.name}">
            <div if.bind="!file.preview" class="file-preview-loading">
              Loading...
            </div>
          </div>

          <!-- Info -->
          <div class="file-info">
            <div class="file-name" title.bind="file.file.name">
              ${file.file.name}
            </div>
            <div class="file-size">
              ${file.file.size / 1024 | numberFormat:'0.0'} KB
            </div>
          </div>

          <!-- Progress -->
          <div if.bind="file.status === 'uploading'" class="file-progress">
            <div class="progress-bar">
              <div
                class="progress-fill"
                style="width: ${file.progress}%"></div>
            </div>
            <div class="progress-text">${file.progress | numberFormat:'0'}%</div>
          </div>

          <!-- Status -->
          <div class="file-status">
            <span if.bind="file.status === 'pending'" class="status-badge status-pending">
              Pending
            </span>
            <span if.bind="file.status === 'uploading'" class="status-badge status-uploading">
              Uploading...
            </span>
            <span if.bind="file.status === 'complete'" class="status-badge status-complete">
              ✓ Complete
            </span>
            <span if.bind="file.status === 'error'" class="status-badge status-error">
              ✕ ${file.error}
            </span>
          </div>

          <!-- Actions -->
          <div class="file-actions">
            <button
              if.bind="file.status === 'pending' || file.status === 'error'"
              type="button"
              click.trigger="uploadFile(file)"
              class="btn btn-icon btn-small">
              ↑
            </button>

            <button
              type="button"
              click.trigger="removeFile(file.id)"
              class="btn btn-icon btn-small btn-danger">
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div class="file-list-actions">
        <button
          type="button"
          click.trigger="uploadAll()"
          class="btn btn-secondary">
          Upload All
        </button>

        <button
          type="button"
          click.trigger="submit()"
          class="btn btn-primary">
          Complete Upload
        </button>
      </div>
    </div>
  </div>
```

**Key Features**:
- Drag & drop support
- Image preview generation
- Progress tracking for each file
- File type and size validation
- Multiple file selection
- Individual or bulk upload
- Error handling per file
- Visual status indicators

---

## Dependent Dropdowns (Cascading Selects)

Dropdowns where options depend on previous selections, like country → state → city.

### Complete Example: Location Selector

```typescript
// src/components/location-selector.ts
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface Country {
  code: string;
  name: string;
}

interface State {
  code: string;
  name: string;
  countryCode: string;
}

interface City {
  id: string;
  name: string;
  stateCode: string;
}

interface LocationForm {
  country: string;
  state: string;
  city: string;
  address: string;
  zipCode: string;
}

export class LocationSelector {
  private form: LocationForm = {
    country: '',
    state: '',
    city: '',
    address: '',
    zipCode: ''
  };

  // Mock data (in real app, load from API)
  private allCountries: Country[] = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' }
  ];

  private allStates: State[] = [
    { code: 'CA', name: 'California', countryCode: 'US' },
    { code: 'NY', name: 'New York', countryCode: 'US' },
    { code: 'TX', name: 'Texas', countryCode: 'US' },
    { code: 'ON', name: 'Ontario', countryCode: 'CA' },
    { code: 'BC', name: 'British Columbia', countryCode: 'CA' },
    { code: 'JA', name: 'Jalisco', countryCode: 'MX' }
  ];

  private allCities: City[] = [
    { id: '1', name: 'Los Angeles', stateCode: 'CA' },
    { id: '2', name: 'San Francisco', stateCode: 'CA' },
    { id: '3', name: 'New York City', stateCode: 'NY' },
    { id: '4', name: 'Buffalo', stateCode: 'NY' },
    { id: '5', name: 'Houston', stateCode: 'TX' },
    { id: '6', name: 'Dallas', stateCode: 'TX' },
    { id: '7', name: 'Toronto', stateCode: 'ON' },
    { id: '8', name: 'Vancouver', stateCode: 'BC' },
    { id: '9', name: 'Guadalajara', stateCode: 'JA' }
  ];

  private isLoadingStates = false;
  private isLoadingCities = false;

  private validation = resolve(newInstanceForScope(IValidationController));

  constructor(
    @IValidationRules validationRules: IValidationRules = resolve(IValidationRules)
  ) {
    validationRules
      .on(this.form)
      .ensure('country')
        .required()
      .ensure('state')
        .required()
      .ensure('city')
        .required()
      .ensure('address')
        .required()
        .minLength(5)
      .ensure('zipCode')
        .required()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Please enter a valid ZIP code');
  }

  // Computed: Available states based on selected country
  get availableStates(): State[] {
    if (!this.form.country) return [];
    return this.allStates.filter(s => s.countryCode === this.form.country);
  }

  // Computed: Available cities based on selected state
  get availableCities(): City[] {
    if (!this.form.state) return [];
    return this.allCities.filter(c => c.stateCode === this.form.state);
  }

  // When country changes, reset dependent fields
  async countryChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.form.state = '';
      this.form.city = '';

      // In real app, load states from API
      if (newValue) {
        this.isLoadingStates = true;
        await this.loadStates(newValue);
        this.isLoadingStates = false;
      }
    }
  }

  // When state changes, reset city
  async stateChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.form.city = '';

      // In real app, load cities from API
      if (newValue) {
        this.isLoadingCities = true;
        await this.loadCities(newValue);
        this.isLoadingCities = false;
      }
    }
  }

  private async loadStates(countryCode: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // States are already filtered by computed property
  }

  private async loadCities(stateCode: string): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Cities are already filtered by computed property
  }

  async submit() {
    const result = await this.validation.validate();

    if (!result.valid) {
      return;
    }

    console.log('Location submitted:', this.form);
  }
}
```

```html
<!-- src/components/location-selector.html -->
  <form submit.trigger="submit()" class="location-form">
    <h2>Enter Your Location</h2>

    <div class="form-field">
      <label for="country">Country *</label>
      <select
        id="country"
        value.bind="form.country & validate">
        <option value="">Select a country</option>
        <option
          repeat.for="country of allCountries"
          value.bind="country.code">
          ${country.name}
        </option>
      </select>
    </div>

    <div class="form-field">
      <label for="state">State/Province *</label>
      <select
        id="state"
        value.bind="form.state & validate"
        disabled.bind="!form.country || isLoadingStates">
        <option value="">
          ${isLoadingStates ? 'Loading...' : 'Select a state'}
        </option>
        <option
          repeat.for="state of availableStates"
          value.bind="state.code">
          ${state.name}
        </option>
      </select>
      <div if.bind="!form.country" class="field-hint">
        Please select a country first
      </div>
    </div>

    <div class="form-field">
      <label for="city">City *</label>
      <select
        id="city"
        value.bind="form.city & validate"
        disabled.bind="!form.state || isLoadingCities">
        <option value="">
          ${isLoadingCities ? 'Loading...' : 'Select a city'}
        </option>
        <option
          repeat.for="city of availableCities"
          value.bind="city.id">
          ${city.name}
        </option>
      </select>
      <div if.bind="!form.state" class="field-hint">
        Please select a state first
      </div>
    </div>

    <div class="form-field">
      <label for="address">Street Address *</label>
      <input
        type="text"
        id="address"
        value.bind="form.address & validate"
        placeholder="123 Main St">
    </div>

    <div class="form-field">
      <label for="zipCode">ZIP/Postal Code *</label>
      <input
        type="text"
        id="zipCode"
        value.bind="form.zipCode & validate"
        placeholder="12345">
    </div>

    <button type="submit" class="btn btn-primary">
      Continue
    </button>
  </form>
```

**Key Features**:
- Cascading selects (country → state → city)
- Computed properties for filtered options
- Auto-reset dependent fields when parent changes
- Loading states while fetching options
- Disabled state until parent is selected
- Helpful hints for users

---

## Reusable Form Field Components

Create reusable form field components that encapsulate label, input, validation, and error display.

### Complete Example: Validated Text Field Component

```typescript
// src/components/validated-field.ts
import { bindable, INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

export class ValidatedField {
  @bindable label: string;
  @bindable value: any;
  @bindable type: string = 'text';
  @bindable placeholder: string = '';
  @bindable required: boolean = false;
  @bindable disabled: boolean = false;
  @bindable hint: string = '';
  @bindable validation: IValidationController;

  private fieldId: string;
  private inputElement: HTMLInputElement;
  private element = resolve(INode);

  constructor() {
    this.fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;
  }

  get errors(): string[] {
    if (!this.validation) return [];

    const results = this.validation.results || [];
    return results
      .filter(r => !r.valid && r.propertyName === this.getPropertyName())
      .map(r => r.message);
  }

  get hasError(): boolean {
    return this.errors.length > 0;
  }

  private getPropertyName(): string {
    // Extract property name from binding expression
    // This is a simplified version
    const binding = this.element.getAttribute('value.bind');
    return binding?.split('&')[0].trim() || '';
  }

  focus() {
    this.inputElement?.focus();
  }
}
```

```html
<!-- src/components/validated-field.html -->
  <div class="form-field ${hasError ? 'has-error' : ''}">
    <label for.bind="fieldId">
      ${label}
      <span if.bind="required" class="required-indicator">*</span>
    </label>

    <input
      ref="inputElement"
      type.bind="type"
      id.bind="fieldId"
      value.bind="value & validate"
      placeholder.bind="placeholder"
      disabled.bind="disabled"
      aria-invalid.bind="hasError"
      aria-describedby="${fieldId}-hint ${hasError ? `${fieldId}-error` : ''}">

    <div
      if.bind="hint && !hasError"
      id="${fieldId}-hint"
      class="field-hint">
      ${hint}
    </div>

    <div
      if.bind="hasError"
      id="${fieldId}-error"
      class="field-error"
      role="alert">
      ${errors[0]}
    </div>
  </div>
```

### Usage Example

```typescript
// src/pages/signup.ts
import { newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class Signup {
  private user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  private validation = resolve(newInstanceForScope(IValidationController));

  constructor(
    @IValidationRules validationRules: IValidationRules = resolve(IValidationRules)
  ) {
    validationRules
      .on(this.user)
      .ensure('username')
        .required()
        .minLength(3)
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
      .ensure('email')
        .required()
        .email()
      .ensure('password')
        .required()
        .minLength(8)
      .ensure('confirmPassword')
        .required()
        .satisfies((value: string) => value === this.user.password)
        .withMessage('Passwords must match');
  }

  async submit() {
    const result = await this.validation.validate();
    if (!result.valid) return;

    console.log('Signup:', this.user);
  }
}
```

```html
<!-- src/pages/signup.html -->
  <form submit.trigger="submit()">
    <h2>Sign Up</h2>

    <validated-field
      label="Username"
      value.bind="user.username"
      validation.bind="validation"
      required.bind="true"
      hint="Letters, numbers, and underscores only">
    </validated-field>

    <validated-field
      label="Email"
      type="email"
      value.bind="user.email"
      validation.bind="validation"
      required.bind="true">
    </validated-field>

    <validated-field
      label="Password"
      type="password"
      value.bind="user.password"
      validation.bind="validation"
      required.bind="true"
      hint="Minimum 8 characters">
    </validated-field>

    <validated-field
      label="Confirm Password"
      type="password"
      value.bind="user.confirmPassword"
      validation.bind="validation"
      required.bind="true">
    </validated-field>

    <button type="submit" class="btn btn-primary">
      Create Account
    </button>
  </form>
```

**Key Features**:
- Encapsulates label, input, validation, error display
- Reusable across entire application
- Consistent styling and behavior
- Accessible (proper ARIA attributes)
- Reduced boilerplate in forms

---

## Related Documentation

- [Form Basics](./README.md) - Basic form concepts
- [Validation Plugin](../../aurelia-packages/validation/README.md) - Complete validation guide
- [Form Submission](./submission.md) - Handling form submission
- [Collections (Checkboxes, Radios, Select)](./collections.md) - Working with form collections
- [File Uploads](./file-uploads.md) - File upload patterns

---

## Summary

These advanced patterns handle complex real-world scenarios:

1. **Multi-step wizards** - Break complex forms into manageable steps with conditional validation and progress tracking
2. **Dynamic forms** - Add/remove individual fields at runtime with validation
3. **Conditional validation** - Validation rules that depend on other field values
4. **Form state management** - Track changes, prevent data loss, implement autosave with router guards
5. **Form arrays** - Repeating field groups (like invoice line items) with add/remove/duplicate functionality
6. **Complex file uploads** - Multiple file uploads with drag & drop, previews, progress tracking, and per-file validation
7. **Dependent dropdowns** - Cascading selects (country → state → city) with auto-reset and loading states
8. **Reusable form fields** - Encapsulated field components with built-in validation display

All examples use proper Aurelia 2 syntax with the validation plugin and follow accessibility best practices. Each pattern includes complete, production-ready code with TypeScript interfaces, validation rules, and accessible HTML templates.

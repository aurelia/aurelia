---
description: >-
  Master Aurelia 2 forms with comprehensive coverage of binding patterns, advanced 
  collections, validation integration, and performance optimization for production applications.
---

# Forms and Input Handling

Forms are the cornerstone of interactive web applications. Whether you're building simple contact forms, complex data-entry systems, or dynamic configuration interfaces, Aurelia provides a comprehensive and performant forms system. This guide covers everything from basic input binding to advanced patterns like collection-based form controls, dynamic form generation, and seamless validation integration.

{% hint style="success" %}
**Looking for focused guides?** This is a comprehensive reference covering all form concepts. For more digestible, task-focused guides, check out:
- **[Form Basics](forms/README.md)** - Text inputs, textareas, number/date inputs
- **[Collections](forms/collections.md)** - Checkboxes, radio buttons, select elements, Sets, Maps
- **[Form Submission](forms/submission.md)** - Handling form submission, state management, auto-save
- **[File Uploads](forms/file-uploads.md)** - File input handling, validation, progress tracking
- **[Advanced Patterns](forms/advanced-patterns.md)** - Multi-step wizards, dynamic forms, conditional validation, form state management
{% endhint %}

{% hint style="info" %}
This guide assumes familiarity with Aurelia's binding system and template syntax. For fundamentals, see [Template Syntax & Features](template-syntax/overview.md) first.
{% endhint %}

## Table of Contents

1. [Understanding Aurelia's Form Architecture](#understanding-aurelias-form-architecture)
2. [Basic Input Binding](#basic-input-binding) 
3. [Advanced Collection Patterns](#advanced-collection-patterns)
4. [Dynamic Forms and Performance](#dynamic-forms-and-performance)
5. [Event Handling and Binding Behaviors](#event-handling-and-binding-behaviors)
6. [Validation Integration](#validation-integration)
7. [File Upload Handling](#file-upload-handling)
8. [Form Submission Patterns](#form-submission-patterns)
9. [Security and Best Practices](#security-and-best-practices)
10. [Accessibility Considerations](#accessibility-considerations)

---

## Understanding Aurelia's Form Architecture

Aurelia's forms system is built on sophisticated observer patterns that provide automatic synchronization between your view models and form controls. Understanding this architecture helps you build more efficient and maintainable forms.

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

---

## Basic Input Binding

Aurelia provides intuitive two-way binding for all standard form elements. Let's start with the fundamentals and build toward advanced patterns.

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
      // Process form submission
      console.log('Submitting:', { email: this.email, password: this.password });
    }
  }
}
```

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
  
  // Computed property demonstrating reactive updates
  get isAdult(): boolean {
    return this.age >= 18;
  }
}
```

`value-as-number` binds to the input's `valueAsNumber`, so `age` is a `number` (or `NaN` when the field is empty/invalid). `value-as-date` binds to `valueAsDate`, giving you a `Date | null`. If you keep `value.bind`, the value remains a string—be sure to convert it before serializing to JSON for APIs.

---

## Binding With Text and Textarea Inputs

### Text Input

Binding to text inputs in Aurelia is straightforward:

```html
<form>
  <label>User value:</label><br />
  <input type="text" value.bind="userValue" />
</form>
```

You can also bind other attributes like placeholder:

```html
<form>
  <label>User value:</label><br />
  <input type="text" value.bind="userValue" placeholder.bind="myPlaceholder" />
</form>
```

### Textarea

Textareas work just like text inputs, with value.bind for two-way binding:

```html
<form>
  <label>Comments:</label><br />
  <textarea value.bind="textAreaValue"></textarea>
</form>
```

Any changes to `textAreaValue` in the view model will show up in the `<textarea>`, and vice versa.

---

## Advanced Collection Patterns

One of Aurelia's most powerful features is its sophisticated support for collection-based form controls. Beyond simple arrays, Aurelia supports Sets, Maps, and custom collection types with optimal performance characteristics.

### Boolean Checkboxes

The simplest checkbox pattern binds to boolean properties:

```typescript
export class PreferencesForm {
  emailNotifications = false;
  smsNotifications = true;
  pushNotifications = false;
  
  // Computed property for form validation
  get hasValidNotificationPrefs(): boolean {
    return this.emailNotifications || this.smsNotifications || this.pushNotifications;
  }
}
```

```html
<form>
  <fieldset>
    <legend>Notification Preferences</legend>
    <label>
      <input type="checkbox" checked.bind="emailNotifications" />
      Email notifications
    </label>
    <label>
      <input type="checkbox" checked.bind="smsNotifications" />
      SMS notifications
    </label>
    <label>
      <input type="checkbox" checked.bind="pushNotifications" />
      Push notifications
    </label>
  </fieldset>
  
  <div if.bind="!hasValidNotificationPrefs" class="warning">
    Please select at least one notification method.
  </div>
</form>
```

### Array-Based Multi-Select

For traditional multi-select scenarios, bind arrays to checkbox groups:

```typescript
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

export class ProductSelectionForm {
  products: Product[] = [
    { id: 1, name: "Gaming Mouse", category: "Peripherals", price: 89.99 },
    { id: 2, name: "Mechanical Keyboard", category: "Peripherals", price: 159.99 },
    { id: 3, name: "4K Monitor", category: "Display", price: 399.99 },
    { id: 4, name: "Graphics Card", category: "Components", price: 599.99 }
  ];

  // Array of selected product IDs
  selectedProductIds: number[] = [];
  
  // Array of selected product objects
  selectedProducts: Product[] = [];

  get totalValue(): number {
    return this.selectedProducts.reduce((sum, product) => sum + product.price, 0);
  }
}
```

```html
<form>
  <h3>Select Products</h3>
  
  <!-- ID-based selection -->
  <div class="product-grid">
    <div repeat.for="product of products" class="product-card">
      <label>
        <input type="checkbox" 
               model.bind="product.id" 
               checked.bind="selectedProductIds" />
        <strong>${product.name}</strong>
        <span class="category">${product.category}</span>
        <span class="price">$${product.price}</span>
      </label>
    </div>
  </div>

  <!-- Object-based selection (more flexible) -->
  <h4>Or select complete product objects:</h4>
  <div class="product-list">
    <label repeat.for="product of products" class="product-item">
      <input type="checkbox" 
             model.bind="product" 
             checked.bind="selectedProducts" />
      ${product.name} - $${product.price}
    </label>
  </div>

  <div class="summary" if.bind="selectedProducts.length">
    <h4>Selected Items (${selectedProducts.length})</h4>
    <ul>
      <li repeat.for="product of selectedProducts">
        ${product.name} - $${product.price}
      </li>
    </ul>
    <strong>Total: $${totalValue | number:'0.00'}</strong>
  </div>
</form>
```

### Set-Based Collections (Advanced)

For high-performance scenarios with frequent additions/removals, use Set collections:

```typescript
export class TagSelectionForm {
  availableTags = [
    { id: 'frontend', name: 'Frontend Development', color: '#blue' },
    { id: 'backend', name: 'Backend Development', color: '#green' },
    { id: 'database', name: 'Database Design', color: '#orange' },
    { id: 'devops', name: 'DevOps', color: '#purple' },
    { id: 'mobile', name: 'Mobile Development', color: '#red' }
  ];

  // Set-based selection for O(1) lookups
  selectedTags: Set<string> = new Set(['frontend', 'database']);

  get selectedTagList() {
    return this.availableTags.filter(tag => this.selectedTags.has(tag.id));
  }

  toggleTag(tagId: string) {
    if (this.selectedTags.has(tagId)) {
      this.selectedTags.delete(tagId);
    } else {
      this.selectedTags.add(tagId);
    }
  }
}
```

```html
<form>
  <h3>Select Your Skills</h3>
  <div class="tag-container">
    <label repeat.for="tag of availableTags" 
           class="tag-label" 
           css.bind="{ '--tag-color': tag.color }">
      <input type="checkbox" 
             model.bind="tag.id" 
             checked.bind="selectedTags" />
      <span class="tag-text">${tag.name}</span>
    </label>
  </div>

  <div if.bind="selectedTags.size > 0" class="selected-tags">
    <h4>Selected Skills (${selectedTags.size})</h4>
    <div class="tag-chips">
      <span repeat.for="tag of selectedTagList" class="tag-chip">
        ${tag.name}
        <button type="button" 
                click.trigger="toggleTag(tag.id)" 
                class="remove-tag">×</button>
      </span>
    </div>
  </div>
</form>
```

### Resource-Keyed Collections (Expert Level)

### Per-Resource Permission Sets (Expert Level)

For complex key-value selections (e.g., multiple actions per resource), keep a `Set` per resource so each checkbox can reuse Aurelia's built-in collection handling:

```typescript
interface Permission {
  resource: string;
  actions: string[];
  description: string;
}

export class PermissionForm {
  permissions: Permission[] = [
    {
      resource: 'users',
      actions: ['create', 'read', 'update', 'delete'],
      description: 'User management operations'
    },
    {
      resource: 'posts',
      actions: ['create', 'read', 'update', 'delete', 'publish'],
      description: 'Content management operations'
    },
    {
      resource: 'settings',
      actions: ['read', 'update'],
      description: 'System configuration'
    }
  ];

  // Record: resource -> Set<action>
  selectedPermissions: Record<string, Set<string>> = {};

  constructor() {
    for (const permission of this.permissions) {
      this.selectedPermissions[permission.resource] = new Set();
    }
    this.selectedPermissions['users'].add('read');
    this.selectedPermissions['posts'].add('read');
    this.selectedPermissions['posts'].add('create');
  }

  get permissionSummary() {
    const summary: Array<{ resource: string; actions: string[] }> = [];
    Object.entries(this.selectedPermissions).forEach(([resource, actions]) => {
      if (actions.size > 0) {
        summary.push({ resource, actions: Array.from(actions) });
      }
    });
    return summary;
  }
}
```

```html
<form>
  <h3>Configure Permissions</h3>
  <div class="permission-matrix">
    <div repeat.for="permission of permissions" class="permission-group">
      <h4>${permission.resource | capitalize}</h4>
      <p class="description">${permission.description}</p>
      <div class="action-checkboxes">
        <label repeat.for="action of permission.actions" class="action-label">
          <input type="checkbox" 
                 model.bind="action"
                 checked.bind="selectedPermissions[permission.resource]" />
          ${action | capitalize}
        </label>
      </div>
    </div>
  </div>

  <div if.bind="permissionSummary.length > 0" class="permission-summary">
    <h4>Selected Permissions</h4>
    <ul>
      <li repeat.for="perm of permissionSummary">
        <strong>${perm.resource}</strong>: ${perm.actions.join(', ')}
      </li>
    </ul>
  </div>
</form>
```

### Performance Considerations

**Choose the right collection type for your use case:**

- **Arrays**: General purpose, good for small to medium collections
- **Sets**: High-performance for frequent additions/removals, O(1) lookups
- **Record/Map of Sets**: Model resource → actions (or similar hierarchies) cleanly
- **Custom Matchers**: When object identity comparison isn't sufficient

**Performance Tips:**
- Use Set for large collections with frequent changes
- Implement efficient matcher functions for object comparison
- Avoid creating new objects in templates—use computed properties
- Consider virtualization for very large checkbox lists

---

## Event Handling and Binding Behaviors

Aurelia provides sophisticated event handling and binding behaviors that give you precise control over when and how form data synchronizes. These features are crucial for building responsive, performant forms.

### Advanced Event Timing with updateTrigger

By default, Aurelia uses appropriate events for each input type, but you can customize this behavior:

```typescript
export class AdvancedForm {
  searchQuery = '';
  username = '';
  description = '';

  // Debounced search handler
  performSearch = debounce((query: string) => {
    console.log('Searching for:', query);
    // Perform API call
  }, 300);

  searchQueryChanged(newValue: string) {
    this.performSearch(newValue);
  }
}
```

```html
<form>
  <!-- Update on every keystroke (input event) -->
  <input type="text" 
         value.bind="searchQuery & updateTrigger:'input'" 
         placeholder="Real-time search..." />

  <!-- Update on focus loss (blur event) -->
  <input type="text" 
         value.bind="username & updateTrigger:'blur'" 
         placeholder="Username (validates on blur)" />

  <!-- Multiple events -->
  <textarea value.bind="description & updateTrigger:['input', 'blur']"
            placeholder="Auto-save draft on input and blur"></textarea>

  <!-- Custom events -->
  <input type="text" 
         value.bind="customValue & updateTrigger:'keydown':'focus'"
         placeholder="Updates on keydown and focus" />
</form>
```

### Rate Limiting with Debounce and Throttle

Control the frequency of updates to improve performance and user experience:

```typescript
export class SearchForm {
  searchTerm = '';
  scrollPosition = 0;
  apiCallCount = 0;

  // This will be called max once per 300ms
  searchTermChanged(newTerm: string) {
    this.apiCallCount++;
    console.log(`API Call #${this.apiCallCount}: Searching for "${newTerm}"`);
  }

  // Throttled scroll tracking
  onScroll(position: number) {
    console.log('Scroll position:', position);
  }
}
```

```html
<form>
  <!-- Debounce: Wait for pause in typing -->
  <input type="search" 
         value.bind="searchTerm & debounce:300"
         placeholder="Search with 300ms debounce..." />

  <!-- Throttle: Maximum rate limiting -->
  <input type="range" 
         min="0" max="100" 
         value.bind="scrollPosition & throttle:100"
         input.trigger="onScroll(scrollPosition)" />

  <!-- Signal-based cache invalidation -->
  <input type="text" 
         value.bind="searchTerm & debounce:300:'searchSignal'"
         placeholder="Cache-aware search" />
</form>
```

### Signal-Based Reactive Updates

Signals provide cache invalidation and coordinated updates across components:

```typescript
import { resolve } from '@aurelia/kernel';
import { observable, computed } from '@aurelia/runtime';
import { ISignaler } from '@aurelia/runtime-html';

export class SignalDrivenForm {
  @observable searchCriteria = {
    term: '',
    category: 'all',
    priceRange: [0, 1000]
  };

  // Signal dispatcher
  private signaler = resolve(ISignaler);

  updateSearch(criteria: Partial<typeof this.searchCriteria>) {
    Object.assign(this.searchCriteria, criteria);
    // Notify all signal listeners
    this.signaler.dispatchSignal('searchUpdated');
  }

  // Expensive computed property with signal-based cache
  @computed('searchCriteria', 'searchUpdated')
  get searchResults() {
    // This will only recompute when 'searchUpdated' signal is dispatched
    return this.performExpensiveSearch(this.searchCriteria);
  }

  private performExpensiveSearch(criteria: any) {
    console.log('Performing expensive search operation...');
    // Simulate expensive computation
    return [];
  }
}
```

```html
<form>
  <!-- Signal-coordinated form fields -->
  <input type="search" 
         value.bind="searchCriteria.term & debounce:300:'searchUpdated'" />

  <select value.bind="searchCriteria.category & signal:'searchUpdated'">
    <option value="all">All Categories</option>
    <option value="electronics">Electronics</option>
    <option value="books">Books</option>
  </select>

  <input type="range" 
         min="0" max="1000"
         value.bind="searchCriteria.priceRange[1] & throttle:200:'searchUpdated'" />

  <!-- Results update automatically via signal -->
  <div class="results">
    <p>Found ${searchResults.length} results</p>
    <!-- Results rendered here -->
  </div>
</form>
```

---

## Dynamic Forms and Performance

Building performant, dynamic forms requires understanding Aurelia's observation system and applying optimization strategies for complex scenarios.

### Dynamic Field Generation

Create forms that adapt their structure based on configuration:

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

interface FieldConfig {
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  name: string;
  label: string;
  required?: boolean;
  options?: Array<{ value: any; label: string }>;
  validation?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export class DynamicFormGenerator {
  formConfig: FieldConfig[] = [];
  formData: Record<string, any> = {};
  formSchema: string = '';

  private readonly validationRules = resolve(IValidationRules);
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  // Load form configuration from various sources
  async loadFormConfiguration(schemaId: string) {
    try {
      const response = await fetch(`/api/forms/schema/${schemaId}`);
      this.formConfig = await response.json();
      this.initializeFormData();
    } catch (error) {
      console.error('Failed to load form schema:', error);
    }
  }

  private initializeFormData() {
    this.formData = {};
    this.formConfig.forEach(field => {
      switch (field.type) {
        case 'checkbox':
          this.formData[field.name] = false;
          break;
        case 'number':
          this.formData[field.name] = field.min || 0;
          break;
        default:
          this.formData[field.name] = '';
      }
    });
  }

  // Dynamic validation rule setup
  setupDynamicValidation() {
    
    this.formConfig.forEach(fieldConfig => {
      let rule = this.validationRules.on(this.formData).ensure(fieldConfig.name);
      
      if (fieldConfig.required) {
        rule = rule.required().withMessage(`${fieldConfig.label} is required`);
      }
      
      if (fieldConfig.validation) {
        fieldConfig.validation.forEach(validationType => {
          switch (validationType) {
            case 'email':
              rule = rule.email().withMessage('Please enter a valid email address');
              break;
            case 'min-length-5':
              rule = rule.minLength(5).withMessage(`${fieldConfig.label} must be at least 5 characters`);
              break;
            // Add more validation types as needed
          }
        });
      }
      
      if (fieldConfig.type === 'number') {
        if (fieldConfig.min !== undefined) {
          rule = rule.min(fieldConfig.min);
        }
        if (fieldConfig.max !== undefined) {
          rule = rule.max(fieldConfig.max);
        }
      }
    });
  }

  addField(fieldConfig: FieldConfig) {
    this.formConfig.push(fieldConfig);
    // Initialize form data for new field
    this.formData[fieldConfig.name] = fieldConfig.type === 'checkbox' ? false : '';
    this.setupDynamicValidation();
  }

  removeField(fieldName: string) {
    this.formConfig = this.formConfig.filter(field => field.name !== fieldName);
    delete this.formData[fieldName];
  }

  async submitDynamicForm() {
    const validationResult = await this.validationController.validate();
    
    if (validationResult.valid) {
      const payload = {
        schemaId: this.formSchema,
        data: this.formData,
        timestamp: new Date().toISOString()
      };
      
      try {
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          console.log('Form submitted successfully');
        }
      } catch (error) {
        console.error('Form submission failed:', error);
      }
    }
  }
}
```

```html
<form submit.trigger="submitDynamicForm()" class="dynamic-form">
  <h2>Dynamic Form Generator</h2>
  
  <div class="form-controls">
    <label for="schema-select">Form Schema:</label>
    <select id="schema-select" 
            value.bind="formSchema" 
            change.trigger="loadFormConfiguration(formSchema)">
      <option value="">Select a form schema...</option>
      <option value="contact">Contact Form</option>
      <option value="survey">Survey Form</option>
      <option value="registration">Registration Form</option>
    </select>
  </div>

  <div if.bind="formConfig.length > 0" class="dynamic-fields">
    <div repeat.for="field of formConfig" class="form-group">
      
      <!-- Text Input -->
      <div if.bind="field.type === 'text'" class="field-container">
        <label for.bind="field.name">${field.label}</label>
        <input type="text"
               id.bind="field.name"
               value.bind="formData[field.name] & validate"
               placeholder.bind="field.placeholder"
               class="form-control" />
      </div>

      <!-- Number Input -->
      <div if.bind="field.type === 'number'" class="field-container">
        <label for.bind="field.name">${field.label}</label>
        <input type="number"
               id.bind="field.name"
               value.bind="formData[field.name] & validate"
               min.bind="field.min"
               max.bind="field.max"
               class="form-control" />
      </div>

      <!-- Select Dropdown -->
      <div if.bind="field.type === 'select'" class="field-container">
        <label for.bind="field.name">${field.label}</label>
        <select id.bind="field.name"
                value.bind="formData[field.name] & validate"
                class="form-control">
          <option value="">Choose...</option>
          <option repeat.for="option of field.options" 
                  model.bind="option.value">
            ${option.label}
          </option>
        </select>
      </div>

      <!-- Checkbox -->
      <div if.bind="field.type === 'checkbox'" class="field-container">
        <label class="checkbox-label">
          <input type="checkbox"
                 checked.bind="formData[field.name] & validate" />
          ${field.label}
        </label>
      </div>

      <!-- Textarea -->
      <div if.bind="field.type === 'textarea'" class="field-container">
        <label for.bind="field.name">${field.label}</label>
        <textarea id.bind="field.name"
                  value.bind="formData[field.name] & validate"
                  placeholder.bind="field.placeholder"
                  rows="4"
                  class="form-control"></textarea>
      </div>

      <!-- Field Management (Development Mode) -->
      <div class="field-actions" if.bind="developmentMode">
        <button type="button" 
                click.trigger="removeField(field.name)"
                class="btn btn-sm btn-danger">
          Remove Field
        </button>
      </div>
    </div>
  </div>

  <div class="form-actions" if.bind="formConfig.length > 0">
    <button type="submit" class="btn btn-primary">Submit Form</button>
    <button type="button" 
            click.trigger="formData = {}"
            class="btn btn-secondary">Clear Form</button>
  </div>

  <!-- Debug Information -->
  <div class="debug-panel" if.bind="debugMode">
    <h4>Form Data Debug</h4>
    <pre>${formData | json}</pre>
    
    <h4>Form Configuration Debug</h4>
    <pre>${formConfig | json}</pre>
  </div>
</form>
```

### Performance Optimization Strategies

Implement performance optimizations for large, complex forms:

```typescript
export class PerformantFormComponent {
  // Virtual scrolling for large option lists
  largeDataSet: any[] = [];
  virtualScrollOptions = {
    itemHeight: 40,
    containerHeight: 300,
    buffer: 10
  };

  // Lazy loading of form sections
  private loadedSections: Set<string> = new Set();
  
  // Debounced validation for expensive operations
  private debouncedValidations = new Map<string, Function>();

  // Efficient collection operations
  selectedItems: Set<any> = new Set();
  
  // Memoized computed properties
  @computed('formData.firstName', 'formData.lastName', 'formData.email')
  get computedSummary() {
    // Expensive computation that only runs when dependencies change
    return this.generateFormSummary();
  }

  // Optimize large collection updates
  updateLargeCollection(newItems: any[]) {
    // Use Set for O(1) lookups instead of Array.includes()
    const newItemsSet = new Set(newItems.map(item => item.id));
    
    // Batch updates to minimize observer notifications
    this.startBatch();
    
    this.largeDataSet = this.largeDataSet.filter(item => {
      if (newItemsSet.has(item.id)) {
        // Update existing item efficiently
        Object.assign(item, newItems.find(newItem => newItem.id === item.id));
        return true;
      }
      return false;
    });
    
    // Add new items
    newItems.forEach(item => {
      if (!this.largeDataSet.find(existing => existing.id === item.id)) {
        this.largeDataSet.push(item);
      }
    });
    
    this.endBatch();
  }

  // Efficient form section loading
  async loadFormSection(sectionName: string) {
    if (this.loadedSections.has(sectionName)) {
      return; // Already loaded
    }

    try {
      const sectionData = await fetch(`/api/forms/sections/${sectionName}`);
      const section = await sectionData.json();
      
      // Load section-specific validation rules
      this.loadSectionValidation(section);
      
      this.loadedSections.add(sectionName);
    } catch (error) {
      console.error(`Failed to load section ${sectionName}:`, error);
    }
  }

  // Memory-efficient validation
  createEfficientValidator(fieldName: string, validatorFn: Function, delay: number = 300) {
    if (this.debouncedValidations.has(fieldName)) {
      // Cleanup existing validator
      const existingValidator = this.debouncedValidations.get(fieldName);
      existingValidator.cancel?.();
    }

    const debouncedValidator = debounce(validatorFn, delay);
    this.debouncedValidations.set(fieldName, debouncedValidator);
    return debouncedValidator;
  }

  // Cleanup on disposal
  dispose() {
    // Cancel all pending validations
    this.debouncedValidations.forEach(validator => {
      validator.cancel?.();
    });
    this.debouncedValidations.clear();
  }

  private startBatch() {
    // Implementation depends on your observer system
    // This is a conceptual example
  }

  private endBatch() {
    // Implementation depends on your observer system
    // This is a conceptual example
  }

  private generateFormSummary() {
    // Expensive computation
    return {
      completionPercentage: this.calculateCompletionPercentage(),
      validationStatus: this.getOverallValidationStatus(),
      estimatedTimeToComplete: this.estimateTimeToComplete()
    };
  }

  private calculateCompletionPercentage(): number {
    // Calculate based on filled vs empty fields
    return 85; // Example value
  }

  private getOverallValidationStatus(): string {
    // Aggregate validation status
    return 'partial'; // Example value
  }

  private estimateTimeToComplete(): number {
    // Estimate in minutes
    return 5; // Example value
  }

  private loadSectionValidation(section: any) {
    // Load validation rules specific to the section
  }
}
```

---

## Radio Button and Select Element Patterns

Aurelia provides comprehensive support for single-selection controls with sophisticated object binding and custom matching logic.

### Advanced Radio Button Groups

Radio buttons with complex object handling and conditional logic:

```typescript
interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit' | 'paypal' | 'crypto';
  name: string;
  fee: number;
  processingTime: string;
  requiresVerification: boolean;
}

export class PaymentSelectionForm {
  paymentMethods: PaymentMethod[] = [
    {
      id: 'cc-visa',
      type: 'credit',
      name: 'Visa Credit Card',
      fee: 0,
      processingTime: 'Instant',
      requiresVerification: false
    },
    {
      id: 'pp-account',
      type: 'paypal',
      name: 'PayPal Account',
      fee: 2.50,
      processingTime: '1-2 business days',
      requiresVerification: true
    },
    {
      id: 'btc-wallet',
      type: 'crypto',
      name: 'Bitcoin Wallet',
      fee: 0.0001,
      processingTime: '10-60 minutes',
      requiresVerification: true
    }
  ];

  selectedPaymentMethod: PaymentMethod | null = null;
  
  // Custom matcher for complex object comparison
  paymentMethodMatcher = (a: PaymentMethod, b: PaymentMethod) => {
    return a?.id === b?.id;
  };

  // Computed properties based on selection
  get totalFee(): number {
    return this.selectedPaymentMethod?.fee || 0;
  }

  get requiresUserVerification(): boolean {
    return this.selectedPaymentMethod?.requiresVerification || false;
  }

  get processingDetails(): string {
    if (!this.selectedPaymentMethod) return '';
    
    return `Processing time: ${this.selectedPaymentMethod.processingTime}
            ${this.totalFee > 0 ? `| Fee: $${this.totalFee.toFixed(2)}` : '| No additional fees'}`;
  }

  // Conditional validation based on selection
  validatePaymentSelection(): boolean {
    if (!this.selectedPaymentMethod) return false;
    
    if (this.requiresUserVerification && !this.isUserVerified()) {
      console.warn('User verification required for selected payment method');
      return false;
    }
    
    return true;
  }

  private isUserVerified(): boolean {
    // Check user verification status
    return false; // Placeholder
  }
}
```

```html
<form class="payment-selection-form">
  <h3>Select Payment Method</h3>
  
  <div class="payment-options">
    <div repeat.for="method of paymentMethods" class="payment-option">
      <label class="payment-card" 
             class.bind="{ 'selected': selectedPaymentMethod?.id === method.id }">
        <input type="radio"
               name="paymentMethod"
               model.bind="method"
               checked.bind="selectedPaymentMethod"
               matcher.bind="paymentMethodMatcher"
               class="payment-radio" />
        
        <div class="payment-info">
          <div class="payment-header">
            <span class="payment-name">${method.name}</span>
            <span class="payment-type badge" 
                  class.bind="method.type">${method.type}</span>
          </div>
          
          <div class="payment-details">
            <div class="processing-time">
              <i class="icon-clock"></i>
              ${method.processingTime}
            </div>
            <div class="fee-info">
              <i class="icon-dollar"></i>
              ${method.fee === 0 ? 'No fees' : '$' + method.fee.toFixed(2)}
            </div>
            <div if.bind="method.requiresVerification" class="verification-required">
              <i class="icon-shield"></i>
              Verification required
            </div>
          </div>
        </div>
      </label>
    </div>
  </div>

  <!-- Selection Summary -->
  <div if.bind="selectedPaymentMethod" class="selection-summary">
    <h4>Payment Summary</h4>
    <div class="summary-details">
      <div class="summary-row">
        <span>Method:</span>
        <span>${selectedPaymentMethod.name}</span>
      </div>
      <div class="summary-row">
        <span>Processing:</span>
        <span>${selectedPaymentMethod.processingTime}</span>
      </div>
      <div class="summary-row">
        <span>Fee:</span>
        <span>${totalFee === 0 ? 'Free' : '$' + totalFee.toFixed(2)}</span>
      </div>
      <div if.bind="requiresUserVerification" class="verification-notice">
        <i class="icon-warning"></i>
        This payment method requires account verification
      </div>
    </div>
  </div>
</form>
```

### Advanced Select Elements with Smart Filtering

Sophisticated select components with search, grouping, and virtual scrolling:

```typescript
interface SelectOption {
  value: any;
  label: string;
  group?: string;
  disabled?: boolean;
  metadata?: any;
}

export class AdvancedSelectComponent {
  countries: SelectOption[] = [];
  filteredCountries: SelectOption[] = [];
  selectedCountry: SelectOption | null = null;
  searchTerm = '';
  isLoading = false;
  showDropdown = false;
  
  // Grouping and filtering
  groupBy = 'region';
  sortBy = 'name';
  
  async loadCountries() {
    this.isLoading = true;
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      
      this.countries = data.map(country => ({
        value: country.code,
        label: country.name,
        group: country.region,
        metadata: {
          population: country.population,
          currency: country.currency,
          flag: country.flag
        }
      }));
      
      this.applyFiltering();
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      this.isLoading = false;
    }
  }

  searchTermChanged() {
    this.applyFiltering();
  }

  applyFiltering() {
    let filtered = this.countries;

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(country => 
        country.label.toLowerCase().includes(term) ||
        country.group?.toLowerCase().includes(term)
      );
    }

    // Apply grouping and sorting
    if (this.groupBy) {
      filtered = this.sortByGroup(filtered, this.groupBy);
    }

    this.filteredCountries = filtered;
  }

  private sortByGroup(options: SelectOption[], groupField: string): SelectOption[] {
    const groups = new Map<string, SelectOption[]>();
    
    // Group options
    options.forEach(option => {
      const groupKey = option.group || 'Other';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(option);
    });

    // Sort within groups and flatten
    const sortedOptions: SelectOption[] = [];
    Array.from(groups.keys()).sort().forEach(groupKey => {
      const groupOptions = groups.get(groupKey)!
        .sort((a, b) => a.label.localeCompare(b.label));
      sortedOptions.push(...groupOptions);
    });

    return sortedOptions;
  }

  selectOption(option: SelectOption) {
    if (option.disabled) return;
    
    this.selectedCountry = option;
    this.showDropdown = false;
    this.searchTerm = '';
  }

  // Custom matcher for complex object comparison
  countryMatcher = (a: SelectOption, b: SelectOption) => {
    return a?.value === b?.value;
  };

  // Virtual scrolling configuration for large lists
  virtualScrollConfig = {
    itemHeight: 48,
    containerHeight: 300,
    overscan: 10
  };
}
```

```html
<div class="advanced-select-container">
  <label for="country-select">Select Country</label>
  
  <!-- Custom Select with Search -->
  <div class="custom-select" class.bind="{ 'open': showDropdown }">
    <div class="select-trigger" 
         click.trigger="showDropdown = !showDropdown">
      <span class="selected-value">
        ${selectedCountry ? selectedCountry.label : 'Choose a country...'}
      </span>
      <i class="dropdown-arrow" 
         class.bind="{ 'rotated': showDropdown }"></i>
    </div>

    <div class="select-dropdown" if.bind="showDropdown">
      <!-- Search Input -->
      <div class="search-container">
        <input type="text"
               value.bind="searchTerm & debounce:200"
               placeholder="Search countries..."
               class="search-input"
               focus.bind="showDropdown" />
        <i class="search-icon"></i>
      </div>

      <!-- Loading State -->
      <div if.bind="isLoading" class="loading-state">
        <i class="spinner"></i>
        Loading countries...
      </div>

      <!-- Options List with Virtual Scrolling -->
      <div class="options-container" if.bind="!isLoading">
        <virtual-repeat.for="option of filteredCountries"
                          virtual-repeat-strategy="virtual-repeat-strategy-array">
          <div class="select-option"
               class.bind="{ 
                 'disabled': option.disabled,
                 'selected': selectedCountry?.value === option.value 
               }"
               click.trigger="selectOption(option)">
            
            <!-- Group Header -->
            <div if.bind="$index === 0 || filteredCountries[$index-1].group !== option.group" 
                 class="group-header">
              ${option.group || 'Other'}
            </div>

            <!-- Option Content -->
            <div class="option-content">
              <div class="option-main">
                <span if.bind="option.metadata?.flag" 
                      class="flag">${option.metadata.flag}</span>
                <span class="option-label">${option.label}</span>
              </div>
              <div class="option-details" if.bind="option.metadata">
                <small class="population">
                  Pop: ${option.metadata.population | number:'0,000'}
                </small>
                <small class="currency">
                  ${option.metadata.currency}
                </small>
              </div>
            </div>
          </div>
        </virtual-repeat>
      </div>

      <!-- No Results State -->
      <div if.bind="!isLoading && filteredCountries.length === 0" 
           class="no-results">
        No countries found matching "${searchTerm}"
      </div>
    </div>
  </div>

  <!-- Traditional Select (Fallback) -->
  <select if.bind="!useAdvancedSelect" 
          value.bind="selectedCountry"
          matcher.bind="countryMatcher"
          class="traditional-select">
    <option value="">Choose a country...</option>
    <optgroup repeat.for="group of groupedCountries" 
              label.bind="group.name">
      <option repeat.for="country of group.options" 
              model.bind="country"
              disabled.bind="country.disabled">
        ${country.label}
      </option>
    </optgroup>
  </select>
</div>
```

---

## Form Submission Patterns

Modern web applications require sophisticated form submission strategies that handle success, failure, loading states, and complex business logic. Aurelia provides flexible patterns for all scenarios.

### Basic Form Submission with State Management

Implement comprehensive submission state management for better user experience:

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

interface SubmissionState {
  isSubmitting: boolean;
  success: boolean;
  error: string | null;
  attempts: number;
  lastSubmission: Date | null;
}

export class ComprehensiveFormSubmission {
  formData = {
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  };

  submissionState: SubmissionState = {
    isSubmitting: false,
    success: false,
    error: null,
    attempts: 0,
    lastSubmission: null
  };

  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  // Rate limiting
  private readonly maxAttempts = 3;
  private readonly submissionCooldown = 30000; // 30 seconds

  get canSubmit(): boolean {
    return !this.submissionState.isSubmitting 
           && this.submissionState.attempts < this.maxAttempts
           && this.isWithinCooldown();
  }

  get submissionMessage(): string {
    if (this.submissionState.isSubmitting) {
      return 'Submitting your form...';
    }
    if (this.submissionState.success) {
      return 'Form submitted successfully!';
    }
    if (this.submissionState.error) {
      return `Submission failed: ${this.submissionState.error}`;
    }
    if (this.submissionState.attempts >= this.maxAttempts) {
      return `Maximum attempts reached. Please try again later.`;
    }
    return '';
  }

  async handleSubmit(event: Event) {
    event.preventDefault();

    if (!this.canSubmit) {
      return false; // Prevent form submission
    }

    // Reset previous state
    this.submissionState.error = null;
    this.submissionState.success = false;
    this.submissionState.isSubmitting = true;

    try {
      // Validate form before submission
      const validationResult = await this.validationController.validate();
      
      if (!validationResult.valid) {
        throw new Error('Please fix validation errors before submitting');
      }

      // Submit form data
      const response = await this.submitFormData(this.formData);
      
      // Handle success
      this.submissionState.success = true;
      this.submissionState.lastSubmission = new Date();
      
      // Optional: Redirect or show success message
      setTimeout(() => {
        this.resetForm();
      }, 2000);

    } catch (error) {
      // Handle submission error
      this.submissionState.error = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      this.submissionState.attempts++;

      // Optional: Log error for debugging
      console.error('Form submission failed:', error);

    } finally {
      this.submissionState.isSubmitting = false;
    }

    return false; // Prevent default browser submission
  }

  private async submitFormData(data: any): Promise<any> {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  private isWithinCooldown(): boolean {
    if (!this.submissionState.lastSubmission) return true;
    
    const timeSinceLastSubmission = Date.now() - this.submissionState.lastSubmission.getTime();
    return timeSinceLastSubmission > this.submissionCooldown;
  }

  resetForm() {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      message: ''
    };
    
    this.submissionState = {
      isSubmitting: false,
      success: false,
      error: null,
      attempts: 0,
      lastSubmission: null
    };

    // Clear validation errors
    this.validationController.reset();
  }

  retrySubmission() {
    if (this.submissionState.attempts < this.maxAttempts) {
      this.submissionState.error = null;
      // Allow retry by not resetting attempts - they'll try again
    }
  }
}
```

```html
<form submit.trigger="handleSubmit($event)" class="comprehensive-form">
  <h2>Contact Us</h2>
  
  <!-- Form Fields -->
  <div class="form-row">
    <div class="form-group col-md-6">
      <label for="firstName">First Name</label>
      <input id="firstName" 
             type="text"
             value.bind="formData.firstName & validate"
             disabled.bind="submissionState.isSubmitting"
             class="form-control" />
    </div>
    <div class="form-group col-md-6">
      <label for="lastName">Last Name</label>
      <input id="lastName" 
             type="text"
             value.bind="formData.lastName & validate"
             disabled.bind="submissionState.isSubmitting"
             class="form-control" />
    </div>
  </div>

  <div class="form-group">
    <label for="email">Email Address</label>
    <input id="email" 
           type="email"
           value.bind="formData.email & validate"
           disabled.bind="submissionState.isSubmitting"
           class="form-control" />
  </div>

  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" 
              rows="5"
              value.bind="formData.message & validate"
              disabled.bind="submissionState.isSubmitting"
              class="form-control"></textarea>
  </div>

  <!-- Submission State Display -->
  <div class="submission-status">
    <div if.bind="submissionState.isSubmitting" class="alert alert-info">
      <div class="loading-spinner"></div>
      ${submissionMessage}
    </div>

    <div if.bind="submissionState.success" class="alert alert-success">
      <i class="icon-check"></i>
      ${submissionMessage}
    </div>

    <div if.bind="submissionState.error" class="alert alert-danger">
      <i class="icon-warning"></i>
      ${submissionMessage}
      <div class="retry-section">
        <button type="button" 
                click.trigger="retrySubmission()"
                class="btn btn-sm btn-outline-danger"
                if.bind="submissionState.attempts < maxAttempts">
          Try Again (${maxAttempts - submissionState.attempts} attempts remaining)
        </button>
      </div>
    </div>

    <div if.bind="submissionState.attempts >= maxAttempts" class="alert alert-warning">
      <i class="icon-clock"></i>
      Too many attempts. Please try again in 
      ${Math.ceil((submissionCooldown - (Date.now() - submissionState.lastSubmission?.getTime())) / 1000)} seconds.
    </div>
  </div>

  <!-- Form Actions -->
  <div class="form-actions">
    <button type="submit" 
            disabled.bind="!canSubmit"
            class="btn btn-primary"
            class.bind="{ 'btn-loading': submissionState.isSubmitting }">
      <span if.bind="submissionState.isSubmitting">Submitting...</span>
      <span if.bind="!submissionState.isSubmitting">Send Message</span>
    </button>
    
    <button type="button" 
            click.trigger="resetForm()"
            disabled.bind="submissionState.isSubmitting"
            class="btn btn-secondary">
      Reset Form
    </button>
  </div>

  <!-- Submission History (Development) -->
  <div if.bind="showDebugInfo" class="debug-section">
    <h4>Submission Debug Info</h4>
    <ul>
      <li>Attempts: ${submissionState.attempts}/${maxAttempts}</li>
      <li>Last Submission: ${submissionState.lastSubmission?.toLocaleString() || 'Never'}</li>
      <li>Can Submit: ${canSubmit ? 'Yes' : 'No'}</li>
      <li>Is Submitting: ${submissionState.isSubmitting ? 'Yes' : 'No'}</li>
    </ul>
  </div>
</form>
```

### Multi-Step Form Submission

Handle complex multi-step forms with progress tracking and validation:

```typescript
interface FormStep {
  id: string;
  title: string;
  component: string;
  isValid: boolean;
  isComplete: boolean;
  data: any;
}

export class MultiStepFormSubmission {
  currentStepIndex = 0;
  isSubmitting = false;
  submissionProgress = 0;

  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  steps: FormStep[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      component: 'personal-info-step',
      isValid: false,
      isComplete: false,
      data: {}
    },
    {
      id: 'account',
      title: 'Account Details',
      component: 'account-details-step',
      isValid: false,
      isComplete: false,
      data: {}
    },
    {
      id: 'preferences',
      title: 'Preferences',
      component: 'preferences-step',
      isValid: false,
      isComplete: false,
      data: {}
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      component: 'confirmation-step',
      isValid: true,
      isComplete: false,
      data: {}
    }
  ];

  get currentStep(): FormStep {
    return this.steps[this.currentStepIndex];
  }

  get isFirstStep(): boolean {
    return this.currentStepIndex === 0;
  }

  get isLastStep(): boolean {
    return this.currentStepIndex === this.steps.length - 1;
  }

  get canProceed(): boolean {
    return this.currentStep.isValid && !this.isSubmitting;
  }

  get canGoBack(): boolean {
    return !this.isFirstStep && !this.isSubmitting;
  }

  get overallProgress(): number {
    const completedSteps = this.steps.filter(step => step.isComplete).length;
    return (completedSteps / this.steps.length) * 100;
  }

  async nextStep() {
    if (!this.canProceed) return;

    // Validate current step
    const isValid = await this.validateCurrentStep();
    if (!isValid) return;

    // Mark current step as complete
    this.currentStep.isComplete = true;

    if (this.isLastStep) {
      // Submit the form
      await this.submitCompleteForm();
    } else {
      // Move to next step
      this.currentStepIndex++;
    }
  }

  previousStep() {
    if (this.canGoBack) {
      this.currentStepIndex--;
    }
  }

  goToStep(stepIndex: number) {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      // Only allow going to completed steps or next step
      const targetStep = this.steps[stepIndex];
      const canNavigateToStep = targetStep.isComplete || 
                               stepIndex === this.currentStepIndex + 1;
      
      if (canNavigateToStep) {
        this.currentStepIndex = stepIndex;
      }
    }
  }

  private async validateCurrentStep(): Promise<boolean> {
    const result = await this.validationController.validate();
    
    this.currentStep.isValid = result.valid;
    return result.valid;
  }

  private async submitCompleteForm() {
    this.isSubmitting = true;
    this.submissionProgress = 0;

    try {
      // Collect all form data
      const formData = this.steps.reduce((acc, step) => {
        return { ...acc, [step.id]: step.data };
      }, {});

      // Submit with progress tracking
      await this.submitWithProgress(formData);

      // Mark final step as complete
      this.currentStep.isComplete = true;
      this.submissionProgress = 100;

      // Show success message
      console.log('Multi-step form submitted successfully!');

    } catch (error) {
      console.error('Form submission failed:', error);
      // Handle error appropriately
    } finally {
      this.isSubmitting = false;
    }
  }

  private async submitWithProgress(data: any): Promise<void> {
    // Simulate progress updates
    const progressSteps = [
      { message: 'Validating data...', progress: 20 },
      { message: 'Processing payment...', progress: 50 },
      { message: 'Creating account...', progress: 75 },
      { message: 'Sending confirmation...', progress: 90 },
      { message: 'Complete!', progress: 100 }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      this.submissionProgress = step.progress;
      console.log(step.message);
    }

    // Actual submission would happen here
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.statusText}`);
    }
  }

  updateStepData(data: any) {
    Object.assign(this.currentStep.data, data);
  }

  resetForm() {
    this.currentStepIndex = 0;
    this.isSubmitting = false;
    this.submissionProgress = 0;
    
    this.steps.forEach(step => {
      step.isValid = step.id === 'confirmation'; // Only confirmation step is valid by default
      step.isComplete = false;
      step.data = {};
    });
  }
}
```

```html
<div class="multi-step-form-container">
  <div class="form-header">
    <h2>Account Registration</h2>
    
    <!-- Progress Indicator -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" 
             style="width: ${overallProgress}%"></div>
      </div>
      <div class="progress-text">${overallProgress.toFixed(0)}% Complete</div>
    </div>

    <!-- Step Navigation -->
    <nav class="step-navigation">
      <div repeat.for="step of steps" 
           class="step-indicator"
           class.bind="{
             'active': $index === currentStepIndex,
             'completed': step.isComplete,
             'valid': step.isValid
           }"
           click.trigger="goToStep($index)">
        <div class="step-number">${$index + 1}</div>
        <div class="step-title">${step.title}</div>
      </div>
    </nav>
  </div>

  <!-- Dynamic Step Content -->
  <div class="step-content">
    <au-compose 
      component.bind="currentStep.component"
      model.bind="{ 
        data: currentStep.data,
        updateData: updateStepData,
        isValid: currentStep.isValid
      }">
    </au-compose>
  </div>

  <!-- Submission Progress -->
  <div if.bind="isSubmitting" class="submission-progress">
    <h4>Processing Your Registration</h4>
    <div class="progress-bar">
      <div class="progress-fill" 
           style="width: ${submissionProgress}%"></div>
    </div>
    <div class="progress-text">${submissionProgress}% Complete</div>
  </div>

  <!-- Navigation Controls -->
  <div class="form-navigation" if.bind="!isSubmitting">
    <button type="button" 
            click.trigger="previousStep()"
            disabled.bind="!canGoBack"
            class="btn btn-secondary">
      ← Previous
    </button>

    <button type="button" 
            click.trigger="nextStep()"
            disabled.bind="!canProceed"
            class="btn btn-primary">
      <span if.bind="!isLastStep">Next →</span>
      <span if.bind="isLastStep">Submit Registration</span>
    </button>
  </div>

  <!-- Form Actions -->
  <div class="form-actions">
    <button type="button" 
            click.trigger="resetForm()"
            disabled.bind="isSubmitting"
            class="btn btn-outline-secondary">
      Start Over
    </button>
  </div>
</div>
```

---

## File Inputs and Upload Handling

Working with file uploads in Aurelia typically involves using the standard `<input type="file">` element and handling file data in your view model. While Aurelia doesn’t provide special bindings for file inputs, you can easily wire up event handlers or use standard properties to capture and upload files.

### Capturing File Data

In most cases, you’ll want to listen for the `change` event on a file input:

{% code title="file-upload-component.html" %}
```html
<form>
  <label for="fileUpload">Select files to upload:</label>
  <input
    id="fileUpload"
    type="file"
    multiple
    accept="image/*"
    change.trigger="handleFileSelect($event)"
  />

  <button click.trigger="uploadFiles()" disabled.bind="!selectedFiles.length">
    Upload
  </button>
</form>
```
{% endcode %}

- `multiple`: Allows selecting more than one file.
- `accept="image/*"`: Restricts file selection to images (this can be changed to fit your needs).
- `change.trigger="handleFileSelect($event)"`: Calls a method in your view model to handle the file selection event.

### View Model Handling

You can retrieve the selected files from the event object in your view model:

{% code title="file-upload-component.ts" %}
```typescript
export class FileUploadComponent {
  public selectedFiles: File[] = [];

  public handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    // Convert the FileList to a real array
    this.selectedFiles = Array.from(input.files);
  }

  public async uploadFiles() {
    if (this.selectedFiles.length === 0) {
      return;
    }

    const formData = new FormData();
    for (const file of this.selectedFiles) {
      // The first argument (key) matches the field name expected by your backend
      formData.append('files', file, file.name);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      // Optionally, reset selected files
      this.selectedFiles = [];
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }
}
```
{% endcode %}

**Key Points:**

- Reading File Data: `input.files` returns a `FileList`; converting it to an array (`Array.from`) makes it easier to iterate over.
- FormData: Using `FormData` to append files is a convenient way to send them to the server (via Fetch).
- Error Handling: Always check `response.ok` to handle server or network errors.
- Disabling the Button: In the HTML, `disabled.bind="!selectedFiles.length"` keeps the button disabled until at least one file is selected.

### Single File Inputs

If you only need a single file, omit multiple and simplify your logic:

```html
<input type="file" accept="image/*" change.trigger="handleFileSelect($event)" />
```

```typescript
public handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  this.selectedFiles = input.files?.length ? [input.files[0]] : [];
}
```

### Validation and Security

When handling file uploads, consider adding validation and security measures:

- Server-side Validation: Even if you filter files by type on the client (accept="image/*"), always verify on the server to ensure the files are valid and safe.
- File Size Limits: Check file sizes either on the client or server (or both) to prevent excessively large uploads.
- Progress Indicators: For a better user experience, consider using XMLHttpRequest or the Fetch API with progress events (via third-party solutions or polyfills), so you can display an upload progress bar.

---

## Validation Integration

Aurelia's validation system integrates seamlessly with forms through the `& validate` binding behavior and specialized validation components. This section covers practical validation patterns for production applications.

### Basic Validation with & validate

The `& validate` binding behavior automatically integrates form inputs with Aurelia's validation system. 

{% hint style="info" %}
**Validation Controller Scope**: Use `newInstanceForScope(IValidationController)` to create a validation controller scoped to your component. This ensures each component gets its own isolated validation controller, preventing conflicts between different forms or components.
{% endhint %}

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class UserRegistrationForm {
  user = {
    email: '',
    password: '',
    confirmPassword: '',
    age: null as number | null,
    terms: false
  };

  private readonly validationRules = resolve(IValidationRules);
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  constructor() {
    // Define validation rules
    this.setupValidationRules();
  }

  private setupValidationRules() {
    this.validationRules
      .on(this.user)
      .ensure('email')
        .required()
        .email()
        .withMessage('Please enter a valid email address')
      .ensure('password')
        .required()
        .minLength(8)
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain lowercase, uppercase, and number')
      .ensure('confirmPassword')
        .required()
        .satisfies((value, object) => value === object.password)
        .withMessage('Passwords must match')
      .ensure('age')
        .required()
        .range(13, 120)
        .withMessage('Age must be between 13 and 120')
      .ensure('terms')
        .satisfies(value => value === true)
        .withMessage('You must accept the terms and conditions');
  }

  async handleSubmit() {
    const result = await this.validationController.validate();
    
    if (result.valid) {
      console.log('Form is valid, submitting...', this.user);
      // Submit form
    } else {
      console.log('Validation failed:', result);
    }
  }
}
```

```html
<form submit.trigger="handleSubmit()">
  <div class="form-group">
    <label for="email">Email Address</label>
    <input id="email" 
           type="email" 
           value.bind="user.email & validate" 
           class="form-control" />
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input id="password" 
           type="password" 
           value.bind="user.password & validate" 
           class="form-control" />
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <input id="confirmPassword" 
           type="password" 
           value.bind="user.confirmPassword & validate" 
           class="form-control" />
  </div>

  <div class="form-group">
    <label for="age">Age</label>
    <input id="age" 
           type="number" 
           value.bind="user.age & validate" 
           class="form-control" />
  </div>

  <div class="form-group">
    <label>
      <input type="checkbox" checked.bind="user.terms & validate" />
      I accept the terms and conditions
    </label>
  </div>

  <button type="submit" class="btn btn-primary">Register</button>
</form>
```

### Advanced Validation Display

Use validation components for sophisticated error display:

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController, ValidationTrigger } from '@aurelia/validation-html';

export class AdvancedValidationForm {
  contact = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  };

  // Validation controller for manual control
  private readonly validationController = resolve(newInstanceForScope(IValidationController));
  private readonly validationRules = resolve(IValidationRules);

  // Form-specific error tracking
  nameErrors: any[] = [];
  contactErrors: any[] = [];
  messageErrors: any[] = [];

  constructor() {
    this.setupValidation();
  }

  private setupValidation() {
    this.validationRules
      .on(this.contact)
      .ensure('firstName')
        .required()
        .minLength(2)
        .withMessage('First name must be at least 2 characters')
      .ensure('lastName')
        .required()
        .minLength(2)
        .withMessage('Last name must be at least 2 characters')
      .ensure('email')
        .required()
        .email()
        .withMessage('Please enter a valid email address')
      .ensure('phone')
        .required()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Please enter a valid phone number')
      .ensure('company')
        .required()
        .withMessage('Company name is required')
      .ensure('message')
        .required()
        .minLength(10)
        .withMessage('Message must be at least 10 characters');

    // Configure validation triggers
    this.validationController.validateTrigger = ValidationTrigger.changeOrBlur;
  }

  async validateSection(sectionName: 'name' | 'contact' | 'message') {
    let properties: string[] = [];
    
    switch (sectionName) {
      case 'name':
        properties = ['firstName', 'lastName'];
        break;
      case 'contact':
        properties = ['email', 'phone', 'company'];
        break;
      case 'message':
        properties = ['message'];
        break;
    }

    const result = await this.validationController.validate({
      object: this.contact,
      propertyName: properties
    });

    // Update section-specific errors
    this[`${sectionName}Errors`] = result.results
      .filter(r => !r.valid)
      .map(r => ({ error: r, target: r.target }));

    return result.valid;
  }

  async submitForm() {
    const result = await this.validationController.validate();
    
    if (result.valid) {
      // Submit the form
      console.log('Submitting:', this.contact);
    }
  }
}
```

```html
<form class="advanced-form">
  <!-- Name Section with Validation Container -->
  <validation-container class="form-section">
    <h3>Personal Information</h3>
    <div validation-errors.bind="nameErrors" class="section-errors">
      <div repeat.for="error of nameErrors" class="alert alert-danger">
        ${error.error.message}
      </div>
    </div>

    <div class="form-row">
      <div class="form-group col-md-6">
        <label for="firstName">First Name</label>
        <input id="firstName" 
               value.bind="contact.firstName & validate" 
               class="form-control" />
      </div>
      <div class="form-group col-md-6">
        <label for="lastName">Last Name</label>
        <input id="lastName" 
               value.bind="contact.lastName & validate" 
               class="form-control" />
      </div>
    </div>

    <button type="button" 
            click.trigger="validateSection('name')"
            class="btn btn-outline-primary">
      Validate Name Section
    </button>
  </validation-container>

  <!-- Contact Section -->
  <validation-container class="form-section">
    <h3>Contact Information</h3>
    <div validation-errors.bind="contactErrors" class="section-errors">
      <div repeat.for="error of contactErrors" class="alert alert-danger">
        ${error.error.message}
      </div>
    </div>

    <div class="form-group">
      <label for="email">Email Address</label>
      <input id="email" 
             type="email"
             value.bind="contact.email & validate" 
             class="form-control" />
    </div>

    <div class="form-group">
      <label for="phone">Phone Number</label>
      <input id="phone" 
             type="tel"
             value.bind="contact.phone & validate" 
             class="form-control" />
    </div>

    <div class="form-group">
      <label for="company">Company</label>
      <input id="company" 
             value.bind="contact.company & validate" 
             class="form-control" />
    </div>
  </validation-container>

  <!-- Message Section -->
  <validation-container class="form-section">
    <h3>Message</h3>
    <div validation-errors.bind="messageErrors" class="section-errors">
      <div repeat.for="error of messageErrors" class="alert alert-danger">
        ${error.error.message}
      </div>
    </div>

    <div class="form-group">
      <label for="message">Your Message</label>
      <textarea id="message" 
                rows="5"
                value.bind="contact.message & validate" 
                class="form-control"
                placeholder="Tell us about your needs..."></textarea>
    </div>
  </validation-container>

  <!-- Form Actions -->
  <div class="form-actions">
    <button type="button" 
            click.trigger="submitForm()"
            class="btn btn-primary btn-lg">
      Send Message
    </button>
  </div>
</form>
```

### Dynamic Validation Rules

Create validation rules that adapt to changing form conditions:

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class DynamicValidationForm {
  profile = {
    userType: 'individual' as 'individual' | 'business',
    firstName: '',
    lastName: '',
    businessName: '',
    taxId: '',
    email: '',
    phone: ''
  };

  private readonly validationRules = resolve(IValidationRules);
  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  constructor() {
    this.setupDynamicValidation();
  }

  private setupDynamicValidation() {
    this.validationRules
      .on(this.profile)
      .ensure('firstName')
        .required()
        .when(obj => obj.userType === 'individual')
        .withMessage('First name is required for individuals')
      .ensure('lastName')
        .required()
        .when(obj => obj.userType === 'individual')
        .withMessage('Last name is required for individuals')
      .ensure('businessName')
        .required()
        .when(obj => obj.userType === 'business')
        .withMessage('Business name is required for businesses')
      .ensure('taxId')
        .required()
        .matches(/^\d{2}-\d{7}$/)
        .when(obj => obj.userType === 'business')
        .withMessage('Tax ID must be in format XX-XXXXXXX')
      .ensure('email')
        .required()
        .email()
        .withMessage('Valid email address is required')
      .ensure('phone')
        .required()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Valid phone number is required');
  }

  userTypeChanged() {
    // Re-validate when user type changes
    this.validationController.validate();
  }

  async handleSubmit() {
    const result = await this.validationController.validate();
    
    if (result.valid) {
      console.log('Submitting profile:', this.profile);
      // Handle successful validation
    } else {
      console.log('Validation errors:', result.results.filter(r => !r.valid));
    }
  }
}
```

```html
<form submit.trigger="handleSubmit()" class="dynamic-form">
  <div class="form-group">
    <label>Account Type</label>
    <div class="form-check-container">
      <label class="form-check">
        <input type="radio" 
               name="userType"
               model.bind="'individual'"
               checked.bind="profile.userType"
               change.trigger="userTypeChanged()" />
        Individual
      </label>
      <label class="form-check">
        <input type="radio" 
               name="userType"
               model.bind="'business'"
               checked.bind="profile.userType"
               change.trigger="userTypeChanged()" />
        Business
      </label>
    </div>
  </div>

  <!-- Individual Fields -->
  <div if.bind="profile.userType === 'individual'" class="user-type-section">
    <h4>Personal Information</h4>
    <div class="form-row">
      <div class="form-group col-md-6">
        <label for="firstName">First Name</label>
        <input id="firstName" 
               value.bind="profile.firstName & validate" 
               class="form-control" />
      </div>
      <div class="form-group col-md-6">
        <label for="lastName">Last Name</label>
        <input id="lastName" 
               value.bind="profile.lastName & validate" 
               class="form-control" />
      </div>
    </div>
  </div>

  <!-- Business Fields -->
  <div if.bind="profile.userType === 'business'" class="user-type-section">
    <h4>Business Information</h4>
    <div class="form-group">
      <label for="businessName">Business Name</label>
      <input id="businessName" 
             value.bind="profile.businessName & validate" 
             class="form-control" />
    </div>
    <div class="form-group">
      <label for="taxId">Tax ID (XX-XXXXXXX)</label>
      <input id="taxId" 
             value.bind="profile.taxId & validate" 
             class="form-control" 
             placeholder="12-3456789" />
    </div>
  </div>

  <!-- Common Fields -->
  <div class="common-fields">
    <h4>Contact Information</h4>
    <div class="form-group">
      <label for="email">Email Address</label>
      <input id="email" 
             type="email"
             value.bind="profile.email & validate" 
             class="form-control" />
    </div>
    <div class="form-group">
      <label for="phone">Phone Number</label>
      <input id="phone" 
             type="tel"
             value.bind="profile.phone & validate" 
             class="form-control" />
    </div>
  </div>

  <button type="submit" class="btn btn-primary">Submit Profile</button>
</form>
```

### Real-time Validation Feedback

Provide immediate feedback with sophisticated validation timing:

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

// Utility function for debouncing (you would typically import this from a utility library)
function debounce(func: Function, wait: number) {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export class RealTimeValidationForm {
  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  validationStates = {
    username: { checking: false, available: false, message: '' },
    email: { checking: false, valid: false, message: '' },
    password: { strength: 0, message: '' },
    confirmPassword: { matches: false, message: '' }
  };

  private readonly validationRules = resolve(IValidationRules);
  private readonly validationController = resolve(newInstanceForScope(IValidationController));
  private debounceUsernameCheck = debounce(this.checkUsernameAvailability.bind(this), 500);
  private debounceEmailCheck = debounce(this.validateEmail.bind(this), 300);

  constructor() {
    this.setupValidation();
  }

  private setupValidation() {
    this.validationRules
      .on(this.user)
      .ensure('username')
        .required()
        .minLength(3)
        .matches(/^[a-zA-Z0-9_]+$/)
        .satisfies(async (username) => {
          if (username.length >= 3) {
            return await this.isUsernameAvailable(username);
          }
          return true;
        })
        .withMessage('Username must be available')
      .ensure('email')
        .required()
        .email()
        .satisfies(async (email) => await this.isEmailValid(email))
        .withMessage('Please enter a valid, verified email address')
      .ensure('password')
        .required()
        .minLength(8)
        .satisfies(password => this.calculatePasswordStrength(password) >= 3)
        .withMessage('Password must be strong (score 3+)')
      .ensure('confirmPassword')
        .required()
        .satisfies((value, obj) => value === obj.password)
        .withMessage('Passwords must match');
  }

  usernameChanged(newUsername: string) {
    if (newUsername.length >= 3) {
      this.validationStates.username.checking = true;
      this.debounceUsernameCheck(newUsername);
    }
  }

  emailChanged(newEmail: string) {
    if (newEmail.includes('@')) {
      this.validationStates.email.checking = true;
      this.debounceEmailCheck(newEmail);
    }
  }

  passwordChanged(newPassword: string) {
    const strength = this.calculatePasswordStrength(newPassword);
    this.validationStates.password.strength = strength;
    this.validationStates.password.message = this.getPasswordStrengthMessage(strength);
    
    // Re-validate confirm password
    if (this.user.confirmPassword) {
      this.confirmPasswordChanged(this.user.confirmPassword);
    }
  }

  confirmPasswordChanged(confirmPassword: string) {
    const matches = confirmPassword === this.user.password;
    this.validationStates.confirmPassword.matches = matches;
    this.validationStates.confirmPassword.message = matches 
      ? 'Passwords match' 
      : 'Passwords do not match';
  }

  private async checkUsernameAvailability(username: string) {
    try {
      const available = await this.isUsernameAvailable(username);
      this.validationStates.username = {
        checking: false,
        available,
        message: available ? 'Username is available' : 'Username is taken'
      };
    } catch (error) {
      this.validationStates.username = {
        checking: false,
        available: false,
        message: 'Error checking username availability'
      };
    }
  }

  private async validateEmail(email: string) {
    try {
      const valid = await this.isEmailValid(email);
      this.validationStates.email = {
        checking: false,
        valid,
        message: valid ? 'Email is valid' : 'Email format is invalid'
      };
    } catch (error) {
      this.validationStates.email = {
        checking: false,
        valid: false,
        message: 'Error validating email'
      };
    }
  }

  private calculatePasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  }

  private getPasswordStrengthMessage(strength: number): string {
    const messages = [
      'Very weak password',
      'Weak password',
      'Fair password',
      'Good password',
      'Strong password',
      'Very strong password'
    ];
    return messages[strength] || 'No password';
  }

  // Mock API calls (replace with real implementations)
  private async isUsernameAvailable(username: string): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return !['admin', 'test', 'user'].includes(username.toLowerCase());
  }

  private async isEmailValid(email: string): Promise<boolean> {
    // Simulate API call for email verification
    await new Promise(resolve => setTimeout(resolve, 300));
    return email.includes('@') && !email.includes('invalid');
  }
}
```

```html
<form class="realtime-validation-form">
  <div class="form-group">
    <label for="username">Username</label>
    <div class="input-with-feedback">
      <input id="username" 
             value.bind="user.username & validate & debounce:100"
             class="form-control"
             class.bind="{ 
               'is-valid': validationStates.username.available,
               'is-invalid': validationStates.username.message && !validationStates.username.available 
             }" />
      <div class="feedback-icons">
        <i if.bind="validationStates.username.checking" class="spinner"></i>
        <i if.bind="validationStates.username.available" class="success-icon">✓</i>
        <i if.bind="validationStates.username.message && !validationStates.username.available" class="error-icon">✗</i>
      </div>
    </div>
    <div class="feedback-text" 
         class.bind="{ 
           'text-success': validationStates.username.available,
           'text-danger': !validationStates.username.available && validationStates.username.message 
         }">
      ${validationStates.username.message}
    </div>
  </div>

  <div class="form-group">
    <label for="email">Email Address</label>
    <div class="input-with-feedback">
      <input id="email" 
             type="email"
             value.bind="user.email & validate & debounce:200"
             class="form-control"
             class.bind="{ 
               'is-valid': validationStates.email.valid,
               'is-invalid': validationStates.email.message && !validationStates.email.valid 
             }" />
      <div class="feedback-icons">
        <i if.bind="validationStates.email.checking" class="spinner"></i>
        <i if.bind="validationStates.email.valid" class="success-icon">✓</i>
        <i if.bind="validationStates.email.message && !validationStates.email.valid" class="error-icon">✗</i>
      </div>
    </div>
    <div class="feedback-text" 
         class.bind="{ 
           'text-success': validationStates.email.valid,
           'text-danger': !validationStates.email.valid && validationStates.email.message 
         }">
      ${validationStates.email.message}
    </div>
  </div>

  <div class="form-group">
    <label for="password">Password</label>
    <input id="password" 
           type="password"
           value.bind="user.password & validate" 
           class="form-control" />
    <div class="password-strength">
      <div class="strength-bar">
        <div repeat.for="i of 5" 
             class="strength-segment"
             class.bind="{ 
               'active': i < validationStates.password.strength,
               'weak': validationStates.password.strength <= 2,
               'medium': validationStates.password.strength === 3,
               'strong': validationStates.password.strength >= 4 
             }"></div>
      </div>
      <div class="strength-text">${validationStates.password.message}</div>
    </div>
  </div>

  <div class="form-group">
    <label for="confirmPassword">Confirm Password</label>
    <div class="input-with-feedback">
      <input id="confirmPassword" 
             type="password"
             value.bind="user.confirmPassword & validate" 
             class="form-control"
             class.bind="{ 
               'is-valid': validationStates.confirmPassword.matches && user.confirmPassword,
               'is-invalid': !validationStates.confirmPassword.matches && user.confirmPassword 
             }" />
      <div class="feedback-icons">
        <i if.bind="validationStates.confirmPassword.matches && user.confirmPassword" class="success-icon">✓</i>
        <i if.bind="!validationStates.confirmPassword.matches && user.confirmPassword" class="error-icon">✗</i>
      </div>
    </div>
    <div class="feedback-text" 
         class.bind="{ 
           'text-success': validationStates.confirmPassword.matches,
           'text-danger': !validationStates.confirmPassword.matches && user.confirmPassword 
         }">
      ${validationStates.confirmPassword.message}
    </div>
  </div>

  <button type="submit" class="btn btn-primary">Create Account</button>
</form>
```

For comprehensive validation documentation, see the dedicated [Validation Guide](../aurelia-packages/validation/).

---

## Security and Best Practices

Security in forms is critical for protecting user data and preventing common web vulnerabilities. Aurelia provides the foundation for secure form implementations, but you must implement security best practices.

### Input Validation and Sanitization

Always validate and sanitize user input on both client and server sides:

```typescript
import { resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';

export class SecureFormComponent {
  private readonly maxFieldLength = 1000;
  private readonly allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  userData = {
    username: '',
    email: '',
    bio: '',
    website: ''
  };

  private readonly validationRules = resolve(IValidationRules);

  constructor() {
    this.setupSecureValidation();
  }

  private setupSecureValidation() {
    this.validationRules
      .on(this.userData)
      .ensure('username')
        .required()
        .minLength(3)
        .maxLength(20)
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens')
        .satisfies(username => this.isUsernameSafe(username))
        .withMessage('Username contains prohibited content')
      .ensure('email')
        .required()
        .email()
        .maxLength(254) // RFC 5321 limit
        .satisfies(email => this.isEmailDomainAllowed(email))
        .withMessage('Email domain not allowed')
      .ensure('bio')
        .maxLength(this.maxFieldLength)
        .satisfies(bio => this.containsNoMaliciousContent(bio))
        .withMessage('Bio contains prohibited content')
      .ensure('website')
        .satisfies(url => !url || this.isUrlSafe(url))
        .withMessage('Website URL is not allowed');
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    // Remove potentially dangerous characters
    let sanitized = input.trim();
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Limit length
    sanitized = sanitized.substring(0, this.maxFieldLength);
    
    // HTML encode for display (use a proper HTML sanitizer in production)
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized;
  }

  // Security validation methods
  private isUsernameSafe(username: string): boolean {
    // Check against prohibited usernames
    const prohibitedUsernames = ['admin', 'root', 'administrator', 'system'];
    return !prohibitedUsernames.includes(username.toLowerCase());
  }

  private isEmailDomainAllowed(email: string): boolean {
    // Example: Block certain domains (implement your own logic)
    const blockedDomains = ['tempmail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? !blockedDomains.includes(domain) : false;
  }

  private containsNoMaliciousContent(text: string): boolean {
    // Check for common XSS patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(text));
  }

  private isUrlSafe(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow HTTP and HTTPS
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false;
      }
      
      // Check for dangerous domains (implement your own logic)
      const dangerousDomains = ['malicious-site.com'];
      return !dangerousDomains.includes(parsedUrl.hostname.toLowerCase());
      
    } catch {
      return false; // Invalid URL
    }
  }

  // Secure file upload validation
  validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!this.allowedFileTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed. Only JPEG, PNG, and WebP images are permitted.'
      };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds limit. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB.`
      };
    }

    // Check filename for dangerous characters
    if (/[<>:"\\|?*\x00-\x1f]/.test(file.name)) {
      return {
        isValid: false,
        error: 'Filename contains invalid characters.'
      };
    }

    return { isValid: true };
  }

  async handleSecureSubmit() {
    try {
      // Sanitize all inputs before submission
      const sanitizedData = {
        username: this.sanitizeInput(this.userData.username),
        email: this.userData.email.toLowerCase().trim(),
        bio: this.sanitizeInput(this.userData.bio),
        website: this.userData.website.trim()
      };

      // Add security headers and CSRF token
      const response = await fetch('/api/secure-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.getCSRFToken(),
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!response.ok) {
        throw new Error('Server validation failed');
      }

      const result = await response.json();
      console.log('Form submitted securely:', result);

    } catch (error) {
      console.error('Secure submission failed:', error);
      // Don't expose internal error details to user
      throw new Error('Submission failed. Please try again.');
    }
  }

  private getCSRFToken(): string {
    // Get CSRF token from meta tag or cookie
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    return metaTag?.content || '';
  }
}
```

### Rate Limiting and Abuse Prevention

Implement client-side rate limiting and abuse prevention:

```typescript
export class RateLimitedForm {
  private submissionAttempts: number = 0;
  private lastSubmissionTime: number = 0;
  private readonly maxAttempts: number = 5;
  private readonly timeWindow: number = 60000; // 1 minute
  private readonly baseDelay: number = 1000; // 1 second

  get currentDelay(): number {
    // Exponential backoff
    return this.baseDelay * Math.pow(2, this.submissionAttempts);
  }

  get canSubmit(): boolean {
    const now = Date.now();
    
    // Reset attempts if time window has passed
    if (now - this.lastSubmissionTime > this.timeWindow) {
      this.submissionAttempts = 0;
    }

    return this.submissionAttempts < this.maxAttempts;
  }

  async handleRateLimitedSubmit() {
    if (!this.canSubmit) {
      const waitTime = Math.ceil(this.currentDelay / 1000);
      throw new Error(`Too many attempts. Please wait ${waitTime} seconds.`);
    }

    this.submissionAttempts++;
    this.lastSubmissionTime = Date.now();

    try {
      await this.submitWithDelay();
      // Reset on successful submission
      this.submissionAttempts = 0;
    } catch (error) {
      // Keep attempt count for failed submissions
      throw error;
    }
  }

  private async submitWithDelay() {
    // Add artificial delay to prevent rapid-fire submissions
    if (this.submissionAttempts > 1) {
      await new Promise(resolve => setTimeout(resolve, this.currentDelay));
    }

    // Actual submission logic here
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
}
```

### Content Security Policy (CSP) Considerations

Implement CSP-friendly form patterns:

```typescript
export class CSPFriendlyForm {
  // Avoid inline event handlers - use Aurelia's binding instead
  // BAD: <button onclick="handleClick()">
  // GOOD: <button click.trigger="handleClick()">

  // Use nonce for dynamic content if needed
  private nonce: string = this.generateNonce();

  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Safe dynamic script injection (if absolutely necessary)
  addScriptSecurely(scriptContent: string) {
    const script = document.createElement('script');
    script.nonce = this.nonce;
    script.textContent = scriptContent;
    document.head.appendChild(script);
  }
}
```

---

## Accessibility Considerations

Building accessible forms ensures your application works for users with disabilities and meets WCAG guidelines. Aurelia provides excellent support for accessibility features.

### Semantic Form Structure

Use proper semantic HTML and ARIA attributes:

```html
<form class="accessible-form" role="form" aria-labelledby="form-title">
  <h2 id="form-title">Contact Information Form</h2>
  <p id="form-description">Please provide your contact details. Required fields are marked with an asterisk (*).</p>

  <!-- Fieldset for grouping related fields -->
  <fieldset>
    <legend>Personal Information</legend>
    
    <div class="form-group">
      <label for="firstName" class="required">
        First Name *
        <span class="visually-hidden">(required)</span>
      </label>
      <input id="firstName"
             type="text"
             value.bind="contact.firstName & validate"
             required
             aria-describedby="firstName-help firstName-error"
             aria-invalid.bind="hasFirstNameError"
             class="form-control" />
      <div id="firstName-help" class="help-text">
        Enter your legal first name as it appears on official documents
      </div>
      <div id="firstName-error" 
           class="error-message"
           role="alert"
           if.bind="hasFirstNameError"
           aria-live="polite">
        ${firstNameError}
      </div>
    </div>

    <div class="form-group">
      <label for="email" class="required">
        Email Address *
        <span class="visually-hidden">(required)</span>
      </label>
      <input id="email"
             type="email"
             value.bind="contact.email & validate"
             required
             aria-describedby="email-help"
             autocomplete="email"
             class="form-control" />
      <div id="email-help" class="help-text">
        We'll use this to send you important updates
      </div>
    </div>

    <div class="form-group">
      <label for="phone">Phone Number (Optional)</label>
      <input id="phone"
             type="tel"
             value.bind="contact.phone & validate"
             aria-describedby="phone-help"
             autocomplete="tel"
             class="form-control" />
      <div id="phone-help" class="help-text">
        Include country code for international numbers
      </div>
    </div>
  </fieldset>

  <!-- Radio group with proper ARIA -->
  <fieldset>
    <legend>Preferred Contact Method</legend>
    <div class="radio-group" role="radiogroup" aria-required="true">
      <div class="form-check">
        <input id="contact-email"
               type="radio"
               name="contactMethod"
               model.bind="'email'"
               checked.bind="contact.preferredMethod"
               class="form-check-input" />
        <label for="contact-email" class="form-check-label">
          Email
        </label>
      </div>
      <div class="form-check">
        <input id="contact-phone"
               type="radio"
               name="contactMethod"
               model.bind="'phone'"
               checked.bind="contact.preferredMethod"
               class="form-check-input" />
        <label for="contact-phone" class="form-check-label">
          Phone
        </label>
      </div>
      <div class="form-check">
        <input id="contact-text"
               type="radio"
               name="contactMethod"
               model.bind="'text'"
               checked.bind="contact.preferredMethod"
               class="form-check-input" />
        <label for="contact-text" class="form-check-label">
          Text Message
        </label>
      </div>
    </div>
  </fieldset>

  <!-- Accessible checkbox with detailed description -->
  <div class="form-group">
    <div class="form-check">
      <input id="newsletter"
             type="checkbox"
             checked.bind="contact.subscribeNewsletter"
             aria-describedby="newsletter-description"
             class="form-check-input" />
      <label for="newsletter" class="form-check-label">
        Subscribe to newsletter
      </label>
    </div>
    <div id="newsletter-description" class="form-text">
      Receive weekly updates about new features, tips, and special offers. 
      You can unsubscribe at any time.
    </div>
  </div>

  <!-- Form submission with clear feedback -->
  <div class="form-actions">
    <button type="submit" 
            class="btn btn-primary"
            aria-describedby="submit-help">
      <span if.bind="!isSubmitting">Submit Contact Information</span>
      <span if.bind="isSubmitting">
        <span class="visually-hidden">Submitting form, please wait</span>
        <span aria-hidden="true">Submitting...</span>
      </span>
    </button>
    <div id="submit-help" class="form-text">
      Review your information before submitting
    </div>
  </div>

  <!-- Live region for dynamic updates -->
  <div aria-live="polite" aria-atomic="true" class="sr-only">
    <span if.bind="submissionMessage">${submissionMessage}</span>
  </div>
</form>
```

### Accessible Form Validation

Implement validation feedback that works with screen readers:

```typescript
import { resolve, newInstanceForScope } from '@aurelia/kernel';
import { IValidationController } from '@aurelia/validation-html';

export class AccessibleFormValidation {
  contact = {
    firstName: '',
    email: '',
    phone: '',
    preferredMethod: '',
    subscribeNewsletter: false
  };

  validationErrors: Map<string, string> = new Map();
  isSubmitting = false;
  submissionMessage = '';

  private readonly validationController = resolve(newInstanceForScope(IValidationController));

  get hasFirstNameError(): boolean {
    return this.validationErrors.has('firstName');
  }

  get firstNameError(): string {
    return this.validationErrors.get('firstName') || '';
  }

  // Focus management for form errors
  async handleSubmit() {
    this.validationErrors.clear();
    this.isSubmitting = true;

    try {
      const result = await this.validationController.validate();

      if (!result.valid) {
        // Collect validation errors
        result.results.forEach(error => {
          if (!error.valid) {
            this.validationErrors.set(error.propertyName, error.message);
          }
        });

        // Focus first error field
        this.focusFirstError();
        this.announceErrors();
        return;
      }

      // Submit form
      await this.submitForm();
      this.submissionMessage = 'Your contact information has been submitted successfully.';
      
    } catch (error) {
      this.submissionMessage = 'An error occurred. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  private focusFirstError() {
    const firstErrorField = this.validationErrors.keys().next().value;
    if (firstErrorField) {
      const element = document.getElementById(firstErrorField);
      element?.focus();
    }
  }

  private announceErrors() {
    const errorCount = this.validationErrors.size;
    const announcement = errorCount === 1 
      ? 'There is 1 error in the form. Please review and correct it.'
      : `There are ${errorCount} errors in the form. Please review and correct them.`;
    
    this.announceToScreenReader(announcement);
  }

  private announceToScreenReader(message: string) {
    // Create a temporary live region for immediate announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  private async submitForm() {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Form submitted:', this.contact);
  }
}
```

### CSS for Accessibility

Include essential accessibility styles:

```css
/* Screen reader only content */
.visually-hidden, .sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Focus indicators */
.form-control:focus,
.form-check-input:focus,
.btn:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .form-control,
  .form-check-input {
    border: 2px solid ButtonText;
  }
  
  .form-control:focus,
  .form-check-input:focus {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner,
  .progress-bar .progress-fill {
    animation: none;
  }
}

/* Error states */
.form-control[aria-invalid="true"] {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Required field indicators */
.required::after {
  content: " *";
  color: #dc3545;
}
```

### Testing Accessibility

Include accessibility testing strategies:

```typescript
export class AccessibilityTester {
  // Programmatic accessibility testing
  testFormAccessibility() {
    const errors: string[] = [];

    // Check for required labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input: HTMLInputElement) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        errors.push(`Input with id "${input.id}" lacks proper labeling`);
      }
    });

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading: HTMLElement) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        errors.push(`Heading level skipped: ${heading.tagName} after H${previousLevel}`);
      }
      previousLevel = level;
    });

    // Check for live regions
    const liveRegions = document.querySelectorAll('[aria-live]');
    if (liveRegions.length === 0) {
      errors.push('No live regions found for dynamic content announcements');
    }

    return {
      isAccessible: errors.length === 0,
      errors
    };
  }

  // Keyboard navigation testing
  testKeyboardNavigation() {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return {
      focusableCount: focusableElements.length,
      hasTrapFocus: this.checkFocusTrap(),
      hasSkipLinks: !!document.querySelector('[href="#main"], [href="#content"]')
    };
  }

  private checkFocusTrap(): boolean {
    // Implementation would check if focus is properly trapped in modals/dialogs
    return true; // Simplified
  }
}
```

This comprehensive forms documentation provides production-ready patterns for all aspects of form development in Aurelia 2, from basic binding to advanced security and accessibility considerations. Each section includes real-world examples that you can adapt to your specific use cases.

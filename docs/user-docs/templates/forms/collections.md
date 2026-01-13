# Collection-Based Form Controls

Learn how to work with checkboxes, radio buttons, select elements, and advanced collection patterns in Aurelia forms.

## Overview

Aurelia provides sophisticated support for collection-based form controls, going beyond simple arrays to support Sets, Maps, and custom collection types with optimal performance.

## Checkboxes

### Boolean Checkboxes

The simplest checkbox pattern binds to boolean properties:

```typescript
export class PreferencesForm {
  emailNotifications = false;
  smsNotifications = true;
  pushNotifications = false;

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

**Key Points:**
- Use `checked.bind` for boolean checkboxes
- Works with any boolean property
- Great for independent on/off toggles

### Array-Based Multi-Select

For multi-select scenarios, bind arrays to checkbox groups using `model.bind`:

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
    <strong>Total: $${totalValue}</strong>
  </div>
</form>
```

**How It Works:**
1. `model.bind` tells Aurelia what value to add to the array
2. `checked.bind` points to the array that holds selected values
3. Aurelia automatically adds/removes values when checkboxes are toggled

**Use Cases:**
- Multi-select forms (select multiple skills, interests, tags)
- Batch operations (select multiple items for deletion)
- Filter selections (select multiple categories to filter by)

### Set-Based Collections

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

  // Custom matcher for Set operations
  tagMatcher = (a: any, b: any) => {
    if (typeof a === 'string' && typeof b === 'object') return a === b.id;
    if (typeof b === 'string' && typeof a === 'object') return b === a.id;
    return a === b;
  };

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
           class="tag-label">
      <input type="checkbox"
             model.bind="tag.id"
             checked.bind="selectedTags"
             matcher.bind="tagMatcher" />
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

**Why Use Sets:**
- O(1) lookup performance with `.has()`
- Efficient for large collections
- Natural for unique value storage
- Better performance for frequent add/remove operations

### Map-Based Collections

For complex key-value selections, Maps provide the most flexibility:

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

  // Map: resource -> Set<action>
  selectedPermissions: Map<string, Set<string>> = new Map();

  constructor() {
    // Initialize with default permissions
    this.selectedPermissions.set('users', new Set(['read']));
    this.selectedPermissions.set('posts', new Set(['read', 'create']));
  }

  hasPermission(resource: string, action: string): boolean {
    return this.selectedPermissions.get(resource)?.has(action) ?? false;
  }

  togglePermission(resource: string, action: string) {
    if (!this.selectedPermissions.has(resource)) {
      this.selectedPermissions.set(resource, new Set());
    }

    const resourcePerms = this.selectedPermissions.get(resource)!;
    if (resourcePerms.has(action)) {
      resourcePerms.delete(action);
    } else {
      resourcePerms.add(action);
    }
  }

  get permissionSummary() {
    const summary: Array<{ resource: string; actions: string[] }> = [];
    this.selectedPermissions.forEach((actions, resource) => {
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
      <h4>${permission.resource}</h4>
      <p class="description">${permission.description}</p>
      <div class="action-checkboxes">
        <label repeat.for="action of permission.actions" class="action-label">
          <input type="checkbox"
                 checked.bind="hasPermission(permission.resource, action)"
                 change.trigger="togglePermission(permission.resource, action)" />
          ${action}
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

**When to Use Maps:**
- Nested selection scenarios (resource → actions)
- Complex key-value relationships
- Grouped permissions or settings
- Multi-dimensional selections

## Radio Buttons

Radio buttons are for single-selection from multiple options.

### Basic Radio Buttons

```typescript
export class ShippingForm {
  shippingMethods = ['Standard', 'Express', 'Overnight'];
  selectedMethod = 'Standard';
}
```

```html
<fieldset>
  <legend>Shipping Method</legend>
  <label repeat.for="method of shippingMethods">
    <input type="radio"
           name="shipping"
           model.bind="method"
           checked.bind="selectedMethod" />
    ${method}
  </label>
</fieldset>

<p>Selected: ${selectedMethod}</p>
```

### Radio Buttons with Objects

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

  get totalFee(): number {
    return this.selectedPaymentMethod?.fee || 0;
  }

  get requiresUserVerification(): boolean {
    return this.selectedPaymentMethod?.requiresVerification || false;
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
               matcher.bind="paymentMethodMatcher" />

        <div class="payment-info">
          <div class="payment-header">
            <span class="payment-name">${method.name}</span>
            <span class="payment-type badge">${method.type}</span>
          </div>

          <div class="payment-details">
            <div class="processing-time">⏱️ ${method.processingTime}</div>
            <div class="fee-info">
              💵 ${method.fee === 0 ? 'No fees' : '$' + method.fee.toFixed(2)}
            </div>
            <div if.bind="method.requiresVerification" class="verification-required">
              🛡️ Verification required
            </div>
          </div>
        </div>
      </label>
    </div>
  </div>

  <!-- Selection Summary -->
  <div if.bind="selectedPaymentMethod" class="selection-summary">
    <h4>Payment Summary</h4>
    <p>Method: ${selectedPaymentMethod.name}</p>
    <p>Processing: ${selectedPaymentMethod.processingTime}</p>
    <p>Fee: ${totalFee === 0 ? 'Free' : '$' + totalFee.toFixed(2)}</p>
    <div if.bind="requiresUserVerification" class="warning">
      ⚠️ This payment method requires account verification
    </div>
  </div>
</form>
```

**Key Points:**
- Use same `name` attribute for all radios in a group
- `model.bind` defines the value when selected
- `checked.bind` holds the currently selected value
- Use `matcher.bind` for complex object comparison

## Select Elements

### Basic Select

```typescript
export class CountryForm {
  countries = ['USA', 'Canada', 'Mexico', 'UK', 'France', 'Germany'];
  selectedCountry = 'USA';
}
```

```html
<select value.bind="selectedCountry">
  <option repeat.for="country of countries" value.bind="country">
    ${country}
  </option>
</select>
```

### Select with Objects

```typescript
interface Country {
  code: string;
  name: string;
  region: string;
}

export class AdvancedCountryForm {
  countries: Country[] = [
    { code: 'US', name: 'United States', region: 'North America' },
    { code: 'CA', name: 'Canada', region: 'North America' },
    { code: 'MX', name: 'Mexico', region: 'North America' },
    { code: 'UK', name: 'United Kingdom', region: 'Europe' },
    { code: 'FR', name: 'France', region: 'Europe' },
    { code: 'DE', name: 'Germany', region: 'Europe' }
  ];

  selectedCountry: Country | null = null;

  // Custom matcher
  countryMatcher = (a: Country, b: Country) => a?.code === b?.code;
}
```

```html
<!-- Using model.bind for objects -->
<select value.bind="selectedCountry" matcher.bind="countryMatcher">
  <option model.bind="null">-- Select Country --</option>
  <option repeat.for="country of countries" model.bind="country">
    ${country.name}
  </option>
</select>

<p if.bind="selectedCountry">
  Selected: ${selectedCountry.name} (${selectedCountry.region})
</p>
```

### Select with Optgroups

```html
<select value.bind="selectedCountry" matcher.bind="countryMatcher">
  <option model.bind="null">-- Select Country --</option>
  <optgroup label="North America">
    <option repeat.for="country of countries | filter:isNorthAmerica"
            model.bind="country">
      ${country.name}
    </option>
  </optgroup>
  <optgroup label="Europe">
    <option repeat.for="country of countries | filter:isEurope"
            model.bind="country">
      ${country.name}
    </option>
  </optgroup>
</select>
```

### Multi-Select

```typescript
export class MultiSelectForm {
  availableSkills = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go'];
  selectedSkills: string[] = ['JavaScript', 'TypeScript'];
}
```

```html
<select multiple value.bind="selectedSkills">
  <option repeat.for="skill of availableSkills" value.bind="skill">
    ${skill}
  </option>
</select>

<div if.bind="selectedSkills.length">
  <h4>Selected Skills (${selectedSkills.length})</h4>
  <ul>
    <li repeat.for="skill of selectedSkills">${skill}</li>
  </ul>
</div>
```

## Performance Considerations

Choose the right collection type for your use case:

| Collection Type | Best For | Performance |
|----------------|----------|-------------|
| **Array** | General purpose, small-medium collections | Good |
| **Set** | Frequent additions/removals, uniqueness | Excellent (O(1) lookups) |
| **Map** | Key-value pairs, nested selections | Excellent (O(1) lookups) |

**Performance Tips:**
- Use Set for large collections with frequent changes
- Implement efficient matcher functions for object comparison
- Avoid creating new objects in templates—use computed properties
- Consider virtualization for very large checkbox/radio lists

## Matchers Explained

By default, Aurelia compares values with strict equality (`===`). That works for primitives and for objects that are the exact same instance. It does not work when your selected value and your option values are different instances that represent the same logical entity (for example, data reloaded from an API). A matcher lets you define what "equal" means so selections stay in sync.

Matchers tell Aurelia how to compare values:

```typescript
// Simple matcher for objects with id property
simpleMatcher = (a, b) => a?.id === b?.id;

// Type-safe matcher
typedMatcher = (a: Product, b: Product) => a?.id === b?.id;

// Complex matcher with multiple criteria
complexMatcher = (a, b) => {
  if (!a || !b) return false;
  return a.id === b.id && a.version === b.version;
};

// Mixed type matcher (for Sets with objects)
mixedMatcher = (a: any, b: any) => {
  if (typeof a === 'string' && typeof b === 'object') return a === b.id;
  if (typeof b === 'string' && typeof a === 'object') return b === a.id;
  return a === b;
};
```

**When to use matchers:**
- Binding objects to checkboxes/radios
- Working with Sets containing objects
- Need custom equality logic
- Comparing by properties other than reference

## Common Patterns

### Select All / Deselect All

```typescript
export class BulkSelectionForm {
  items = [/* array of items */];
  selectedItems: any[] = [];

  get allSelected(): boolean {
    return this.selectedItems.length === this.items.length;
  }

  get someSelected(): boolean {
    return this.selectedItems.length > 0 && !this.allSelected;
  }

  toggleAll() {
    if (this.allSelected) {
      this.selectedItems = [];
    } else {
      this.selectedItems = [...this.items];
    }
  }
}
```

```html
<label>
  <input type="checkbox"
         checked.bind="allSelected"
         click.trigger="toggleAll()"
         indeterminate.bind="someSelected" />
  Select All
</label>

<label repeat.for="item of items">
  <input type="checkbox"
         model.bind="item"
         checked.bind="selectedItems" />
  ${item.name}
</label>
```

### Conditional Options

```html
<select value.bind="selectedOption">
  <option repeat.for="option of options"
          model.bind="option"
          disabled.bind="option.disabled">
    ${option.name}
    ${option.disabled ? '(unavailable)' : ''}
  </option>
</select>
```

## Related

- [Form Basics](README.md) - Basic form inputs
- [Validation](validation.md) - Validate form inputs
- [Form Examples](examples.md) - Complete examples
- [List Rendering](../repeats-and-list-rendering.md) - Using repeat.for

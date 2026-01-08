---
description: Master Aurelia's value converters for powerful data transformation. Learn formatting, localization, custom converters, performance optimization, and real-world patterns.
---

# Value Converters

Value converters are a powerful feature in Aurelia 2 that transform data as it flows between your view model and view. They enable clean separation of concerns by moving data formatting logic out of your view models while keeping templates readable and maintainable.

## Overview

Value converters excel at:
- **Data formatting** - dates, numbers, currencies, text transformations
- **Localization** - dynamic content based on user locale  
- **Display logic** - conditional formatting without cluttering view models
- **Two-way transformations** - handling both display and input conversion
- **Reactive updates** - automatic re-evaluation on global state changes
- **Performance optimization** - caching expensive transformations

### Key Advantages

- **Pure functions** - predictable, testable transformations
- **Reusable** - use the same converter across multiple components
- **Composable** - chain multiple converters for complex transformations  
- **Framework integration** - seamless integration with Aurelia's binding system
- **TypeScript support** - full type safety and intellisense

## Data Flow

Converters work in two directions:

- **toView**: Prepares model data for display.
- **fromView**: Adjusts view data before updating the model (useful with two-way binding).

Both methods receive the primary value as the first argument, with any extra arguments used as configuration.

### Example Methods

```typescript
// toView: from model to view
toView(value, ...args) { /* transform value for display */ }

// fromView: from view to model
fromView(value, ...args) { /* transform value for the model */ }
```

## Basic Usage

### Template Syntax

Use the pipe symbol (`|`) to apply a converter in templates:

```html
<!-- String interpolation -->
<h1>${userName | capitalize}</h1>
<p>${price | currency:'USD'}</p>

<!-- Property binding -->
<input value.bind="searchTerm | normalize">

<!-- Attribute binding -->
<div class.bind="status | statusClass">
```

### Simple Converter Example

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('capitalize')
export class CapitalizeConverter {
  toView(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
```

Usage in template:
```html
<span>${'hello world' | capitalize}</span>
<!-- Output: "Hello world" -->
```

### Parameter Passing

Converters accept parameters using colons (`:`) for configuration:

#### Static Parameters
```html
<!-- Fixed locale -->
<span>${date | dateFormat:'en-GB'}</span>

<!-- Multiple parameters -->
<span>${price | currency:'EUR':'symbol':'1.2-2'}</span>
```

#### Bound Parameters
```html
<span>${date | dateFormat:userLocale}</span>
<span>${text | truncate:maxLength:appendEllipsis}</span>
```

```typescript
export class MyComponent {
  userLocale = 'fr-FR';
  maxLength = 50;
  appendEllipsis = true;
}
```

#### Object Parameters
```html
<div repeat.for="item of items | sort:sortConfig">
  ${item.name}
</div>
```

```typescript
export class MyComponent {
  sortConfig = {
    property: 'name',
    direction: 'asc',
    caseSensitive: false
  };
}
```

### Chaining Converters

Chain multiple converters for complex transformations:

```html
<!-- Apply multiple transformations in sequence -->
<span>${userInput | sanitize | capitalize | truncate:100}</span>

<!-- With parameters -->
<span>${rawText | normalize | highlight:searchTerm | capitalize}</span>
```

**Chain execution order**: Left to right, where each converter receives the output of the previous one.

### Advanced Template Patterns

#### Conditional Formatting
```html
<span class.bind="status | statusToClass">
  ${status | statusToDisplay}
</span>
```

#### Dynamic Parameter Selection
```html
<span>${date | dateFormat:(isDetailed ? 'long' : 'short')}</span>
```

#### Nested Object Access
```html
<span>${user.profile | formatProfile:user.preferences}</span>
```

## Receiving the Caller Context

By default, value converters receive only the value to transform and any configuration parameters. In some advanced scenarios, you may need to know more about the *binding* or *calling context* that invoked the converter—for example, to adjust the transformation based on the host element, attributes, or other binding-specific state.

Aurelia 2 provides an **opt-in** mechanism to receive the binding instance itself as an additional parameter. To enable this feature:

1.  Add `withContext: true` to your value converter class:
    ```typescript
    import { valueConverter } from 'aurelia';

    @valueConverter({ name: 'myConverter' })
    export class MyConverter {
      public readonly withContext = true;

      public toView(value, caller, ...args) {
        // `caller` is an object with:
        // - `source`: The closest custom element view-model, if any.
        // - `binding`: The binding instance (e.g., PropertyBinding, InterpolationPartBinding).
        console.log('Converter called by binding:', caller.binding);
        console.log('Source/Component VM:', caller.source);

        // Use binding-specific state if needed, then return transformed value
        return /* your transformation logic */;
      }

      public fromView?(value, caller, ...args) {
        // For two-way binding scenarios, you can similarly access the caller properties
        return /* reverse transformation logic */;
      }
    }
    ```

Then use your converter in templates as usual:

```html
<import from="./my-converter"></import>
<p>${ someValue | myConverter }</p>
```

At runtime, Aurelia will detect `withContext: true` in the value converter and pass the binding instance as the second parameter. Depending on how the converter is used:

- **Property Binding** (`foo.bind` or `attr.bind`): the caller is a `PropertyBinding` instance
- **Interpolation** (`${ }` with converters): the caller is an `InterpolationPartBinding` instance
- **Other Bindings**: the caller corresponds to the specific binding type in use

### Common Use Cases

- Logging or debugging which binding invoked the converter
- Applying different formatting based on binding context
- Accessing binding metadata or context not available through standard converter parameters

Use this feature sparingly, only when you truly need insights into the calling context. For most formatting scenarios, simple converter parameters and camelCase converter names are sufficient.

### Accessing the View Model and Binding Context

Once `withContext: true` is enabled, your converter receives a `caller` parameter with direct access to the view model and binding information:

```typescript
import { valueConverter, type ICallerContext } from '@aurelia/runtime-html';

@valueConverter('vmAware')
export class ViewModelAwareConverter {
  readonly withContext = true;

  toView(value: unknown, caller: ICallerContext): string {
    // Direct access to the view model instance
    const viewModel = caller.source as MyComponent;
    
    // Access view model properties and methods
    if (viewModel.isAdmin) {
      return `Admin: ${value}`;
    }
    
    // Use view model data for transformation
    return `${value} (${viewModel.userName})`;
  }
}
```

#### Caller Context Properties

- **`caller.source`**: The **view model instance** of the component where the converter is used
  - This is the actual component class instance with all its properties and methods
  - Allows converters to access component state, computed properties, and methods
  - Always available when converter is used within a component

- **`caller.binding`**: The **binding instance** that invoked the converter
  - Contains binding-specific information and metadata
  - Useful for debugging or advanced binding manipulation
  - Type varies: `PropertyBinding`, `InterpolationPartBinding`, etc.

#### Real-World Example: User Permission Converter

```typescript
import { valueConverter, type ICallerContext } from '@aurelia/runtime-html';

interface UserComponent {
  currentUser: { role: string; permissions: string[] };
  isOwner(itemId: string): boolean;
}

@valueConverter('userPermission')
export class UserPermissionConverter {
  readonly withContext = true;

  toView(
    action: string,
    caller: ICallerContext,
    requiredPermission?: string
  ): boolean {
    const component = caller.source as UserComponent;
    
    // Access view model properties
    const user = component.currentUser;
    if (!user) return false;
    
    // Use view model methods
    if (action === 'delete' && component.isOwner) {
      return component.isOwner(requiredPermission || '');
    }
    
    // Check permissions
    return user.permissions.includes(requiredPermission || action);
  }
}
```

Usage in template:
```html
<button if.bind="'edit' | userPermission:'edit-posts'">
  Edit Post
</button>

<button if.bind="'delete' | userPermission:post.id">
  Delete Post
</button>
```

## Registration Patterns

Aurelia 2 provides flexible registration patterns for different use cases and architectural preferences.

### 1. Decorator Registration (Recommended)

The most common and straightforward approach:

```typescript
import { valueConverter } from 'aurelia';

// Simple registration
@valueConverter('capitalize')
export class CapitalizeConverter {
  toView(value: string): string {
    return value?.charAt(0).toUpperCase() + value?.slice(1).toLowerCase() || '';
  }
}
```

### 2. Configuration Object Registration

For advanced options including aliases:

```typescript
@valueConverter({ 
  name: 'currency', 
  aliases: ['money', 'cash'] 
})
export class CurrencyConverter {
  toView(value: number, locale = 'en-US', currency = 'USD'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  }
  
  fromView(value: string): number {
    // Parse currency string back to number for two-way binding
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }
}
```

Usage with aliases:
```html
<span>${price | currency}</span>
<span>${price | money:'en-GB':'GBP'}</span>
<span>${price | cash}</span>
```

### 3. Static Definition

Using the static `$au` property (alternative registration approach):

```typescript
export class DateFormatConverter {
  static readonly $au: ValueConverterStaticAuDefinition = {
    type: 'value-converter',
    name: 'dateFormat',
    aliases: ['df']
  };

  toView(value: Date, format: string = 'short'): string {
    return new Intl.DateTimeFormat('en-US', 
      format === 'short' ? { dateStyle: 'short' } : { dateStyle: 'full' }
    ).format(value);
  }
}
```

### 4. Manual Registration

For dynamic or runtime registration scenarios:

```typescript
import { ValueConverter, IContainer } from 'aurelia';

// Method 1: ValueConverter.define()
const DynamicConverter = ValueConverter.define('dynamic', class {
  toView(value: unknown): string {
    return `[Dynamic: ${value}]`;
  }
});

// Method 2: Container registration
export class RuntimeConverter {
  toView(value: unknown): string {
    return String(value);
  }
}

// Register manually in main.ts or configure function
container.register(ValueConverter.define('runtime', RuntimeConverter));
```

### 5. Local vs Global Registration

#### Global Registration (Application-wide)
```typescript
// Available throughout the entire application
@valueConverter('global')
export class GlobalConverter {
  toView(value: string): string {
    return value.toUpperCase();
  }
}
```

#### Local Registration (Component-specific)
```typescript
import { LocalConverter } from './local-converter';

@customElement({
  name: 'my-element',
  template: '<span>${data | localConverter}</span>',
  dependencies: [LocalConverter] // Only available in this component tree
})
export class MyElement {
  data = 'hello world';
}
```

#### Scoped Registration (Feature Module)
```typescript
// feature-module.ts
import { IContainer } from 'aurelia';

export function configure(container: IContainer) {
  container.register(
    ValueConverter.define('featureSpecific', FeatureConverter)
  );
}
```

### 6. Conditional Registration

Register converters based on environment or feature flags:

```typescript
// main.ts
import { IContainer } from 'aurelia';

export function configure(container: IContainer) {
  // Production vs Development converters
  if (process.env.NODE_ENV === 'development') {
    container.register(DebugConverter);
  }
  
  // Feature flag based registration
  if (featureFlags.enableAdvancedFormatting) {
    container.register(AdvancedFormattingConverter);
  }
}
```

### Best Practices for Registration

1. **Use decorators for most cases** - Simple and straightforward
2. **Group related converters** - Organize by feature or domain
3. **Consider lazy loading** - Register heavy converters only when needed
4. **Document aliases** - Make alternative names clear to team members
5. **Avoid global pollution** - Use local registration for component-specific logic

## Creating Custom Value Converters

Custom value converters are classes that implement transformation logic. They provide a clean way to handle data formatting throughout your application.

### Basic Structure

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('converterName')
export class ConverterNameValueConverter {
  // Required: transform data for display
  toView(value: InputType, ...args: unknown[]): OutputType {
    // Transform value for display
    return transformedValue;
  }

  // Optional: transform data from user input back to model
  fromView?(value: InputType, ...args: unknown[]): OutputType {
    // Transform user input back to model format
    return transformedValue;
  }

  // Optional: signals for automatic re-evaluation
  readonly signals?: string[] = ['signal-name'];

  // Optional: enables binding context access
  readonly withContext?: boolean = false;
}
```

### TypeScript Best Practices

#### Strong Typing
```typescript
interface FormattingOptions {
  locale?: string;
  style?: 'decimal' | 'currency' | 'percent';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

@valueConverter('numberFormat')
export class NumberFormatConverter {
  toView(value: number | null | undefined, options: FormattingOptions = {}): string {
    if (value == null || isNaN(value)) return '';
    
    const {
      locale = 'en-US',
      style = 'decimal',
      minimumFractionDigits,
      maximumFractionDigits
    } = options;

    return new Intl.NumberFormat(locale, {
      style,
      minimumFractionDigits,
      maximumFractionDigits
    }).format(value);
  }

  fromView(value: string, options: FormattingOptions = {}): number {
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    return isNaN(numericValue) ? 0 : numericValue;
  }
}
```

#### Generic Converters
```typescript
@valueConverter('arrayJoin')
export class ArrayJoinConverter<T = unknown> {
  toView(array: T[] | null | undefined, separator = ', ', formatter?: (item: T) => string): string {
    if (!Array.isArray(array)) return '';
    
    const items = formatter 
      ? array.map(formatter)
      : array.map(String);
      
    return items.join(separator);
  }
}
```

### Bidirectional Converters (Two-Way Binding)

Perfect for form inputs that need both display formatting and input parsing:

#### Phone Number Formatter
```typescript
@valueConverter('phoneNumber')
export class PhoneNumberConverter {
  toView(value: string | null | undefined): string {
    if (!value) return '';
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX for US numbers
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    
    return digits;
  }

  fromView(value: string): string {
    // Store only digits in the model
    return value.replace(/\D/g, '');
  }
}
```

Usage with two-way binding:
```html
<input value.two-way="user.phone | phoneNumber" placeholder="Phone number">
```

#### Credit Card Formatter
```typescript
@valueConverter('creditCard')
export class CreditCardConverter {
  toView(value: string | null | undefined): string {
    if (!value) return '';
    
    const digits = value.replace(/\D/g, '');
    
    // Format as XXXX XXXX XXXX XXXX
    return digits.replace(/(.{4})/g, '$1 ').trim();
  }

  fromView(value: string): string {
    return value.replace(/\D/g, '');
  }
}
```

### Error Handling and Validation

```typescript
@valueConverter('safeJson')
export class SafeJsonConverter {
  toView(value: unknown, pretty = false): string {
    try {
      return JSON.stringify(value, null, pretty ? 2 : undefined);
    } catch (error) {
      console.warn('SafeJsonConverter: Invalid JSON value', error);
      return '[Invalid JSON]';
    }
  }

  fromView(value: string): unknown {
    if (!value.trim()) return null;
    
    try {
      return JSON.parse(value);
    } catch (error) {
      console.warn('SafeJsonConverter: Invalid JSON string', error);
      return value; // Return original string if parsing fails
    }
  }
}
```

### Performance Optimization

#### Memoized Converter
```typescript
@valueConverter('expensiveTransform')
export class ExpensiveTransformConverter {
  private cache = new Map<string, string>();
  
  toView(value: string, config: TransformConfig): string {
    const cacheKey = `${value}-${JSON.stringify(config)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = this.performExpensiveTransformation(value, config);
    this.cache.set(cacheKey, result);
    
    // Prevent memory leaks
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    return result;
  }
  
  private performExpensiveTransformation(value: string, config: TransformConfig): string {
    // Expensive operation here
    return value;
  }
}
```

### Utility Converters

#### Null-Safe Converter
```typescript
@valueConverter('nullSafe')
export class NullSafeConverter {
  toView(value: unknown, fallback = ''): string {
    if (value == null || value === '') return String(fallback);
    return String(value);
  }
}
```

#### Debug Converter
```typescript
@valueConverter('debug')
export class DebugConverter {
  toView(value: unknown, label = 'Debug'): unknown {
    console.log(`${label}:`, value);
    return value;
  }
}
```

Usage:
```html
<span>${complexData | debug:'User Data' | format}</span>
```

## Signals-Based Reactivity

Value converters can automatically re-evaluate when specific signals are dispatched, perfect for locale changes, theme updates, or global state changes.

```typescript
import { valueConverter, ISignaler, resolve } from 'aurelia';

@valueConverter('localeDate')
export class LocaleDateConverter {
  private signaler = resolve(ISignaler);
  public readonly signals = ['locale-changed', 'timezone-changed'];

  toView(value: string, locale?: string) {
    const currentLocale = locale || this.getCurrentLocale();
    return new Intl.DateTimeFormat(currentLocale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(value));
  }

  private getCurrentLocale() {
    // Get current locale from your app state
    return 'en-US';
  }
}
```

To trigger re-evaluation from anywhere in your app:

```typescript
import { resolve, ISignaler } from 'aurelia';

export class LocaleService {
  private signaler = resolve(ISignaler);

  changeLocale(newLocale: string) {
    // Update your locale
    this.signaler.dispatchSignal('locale-changed');
  }
}
```

Now all `localeDate` converters automatically update when the locale changes, without needing to manually refresh bindings.

### Built-in Signal-Aware Converters

Aurelia 2 includes several built-in converters that leverage signals:

```html
<!-- Automatically updates when locale changes -->
<p>${message | t}</p> <!-- Translation -->
<p>${date | df}</p> <!-- Date format -->
<p>${number | nf}</p> <!-- Number format -->
<p>${date | rt}</p> <!-- Relative time -->
```

## Built-in Value Converters

Aurelia 2 includes several built-in converters ready for use:

### Sanitize Converter

Aurelia 2 includes a `sanitize` converter, but it requires you to provide your own sanitizer implementation:

```typescript
import { ISanitizer } from 'aurelia';

// You must register your own sanitizer implementation
export class MyHtmlSanitizer implements ISanitizer {
  sanitize(input: string): string {
    // Implement your sanitization logic
    // You might use a library like DOMPurify here
    return input; // This is just an example - implement proper sanitization!
  }
}

// Register it in your main configuration
container.register(singletonRegistration(ISanitizer, MyHtmlSanitizer));
```

Then you can use the sanitize converter:

```html
<div innerHTML.bind="userContent | sanitize"></div>
```

**Note**: The built-in sanitize converter throws an error by default. You must provide your own `ISanitizer` implementation for it to work.

### I18n Converters (when @aurelia/i18n is installed)

```html
<!-- Translation -->
<p>${'welcome.message' | t}</p>
<p>${'welcome.user' | t:{ name: userName }}</p>

<!-- Date formatting -->
<p>${date | df}</p>
<p>${date | df:{ year: 'numeric', month: 'long' }}</p>

<!-- Number formatting -->
<p>${price | nf:{ style: 'currency', currency: 'USD' }}</p>

<!-- Relative time -->
<p>${timestamp | rt}</p>
```

## Advanced Configuration Options

### Date Formatter Example

This converter formats dates based on locale:

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('date')
export class FormatDate {
  toView(value: string, locale = 'en-US') {
    const date = new Date(value);
    if (Number.isNaN(date.valueOf())) {
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
  }
}
```

Import it in your view:

```html
<import from="./date-value-converter" />
```

Usage examples:

```html
<p>${'2021-06-22T09:21:26.699Z' | date}</p>
<p>${'2021-06-22T09:21:26.699Z' | date:'en-GB'}</p>
```

View this in action on [StackBlitz](https://stackblitz.com/edit/aurelia-date-value-converter?embed=1&file=my-app.html&hideExplorer=1&view=preview).

## Real-World Converter Examples

### File Size Converter

Convert bytes to human-readable file sizes:

```typescript
@valueConverter('fileSize')
export class FileSizeConverter {
  private units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  toView(bytes: number | null | undefined, precision = 1): string {
    if (bytes == null || bytes === 0) return '0 B';
    if (bytes < 0) return 'Invalid size';
    
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, unitIndex);
    const unit = this.units[unitIndex] || 'XX';
    
    return `${value.toFixed(precision)} ${unit}`;
  }
}
```

```html
<span>File size: ${fileSize | fileSize:2}</span>
<!-- Output: "File size: 1.24 MB" -->
```

### Relative Time Converter

Display time relative to now (e.g., "2 hours ago"):

```typescript
@valueConverter('timeAgo')
export class TimeAgoConverter {
  readonly signals = ['time-tick'];
  
  private units = [
    { name: 'year', seconds: 31536000 },
    { name: 'month', seconds: 2592000 },
    { name: 'week', seconds: 604800 },
    { name: 'day', seconds: 86400 },
    { name: 'hour', seconds: 3600 },
    { name: 'minute', seconds: 60 },
    { name: 'second', seconds: 1 }
  ];

  toView(date: Date | string | number | null | undefined): string {
    if (!date) return '';
    
    const now = Date.now();
    const targetTime = new Date(date).getTime();
    const diffInSeconds = Math.floor((now - targetTime) / 1000);
    
    if (diffInSeconds < 0) return 'in the future';
    if (diffInSeconds < 30) return 'just now';
    
    for (const unit of this.units) {
      const count = Math.floor(diffInSeconds / unit.seconds);
      if (count >= 1) {
        return `${count} ${unit.name}${count > 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  }
}
```

### Truncate with Tooltip Converter

Truncate text with full text available on hover:

```typescript
@valueConverter('truncate')
export class TruncateConverter {
  readonly withContext = true;
  
  toView(
    text: string | null | undefined, 
    caller: { binding: any, source: unknown }, 
    maxLength = 50, 
    suffix = '...'
  ): string {
    if (!text || text.length <= maxLength) return text || '';
    
    const truncated = text.substring(0, maxLength - suffix.length) + suffix;
    
    // Add full text as tooltip if binding target supports it
    if (caller.binding?.target && 'title' in caller.binding.target) {
      caller.binding.target.title = text;
    }
    
    return truncated;
  }
}
```

### Markdown to HTML Converter

Convert markdown text to HTML (using marked library):

```typescript
import { marked } from 'marked';

@valueConverter('markdown')
export class MarkdownConverter {
  private renderer = new marked.Renderer();
  
  constructor() {
    // Configure marked for security
    marked.setOptions({
      breaks: true,
      sanitize: true
    });
  }
  
  toView(markdown: string | null | undefined): string {
    if (!markdown) return '';
    
    try {
      return marked(markdown);
    } catch (error) {
      console.error('MarkdownConverter error:', error);
      return markdown; // Fallback to original text
    }
  }
}
```

### Search Highlight Converter

Highlight search terms in text:

```typescript
@valueConverter('highlight')
export class HighlightConverter {
  toView(
    text: string | null | undefined, 
    searchTerm: string | null | undefined, 
    className = 'highlight'
  ): string {
    if (!text || !searchTerm) return text || '';
    
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  }
  
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
```

### Sort Array Converter

Sort arrays by property or custom function:

```typescript
interface SortConfig<T = unknown> {
  property?: keyof T;
  direction?: 'asc' | 'desc';
  compareFunction?: (a: T, b: T) => number;
  caseSensitive?: boolean;
}

@valueConverter('sort')
export class SortConverter {
  toView<T>(
    array: T[] | null | undefined, 
    config: SortConfig<T> | string = {}
  ): T[] {
    if (!Array.isArray(array)) return [];
    
    // Handle string property shorthand
    const sortConfig = typeof config === 'string' 
      ? { property: config as keyof T } 
      : config;
      
    const { 
      property, 
      direction = 'asc', 
      compareFunction, 
      caseSensitive = true 
    } = sortConfig;
    
    const sorted = [...array];
    
    if (compareFunction) {
      sorted.sort(compareFunction);
    } else if (property) {
      sorted.sort((a, b) => {
        let aVal = a[property] as any;
        let bVal = b[property] as any;
        
        // Handle string case sensitivity
        if (typeof aVal === 'string' && typeof bVal === 'string' && !caseSensitive) {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return direction === 'desc' ? sorted.reverse() : sorted;
  }
}
```

### Color Converter

Convert between color formats:

```typescript
@valueConverter('color')
export class ColorConverter {
  toView(
    color: string | null | undefined, 
    format: 'hex' | 'rgb' | 'hsl' = 'hex'
  ): string {
    if (!color) return '';
    
    try {
      const rgb = this.parseColor(color);
      
      switch (format) {
        case 'rgb':
          return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        case 'hsl':
          return this.rgbToHsl(rgb);
        case 'hex':
        default:
          return this.rgbToHex(rgb);
      }
    } catch (error) {
      console.warn('ColorConverter: Invalid color format', color);
      return color;
    }
  }
  
  private parseColor(color: string): { r: number; g: number; b: number } {
    // Implementation for parsing various color formats
    // This is simplified - you'd want a more robust color parsing library
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
    throw new Error(`Unsupported color format: ${color}`);
  }
  
  private rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
    return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
  }
  
  private rgbToHsl({ r, g, b }: { r: number; g: number; b: number }): string {
    // HSL conversion logic
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }
}
```

## Performance Optimization

### Caching Strategies

Implement intelligent caching for expensive operations:

```typescript
@valueConverter('expensiveFormat')
export class ExpensiveFormatConverter {
  private cache = new Map<string, string>();
  private maxCacheSize = 1000;
  
  toView(value: string, config: ComplexConfig): string {
    const cacheKey = this.createCacheKey(value, config);
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const result = this.performExpensiveTransformation(value, config);
    
    // Implement LRU cache behavior
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(cacheKey, result);
    return result;
  }
  
  private createCacheKey(value: string, config: ComplexConfig): string {
    return `${value}:${JSON.stringify(config)}`;
  }
}
```

### Lazy Evaluation

Defer expensive operations until actually needed:

```typescript
@valueConverter('lazyTransform')
export class LazyTransformConverter {
  private transformPromises = new WeakMap<object, Promise<string>>();
  
  toView(data: ComplexData): string | Promise<string> {
    if (this.transformPromises.has(data)) {
      return this.transformPromises.get(data)!;
    }
    
    const promise = this.performAsyncTransformation(data);
    this.transformPromises.set(data, promise);
    
    return promise;
  }
  
  private async performAsyncTransformation(data: ComplexData): Promise<string> {
    // Expensive async operation
    return 'transformed result';
  }
}
```

### Memory Management

Prevent memory leaks in converters:

```typescript
@valueConverter('memoryAware')
export class MemoryAwareConverter {
  private observers = new Set<() => void>();
  private cache = new Map();
  
  toView(value: string): string {
    // Clean up old observers
    this.cleanup();
    
    // Your transformation logic
    return this.transform(value);
  }
  
  private cleanup(): void {
    // Dispose observers and clear caches periodically
    if (this.observers.size > 100) {
      this.observers.forEach(cleanup => cleanup());
      this.observers.clear();
      this.cache.clear();
    }
  }
}
```

### Benchmark and Profile

Use performance measurement for optimization:

```typescript
@valueConverter('profiled')
export class ProfiledConverter {
  private performanceMetrics = new Map<string, number>();
  
  toView(value: string, operation: string): string {
    const start = performance.now();
    const result = this.performTransformation(value, operation);
    const duration = performance.now() - start;
    
    // Track performance metrics
    const key = `${operation}-${typeof value}`;
    const existing = this.performanceMetrics.get(key) || 0;
    this.performanceMetrics.set(key, (existing + duration) / 2);
    
    return result;
  }
  
  getPerformanceReport(): Record<string, number> {
    return Object.fromEntries(this.performanceMetrics);
  }
}
```

## Best Practices

### 1. Design Principles

**Single Responsibility**
```typescript
// ✅ Good - focused on one transformation
@valueConverter('capitalize')
export class CapitalizeConverter {
  toView(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

// ❌ Bad - doing too many things
@valueConverter('formatEverything')
export class FormatEverythingConverter {
  toView(value: unknown, type: string): string {
    // This converter tries to handle too many different cases
  }
}
```

**Pure Functions**
```typescript
// ✅ Good - no side effects
@valueConverter('multiply')
export class MultiplyConverter {
  toView(value: number, factor: number): number {
    return value * factor;
  }
}

// ❌ Bad - side effects
@valueConverter('logAndMultiply')  
export class LogAndMultiplyConverter {
  toView(value: number, factor: number): number {
    console.log('Processing:', value); // Side effect
    this.updateGlobalCounter(); // Side effect
    return value * factor;
  }
}
```

### 2. TypeScript Integration

**Strong Typing**
```typescript
interface DateFormatOptions {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

@valueConverter('dateFormat')
export class DateFormatConverter {
  toView(
    date: Date | string | number | null | undefined,
    options: DateFormatOptions = {}
  ): string {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    const { locale = 'en-US', ...formatOptions } = options;
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  }
}
```

**Generic Constraints**
```typescript
interface Filterable {
  [key: string]: unknown;
}

@valueConverter('filter')
export class FilterConverter {
  toView<T extends Filterable>(
    items: T[] | null | undefined,
    predicate: (item: T) => boolean
  ): T[] {
    if (!Array.isArray(items)) return [];
    return items.filter(predicate);
  }
}
```

### 3. Error Handling

**Graceful Degradation**
```typescript
@valueConverter('resilient')
export class ResilientConverter {
  toView(value: unknown, options: ConversionOptions = {}): string {
    try {
      return this.performConversion(value, options);
    } catch (error) {
      // Log for debugging but don't break the UI
      console.warn(`ResilientConverter failed for value:`, value, error);
      
      // Return safe fallback
      return options.fallback || String(value) || '';
    }
  }
  
  private performConversion(value: unknown, options: ConversionOptions): string {
    // Potentially throwing conversion logic
    throw new Error('Conversion failed');
  }
}
```

### 4. Testing Strategies

**Unit Testing**
```typescript
describe('CurrencyConverter', () => {
  let converter: CurrencyConverter;
  
  beforeEach(() => {
    converter = new CurrencyConverter();
  });
  
  it('should format USD currency correctly', () => {
    const result = converter.toView(1234.56, { locale: 'en-US', currency: 'USD' });
    expect(result).toBe('$1,234.56');
  });
  
  it('should handle null values gracefully', () => {
    const result = converter.toView(null);
    expect(result).toBe('');
  });
  
  it('should parse formatted currency back to number', () => {
    const result = converter.fromView('$1,234.56');
    expect(result).toBe(1234.56);
  });
});
```

## Troubleshooting Common Issues

### Issue: Converter Not Found

**Problem**: Template shows error "No ValueConverter named 'myConverter' was found"

**Solutions**:
1. **Import the converter**:
   ```html
   <import from="./my-converter"></import>
   ```

2. **Check decorator name**:
   ```typescript
   @valueConverter('myConverter') // Must match template usage
   export class MyConverter { }
   ```

3. **Global registration**:
   ```typescript
   // In main.ts
   import { MyConverter } from './my-converter';
   
   Aurelia.register(MyConverter).app(MyApp).start();
   ```

### Issue: Performance Problems

**Problem**: Page becomes slow with converters in loops

**Solutions**:
1. **Implement caching**:
   ```typescript
   private cache = new Map();
   toView(value: string): string {
     if (this.cache.has(value)) return this.cache.get(value);
     // ... expensive operation
   }
   ```

2. **Use signals for global updates**:
   ```typescript
   readonly signals = ['data-changed'];
   // Update only when signal is dispatched
   ```

3. **Optimize template usage**:
   ```html
   <!-- ❌ Bad - converter called for every item -->
   <div repeat.for="item of items">
     ${expensiveData | expensiveConverter}
   </div>
   
   <!-- ✅ Good - converter called once -->
   <div repeat.for="item of items">
     ${item.name}
   </div>
   <div>${expensiveData | expensiveConverter}</div>
   ```

### Issue: Context Access Not Working

**Problem**: `caller` parameter is undefined in `toView`

**Solutions**:
1. **Enable context access**:
   ```typescript
   readonly withContext = true; // Required property
   ```

2. **Correct parameter order**:
   ```typescript
   toView(value: unknown, caller: ICallerContext, ...args: unknown[]): unknown {
     // caller is always second parameter when withContext = true
   }
   ```

### Issue: Signals Not Triggering

**Problem**: Converter doesn't update when signal is dispatched

**Solutions**:
1. **Declare signals array**:
   ```typescript
   readonly signals = ['my-signal']; // Array of signal names
   ```

2. **Dispatch signals correctly**:
   ```typescript
   import { resolve } from '@aurelia/kernel';
   import { ISignaler } from '@aurelia/runtime-html';

   private signaler = resolve(ISignaler);

   updateData(): void {
     // Update data first
     this.signaler.dispatchSignal('my-signal');
   }
   ```

## Built-in Converters Reference

### Core Converters

| Converter | Purpose | Package | Parameters |
|-----------|---------|---------|-------------|
| `sanitize` | HTML sanitization | `@aurelia/runtime-html` | None (requires ISanitizer implementation) |

### I18n Converters (when `@aurelia/i18n` is installed)

| Converter | Purpose | Parameters | Example |
|-----------|---------|-------------|---------|
| `t` | Translation | `key`, `options` | `${'hello' | t}` |
| `df` | Date formatting | `options` | `${date | df:{ dateStyle: 'long' }}` |
| `nf` | Number formatting | `options` | `${price | nf:{ style: 'currency', currency: 'USD' }}` |
| `rt` | Relative time | None | `${timestamp | rt}` |

### Usage Examples

```html
<!-- Translation with parameters -->
<span>${'welcome.message' | t:{ name: userName }}</span>

<!-- Date formatting -->
<span>${createdDate | df:{ dateStyle: 'full', timeStyle: 'short' }}</span>

<!-- Currency formatting -->
<span>${price | nf:{ style: 'currency', currency: 'EUR' }}</span>

<!-- Relative time -->
<span>Posted ${postDate | rt}</span>
```

## Summary

Value converters in Aurelia 2 provide a powerful, flexible system for data transformation:

- **Bidirectional support** - Handle both display formatting and input parsing
- **Signal-based reactivity** - Automatic updates on global state changes  
- **Context awareness** - Access binding context when needed
- **Performance optimization** - Built-in caching and lazy evaluation support
- **Type safety** - Full TypeScript support with strong typing
- **Flexible registration** - Multiple registration patterns for different needs
- **Extensibility** - Easy to create custom converters for specific requirements

Use value converters to keep your templates clean and maintainable while providing rich data formatting capabilities throughout your application.

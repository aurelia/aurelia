---
description: >-
  Master the art of dynamic styling in Aurelia 2. Learn everything from basic class toggling to advanced CSS custom properties, plus component styling strategies that will make your apps both beautiful and maintainable.
---

# Class and Style Binding in Aurelia 2

Dynamic styling is a fundamental aspect of modern web applications, and Aurelia 2 provides powerful, flexible mechanisms for binding CSS classes and styles to your elements. Whether you need to toggle an active state, implement a theming system, or create responsive layouts, Aurelia's binding system makes these tasks straightforward and maintainable.

This comprehensive guide covers everything from basic class toggling to advanced styling techniques, giving you the knowledge and tools to implement any styling requirement in your Aurelia 2 applications.

## Basic Class Binding

The most common use case for dynamic styling is conditionally applying CSS classes based on component state.

### Single Class Binding: The `.class` Syntax

The `.class` binding is the foundation of dynamic styling in Aurelia. The syntax is straightforward:

```html
<button submit.class="isFormValid">Submit Form</button>
<div loading.class="isLoading">Content here...</div>
<nav-item active.class="isCurrentPage">Home</nav-item>
```

```typescript
export class MyComponent {
  isFormValid = false;
  isLoading = true;
  isCurrentPage = false;

  // When isFormValid becomes true, the 'submit' class gets added
  // When isLoading is false, the 'loading' class gets removed
}
```

**How it works**: The syntax is `className.class="booleanExpression"`. When the expression is truthy, the class is added. When it's falsy, the class is removed.

{% hint style="info" %}
**Note**: You can use any valid CSS class name, including ones with special characters like `my-awesome-class.class="isAwesome"` or Unicode characters like `✓.class="isComplete"`.
{% endhint %}

{% hint style="warning" %}
**TailwindCSS note**: Tailwind’s content scanner won’t pick up class names that only appear in attribute names. For Tailwind classes that include special characters (for example `width-[360px]`), prefer the object form with `class.bind` so the class token appears in an attribute value:

```html
<div class.bind="{ 'width-[360px]': condition }"></div>
```
{% endhint %}

### Multiple Classes: Comma-Separated Syntax

When you need to toggle multiple related classes together, you can use comma-separated class names:

```html
<div alert,alert-danger,fade-in,shake.class="hasError">
  Error message content
</div>
```

```typescript
export class ErrorComponent {
  hasError = false;

  triggerError() {
    this.hasError = true; // All four classes get added at once!
  }

  clearError() {
    this.hasError = false; // All four classes get removed together
  }
}
```

**Important**: No spaces around the commas! The parser expects `class1,class2,class3`, not `class1, class2, class3`.

## Style Binding

Aurelia provides multiple approaches for binding CSS styles, from individual properties to complex style objects.

### Single Style Properties

To bind individual CSS properties dynamically, use the `.style` syntax:

```html
<div background-color.style="themeColor">Themed content</div>
<progress width.style="progressPercentage + '%'">Loading...</progress>
<aside opacity.style="sidebarVisible ? '1' : '0.3'">Sidebar</aside>
```

```typescript
export class ThemedComponent {
  themeColor = '#3498db';
  progressPercentage = 75;
  sidebarVisible = true;
}
```

### Alternative Style Syntax

Aurelia supports two equivalent syntaxes for style binding:

```html
<!-- These do exactly the same thing! -->
<div background-color.style="myColor"></div>
<div style.background-color="myColor"></div>

<!-- Works with any CSS property -->
<div font-size.style="textSize"></div>
<div style.font-size="textSize"></div>
```

Use whichever feels more natural to you. Some developers prefer the first syntax because it reads like "set the background-color style to myColor", while others prefer the second because it's more similar to traditional CSS.

### CSS Custom Properties

Aurelia fully supports CSS custom properties (CSS variables), enabling powerful theming capabilities:

```html
<div --primary-color.style="brandColor">
  <p style="color: var(--primary-color)">Branded text!</p>
</div>

<!-- Or with the alternative syntax -->
<div style.--primary-color="brandColor">
  <p style="color: var(--primary-color)">Same result!</p>
</div>
```

```typescript
export class ThemeManager {
  brandColor = '#e74c3c';

  switchToDarkMode() {
    this.brandColor = '#34495e';
  }
}
```

### Vendor Prefixes

Aurelia supports vendor-prefixed CSS properties for cross-browser compatibility:

```html
<div -webkit-user-select.style="userSelectValue">Non-selectable content</div>
<div style.-webkit-user-select="userSelectValue">Alternative syntax</div>
```

### The `!important` Declaration

Aurelia automatically handles the `!important` CSS declaration when included in style values:

```typescript
export class ImportantComponent {
  criticalColor = 'red!important';

  // Aurelia automatically:
  // 1. Strips the !important from the value
  // 2. Sets the CSS property priority correctly
  // 3. Applies the style with proper priority
}
```

## Advanced Class Binding Techniques

Advanced class binding techniques provide greater flexibility for complex styling scenarios.

### String-Based Class Binding

For scenarios requiring more flexibility than boolean toggling, you can bind class strings directly:

```html
<div class.bind="dynamicClasses">Content with dynamic classes</div>
<div class="base-class ${additionalClasses}">Mixed static and dynamic</div>
```

```typescript
export class FlexibleComponent {
  dynamicClasses = 'btn btn-primary active';
  additionalClasses = 'fade-in hover-effect';

  updateClasses() {
    this.dynamicClasses = `btn btn-${this.isSuccess ? 'success' : 'danger'}`;
  }
}
```

**When to use what**:
- `.class` syntax: When you need boolean toggling of specific classes
- `class.bind`: When you need to build class strings dynamically
- Template interpolation: When you want to mix static and dynamic classes

## Advanced Style Binding

Advanced style binding techniques enable sophisticated styling patterns and better code organization.

### Object-Based Style Binding

For complex styling scenarios, bind an entire style object:

```html
<div style.bind="cardStyles">Beautifully styled card</div>
```

```typescript
export class StylishComponent {
  cardStyles = {
    backgroundColor: '#ffffff',
    border: '1px solid #e1e1e1',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  switchToNightMode() {
    this.cardStyles = {
      ...this.cardStyles,
      backgroundColor: '#2d3748',
      color: '#ffffff',
      borderColor: '#4a5568'
    };
  }
}
```

### String Interpolation

Combine static and dynamic styles using template interpolation:

```html
<div style="padding: 16px; background: ${bgColor}; transform: scale(${scale})">
  Combined static and dynamic styles
</div>
```

```typescript
export class HybridComponent {
  bgColor = 'linear-gradient(45deg, #3498db, #2ecc71)';
  scale = 1.0;

  animateIn() {
    this.scale = 1.1;
  }
}
```

### Computed Style Properties

Create dynamic styles based on component state:

```typescript
export class ComputedStyleComponent {
  progress = 0.7;
  theme = 'light';

  get progressBarStyles() {
    return {
      width: `${this.progress * 100}%`,
      backgroundColor: this.theme === 'dark' ? '#3498db' : '#2ecc71',
      transition: 'all 0.3s ease'
    };
  }
}
```

```html
<div class="progress-container">
  <div class="progress-bar" style.bind="progressBarStyles"></div>
</div>
```

## Component Styling Strategies

Beyond template bindings, Aurelia provides several approaches for styling components themselves.

### Convention-Based Styling

Aurelia automatically imports stylesheets that match your component names:

```
my-awesome-component.ts    (component logic)
my-awesome-component.html  (template)
my-awesome-component.css   (styles - automatically imported!)
```

This means you can focus on writing CSS without worrying about imports:

```css
/* my-awesome-component.css */
:host {
  display: block;
  padding: 16px;
}

.content {
  background: linear-gradient(45deg, #3498db, #2ecc71);
  border-radius: 8px;
}
```

### Shadow DOM

For complete style isolation, use Shadow DOM:

```typescript
import { useShadowDOM } from 'aurelia';

@useShadowDOM()
export class IsolatedComponent {
  // Styles are completely encapsulated
}
```

**Shadow DOM Configuration Options**:

```typescript
// Open mode (default) - JavaScript can access shadowRoot
@useShadowDOM({ mode: 'open' })
export class OpenComponent { }

// Closed mode - shadowRoot is not accessible
@useShadowDOM({ mode: 'closed' })
export class ClosedComponent { }

// To use Light DOM (no Shadow DOM), simply don't use the decorator
export class LightDomComponent { }
```

### Shadow DOM Special Selectors

Shadow DOM provides special CSS selectors for enhanced styling control:

```css
/* Style the component host element */
:host {
  display: block;
  border: 1px solid #e1e1e1;
}

/* Style the host when it has a specific class */
:host(.active) {
  background-color: #f8f9fa;
}

/* Style the host based on ancestor context */
:host-context(.dark-theme) {
  background-color: #2d3748;
  color: #ffffff;
}

/* Style slotted content */
::slotted(.special-content) {
  font-weight: bold;
  color: #3498db;
}
```

### Global Shared Styles in Shadow DOM

To share styles across Shadow DOM components, configure shared styles in your application:

```typescript
// main.ts
import Aurelia, { StyleConfiguration } from 'aurelia';
import { MyApp } from './my-app';
import bootstrap from 'bootstrap/dist/css/bootstrap.css';
import customTheme from './theme.css';

Aurelia
  .register(StyleConfiguration.shadowDOM({
    sharedStyles: [bootstrap, customTheme]
  }))
  .app(MyApp)
  .start();
```

### CSS Modules

CSS Modules provide scoped styling by transforming class names to unique identifiers at build time. Aurelia provides the `cssModules()` helper to integrate CSS Modules with your components:

```typescript
import { customElement, cssModules } from 'aurelia';

// Import the CSS module (bundler provides the class mapping)
import styles from './my-component.module.css';
// styles = { title: 'title_abc123', button: 'button_def456' }

@customElement({
  name: 'my-component',
  template: `
    <h1 class="title">My Title</h1>
    <button class="button">Click Me</button>
  `,
  dependencies: [cssModules(styles)]
})
export class MyComponent {}
```

The `cssModules()` helper transforms class names in your template at compile time. In the example above, `class="title"` becomes `class="title_abc123"`.

**Key features:**
- Works with static classes, `class.bind`, and interpolation (`class="some ${myClass}"`)
- Supports multi-class binding syntax (`class1,class2.class="condition"`)
- Each component must register its own `cssModules()` - mappings do not inherit to child components

For more details on using CSS Modules with Shadow DOM, see the [Shadow DOM documentation](shadow-dom.md#using-css-modules-with-shadow-dom).

## Real-World Examples and Patterns

The following examples demonstrate practical applications of class and style binding techniques in common scenarios.

### Responsive Design with Dynamic Classes

```typescript
export class ResponsiveComponent {
  screenSize = 'desktop';

  get responsiveClasses() {
    return {
      'mobile-layout': this.screenSize === 'mobile',
      'tablet-layout': this.screenSize === 'tablet',
      'desktop-layout': this.screenSize === 'desktop'
    };
  }

  @listener('resize', window)
  updateScreenSize() {
    const width = window.innerWidth;
    if (width < 768) {
      this.screenSize = 'mobile';
    } else if (width < 1024) {
      this.screenSize = 'tablet';
    } else {
      this.screenSize = 'desktop';
    }
  }
}
```

```html
<div class.bind="responsiveClasses">
  <header class="header ${screenSize === 'mobile' ? 'mobile-header' : ''}">
    <!-- Responsive header -->
  </header>
</div>
```

### Theme System with CSS Variables

```typescript
export class ThemeManager {
  currentTheme = 'light';

  get themeVariables() {
    const themes = {
      light: {
        '--primary-color': '#3498db',
        '--background-color': '#ffffff',
        '--text-color': '#333333'
      },
      dark: {
        '--primary-color': '#2ecc71',
        '--background-color': '#2d3748',
        '--text-color': '#ffffff'
      }
    };

    return themes[this.currentTheme];
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
  }
}
```

```html
<div style.bind="themeVariables" class="theme-container">
  <button
    style="background: var(--primary-color); color: var(--text-color)"
    click.trigger="toggleTheme()">
    Toggle Theme
  </button>
</div>
```

### Loading States with Animations

```typescript
export class LoadingComponent {
  isLoading = false;
  loadingProgress = 0;

  async loadData() {
    this.isLoading = true;
    this.loadingProgress = 0;

    // Simulate loading with progress
    const interval = setInterval(() => {
      this.loadingProgress += 10;
      if (this.loadingProgress >= 100) {
        clearInterval(interval);
        this.isLoading = false;
      }
    }, 100);
  }

  get progressBarStyle() {
    return {
      width: `${this.loadingProgress}%`,
      transition: 'width 0.1s ease'
    };
  }
}
}
```

```html
<div loading.class="isLoading">
  <div class="progress-container" show.bind="isLoading">
    <div class="progress-bar" style.bind="progressBarStyle"></div>
  </div>

  <div class="content" hide.bind="isLoading">
    <!-- Your actual content -->
  </div>
</div>
```

### Complex Form Validation Styling

```typescript
export class ValidationForm {
  email = '';
  password = '';

  get emailValidation() {
    return {
      isEmpty: !this.email,
      isInvalid: this.email && !this.isValidEmail(this.email),
      isValid: this.email && this.isValidEmail(this.email)
    };
  }

  get passwordValidation() {
    return {
      isEmpty: !this.password,
      isTooShort: this.password && this.password.length < 8,
      isValid: this.password && this.password.length >= 8
    };
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

```html
<form>
  <div class="field">
    <input
      type="email"
      value.bind="email"
      empty.class="emailValidation.isEmpty"
      invalid.class="emailValidation.isInvalid"
      valid.class="emailValidation.isValid">

    <span
      class="error-message"
      show.bind="emailValidation.isInvalid">
      Please enter a valid email
    </span>

    <span
      class="success-indicator"
      show.bind="emailValidation.isValid">
      ✓
    </span>
  </div>
</form>
```

## Performance Tips and Best Practices

### Do's and Don'ts

**✅ DO:**
- Use `.class` for simple boolean toggling
- Use CSS custom properties for theming
- Prefer computed getters for complex style calculations
- Use Shadow DOM for true component isolation
- Cache complex style objects when possible

**❌ DON'T:**
- Inline complex style calculations in templates
- Use string concatenation for class names when `.class` will do
- Forget about CSS specificity when using `!important`
- Mix too many styling approaches in one component

### Performance Optimization

```typescript
export class OptimizedComponent {
  private _cachedStyles: any = null;
  private _lastTheme: string = '';

  // Cache expensive style calculations
  get expensiveStyles() {
    if (this._cachedStyles && this._lastTheme === this.currentTheme) {
      return this._cachedStyles;
    }

    this._cachedStyles = this.calculateComplexStyles();
    this._lastTheme = this.currentTheme;
    return this._cachedStyles;
  }

  private calculateComplexStyles() {
    // Your expensive calculations here
    return { /* styles */ };
  }
}
```

## Troubleshooting Common Issues

### "My styles aren't updating!"

**Problem**: Styles don't change when data changes.
**Solution**: Make sure you're using proper binding syntax and that your properties are observable.

```typescript
// ❌ This won't trigger updates
export class BadComponent {
  styles = { color: 'red' };

  changeColor() {
    this.styles.color = 'blue'; // Mutation won't be detected
  }
}

// ✅ This will work
export class GoodComponent {
  styles = { color: 'red' };

  changeColor() {
    this.styles = { ...this.styles, color: 'blue' }; // New object
  }
}
```

### "My CSS classes have weird names!"

**Problem**: Using CSS Modules and seeing transformed class names.
**Solution**: This is expected behavior! CSS Modules transform class names to ensure uniqueness.

### "Shadow DOM is blocking my global styles!"

**Problem**: Global CSS frameworks aren't working inside Shadow DOM components.
**Solution**: Configure shared styles in your app startup.

## Migration and Compatibility

### Coming from Aurelia 1?

The syntax is mostly the same, with some improvements:

```html
<!-- Aurelia 1 & 2 (still works) -->
<div class.bind="myClasses"></div>

<!-- Aurelia 2 (new!) -->
<div loading,spinner,active.class="isLoading"></div>
```

### Browser Support

All binding features work in modern browsers. For older browsers:
- Shadow DOM requires a polyfill for older browsers
- CSS Modules work everywhere (they're processed at build time)

## Summary

This guide has covered the complete range of class and style binding capabilities in Aurelia 2. Key takeaways include:

1. **Basic class binding** - Use `.class` syntax for simple boolean toggling
2. **Multiple class binding** - Leverage comma-separated syntax for related classes
3. **Style property binding** - Apply individual CSS properties with `.style` syntax
4. **Advanced techniques** - Implement complex styling with objects, interpolation, and CSS variables
5. **Component styling** - Choose appropriate encapsulation strategies for your use case

These techniques provide the foundation for building maintainable, dynamic user interfaces that respond effectively to application state changes.

---

**Additional Resources**: For more information on binding syntax, see the [template syntax guide](../templates/template-syntax/). To understand when styles are applied, refer to the [component lifecycles](./component-lifecycles.md) documentation.

# Accessibility Guide

Build inclusive Aurelia 2 applications that work for everyone, including users with disabilities.

{% hint style="success" %}
**What you'll learn...**

* How to use ARIA attributes in Aurelia templates
* Keyboard navigation patterns and implementation
* Focus management techniques, especially in routed applications
* Screen reader support best practices
* Accessibility testing strategies
* WCAG 2.1 compliance guidelines
{% endhint %}

## Table of Contents

- [Why Accessibility Matters](#why-accessibility-matters)
- [ARIA in Aurelia Templates](#aria-in-aurelia-templates)
- [Semantic HTML](#semantic-html)
- [Keyboard Navigation](#keyboard-navigation)
- [Focus Management](#focus-management)
- [Screen Reader Support](#screen-reader-support)
- [Forms and Validation](#forms-and-validation)
- [Dynamic Content](#dynamic-content)
- [Testing for Accessibility](#testing-for-accessibility)
- [WCAG 2.1 Compliance Checklist](#wcag-21-compliance-checklist)

---

## Why Accessibility Matters

Web accessibility ensures that people with disabilities can perceive, understand, navigate, and interact with your application.

**Benefits**:
- 🌍 **Inclusivity**: 15% of the world's population has some form of disability
- ⚖️ **Legal compliance**: Many regions require accessible public websites (ADA, Section 508, EAA)
- 📱 **Better UX for everyone**: Keyboard navigation, clear labels, and good contrast help all users
- 🔍 **SEO improvements**: Semantic HTML and proper structure improve search rankings
- 💼 **Expanded market**: Don't exclude potential users and customers

{% hint style="info" %}
**WCAG Standards**

The Web Content Accessibility Guidelines (WCAG) 2.1 define three conformance levels:
- **Level A**: Minimum accessibility (serious barriers removed)
- **Level AA**: Recommended target for most websites (addresses major barriers)
- **Level AAA**: Highest level (not always achievable for all content)

This guide focuses on achieving **WCAG 2.1 Level AA** compliance.
{% endhint %}

---

## ARIA in Aurelia Templates

ARIA (Accessible Rich Internet Applications) attributes provide semantic meaning to assistive technologies when HTML alone is insufficient.

### Basic ARIA Attribute Binding

Bind ARIA attributes just like any other HTML attribute in Aurelia:

```html
<!-- Static ARIA attributes -->
<button aria-label="Close dialog">×</button>

<!-- Dynamic ARIA attributes -->
<button aria-label.bind="closeLabel">×</button>
<div role="alert" aria-live="polite">${statusMessage}</div>

<!-- Boolean ARIA attributes -->
<button aria-pressed.bind="isActive">Toggle</button>
<div aria-expanded.bind="isExpanded">Menu</div>
<input aria-invalid.bind="hasError">
```

{% hint style="warning" %}
**ARIA Attribute Naming**

In Aurelia templates, use kebab-case for ARIA attributes (e.g., `aria-label`, `aria-describedby`), just like standard HTML. The framework handles the attribute mapping correctly.
{% endhint %}

### Common ARIA Patterns

#### Expandable Sections (Accordion)

```typescript
// src/components/accordion-item.ts
import { bindable } from '@aurelia/runtime-html';

export class AccordionItem {
  @bindable title: string;
  @bindable expanded: boolean = false;

  private headingId = `accordion-heading-${Math.random().toString(36).substr(2, 9)}`;
  private panelId = `accordion-panel-${Math.random().toString(36).substr(2, 9)}`;

  toggle() {
    this.expanded = !this.expanded;
  }
}
```

```html
<!-- src/components/accordion-item.html -->
<div class="accordion-item">
  <h3>
    <button
      id.bind="headingId"
      aria-expanded.bind="expanded"
      aria-controls.bind="panelId"
      click.trigger="toggle()"
      class="accordion-trigger">
      ${title}
      <span class="accordion-icon" aria-hidden="true">
        ${expanded ? '−' : '+'}
      </span>
    </button>
  </h3>

  <div
    id.bind="panelId"
    role="region"
    aria-labelledby.bind="headingId"
    class="accordion-panel"
    show.bind="expanded">
    <slot></slot>
  </div>
</div>
```

**Usage**:
```html
<accordion-item title="Section 1" expanded.bind="true">
  Content for section 1
</accordion-item>
```

#### Modal Dialog

```typescript
// src/components/modal-dialog.ts
import { bindable, INode, IPlatform } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export class ModalDialog {
  @bindable title: string;
  @bindable open: boolean = false;

  private previousActiveElement: HTMLElement | null = null;
  private dialogElement!: HTMLElement;
  private readonly element = resolve(INode);
  private readonly platform = resolve(IPlatform);
  private removeTabListener?: () => void;

  binding() {
    if (this.open) {
      this.showDialog();
    }
  }

  openChanged(newValue: boolean) {
    if (newValue) {
      this.showDialog();
    } else {
      this.hideDialog();
    }
  }

  private showDialog() {
    // Store the element that had focus before opening
    const doc = this.platform.document;
    this.previousActiveElement = (doc?.activeElement as HTMLElement) ?? null;

    // Focus the dialog
    setTimeout(() => {
      this.dialogElement?.focus();
    }, 0);

    // Prevent body scroll
    if (doc?.body) {
      doc.body.style.overflow = 'hidden';
    }

    // Trap focus within dialog
    this.trapFocus();
  }

  private hideDialog() {
    // Restore focus to previous element
    this.previousActiveElement?.focus();
    this.previousActiveElement = null;

    // Restore body scroll
    const doc = this.platform.document;
    if (doc?.body) {
      doc.body.style.overflow = '';
    }
    this.removeTabListener?.();
    this.removeTabListener = undefined;
  }

  private trapFocus() {
    if (!this.dialogElement) return;

    const focusableElements = this.dialogElement.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const doc = this.platform.document;
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (doc?.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (doc?.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    this.removeTabListener?.();
    this.dialogElement.addEventListener('keydown', handleTab);
    this.removeTabListener = () => this.dialogElement.removeEventListener('keydown', handleTab);
  }

  close() {
    this.open = false;
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.close();
    }
  }
}
```

```html
<!-- src/components/modal-dialog.html -->
<div
  if.bind="open"
  class="modal-overlay"
  click.trigger="close()"
  role="presentation">

  <div
    ref="dialogElement"
    role="dialog"
    aria-modal="true"
    aria-labelledby="dialog-title"
    tabindex="-1"
    class="modal-dialog"
    click.trigger="$event.stopPropagation()"
    keydown.trigger="handleKeydown($event)">

    <div class="modal-header">
      <h2 id="dialog-title">${title}</h2>
      <button
        type="button"
        aria-label="Close dialog"
        class="modal-close"
        click.trigger="close()">
        ×
      </button>
    </div>

    <div class="modal-body">
      <slot></slot>
    </div>

    <div class="modal-footer">
      <slot name="footer">
        <button click.trigger="close()">Close</button>
      </slot>
    </div>
  </div>
</div>
```

#### Tab Panel (Tabbed Interface)

```typescript
// src/components/tabs.ts
import { bindable } from '@aurelia/runtime-html';

export class Tabs {
  @bindable tabs: Array<{ id: string; label: string; content: string }> = [];
  @bindable activeTab: string;

  binding() {
    if (!this.activeTab && this.tabs.length > 0) {
      this.activeTab = this.tabs[0].id;
    }
  }

  selectTab(tabId: string) {
    this.activeTab = tabId;
  }

  handleKeydown(event: KeyboardEvent, currentIndex: number) {
    let nextIndex: number | null = null;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % this.tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = this.tabs.length - 1;
        break;
      default:
        return;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      this.selectTab(this.tabs[nextIndex].id);
      // Focus the newly selected tab
      const tabButton = document.querySelector(
        `button[aria-controls="${this.tabs[nextIndex].id}"]`
      ) as HTMLElement;
      tabButton?.focus();
    }
  }
}
```

```html
<!-- src/components/tabs.html -->
<div class="tabs">
  <div role="tablist" aria-label="Content sections">
    <button
      repeat.for="tab of tabs"
      type="button"
      role="tab"
      id="tab-${tab.id}"
      aria-selected.bind="activeTab === tab.id"
      aria-controls.bind="tab.id"
      tabindex.bind="activeTab === tab.id ? 0 : -1"
      click.trigger="selectTab(tab.id)"
      keydown.trigger="handleKeydown($event, $index)"
      class="tab ${activeTab === tab.id ? 'active' : ''}">
      ${tab.label}
    </button>
  </div>

  <div
    repeat.for="tab of tabs"
    id.bind="tab.id"
    role="tabpanel"
    aria-labelledby="tab-${tab.id}"
    tabindex="0"
    show.bind="activeTab === tab.id"
    class="tab-panel">
    ${tab.content}
  </div>
</div>
```

**Usage**:
```html
<tabs tabs.bind="contentTabs" active-tab.bind="currentTab"></tabs>
```

```typescript
export class MyPage {
  contentTabs = [
    { id: 'overview', label: 'Overview', content: 'Overview content...' },
    { id: 'details', label: 'Details', content: 'Detailed information...' },
    { id: 'settings', label: 'Settings', content: 'Settings panel...' }
  ];
  currentTab = 'overview';
}
```

---

## Semantic HTML

Use semantic HTML elements instead of generic `<div>` and `<span>` whenever possible. Semantic elements provide built-in accessibility.

### Semantic Elements in Aurelia

```html
<!-- Good: Semantic HTML -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Article Title</h1>
    <p>Article content...</p>
  </article>

  <aside aria-label="Related content">
    <h2>Related Articles</h2>
    <ul>...</ul>
  </aside>
</main>

<footer>
  <p>&copy; 2025 Company Name</p>
</footer>

<!-- Bad: Generic div soup -->
<div class="header">
  <div class="nav">...</div>
</div>
<div class="main">
  <div class="article">...</div>
</div>
```

### Landmark Regions

Landmark regions help screen reader users navigate your application:

```html
<!-- Header landmark (implicit with <header> in <body>) -->
<header>
  <h1>Site Title</h1>
</header>

<!-- Navigation landmark (implicit with <nav>) -->
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

<!-- Main content landmark (implicit with <main>) -->
<main>
  <h1>Page Title</h1>
  <!-- Use <section> with aria-label or heading for subsections -->
  <section aria-labelledby="news-heading">
    <h2 id="news-heading">Latest News</h2>
    <!-- Content -->
  </section>
</main>

<!-- Complementary landmark (implicit with <aside>) -->
<aside aria-label="Sidebar">
  <!-- Sidebar content -->
</aside>

<!-- Footer landmark (implicit with <footer> in <body>) -->
<footer>
  <p>Footer content</p>
</footer>
```

### Headings Hierarchy

Maintain a logical heading hierarchy (h1 → h2 → h3, never skip levels):

```html
<!-- Good: Logical hierarchy -->
<h1>Page Title</h1>
  <h2>Section 1</h2>
    <h3>Subsection 1.1</h3>
    <h3>Subsection 1.2</h3>
  <h2>Section 2</h2>

<!-- Bad: Skipped levels -->
<h1>Page Title</h1>
  <h3>Section (should be h2)</h3>
    <h5>Subsection (should be h3)</h5>
```

{% hint style="warning" %}
**Only One h1 Per Page**

Each page should have exactly one `<h1>` that describes the main content. In routed applications, each routed component's main content should start with an `<h1>`.
{% endhint %}

---

## Keyboard Navigation

All interactive elements must be operable via keyboard alone (no mouse required).

### Tab Order and tabindex

**Default Tab Order**: Interactive elements (`<a>`, `<button>`, `<input>`, etc.) are focusable by default in document order.

```html
<!-- Natural tab order (1 → 2 → 3) -->
<button>First</button>
<input type="text">
<button>Third</button>
```

**tabindex Values**:
- `tabindex="0"`: Element is focusable in natural tab order
- `tabindex="-1"`: Element is programmatically focusable but not in tab order
- `tabindex="1+"`: **Avoid!** Overrides natural tab order (confusing for users)

```html
<!-- Make a non-interactive element focusable -->
<div tabindex="0" role="button" click.trigger="handleClick()">
  Custom Button
</div>

<!-- Remove from tab order but allow programmatic focus -->
<div tabindex="-1" ref="skipTarget">
  Skip link target
</div>
```

{% hint style="danger" %}
**Avoid Positive tabindex Values**

Using `tabindex="1"`, `tabindex="2"`, etc. creates a confusing tab order. Let the natural document order dictate focus flow.
{% endhint %}

### Keyboard Event Handling

Handle keyboard events for custom interactive components:

```typescript
// src/components/custom-button.ts
export class CustomButton {
  handleClick() {
    console.log('Button clicked');
  }

  handleKeydown(event: KeyboardEvent) {
    // Activate on Space or Enter (like a real button)
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.handleClick();
    }
  }
}
```

```html
<!-- src/components/custom-button.html -->
<div
  role="button"
  tabindex="0"
  click.trigger="handleClick()"
  keydown.trigger="handleKeydown($event)"
  class="custom-button">
  <slot></slot>
</div>
```

{% hint style="info" %}
**When to Use Native Elements**

Before creating custom components, consider using native elements:
- Use `<button>` instead of `<div role="button">`
- Use `<a href="...">` for navigation
- Use `<input type="checkbox">` instead of custom toggles

Native elements have built-in keyboard support, focus management, and screen reader compatibility.
{% endhint %}

### Skip Links

Provide skip links to help keyboard users bypass repetitive navigation:

```html
<!-- src/my-app.html -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<header>
  <nav>
    <!-- Navigation links -->
  </nav>
</header>

<main id="main-content" tabindex="-1">
  <au-viewport></au-viewport>
</main>
```

```css
/* Show skip link only when focused */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Keyboard Shortcuts

Implement keyboard shortcuts for common actions:

```typescript
// src/my-app.ts
import { resolve } from '@aurelia/kernel';
import { IRouter } from '@aurelia/router';

export class MyApp {
  private router = resolve(IRouter);

  attached() {
    document.addEventListener('keydown', this.handleGlobalKeydown);
  }

  detaching() {
    document.removeEventListener('keydown', this.handleGlobalKeydown);
  }

  private handleGlobalKeydown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + K: Search
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.openSearch();
    }

    // Ctrl/Cmd + /: Show keyboard shortcuts help
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      this.showKeyboardHelp();
    }
  };

  private openSearch() {
    // Open search modal
  }

  private showKeyboardHelp() {
    // Show keyboard shortcuts help
  }
}
```

**Best practices for keyboard shortcuts**:
- Use standard shortcuts (Ctrl+C, Ctrl+V, etc.)
- Provide a way to discover shortcuts (help modal, documentation)
- Don't override browser shortcuts
- Test with screen readers (some shortcuts conflict)

---

## Focus Management

Focus management is critical for keyboard users and screen reader users, especially in dynamic applications.

### Focus Indication (Visual Focus Styles)

Always provide visible focus indicators. Never remove focus outlines without providing an alternative.

```css
/* Good: Custom focus styles */
button:focus,
a:focus {
  outline: 2px solid #4A90E2;
  outline-offset: 2px;
}

/* Bad: Removes focus without replacement */
button:focus {
  outline: none; /* Accessibility violation! */
}

/* Acceptable: Remove default, add custom */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.5);
}
```

{% hint style="warning" %}
**Focus Indicators Required**

WCAG 2.1 requires a visible focus indicator with at least 3:1 contrast ratio against the background. Never hide focus styles without providing equally visible alternatives.
{% endhint %}

### Managing Focus on Route Changes

When navigating between routes, focus should move to the new content:

```typescript
// src/hooks/focus-route-hook.ts
import { IRouter, RouteNode } from '@aurelia/router';
import { AppTask } from '@aurelia/kernel';

export const FocusRouteHook = AppTask.hydrating(IRouter, router => {
  router.addHook((instructions) => {
    // After navigation completes, focus the main content
    setTimeout(() => {
      const mainContent = document.querySelector('main') as HTMLElement;
      if (mainContent) {
        // Make programmatically focusable
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        // Optionally remove tabindex after focus
        mainContent.addEventListener('blur', () => {
          mainContent.removeAttribute('tabindex');
        }, { once: true });
      }
    }, 0);
  });
});
```

Register the hook:

```typescript
// src/main.ts
import Aurelia from 'aurelia';
import { FocusRouteHook } from './hooks/focus-route-hook';

Aurelia
  .register(FocusRouteHook)
  .app(component)
  .start();
```

### Focus Management in Modals

See the [Modal Dialog example](#modal-dialog) above for proper focus management:
1. Store the previously focused element
2. Move focus into the dialog when opened
3. Trap focus within the dialog
4. Restore focus when closed

### Focus Management for Dynamic Content

When dynamically adding content, manage focus appropriately:

```typescript
export class TodoList {
  todos: Array<{ id: number; text: string }> = [];
  private nextId = 1;

  async addTodo(text: string) {
    const newTodo = { id: this.nextId++, text };
    this.todos.push(newTodo);

    // Focus the new todo item
    await this.focusElement(`#todo-${newTodo.id}`);
  }

  async removeTodo(id: number, index: number) {
    this.todos = this.todos.filter(t => t.id !== id);

    // Focus the next item, or previous if removing the last one
    const nextIndex = Math.min(index, this.todos.length - 1);
    if (nextIndex >= 0) {
      await this.focusElement(`#todo-${this.todos[nextIndex].id}`);
    } else {
      // No todos left, focus the add button
      await this.focusElement('#add-todo-button');
    }
  }

  private async focusElement(selector: string) {
    // Wait for next frame to ensure element is in DOM
    await new Promise(resolve => requestAnimationFrame(resolve));
    const element = document.querySelector(selector) as HTMLElement;
    element?.focus();
  }
}
```

---

## Screen Reader Support

Screen readers convert UI elements into speech or braille. Ensure your app provides a good screen reader experience.

### Live Regions (ARIA Live)

Announce dynamic content changes to screen readers:

```html
<!-- Polite: Announce when user is idle -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  ${statusMessage}
</div>

<!-- Assertive: Announce immediately (use sparingly) -->
<div aria-live="assertive" aria-atomic="true" class="sr-only">
  ${errorMessage}
</div>
```

**ARIA Live Attributes**:
- `aria-live="off"`: No announcements (default)
- `aria-live="polite"`: Announce when convenient (don't interrupt)
- `aria-live="assertive"`: Announce immediately (interrupts current speech)
- `aria-atomic="true"`: Announce entire region content
- `aria-atomic="false"`: Announce only changed nodes (default)

**Example: Status announcements**

```typescript
export class DataTable {
  private items: any[] = [];
  private statusMessage: string = '';

  async loadData() {
    this.statusMessage = 'Loading data...';

    try {
      this.items = await this.fetchItems();
      this.statusMessage = `Loaded ${this.items.length} items`;
    } catch (error) {
      this.statusMessage = 'Failed to load data';
    }
  }
}
```

```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  ${statusMessage}
</div>

<button click.trigger="loadData()">Load Data</button>

<table>
  <tr repeat.for="item of items">
    <td>${item.name}</td>
  </tr>
</table>
```

### Visually Hidden (Screen Reader Only) Content

Use a CSS class to hide content visually while keeping it accessible to screen readers:

```css
.sr-only,
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**Usage**:
```html
<!-- Icon-only button with screen reader label -->
<button aria-label="Delete item">
  <span class="icon-trash" aria-hidden="true"></span>
  <span class="sr-only">Delete item</span>
</button>

<!-- Table with hidden headers for screen readers -->
<table>
  <thead class="sr-only">
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <!-- Data rows -->
  </tbody>
</table>
```

### ARIA Labels and Descriptions

Provide accessible names and descriptions for elements:

```html
<!-- aria-label: Provides accessible name -->
<button aria-label="Close dialog">×</button>

<!-- aria-labelledby: Reference another element for accessible name -->
<section aria-labelledby="section-heading">
  <h2 id="section-heading">User Profile</h2>
  <!-- Content -->
</section>

<!-- aria-describedby: Additional description -->
<input
  type="password"
  aria-label="Password"
  aria-describedby="password-requirements">
<div id="password-requirements" class="help-text">
  Must be at least 8 characters with 1 number
</div>
```

**When to use each**:
- `aria-label`: Simple label for icon buttons, landmarks without visible labels
- `aria-labelledby`: Reference visible text as the label
- `aria-describedby`: Additional context or instructions

---

## Forms and Validation

Accessible forms are critical for all users.

### Form Labels

Every form field needs an associated label:

```html
<!-- Good: Explicit label association -->
<label for="username">Username</label>
<input type="text" id="username" value.bind="username">

<!-- Good: Implicit label association -->
<label>
  Email
  <input type="email" value.bind="email">
</label>

<!-- Bad: No label (accessibility violation) -->
<input type="text" placeholder="Enter your name">
```

### Required Fields

Indicate required fields both visually and semantically:

```html
<label for="email">
  Email
  <span aria-label="required">*</span>
</label>
<input
  type="email"
  id="email"
  value.bind="email"
  required
  aria-required="true">

<style>
  /* Visual indication of required fields */
  [required] {
    border-left: 3px solid #D00;
  }
</style>
```

### Validation Errors

Associate error messages with form fields using `aria-describedby`:

```typescript
// src/components/login-form.ts
import { newInstanceForScope, resolve } from '@aurelia/kernel';
import { IValidationRules } from '@aurelia/validation';
import { IValidationController } from '@aurelia/validation-html';

export class LoginForm {
  private username = '';
  private password = '';
  private errors: { [key: string]: string } = {};
  private validation = resolve(newInstanceForScope(IValidationController));
  private validationRules = resolve(IValidationRules);

  constructor() {
    this.validationRules
      .on(this)
      .ensure('username')
        .required()
        .withMessage('Username is required')
      .ensure('password')
        .required()
        .withMessage('Password is required')
        .minLength(8)
        .withMessage('Password must be at least 8 characters');
  }

  async submit() {
    const result = await this.validation.validate();

    this.errors = {};
    if (!result.valid) {
      result.results.forEach(r => {
        if (!r.valid && r.propertyName) {
          this.errors[r.propertyName] = r.message;
        }
      });
    } else {
      // Submit form
    }
  }
}
```

```html
<!-- src/components/login-form.html -->
<form submit.trigger="submit()">
  <div class="form-field">
    <label for="username">Username</label>
    <input
      type="text"
      id="username"
      value.bind="username"
      aria-invalid.bind="!!errors.username"
      aria-describedby="username-error">
    <div
      if.bind="errors.username"
      id="username-error"
      class="error"
      role="alert">
      ${errors.username}
    </div>
  </div>

  <div class="form-field">
    <label for="password">Password</label>
    <input
      type="password"
      id="password"
      value.bind="password"
      aria-invalid.bind="!!errors.password"
      aria-describedby="password-error">
    <div
      if.bind="errors.password"
      id="password-error"
      class="error"
      role="alert">
      ${errors.password}
    </div>
  </div>

  <button type="submit">Log In</button>
</form>
```

**Key accessibility features**:
- `aria-invalid="true"` when field has error
- `aria-describedby` references error message
- `role="alert"` on error to announce to screen readers
- Visual error styling

**See**: [Validation documentation](../aurelia-packages/validation/README.md)

### Fieldsets and Legends

Group related form fields with `<fieldset>` and `<legend>`:

```html
<fieldset>
  <legend>Shipping Address</legend>

  <label for="street">Street</label>
  <input type="text" id="street" value.bind="address.street">

  <label for="city">City</label>
  <input type="text" id="city" value.bind="address.city">

  <label for="zip">ZIP Code</label>
  <input type="text" id="zip" value.bind="address.zip">
</fieldset>
```

---

## Dynamic Content

Handle accessibility for dynamically loaded or changing content.

### Loading States

Announce loading states to screen readers:

```html
<div if.bind="loading" aria-live="polite" aria-busy="true">
  Loading data...
</div>

<div if.bind="!loading && items.length > 0">
  <div aria-live="polite" class="sr-only">
    Loaded ${items.length} items
  </div>

  <ul>
    <li repeat.for="item of items">${item.name}</li>
  </ul>
</div>

<div if.bind="!loading && items.length === 0" role="status">
  No items found
</div>
```

### Infinite Scroll / Lazy Loading

Announce newly loaded content:

```typescript
export class InfiniteList {
  private items: any[] = [];
  private loading = false;
  private statusMessage = '';

  async loadMore() {
    this.loading = true;
    this.statusMessage = 'Loading more items...';

    const newItems = await this.fetchItems();
    this.items.push(...newItems);

    this.loading = false;
    this.statusMessage = `Loaded ${newItems.length} more items. Total: ${this.items.length}`;
  }
}
```

```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  ${statusMessage}
</div>

<ul>
  <li repeat.for="item of items">${item.name}</li>
</ul>

<button
  click.trigger="loadMore()"
  disabled.bind="loading"
  aria-busy.bind="loading">
  ${loading ? 'Loading...' : 'Load More'}
</button>
```

### Client-Side Routing Announcements

Announce route changes to screen readers:

```typescript
// src/services/route-announcer.ts
import { IRouter, RouteNode } from '@aurelia/router';
import { AppTask } from '@aurelia/kernel';

export class RouteAnnouncer {
  private announcement = '';
  private announcementElement: HTMLElement | null = null;

  attached() {
    // Create announcement element
    this.announcementElement = document.createElement('div');
    this.announcementElement.setAttribute('role', 'status');
    this.announcementElement.setAttribute('aria-live', 'polite');
    this.announcementElement.setAttribute('aria-atomic', 'true');
    this.announcementElement.className = 'sr-only';
    document.body.appendChild(this.announcementElement);
  }

  announce(message: string) {
    this.announcement = message;
    if (this.announcementElement) {
      this.announcementElement.textContent = message;
    }
  }

  detaching() {
    this.announcementElement?.remove();
  }
}

export const RouteAnnouncerHook = AppTask.hydrating(IRouter, router => {
  const announcer = new RouteAnnouncer();
  announcer.attached();

  router.addHook((instructions) => {
    const route = instructions.instructions[0]?.[0];
    if (route?.component) {
      // Get page title from route config or component
      const title = route.title || route.component.name;
      announcer.announce(`Navigated to ${title}`);
    }
  });
});
```

---

## Testing for Accessibility

Automated and manual testing ensure your application remains accessible.

### Automated Testing Tools

**Browser Extensions**:
- [axe DevTools](https://www.deque.com/axe/devtools/) - Comprehensive a11y scanner
- [WAVE](https://wave.webaim.org/) - Visual feedback on accessibility issues
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome DevTools

**Testing Libraries**:

```bash
npm install --save-dev @axe-core/playwright
# or
npm install --save-dev jest-axe
```

**Example with Playwright**:

```typescript
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility tests', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:8080');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('http://localhost:8080/login');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa']) // Test WCAG 2.0 Level A and AA
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

### Manual Testing

Automated tools catch only ~30-40% of accessibility issues. Manual testing is essential.

**Keyboard Navigation Testing**:
1. Unplug your mouse
2. Use Tab to navigate forward, Shift+Tab to navigate backward
3. Verify all interactive elements are reachable
4. Verify visible focus indicators
5. Test custom components (modals, dropdowns, etc.)
6. Verify Enter/Space activate buttons and links

**Screen Reader Testing**:

Test with popular screen readers:
- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca
- **Mobile**: VoiceOver (iOS), TalkBack (Android)

**Basic VoiceOver commands (macOS)**:
- **Start**: Cmd+F5
- **Navigate**: Ctrl+Option+Arrow keys
- **Interact**: Ctrl+Option+Shift+Down
- **Read all**: Ctrl+Option+A

**What to test**:
- All text is announced
- Form labels are announced
- Validation errors are announced
- Dynamic content changes are announced
- Keyboard focus is indicated

### Color Contrast Testing

Ensure sufficient contrast between text and background:

**Tools**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)
- Browser DevTools (Chrome: "Show Accessibility" in Elements panel)

**WCAG 2.1 Requirements**:
- **Normal text**: 4.5:1 contrast ratio (AA), 7:1 (AAA)
- **Large text** (18pt+ or 14pt+ bold): 3:1 (AA), 4.5:1 (AAA)
- **UI components**: 3:1 (AA)

---

## WCAG 2.1 Compliance Checklist

Use this checklist to ensure WCAG 2.1 Level AA compliance.

### Perceivable

- [ ] **Text alternatives**: All images have `alt` text
- [ ] **Captions**: Video/audio content has captions or transcripts
- [ ] **Adaptable**: Content order makes sense without CSS
- [ ] **Distinguishable**:
  - [ ] Text has 4.5:1 contrast ratio (normal) or 3:1 (large)
  - [ ] UI components have 3:1 contrast
  - [ ] Text can be resized to 200% without loss of functionality
  - [ ] No images of text (use real text when possible)

### Operable

- [ ] **Keyboard accessible**:
  - [ ] All functionality available via keyboard
  - [ ] No keyboard traps
  - [ ] Visible focus indicators
- [ ] **Enough time**: Users can extend time limits or no time limits exist
- [ ] **Seizures**: No flashing content more than 3 times per second
- [ ] **Navigable**:
  - [ ] Skip links provided
  - [ ] Page titles are descriptive
  - [ ] Logical focus order
  - [ ] Link purpose clear from context
  - [ ] Multiple ways to find pages (search, nav, sitemap)
  - [ ] Headings and labels are descriptive

### Understandable

- [ ] **Readable**:
  - [ ] Language of page is identified (`<html lang="en">`)
  - [ ] Language changes are identified (`<span lang="fr">`)
- [ ] **Predictable**:
  - [ ] Focus doesn't cause unexpected context changes
  - [ ] Input doesn't cause unexpected context changes
  - [ ] Navigation is consistent across pages
- [ ] **Input assistance**:
  - [ ] Error messages are clear and helpful
  - [ ] Labels or instructions provided for user input
  - [ ] Error suggestions provided when possible
  - [ ] Confirm before final submission (legal/financial)

### Robust

- [ ] **Compatible**:
  - [ ] Valid HTML (no duplicate IDs, proper nesting)
  - [ ] Name, role, value available for all UI components
  - [ ] Status messages use `role="status"` or `aria-live`

---

## Related Documentation

- [Templates Overview](../templates/README.md) - Template syntax and data binding
- [Forms](../templates/forms/README.md) - Form creation and validation
- [Validation Plugin](../aurelia-packages/validation/README.md) - Input validation
- [Router Hooks](../router/router-hooks.md) - Focus management on route changes
- [Component Lifecycles](../components/component-lifecycles.md) - Managing focus in lifecycle hooks

---

## Additional Resources

### Standards and Guidelines

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Official WCAG quick reference
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) - ARIA patterns and examples
- [WebAIM](https://webaim.org/) - Web accessibility resources and training

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/) - Browser extension for a11y testing
- [Pa11y](https://pa11y.org/) - Automated accessibility testing
- [WAVE](https://wave.webaim.org/) - Web accessibility evaluation tool
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Built into Chrome

### Screen Readers

- [NVDA](https://www.nvaccess.org/) - Free screen reader for Windows
- [JAWS](https://www.freedomscientific.com/products/software/jaws/) - Popular commercial screen reader
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) - Built into macOS and iOS
- [TalkBack](https://support.google.com/accessibility/android/answer/6283677) - Built into Android

{% hint style="success" %}
**Accessibility is a Journey**

Building accessible applications is an ongoing process. Start with the basics (keyboard navigation, semantic HTML, ARIA), test regularly, and continuously improve. Every improvement makes your application more inclusive.
{% endhint %}

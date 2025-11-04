---
description: Build a fully-featured dropdown menu component with keyboard navigation and accessibility
---

# Dropdown Menu Component

Learn to build a production-ready dropdown menu with keyboard navigation, accessibility, and click-outside detection. This component is perfect for navigation menus, context menus, and action lists.

## What We're Building

A dropdown menu that supports:

- Click to toggle open/close
- Keyboard navigation (Arrow keys, Enter, Escape)
- Click outside to close
- Accessible with ARIA attributes
- Customizable trigger and content
- Positioning options

## Component Code

### dropdown-menu.ts

```typescript
import { bindable, IEventAggregator } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { IPlatform } from '@aurelia/runtime-html';

export class DropdownMenu {
  @bindable open = false;
  @bindable position: 'left' | 'right' = 'left';
  @bindable disabled = false;

  private platform = resolve(IPlatform);
  private element?: HTMLElement;
  private triggerButton?: HTMLButtonElement;
  private menuElement?: HTMLElement;
  private clickOutsideHandler?: (e: MouseEvent) => void;

  binding() {
    this.setupClickOutsideHandler();
  }

  attaching(initiator: HTMLElement) {
    this.element = initiator;
    this.triggerButton = this.element.querySelector('[data-dropdown-trigger]') as HTMLButtonElement;
    this.menuElement = this.element.querySelector('[data-dropdown-menu]') as HTMLElement;
  }

  detaching() {
    this.removeClickOutsideListener();
  }

  toggle() {
    if (this.disabled) return;

    this.open = !this.open;

    if (this.open) {
      this.addClickOutsideListener();
      this.focusFirstItem();
    } else {
      this.removeClickOutsideListener();
    }
  }

  close() {
    if (this.open) {
      this.open = false;
      this.removeClickOutsideListener();
      this.triggerButton?.focus();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (this.disabled) return;

    const { key } = event;

    // Toggle on Enter or Space when trigger is focused
    if ((key === 'Enter' || key === ' ') && document.activeElement === this.triggerButton) {
      event.preventDefault();
      this.toggle();
      return;
    }

    // Close on Escape
    if (key === 'Escape' && this.open) {
      event.preventDefault();
      this.close();
      return;
    }

    // Arrow navigation when menu is open
    if (this.open && (key === 'ArrowDown' || key === 'ArrowUp')) {
      event.preventDefault();
      this.navigateItems(key === 'ArrowDown' ? 1 : -1);
      return;
    }

    // Activate item on Enter when focused
    if (key === 'Enter' && this.open && document.activeElement?.hasAttribute('role')) {
      event.preventDefault();
      (document.activeElement as HTMLElement).click();
    }
  }

  private navigateItems(direction: 1 | -1) {
    if (!this.menuElement) return;

    const items = Array.from(this.menuElement.querySelectorAll('[role="menuitem"]')) as HTMLElement[];
    if (items.length === 0) return;

    const currentIndex = items.findIndex(item => item === document.activeElement);
    let nextIndex: number;

    if (currentIndex === -1) {
      // No item focused, focus first or last based on direction
      nextIndex = direction === 1 ? 0 : items.length - 1;
    } else {
      // Move to next/previous item, wrapping around
      nextIndex = (currentIndex + direction + items.length) % items.length;
    }

    items[nextIndex]?.focus();
  }

  private focusFirstItem() {
    // Use platform.taskQueue to ensure DOM is updated
    this.platform.taskQueue.queueTask(() => {
      const firstItem = this.menuElement?.querySelector('[role="menuitem"]') as HTMLElement;
      firstItem?.focus();
    });
  }

  private setupClickOutsideHandler() {
    this.clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (this.element && !this.element.contains(target)) {
        this.close();
      }
    };
  }

  private addClickOutsideListener() {
    if (this.clickOutsideHandler) {
      // Use timeout to avoid immediate close from the same click that opened it
      setTimeout(() => {
        document.addEventListener('click', this.clickOutsideHandler!, true);
      }, 0);
    }
  }

  private removeClickOutsideListener() {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler, true);
    }
  }

  /**
   * Call this when an item is selected to close the menu
   */
  handleItemClick() {
    this.close();
  }
}
```

### dropdown-menu.html

```html
<div
  class="dropdown \${open ? 'dropdown--open' : ''} dropdown--\${position}"
  keydown.trigger="handleKeyDown($event)"
  ref="dropdownElement">

  <!-- Trigger slot -->
  <button
    type="button"
    class="dropdown__trigger"
    click.trigger="toggle()"
    aria-haspopup="true"
    aria-expanded.bind="open"
    disabled.bind="disabled"
    data-dropdown-trigger>
    <au-slot name="trigger">
      <span>Menu</span>
      <svg class="dropdown__icon" width="12" height="12" viewBox="0 0 12 12">
        <path d="M6 9L1 4h10z" fill="currentColor"/>
      </svg>
    </au-slot>
  </button>

  <!-- Menu content -->
  <div
    class="dropdown__menu"
    role="menu"
    aria-hidden.bind="!open"
    data-dropdown-menu
    if.bind="open">
    <au-slot>
      <div role="menuitem" tabindex="0" click.trigger="handleItemClick()">Menu Item 1</div>
      <div role="menuitem" tabindex="0" click.trigger="handleItemClick()">Menu Item 2</div>
      <div role="menuitem" tabindex="0" click.trigger="handleItemClick()">Menu Item 3</div>
    </au-slot>
  </div>
</div>
```

### dropdown-menu.css

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown__trigger:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.dropdown__trigger:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.dropdown__trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dropdown__icon {
  transition: transform 0.2s;
}

.dropdown--open .dropdown__icon {
  transform: rotate(180deg);
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 4px);
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
              0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 4px;
  z-index: 1000;
  animation: dropdown-slide-in 0.15s ease-out;
}

.dropdown--left .dropdown__menu {
  left: 0;
}

.dropdown--right .dropdown__menu {
  right: 0;
}

@keyframes dropdown-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown__menu [role="menuitem"] {
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;
}

.dropdown__menu [role="menuitem"]:hover,
.dropdown__menu [role="menuitem"]:focus {
  background: #f3f4f6;
}

.dropdown__menu [role="menuitem"]:active {
  background: #e5e7eb;
}

/* Divider */
.dropdown__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 4px 0;
}
```

## Usage Examples

### Basic Dropdown

```html
<dropdown-menu>
  <div au-slot="trigger">
    Actions
  </div>

  <div role="menuitem" tabindex="0">Edit</div>
  <div role="menuitem" tabindex="0">Duplicate</div>
  <div class="dropdown__divider"></div>
  <div role="menuitem" tabindex="0">Delete</div>
</dropdown-menu>
```

### With Custom Trigger

```html
<dropdown-menu position="right">
  <button au-slot="trigger" class="icon-button">
    <svg><!-- Settings icon --></svg>
  </button>

  <div role="menuitem" tabindex="0" click.trigger="openSettings()">
    Settings
  </div>
  <div role="menuitem" tabindex="0" click.trigger="viewProfile()">
    Profile
  </div>
  <div role="menuitem" tabindex="0" click.trigger="logout()">
    Logout
  </div>
</dropdown-menu>
```

### Programmatic Control

```typescript
// your-component.ts
import { DropdownMenu } from './dropdown-menu';

export class YourComponent {
  dropdownOpen = false;

  openDropdown() {
    this.dropdownOpen = true;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }
}
```

```html
<!-- your-component.html -->
<dropdown-menu open.bind="dropdownOpen">
  <div role="menuitem" tabindex="0" click.trigger="performAction()">
    Action
  </div>
</dropdown-menu>

<button click.trigger="openDropdown()">Open Menu</button>
```

### Disabled State

```html
<dropdown-menu disabled.bind="isProcessing">
  <div au-slot="trigger">
    Actions \${isProcessing ? '(Processing...)' : ''}
  </div>

  <div role="menuitem" tabindex="0">Action 1</div>
  <div role="menuitem" tabindex="0">Action 2</div>
</dropdown-menu>
```

## Testing

Test your dropdown component:

```typescript
import { createFixture } from '@aurelia/testing';
import { DropdownMenu } from './dropdown-menu';

describe('DropdownMenu', () => {
  it('toggles open/close on trigger click', async () => {
    const { component, trigger, queryBy, stop } = await createFixture
      .html`<dropdown-menu></dropdown-menu>`
      .deps(DropdownMenu)
      .build()
      .started;

    expect(component.open).toBe(false);
    expect(queryBy('[data-dropdown-menu]')).toBeNull();

    // Click trigger to open
    trigger.click('[data-dropdown-trigger]');
    expect(component.open).toBe(true);

    // Click trigger to close
    trigger.click('[data-dropdown-trigger]');
    expect(component.open).toBe(false);

    await stop(true);
  });

  it('closes when clicking outside', async () => {
    const { component, trigger, stop } = await createFixture
      .html`
        <div>
          <dropdown-menu></dropdown-menu>
          <button id="outside">Outside</button>
        </div>
      `
      .deps(DropdownMenu)
      .build()
      .started;

    // Open the dropdown
    trigger.click('[data-dropdown-trigger]');
    expect(component.open).toBe(true);

    // Click outside
    trigger.click('#outside');

    // Wait for click handler
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(component.open).toBe(false);

    await stop(true);
  });

  it('closes on Escape key', async () => {
    const { component, trigger, getBy, stop } = await createFixture
      .html`<dropdown-menu></dropdown-menu>`
      .deps(DropdownMenu)
      .build()
      .started;

    // Open the dropdown
    trigger.click('[data-dropdown-trigger]');
    expect(component.open).toBe(true);

    // Press Escape
    trigger.keydown(getBy('.dropdown'), { key: 'Escape' });
    expect(component.open).toBe(false);

    await stop(true);
  });

  it('navigates items with arrow keys', async () => {
    const { trigger, getBy, getAllBy, stop } = await createFixture
      .html`
        <dropdown-menu>
          <div role="menuitem" tabindex="0">Item 1</div>
          <div role="menuitem" tabindex="0">Item 2</div>
          <div role="menuitem" tabindex="0">Item 3</div>
        </dropdown-menu>
      `
      .deps(DropdownMenu)
      .build()
      .started;

    // Open the dropdown
    trigger.click('[data-dropdown-trigger]');

    const dropdown = getBy('.dropdown');
    const items = getAllBy('[role="menuitem"]');

    // First item should be focused
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(document.activeElement).toBe(items[0]);

    // Arrow down to second item
    trigger.keydown(dropdown, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(items[1]);

    // Arrow up back to first
    trigger.keydown(dropdown, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(items[0]);

    await stop(true);
  });

  it('does not open when disabled', async () => {
    const { component, trigger, stop } = await createFixture
      .html`<dropdown-menu disabled.bind="true"></dropdown-menu>`
      .deps(DropdownMenu)
      .build()
      .started;

    trigger.click('[data-dropdown-trigger]');
    expect(component.open).toBe(false);

    await stop(true);
  });
});
```

## Accessibility Features

This dropdown implements WCAG 2.1 guidelines:

- ✅ **Keyboard Navigation**: Full keyboard support with arrow keys
- ✅ **ARIA Attributes**: Proper `role`, `aria-haspopup`, `aria-expanded`, `aria-hidden`
- ✅ **Focus Management**: Focuses first item when opened, returns focus to trigger when closed
- ✅ **Escape to Close**: Standard Escape key behavior
- ✅ **Screen Reader Support**: Announces menu state and items

## Enhancements

### 1. Add Icons to Menu Items

```html
<div role="menuitem" tabindex="0" class="menu-item">
  <svg class="menu-item__icon"><!-- Icon --></svg>
  <span>Edit</span>
</div>
```

### 2. Add Submenus

Nest another `dropdown-menu` inside:

```html
<dropdown-menu>
  <div role="menuitem" tabindex="0">Item 1</div>

  <dropdown-menu position="right">
    <div au-slot="trigger" role="menuitem" tabindex="0">
      More Actions →
    </div>
    <div role="menuitem" tabindex="0">Sub Item 1</div>
    <div role="menuitem" tabindex="0">Sub Item 2</div>
  </dropdown-menu>
</dropdown-menu>
```

### 3. Add Search/Filter

```typescript
export class SearchableDropdown {
  @bindable items: any[] = [];
  searchTerm = '';

  get filteredItems() {
    return this.items.filter(item =>
      item.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
```

### 4. Add Positioning Intelligence

Use a library like Floating UI to automatically position the menu to avoid viewport overflow:

```typescript
import { computePosition, flip, shift } from '@floating-ui/dom';

async positionMenu() {
  const { x, y } = await computePosition(this.triggerButton!, this.menuElement!, {
    middleware: [flip(), shift({ padding: 8 })]
  });

  Object.assign(this.menuElement!.style, {
    left: `${x}px`,
    top: `${y}px`
  });
}
```

## Best Practices

1. **Always Clean Up**: Remove event listeners in `detaching()` to prevent memory leaks
2. **Focus Management**: Return focus to trigger when closing for better UX
3. **Debounce**: For search/filter, debounce input to avoid excessive filtering
4. **Accessibility**: Test with keyboard only and screen readers
5. **Portal Rendering**: For complex layouts, render menu in a portal to avoid z-index issues

## Summary

You've built a fully-featured dropdown menu with:

- ✅ Click and keyboard interactions
- ✅ Accessibility built-in
- ✅ Click-outside detection
- ✅ Customizable trigger and content
- ✅ Comprehensive tests

This dropdown is production-ready and can be extended with search, submenus, and intelligent positioning!

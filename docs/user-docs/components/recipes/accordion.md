---
description: Build an accessible accordion component with smooth animations and keyboard support
---

# Accordion Component

Learn to build a simple yet powerful accordion component for collapsible content panels. Perfect for FAQs, settings panels, and content organization.

## What We're Building

An accordion that supports:

- Expand/collapse panels
- Single or multiple panels open
- Smooth animations
- Keyboard navigation
- Accessible with ARIA attributes
- Customizable styling

## Component Code

### accordion.ts

```typescript
import { bindable } from 'aurelia';

export class Accordion {
  @bindable allowMultiple = false;
  @bindable openPanels: number[] = [];

  togglePanel(index: number) {
    if (this.allowMultiple) {
      // Multiple panels can be open
      const panelIndex = this.openPanels.indexOf(index);
      if (panelIndex > -1) {
        this.openPanels.splice(panelIndex, 1);
      } else {
        this.openPanels.push(index);
      }
    } else {
      // Only one panel can be open
      if (this.isPanelOpen(index)) {
        this.openPanels = [];
      } else {
        this.openPanels = [index];
      }
    }
  }

  isPanelOpen(index: number): boolean {
    return this.openPanels.includes(index);
  }
}
```

### accordion.html

```html
<div class="accordion">
  <au-slot></au-slot>
</div>
```

### accordion-panel.ts

```typescript
import { bindable, resolve } from 'aurelia';
import { Accordion } from './accordion';

export class AccordionPanel {
  @bindable title = '';
  @bindable index = 0;

  private accordion = resolve(Accordion);

  get isOpen(): boolean {
    return this.accordion.isPanelOpen(this.index);
  }

  toggle() {
    this.accordion.togglePanel(this.index);
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle();
    }
  }
}
```

### accordion-panel.html

```html
<div class="accordion-panel \${isOpen ? 'accordion-panel--open' : ''}">
  <button
    type="button"
    class="accordion-panel__header"
    click.trigger="toggle()"
    keydown.trigger="handleKeyDown($event)"
    aria-expanded.bind="isOpen">

    <span class="accordion-panel__title">\${title}</span>

    <svg class="accordion-panel__icon" width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 12L2 6h12z" fill="currentColor"/>
    </svg>
  </button>

  <div
    class="accordion-panel__content"
    aria-hidden.bind="!isOpen">
    <div class="accordion-panel__body">
      <au-slot></au-slot>
    </div>
  </div>
</div>
```

### accordion.css

```css
.accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-panel {
  border-bottom: 1px solid #e5e7eb;
}

.accordion-panel:last-child {
  border-bottom: none;
}

.accordion-panel__header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: white;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
}

.accordion-panel__header:hover {
  background: #f9fafb;
}

.accordion-panel__header:focus {
  outline: 2px solid #3b82f6;
  outline-offset: -2px;
  z-index: 1;
}

.accordion-panel__title {
  color: #111827;
}

.accordion-panel__icon {
  color: #6b7280;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.accordion-panel--open .accordion-panel__icon {
  transform: rotate(180deg);
}

.accordion-panel__content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
}

.accordion-panel--open .accordion-panel__content {
  max-height: 1000px; /* Adjust based on your content */
}

.accordion-panel__body {
  padding: 0 20px 16px;
  color: #374151;
  line-height: 1.6;
}
```

## Usage Examples

### Basic Accordion (Single Panel Open)

```html
<accordion>
  <accordion-panel index="0" title="What is Aurelia?">
    Aurelia is a modern JavaScript framework for building web applications.
  </accordion-panel>

  <accordion-panel index="1" title="How do I install Aurelia?">
    You can install Aurelia using npm: <code>npm install aurelia</code>
  </accordion-panel>

  <accordion-panel index="2" title="Where can I learn more?">
    Check out the official documentation at docs.aurelia.io
  </accordion-panel>
</accordion>
```

### Multiple Panels Open

```html
<accordion allow-multiple.bind="true">
  <accordion-panel index="0" title="Account Settings">
    <p>Manage your account settings here.</p>
  </accordion-panel>

  <accordion-panel index="1" title="Privacy Settings">
    <p>Control your privacy preferences.</p>
  </accordion-panel>

  <accordion-panel index="2" title="Notification Settings">
    <p>Configure your notification preferences.</p>
  </accordion-panel>
</accordion>
```

### Controlled Open Panels

```typescript
// your-component.ts
export class FAQPage {
  openPanels = [0]; // First panel open by default

  openAll() {
    this.openPanels = [0, 1, 2, 3];
  }

  closeAll() {
    this.openPanels = [];
  }
}
```

```html
<!-- your-component.html -->
<div>
  <button click.trigger="openAll()">Expand All</button>
  <button click.trigger="closeAll()">Collapse All</button>
</div>

<accordion allow-multiple.bind="true" open-panels.bind="openPanels">
  <accordion-panel index="0" title="Question 1">Answer 1</accordion-panel>
  <accordion-panel index="1" title="Question 2">Answer 2</accordion-panel>
  <accordion-panel index="2" title="Question 3">Answer 3</accordion-panel>
  <accordion-panel index="3" title="Question 4">Answer 4</accordion-panel>
</accordion>
```

### With Rich Content

```html
<accordion>
  <accordion-panel index="0" title="Product Features">
    <ul>
      <li>Feature 1: Fast performance</li>
      <li>Feature 2: Easy to use</li>
      <li>Feature 3: Highly customizable</li>
    </ul>
  </accordion-panel>

  <accordion-panel index="1" title="Pricing">
    <div class="pricing-grid">
      <div class="plan">
        <h3>Basic</h3>
        <p>$9/month</p>
      </div>
      <div class="plan">
        <h3>Pro</h3>
        <p>$29/month</p>
      </div>
    </div>
  </accordion-panel>
</accordion>
```

## Testing

```typescript
import { createFixture } from '@aurelia/testing';
import { Accordion } from './accordion';
import { AccordionPanel } from './accordion-panel';

describe('Accordion', () => {
  it('toggles panel open/closed', async () => {
    const { getAllBy, trigger, stop } = await createFixture
      .html`
        <accordion>
          <accordion-panel index="0" title="Panel 1">Content 1</accordion-panel>
        </accordion>
      `
      .deps(Accordion, AccordionPanel)
      .build()
      .started;

    const panel = getAllBy('.accordion-panel')[0];
    const button = getAllBy('.accordion-panel__header')[0];

    // Initially closed
    expect(panel.classList.contains('accordion-panel--open')).toBe(false);

    // Click to open
    trigger.click(button);
    expect(panel.classList.contains('accordion-panel--open')).toBe(true);

    // Click to close
    trigger.click(button);
    expect(panel.classList.contains('accordion-panel--open')).toBe(false);

    await stop(true);
  });

  it('allows only one panel open when allowMultiple=false', async () => {
    const { component, getAllBy, trigger, stop } = await createFixture
      .html`
        <accordion allow-multiple.bind="false">
          <accordion-panel index="0" title="Panel 1">Content 1</accordion-panel>
          <accordion-panel index="1" title="Panel 2">Content 2</accordion-panel>
        </accordion>
      `
      .deps(Accordion, AccordionPanel)
      .build()
      .started;

    const buttons = getAllBy('.accordion-panel__header');

    // Open first panel
    trigger.click(buttons[0]);
    expect(component.openPanels).toEqual([0]);

    // Open second panel
    trigger.click(buttons[1]);
    expect(component.openPanels).toEqual([1]); // First closed, second open

    await stop(true);
  });

  it('allows multiple panels open when allowMultiple=true', async () => {
    const { component, getAllBy, trigger, stop } = await createFixture
      .html`
        <accordion allow-multiple.bind="true">
          <accordion-panel index="0" title="Panel 1">Content 1</accordion-panel>
          <accordion-panel index="1" title="Panel 2">Content 2</accordion-panel>
        </accordion>
      `
      .deps(Accordion, AccordionPanel)
      .build()
      .started;

    const buttons = getAllBy('.accordion-panel__header');

    // Open first panel
    trigger.click(buttons[0]);
    expect(component.openPanels).toEqual([0]);

    // Open second panel
    trigger.click(buttons[1]);
    expect(component.openPanels).toEqual([0, 1]); // Both open

    await stop(true);
  });

  it('supports keyboard navigation', async () => {
    const { getAllBy, trigger, stop } = await createFixture
      .html`
        <accordion>
          <accordion-panel index="0" title="Panel 1">Content 1</accordion-panel>
        </accordion>
      `
      .deps(Accordion, AccordionPanel)
      .build()
      .started;

    const button = getAllBy('.accordion-panel__header')[0];
    const panel = getAllBy('.accordion-panel')[0];

    // Press Enter to open
    trigger.keydown(button, { key: 'Enter' });
    expect(panel.classList.contains('accordion-panel--open')).toBe(true);

    // Press Space to close
    trigger.keydown(button, { key: ' ' });
    expect(panel.classList.contains('accordion-panel--open')).toBe(false);

    await stop(true);
  });
});
```

## Accessibility Features

This accordion implements WCAG 2.1 guidelines:

- ✅ **ARIA Attributes**: `aria-expanded` indicates panel state
- ✅ **Keyboard Support**: Enter and Space keys toggle panels
- ✅ **Focus Management**: Buttons are focusable with visible focus indicators
- ✅ **Semantic HTML**: Uses `<button>` for interactive headers

## Enhancements

### 1. Add Animation Callbacks

```typescript
export class AnimatedAccordion extends Accordion {
  @bindable onBeforeOpen?: (index: number) => void;
  @bindable onAfterOpen?: (index: number) => void;

  togglePanel(index: number) {
    const wasOpen = this.isPanelOpen(index);

    if (!wasOpen && this.onBeforeOpen) {
      this.onBeforeOpen(index);
    }

    super.togglePanel(index);

    if (!wasOpen && this.onAfterOpen) {
      setTimeout(() => this.onAfterOpen!(index), 300); // After animation
    }
  }
}
```

### 2. Add Icons

```html
<accordion-panel index="0" title="Custom Icon">
  <svg au-slot="icon" width="20" height="20">
    <!-- Custom icon -->
  </svg>

  Panel content here
</accordion-panel>
```

### 3. Add Lazy Loading

```typescript
export class LazyAccordionPanel extends AccordionPanel {
  @bindable loadContent?: () => Promise<any>;
  content: any = null;
  loaded = false;

  async toggle() {
    super.toggle();

    if (this.isOpen && !this.loaded && this.loadContent) {
      this.content = await this.loadContent();
      this.loaded = true;
    }
  }
}
```

## Best Practices

1. **Animation Performance**: Use `max-height` instead of `height: auto` for smooth transitions
2. **Content Height**: Set reasonable `max-height` values or calculate dynamically
3. **Accessibility**: Always include `aria-expanded` for screen readers
4. **Focus Visible**: Ensure keyboard focus is clearly visible
5. **Mobile**: Test touch interactions and ensure adequate tap targets

## Summary

You've built a fully-functional accordion with:

- ✅ Single and multiple panel modes
- ✅ Smooth animations
- ✅ Keyboard support
- ✅ Accessible markup
- ✅ Easy customization

This accordion is ready for FAQs, settings panels, and any collapsible content!

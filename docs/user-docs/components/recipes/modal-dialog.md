---
description: Build a flexible modal dialog component with backdrop, animations, and focus management
---

# Modal Dialog Component

Learn to build a production-ready modal dialog with proper focus management, backdrop click handling, animations, and accessibility. Perfect for confirmations, forms, and detailed content displays.

## What We're Building

A modal dialog that supports:

- Open/close with smooth animations
- Backdrop click to close (optional)
- Escape key to close
- Focus trap (keyboard focus stays within modal)
- Return focus to trigger when closed
- Accessible with ARIA attributes
- Portal rendering (renders outside parent context)
- Scrollable content

## Component Code

### modal-dialog.ts

```typescript
import { bindable, IEventAggregator } from 'aurelia';
import { resolve } from '@aurelia/kernel';
import { queueTask } from '@aurelia/runtime';
import { IPlatform } from '@aurelia/runtime-html';

export class ModalDialog {
  @bindable open = false;
  @bindable closeOnBackdropClick = true;
  @bindable closeOnEscape = true;
  @bindable size: 'small' | 'medium' | 'large' | 'full' = 'medium';

  private platform = resolve(IPlatform);
  private element?: HTMLElement;
  private modalElement?: HTMLElement;
  private previousActiveElement?: HTMLElement;
  private focusableElements: HTMLElement[] = [];

  openChanged(newValue: boolean) {
    if (newValue) {
      this.onOpen();
    } else {
      this.onClose();
    }
  }

  attaching(initiator: HTMLElement) {
    this.element = initiator;
    this.modalElement = this.element.querySelector('[data-modal]') as HTMLElement;
  }

  detaching() {
    // Clean up if modal is still open
    if (this.open) {
      this.cleanupModal();
    }
  }

  closeModal() {
    this.open = false;
  }

  handleBackdropClick(event: MouseEvent) {
    // Only close if clicking the backdrop itself, not content inside
    if (this.closeOnBackdropClick && event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.closeOnEscape) {
      event.preventDefault();
      this.closeModal();
      return;
    }

    // Tab key focus trap
    if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  private onOpen() {
    // Store currently focused element to return focus later
    this.previousActiveElement = document.activeElement as HTMLElement;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Wait for DOM to render, then focus first element
    queueTask(() => {
      this.updateFocusableElements();
      this.focusFirstElement();
    });
  }

  private onClose() {
    this.cleanupModal();
  }

  private cleanupModal() {
    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to element that opened the modal
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = undefined;
    }
  }

  private updateFocusableElements() {
    if (!this.modalElement) return;

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    this.focusableElements = Array.from(
      this.modalElement.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];
  }

  private focusFirstElement() {
    const firstFocusable = this.focusableElements[0];
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  private handleTabKey(event: KeyboardEvent) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      // Shift + Tab: Move backwards
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: Move forwards
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
}
```

### modal-dialog.html

```html
<div
  if.bind="open"
  class="modal modal--\${size}"
  role="dialog"
  aria-modal="true"
  keydown.trigger="handleKeyDown($event)"
  data-modal>

  <!-- Backdrop -->
  <div
    class="modal__backdrop"
    click.trigger="handleBackdropClick($event)">

    <!-- Content container -->
    <div class="modal__content" role="document">

      <!-- Header slot -->
      <div class="modal__header" if.bind="$slots.header">
        <au-slot name="header"></au-slot>
        <button
          type="button"
          class="modal__close"
          click.trigger="closeModal()"
          aria-label="Close modal">
          ×
        </button>
      </div>

      <!-- Body slot -->
      <div class="modal__body">
        <au-slot>
          <p>Modal content goes here</p>
        </au-slot>
      </div>

      <!-- Footer slot -->
      <div class="modal__footer" if.bind="$slots.footer">
        <au-slot name="footer"></au-slot>
      </div>

    </div>
  </div>
</div>
```

### modal-dialog.css

```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: modal-fade-in 0.2s ease-out;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal__backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.modal__content {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modal-slide-up 0.2s ease-out;
  margin: auto;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Size variants */
.modal--small .modal__content {
  width: 100%;
  max-width: 400px;
}

.modal--medium .modal__content {
  width: 100%;
  max-width: 600px;
}

.modal--large .modal__content {
  width: 100%;
  max-width: 900px;
}

.modal--full .modal__content {
  width: 100%;
  max-width: 95vw;
  max-height: 95vh;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal__header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.modal__close {
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
}

.modal__close:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal__close:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.modal__body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal__footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.modal__footer button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.modal__footer button.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.modal__footer button.btn-primary:hover {
  background: #2563eb;
}

.modal__footer button.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
}

.modal__footer button.btn-secondary:hover {
  background: #f9fafb;
}
```

## Usage Examples

### Basic Modal

```typescript
// your-component.ts
export class YourComponent {
  showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
```

```html
<!-- your-component.html -->
<button click.trigger="openModal()">Open Modal</button>

<modal-dialog open.bind="showModal">
  <h2 au-slot="header">Welcome!</h2>

  <p>This is the modal content. You can put anything here.</p>

  <div au-slot="footer">
    <button class="btn-secondary" click.trigger="closeModal()">Cancel</button>
    <button class="btn-primary" click.trigger="closeModal()">OK</button>
  </div>
</modal-dialog>
```

### Confirmation Dialog

```typescript
export class ConfirmDialog {
  showConfirm = false;
  confirmMessage = '';

  confirm(message: string): Promise<boolean> {
    this.confirmMessage = message;
    this.showConfirm = true;

    return new Promise(resolve => {
      this.resolveConfirm = resolve;
    });
  }

  handleConfirm(result: boolean) {
    this.showConfirm = false;
    if (this.resolveConfirm) {
      this.resolveConfirm(result);
    }
  }

  async deleteItem() {
    const confirmed = await this.confirm('Are you sure you want to delete this item?');
    if (confirmed) {
      // Delete the item
    }
  }

  private resolveConfirm?: (value: boolean) => void;
}
```

```html
<modal-dialog open.bind="showConfirm" size="small">
  <h2 au-slot="header">Confirm Action</h2>

  <p>\${confirmMessage}</p>

  <div au-slot="footer">
    <button class="btn-secondary" click.trigger="handleConfirm(false)">
      Cancel
    </button>
    <button class="btn-primary" click.trigger="handleConfirm(true)">
      Confirm
    </button>
  </div>
</modal-dialog>
```

### Form Modal

```typescript
export class FormModal {
  showForm = false;
  formData = {
    name: '',
    email: '',
    message: ''
  };

  openForm() {
    this.showForm = true;
    this.resetForm();
  }

  closeForm() {
    this.showForm = false;
  }

  async submitForm() {
    // Validate and submit
    console.log('Submitting:', this.formData);
    this.closeForm();
  }

  resetForm() {
    this.formData = { name: '', email: '', message: '' };
  }
}
```

```html
<modal-dialog open.bind="showForm" size="medium" close-on-backdrop-click.bind="false">
  <h2 au-slot="header">Contact Us</h2>

  <form>
    <div class="form-group">
      <label for="name">Name</label>
      <input id="name" type="text" value.bind="formData.name">
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" type="email" value.bind="formData.email">
    </div>

    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" rows="4" value.bind="formData.message"></textarea>
    </div>
  </form>

  <div au-slot="footer">
    <button class="btn-secondary" click.trigger="closeForm()">Cancel</button>
    <button class="btn-primary" click.trigger="submitForm()">Send Message</button>
  </div>
</modal-dialog>
```

### Full-Screen Modal

```html
<modal-dialog open.bind="showDetails" size="full">
  <h2 au-slot="header">Full Details</h2>

  <div class="content-grid">
    <!-- Large amount of content -->
  </div>

  <div au-slot="footer">
    <button class="btn-primary" click.trigger="showDetails = false">Close</button>
  </div>
</modal-dialog>
```

## Testing

```typescript
import { createFixture } from '@aurelia/testing';
import { ModalDialog } from './modal-dialog';

describe('ModalDialog', () => {
  it('opens and closes', async () => {
    const { component, queryBy, stop } = await createFixture
      .html`<modal-dialog open.bind="isOpen"></modal-dialog>`
      .component(class { isOpen = false; })
      .deps(ModalDialog)
      .build()
      .started;

    expect(queryBy('[data-modal]')).toBeNull();

    component.isOpen = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(queryBy('[data-modal]')).toBeTruthy();

    component.isOpen = false;
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(queryBy('[data-modal]')).toBeNull();

    await stop(true);
  });

  it('closes on Escape key', async () => {
    const { component, trigger, getBy, stop } = await createFixture
      .html`<modal-dialog open.bind="isOpen"></modal-dialog>`
      .component(class { isOpen = true; })
      .deps(ModalDialog)
      .build()
      .started;

    await new Promise(resolve => setTimeout(resolve, 10));

    trigger.keydown(getBy('[data-modal]'), { key: 'Escape' });

    expect(component.isOpen).toBe(false);

    await stop(true);
  });

  it('closes on backdrop click when enabled', async () => {
    const { component, trigger, getBy, stop } = await createFixture
      .html`<modal-dialog open.bind="isOpen" close-on-backdrop-click.bind="true"></modal-dialog>`
      .component(class { isOpen = true; })
      .deps(ModalDialog)
      .build()
      .started;

    await new Promise(resolve => setTimeout(resolve, 10));

    trigger.click(getBy('.modal__backdrop'));

    expect(component.isOpen).toBe(false);

    await stop(true);
  });

  it('does not close on content click', async () => {
    const { component, trigger, getBy, stop } = await createFixture
      .html`<modal-dialog open.bind="isOpen"></modal-dialog>`
      .component(class { isOpen = true; })
      .deps(ModalDialog)
      .build()
      .started;

    await new Promise(resolve => setTimeout(resolve, 10));

    trigger.click(getBy('.modal__content'));

    expect(component.isOpen).toBe(true);

    await stop(true);
  });

  it('prevents body scroll when open', async () => {
    const { component, stop } = await createFixture
      .html`<modal-dialog open.bind="isOpen"></modal-dialog>`
      .component(class { isOpen = false; })
      .deps(ModalDialog)
      .build()
      .started;

    expect(document.body.style.overflow).toBe('');

    component.isOpen = true;
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(document.body.style.overflow).toBe('hidden');

    component.isOpen = false;
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(document.body.style.overflow).toBe('');

    await stop(true);
  });
});
```

## Accessibility Features

This modal follows WCAG 2.1 guidelines:

- ✅ **Focus Trap**: Tab key cycles through focusable elements within modal
- ✅ **Focus Management**: Focuses first element when opened, returns focus when closed
- ✅ **Keyboard Support**: Escape key closes modal
- ✅ **ARIA Attributes**: `role="dialog"`, `aria-modal="true"` for screen readers
- ✅ **Body Scroll Lock**: Prevents scrolling background content

## Enhancements

### 1. Add Transition Animations

Use Aurelia's animation system for smoother transitions:

```typescript
import { animator } from '@aurelia/runtime-html';

export class AnimatedModal {
  private animator = resolve(animator);

  async openModal() {
    this.open = true;
    await tasksSettled();
    await this.animator.enter(this.modalElement!);
  }

  async closeModal() {
    await this.animator.leave(this.modalElement!);
    this.open = false;
  }
}
```

### 2. Add Confirmation Before Close

```typescript
export class UnsavedChangesModal {
  @bindable hasUnsavedChanges = false;

  async closeModal() {
    if (this.hasUnsavedChanges) {
      const confirmed = confirm('You have unsaved changes. Close anyway?');
      if (!confirmed) return;
    }

    this.open = false;
  }
}
```

### 3. Add Modal Service

Create a global modal service for programmatic modals:

```typescript
// modal-service.ts
import { IEventAggregator } from 'aurelia';
import { resolve } from '@aurelia/kernel';

export interface ModalConfig {
  title: string;
  message: string;
  buttons?: Array<{ label: string; action: () => void; primary?: boolean }>;
}

export class ModalService {
  private ea = resolve(IEventAggregator);

  alert(title: string, message: string) {
    return this.open({
      title,
      message,
      buttons: [{ label: 'OK', action: () => {}, primary: true }]
    });
  }

  confirm(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      this.open({
        title,
        message,
        buttons: [
          { label: 'Cancel', action: () => resolve(false) },
          { label: 'Confirm', action: () => resolve(true), primary: true }
        ]
      });
    });
  }

  private open(config: ModalConfig) {
    this.ea.publish('modal:open', config);
  }
}
```

## Best Practices

1. **Focus Management**: Always return focus to the trigger element
2. **Body Scroll**: Lock body scroll to prevent confusion
3. **Escape Key**: Always allow Escape to close (unless critical action)
4. **Backdrop Click**: Make it configurable, disable for forms with unsaved changes
5. **Portal Rendering**: For complex apps, render modals in a portal at document root
6. **Stacking**: Support multiple modals with z-index management

## Summary

You've built a fully-featured modal dialog with:

- ✅ Smooth animations
- ✅ Focus trap and management
- ✅ Keyboard support
- ✅ Accessible markup
- ✅ Multiple sizes
- ✅ Customizable behavior

This modal is production-ready and handles all common use cases!

---
description: >-
  Advanced patterns for building custom attributes in Aurelia 2, including template controllers, complex bindings, and performance optimization.
---

# Advanced Custom Attribute Patterns

This guide covers advanced patterns for building custom attributes in Aurelia 2, focusing on template controllers, complex binding scenarios, and performance optimization techniques.

## Template Controllers

Template controllers are custom attributes that control the rendering of their associated template. They're the mechanism behind built-in attributes like `if`, `repeat`, `with`, and `switch`.

### Basic Template Controller Structure

All template controllers follow this pattern:

```typescript
import { customAttribute, ICustomAttributeController, IViewFactory, IRenderLocation, ISyntheticView } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'my-controller',
  isTemplateController: true,
  bindables: ['value']
})
export class MyController {
  public readonly $controller!: ICustomAttributeController<this>;
  private readonly factory = resolve(IViewFactory);
  private readonly location = resolve(IRenderLocation);
  private view?: ISyntheticView;

  public value: unknown;

  public valueChanged(newValue: unknown): void {
    this.updateView(newValue);
  }

  private updateView(show: boolean): void {
    if (show && !this.view) {
      this.view = this.factory.create().setLocation(this.location);
      this.view.activate(this.view, this.$controller, this.$controller.scope);
    } else if (!show && this.view) {
      this.view.deactivate(this.view, this.$controller);
      this.view = undefined;
    }
  }

  public attaching(): void {
    if (this.value) {
      this.updateView(true);
    }
  }

  public detaching(): void {
    if (this.view) {
      this.view.deactivate(this.view, this.$controller);
      this.view = undefined;
    }
  }
}
```

Usage:
```html
<div my-controller.bind="condition">
  This content is conditionally rendered
</div>
```

### Real-World Example: Visibility Controller

A practical template controller that shows/hides content based on user permissions:

```typescript
import { customAttribute, ICustomAttributeController, IViewFactory, IRenderLocation, ISyntheticView } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

interface IPermissionService {
  hasPermission(permission: string): boolean;
  hasAnyPermission(permissions: string[]): boolean;
}

@customAttribute({
  name: 'show-if-permitted',
  isTemplateController: true,
  bindables: ['permission', 'anyOf']
})
export class ShowIfPermitted {
  public readonly $controller!: ICustomAttributeController<this>;
  private readonly factory = resolve(IViewFactory);
  private readonly location = resolve(IRenderLocation);
  private readonly permissionService = resolve(IPermissionService);
  private view?: ISyntheticView;

  public permission?: string;
  public anyOf?: string[];

  public permissionChanged(): void {
    this.updateVisibility();
  }

  public anyOfChanged(): void {
    this.updateVisibility();
  }

  private updateVisibility(): void {
    const hasPermission = this.permission 
      ? this.permissionService.hasPermission(this.permission)
      : this.anyOf 
        ? this.permissionService.hasAnyPermission(this.anyOf)
        : false;

    if (hasPermission && !this.view) {
      this.view = this.factory.create().setLocation(this.location);
      this.view.activate(this.view, this.$controller, this.$controller.scope);
    } else if (!hasPermission && this.view) {
      this.view.deactivate(this.view, this.$controller);
      this.view = undefined;
    }
  }

  public attaching(): void {
    this.updateVisibility();
  }

  public detaching(): void {
    if (this.view) {
      this.view.deactivate(this.view, this.$controller);
      this.view = undefined;
    }
  }
}
```

Usage:
```html
<div show-if-permitted.bind="'admin'">
  Admin-only content
</div>

<div show-if-permitted any-of.bind="['user', 'moderator']">
  User or moderator content
</div>
```

### Advanced Template Controller: Loading States

A template controller that manages loading states with caching:

```typescript
import { customAttribute, ICustomAttributeController, IViewFactory, IRenderLocation, ISyntheticView } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'loading-state',
  isTemplateController: true,
  bindables: ['isLoading', 'cache']
})
export class LoadingState {
  public readonly $controller!: ICustomAttributeController<this>;
  private readonly factory = resolve(IViewFactory);
  private readonly location = resolve(IRenderLocation);
  private view?: ISyntheticView;
  private cachedView?: ISyntheticView;

  public isLoading: boolean = false;
  public cache: boolean = true;

  public isLoadingChanged(newValue: boolean): void {
    this.updateView(newValue);
  }

  private updateView(isLoading: boolean): void {
    if (!isLoading && !this.view) {
      // Show content
      if (this.cache && this.cachedView) {
        this.view = this.cachedView;
      } else {
        this.view = this.factory.create().setLocation(this.location);
        if (this.cache) {
          this.cachedView = this.view;
        }
      }
      this.view.activate(this.view, this.$controller, this.$controller.scope);
    } else if (isLoading && this.view) {
      // Hide content
      this.view.deactivate(this.view, this.$controller);
      if (!this.cache) {
        this.view = undefined;
      } else {
        this.view = undefined; // Keep cached view
      }
    }
  }

  public attaching(): void {
    this.updateView(this.isLoading);
  }

  public detaching(): void {
    if (this.view) {
      this.view.deactivate(this.view, this.$controller);
      this.view = undefined;
    }
    if (this.cachedView) {
      this.cachedView = undefined;
    }
  }
}
```

Usage:
```html
<div loading-state.bind="isLoading" cache.bind="true">
  <p>This content is hidden while loading</p>
</div>
```

## Complex Two-Way Binding Attributes

### Bi-directional Data Synchronization

Create attributes that can both read and write data:

```typescript
import { customAttribute, INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'auto-save',
  bindables: ['value', 'debounce']
})
export class AutoSave {
  private element = resolve(INode) as HTMLInputElement;
  private debounceTimer?: number;

  public value: string = '';
  public debounce: number = 500;

  public valueChanged(newValue: string): void {
    if (this.element.value !== newValue) {
      this.element.value = newValue;
    }
  }

  public attached(): void {
    this.element.addEventListener('input', this.handleInput);
    this.element.addEventListener('blur', this.handleBlur);
  }

  public detaching(): void {
    this.element.removeEventListener('input', this.handleInput);
    this.element.removeEventListener('blur', this.handleBlur);
    this.clearTimer();
  }

  private handleInput = (): void => {
    this.clearTimer();
    this.debounceTimer = window.setTimeout(() => {
      this.updateValue();
    }, this.debounce);
  };

  private handleBlur = (): void => {
    this.clearTimer();
    this.updateValue();
  };

  private updateValue(): void {
    const newValue = this.element.value;
    if (this.value !== newValue) {
      this.value = newValue;
    }
  }

  private clearTimer(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }
  }
}
```

Usage:
```html
<input auto-save.bind="document.title" debounce.bind="1000">
```

### Multi-Value Binding

Handle multiple bindable properties with complex interactions:

```typescript
import { customAttribute, INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'slider-range',
  bindables: ['min', 'max', 'step', 'value']
})
export class SliderRange {
  private element = resolve(INode) as HTMLInputElement;

  public min: number = 0;
  public max: number = 100;
  public step: number = 1;
  public value: number = 0;

  public minChanged(newValue: number): void {
    this.element.min = String(newValue);
    this.validateValue();
  }

  public maxChanged(newValue: number): void {
    this.element.max = String(newValue);
    this.validateValue();
  }

  public stepChanged(newValue: number): void {
    this.element.step = String(newValue);
  }

  public valueChanged(newValue: number): void {
    const validValue = this.clampValue(newValue);
    if (this.element.value !== String(validValue)) {
      this.element.value = String(validValue);
    }
  }

  public attached(): void {
    this.element.type = 'range';
    this.element.addEventListener('input', this.handleInput);
    this.element.addEventListener('change', this.handleChange);
    this.updateElement();
  }

  public detaching(): void {
    this.element.removeEventListener('input', this.handleInput);
    this.element.removeEventListener('change', this.handleChange);
  }

  private handleInput = (): void => {
    this.value = Number(this.element.value);
  };

  private handleChange = (): void => {
    this.value = Number(this.element.value);
  };

  private validateValue(): void {
    const clampedValue = this.clampValue(this.value);
    if (clampedValue !== this.value) {
      this.value = clampedValue;
    }
  }

  private clampValue(value: number): number {
    return Math.max(this.min, Math.min(this.max, value));
  }

  private updateElement(): void {
    this.element.min = String(this.min);
    this.element.max = String(this.max);
    this.element.step = String(this.step);
    this.element.value = String(this.clampValue(this.value));
  }
}
```

Usage:
```html
<input slider-range min.bind="0" max.bind="100" step.bind="5" value.bind="currentValue">
```

## Performance Optimization Patterns

### Lazy Initialization

Defer expensive operations until needed:

```typescript
import { customAttribute, INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'lazy-load',
  bindables: ['src', 'placeholder']
})
export class LazyLoad {
  private element = resolve(INode) as HTMLImageElement;
  private observer?: IntersectionObserver;

  public src: string = '';
  public placeholder: string = '';

  public attached(): void {
    this.element.src = this.placeholder;
    this.setupIntersectionObserver();
  }

  public detaching(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.loadImage();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    this.observer.observe(this.element);
  }

  private loadImage(): void {
    if (this.src) {
      this.element.src = this.src;
    }
  }
}
```

### Batch Updates

Minimize DOM operations by batching updates:

```typescript
import { customAttribute, INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'batch-class',
  bindables: ['classes']
})
export class BatchClass {
  private element = resolve(INode) as HTMLElement;
  private scheduledUpdate = false;
  private appliedClasses = new Set<string>();

  public classes: Record<string, boolean> = {};

  public classesChanged(): void {
    this.scheduleUpdate();
  }

  private scheduleUpdate(): void {
    if (!this.scheduledUpdate) {
      this.scheduledUpdate = true;
      requestAnimationFrame(() => {
        this.updateClasses();
        this.scheduledUpdate = false;
      });
    }
  }

  private updateClasses(): void {
    const newClasses = new Set<string>();
    
    // Collect classes that should be applied
    for (const [className, shouldApply] of Object.entries(this.classes)) {
      if (shouldApply) {
        newClasses.add(className);
      }
    }

    // Remove classes that are no longer needed
    for (const className of this.appliedClasses) {
      if (!newClasses.has(className)) {
        this.element.classList.remove(className);
      }
    }

    // Add new classes
    for (const className of newClasses) {
      if (!this.appliedClasses.has(className)) {
        this.element.classList.add(className);
      }
    }

    this.appliedClasses = newClasses;
  }
}
```

## Error Handling in Custom Attributes

### Graceful Degradation

Handle errors gracefully without breaking the application:

```typescript
import { customAttribute, INode } from '@aurelia/runtime-html';
import { resolve, ILogger } from '@aurelia/kernel';

@customAttribute({
  name: 'safe-transform',
  bindables: ['transform', 'fallback']
})
export class SafeTransform {
  private element = resolve(INode) as HTMLElement;
  private logger = resolve(ILogger);

  public transform: string = '';
  public fallback: string = '';

  public transformChanged(newValue: string): void {
    this.applyTransform(newValue);
  }

  private applyTransform(transform: string): void {
    try {
      this.element.style.transform = transform;
    } catch (error) {
      this.logger.warn(`Invalid transform "${transform}":`, error);
      this.element.style.transform = this.fallback;
    }
  }

  public attached(): void {
    this.applyTransform(this.transform);
  }
}
```

### Validation and Sanitization

Validate inputs before applying them:

```typescript
import { customAttribute, INode } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

@customAttribute({
  name: 'safe-html',
  bindables: ['content', 'allowedTags']
})
export class SafeHtml {
  private element = resolve(INode) as HTMLElement;

  public content: string = '';
  public allowedTags: string[] = ['b', 'i', 'em', 'strong', 'p', 'br'];

  public contentChanged(newValue: string): void {
    this.updateContent(newValue);
  }

  private updateContent(content: string): void {
    const sanitized = this.sanitizeHtml(content);
    this.element.innerHTML = sanitized;
  }

  private sanitizeHtml(html: string): string {
    // Simple sanitization - in production, use a proper library like DOMPurify
    const div = document.createElement('div');
    div.innerHTML = html;

    // Remove all elements not in allowed tags
    const elements = div.querySelectorAll('*');
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (!this.allowedTags.includes(element.tagName.toLowerCase())) {
        element.remove();
      }
    }

    return div.innerHTML;
  }
}
```

## Testing Custom Attributes

### Unit Testing Template Controllers

```typescript
import { TestContext } from '@aurelia/testing';
import { MyController } from './my-controller';

describe('MyController', () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = TestContext.create();
  });

  afterEach(() => {
    ctx.dispose();
  });

  it('should show content when value is true', async () => {
    const { component, startPromise, tearDown } = ctx.createFixture(
      `<div my-controller.bind="showContent">Content</div>`,
      class {
        showContent = true;
      }
    );

    await startPromise;

    expect(component.textContent).toContain('Content');

    await tearDown();
  });

  it('should hide content when value is false', async () => {
    const { component, startPromise, tearDown } = ctx.createFixture(
      `<div my-controller.bind="showContent">Content</div>`,
      class {
        showContent = false;
      }
    );

    await startPromise;

    expect(component.textContent).not.toContain('Content');

    await tearDown();
  });
});
```

## Best Practices

### 1. **Resource Management**
Always clean up resources in `detaching()`:
```typescript
public detaching(): void {
  if (this.observer) {
    this.observer.disconnect();
  }
  if (this.subscription) {
    this.subscription.dispose();
  }
}
```

### 2. **Performance Considerations**
- Use `requestAnimationFrame` for DOM updates
- Batch operations when possible
- Avoid frequent DOM queries

### 3. **Error Handling**
- Validate inputs before applying changes
- Provide fallback behaviors
- Log errors for debugging

### 4. **Type Safety**
- Use TypeScript interfaces for bindable properties
- Implement proper type guards for runtime validation

These patterns provide a solid foundation for building robust, performant custom attributes that integrate well with Aurelia's architecture while handling edge cases gracefully.
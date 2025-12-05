# @slotted Decorator

The `@slotted` decorator provides a declarative way to observe and react to changes in slotted content within your custom elements. This decorator automatically tracks which elements are projected into specific slots and provides your component with an up-to-date array of matching nodes.

## Overview

When building custom elements that accept slotted content, you often need to:
- Know which elements were projected into a specific slot
- Filter projected elements by CSS selector
- React when the projected content changes

The `@slotted` decorator handles all of this automatically, creating a reactive property that updates whenever the slotted content changes.

## Basic Usage

```typescript
import { slotted } from '@aurelia/runtime-html';

export class TabContainer {
  // Watch all elements in the default slot
  @slotted() tabs: Element[];

  tabsChanged(newTabs: Element[], oldTabs: Element[]) {
    console.log('Tabs changed:', newTabs);
  }
}
```

```html
<!-- tab-container.html -->
<div class="tab-container">
  <au-slot></au-slot>
</div>
```

**Usage:**

```html
<tab-container>
  <div class="tab">Tab 1</div>
  <div class="tab">Tab 2</div>
  <div class="tab">Tab 3</div>
</tab-container>
```

## Filtering with CSS Selectors

Use a CSS selector to filter which slotted elements are tracked:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class Accordion {
  // Only watch elements with class 'accordion-item'
  @slotted('.accordion-item') items: Element[];

  itemsChanged(newItems: Element[], oldItems: Element[]) {
    console.log(`Accordion now has ${newItems.length} items`);
  }
}
```

```html
<!-- accordion.html -->
<div class="accordion">
  <au-slot></au-slot>
</div>
```

**Usage:**

```html
<accordion>
  <div class="accordion-item">Item 1</div>
  <div class="accordion-item">Item 2</div>
  <div>This won't be tracked</div>
  <div class="accordion-item">Item 3</div>
</accordion>
```

## Targeting Specific Slots

When your component has multiple named slots, you can target specific slots:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class Dashboard {
  // Watch elements in the 'header' slot
  @slotted('*', 'header') headerItems: Element[];

  // Watch elements in the 'sidebar' slot
  @slotted('*', 'sidebar') sidebarItems: Element[];

  // Watch only buttons in the 'footer' slot
  @slotted('button', 'footer') footerButtons: Element[];
}
```

```html
<!-- dashboard.html -->
<div class="dashboard">
  <header>
    <au-slot name="header"></au-slot>
  </header>

  <aside>
    <au-slot name="sidebar"></au-slot>
  </aside>

  <main>
    <au-slot></au-slot> <!-- default slot -->
  </main>

  <footer>
    <au-slot name="footer"></au-slot>
  </footer>
</div>
```

**Usage:**

```html
<dashboard>
  <h1 au-slot="header">Dashboard Title</h1>
  <nav au-slot="sidebar">Sidebar Nav</nav>
  <p>Main content</p>
  <button au-slot="footer">Save</button>
  <button au-slot="footer">Cancel</button>
</dashboard>
```

## Watching All Slots

Use `'*'` as the slot name to watch all slots simultaneously:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class MultiSlotComponent {
  // Watch all div elements across all slots
  @slotted('div', '*') allDivs: Element[];

  allDivsChanged(newDivs: Element[], oldDivs: Element[]) {
    console.log(`Total div elements across all slots: ${newDivs.length}`);
  }
}
```

## Change Callbacks

The `@slotted` decorator automatically looks for a callback method following the naming convention `{propertyName}Changed`:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class CardList {
  @slotted('.card') cards: Element[];

  // This method is automatically called when cards change
  cardsChanged(newCards: Element[], oldCards: Element[]) {
    console.log(`Cards changed from ${oldCards.length} to ${newCards.length}`);
    this.updateCardIndexes();
  }

  private updateCardIndexes() {
    this.cards.forEach((card, index) => {
      card.setAttribute('data-index', String(index));
    });
  }
}
```

### Custom Callback Names

You can specify a custom callback method name:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class Gallery {
  @slotted({
    query: 'img',
    callback: 'handleImageChange'
  }) images: Element[];

  handleImageChange(newImages: Element[], oldImages: Element[]) {
    console.log('Images changed:', newImages);
  }
}
```

## Advanced Configuration

The `@slotted` decorator accepts a configuration object for fine-grained control:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class AdvancedComponent {
  @slotted({
    query: '.special-item',      // CSS selector to filter elements
    slotName: 'content',          // Name of the slot to watch
    callback: 'onItemsChanged'    // Custom callback method name
  }) specialItems: Element[];

  onItemsChanged(newItems: Element[], oldItems: Element[]) {
    console.log('Special items updated');
  }
}
```

### Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `query` | `string` | `'*'` | CSS selector to filter slotted elements. Use `'*'` to match all elements, `'$all'` to include text nodes |
| `slotName` | `string` | `'default'` | Name of the slot to watch. Use `'*'` to watch all slots |
| `callback` | `PropertyKey` | `'{property}Changed'` | Name of the callback method to invoke when slotted content changes |

## Querying All Nodes Including Text Nodes

By default, `@slotted` only tracks element nodes. To include text nodes, use the special query `'$all'`:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class TextAwareComponent {
  // Track all nodes including text nodes
  @slotted('$all') allNodes: Node[];

  allNodesChanged(newNodes: Node[], oldNodes: Node[]) {
    const textContent = newNodes
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent?.trim())
      .filter(Boolean)
      .join(' ');

    console.log('Text content:', textContent);
  }
}
```

## Complex Selectors

The `query` parameter accepts any valid CSS selector:

```typescript
import { slotted } from '@aurelia/runtime-html';

export class ComplexSelectors {
  // Only direct children with specific class
  @slotted('> .direct-child') directChildren: Element[];

  // Elements with specific data attribute
  @slotted('[data-type="widget"]') widgets: Element[];

  // Multiple selectors
  @slotted('button, a, input') interactiveElements: Element[];

  // Pseudo-selectors
  @slotted(':not(.excluded)') includedElements: Element[];
}
```

## Complete Example: Dynamic Tab Component

Here's a comprehensive example showing how to build a tab component using `@slotted`:

```typescript
// tab-panel.ts
import { slotted } from '@aurelia/runtime-html';

export class TabPanel {
  @slotted('.tab-header') tabHeaders: Element[];
  @slotted('.tab-content') tabContents: Element[];

  private activeIndex: number = 0;

  tabHeadersChanged(newHeaders: Element[]) {
    this.setupTabs();
  }

  tabContentsChanged(newContents: Element[]) {
    this.setupTabs();
  }

  private setupTabs() {
    if (this.tabHeaders.length === 0 || this.tabContents.length === 0) return;

    // Setup click handlers on headers
    this.tabHeaders.forEach((header, index) => {
      header.addEventListener('click', () => this.activateTab(index));
      header.setAttribute('role', 'tab');
      header.setAttribute('tabindex', index === this.activeIndex ? '0' : '-1');
    });

    // Setup content panels
    this.tabContents.forEach((content, index) => {
      content.setAttribute('role', 'tabpanel');
    });

    this.activateTab(this.activeIndex);
  }

  private activateTab(index: number) {
    if (index < 0 || index >= this.tabHeaders.length) return;

    this.activeIndex = index;

    // Update headers
    this.tabHeaders.forEach((header, i) => {
      header.classList.toggle('active', i === index);
      header.setAttribute('aria-selected', String(i === index));
      header.setAttribute('tabindex', i === index ? '0' : '-1');
    });

    // Update content
    this.tabContents.forEach((content, i) => {
      content.classList.toggle('active', i === index);
      content.setAttribute('aria-hidden', String(i !== index));
    });
  }
}
```

```html
<!-- tab-panel.html -->
<div class="tab-panel" role="tablist">
  <au-slot></au-slot>
</div>
```

**Usage:**

```html
<tab-panel>
  <div class="tab-header">Profile</div>
  <div class="tab-content">
    <h2>User Profile</h2>
    <p>Profile information goes here...</p>
  </div>

  <div class="tab-header">Settings</div>
  <div class="tab-content">
    <h2>Settings</h2>
    <p>User settings go here...</p>
  </div>

  <div class="tab-header">Messages</div>
  <div class="tab-content">
    <h2>Messages</h2>
    <p>User messages go here...</p>
  </div>
</tab-panel>
```

## Subscribing to Changes Programmatically

The property decorated with `@slotted` has a special `getObserver()` method that returns a subscriber collection:

```typescript
import { slotted } from '@aurelia/runtime-html';
import { ICustomElementController } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export class ObservableSlots {
  private controller = resolve(ICustomElementController);

  @slotted('.item') items: Element[];

  bound() {
    // Get the observer for the slotted property
    const observer = (this.items as any).getObserver?.();

    if (observer) {
      observer.subscribe({
        handleSlotChange: (nodes: Node[]) => {
          console.log('Items changed via subscription:', nodes);
        }
      });
    }
  }
}
```

## Lifecycle and Timing

The `@slotted` decorator integrates with Aurelia's lifecycle:

- **Activation**: The watcher starts observing during the `binding` lifecycle
- **Deactivation**: The watcher stops observing during the `unbinding` lifecycle
- **Initial Callback**: The change callback is invoked after `bound` with the initial slotted elements
- **Updates**: The callback is invoked whenever slotted content changes (elements added, removed, or reordered)

```typescript
import { slotted } from '@aurelia/runtime-html';

export class LifecycleExample {
  @slotted('.item') items: Element[];

  binding() {
    console.log('Component binding - watcher will start soon');
  }

  bound() {
    console.log('Component bound - initial items:', this.items);
  }

  itemsChanged(newItems: Element[]) {
    console.log('Items changed:', newItems);
    // This will be called:
    // 1. After bound() with initial elements
    // 2. Whenever slotted content changes
  }

  unbinding() {
    console.log('Component unbinding - watcher will stop');
  }
}
```

## Comparison with @children Decorator

Both `@slotted` and `@children` decorators watch for changes in child elements, but they serve different purposes:

| Feature | @slotted | @children |
|---------|----------|-----------|
| **Purpose** | Watch slotted content projected into `<au-slot>` | Watch direct child elements of the host |
| **Use with** | Shadow DOM or `<au-slot>` components | Any component |
| **Filters by** | CSS selector + slot name | CSS selector only |
| **Tracks** | Content from parent component | Direct children only |
| **Best for** | Content projection scenarios | Observing component's immediate children |

**Use `@slotted` when:**
- You're using `<au-slot>` for content projection
- You need to track which content was projected into which slot
- You want to filter projected content by selector

**Use `@children` when:**
- You need to observe the direct children of your component's host element
- You're not using slots
- You need access to child component view models (via the `filter` and `map` options)

## Important Notes

- The `@slotted` decorator only works with `<au-slot>`, not native `<slot>` elements
- The decorated property becomes read-only; attempting to set it manually has no effect
- Changes to the slotted content are detected via `MutationObserver`, so deep changes within slotted elements aren't automatically detected
- The query selector is evaluated against each slotted node; complex selectors may impact performance with many slotted elements

## See Also

- [Slotted Content](../components/shadow-dom-and-slots.md) - Overview of slots in Aurelia
- [@children Decorator](../components/shadow-dom-and-slots.md#at-the-projection-source-custom-element-host-with-the-children-decorator) - Alternative for watching child elements
- [Custom Elements](../components/components.md) - Building custom elements
- [Lifecycle Hooks](../components/component-lifecycles.md) - Component lifecycle integration

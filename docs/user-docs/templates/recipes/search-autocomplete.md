# Search with Autocomplete

A complete autocomplete/typeahead search component with keyboard navigation, highlighting, and debouncing.

## Features Demonstrated

- **Two-way data binding** - Search input
- **Debouncing** - Optimize API calls
- **Computed properties** - Filtered results
- **Keyboard navigation** - Arrow keys, Enter, Escape
- **Focus management** - Keep track of selected item
- **Click outside** - Close dropdown
- **Custom attributes** - Auto-focus
- **Template references** - Access DOM elements
- **Conditional rendering** - Loading states, empty states

## Code

### Component (search-autocomplete.ts)

```typescript
// src/components/search-autocomplete.ts
import { bindable, INode, IPlatform } from '@aurelia/runtime-html';
import { resolve } from '@aurelia/kernel';

export interface SearchResult {
  id: string | number;
  title: string;
  description?: string;
  image?: string;
  category?: string;
}

export class SearchAutocomplete {
  @bindable placeholder = 'Search...';
  @bindable minLength = 2;
  @bindable debounceMs = 300;
  @bindable maxResults = 10;
  @bindable onSelect: (result: SearchResult) => void;
  @bindable onSearch: (query: string) => Promise<SearchResult[]>;

  private query = '';
  private results: SearchResult[] = [];
  private isOpen = false;
  private isLoading = false;
  private selectedIndex = -1;
  private searchTimeout: any = null;

  private inputElement?: HTMLInputElement;
  private dropdownElement?: HTMLElement;
  private clickOutsideListener?: (e: MouseEvent) => void;
  private readonly platform = resolve(IPlatform);
  private readonly element = resolve(INode);

  attached() {
    // Listen for clicks outside to close dropdown
    this.clickOutsideListener = (e: MouseEvent) => {
      if (!this.element.contains(e.target as Node)) {
        this.close();
      }
    };

    this.platform.document?.addEventListener('click', this.clickOutsideListener);
  }

  detaching() {
    // Clean up event listener
    if (this.clickOutsideListener) {
      this.platform.document?.removeEventListener('click', this.clickOutsideListener);
    }

    // Clean up timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private async performSearch() {
    if (!this.query || this.query.length < this.minLength) {
      this.results = [];
      this.isOpen = false;
      return;
    }

    this.isLoading = true;
    this.isOpen = true;

    try {
      if (this.onSearch) {
        // Use custom search function
        this.results = await this.onSearch(this.query);
      } else {
        // Use default search (for demo purposes)
        this.results = await this.defaultSearch(this.query);
      }

      // Limit results
      this.results = this.results.slice(0, this.maxResults);

      // Reset selection
      this.selectedIndex = -1;
    } catch (error) {
      console.error('Search failed:', error);
      this.results = [];
    } finally {
      this.isLoading = false;
    }
  }

  // Default search implementation (replace with real API)
  private async defaultSearch(query: string): Promise<SearchResult[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockData: SearchResult[] = [
      { id: 1, title: 'Getting Started with Aurelia', category: 'Tutorial' },
      { id: 2, title: 'Advanced Routing', category: 'Guide' },
      { id: 3, title: 'Dependency Injection', category: 'Concept' },
      { id: 4, title: 'Template Syntax', category: 'Reference' },
      { id: 5, title: 'Validation Plugin', category: 'Plugin' },
    ];

    return mockData.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category?.toLowerCase().includes(query.toLowerCase())
    );
  }

  queryChanged(newValue: string, oldValue: string) {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce the search
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, this.debounceMs);
  }

  handleKeydown(event: KeyboardEvent) {
    if (!this.isOpen || this.results.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
        this.scrollToSelected();
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.scrollToSelected();
        break;

      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectResult(this.results[this.selectedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private scrollToSelected() {
    if (!this.dropdownElement || this.selectedIndex < 0) {
      return;
    }

    const selectedElement = this.dropdownElement.querySelector(
      `.autocomplete-item[data-index="${this.selectedIndex}"]`
    ) as HTMLElement;

    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  selectResult(result: SearchResult) {
    if (this.onSelect) {
      this.onSelect(result);
    }

    // Set input to selected title
    this.query = result.title;

    // Close dropdown
    this.close();
  }

  close() {
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  highlightMatch(text: string, query: string): string {
    if (!query) return text;

    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  get showEmpty(): boolean {
    return this.isOpen &&
      !this.isLoading &&
      this.query.length >= this.minLength &&
      this.results.length === 0;
  }
}
```

### Template (search-autocomplete.html)

```html
<!-- src/components/search-autocomplete.html -->
<div class="autocomplete">
  <!-- Search input -->
  <div class="autocomplete-input-wrapper">
      <input
        ref="inputElement"
        type="text"
        value.bind="query"
        keydown.trigger="handleKeydown($event)"
        placeholder.bind="placeholder"
        autocomplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded.bind="isOpen"
        aria-controls="autocomplete-dropdown"
        aria-activedescendant.bind="selectedIndex >= 0 ? `result-${selectedIndex}` : undefined"
        class="autocomplete-input">

      <!-- Loading spinner -->
      <div if.bind="isLoading" class="autocomplete-spinner">
        <span class="spinner"></span>
      </div>

      <!-- Clear button -->
      <button
        if.bind="query && !isLoading"
        type="button"
        click.trigger="query = ''; close()"
        class="autocomplete-clear"
        aria-label="Clear search">
        ×
      </button>
    </div>

    <!-- Dropdown -->
    <div
      if.bind="isOpen"
      ref="dropdownElement"
      id="autocomplete-dropdown"
      role="listbox"
      class="autocomplete-dropdown">

      <!-- Results -->
      <div
        repeat.for="result of results"
        data-index.bind="$index"
        id="result-${$index}"
        role="option"
        aria-selected.bind="selectedIndex === $index"
        click.trigger="selectResult(result)"
        class="autocomplete-item ${selectedIndex === $index ? 'selected' : ''}">

        <!-- Image (if provided) -->
        <img
          if.bind="result.image"
          src.bind="result.image"
          alt=""
          class="autocomplete-item-image">

        <div class="autocomplete-item-content">
          <div
            class="autocomplete-item-title"
            innerhtml.bind="highlightMatch(result.title, query)"></div>

          <div
            if.bind="result.description"
            class="autocomplete-item-description">
            ${result.description}
          </div>

          <div
            if.bind="result.category"
            class="autocomplete-item-category">
            ${result.category}
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div if.bind="showEmpty" class="autocomplete-empty">
        No results found for "${query}"
      </div>
    </div>
  </div>
```

### Styles (search-autocomplete.css)

```css
.autocomplete {
  position: relative;
  width: 100%;
}

.autocomplete-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.autocomplete-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.autocomplete-input:focus {
  border-color: #2196f3;
}

.autocomplete-spinner {
  position: absolute;
  right: 1rem;
  display: flex;
  align-items: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: #2196f3;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.autocomplete-clear {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 1;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.autocomplete-clear:hover {
  background-color: #f5f5f5;
  color: #333;
}

.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.autocomplete-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.15s;
  border-bottom: 1px solid #f5f5f5;
}

.autocomplete-item:last-child {
  border-bottom: none;
}

.autocomplete-item:hover,
.autocomplete-item.selected {
  background-color: #f5f5f5;
}

.autocomplete-item-image {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.autocomplete-item-content {
  flex-grow: 1;
  min-width: 0;
}

.autocomplete-item-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.25rem;
}

.autocomplete-item-title mark {
  background-color: #ffeb3b;
  padding: 0 2px;
  border-radius: 2px;
}

.autocomplete-item-description {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.autocomplete-item-category {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.autocomplete-empty {
  padding: 2rem 1rem;
  text-align: center;
  color: #999;
}
```

### Usage Example

```typescript
// src/pages/search-page.ts
import { IRouter } from '@aurelia/router';
import { resolve } from '@aurelia/kernel';

export class SearchPage {
  private readonly router = resolve(IRouter);

  async searchProducts(query: string) {
    const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
    return response.json();
  }

  handleSelect(result: any) {
    console.log('Selected:', result);
    this.router.load(`products/${result.id}`);
  }
}
```

```html
<!-- src/pages/search-page.html -->
<div class="search-page">
  <h1>Search Products</h1>

  <search-autocomplete
    placeholder="Search for products..."
    min-length.bind="2"
    debounce-ms.bind="300"
    max-results.bind="10"
    on-search.bind="searchProducts"
    on-select.bind="handleSelect">
  </search-autocomplete>
</div>
```

## How It Works

### Debouncing

The `queryChanged` callback uses setTimeout to debounce API calls. When the user types, previous timers are cleared, so only the final query triggers a search after the specified delay.

### Keyboard Navigation

The component handles arrow keys to navigate results, Enter to select, and Escape to close. The selected index tracks which item is highlighted, and `scrollIntoView` ensures it's visible.

### Click Outside

A global click listener detects clicks outside the component and closes the dropdown. The listener is added in `attached()` and cleaned up in `detaching()`.

### Highlighting Matches

The `highlightMatch` method uses regex to wrap matching text in `<mark>` tags. The result is bound with `innerhtml.bind` to render the HTML.

{% hint style="warning" %}
**Security Note**

Be careful with `innerhtml.bind`. In this case it's safe because we're only highlighting text we control. For user-generated content, use the `sanitize` value converter.
{% endhint %}

### Accessibility

- `role="combobox"` on input
- `role="listbox"` on dropdown
- `role="option"` on results
- `aria-expanded` indicates dropdown state
- `aria-activedescendant` points to selected item
- Keyboard navigation follows ARIA practices

## Variations

### Recent Searches

Store and show recent searches when input is focused but empty:

```typescript
private recentSearches: string[] = [];

attached() {
  // Load from localStorage
  const stored = localStorage.getItem('recent-searches');
  if (stored) {
    this.recentSearches = JSON.parse(stored);
  }
}

selectResult(result: SearchResult) {
  // Save to recent searches
  this.recentSearches = [
    result.title,
    ...this.recentSearches.filter(s => s !== result.title)
  ].slice(0, 5);

  localStorage.setItem('recent-searches', JSON.stringify(this.recentSearches));

  // ... rest of implementation
}
```

### Grouped Results

Group results by category:

```typescript
get groupedResults() {
  const groups = new Map<string, SearchResult[]>();

  this.results.forEach(result => {
    const category = result.category || 'Other';
    if (!groups.has(category)) {
      groups.set(category, []);
    }
    groups.get(category)!.push(result);
  });

  return Array.from(groups.entries());
}
```

```html
<div repeat.for="[category, items] of groupedResults">
  <div class="autocomplete-group-header">${category}</div>
  <div repeat.for="item of items" class="autocomplete-item">
    <!-- item content -->
  </div>
</div>
```

### Infinite Scroll

Load more results as user scrolls:

```typescript
handleScroll(event: Event) {
  const element = event.target as HTMLElement;
  const bottom = element.scrollHeight - element.scrollTop === element.clientHeight;

  if (bottom && !this.isLoading && this.hasMoreResults) {
    this.loadMore();
  }
}
```

## Related

- [Event Binding](../template-syntax/event-binding.md) - Keyboard events
- [Conditional Rendering](../conditional-rendering.md) - `if.bind` documentation
- [Template References](../template-syntax/template-references.md) - `ref` attribute
- [Bindable Properties](../../components/bindable-properties.md) - Component inputs
- [Value Converters](../value-converters.md) - `sanitize` for HTML binding

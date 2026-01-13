# Product Catalog with Search & Filters

A complete product catalog featuring real-time search, category filtering, sorting, and responsive design. This recipe demonstrates how to build a performant, user-friendly product browsing experience.

## Features Demonstrated

- **Two-way data binding** - Search input with instant updates
- **Computed properties** - Filtered product list based on search and filters
- **`repeat.for` with keys** - Efficient list rendering
- **Event handling** - Sort buttons, filter checkboxes
- **Conditional rendering** - Empty states, loading states
- **Value converters** - Currency formatting
- **CSS class binding** - Active filters, selected sort order
- **Debouncing** - Optimize search performance

## Code

### View Model (product-catalog.ts)

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  rating: number;
}

type SortOption = 'name' | 'price-low' | 'price-high' | 'rating';

export class ProductCatalog {
  // Data
  products: Product[] = [
    {
      id: 1,
      name: 'Wireless Headphones',
      description: 'Premium noise-canceling headphones with 30-hour battery',
      price: 299.99,
      category: 'Audio',
      image: '/images/headphones.jpg',
      inStock: true,
      rating: 4.5
    },
    {
      id: 2,
      name: 'Smart Watch',
      description: 'Fitness tracking with heart rate monitor and GPS',
      price: 399.99,
      category: 'Wearables',
      image: '/images/smartwatch.jpg',
      inStock: true,
      rating: 4.2
    },
    {
      id: 3,
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum stand for better posture',
      price: 49.99,
      category: 'Accessories',
      image: '/images/stand.jpg',
      inStock: false,
      rating: 4.8
    },
    {
      id: 4,
      name: 'Mechanical Keyboard',
      description: 'RGB backlit with customizable switches',
      price: 159.99,
      category: 'Accessories',
      image: '/images/keyboard.jpg',
      inStock: true,
      rating: 4.6
    },
    {
      id: 5,
      name: 'USB-C Hub',
      description: '7-in-1 adapter with 4K HDMI and SD card reader',
      price: 79.99,
      category: 'Accessories',
      image: '/images/hub.jpg',
      inStock: true,
      rating: 4.3
    },
    {
      id: 6,
      name: 'Wireless Earbuds',
      description: 'True wireless with active noise cancellation',
      price: 199.99,
      category: 'Audio',
      image: '/images/earbuds.jpg',
      inStock: true,
      rating: 4.4
    }
  ];

  // Filter state
  searchQuery = '';
  selectedCategories: string[] = [];
  sortBy: SortOption = 'name';
  showOutOfStock = true;

  // Computed property for unique categories
  get categories(): string[] {
    return [...new Set(this.products.map(p => p.category))].sort();
  }

  // Computed property for filtered and sorted products
  get filteredProducts(): Product[] {
    let filtered = this.products;

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Filter by selected categories
    if (this.selectedCategories.length > 0) {
      filtered = filtered.filter(p =>
        this.selectedCategories.includes(p.category)
      );
    }

    // Filter out of stock if needed
    if (!this.showOutOfStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Sort products
    return this.sortProducts(filtered);
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery.trim() !== '' ||
           this.selectedCategories.length > 0 ||
           !this.showOutOfStock;
  }

  private sortProducts(products: Product[]): Product[] {
    const sorted = [...products];

    switch (this.sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategories = [];
    this.showOutOfStock = true;
  }

  setSortOrder(sortOption: SortOption) {
    this.sortBy = sortOption;
  }
}
```

### Template (product-catalog.html)

```html
<div class="product-catalog">
  <!-- Header -->
  <header class="catalog-header">
    <h1>Product Catalog</h1>
    <p class="result-count">
      Showing ${filteredProducts.length} of ${products.length} products
    </p>
  </header>

  <!-- Search and Filters -->
  <div class="filters-section">
    <!-- Search Bar -->
    <div class="search-box">
      <input
        type="search"
        value.bind="searchQuery & debounce:300"
        placeholder="Search products..."
        class="search-input">
      <span class="search-icon">🔍</span>
    </div>

    <!-- Category Filters -->
    <div class="filter-group">
      <h3>Categories</h3>
      <label repeat.for="category of categories" class="filter-option">
        <input
          type="checkbox"
          model.bind="category"
          checked.bind="selectedCategories">
        ${category}
      </label>
    </div>

    <!-- Availability Filter -->
    <div class="filter-group">
      <label class="filter-option">
        <input type="checkbox" checked.bind="showOutOfStock">
        Show out of stock items
      </label>
    </div>

    <!-- Clear Filters -->
    <button
      if.bind="hasActiveFilters"
      click.trigger="clearFilters()"
      class="clear-filters-btn">
      Clear All Filters
    </button>
  </div>

  <!-- Sort Options -->
  <div class="sort-section">
    <label>Sort by:</label>
    <button
      click.trigger="setSortOrder('name')"
      class="sort-btn ${sortBy === 'name' ? 'active' : ''}">
      Name
    </button>
    <button
      click.trigger="setSortOrder('price-low')"
      class="sort-btn ${sortBy === 'price-low' ? 'active' : ''}">
      Price: Low to High
    </button>
    <button
      click.trigger="setSortOrder('price-high')"
      class="sort-btn ${sortBy === 'price-high' ? 'active' : ''}">
      Price: High to Low
    </button>
    <button
      click.trigger="setSortOrder('rating')"
      class="sort-btn ${sortBy === 'rating' ? 'active' : ''}">
      Rating
    </button>
  </div>

  <!-- Product Grid -->
  <div class="product-grid" if.bind="filteredProducts.length > 0">
    <div
      repeat.for="product of filteredProducts; key: id"
      class="product-card ${product.inStock ? '' : 'out-of-stock'}">

      <!-- Product Image -->
      <div class="product-image">
        <img src.bind="product.image" alt.bind="product.name">
        <span if.bind="!product.inStock" class="stock-badge">Out of Stock</span>
      </div>

      <!-- Product Info -->
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>

        <!-- Rating -->
        <div class="product-rating">
          <span repeat.for="star of 5" class="star ${star < product.rating ? 'filled' : ''}">
            ★
          </span>
          <span class="rating-value">${product.rating}</span>
        </div>

        <!-- Price and Actions -->
        <div class="product-footer">
          <span class="product-price">${product.price | currency:'USD'}</span>
          <button
            class="add-to-cart-btn"
            disabled.bind="!product.inStock"
            click.trigger="addToCart(product)">
            ${product.inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Empty State -->
  <div if.bind="filteredProducts.length === 0" class="empty-state">
    <p class="empty-icon">📦</p>
    <h2>No products found</h2>
    <p>Try adjusting your search or filters</p>
    <button click.trigger="clearFilters()" class="btn-primary">
      Clear Filters
    </button>
  </div>
</div>
```

### Styles (product-catalog.css)

```css
.product-catalog {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.catalog-header {
  margin-bottom: 2rem;
}

.result-count {
  color: #666;
  margin-top: 0.5rem;
}

.filters-section {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.filter-group {
  margin-bottom: 1rem;
}

.filter-group h3 {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  color: #333;
}

.filter-option {
  display: block;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.filter-option input {
  margin-right: 0.5rem;
}

.clear-filters-btn {
  background: #fff;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.clear-filters-btn:hover {
  background: #f0f0f0;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.sort-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: #007bff;
}

.sort-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-card.out-of-stock {
  opacity: 0.6;
}

.product-image {
  position: relative;
  height: 200px;
  background: #f5f5f5;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stock-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #dc3545;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.product-info {
  padding: 1rem;
}

.product-name {
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
  color: #333;
}

.product-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.star {
  color: #ddd;
  font-size: 1rem;
}

.star.filled {
  color: #ffc107;
}

.rating-value {
  margin-left: 0.25rem;
  color: #666;
  font-size: 0.9rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: #007bff;
}

.add-to-cart-btn {
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #218838;
}

.add-to-cart-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }

  .sort-section {
    font-size: 0.9rem;
  }

  .sort-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}
```

## How It Works

### 1. Search with Debouncing

The search input uses debouncing to avoid excessive filtering operations:

```html
<input value.bind="searchQuery & debounce:300">
```

This waits 300ms after the user stops typing before updating `searchQuery`, which triggers the `filteredProducts` computed property.

### 2. Reactive Filtering

The `filteredProducts` getter automatically recalculates when any filter changes:

```typescript
get filteredProducts(): Product[] {
  // Filters are applied in sequence
  // Search → Categories → Stock availability → Sort
}
```

### 3. Multiple Checkbox Selection

Category filters use array binding:

```html
<input type="checkbox" model.bind="category" checked.bind="selectedCategories">
```

Aurelia automatically adds/removes items from the `selectedCategories` array.

### 4. Efficient List Rendering

Using `key: id` tells Aurelia to track products by ID, enabling efficient DOM updates when sorting or filtering:

```html
<div repeat.for="product of filteredProducts; key: id">
```

### 5. Dynamic CSS Classes

The active sort button and out-of-stock cards use class binding:

```html
<button class="sort-btn ${sortBy === 'name' ? 'active' : ''}">
<div class="product-card ${product.inStock ? '' : 'out-of-stock'}">
```

## Variations

### Add Price Range Filter

```typescript
minPrice = 0;
maxPrice = 500;

get filteredProducts(): Product[] {
  // ... existing filters
  filtered = filtered.filter(p =>
    p.price >= this.minPrice && p.price <= this.maxPrice
  );
  // ... sort
}
```

```html
<div class="filter-group">
  <h3>Price Range</h3>
  <input type="range" min="0" max="500" value.bind="minPrice">
  <input type="range" min="0" max="500" value.bind="maxPrice">
  <p>${minPrice | currency} - ${maxPrice | currency}</p>
</div>
```

### Add to Cart Functionality

```typescript
cart: Product[] = [];

addToCart(product: Product) {
  this.cart.push(product);
  // Show notification
  console.log(`Added ${product.name} to cart`);
}
```

### Persist Filters in URL

Use the router to save filter state:

```typescript
import { resolve } from 'aurelia';
import { IRouter } from '@aurelia/router';

export class ProductCatalog {
  private readonly router = resolve(IRouter);

  searchQueryChanged() {
    this.router.load({
      query: { search: this.searchQuery }
    });
  }
}
```

## Related

- [Shopping Cart Recipe](shopping-cart.md)
- [Data Table Recipe](data-table.md)
- [List Rendering Guide](../repeats-and-list-rendering.md)
- [Conditional Rendering](../conditional-rendering.md)
- [Value Converters](../value-converters.md)

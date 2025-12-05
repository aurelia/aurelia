# Shopping Cart

A complete shopping cart implementation with add/remove items, quantity updates, and dynamic total calculations. Demonstrates reactive data management and user interaction patterns.

## Features Demonstrated

- **Array manipulation** - Add, remove, update cart items
- **Lambda expressions** - Complex calculations directly in templates using `reduce`, `filter`, etc.
- **Event handling** - Button clicks, quantity changes
- **Conditional rendering** - Empty cart state, checkout button
- **List rendering with keys** - Efficient cart item updates
- **Two-way binding** - Quantity inputs
- **Number formatting** - Currency display
- **Component state management** - Cart as a service

## Code

### View Model (shopping-cart.ts)

```typescript
export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
}

export class ShoppingCart {
  cartItems: CartItem[] = [];

  // Add item to cart
  addToCart(product: { id: number; name: string; price: number; image: string; maxQuantity: number }) {
    const existingItem = this.cartItems.find(item => item.productId === product.id);

    if (existingItem) {
      // Increase quantity if item already in cart
      if (existingItem.quantity < existingItem.maxQuantity) {
        existingItem.quantity++;
      } else {
        alert(`Maximum quantity (${existingItem.maxQuantity}) reached for ${existingItem.name}`);
      }
    } else {
      // Add new item
      this.cartItems.push({
        id: Date.now(), // Simple ID generation
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        maxQuantity: product.maxQuantity
      });
    }
  }

  // Update item quantity
  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(item);
    } else if (newQuantity <= item.maxQuantity) {
      item.quantity = newQuantity;
    } else {
      item.quantity = item.maxQuantity;
      alert(`Maximum quantity is ${item.maxQuantity}`);
    }
  }

  // Increase quantity
  increaseQuantity(item: CartItem) {
    if (item.quantity < item.maxQuantity) {
      item.quantity++;
    } else {
      alert(`Maximum quantity (${item.maxQuantity}) reached`);
    }
  }

  // Decrease quantity
  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(item);
    }
  }

  // Remove item from cart
  removeItem(item: CartItem) {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  // Clear entire cart
  clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartItems = [];
    }
  }

  // Proceed to checkout
  checkout() {
    console.log('Proceeding to checkout with:', this.cartItems);
    alert('Proceeding to checkout...');
    // In a real app, navigate to checkout page or open checkout modal
  }
}
```

### Currency Value Converter (currency-value-converter.ts)

```typescript
import { valueConverter } from 'aurelia';

@valueConverter('currency')
export class CurrencyValueConverter {
  toView(value: number, currencyCode = 'USD'): string {
    if (value == null) return '';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  }
}
```

### Template (shopping-cart.html)

```html
<import from="./currency-value-converter"></import>

<div class="shopping-cart">
  <!-- Cart Header -->
  <header class="cart-header">
    <h1>
      Shopping Cart
      <span class="item-count" if.bind="cartItems.length">
        (${cartItems.reduce((sum, item) => sum + item.quantity, 0)} ${cartItems.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'items'})
      </span>
    </h1>
    <button
      if.bind="cartItems.length"
      click.trigger="clearCart()"
      class="clear-btn">
      Clear Cart
    </button>
  </header>

  <!-- Empty Cart State -->
  <div if.bind="!cartItems.length" class="empty-cart">
    <div class="empty-icon">🛒</div>
    <h2>Your cart is empty</h2>
    <p>Add some products to get started!</p>
  </div>

  <!-- Cart Items -->
  <div else class="cart-content">
    <!-- Cart Items List -->
    <div class="cart-items">
      <div
        repeat.for="item of cartItems; key: id"
        class="cart-item">

        <!-- Product Image -->
        <div class="item-image">
          <img src.bind="item.image" alt.bind="item.name">
        </div>

        <!-- Product Details -->
        <div class="item-details">
          <h3 class="item-name">${item.name}</h3>
          <p class="item-price">${item.price | currency:'USD'} each</p>

          <!-- Quantity Controls -->
          <div class="quantity-controls">
            <button
              click.trigger="decreaseQuantity(item)"
              class="qty-btn"
              title="Decrease quantity">
              −
            </button>

            <input
              type="number"
              value.bind="item.quantity"
              min="1"
              max.bind="item.maxQuantity"
              change.trigger="updateQuantity(item, item.quantity)"
              class="qty-input">

            <button
              click.trigger="increaseQuantity(item)"
              class="qty-btn"
              disabled.bind="item.quantity >= item.maxQuantity"
              title="Increase quantity">
              +
            </button>

            <span class="max-qty-label" if.bind="item.quantity >= item.maxQuantity">
              (max)
            </span>
          </div>
        </div>

        <!-- Item Total and Remove -->
        <div class="item-actions">
          <div class="item-total">
            ${(item.price * item.quantity) | currency:'USD'}
          </div>
          <button
            click.trigger="removeItem(item)"
            class="remove-btn"
            title="Remove item">
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- Cart Summary -->
    <div class="cart-summary">
      <h2>Order Summary</h2>

      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) | currency:'USD'}</span>
      </div>

      <div class="summary-row">
        <span>Tax (8%):</span>
        <span>${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08 | currency:'USD'}</span>
      </div>

      <div class="summary-row">
        <span>Shipping:</span>
        <span>
          ${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 50
            ? 'FREE'
            : (5.99 | currency:'USD')}
        </span>
      </div>

      <div if.bind="cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) < 50 && cartItems.length" class="shipping-notice">
        <small>💡 Add ${(50 - cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)) | currency:'USD'} more for free shipping!</small>
      </div>

      <hr class="summary-divider">

      <div class="summary-row total-row">
        <strong>Total:</strong>
        <strong class="total-amount">
          ${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
             cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08 +
             (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 50 ? 0 : 5.99)) | currency:'USD'}
        </strong>
      </div>

      <button
        click.trigger="checkout()"
        disabled.bind="!cartItems.length"
        class="checkout-btn">
        Proceed to Checkout
      </button>
    </div>
  </div>
</div>
```

### Styles (shopping-cart.css)

```css
.shopping-cart {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.cart-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.item-count {
  font-size: 1.2rem;
  color: #666;
  font-weight: normal;
}

.clear-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #dc3545;
  color: white;
}

.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-cart h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.empty-cart p {
  color: #666;
}

.cart-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-name {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.item-price {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #007bff;
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-input {
  width: 60px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  font-size: 1rem;
}

.max-qty-label {
  font-size: 0.85rem;
  color: #666;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.item-total {
  font-size: 1.2rem;
  font-weight: 600;
  color: #007bff;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #dc3545;
  background: white;
  color: #dc3545;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #dc3545;
  color: white;
}

.cart-summary {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.cart-summary h2 {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #333;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #666;
}

.shipping-notice {
  background: #e3f2fd;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  text-align: center;
}

.shipping-notice small {
  color: #1976d2;
}

.summary-divider {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 1rem 0;
}

.total-row {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1.5rem;
}

.total-amount {
  color: #007bff;
  font-size: 1.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.checkout-btn:hover:not(:disabled) {
  background: #218838;
}

.checkout-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 0.75rem;
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .cart-summary {
    position: static;
  }
}
```

## How It Works

### 1. Lambda Expressions in Templates

Instead of computed properties in the view model, calculations are done directly in the template using lambda expressions:

```html
<!-- Item count using reduce -->
${cartItems.reduce((sum, item) => sum + item.quantity, 0)}

<!-- Subtotal calculation -->
${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) | currency:'USD'}

<!-- Conditional logic for free shipping -->
${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 50 ? 'FREE' : (5.99 | currency:'USD')}
```

Aurelia's lambda expressions support complex operations like `reduce`, `filter`, `map`, `every`, and `some` directly in templates. The template automatically tracks dependencies and recalculates when `cartItems` changes.

### 2. Array Manipulation

Using array methods ensures change detection:

```typescript
// ✓ Aurelia detects this
this.cartItems.splice(index, 1);

// ✓ Aurelia detects this
this.cartItems.push(newItem);

// ✗ Aurelia won't detect this
this.cartItems[index] = newItem; // Use splice instead
```

### 3. Benefits of Lambda Expressions

Moving calculations to the template has several advantages:

- **Reduced boilerplate** - No need for getter methods in the view model
- **Clear intent** - Calculations are visible right where they're used
- **Single source of truth** - The template directly expresses what data it needs
- **Automatic reactivity** - Aurelia tracks all dependencies within lambda expressions

This approach is particularly useful for derived data that's only needed in the view.

### 4. Efficient List Updates

Using `key: id` allows Aurelia to track items efficiently:

```html
<div repeat.for="item of cartItems; key: id">
```

When items are removed or reordered, Aurelia reuses DOM elements.

### 5. Quantity Validation

Multiple ways to update quantity with validation:

```typescript
updateQuantity(item: CartItem, newQuantity: number) {
  if (newQuantity <= 0) {
    this.removeItem(item);
  } else if (newQuantity <= item.maxQuantity) {
    item.quantity = newQuantity;
  } else {
    item.quantity = item.maxQuantity;
    alert(`Maximum quantity is ${item.maxQuantity}`);
  }
}
```

### 6. Conditional Rendering

Show different UI based on cart state:

```html
<div if.bind="!cartItems.length" class="empty-cart">
  <!-- Empty state -->
</div>

<div else class="cart-content">
  <!-- Cart items and summary -->
</div>
```

Lambda expressions work seamlessly with conditionals: `if.bind="cartItems.length"` or `if.bind="!cartItems.length"`.

### 7. Currency Formatting with Value Converter

The currency value converter formats prices consistently:

```html
${product.price | currency:'USD'}
```

The converter uses `Intl.NumberFormat` for proper currency formatting including the currency symbol, decimal places, and thousands separators. This keeps formatting logic out of the view model.

### 8. When to Use Lambda Expressions vs Computed Properties

**Use lambda expressions in templates when:**
- The calculation is only needed in the view
- The logic is straightforward and readable inline
- You want to reduce view model boilerplate

**Use computed properties in the view model when:**
- The calculation is complex and would make the template hard to read
- The value is used in multiple places (template and view model logic)
- You need to unit test the calculation logic
- The calculation is expensive and you want explicit memoization

For this shopping cart example, the calculations are simple arithmetic operations that are only displayed to the user, making lambda expressions a great fit. They eliminate boilerplate while keeping the template clear and maintainable.

## Variations

### Persist Cart to LocalStorage

```typescript
export class ShoppingCart {
  cartItems: CartItem[] = [];

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartItems = JSON.parse(saved);
    }
  }

  private saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  addToCart(product: any) {
    // ... existing logic
    this.saveCart();
  }

  removeItem(item: CartItem) {
    // ... existing logic
    this.saveCart();
  }
}
```

### Add Discount Codes

```typescript
export class ShoppingCart {
  discountCode = '';
  discountPercentage = 0;

  applyDiscount() {
    const codes: Record<string, number> = {
      'SAVE10': 10,
      'SAVE20': 20,
      'FREESHIP': 0 // Handle free shipping separately
    };

    if (codes[this.discountCode.toUpperCase()]) {
      this.discountPercentage = codes[this.discountCode.toUpperCase()];
    } else {
      alert('Invalid discount code');
    }
  }
}
```

```html
<div class="discount-section">
  <input value.bind="discountCode" placeholder="Enter discount code">
  <button click.trigger="applyDiscount()">Apply</button>
</div>

<!-- In the summary, calculate discount using lambda -->
<div class="summary-row" if.bind="discountPercentage > 0">
  <span>Discount (${discountPercentage}%):</span>
  <span>-${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (discountPercentage / 100) | currency:'USD'}</span>
</div>

<!-- Update total to include discount -->
<div class="summary-row total-row">
  <strong>Total:</strong>
  <strong class="total-amount">
    ${(cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - discountPercentage / 100) +
       cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.08 +
       (cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) >= 50 ? 0 : 5.99)) | currency:'USD'}
  </strong>
</div>
```

### Cart as a Service

Make the cart available throughout the app:

```typescript
// cart.service.ts
import { DI } from 'aurelia';

export const ICartService = DI.createInterface<ICartService>(
  'ICartService',
  x => x.singleton(CartService)
);

export interface ICartService extends CartService {}

export class CartService {
  cartItems: CartItem[] = [];

  // ... all cart methods
}

// Use in components
import { resolve } from 'aurelia';
import { ICartService } from './cart.service';

export class ProductList {
  private readonly cart = resolve(ICartService);

  addToCart(product: Product) {
    this.cart.addToCart(product);
  }
}
```

## Related

- [Product Catalog Recipe](product-catalog.md)
- [Lambda Expressions Guide](../lambda-expressions.md)
- [List Rendering Guide](../repeats-and-list-rendering.md)
- [Computed Properties](../../essentials/reactivity.md)
- [Value Converters](../value-converters.md)

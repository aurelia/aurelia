import { type DashboardState } from './dashboard-state.js';
import { Product } from './product.js';

export class Category {
  products: Product[] = [];

  constructor(
    private readonly state: DashboardState,
    public id: string,
    public name: string
  ) {}

  get aggregatedSalesTrend(): number {
    if (this.products.length === 0) return 0;
    // For example, use the average of all products' computedSalesTrend
    const totalTrend = this.products.reduce((sum, p) => sum + p.computedSalesTrend, 0);
    return totalTrend / this.products.length;
  }

  get aggregatedRecommendedRestock(): number {
    // Sum of all recommended restock levels of products
    return this.products.reduce((sum, p) => sum + p.recommendedRestockLevel, 0);
  }

  get lowStockAlertCount(): number {
    // Count how many products currently have a low inventory alert
    return this.products.filter(p => p.lowInventoryAlert).length;
  }

  addProduct({
    id,
    name,
    categoryId,
    price,
    currentInventory,
    reorderThreshold,
    pendingPurchaseOrderQty
  }: Pick<Product,
    | 'id'
    | 'name'
    | 'categoryId'
    | 'price'
    | 'currentInventory'
    | 'reorderThreshold'
    | 'pendingPurchaseOrderQty'
    >
  ) {
    const product = new Product(
      this.state,
      id,
      name,
      categoryId,
      price,
      currentInventory,
      reorderThreshold,
      pendingPurchaseOrderQty
    );
    this.products.push(product);
    return product;
  }
}

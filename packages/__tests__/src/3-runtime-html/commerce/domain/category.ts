import { Product } from './product.js';

export class Category {
  id: string = '';
  name: string = '';
  products: Product[] = [];

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
}

import { GlobalFilters } from './filters';
import { Category } from './category';
import { TrendAlert, InventoryAlert } from './alerts';
import { Product } from './product';

export class DashboardState {
  globalFilters: GlobalFilters = new GlobalFilters();
  categories: Category[] = [];
  inventoryAlerts: InventoryAlert[] = [];
  trendAlerts: TrendAlert[] = [];

  get activeInventoryAlerts(): InventoryAlert[] {
    // For an inventory alert to be active, we assume:
    // - If it's related to a product, that product's condition should still warrant the alert (e.g., lowInventoryAlert = true)
    // - If it's related to a category, at least one product in that category should still have a lowInventoryAlert.
    return this.inventoryAlerts.filter(alert => {
      if (alert.relatedProductId) {
        const product = this.findProductById(alert.relatedProductId);
        return product ? product.lowInventoryAlert : true;
      }
      if (alert.relatedCategoryId) {
        const category = this.categories.find(c => c.id === alert.relatedCategoryId);
        if (!category) return true;
        return category.products.some(p => p.lowInventoryAlert);
      }
      // If no related IDs, assume it's a general alert and keep it active.
      return true;
    });
  }

  get activeTrendAlerts(): TrendAlert[] {
    // For a trend alert to be active, we can assume:
    // - If relatedCategoryIds are given, the alert should be active if any of those categories are currently selected in globalFilters.
    // - If no categories specified, consider it always active.
    const selectedCategoryIds = this.globalFilters.selectedCategoryIds;
    return this.trendAlerts.filter(alert => {
      if (alert.relatedCategoryIds.length > 0) {
        return alert.relatedCategoryIds.some(catId => selectedCategoryIds.has(catId));
      }
      return true;
    });
  }

  private findProductById(productId: string): Product | undefined {
    for (const category of this.categories) {
      const product = category.products.find(p => p.id === productId);
      if (product) return product;
    }
    return undefined;
  }
}

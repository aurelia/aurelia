import { bindable, customElement } from '@aurelia/runtime-html';
import { Category } from '../domain';
import { ProductListView } from './product-list-view';

@customElement({
  name: 'category-item-view',
  template: `
    <product-list-view products.bind="category.products"></product-list-view>
  `,
  dependencies: [
    ProductListView,
  ]
})
export class CategoryItemView {
  @bindable category: Category;

  get name(): string {
    return this.category.name;
  }

  get aggregatedSalesTrend(): number {
    return this.category.aggregatedSalesTrend;
  }

  get aggregatedRecommendedRestock(): number {
    return this.category.aggregatedRecommendedRestock;
  }

  get lowStockAlertCount(): number {
    return this.category.lowStockAlertCount;
  }
}

import { bindable, customElement } from '@aurelia/runtime-html';
import { ProductListView } from './product-list-view.js';
import { Category } from '../domain/index.js';

@customElement({
  name: 'category-item-view',
  template: `
    <label ref="nameLabel">\${name}</label>
    <product-list-view ref="productListView" products.bind="category.products"></product-list-view>
  `,
  dependencies: [
    ProductListView,
  ]
})
export class CategoryItemView {
  @bindable category: Category;

  nameLabel: HTMLLabelElement;
  productListView: ProductListView;

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

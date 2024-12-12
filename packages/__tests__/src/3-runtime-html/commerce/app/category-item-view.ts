import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { ProductListView } from './product-list-view.js';
import { Category } from '../domain/index.js';

@customElement({
  name: 'category-item-view',
  template: `
    <label ref="nameLabel">\${name}</label>
    <product-list-view component.ref="productListView" products.bind="category.products"></product-list-view>
  `,
  dependencies: [
    ProductListView,
  ]
})
export class CategoryItemView {
  private readonly log = resolve(ILogger).scopeTo('> > CategoryItemView');

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

  hydrating() {
    this.log.debug('hydrating');
  }

  hydrated() {
    this.log.debug('hydrated');
  }

  created() {
    this.log.debug('created');
  }

  binding() {
    this.log.debug('binding');
  }

  bound() {
    this.log.debug('bound');
  }

  attaching() {
    this.log.debug('attaching');
  }

  attached() {
    this.log.debug('attached');
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface CategoryItemView extends ICustomElementViewModel {}

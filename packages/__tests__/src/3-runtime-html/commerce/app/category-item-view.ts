import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { ProductListView } from './product-list-view.js';
import { Category } from '../domain/index.js';
import { assert } from '@aurelia/testing';

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

  binding() {
    this.log.debug('binding');
    this._assertRefsUnbound();
  }

  bound() {
    this.log.debug('bound');
    this._assertRefsBound();
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
    this._assertRefsBound();
  }

  dispose() {
    this.log.debug('dispose');
  }

  _assertRefsUnbound() {
    assert.strictEqual(this.nameLabel, undefined);
    assert.strictEqual(this.productListView, undefined);
  }

  _assertRefsBound() {
    assert.instanceOf(this.nameLabel, HTMLLabelElement);
    assert.instanceOf(this.productListView, ProductListView);
  }
}
export interface CategoryItemView extends ICustomElementViewModel {}

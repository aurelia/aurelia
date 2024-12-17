import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel, Repeat } from '@aurelia/runtime-html';
import { ProductItemView } from './product-item-view.js';
import { Product } from '../domain/index.js';
import { assert } from '@aurelia/testing';

@customElement({
  name: 'product-list-view',
  template: `
    <product-item-view repeat.for="product of products" product.bind="product"></product-item-view>
  `,
  dependencies: [
    ProductItemView,
  ]
})
export class ProductListView {
  private readonly log = resolve(ILogger).scopeTo('> > > ProductListView');

  @bindable products: Product[];
  // Note: these twoWay bindings are a bit contrived but the point is to test data passing
  // through multiple layers of bindings
  @bindable({ mode: 'twoWay' }) showProjectedTrends: boolean;
  @bindable({ mode: 'twoWay' }) enableAutoRestock: boolean;

  get itemViews() {
    return (
      this.$controller!.children.find(x => x.viewModel instanceof Repeat)!.viewModel as Repeat
    ).views.map(x => x.viewModel as ProductItemView);
  }

  binding() {
    this.log.debug('binding');
  }

  bound() {
    this.log.debug('bound');
  }

  attaching() {
    this.log.debug('attaching');
    this._assertRepeatedViewsEmpty();
  }

  attached() {
    this.log.debug('attached');
    this._assertRepeatedViewsMatchState();
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
    this._assertRepeatedViewsMatchState();
  }

  dispose() {
    this.log.debug('dispose');
  }

  _assertRepeatedViewsEmpty() {
    assert.strictEqual(this.itemViews.length, 0);
  }

  _assertRepeatedViewsMatchState() {
    assert.strictEqual(this.itemViews.length, this.products.length);
    this.log.debug(`assertRepeatedViewsMatchState: ${this.products.length} products`);
  }
}
export interface ProductListView extends ICustomElementViewModel {}

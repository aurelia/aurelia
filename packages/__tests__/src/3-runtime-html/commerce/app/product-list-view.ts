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
    assert.strictEqual(this.itemViews.length, 0);
  }

  attached() {
    this.log.debug('attached');
    assert.strictEqual(this.itemViews.length, this.products.length);
    this.log.debug(`verified ${this.products.length} products`);
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
    assert.strictEqual(this.itemViews.length, this.products.length);
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface ProductListView extends ICustomElementViewModel {}

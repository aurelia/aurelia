import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { ProductItemView } from './product-item-view.js';
import { Product } from '../domain/index.js';

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
export interface ProductListView extends ICustomElementViewModel {}

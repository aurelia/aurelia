import { bindable, customElement } from '@aurelia/runtime-html';
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
  @bindable products: Product[];
}

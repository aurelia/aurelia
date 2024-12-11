import { bindable, customElement } from '@aurelia/runtime-html';
import { Product } from '../domain';

@customElement({
  name: 'product-item-view',
  template: `
  `
})
export class ProductItemView {
  @bindable product: Product;

  get name(): string {
    return this.product.name;
  }

  get price(): number {
    return this.product.price;
  }

  get currentInventory(): number {
    return this.product.currentInventory;
  }

  get computedSalesTrend(): number {
    return this.product.computedSalesTrend;
  }

  get recommendedRestockLevel(): number {
    return this.product.recommendedRestockLevel;
  }

  get lowInventoryAlert(): boolean {
    return this.product.lowInventoryAlert;
  }
}

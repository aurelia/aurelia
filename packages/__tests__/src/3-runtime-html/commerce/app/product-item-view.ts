import { bindable, customElement } from '@aurelia/runtime-html';
import { Product } from '../domain/index.js';

@customElement({
  name: 'product-item-view',
  template: `
    <label ref="nameLabel">\${name}</label>
    <label ref="priceLabel">\${price}</label>
    <label ref="currentInventoryLabel">\${currentInventory}</label>
    <label ref="computedSalesTrendLabel">\${computedSalesTrend}</label>
    <label ref="recommendedRestockLevelLabel">\${recommendedRestockLevel}</label>
    <label ref="lowInventoryAlertLabel">\${lowInventoryAlert ? 'Low inventory' : ''}</label>
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

import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
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
  private readonly log = resolve(ILogger).scopeTo('> > > > ProductItemView');

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
export interface ProductItemView extends ICustomElementViewModel {}

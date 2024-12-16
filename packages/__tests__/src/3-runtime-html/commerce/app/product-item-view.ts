import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { Product } from '../domain/index.js';
import { assert } from '@aurelia/testing';

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

  nameLabel: HTMLLabelElement;
  priceLabel: HTMLLabelElement;
  currentInventoryLabel: HTMLLabelElement;
  computedSalesTrendLabel: HTMLLabelElement;
  recommendedRestockLevelLabel: HTMLLabelElement;
  lowInventoryAlertLabel: HTMLLabelElement;

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
    assert.strictEqual(this.priceLabel, undefined);
    assert.strictEqual(this.currentInventoryLabel, undefined);
    assert.strictEqual(this.computedSalesTrendLabel, undefined);
    assert.strictEqual(this.recommendedRestockLevelLabel, undefined);
    assert.strictEqual(this.lowInventoryAlertLabel, undefined);
  }

  _assertRefsBound() {
    assert.instanceOf(this.nameLabel, HTMLLabelElement);
    assert.instanceOf(this.priceLabel, HTMLLabelElement);
    assert.instanceOf(this.currentInventoryLabel, HTMLLabelElement);
    assert.instanceOf(this.computedSalesTrendLabel, HTMLLabelElement);
    assert.instanceOf(this.recommendedRestockLevelLabel, HTMLLabelElement);
    assert.instanceOf(this.lowInventoryAlertLabel, HTMLLabelElement);
  }
}
export interface ProductItemView extends ICustomElementViewModel {}

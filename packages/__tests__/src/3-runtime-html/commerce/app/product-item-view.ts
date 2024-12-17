import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel, INode } from '@aurelia/runtime-html';
import { Product } from '../domain/index.js';
import { assert } from '@aurelia/testing';

@customElement({
  name: 'product-item-view',
  template: `
    <!-- Basic Labels -->
    <label ref="nameLabel">\${name}</label>
    <label ref="priceLabel">\${price}</label>
    <label ref="currentInventoryLabel">\${currentInventory}</label>

    <!-- Editable Fields (Two-Way Bindings) -->
    <div>
      <input ref="nameInput" value.two-way="name" placeholder="Edit product name" />
      <input ref="priceInput" type="number" value.two-way="price" placeholder="Edit product price" />
      <input ref="reorderThresholdInput" type="number" value.two-way="reorderThreshold" placeholder="Set reorder threshold" />
    </div>

    <!-- Conditional UI (if.bind) for Inventory Alerts -->
    <div if.bind="lowInventoryAlert" class="alert alert-warning" ref="lowInventoryAlertDiv">
      This product is low on inventory!
    </div>

    <!-- Repeat Over Historical Sales -->
    <div>
      <h4>Filtered Historical Sales</h4>
      <ul ref="filteredSalesList">
        <li repeat.for="record of filteredHistoricalSales">
          <span>\${record.date.toLocaleDateString()}: \${record.unitsSold} units</span>
        </li>
      </ul>
    </div>

    <!-- Dynamic Projected Trends (Conditional + Computed) -->
    <div if.bind="showProjectedTrends">
      <h4>Forecasted Trends</h4>
      <ul ref="forecastedSalesList">
        <li repeat.for="f of forecastedSalesData">
          <span>\${f.date.toLocaleDateString()}: \${f.projectedUnitsSold} projected units</span>
        </li>
      </ul>
    </div>

    <!-- Attribute/Class Bindings for Trend Indicator -->
    <div class.bind="{ 'trend-positive': computedSalesTrend > 0, 'trend-negative': computedSalesTrend < 0 }" ref="trendIndicatorDiv">
      Current Trend: \${computedSalesTrend > 0 ? 'Positive' : computedSalesTrend < 0 ? 'Negative' : 'Neutral'}
    </div>

    <!-- Buttons for Actions -->
    <div>
      <button ref="recomputeTrendsButton" click.trigger="recomputeTrends()">Recompute Trends</button>
      <button ref="restockButton" click.trigger="manuallyRestockProduct()">Restock Product</button>
    </div>

    <!-- Global Filters Toggles -->
    <div>
      <label>
        <input type="checkbox" ref="projectedTrendsCheckbox" checked.two-way="showProjectedTrends" />
        Show Projected Trends
      </label>
      <label>
        <input type="checkbox" ref="autoRestockCheckbox" checked.two-way="enableAutoRestock" />
        Enable Auto Restock
      </label>
    </div>

    <!-- Recommended Restock Condition -->
    <div if.bind="recommendedRestockLevel > 0" ref="recommendedRestockContainer">
      Recommended Restock: \${recommendedRestockLevel}
    </div>
  `
})
export class ProductItemView {
  private readonly log = resolve(ILogger).scopeTo('> > > > ProductItemView');
  private readonly host = resolve(INode) as HTMLElement;

  @bindable product: Product;
  // Note: these twoWay bindings are a bit contrived but the point is to test data passing
  // through multiple layers of bindings
  @bindable({ mode: 'twoWay' }) showProjectedTrends: boolean;
  @bindable({ mode: 'twoWay' }) enableAutoRestock: boolean;

  nameLabel: HTMLLabelElement;
  priceLabel: HTMLLabelElement;
  currentInventoryLabel: HTMLLabelElement;

  nameInput: HTMLInputElement;
  priceInput: HTMLInputElement;
  reorderThresholdInput: HTMLInputElement;

  lowInventoryAlertDiv: HTMLDivElement;

  filteredSalesList: HTMLUListElement;
  forecastedSalesList: HTMLUListElement;

  trendIndicatorDiv: HTMLDivElement;

  recomputeTrendsButton: HTMLButtonElement;
  restockButton: HTMLButtonElement;

  projectedTrendsCheckbox: HTMLInputElement;
  autoRestockCheckbox: HTMLInputElement;

  recommendedRestockContainer: HTMLDivElement;

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
    this._assertRefsLateBound();
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
    assert.strictEqual(this.nameLabel, undefined, 'nameLabel');
    assert.strictEqual(this.priceLabel, undefined, 'priceLabel');
    assert.strictEqual(this.currentInventoryLabel, undefined, 'currentInventoryLabel');

    assert.strictEqual(this.nameInput, undefined, 'nameInput');
    assert.strictEqual(this.priceInput, undefined, 'priceInput');
    assert.strictEqual(this.reorderThresholdInput, undefined, 'reorderThresholdInput');

    assert.strictEqual(this.lowInventoryAlertDiv, undefined, 'lowInventoryAlertDiv');

    assert.strictEqual(this.filteredSalesList, undefined, 'filteredSalesList');
    assert.strictEqual(this.forecastedSalesList, undefined, 'forecastedSalesList');

    assert.strictEqual(this.trendIndicatorDiv, undefined, 'trendIndicatorDiv');

    assert.strictEqual(this.recomputeTrendsButton, undefined, 'recomputeTrendsButton');
    assert.strictEqual(this.restockButton, undefined, 'restockButton');

    assert.strictEqual(this.projectedTrendsCheckbox, undefined, 'projectedTrendsCheckbox');
    assert.strictEqual(this.autoRestockCheckbox, undefined, 'autoRestockCheckbox');

    assert.strictEqual(this.recommendedRestockContainer, undefined, 'recommendedRestockContainer');
  }

  _assertRefsBound() {
    assert.instanceOf(this.nameLabel, HTMLLabelElement, 'nameLabel');
    assert.instanceOf(this.priceLabel, HTMLLabelElement, 'priceLabel');
    assert.instanceOf(this.currentInventoryLabel, HTMLLabelElement, 'currentInventoryLabel');

    assert.instanceOf(this.nameInput, HTMLInputElement, 'nameInput');
    assert.instanceOf(this.priceInput, HTMLInputElement, 'priceInput');
    assert.instanceOf(this.reorderThresholdInput, HTMLInputElement, 'reorderThresholdInput');

    assert.instanceOf(this.filteredSalesList, HTMLUListElement, 'filteredSalesList');
    assert.instanceOf(this.trendIndicatorDiv, HTMLDivElement, 'trendIndicatorDiv');

    assert.instanceOf(this.recomputeTrendsButton, HTMLButtonElement, 'recomputeTrendsButton');
    assert.instanceOf(this.restockButton, HTMLButtonElement, 'restockButton');

    assert.instanceOf(this.projectedTrendsCheckbox, HTMLInputElement, 'projectedTrendsCheckbox');
    assert.instanceOf(this.autoRestockCheckbox, HTMLInputElement, 'autoRestockCheckbox');
  }

  _assertRefsLateBound() {
    if (this.lowInventoryAlert) {
      assert.instanceOf(this.lowInventoryAlertDiv, HTMLDivElement, 'lowInventoryAlertDiv');
    } else {
      assert.strictEqual(this.lowInventoryAlertDiv, undefined, 'lowInventoryAlertDiv');
    }

    if (this.showProjectedTrends) {
      assert.instanceOf(this.forecastedSalesList, HTMLUListElement, 'forecastedSalesList');
    } else {
      assert.strictEqual(this.forecastedSalesList, undefined, 'forecastedSalesList');
    }

    if (this.recommendedRestockLevel > 0) {
      assert.instanceOf(this.recommendedRestockContainer, HTMLDivElement, 'recommendedRestockContainer');
    } else {
      assert.strictEqual(this.recommendedRestockContainer, undefined, 'recommendedRestockContainer');
    }
  }

  _assertViewsMatchState() {
    this.log.debug('_assertViewsMatchState');
    assert.strictEqual(this.nameLabel.textContent, this.name, 'name');
    assert.strictEqual(this.priceLabel.textContent, this.price.toString(), 'price');
    assert.strictEqual(this.currentInventoryLabel.textContent, this.currentInventory.toString(), 'currentInventory');
  }
}
export interface ProductItemView extends ICustomElementViewModel {}

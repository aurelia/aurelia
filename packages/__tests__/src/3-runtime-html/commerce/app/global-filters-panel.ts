import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { DashboardState, GlobalFilters } from '../domain/index.js';
import { assert } from '@aurelia/testing';

@customElement({
  name: 'global-filters-panel',
  template: `
    <input ref="startDateInput" type="date" value.bind="filters.startDate"></input>
    <input ref="endDateInput" type="date" value.bind="filters.endDate"></input>
    <div ref="selectedCategoryIdsDiv">
      <input type="checkbox" repeat.for="id of filters.selectedCategoryIds"></input>
    </div>
    <input ref="showProjectedTrendsCheckbox" type="checkbox" checked.bind="showProjectedTrends"></input>
    <input ref="enableAutoRestockCheckbox" type="checkbox" checked.bind="enableAutoRestock"></input>
  `
})
export class GlobalFiltersPanel {
  private readonly log = resolve(ILogger).scopeTo('> GlobalFiltersPanel');

  @bindable state: DashboardState;

  startDateInput: HTMLInputElement;
  endDateInput: HTMLInputElement;
  selectedCategoryIdsDiv: HTMLDivElement;
  showProjectedTrendsCheckbox: HTMLInputElement;
  enableAutoRestockCheckbox: HTMLInputElement;

  get filters(): GlobalFilters {
    return this.state.globalFilters;
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
    assert.strictEqual(this.startDateInput, undefined, 'startDateInput');
    assert.strictEqual(this.endDateInput, undefined, 'endDateInput');
    assert.strictEqual(this.selectedCategoryIdsDiv, undefined, 'selectedCategoryIdsDiv');
    assert.strictEqual(this.showProjectedTrendsCheckbox, undefined, 'showProjectedTrendsCheckbox');
    assert.strictEqual(this.enableAutoRestockCheckbox, undefined, 'enableAutoRestockCheckbox');
  }

  _assertRefsBound() {
    assert.instanceOf(this.startDateInput, HTMLInputElement, 'startDateInput');
    assert.instanceOf(this.endDateInput, HTMLInputElement, 'endDateInput');
    assert.instanceOf(this.selectedCategoryIdsDiv, HTMLDivElement, 'selectedCategoryIdsDiv');
    assert.instanceOf(this.showProjectedTrendsCheckbox, HTMLInputElement, 'showProjectedTrendsCheckbox');
    assert.instanceOf(this.enableAutoRestockCheckbox, HTMLInputElement, 'enableAutoRestockCheckbox');
  }
}
export interface GlobalFiltersPanel extends ICustomElementViewModel {}

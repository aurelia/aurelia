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
    assert.strictEqual(this.startDateInput, undefined);
    assert.strictEqual(this.endDateInput, undefined);
    assert.strictEqual(this.selectedCategoryIdsDiv, undefined);
    assert.strictEqual(this.showProjectedTrendsCheckbox, undefined);
    assert.strictEqual(this.enableAutoRestockCheckbox, undefined);
  }

  bound() {
    this.log.debug('bound');
    assert.instanceOf(this.startDateInput, HTMLInputElement);
    assert.instanceOf(this.endDateInput, HTMLInputElement);
    assert.instanceOf(this.selectedCategoryIdsDiv, HTMLDivElement);
    assert.instanceOf(this.showProjectedTrendsCheckbox, HTMLInputElement);
    assert.instanceOf(this.enableAutoRestockCheckbox, HTMLInputElement);
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
    assert.instanceOf(this.startDateInput, HTMLInputElement);
    assert.instanceOf(this.endDateInput, HTMLInputElement);
    assert.instanceOf(this.selectedCategoryIdsDiv, HTMLDivElement);
    assert.instanceOf(this.showProjectedTrendsCheckbox, HTMLInputElement);
    assert.instanceOf(this.enableAutoRestockCheckbox, HTMLInputElement);
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface GlobalFiltersPanel extends ICustomElementViewModel {}

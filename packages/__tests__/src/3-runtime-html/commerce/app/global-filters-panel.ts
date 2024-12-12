import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { DashboardState, GlobalFilters } from '../domain/index.js';

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
  private readonly log = resolve(ILogger).scopeTo('GlobalFiltersPanel');

  @bindable state: DashboardState;

  get filters(): GlobalFilters {
    return this.state.globalFilters;
  }
}
export interface GlobalFiltersPanel extends ICustomElementViewModel {}

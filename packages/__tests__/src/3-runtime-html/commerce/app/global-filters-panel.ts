import { bindable, customElement } from '@aurelia/runtime-html';
import { GlobalFilters, DashboardState } from '../domain';

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
  @bindable state: DashboardState;

  get filters(): GlobalFilters {
    return this.state.globalFilters;
  }
}

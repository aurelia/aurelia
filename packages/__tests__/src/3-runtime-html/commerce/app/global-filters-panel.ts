import { bindable, customElement } from '@aurelia/runtime-html';
import { GlobalFilters, DashboardState } from '../domain';

@customElement({
  name: 'global-filters-panel',
  template: `

  `
})
export class GlobalFiltersPanel {
  @bindable state: DashboardState;

  get filters(): GlobalFilters {
    return this.state.globalFilters;
  }
}

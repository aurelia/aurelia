import { DashboardState } from '../domain';
import { GlobalFiltersPanel } from './global-filters-panel';
import { CategoryOverview } from './category-overview';
import { AlertsPanel } from './alerts-panel';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'app-shell',
  template: `
    <global-filters-panel ref="globalFiltersPanel" state.bind="state"></global-filters-panel>
    <category-overview ref="categoryOverview" state.bind="state"></category-overview>
    <alerts-panel ref="alertsPanel" state.bind="state"></alerts-panel>
  `,
  dependencies: [
    GlobalFiltersPanel,
    CategoryOverview,
    AlertsPanel,
  ]
})
export class AppShell {
  state = new DashboardState();

  globalFiltersPanel: GlobalFiltersPanel;
  categoryOverview: CategoryOverview;
  alertsPanel: AlertsPanel;
}

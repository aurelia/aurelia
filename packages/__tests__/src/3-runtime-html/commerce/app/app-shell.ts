import { DashboardState } from '../domain';
import { GlobalFiltersPanel } from './global-filters-panel';
import { CategoryOverview } from './category-overview';
import { AlertsPanel } from './alerts-panel';
import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'app-shell',
  template: `
    <global-filters-panel state.bind="state"></global-filters-panel>
    <category-overview state.bind="state"></category-overview>
    <alerts-panel state.bind="state"></alerts-panel>
  `,
  dependencies: [
    GlobalFiltersPanel,
    CategoryOverview,
    AlertsPanel,
  ]
})
export class AppShell {
  state = new DashboardState();
}

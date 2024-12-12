import { ILogger, resolve } from '@aurelia/kernel';
import { customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { GlobalFiltersPanel } from './global-filters-panel.js';
import { CategoryOverview } from './category-overview.js';
import { AlertsPanel } from './alerts-panel.js';
import { DashboardState } from '../domain/index.js';

@customElement({
  name: 'app-shell',
  template: `
    <global-filters-panel component.ref="globalFiltersPanel" state.bind="state"></global-filters-panel>
    <category-overview component.ref="categoryOverview" state.bind="state"></category-overview>
    <alerts-panel component.ref="alertsPanel" state.bind="state"></alerts-panel>
  `,
  dependencies: [
    GlobalFiltersPanel,
    CategoryOverview,
    AlertsPanel,
  ]
})
export class AppShell {
  private readonly log = resolve(ILogger).scopeTo('AppShell');

  state = new DashboardState();

  globalFiltersPanel: GlobalFiltersPanel;
  categoryOverview: CategoryOverview;
  alertsPanel: AlertsPanel;
}
export interface AppShell extends ICustomElementViewModel {}

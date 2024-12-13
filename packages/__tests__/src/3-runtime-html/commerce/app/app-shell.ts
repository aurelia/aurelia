import { ILogger, resolve } from '@aurelia/kernel';
import { customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { GlobalFiltersPanel } from './global-filters-panel.js';
import { CategoryOverview } from './category-overview.js';
import { AlertsPanel } from './alerts-panel.js';
import { initDashboardState } from '../data.js';

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

  state = initDashboardState();

  globalFiltersPanel: GlobalFiltersPanel;
  categoryOverview: CategoryOverview;
  alertsPanel: AlertsPanel;

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
  }

  bound() {
    this.log.debug('bound');
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
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface AppShell extends ICustomElementViewModel {}

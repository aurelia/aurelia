import { ILogger, resolve } from '@aurelia/kernel';
import { customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { GlobalFiltersPanel } from './global-filters-panel.js';
import { CategoryOverview } from './category-overview.js';
import { AlertsPanel } from './alerts-panel.js';
import { initDashboardState } from '../data.js';
import { assert } from '@aurelia/testing';

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

  binding() {
    this.log.debug('binding');
    assert.strictEqual(this.globalFiltersPanel, undefined);
    assert.strictEqual(this.categoryOverview, undefined);
    assert.strictEqual(this.alertsPanel, undefined);
  }

  bound() {
    this.log.debug('bound');
    assert.instanceOf(this.globalFiltersPanel, GlobalFiltersPanel);
    assert.instanceOf(this.categoryOverview, CategoryOverview);
    assert.instanceOf(this.alertsPanel, AlertsPanel);
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
    assert.instanceOf(this.globalFiltersPanel, GlobalFiltersPanel);
    assert.instanceOf(this.categoryOverview, CategoryOverview);
    assert.instanceOf(this.alertsPanel, AlertsPanel);
  }

  dispose() {
    this.log.debug('dispose');
  }
}
export interface AppShell extends ICustomElementViewModel {}

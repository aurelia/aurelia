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
    <global-filters-panel component.ref="globalFiltersPanel" state.bind="state">
    </global-filters-panel>

    <category-overview
      component.ref="categoryOverview"
      categories.bind="state.categories"
      show-projected-trends.bind="state.globalFilters.showProjectedTrends"
      enable-auto-restock.bind="state.globalFilters.enableAutoRestock"
    >
    </category-overview>

    <alerts-panel component.ref="alertsPanel" state.bind="state">
    </alerts-panel>
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
    assert.strictEqual(this.globalFiltersPanel, undefined, 'globalFiltersPanel');
    assert.strictEqual(this.categoryOverview, undefined, 'categoryOverview');
    assert.strictEqual(this.alertsPanel, undefined, 'alertsPanel');
  }

  _assertRefsBound() {
    assert.instanceOf(this.globalFiltersPanel, GlobalFiltersPanel, 'globalFiltersPanel');
    assert.instanceOf(this.categoryOverview, CategoryOverview, 'categoryOverview');
    assert.instanceOf(this.alertsPanel, AlertsPanel, 'alertsPanel');
  }

  _assertViewsMatchState() {
    this.log.debug('_assertViewsMatchState');
    this.globalFiltersPanel._assertViewsMatchState();
    this.categoryOverview._assertViewsMatchState();
    this.alertsPanel._assertViewsMatchState();
  }
}
export interface AppShell extends ICustomElementViewModel {}

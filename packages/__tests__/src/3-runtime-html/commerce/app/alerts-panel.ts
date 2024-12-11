import { bindable, customElement } from '@aurelia/runtime-html';
import { DashboardState, InventoryAlert, TrendAlert } from '../domain';

@customElement({
  name: 'alerts-panel',
  template: `
  `
})
export class AlertsPanel {
  @bindable state: DashboardState;

  get inventoryAlerts(): InventoryAlert[] {
    return this.state.activeInventoryAlerts;
  }

  get trendAlerts(): TrendAlert[] {
    return this.state.activeTrendAlerts;
  }

  dismissInventoryAlert(id: string) {
    this.inventoryAlerts.splice(this.inventoryAlerts.findIndex(alert => alert.id === id), 1);
  }

  dismissTrendAlert(id: string) {
    this.trendAlerts.splice(this.trendAlerts.findIndex(alert => alert.id === id), 1);
  }
}

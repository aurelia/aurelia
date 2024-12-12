import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { InventoryAlert, TrendAlert, DashboardState } from '../domain/index.js';

@customElement({
  name: 'inventory-alert',
  template: `
    <button ref="dismissBtn" @click="dismiss()">Dismiss</button>
    <label ref="messageLabel">\${message}</label>
    <label ref="dateGeneratedLabel">\${dateGenerated}</label>
  `
})
export class InventoryAlertView {
  private readonly log = resolve(ILogger).scopeTo('InventoryAlertView');

  @bindable alert: InventoryAlert;
  @bindable state: DashboardState;

  dismissBtn: HTMLButtonElement;
  messageLabel: HTMLLabelElement;
  dateGeneratedLabel: HTMLLabelElement;

  dismiss() {
    this.state.dismissInventoryAlert(this.alert.id);
  }
}
export interface InventoryAlertView extends ICustomElementViewModel {}

@customElement({
  name: 'trend-alert',
  template: `
    <button ref="dismissBtn" @click="dismiss()">Dismiss</button>
    <label ref="messageLabel">\${message}</label>
    <label ref="severityLabel">\${severity}</label>
    <label ref="dateGeneratedLabel">\${dateGenerated}</label>
  `
})
export class TrendAlertView {
  private readonly log = resolve(ILogger).scopeTo('TrendAlertView');

  @bindable alert: TrendAlert;
  @bindable state: DashboardState;

  dismissBtn: HTMLButtonElement;
  messageLabel: HTMLLabelElement;
  severityLabel: HTMLLabelElement;
  dateGeneratedLabel: HTMLLabelElement;

  dismiss() {
    this.state.dismissInventoryAlert(this.alert.id);
  }
}
export interface TrendAlertView extends ICustomElementViewModel {}

@customElement({
  name: 'alerts-panel',
  template: `
    <inventory-alert-view state.bind="state" repeat.for="alert of inventoryAlerts" alert.bind="alert">
    </inventory-alert-view>

    <trend-alert-view state.bind="state" repeat.for="alert of trendAlerts" alert.bind="alert">
    </trend-alert-view>
  `,
  dependencies: [
    InventoryAlertView,
    TrendAlertView,
  ]
})
export class AlertsPanel {
  private readonly log = resolve(ILogger).scopeTo('AlertsPanel');

  @bindable state: DashboardState;

  get inventoryAlerts(): InventoryAlert[] {
    return this.state.activeInventoryAlerts;
  }

  get trendAlerts(): TrendAlert[] {
    return this.state.activeTrendAlerts;
  }
}
export interface AlertsPanel extends ICustomElementViewModel {}

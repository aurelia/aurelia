import { ILogger, resolve } from '@aurelia/kernel';
import { bindable, customElement, ICustomElementViewModel, Repeat } from '@aurelia/runtime-html';
import { InventoryAlert, TrendAlert, DashboardState } from '../domain/index.js';
import { assert } from '@aurelia/testing';

@customElement({
  name: 'inventory-alert',
  template: `
    <button ref="dismissBtn" @click="dismiss()">Dismiss</button>
    <label ref="messageLabel">\${message}</label>
    <label ref="dateGeneratedLabel">\${dateGenerated}</label>
  `
})
export class InventoryAlertView {
  private readonly log = resolve(ILogger).scopeTo('> > InventoryAlertView');

  @bindable alert: InventoryAlert;
  @bindable state: DashboardState;

  dismissBtn: HTMLButtonElement;
  messageLabel: HTMLLabelElement;
  dateGeneratedLabel: HTMLLabelElement;

  dismiss() {
    this.state.dismissInventoryAlert(this.alert.id);
  }

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
    assert.strictEqual(this.dismissBtn, undefined, 'dismissBtn');
    assert.strictEqual(this.messageLabel, undefined, 'messageLabel');
    assert.strictEqual(this.dateGeneratedLabel, undefined, 'dateGeneratedLabel');
  }

  _assertRefsBound() {
    assert.instanceOf(this.dismissBtn, HTMLButtonElement, 'dismissBtn');
    assert.instanceOf(this.messageLabel, HTMLLabelElement, 'messageLabel');
    assert.instanceOf(this.dateGeneratedLabel, HTMLLabelElement, 'dateGeneratedLabel');
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
  private readonly log = resolve(ILogger).scopeTo('> > TrendAlertView');

  @bindable alert: TrendAlert;
  @bindable state: DashboardState;

  dismissBtn: HTMLButtonElement;
  messageLabel: HTMLLabelElement;
  severityLabel: HTMLLabelElement;
  dateGeneratedLabel: HTMLLabelElement;

  dismiss() {
    this.state.dismissInventoryAlert(this.alert.id);
  }

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
    assert.strictEqual(this.dismissBtn, undefined, 'dismissBtn');
    assert.strictEqual(this.messageLabel, undefined, 'messageLabel');
    assert.strictEqual(this.severityLabel, undefined, 'severityLabel');
    assert.strictEqual(this.dateGeneratedLabel, undefined, 'dateGeneratedLabel');
  }

  _assertRefsBound() {
    assert.instanceOf(this.dismissBtn, HTMLButtonElement, 'dismissBtn');
    assert.instanceOf(this.messageLabel, HTMLLabelElement, 'messageLabel');
    assert.instanceOf(this.severityLabel, HTMLLabelElement, 'severityLabel');
    assert.instanceOf(this.dateGeneratedLabel, HTMLLabelElement, 'dateGeneratedLabel');
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
  private readonly log = resolve(ILogger).scopeTo('> AlertsPanel');

  @bindable state: DashboardState;

  get inventoryAlerts(): InventoryAlert[] {
    return this.state.activeInventoryAlerts;
  }

  get trendAlerts(): TrendAlert[] {
    return this.state.activeTrendAlerts;
  }

  get inventoryAlertViews() {
    return (
      this.$controller!.children.filter(x => x.viewModel instanceof Repeat)![0].viewModel as Repeat
    ).views.map(x => x.viewModel as InventoryAlertView);
  }
  get trendAlertViews() {
    return (
      this.$controller!.children.filter(x => x.viewModel instanceof Repeat)![1].viewModel as Repeat
    ).views.map(x => x.viewModel as TrendAlertView);
  }

  binding() {
    this.log.debug('binding');
  }

  bound() {
    this.log.debug('bound');
  }

  attaching() {
    this.log.debug('attaching');
    this._assertRepeatedViewsEmpty();
  }

  attached() {
    this.log.debug('attached');
    this._assertRepeatedViewsMatchState();
  }

  detaching() {
    this.log.debug('detaching');
  }

  unbinding() {
    this.log.debug('unbinding');
    this._assertRepeatedViewsMatchState();
  }

  dispose() {
    this.log.debug('dispose');
  }

  _assertRepeatedViewsEmpty() {
    assert.strictEqual(this.inventoryAlertViews.length, 0);
    assert.strictEqual(this.trendAlertViews.length, 0);
  }

  _assertRepeatedViewsMatchState() {
    assert.strictEqual(this.inventoryAlertViews.length, this.inventoryAlerts.length);
    this.log.debug(`verified ${this.inventoryAlerts.length} inventory alerts`);
    assert.strictEqual(this.trendAlertViews.length, this.trendAlerts.length);
    this.log.debug(`verified ${this.trendAlerts.length} trend alerts`);
  }
}
export interface AlertsPanel extends ICustomElementViewModel {}

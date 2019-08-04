import { I18N, I18nService } from '@aurelia/i18n';
import { customElement } from '@aurelia/runtime';
import template from './sut-i18n.html';

@customElement({ name: 'sut-i18n', template })
export class SutI18N {
  public obj = { key: 'simple.text', foo: 'bar' };
  public dispatchedOn = new Date(2020, 1, 10, 5, 15);
  public deliveredOn = new Date(2021, 1, 10, 5, 15);
  public params = { context: 'delivered', date: this.deliveredOn };
  constructor(@I18N private readonly i18n: I18nService) { }
  public changeKey() {
    this.obj.key = 'simple.attr';
  }

  public changeParams() {
    this.params = { ...this.params, context: 'dispatched' };
  }
  public async changeLocale(locale) {
    await this.i18n.setLocale(locale);
  }
}

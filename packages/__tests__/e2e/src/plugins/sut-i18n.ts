import { I18N, I18nService, Signals } from '@aurelia/i18n';
import { customElement, ISignaler } from '@aurelia/runtime';
import template from './sut-i18n.html';
import { Locale } from './translation-resources';

@customElement({ name: 'sut-i18n', template })
export class SutI18N {
  public obj = { key: 'simple.text', foo: 'bar' };
  public dispatchedOn = new Date(2020, 1, 10, 5, 15);
  public deliveredOn = new Date(2021, 1, 10, 5, 15);
  public params = { context: 'delivered', date: this.deliveredOn };
  public translations: { [key: string]: string | number };
  private readonly myDate: Date;
  private locale: Locale;
  constructor(
    @I18N private readonly i18n: I18nService,
    @ISignaler private readonly signaler: ISignaler
  ) {
    this.locale = this.i18n.getLocale() as Locale;
    this.myDate = new Date();
    this.myDate.setHours(this.myDate.getHours() - 2);

    this.translations = {
      simple: this.i18n.tr('simple.text'),
      context: this.i18n.tr('status', { context: 'dispatched', date: this.dispatchedOn }),
      plural: this.i18n.tr('itemWithCount', { count: 10 }),
      interval: this.i18n.tr('itemWithCount_interval', { postProcess: 'interval', count: 10 }),

      num: this.i18n.nf(123456789),
      numUfSimple: this.i18n.uf('123,456,789.12'),
      numUfLocale: this.i18n.uf('123.456.789,12', 'de'),
      numUfCurrency: this.i18n.uf('$ 123,456,789.12'),
      numUfText: this.i18n.uf('123,456,789.12 foo bar'),
      numUfMinus: this.i18n.uf('- 123,456,789.12'),

      date: this.i18n.df(this.deliveredOn),
      rtime: this.i18n.rt(this.myDate)
    };
  }
  public changeKey() {
    this.obj.key = 'simple.attr';
  }

  public changeParams() {
    this.params = { ...this.params, context: 'dispatched' };
  }
  public async changeLocale(locale) {
    await this.i18n.setLocale(locale);
    this.locale = locale;
  }

  public changeMyDate() {
    this.myDate.setFullYear(this.myDate.getFullYear() - 1);
    this.signaler.dispatchSignal(Signals.RT_SIGNAL);
  }
}

import { DI, IEventAggregator, PLATFORM } from '@aurelia/kernel';
import { ILifecycleTask, PromiseTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nInitOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';

export const I18N_EA_CHANNEL = 'i18n:locale:changed';
export interface I18nKeyEvaluationResult {
  value: string;
  attributes: string[];
}

export const I18N = DI.createInterface<I18nService>('I18nService').noDefault();
/**
 * Translation service class.
 * @export
 */
export class I18nService {

  public i18next: i18nextCore.i18n;
  private options!: I18nInitOptions;
  private task: ILifecycleTask;
  private intl: typeof Intl;

  constructor(
    @I18nWrapper i18nextWrapper: I18nextWrapper,
    @I18nInitOptions options: I18nInitOptions,
    @IEventAggregator private readonly ea: IEventAggregator
  ) {
    this.i18next = i18nextWrapper.i18next;
    this.task = new PromiseTask(this.initializeI18next(options), null, this);
    this.intl = PLATFORM.global.Intl;
  }

  public evaluate(keyExpr: string, options?: i18nextCore.TOptions): I18nKeyEvaluationResult[] {
    const parts = keyExpr.split(';');
    const result: I18nKeyEvaluationResult[] = [];
    for (const part of parts) {
      const { attributes, key } = this.extractAttributesFromKey(part);
      result.push({ attributes, value: this.tr(key, options) });
    }
    return result;
  }

  public tr(key: string | string[], options?: i18nextCore.TOptions) {
    return this.i18next.t(key, options);
  }

  public getLocale(): string {
    return this.i18next.language;
  }
  public async setLocale(newLocale: string) {
    const oldLocale = this.getLocale();
    await this.i18next.changeLanguage(newLocale);
    this.ea.publish(I18N_EA_CHANNEL, { oldLocale, newLocale });
  }

  public createNumberFormat(options?: Intl.NumberFormatOptions, locales?: string | string[]): Intl.NumberFormat {
    return this.intl.NumberFormat(locales || this.getLocale(), options);
  }
  public nf(input: number, options?: Intl.NumberFormatOptions, locales?: string | string[]): string {
    return this.createNumberFormat(options, locales).format(input);
  }

  public createDateTimeFormat(options?: Intl.DateTimeFormatOptions, locales?: string | string[]): Intl.DateTimeFormat {
    return this.intl.DateTimeFormat(locales || this.getLocale(), options);
  }
  public df(input: Date, options?: Intl.DateTimeFormatOptions, locales?: string | string[]): string {
    return this.createDateTimeFormat(options, locales).format(input);
  }

  public rt(input: Date): string {
    let difference = input.getTime() - new Date().getTime();
    const absDifference = Math.abs(difference);
    const year = 31104000000, month = 2592000000, week = 604800000, day = 86400000, hour = 3600000, minute = 60000, second = 1000;
    let unit: Intl.TimeUnit, divisor: number;
    switch (true) {

      case absDifference >= year:
        divisor = year;
        unit = 'year';
        break;

      case absDifference >= month:
        divisor = month;
        unit = 'month';
        break;

      case absDifference >= week:
        divisor = week;
        unit = 'week';
        break;

      case absDifference >= day:
        divisor = day;
        unit = 'day';
        break;

      case absDifference >= hour:
        divisor = hour;
        unit = 'hour';
        break;

      case absDifference >= minute:
        divisor = minute;
        unit = 'minute';
        break;

      case absDifference >= second:
      default:
        divisor = second;
        unit = 'second';
        difference = absDifference < second ? second : difference;
        break;
    }
    const value = Math.round(difference / divisor);
    return new Intl.RelativeTimeFormat(this.getLocale()).format(value, unit);
  }

  private extractAttributesFromKey(key: string) {
    const re = /\[([a-z\-, ]*)\]/ig;
    let attributes: string[] = [];

    // check if a attribute was specified in the key
    const matches = re.exec(key);
    if (matches) {
      key = key.replace(matches[0], '');
      attributes = matches[1].split(',');
    }

    return { attributes, key };
  }

  private async initializeI18next(options: I18nInitOptions) {
    const defaultOptions: I18nInitOptions = {
      lng: 'en',
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      attributes: ['t', 'i18n'],
      skipTranslationOnMissingKey: false,
    };
    this.options = { ...defaultOptions, ...options };
    for (const plugin of this.options.plugins!) {
      this.i18next.use(plugin);
    }
    await this.i18next.init(this.options);
  }
}

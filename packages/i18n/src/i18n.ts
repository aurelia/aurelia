import { DI, IEventAggregator, PLATFORM } from '@aurelia/kernel';
import { ILifecycleTask, ISignaler, PromiseTask } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nInitOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';

export const I18N_EA_CHANNEL = 'i18n:locale:changed';
export const I18N_SIGNAL = 'aurelia-translation-signal';

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
  private readonly task: ILifecycleTask;
  private readonly intl: typeof Intl;

  constructor(
    @I18nWrapper i18nextWrapper: I18nextWrapper,
    @I18nInitOptions options: I18nInitOptions,
    @IEventAggregator private readonly ea: IEventAggregator,
    @ISignaler private readonly signaler: ISignaler
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
    this.signaler.dispatchSignal(I18N_SIGNAL);
  }
  /**
   * Returns `Intl.NumberFormat` instance with given `[options]`, and `[locales]` which can be used to format a number.
   * If the `locales` is skipped, then the `Intl.NumberFormat` instance is created using the currently active locale.
   */
  public createNumberFormat(options?: Intl.NumberFormatOptions, locales?: string | string[]): Intl.NumberFormat {
    return this.intl.NumberFormat(locales || this.getLocale(), options);
  }

  /**
   * Formats the given `input` number according to the given `[options]`, and `[locales]`.
   * If the `locales` is skipped, then the number is formatted using the currently active locale.
   * @returns Formatted number.
   */
  public nf(input: number, options?: Intl.NumberFormatOptions, locales?: string | string[]): string {
    return this.createNumberFormat(options, locales).format(input);
  }

  /**
   * Returns `Intl.DateTimeFormat` instance with given `[options]`, and `[locales]` which can be used to format a date.
   * If the `locales` is skipped, then the `Intl.DateTimeFormat` instance is created using the currently active locale.
   */
  public createDateTimeFormat(options?: Intl.DateTimeFormatOptions, locales?: string | string[]): Intl.DateTimeFormat {
    return this.intl.DateTimeFormat(locales || this.getLocale(), options);
  }

  /**
   * Formats the given `input` date according to the given `[options]` and `[locales]`.
   * If the `locales` is skipped, then the date is formatted using the currently active locale.
   * @returns Formatted date.
   */
  public df(input: number | Date, options?: Intl.DateTimeFormatOptions, locales?: string | string[]): string {
    return this.createDateTimeFormat(options, locales).format(input);
  }

  public uf(numberLike: string, locale?: string): number {
    // Unfortunately the Intl specs does not specify a way to get the thousand and decimal separators for a given locale.
    // Only straightforward way would be to include the CLDR data and query for the separators, which certainly is a overkill.
    const comparer = this.nf(10000 / 3, undefined, locale);

    let thousandSeparator = comparer[1];
    const decimalSeparator = comparer[5];

    if (thousandSeparator === '.') {
      thousandSeparator = '\\.';
    }

    // remove all thousand separators
    const result = numberLike.replace(new RegExp(thousandSeparator, 'g'), '')
      // remove non-numeric signs except -> , .
      .replace(/[^\d.,-]/g, '')
      // replace original decimalSeparator with english one
      .replace(decimalSeparator, '.');

    // return real number
    return Number(result);
  }

  /**
   * Returns `Intl.RelativeTimeFormat` instance with given `[options]`, and `[locales]` which can be used to format a value with associated time unit.
   * If the `locales` is skipped, then the `Intl.RelativeTimeFormat` instance is created using the currently active locale.
   */
  public createRelativeTimeFormat(options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): Intl.RelativeTimeFormat {
    return new this.intl.RelativeTimeFormat(locales || this.getLocale(), options);
  }

  /**
   * Returns a relative time format of the given `input` date as per the given `[options]`, and `[locales]`.
   * If the `locales` is skipped, then the currently active locale is used for formatting.
   */
  public rt(input: Date, options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): string {
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
    return this.createRelativeTimeFormat(options, locales).format(value, unit);
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

import { DI, IEventAggregator } from '@aurelia/kernel';
import { ISignaler } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nInitOptions } from './i18n-configuration-options.js';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper.js';
import { Signals } from './utils.js';

const enum TimeSpan {
  Second = 1000,
  Minute = Second * 60,
  Hour = Minute * 60,
  Day = Hour * 24,
  Week = Day * 7,
  Month = Day * 30,
  Year = Day * 365
}

export class I18nKeyEvaluationResult {
  public key: string;
  public value: string = (void 0)!;
  public attributes: string[];

  public constructor(keyExpr: string) {
    const re = /\[([a-z\-, ]*)\]/ig;
    this.attributes = [];

    // check if a attribute was specified in the key
    const matches = re.exec(keyExpr);
    if (matches) {
      keyExpr = keyExpr.replace(matches[0], '');
      this.attributes = matches[1].split(',');
    }
    this.key = keyExpr;
  }
}

export interface I18N {
  i18next: i18nextCore.i18n;
  readonly initPromise: Promise<void>;
  /**
   * Evaluates the `keyExpr` to translated values.
   * For a single key, `I18nService#tr` method can also be easily used.
   *
   * @example
   *  evaluate('key1;[attr]key2;[attr1,attr2]key3', [options]) => [
   *    {key: 'key1', attributes:[], value: 'translated_value_of_key1'}
   *    {key: 'key2', attributes:['attr'], value: 'translated_value_of_key2'}
   *    {key: 'key3', attributes:['attr1', 'attr2'], value: 'translated_value_of_key3'}
   *  ]
   */
  evaluate(keyExpr: string, options?: i18nextCore.TOptions): I18nKeyEvaluationResult[];
  tr(key: string | string[], options?: i18nextCore.TOptions): string;
  getLocale(): string;
  setLocale(newLocale: string): Promise<void>;
  /**
   * Returns `Intl.NumberFormat` instance with given `[options]`, and `[locales]` which can be used to format a number.
   * If the `locales` is skipped, then the `Intl.NumberFormat` instance is created using the currently active locale.
   */
  createNumberFormat(options?: Intl.NumberFormatOptions, locales?: string | string[]): Intl.NumberFormat;
  /**
   * Formats the given `input` number according to the given `[options]`, and `[locales]`.
   * If the `locales` is skipped, then the number is formatted using the currently active locale.
   *
   * @returns Formatted number.
   */
  nf(input: number, options?: Intl.NumberFormatOptions, locales?: string | string[]): string;
  /**
   * Unformats a given numeric string to a number.
   */
  uf(numberLike: string, locale?: string): number;
  /**
   * Returns `Intl.DateTimeFormat` instance with given `[options]`, and `[locales]` which can be used to format a date.
   * If the `locales` is skipped, then the `Intl.DateTimeFormat` instance is created using the currently active locale.
   */
  createDateTimeFormat(options?: Intl.DateTimeFormatOptions, locales?: string | string[]): Intl.DateTimeFormat;
  /**
   * Formats the given `input` date according to the given `[options]` and `[locales]`.
   * If the `locales` is skipped, then the date is formatted using the currently active locale.
   *
   * @returns Formatted date.
   */
  df(input: number | Date, options?: Intl.DateTimeFormatOptions, locales?: string | string[]): string;
  /**
   * Returns `Intl.RelativeTimeFormat` instance with given `[options]`, and `[locales]` which can be used to format a value with associated time unit.
   * If the `locales` is skipped, then the `Intl.RelativeTimeFormat` instance is created using the currently active locale.
   */
  createRelativeTimeFormat(options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): Intl.RelativeTimeFormat;
  /**
   * Returns a relative time format of the given `input` date as per the given `[options]`, and `[locales]`.
   * If the `locales` is skipped, then the currently active locale is used for formatting.
   */
  rt(input: Date, options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): string;
  /**
   * Queue a subscriber to be invoked for when the locale of a I18N service changes
   */
  subscribeLocaleChange(subscriber: ILocalChangeSubscriber): void;
}
export const I18N = DI.createInterface<I18N>('I18N');

export interface ILocalChangeSubscriber {
  handleLocaleChange(locales: { oldLocale: string; newLocale: string }): void;
}
/**
 * Translation service class.
 */
export class I18nService implements I18N {

  public i18next: i18nextCore.i18n;
  /**
   * This is used for i18next initialization and awaited for before the bind phase.
   * If need be (usually there is none), this can be awaited for explicitly in client code.
   */
  public readonly initPromise: Promise<void>;
  private options!: I18nInitOptions;
  private readonly localeSubscribers: Set<ILocalChangeSubscriber> = new Set();

  public constructor(
    @I18nWrapper i18nextWrapper: I18nextWrapper,
    @I18nInitOptions options: I18nInitOptions,
    @IEventAggregator private readonly ea: IEventAggregator,
    @ISignaler private readonly signaler: ISignaler,
  ) {
    this.i18next = i18nextWrapper.i18next;
    this.initPromise = this.initializeI18next(options);
  }

  public evaluate(keyExpr: string, options?: i18nextCore.TOptions): I18nKeyEvaluationResult[] {
    const parts = keyExpr.split(';');
    const results: I18nKeyEvaluationResult[] = [];
    for (const part of parts) {
      const result = new I18nKeyEvaluationResult(part);
      const key = result.key;
      const translation = this.tr(key, options);
      if (this.options.skipTranslationOnMissingKey && translation === key) {
        // TODO change this once the logging infra is there.
        console.warn(`Couldn't find translation for key: ${key}`);
      } else {
        result.value = translation;
        results.push(result);
      }
    }
    return results;
  }

  public tr(key: string | string[], options?: i18nextCore.TOptions): string {
    return this.i18next.t(key, options);
  }

  public getLocale(): string {
    return this.i18next.language;
  }
  public async setLocale(newLocale: string): Promise<void> {
    const oldLocale = this.getLocale();
    const locales = { oldLocale, newLocale };
    await this.i18next.changeLanguage(newLocale);
    this.ea.publish(Signals.I18N_EA_CHANNEL, locales);
    this.localeSubscribers.forEach(sub => sub.handleLocaleChange(locales));
    this.signaler.dispatchSignal(Signals.I18N_SIGNAL);
  }

  public createNumberFormat(options?: Intl.NumberFormatOptions, locales?: string | string[]): Intl.NumberFormat {
    return Intl.NumberFormat(locales || this.getLocale(), options);
  }

  public nf(input: number, options?: Intl.NumberFormatOptions, locales?: string | string[]): string {
    return this.createNumberFormat(options, locales).format(input);
  }

  public createDateTimeFormat(options?: Intl.DateTimeFormatOptions, locales?: string | string[]): Intl.DateTimeFormat {
    return Intl.DateTimeFormat(locales || this.getLocale(), options);
  }

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

  public createRelativeTimeFormat(options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): Intl.RelativeTimeFormat {
    return new Intl.RelativeTimeFormat(locales || this.getLocale(), options);
  }

  public rt(input: Date, options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): string {
    let difference = input.getTime() - this.now();
    const epsilon = this.options.rtEpsilon! * (difference > 0 ? 1 : 0);

    const formatter = this.createRelativeTimeFormat(options, locales);

    let value: number = difference / TimeSpan.Year;
    if (Math.abs(value + epsilon) >= 1) {
      return formatter.format(Math.round(value), 'year');
    }

    value = difference / TimeSpan.Month;
    if (Math.abs(value + epsilon) >= 1) {
      return formatter.format(Math.round(value), 'month');
    }

    value = difference / TimeSpan.Week;
    if (Math.abs(value + epsilon) >= 1) {
      return formatter.format(Math.round(value), 'week');
    }

    value = difference / TimeSpan.Day;
    if (Math.abs(value + epsilon) >= 1) {
      return formatter.format(Math.round(value), 'day');
    }

    value = difference / TimeSpan.Hour;
    if (Math.abs(value + epsilon) >= 1) {
      return formatter.format(Math.round(value), 'hour');
    }

    value = difference / TimeSpan.Minute;
    if (Math.abs(value + epsilon) >= 1) {
      return formatter.format(Math.round(value), 'minute');
    }

    difference = Math.abs(difference) < TimeSpan.Second ? TimeSpan.Second : difference;
    value = difference / TimeSpan.Second;
    return formatter.format(Math.round(value), 'second');
  }

  public subscribeLocaleChange(subscriber: ILocalChangeSubscriber): void {
    this.localeSubscribers.add(subscriber);
  }

  private now() {
    return new Date().getTime();
  }

  private async initializeI18next(options: I18nInitOptions) {
    const defaultOptions: I18nInitOptions = {
      lng: 'en',
      fallbackLng: ['en'],
      debug: false,
      plugins: [],
      rtEpsilon: 0.01,
      skipTranslationOnMissingKey: false,
    };
    this.options = { ...defaultOptions, ...options };
    for (const plugin of this.options.plugins!) {
      this.i18next.use(plugin);
    }
    await this.i18next.init(this.options);
  }
}

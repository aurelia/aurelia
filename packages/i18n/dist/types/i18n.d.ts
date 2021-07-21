import { IEventAggregator } from '@aurelia/kernel';
import { ISignaler } from '@aurelia/runtime';
import i18nextCore from 'i18next';
import { I18nInitOptions } from './i18n-configuration-options.js';
import { I18nextWrapper } from './i18next-wrapper.js';
export declare class I18nKeyEvaluationResult {
    key: string;
    value: string;
    attributes: string[];
    constructor(keyExpr: string);
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
export declare const I18N: import("@aurelia/kernel").InterfaceSymbol<I18N>;
export interface ILocalChangeSubscriber {
    handleLocaleChange(locales: {
        oldLocale: string;
        newLocale: string;
    }): void;
}
/**
 * Translation service class.
 */
export declare class I18nService implements I18N {
    private readonly ea;
    i18next: i18nextCore.i18n;
    /**
     * This is used for i18next initialization and awaited for before the bind phase.
     * If need be (usually there is none), this can be awaited for explicitly in client code.
     */
    readonly initPromise: Promise<void>;
    private options;
    private readonly _localeSubscribers;
    private readonly _signaler;
    constructor(i18nextWrapper: I18nextWrapper, options: I18nInitOptions, ea: IEventAggregator, signaler: ISignaler);
    evaluate(keyExpr: string, options?: i18nextCore.TOptions): I18nKeyEvaluationResult[];
    tr(key: string | string[], options?: i18nextCore.TOptions): string;
    getLocale(): string;
    setLocale(newLocale: string): Promise<void>;
    createNumberFormat(options?: Intl.NumberFormatOptions, locales?: string | string[]): Intl.NumberFormat;
    nf(input: number, options?: Intl.NumberFormatOptions, locales?: string | string[]): string;
    createDateTimeFormat(options?: Intl.DateTimeFormatOptions, locales?: string | string[]): Intl.DateTimeFormat;
    df(input: number | Date, options?: Intl.DateTimeFormatOptions, locales?: string | string[]): string;
    uf(numberLike: string, locale?: string): number;
    createRelativeTimeFormat(options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): Intl.RelativeTimeFormat;
    rt(input: Date, options?: Intl.RelativeTimeFormatOptions, locales?: string | string[]): string;
    subscribeLocaleChange(subscriber: ILocalChangeSubscriber): void;
    private now;
    private _initializeI18next;
}
//# sourceMappingURL=i18n.d.ts.map
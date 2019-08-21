import { I18nService } from '../i18n';
export declare class NumberFormatValueConverter {
    private readonly i18n;
    readonly signals: string[];
    constructor(i18n: I18nService);
    toView(value: unknown, options?: Intl.NumberFormatOptions, locale?: string): unknown;
}
//# sourceMappingURL=number-format-value-converter.d.ts.map
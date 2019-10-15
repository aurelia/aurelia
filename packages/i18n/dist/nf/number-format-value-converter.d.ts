import { I18N } from '../i18n';
export declare class NumberFormatValueConverter {
    private readonly i18n;
    readonly signals: string[];
    constructor(i18n: I18N);
    toView(value: unknown, options?: Intl.NumberFormatOptions, locale?: string): unknown;
}
//# sourceMappingURL=number-format-value-converter.d.ts.map
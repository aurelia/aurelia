import { I18N } from '../i18n';
export declare class DateFormatValueConverter {
    private readonly i18n;
    readonly signals: string[];
    constructor(i18n: I18N);
    toView(value: string | number | Date, options?: Intl.DateTimeFormatOptions, locale?: string): string | number;
}
//# sourceMappingURL=date-format-value-converter.d.ts.map
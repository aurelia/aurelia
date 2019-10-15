import { I18N } from '../i18n';
export declare class RelativeTimeValueConverter {
    private readonly i18n;
    readonly signals: string[];
    constructor(i18n: I18N);
    toView(value: unknown, options?: Intl.RelativeTimeFormatOptions, locale?: string): unknown;
}
//# sourceMappingURL=relative-time-value-converter.d.ts.map
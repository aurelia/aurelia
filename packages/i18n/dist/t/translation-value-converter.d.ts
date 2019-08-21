import i18next from 'i18next';
import { I18nService } from '../i18n';
export declare class TranslationValueConverter {
    private readonly i18n;
    readonly signals: string[];
    constructor(i18n: I18nService);
    toView(value: string, options?: i18next.TOptions): string;
}
//# sourceMappingURL=translation-value-converter.d.ts.map
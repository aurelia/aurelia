import i18next from 'i18next';
import { I18N } from '../i18n.js';
export declare class TranslationValueConverter {
    private readonly i18n;
    readonly signals: string[];
    constructor(i18n: I18N);
    toView(value: string, options?: i18next.TOptions): string;
}
//# sourceMappingURL=translation-value-converter.d.ts.map
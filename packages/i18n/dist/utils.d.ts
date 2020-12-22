import { BindingBehaviorExpression, IBinding } from '@aurelia/runtime';
export declare const enum Signals {
    I18N_EA_CHANNEL = "i18n:locale:changed",
    I18N_SIGNAL = "aurelia-translation-signal",
    RT_SIGNAL = "aurelia-relativetime-signal"
}
export declare const enum ValueConverters {
    translationValueConverterName = "t",
    dateFormatValueConverterName = "df",
    numberFormatValueConverterName = "nf",
    relativeTimeValueConverterName = "rt"
}
export declare type BindingWithBehavior = IBinding & {
    sourceExpression: BindingBehaviorExpression;
};
export declare function createIntlFormatValueConverterExpression(name: string, binding: BindingWithBehavior): void;
//# sourceMappingURL=utils.d.ts.map
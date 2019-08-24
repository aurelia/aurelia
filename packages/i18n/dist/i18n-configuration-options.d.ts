import i18next from 'i18next';
export declare type I18nModule = i18next.BackendModule | i18next.LanguageDetectorModule | i18next.LanguageDetectorAsyncModule | i18next.PostProcessorModule | i18next.I18nFormatModule | i18next.ThirdPartyModule;
export declare const I18nInitOptions: import("@aurelia/kernel").IDefaultableInterfaceSymbol<I18nInitOptions>;
export interface I18nInitOptions extends i18next.InitOptions {
    /**
     * Collection of i18next plugins to use.
     */
    plugins?: I18nModule[];
    skipTranslationOnMissingKey?: boolean;
    /**
     * Leeway for computing the time difference for relative time formatting.
     * If abs(t1 - now) < 1 time_unit, where t1 is the date being formatted, and time_unit is a unit of time such as minute, hour etc.,
     * then the relative time formatting may sometime produce unexpected results, such as 'in 60 seconds' instead of 'in 1 minute'.
     * A non-zero rtEpsilon ensures nicer results instead. Default is 0.01. A smaller value for epsilon ensures stricter comparison.
     */
    rtEpsilon?: number;
}
export interface I18nConfigurationOptions {
    initOptions?: I18nInitOptions;
    translationAttributeAliases?: string[];
}
//# sourceMappingURL=i18n-configuration-options.d.ts.map
import i18next from 'i18next';
export declare type I18nModule = i18next.BackendModule | i18next.LanguageDetectorModule | i18next.LanguageDetectorAsyncModule | i18next.PostProcessorModule | i18next.I18nFormatModule | i18next.ThirdPartyModule;
export declare const I18nInitOptions: import("@aurelia/kernel").IDefaultableInterfaceSymbol<I18nInitOptions>;
export interface I18nInitOptions extends i18next.InitOptions {
    /**
     * Collection of i18next plugins to use.
     */
    plugins?: I18nModule[];
    attributes?: string[];
    skipTranslationOnMissingKey?: boolean;
}
export interface I18nConfigurationOptions {
    initOptions?: I18nInitOptions;
    translationAttributeAliases?: string[];
}
//# sourceMappingURL=i18n-configuration-options.d.ts.map
import { DI } from '@aurelia/kernel';
import i18next from 'i18next';

export type I18nModule =
  | i18next.BackendModule
  | i18next.LanguageDetectorModule
  | i18next.LanguageDetectorAsyncModule
  | i18next.PostProcessorModule
  | i18next.I18nFormatModule
  | i18next.ThirdPartyModule;

export const I18nConfigurationOptions = DI.createInterface<I18nConfigurationOptions>('I18nConfigurationOptions');
export interface I18nConfigurationOptions extends i18next.InitOptions {
  /**
   * Collection of i18next plugins to use.
   */
  plugins?: I18nModule[];
  attributes?: string[];
  skipTranslationOnMissingKey?: boolean;
}

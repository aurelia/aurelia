import i18next from 'i18next';
export interface I18nConfigurationOptions extends i18next.InitOptions {
  /**
   * Collection of i18next plugins to use.
   */
  // TODO: Have some basic duck typings for the i18next plugins. These come in various shapes and i18next does not provide any type definition for these plugins.
  // tslint:disable-next-line: no-any
  plugins?: any[];
  attributes?: string[];
  skipTranslationOnMissingKey?: boolean;
}

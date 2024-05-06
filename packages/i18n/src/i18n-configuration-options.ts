import { Class, DI } from '@aurelia/kernel';
import { InitOptions, Module, ThirdPartyModule } from 'i18next';
import { II18nextWrapper } from './i18next-wrapper';

export type I18nModule = Module | ThirdPartyModule;

export const I18nInitOptions = /*@__PURE__*/DI.createInterface<I18nInitOptions>('I18nInitOptions');
export interface I18nInitOptions extends InitOptions {
  /**
   * Collection of i18next plugins to use.
   */
  plugins?: (I18nModule | Class<I18nModule>)[];
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
  i18nextWrapper?: II18nextWrapper;
}

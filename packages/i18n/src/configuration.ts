import { IContainer, Registration } from '@aurelia/kernel';
import { I18N, I18nService } from './i18n';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';
import { TranslationAttributePattern, TranslationBindingCommand, TranslationBindingRenderer } from './t/translation-renderer';

export type I18NConfigOptionsProvider = () => I18nConfigurationOptions;

function createI18nConfiguration(optionsProvider: I18NConfigOptionsProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      return container.register(
        TranslationAttributePattern,
        TranslationBindingCommand,
        TranslationBindingRenderer,
        Registration.callback(I18nConfigurationOptions, this.optionsProvider),
        Registration.singleton(I18nWrapper, I18nextWrapper),
        Registration.singleton(I18N, I18nService),
      );
    },
    customize(cb?: I18NConfigOptionsProvider) {
      return createI18nConfiguration(cb || optionsProvider);
    },
  };
}

export const I18nConfiguration = createI18nConfiguration(() => Object.create(null));

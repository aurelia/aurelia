import { IContainer, Registration } from '@aurelia/kernel';
import { I18N, I18nService } from './i18n';
import { I18nConfigurationOptions, I18nInitOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';
import { TranslationParametersAttributePattern, TranslationParametersBindingCommand, TranslationParametersBindingRenderer } from './t/translation-parameters-renderer';
import { TranslationAttributePattern, TranslationBindAttributePattern, TranslationBindBindingCommand, TranslationBindBindingRenderer, TranslationBindingCommand, TranslationBindingRenderer } from './t/translation-renderer';
import { TranslationValueConverter } from './t/translation-value-converter';

export type I18NConfigOptionsProvider = (options: I18nConfigurationOptions) => void;

function createI18nConfiguration(optionsProvider: I18NConfigOptionsProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: I18nConfigurationOptions = {
        initOptions: Object.create(null)
      };
      optionsProvider(options);
      if (Array.isArray(options.translationAttributeAliases)) {
        TranslationAttributePattern.aliases = options.translationAttributeAliases;
        TranslationBindingCommand.aliases = options.translationAttributeAliases;
      }

      return container.register(
        TranslationAttributePattern,
        TranslationBindingCommand,
        TranslationBindingRenderer,
        TranslationBindAttributePattern,
        TranslationBindBindingCommand,
        TranslationBindBindingRenderer,
        TranslationParametersAttributePattern,
        TranslationParametersBindingCommand,
        TranslationParametersBindingRenderer,
        Registration.callback(I18nInitOptions, () => options.initOptions),
        Registration.singleton(I18nWrapper, I18nextWrapper),
        Registration.singleton(I18N, I18nService),
        TranslationValueConverter
      );
    },
    customize(cb?: I18NConfigOptionsProvider) {
      return createI18nConfiguration(cb || optionsProvider);
    },
  };
}

export const I18nConfiguration = createI18nConfiguration(() => {/* noop */ });

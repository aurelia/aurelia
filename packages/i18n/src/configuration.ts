import { IContainer, Registration } from '@aurelia/kernel';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { I18nextWrapper, I18nWrapper } from './i18next-wrapper';
import { TCustomAttribute } from './t-custom-attribute';

export type I18NConfigOptionsProvider = () => I18nConfigurationOptions;

function createI18nConfiguration(optionsProvider: I18NConfigOptionsProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      return container.register(
        TCustomAttribute,
        Registration.callback(I18nConfigurationOptions, this.optionsProvider),
        Registration.singleton(I18nWrapper, I18nextWrapper)
      );
    },
    customize(cb?: I18NConfigOptionsProvider) {
      return createI18nConfiguration(cb || optionsProvider);
    },
  };
}

export const I18nConfiguration = createI18nConfiguration(() => Object.create(null));

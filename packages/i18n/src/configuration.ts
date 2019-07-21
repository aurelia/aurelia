import { IContainer } from '@aurelia/kernel';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { TCustomAttribute } from './t-custom-attribute';

export type I18NConfigOptionsProvider = () => I18nConfigurationOptions;

function createI18nConfiguration(optionsProvider: I18NConfigOptionsProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      return container.register(
        TCustomAttribute,
        I18nConfigurationOptions.withDefault(x => x.callback(this.optionsProvider)),
      );
    },
    customize(cb?: I18NConfigOptionsProvider) {
      return createI18nConfiguration(cb || optionsProvider);
    },
  };
}

export const I18nConfiguration = createI18nConfiguration(() => Object.create(null));

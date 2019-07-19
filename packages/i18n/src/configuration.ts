import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import i18next from 'i18next';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { TCustomAttribute } from './t-custom-attribute';

export type I18NConfigOptionsProvider = () => I18nConfigurationOptions;

// const TCustomAttributeRegistration = TCustomAttribute as IRegistry;

const i18nConfiguration: IRegistry & { optionsProvider: I18NConfigOptionsProvider } = {
  optionsProvider: () => Object.create(null),
  register(container: IContainer): IContainer {
    container.register(TCustomAttribute as IRegistry);
    Registration.callback(I18nConfiguration, this.optionsProvider).register(container);
    return container;
  }
};

export const I18nConfiguration: IRegistry & { customize(cb: I18NConfigOptionsProvider): IRegistry } = {
  customize(cb?: () => I18nConfigurationOptions) {
    i18nConfiguration.optionsProvider = cb ? cb : i18nConfiguration.optionsProvider;
    return {
      ...i18nConfiguration,
    };
  },
  register: i18nConfiguration.register.bind(i18nConfiguration)
};

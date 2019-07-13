import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { I18N } from './i18n';
import { I18nConfigurationOptions } from './i18n-configuration-options';
import { TCustomAttribute } from './t-custom-attribute';

const TCustomAttributeRegistration = TCustomAttribute as IRegistry;

const i18nConfiguration: IRegistry & { options: I18nConfigurationOptions } = {
  options: Object.create(null),
  register(container: IContainer): IContainer {
    container.register(TCustomAttributeRegistration);

    const i18n = new I18N(this.options);
    Registration.instance(I18N, i18n).register(container);

    return container;
  }
};

export const I18nConfiguration: IRegistry & { customize(options?: I18nConfigurationOptions): IRegistry } = {
  customize(options?: I18nConfigurationOptions) {
    i18nConfiguration.options = options ? options : i18nConfiguration.options;
    return {
      ...i18nConfiguration,
    };
  },
  register: i18nConfiguration.register.bind(i18nConfiguration)
};

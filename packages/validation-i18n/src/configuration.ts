import { ValidationI18nCustomizationOptions, LocalizedValidationMessageProvider, LocalizedValidationControllerFactory, I18nKeyConfiguration } from './localization';
import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { ValidationConfiguration, getDefaultValidationConfiguration } from '@aurelia/validation';

export type ValidationConfigurationProvider = (options: ValidationI18nCustomizationOptions) => void;

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationI18nCustomizationOptions = {
        ...getDefaultValidationConfiguration(),
        MessageProviderType: LocalizedValidationMessageProvider,
        ValidationControllerFactoryType: LocalizedValidationControllerFactory,
        DefaultNamespace: void 0,
        DefaultKeyPrefix: void 0,
      };

      optionsProvider(options);
      const keyConfiguration: I18nKeyConfiguration = {
        DefaultNamespace: options.DefaultNamespace,
        DefaultKeyPrefix: options.DefaultKeyPrefix,
      };

      return container.register(
        ValidationConfiguration.customize((opt) => {
          opt.MessageProviderType = options.MessageProviderType;
          opt.ValidationControllerFactoryType = options.ValidationControllerFactoryType;

          opt.ValidatorType = options.ValidatorType;
          opt.DefaultTrigger = options.DefaultTrigger;
          opt.CustomMessages = options.CustomMessages;
        }),
        Registration.callback(I18nKeyConfiguration, () => keyConfiguration)
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationI18nConfiguration = createConfiguration(PLATFORM.noop);

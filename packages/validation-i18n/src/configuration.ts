import { ValidationI18nCustomizationOptions, LocalizedValidationMessageProvider, LocalizedValidationControllerFactory } from './localization';
import { IContainer, PLATFORM } from '@aurelia/kernel';
import { ValidationConfiguration } from '@aurelia/validation';

export type ValidationConfigurationProvider = (options: ValidationI18nCustomizationOptions) => void;

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationI18nCustomizationOptions = {
        MessageProviderType: LocalizedValidationMessageProvider,
        ValidationControllerFactoryType: LocalizedValidationControllerFactory,
      };

      optionsProvider(options);

      return container.register(
        ValidationConfiguration.customize((opt) => {
          opt.MessageProviderType = options.MessageProviderType;
          opt.ValidationControllerFactoryType = options.ValidationControllerFactoryType;
        })
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationI18nConfiguration = createConfiguration(PLATFORM.noop);

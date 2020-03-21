import { ValidationI18nCustomizationOptions, LocalizedValidationMessageProvider, LocalizedValidationControllerFactory, I18nKeyConfiguration } from './localization';
import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { ValidationConfiguration, getDefaultValidationConfiguration } from '@aurelia/validation';
import { ValidationCustomizationOptions } from '@aurelia/validation/dist/validation-customization-options';

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
          // copy the customization iff the key exists in validation configuration
          for (const key of Object.keys(opt) as (keyof ValidationCustomizationOptions)[]) {
            if (key in options) {
              (opt as any)[key] = options[key]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
            }
          }
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

import { IContainer, noop, Registration } from '@aurelia/kernel';
import { getDefaultValidationHtmlConfiguration, ValidationHtmlConfiguration, ValidationHtmlCustomizationOptions } from '@aurelia/validation-html';
import { I18nKeyConfiguration, LocalizedValidationControllerFactory, LocalizedValidationMessageProvider, ValidationI18nCustomizationOptions } from './localization';

export type ValidationConfigurationProvider = (options: ValidationI18nCustomizationOptions) => void;

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationI18nCustomizationOptions = {
        ...getDefaultValidationHtmlConfiguration(),
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
        ValidationHtmlConfiguration.customize((opt) => {
          // copy the customization iff the key exists in validation configuration
          for (const key of Object.keys(opt) as (keyof ValidationHtmlCustomizationOptions)[]) {
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

export const ValidationI18nConfiguration = createConfiguration(noop);

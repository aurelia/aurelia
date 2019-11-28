import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { IValidator, StandardValidator } from './validator';
import { ValidationRules } from './rule';
import {
  ValidateBindingBehavior,
  ValidateManuallyBindingBehavior,
  ValidateOnBlurBindingBehavior,
  ValidateOnChangeBindingBehavior,
  ValidateOnChangeOrBlurBindingBehavior
} from './validate-binding-behavior';
import { ValidationErrorsCustomAttribute } from './validation-errors-custom-attribute';
import { ValidationRendererCustomAttribute } from './validation-renderer-custom-attribute';
import { IValidationMessageProvider, ValidationMessageProvider } from './validation-messages';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOpions) => void;
export interface ValidationCustomizationOpions {
  validator: typeof StandardValidator;
}

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOpions = { validator: StandardValidator };
      optionsProvider(options);

      return container.register(
        Registration.singleton(IValidator, options.validator),
        Registration.singleton(IValidationMessageProvider, ValidationMessageProvider),
        ValidationRules,
        ValidateBindingBehavior,
        ValidateManuallyBindingBehavior,
        ValidateOnBlurBindingBehavior,
        ValidateOnChangeBindingBehavior,
        ValidateOnChangeOrBlurBindingBehavior,
        ValidationErrorsCustomAttribute,
        ValidationRendererCustomAttribute,
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);

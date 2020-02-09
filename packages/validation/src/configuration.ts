import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior';
import { IValidationControllerFactory, ValidationControllerFactory } from './validation-controller';
import { ValidationCustomizationOptions } from './validation-customization-options';
import { IValidator, StandardValidator } from './validator';
import { ValidationContainerCustomElement } from './subscribers/validation-container-custom-element';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOptions) => void;

export function getDefaultValidationConfiguration(): ValidationCustomizationOptions {
  return {
    ValidatorType: StandardValidator,
    MessageProviderType: ValidationMessageProvider,
    ValidationControllerFactoryType: ValidationControllerFactory,
    CustomMessages: [],
    DefaultTrigger: ValidationTrigger.blur
  };
}

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOptions = getDefaultValidationConfiguration();

      optionsProvider(options);

      return container.register(
        Registration.callback(ICustomMessages, () => options.CustomMessages),
        Registration.callback(IDefaultTrigger, () => options.DefaultTrigger),
        Registration.singleton(IValidator, options.ValidatorType),
        Registration.singleton(IValidationMessageProvider, options.MessageProviderType),
        Registration.transient(IValidationRules, ValidationRules),
        Registration.transient(IValidationControllerFactory, options.ValidationControllerFactoryType),
        ValidateBindingBehavior,
        ValidationErrorsCustomAttribute,
        ValidationContainerCustomElement,
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);

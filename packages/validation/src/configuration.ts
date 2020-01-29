import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior';
import { IValidationControllerFactory, ValidationControllerFactory } from './validation-controller';
import { ValidationCustomizationOptions } from './validation-customization-options';
import { IValidator, StandardValidator } from './validator';
import { Validated } from './subscribers/validated';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOptions) => void;

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOptions = { ValidatorType: StandardValidator, CustomMessages: [], DefaultTrigger: ValidationTrigger.blur };
      optionsProvider(options);

      return container.register(
        Registration.callback(ICustomMessages, () => options.CustomMessages),
        Registration.callback(IDefaultTrigger, () => options.DefaultTrigger),
        Registration.singleton(IValidator, options.ValidatorType),
        Registration.singleton(IValidationMessageProvider, ValidationMessageProvider), // TODO enable customization of messages and i18n
        Registration.transient(IValidationRules, ValidationRules),
        Registration.transient(IValidationControllerFactory, ValidationControllerFactory),
        ValidateBindingBehavior,
        ValidationErrorsCustomAttribute,
        Validated,
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);

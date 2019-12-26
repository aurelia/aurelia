import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
import { ICustomMessages, IValidationMessageProvider, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule';
import { ValidateBindingBehavior, IDefaultTrigger, ValidationTrigger } from './validate-binding-behavior';
import { IValidationControllerFactory, ValidationControllerFactory } from './validation-controller';
import { ValidationCustomizationOpions } from './validation-customization-options';
import { ValidationErrorsCustomAttribute } from './validation-errors-custom-attribute';
import { ValidationRendererCustomAttribute } from './validation-renderer-custom-attribute';
import { IValidator, StandardValidator } from './validator';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOpions) => void;

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOpions = { validator: StandardValidator, customMessages: [], defaultTrigger: ValidationTrigger.blur };
      optionsProvider(options);

      return container.register(
        Registration.callback(ICustomMessages, () => options.customMessages),
        Registration.callback(IDefaultTrigger, () => options.defaultTrigger),
        Registration.singleton(IValidator, options.validator),
        Registration.singleton(IValidationMessageProvider, ValidationMessageProvider), // TODO enable customization of messages and i18n
        Registration.transient(IValidationRules, ValidationRules),
        ValidateBindingBehavior,
        ValidationErrorsCustomAttribute,
        ValidationRendererCustomAttribute,
        Registration.singleton(IValidationControllerFactory, ValidationControllerFactory)
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);

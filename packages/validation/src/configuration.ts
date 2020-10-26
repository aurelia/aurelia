import { IContainer, noop, Registration } from '@aurelia/kernel';
import { IValidationExpressionHydrator } from './rule-interfaces';
import { ICustomMessages, IValidationRules, ValidationMessageProvider, ValidationRules } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ModelValidationExpressionHydrator, ValidationDeserializer } from './serialization';
import { ValidationCustomizationOptions } from './validation-customization-options';
import { IValidator, StandardValidator } from './validator';

export type ValidationConfigurationProvider = (options: ValidationCustomizationOptions) => void;

export function getDefaultValidationConfiguration(): ValidationCustomizationOptions {
  return {
    ValidatorType: StandardValidator,
    MessageProviderType: ValidationMessageProvider,
    CustomMessages: [],
    HydratorType: ModelValidationExpressionHydrator,
  };
}

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationCustomizationOptions = getDefaultValidationConfiguration();

      optionsProvider(options);

      container.register(
        Registration.instance(ICustomMessages, options.CustomMessages),
        Registration.singleton(IValidator, options.ValidatorType),
        Registration.singleton(IValidationMessageProvider, options.MessageProviderType),
        Registration.singleton(IValidationExpressionHydrator, options.HydratorType),
        Registration.transient(IValidationRules, ValidationRules),
        ValidationDeserializer
      );
      return container;
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(noop);

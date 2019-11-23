import { IContainer, PLATFORM, Registration } from '@aurelia/kernel';
export * from './controller-validate-result';
export * from './get-target-dom-element';
export * from './property-info';
export * from './property-accessor-parser';
export * from './validate-binding-behavior';
export * from './validate-event';
export * from './validate-instruction';
export * from './validate-result';
export * from './validate-trigger';
export * from './validation-controller';
export * from './validation-controller-factory';
export * from './validation-errors-custom-attribute';
export * from './validation-renderer-custom-attribute';
export * from './validation-renderer';
export * from './validator';

export * from './implementation/rule';
export * from './implementation/validation-messages';
export * from './implementation/validation-message-parser';
export * from './implementation/validation-rules';

// Configuration

import { IValidator, StandardValidator } from './validator';
import { ValidationMessageParser } from './implementation/validation-message-parser';
import { PropertyAccessorParser } from './property-accessor-parser';
import { ValidationRules } from './implementation/validation-rules';
import {
  ValidateBindingBehavior,
  ValidateManuallyBindingBehavior,
  ValidateOnBlurBindingBehavior,
  ValidateOnChangeBindingBehavior,
  ValidateOnChangeOrBlurBindingBehavior
} from './validate-binding-behavior';
import { ValidationErrorsCustomAttribute } from './validation-errors-custom-attribute';
import { ValidationRendererCustomAttribute } from './validation-renderer-custom-attribute';

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

      // the fluent rule definition API needs the parser to translate messages
      // to interpolation expressions.
      const messageParser = container.get(ValidationMessageParser);
      const propertyParser = container.get(PropertyAccessorParser);
      ValidationRules.initialize(messageParser, propertyParser);

      return container.register(
        ValidateBindingBehavior,
        ValidateManuallyBindingBehavior,
        ValidateOnBlurBindingBehavior,
        ValidateOnChangeBindingBehavior,
        ValidateOnChangeOrBlurBindingBehavior,
        ValidationErrorsCustomAttribute,
        ValidationRendererCustomAttribute,
        Registration.singleton(IValidator, options.validator)
      );
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationConfiguration = createConfiguration(PLATFORM.noop);

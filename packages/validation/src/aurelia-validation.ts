// Exports

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
export * from './implementation/rules';
export * from './implementation/standard-validator';
export * from './implementation/validation-messages';
export * from './implementation/validation-message-parser';
export * from './implementation/validation-rules';

// Configuration

import { Container } from 'aurelia-dependency-injection';
import { Validator } from './validator';
import { StandardValidator } from './implementation/standard-validator';
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

/**
 * Aurelia Validation Configuration API
 */
export class AureliaValidationConfiguration {
  private validatorType: { new (...args: any[]): Validator } = StandardValidator;

  /**
   * Use a custom Validator implementation.
   */
  public customValidator(type: { new (...args: any[]): Validator }) {
    this.validatorType = type;
  }

  /**
   * Applies the configuration.
   */
  public apply(container: Container) {
    const validator = container.get(this.validatorType);
    container.registerInstance(Validator, validator);
  }
}

/**
 * Configures the plugin.
 */
export function configure(
  // tslint:disable-next-line:ban-types
  frameworkConfig: { container: Container, globalResources?: (...resources: any[]) => any },
  callback?: (config: AureliaValidationConfiguration) => void
) {
  // the fluent rule definition API needs the parser to translate messages
  // to interpolation expressions.
  const messageParser = frameworkConfig.container.get(ValidationMessageParser);
  const propertyParser = frameworkConfig.container.get(PropertyAccessorParser);
  ValidationRules.initialize(messageParser, propertyParser);

  // configure...
  const config = new AureliaValidationConfiguration();
  if (callback instanceof Function) {
    callback(config);
  }
  config.apply(frameworkConfig.container);

  // globalize the behaviors.
  if (frameworkConfig.globalResources) {
    frameworkConfig.globalResources(
      ValidateBindingBehavior,
      ValidateManuallyBindingBehavior,
      ValidateOnBlurBindingBehavior,
      ValidateOnChangeBindingBehavior,
      ValidateOnChangeOrBlurBindingBehavior,
      ValidationErrorsCustomAttribute,
      ValidationRendererCustomAttribute);
  }
}

import { Constructable, IContainer, noop, Registration } from '@aurelia/kernel';
import { getDefaultValidationConfiguration, ValidationCustomizationOptions, ValidationConfiguration } from '@aurelia/validation';
import { ValidationContainerCustomElement, defaultContainerDefinition, defaultContainerTemplate } from './subscribers/validation-container-custom-element.js';
import { ValidationErrorsCustomAttribute } from './subscribers/validation-errors-custom-attribute.js';
import { IDefaultTrigger, ValidateBindingBehavior, ValidationTrigger } from './validate-binding-behavior.js';
import { IValidationController, ValidationControllerFactory } from './validation-controller.js';
import { ValidationHtmlCustomizationOptions } from './validation-customization-options.js';
import { CustomElement } from '@aurelia/runtime-html';

export type ValidationConfigurationProvider = (options: ValidationHtmlCustomizationOptions) => void;

export function getDefaultValidationHtmlConfiguration(): ValidationHtmlCustomizationOptions {
  return {
    ...getDefaultValidationConfiguration(),
    ValidationControllerFactoryType: ValidationControllerFactory,
    DefaultTrigger: ValidationTrigger.focusout,
    UseSubscriberCustomAttribute: true,
    SubscriberCustomElementTemplate: defaultContainerTemplate
  };
}

function createConfiguration(optionsProvider: ValidationConfigurationProvider) {
  return {
    optionsProvider,
    register(container: IContainer) {
      const options: ValidationHtmlCustomizationOptions = getDefaultValidationHtmlConfiguration();

      optionsProvider(options);

      container.registerFactory(IValidationController as unknown as Constructable, new options.ValidationControllerFactoryType());

      container.register(
        ValidationConfiguration.customize((opt) => {
          // copy the customization iff the key exists in validation configuration
          for (const optKey of Object.keys(opt) as (keyof ValidationCustomizationOptions)[]) {
            if (optKey in options) {
              (opt as any)[optKey] = options[optKey]; // TS cannot infer that the value of the same key is being copied from A to B, and rejects the assignment due to type broadening
            }
          }
        }),
        Registration.instance(IDefaultTrigger, options.DefaultTrigger),
        ValidateBindingBehavior,
      );
      if (options.UseSubscriberCustomAttribute) {
        container.register(ValidationErrorsCustomAttribute);
      }
      const template = options.SubscriberCustomElementTemplate;
      if (template) { // we need the boolean coercion here to ignore null, undefined, and ''
        container.register(CustomElement.define({ ...defaultContainerDefinition, template }, ValidationContainerCustomElement));
      }
      return container;
    },
    customize(cb?: ValidationConfigurationProvider) {
      return createConfiguration(cb ?? optionsProvider);
    },
  };
}

export const ValidationHtmlConfiguration = createConfiguration(noop);


import { Class, Constructable, IFactory } from '@aurelia/kernel';
import { ValidationCustomizationOptions } from '@aurelia/validation';
import { ValidationTrigger } from './validate-binding-behavior';
import { IValidationController } from './validation-controller';

/**
 * Customization options for the plugin.
 */
export interface ValidationHtmlCustomizationOptions extends ValidationCustomizationOptions {
  ValidationControllerFactoryType: Class<IFactory<Constructable<IValidationController>>>;
  DefaultTrigger: ValidationTrigger;
  UseSubscriberCustomAttribute: boolean;
  SubscriberCustomElementTemplate: string;
}

import { Class } from '@aurelia/kernel';
import { IValidationHydrator } from './rule-interfaces';
import { ICustomMessage } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ValidationTrigger } from './validate-binding-behavior';
import { IValidationControllerFactory } from './validation-controller';
import { IValidator } from './validator';

/**
 * Customization options for the plugin.
 */
export interface ValidationCustomizationOptions {
  ValidatorType: Class<IValidator>;
  MessageProviderType: Class<IValidationMessageProvider>;
  ValidationControllerFactoryType: Class<IValidationControllerFactory>;
  CustomMessages: ICustomMessage[];
  DefaultTrigger: ValidationTrigger;
  HydratorType: Class<IValidationHydrator>;
  UseSubscriberCustomAttribute: boolean;
  UseSubscriberCustomElement: boolean;
}

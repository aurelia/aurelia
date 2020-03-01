import { ICustomMessage } from './rule-provider';
import { IValidator } from './validator';
import { Class } from '@aurelia/kernel';
import { ValidationTrigger } from './validate-binding-behavior';
import { IValidationMessageProvider } from './rules';
import { IValidationControllerFactory } from './validation-controller';
import { IValidationHydrator } from './rule-interfaces';

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
}

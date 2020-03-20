import { Class, Constructable, IFactory } from '@aurelia/kernel';
import { IValidationHydrator } from './rule-interfaces';
import { ICustomMessage } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { ValidationTrigger } from './validate-binding-behavior';
import { IValidationController } from './validation-controller';
import { IValidator } from './validator';

/**
 * Customization options for the plugin.
 */
export interface ValidationCustomizationOptions {
  ValidatorType: Class<IValidator>;
  MessageProviderType: Class<IValidationMessageProvider>;
  ValidationControllerFactoryType: Class<IFactory<Constructable<IValidationController>>>;
  CustomMessages: ICustomMessage[];
  DefaultTrigger: ValidationTrigger;
  HydratorType: Class<IValidationHydrator>;
  UseSubscriberCustomAttribute: boolean;
  UseSubscriberCustomElement: boolean;
}

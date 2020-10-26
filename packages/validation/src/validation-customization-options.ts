import { Class } from '@aurelia/kernel';
import { IValidationExpressionHydrator } from './rule-interfaces';
import { ICustomMessage } from './rule-provider';
import { IValidationMessageProvider } from './rules';
import { IValidator } from './validator';

/**
 * Customization options for the plugin.
 */
export interface ValidationCustomizationOptions {
  ValidatorType: Class<IValidator>;
  MessageProviderType: Class<IValidationMessageProvider>;
  CustomMessages: ICustomMessage[];
  HydratorType: Class<IValidationExpressionHydrator>;
}

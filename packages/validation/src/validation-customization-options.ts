import { Class } from '@aurelia/kernel';
import { IValidationExpressionHydrator } from './rule-interfaces.js';
import { ICustomMessage } from './rule-provider.js';
import { IValidationMessageProvider } from './rules.js';
import { IValidator } from './validator.js';

/**
 * Customization options for the plugin.
 */
export interface ValidationCustomizationOptions {
  ValidatorType: Class<IValidator>;
  MessageProviderType: Class<IValidationMessageProvider>;
  CustomMessages: ICustomMessage[];
  HydratorType: Class<IValidationExpressionHydrator>;
}

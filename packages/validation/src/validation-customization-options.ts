import { ICustomMessage } from './rule-provider';
import { IValidator } from './validator';
import { Class } from '@aurelia/kernel';
import { ValidationTrigger } from './validate-binding-behavior';

/**
 * Customization options for the plugin.
 */
export interface ValidationCustomizationOptions {
  validator: Class<IValidator>;
  customMessages: ICustomMessage[];
  defaultTrigger: ValidationTrigger;
}

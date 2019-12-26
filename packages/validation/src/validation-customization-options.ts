import { ICustomMessage } from './rule';
import { IValidator } from './validator';
import { Class } from '@aurelia/kernel';
import { ValidationTrigger } from './validate-binding-behavior';

export interface ValidationCustomizationOpions {
  validator: Class<IValidator>;
  customMessages: ICustomMessage[];
  defaultTrigger: ValidationTrigger;
}

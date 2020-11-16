import { Class, Constructable, IFactory } from '@aurelia/kernel';
import { ValidationCustomizationOptions } from '@aurelia/validation';
import { ValidationTrigger } from './validate-binding-behavior.js';
import { IValidationController } from './validation-controller.js';
/**
 * Customization options for the plugin.
 */
export interface ValidationHtmlCustomizationOptions extends ValidationCustomizationOptions {
    ValidationControllerFactoryType: Class<IFactory<Constructable<IValidationController>>>;
    DefaultTrigger: ValidationTrigger;
    UseSubscriberCustomAttribute: boolean;
    SubscriberCustomElementTemplate: string;
}
//# sourceMappingURL=validation-customization-options.d.ts.map
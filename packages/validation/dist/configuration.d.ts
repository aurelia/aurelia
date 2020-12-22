import { IContainer } from '@aurelia/kernel';
import { ValidationCustomizationOptions } from './validation-customization-options.js';
export declare type ValidationConfigurationProvider = (options: ValidationCustomizationOptions) => void;
export declare function getDefaultValidationConfiguration(): ValidationCustomizationOptions;
export declare const ValidationConfiguration: {
    optionsProvider: ValidationConfigurationProvider;
    register(container: IContainer): IContainer;
    customize(cb?: ValidationConfigurationProvider | undefined): any;
};
//# sourceMappingURL=configuration.d.ts.map
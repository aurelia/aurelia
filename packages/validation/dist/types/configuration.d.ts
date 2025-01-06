import { IContainer } from '@aurelia/kernel';
import { ValidationCustomizationOptions } from './validation-customization-options';
export type ValidationConfigurationProvider = (options: ValidationCustomizationOptions) => void;
export declare function getDefaultValidationConfiguration(): ValidationCustomizationOptions;
export declare const ValidationConfiguration: {
    optionsProvider: ValidationConfigurationProvider;
    register(container: IContainer): IContainer;
    customize(cb?: ValidationConfigurationProvider): /*elided*/ any;
};
//# sourceMappingURL=configuration.d.ts.map
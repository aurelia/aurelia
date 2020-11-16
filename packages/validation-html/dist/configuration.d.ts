import { IContainer } from '@aurelia/kernel';
import { ValidationHtmlCustomizationOptions } from './validation-customization-options.js';
export declare type ValidationConfigurationProvider = (options: ValidationHtmlCustomizationOptions) => void;
export declare function getDefaultValidationHtmlConfiguration(): ValidationHtmlCustomizationOptions;
export declare const ValidationHtmlConfiguration: {
    optionsProvider: ValidationConfigurationProvider;
    register(container: IContainer): IContainer;
    customize(cb?: ValidationConfigurationProvider | undefined): any;
};
//# sourceMappingURL=configuration.d.ts.map
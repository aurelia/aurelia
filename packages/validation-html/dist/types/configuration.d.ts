import { IContainer } from '@aurelia/kernel';
import { ValidationHtmlCustomizationOptions } from './validation-customization-options';
export type ValidationConfigurationProvider = (options: ValidationHtmlCustomizationOptions) => void;
export declare function getDefaultValidationHtmlConfiguration(): ValidationHtmlCustomizationOptions;
export declare const ValidationHtmlConfiguration: {
    optionsProvider: ValidationConfigurationProvider;
    register(container: IContainer): IContainer;
    customize(cb?: ValidationConfigurationProvider): /*elided*/ any;
};
//# sourceMappingURL=configuration.d.ts.map
import { IContainer } from '@aurelia/kernel';
import { ValidationI18nCustomizationOptions } from './localization.js';
export declare type ValidationConfigurationProvider = (options: ValidationI18nCustomizationOptions) => void;
export declare const ValidationI18nConfiguration: {
    optionsProvider: ValidationConfigurationProvider;
    register(container: IContainer): IContainer;
    customize(cb?: ValidationConfigurationProvider | undefined): any;
};
//# sourceMappingURL=configuration.d.ts.map
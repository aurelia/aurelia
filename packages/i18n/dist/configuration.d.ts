import { IContainer } from '@aurelia/kernel';
import { I18nConfigurationOptions } from './i18n-configuration-options';
export declare type I18NConfigOptionsProvider = () => I18nConfigurationOptions;
export declare const I18nConfiguration: {
    optionsProvider: I18NConfigOptionsProvider;
    register(container: IContainer): IContainer;
    customize(cb?: I18NConfigOptionsProvider | undefined): any;
};
//# sourceMappingURL=configuration.d.ts.map
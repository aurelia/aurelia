import { IContainer } from '@aurelia/kernel';
import { I18nConfigurationOptions } from './i18n-configuration-options';
export type I18NConfigOptionsProvider = (options: I18nConfigurationOptions) => void;
export declare const I18nConfiguration: {
    optionsProvider: I18NConfigOptionsProvider;
    register(container: IContainer): IContainer;
    customize(cb?: I18NConfigOptionsProvider): /*elided*/ any;
};
//# sourceMappingURL=configuration.d.ts.map
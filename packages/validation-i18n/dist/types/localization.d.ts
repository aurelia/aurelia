import { I18N } from '@aurelia/i18n';
import { EventAggregator, IContainer, ILogger, IServiceLocator, Key } from '@aurelia/kernel';
import { IExpressionParser, Interpolation, PrimitiveLiteralExpression } from '@aurelia/runtime';
import { IPlatform } from '@aurelia/runtime-html';
import { IValidationRule, IValidator, ValidationMessageProvider } from '@aurelia/validation';
import { IValidationController, ValidationController, ValidationControllerFactory, ValidationHtmlCustomizationOptions } from '@aurelia/validation-html';
export interface ValidationI18nCustomizationOptions extends ValidationHtmlCustomizationOptions {
    DefaultNamespace?: string;
    DefaultKeyPrefix?: string;
}
export declare type I18nKeyConfiguration = Pick<ValidationI18nCustomizationOptions, 'DefaultNamespace' | 'DefaultKeyPrefix'>;
export declare const I18nKeyConfiguration: import("@aurelia/kernel").InterfaceSymbol<I18nKeyConfiguration>;
export declare class LocalizedValidationController extends ValidationController {
    private readonly localeChangeSubscription;
    constructor(locator: IServiceLocator, ea: EventAggregator, validator: IValidator, parser: IExpressionParser, platform: IPlatform);
}
export declare class LocalizedValidationControllerFactory extends ValidationControllerFactory {
    construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController;
}
export declare class LocalizedValidationMessageProvider extends ValidationMessageProvider {
    private readonly i18n;
    private readonly keyPrefix?;
    constructor(keyConfiguration: I18nKeyConfiguration, i18n: I18N, ea: EventAggregator, parser: IExpressionParser, logger: ILogger);
    getMessage(rule: IValidationRule): Interpolation | PrimitiveLiteralExpression;
    getDisplayName(propertyName: string | number | undefined, displayName?: string | null | (() => string)): string | undefined;
    private getKey;
}
//# sourceMappingURL=localization.d.ts.map
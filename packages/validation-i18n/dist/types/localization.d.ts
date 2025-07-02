import { EventAggregator, IContainer, Key } from '@aurelia/kernel';
import { Interpolation, PrimitiveLiteralExpression } from '@aurelia/expression-parser';
import { IValidationRule, ValidationMessageProvider } from '@aurelia/validation';
import { IValidationController, ValidationController, ValidationControllerFactory, ValidationHtmlCustomizationOptions } from '@aurelia/validation-html';
export interface ValidationI18nCustomizationOptions extends ValidationHtmlCustomizationOptions {
    DefaultNamespace?: string;
    DefaultKeyPrefix?: string;
}
export type I18nKeyConfiguration = Pick<ValidationI18nCustomizationOptions, 'DefaultNamespace' | 'DefaultKeyPrefix'>;
export declare const I18nKeyConfiguration: import("@aurelia/kernel").InterfaceSymbol<I18nKeyConfiguration>;
export declare class LocalizedValidationController extends ValidationController {
    private readonly localeChangeSubscription;
    constructor(ea?: EventAggregator);
}
export declare class LocalizedValidationControllerFactory extends ValidationControllerFactory {
    construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController;
}
export declare class LocalizedValidationMessageProvider extends ValidationMessageProvider {
    private readonly keyPrefix?;
    private readonly i18n;
    constructor(keyConfiguration?: I18nKeyConfiguration, ea?: EventAggregator);
    getMessage(rule: IValidationRule): PrimitiveLiteralExpression | Interpolation;
    getDisplayName(propertyName: string | number | undefined, displayName?: string | null | (() => string)): string | undefined;
    private getKey;
}
//# sourceMappingURL=localization.d.ts.map
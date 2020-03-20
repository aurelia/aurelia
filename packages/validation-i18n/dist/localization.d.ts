import { I18N } from "@aurelia/i18n";
import { IValidationController, IValidator, ValidationControllerFactory, ValidationController, ValidationMessageProvider, BaseValidationRule } from "@aurelia/validation";
import { IExpressionParser, IScheduler, PrimitiveLiteralExpression, IInterpolationExpression } from '@aurelia/runtime';
import { EventAggregator, ILogger, IContainer, Key } from '@aurelia/kernel';
import { ValidationCustomizationOptions } from '@aurelia/validation/dist/validation-customization-options';
export interface ValidationI18nCustomizationOptions extends ValidationCustomizationOptions {
    DefaultNamespace?: string;
    DefaultKeyPrefix?: string;
}
export declare type I18nKeyConfiguration = Pick<ValidationI18nCustomizationOptions, 'DefaultNamespace' | 'DefaultKeyPrefix'>;
export declare const I18nKeyConfiguration: import("@aurelia/kernel").InterfaceSymbol<Pick<ValidationI18nCustomizationOptions, "DefaultNamespace" | "DefaultKeyPrefix">>;
export declare class LocalizedValidationController extends ValidationController {
    private readonly localeChangeSubscription;
    constructor(ea: EventAggregator, validator: IValidator, parser: IExpressionParser, scheduler: IScheduler);
}
export declare class LocalizedValidationControllerFactory extends ValidationControllerFactory {
    construct(container: IContainer, _dynamicDependencies?: Key[] | undefined): IValidationController;
}
export declare class LocalizedValidationMessageProvider extends ValidationMessageProvider {
    private readonly i18n;
    private readonly keyPrefix?;
    constructor(keyConfiguration: I18nKeyConfiguration, i18n: I18N, ea: EventAggregator, parser: IExpressionParser, logger: ILogger);
    getMessage(rule: BaseValidationRule): IInterpolationExpression | PrimitiveLiteralExpression;
    getDisplayName(propertyName: string | number | undefined, displayName?: string | null | (() => string)): string | undefined;
    private getKey;
}
//# sourceMappingURL=localization.d.ts.map
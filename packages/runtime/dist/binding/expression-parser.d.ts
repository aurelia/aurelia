import { AnyBindingExpression, IForOfStatement, IInterpolationExpression, IsBindingBehavior } from '../ast';
export interface IExpressionParser {
    cache(expressions: Record<string, AnyBindingExpression>): void;
    parse(expression: string, bindingType: BindingType.ForCommand): IForOfStatement;
    parse(expression: string, bindingType: BindingType.Interpolation): IInterpolationExpression;
    parse(expression: string, bindingType: Exclude<BindingType, BindingType.ForCommand | BindingType.Interpolation>): IsBindingBehavior;
    parse(expression: string, bindingType: BindingType): AnyBindingExpression;
}
export declare const IExpressionParser: import("@aurelia/kernel").InterfaceSymbol<IExpressionParser>;
export declare const enum BindingType {
    None = 0,
    IgnoreCustomAttr = 4096,
    Interpolation = 2048,
    IsRef = 5376,
    IsIterator = 512,
    IsCustom = 256,
    IsFunction = 128,
    IsEvent = 64,
    IsProperty = 32,
    IsCommand = 16,
    IsPropertyCommand = 48,
    IsEventCommand = 80,
    DelegationStrategyDelta = 6,
    Command = 15,
    OneTimeCommand = 49,
    ToViewCommand = 50,
    FromViewCommand = 51,
    TwoWayCommand = 52,
    BindCommand = 53,
    TriggerCommand = 4182,
    CaptureCommand = 4183,
    DelegateCommand = 4184,
    CallCommand = 153,
    OptionsCommand = 26,
    ForCommand = 539,
    CustomCommand = 284
}
//# sourceMappingURL=expression-parser.d.ts.map
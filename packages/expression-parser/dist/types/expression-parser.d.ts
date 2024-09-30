import { CustomExpression, ForOfStatement, Interpolation, AnyBindingExpression, IsBindingBehavior } from './ast';
export interface IExpressionParser<TCustom extends CustomExpression = CustomExpression> {
    parse(expression: string, expressionType: 'IsIterator'): ForOfStatement;
    parse(expression: string, expressionType: 'Interpolation'): Interpolation;
    parse(expression: string, expressionType: Exclude<ExpressionType, 'IsIterator' | 'Interpolation'>): IsBindingBehavior;
    parse(expression: string, expressionType: ExpressionType): AnyBindingExpression<TCustom>;
}
export declare const IExpressionParser: import("@aurelia/kernel").InterfaceSymbol<IExpressionParser<CustomExpression>>;
/**
 * A default implementation of the IExpressionParser interface
 */
export declare class ExpressionParser<TCustom extends CustomExpression = CustomExpression> implements IExpressionParser<TCustom> {
    static readonly register: <C extends import("@aurelia/kernel").Constructable>(this: C, container: import("@aurelia/kernel").IContainer) => void;
    parse(expression: string, expressionType: 'IsIterator'): ForOfStatement;
    parse(expression: string, expressionType: 'Interpolation'): Interpolation;
    parse(expression: string, expressionType: Exclude<ExpressionType, 'IsIterator' | 'Interpolation'>): IsBindingBehavior;
    parse(expression: string, expressionType: ExpressionType): AnyBindingExpression;
}
declare const enum Precedence {
    Variadic = 61,
    Assign = 62,
    Conditional = 63,
    Assignment = 64,
    NullishCoalescing = 128,
    LogicalOR = 192,
    LogicalAND = 256,
    Equality = 320,
    Relational = 384,
    Additive = 448,
    Multiplicative = 512,
    Binary = 513,
    LeftHandSide = 514,
    Primary = 515,
    Unary = 516
}
export type ExpressionType = 'None' | 'Interpolation' | 'IsIterator' | 'IsChainable' | 'IsFunction' | 'IsProperty' | 'IsCustom';
export declare function parseExpression(input: string, expressionType?: ExpressionType): AnyBindingExpression;
export declare function parse(minPrecedence: Precedence, expressionType: ExpressionType): AnyBindingExpression;
export {};
//# sourceMappingURL=expression-parser.d.ts.map
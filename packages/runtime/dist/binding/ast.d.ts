import { IServiceLocator, StrictPrimitive } from '@aurelia/kernel';
import { ExpressionKind, LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { Collection, IBindingContext, IOverrideContext, IScope, ObservedCollection } from '../observation';
import { IConnectableBinding } from './connectable';
import { CustomElementDefinition } from '../resources/custom-element';
export declare type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';
export declare type BinaryOperator = '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';
export declare type IsPrimary = AccessThisExpression | AccessScopeExpression | ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export declare type IsLiteral = ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export declare type IsLeftHandSide = IsPrimary | CallFunctionExpression | CallMemberExpression | CallScopeExpression | AccessMemberExpression | AccessKeyedExpression | TaggedTemplateExpression;
export declare type IsUnary = IsLeftHandSide | UnaryExpression;
export declare type IsBinary = IsUnary | BinaryExpression;
export declare type IsConditional = IsBinary | ConditionalExpression;
export declare type IsAssign = IsConditional | AssignExpression;
export declare type IsValueConverter = IsAssign | ValueConverterExpression;
export declare type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
export declare type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
export declare type IsExpression = IsBindingBehavior | Interpolation;
export declare type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export declare type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | HtmlLiteralExpression;
export declare type AnyBindingExpression = Interpolation | ForOfStatement | IsBindingBehavior;
export interface IHydrator {
    hydrate(jsonExpr: any): any;
}
export interface IVisitor<T = unknown> {
    visitAccessKeyed(expr: AccessKeyedExpression): T;
    visitAccessMember(expr: AccessMemberExpression): T;
    visitAccessScope(expr: AccessScopeExpression): T;
    visitAccessThis(expr: AccessThisExpression): T;
    visitArrayBindingPattern(expr: ArrayBindingPattern): T;
    visitArrayLiteral(expr: ArrayLiteralExpression): T;
    visitAssign(expr: AssignExpression): T;
    visitBinary(expr: BinaryExpression): T;
    visitBindingBehavior(expr: BindingBehaviorExpression): T;
    visitBindingIdentifier(expr: BindingIdentifier): T;
    visitCallFunction(expr: CallFunctionExpression): T;
    visitCallMember(expr: CallMemberExpression): T;
    visitCallScope(expr: CallScopeExpression): T;
    visitConditional(expr: ConditionalExpression): T;
    visitForOfStatement(expr: ForOfStatement): T;
    visitHtmlLiteral(expr: HtmlLiteralExpression): T;
    visitInterpolation(expr: Interpolation): T;
    visitObjectBindingPattern(expr: ObjectBindingPattern): T;
    visitObjectLiteral(expr: ObjectLiteralExpression): T;
    visitPrimitiveLiteral(expr: PrimitiveLiteralExpression): T;
    visitTaggedTemplate(expr: TaggedTemplateExpression): T;
    visitTemplate(expr: TemplateExpression): T;
    visitUnary(expr: UnaryExpression): T;
    visitValueConverter(expr: ValueConverterExpression): T;
}
export declare class CustomExpression {
    readonly value: string;
    constructor(value: string);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): string;
}
export declare class BindingBehaviorExpression {
    readonly expression: IsBindingBehavior;
    readonly name: string;
    readonly args: readonly IsAssign[];
    get $kind(): ExpressionKind.BindingBehavior;
    get hasBind(): true;
    get hasUnbind(): true;
    readonly behaviorKey: string;
    constructor(expression: IsBindingBehavior, name: string, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ValueConverterExpression {
    readonly expression: IsValueConverter;
    readonly name: string;
    readonly args: readonly IsAssign[];
    get $kind(): ExpressionKind.ValueConverter;
    readonly converterKey: string;
    get hasBind(): false;
    get hasUnbind(): true;
    constructor(expression: IsValueConverter, name: string, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AssignExpression {
    readonly target: IsAssignable;
    readonly value: IsAssign;
    get $kind(): ExpressionKind.Assign;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(target: IsAssignable, value: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, value: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ConditionalExpression {
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    get $kind(): ExpressionKind.Conditional;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessThisExpression {
    readonly ancestor: number;
    static readonly $this: AccessThisExpression;
    static readonly $host: AccessThisExpression;
    static readonly $parent: AccessThisExpression;
    get $kind(): ExpressionKind.AccessThis;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): IBindingContext | undefined;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessScopeExpression {
    readonly name: string;
    readonly ancestor: number;
    readonly accessHostScope: boolean;
    get $kind(): ExpressionKind.AccessScope;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(name: string, ancestor?: number, accessHostScope?: boolean);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): IBindingContext | IBinding | IOverrideContext;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessMemberExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    get $kind(): ExpressionKind.AccessMember;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(object: IsLeftHandSide, name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessKeyedExpression {
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    get $kind(): ExpressionKind.AccessKeyed;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(object: IsLeftHandSide, key: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallScopeExpression {
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly ancestor: number;
    readonly accessHostScope: boolean;
    get $kind(): ExpressionKind.CallScope;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(name: string, args: readonly IsAssign[], ancestor?: number, accessHostScope?: boolean);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallMemberExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: readonly IsAssign[];
    get $kind(): ExpressionKind.CallMember;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(object: IsLeftHandSide, name: string, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallFunctionExpression {
    readonly func: IsLeftHandSide;
    readonly args: readonly IsAssign[];
    get $kind(): ExpressionKind.CallFunction;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(func: IsLeftHandSide, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BinaryExpression {
    readonly operation: BinaryOperator;
    readonly left: IsBinary;
    readonly right: IsBinary;
    get $kind(): ExpressionKind.Binary;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary);
    evaluate(f: LifecycleFlags, s: IScope, hs: IScope | null, l: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class UnaryExpression {
    readonly operation: UnaryOperator;
    readonly expression: IsLeftHandSide;
    get $kind(): ExpressionKind.Unary;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(operation: UnaryOperator, expression: IsLeftHandSide);
    evaluate(f: LifecycleFlags, s: IScope, hs: IScope | null, l: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class PrimitiveLiteralExpression<TValue extends StrictPrimitive = StrictPrimitive> {
    readonly value: TValue;
    static readonly $undefined: PrimitiveLiteralExpression<undefined>;
    static readonly $null: PrimitiveLiteralExpression<null>;
    static readonly $true: PrimitiveLiteralExpression<true>;
    static readonly $false: PrimitiveLiteralExpression<false>;
    static readonly $empty: PrimitiveLiteralExpression<string>;
    get $kind(): ExpressionKind.PrimitiveLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(value: TValue);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): TValue;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class HtmlLiteralExpression {
    readonly parts: readonly HtmlLiteralExpression[];
    get $kind(): ExpressionKind.HtmlLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(parts: readonly HtmlLiteralExpression[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): string;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown, rojection?: CustomElementDefinition): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayLiteralExpression {
    readonly elements: readonly IsAssign[];
    static readonly $empty: ArrayLiteralExpression;
    get $kind(): ExpressionKind.ArrayLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(elements: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): readonly unknown[];
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectLiteralExpression {
    readonly keys: readonly (number | string)[];
    readonly values: readonly IsAssign[];
    static readonly $empty: ObjectLiteralExpression;
    get $kind(): ExpressionKind.ObjectLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(keys: readonly (number | string)[], values: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): Record<string, unknown>;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TemplateExpression {
    readonly cooked: readonly string[];
    readonly expressions: readonly IsAssign[];
    static readonly $empty: TemplateExpression;
    get $kind(): ExpressionKind.Template;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(cooked: readonly string[], expressions?: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): string;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TaggedTemplateExpression {
    readonly cooked: readonly string[] & {
        raw?: readonly string[];
    };
    readonly func: IsLeftHandSide;
    readonly expressions: readonly IsAssign[];
    get $kind(): ExpressionKind.TaggedTemplate;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(cooked: readonly string[] & {
        raw?: readonly string[];
    }, raw: readonly string[], func: IsLeftHandSide, expressions?: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): string;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayBindingPattern {
    readonly elements: readonly IsAssign[];
    get $kind(): ExpressionKind.ArrayBindingPattern;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(elements: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectBindingPattern {
    readonly keys: readonly (string | number)[];
    readonly values: readonly IsAssign[];
    get $kind(): ExpressionKind.ObjectBindingPattern;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(keys: readonly (string | number)[], values: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BindingIdentifier {
    readonly name: string;
    get $kind(): ExpressionKind.BindingIdentifier;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator | null): string;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ForOfStatement {
    readonly declaration: BindingIdentifierOrPattern;
    readonly iterable: IsBindingBehavior;
    get $kind(): ExpressionKind.ForOfStatement;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    count(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined): number;
    iterate(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Interpolation {
    readonly parts: readonly string[];
    readonly expressions: readonly IsBindingBehavior[];
    get $kind(): ExpressionKind.Interpolation;
    readonly isMulti: boolean;
    readonly firstExpression: IsBindingBehavior;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(parts: readonly string[], expressions?: readonly IsBindingBehavior[]);
    evaluate(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator): string;
    assign(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, locator: IServiceLocator, obj: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
//# sourceMappingURL=ast.d.ts.map
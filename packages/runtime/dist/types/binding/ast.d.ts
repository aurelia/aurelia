import { LifecycleFlags as LF } from '../observation.js';
import { IConnectableBinding } from './connectable.js';
import type { IServiceLocator, ResourceDefinition } from '@aurelia/kernel';
import type { Collection, IBindingContext, IOverrideContext, IConnectable } from '../observation.js';
import type { Scope } from '../observation/binding-context.js';
export declare const enum ExpressionKind {
    CallsFunction = 128,
    HasAncestor = 256,
    IsPrimary = 512,
    IsLeftHandSide = 1024,
    HasBind = 2048,
    HasUnbind = 4096,
    IsAssignable = 8192,
    IsLiteral = 16384,
    IsResource = 32768,
    IsForDeclaration = 65536,
    Type = 31,
    AccessThis = 1793,
    AccessScope = 10082,
    ArrayLiteral = 17955,
    ObjectLiteral = 17956,
    PrimitiveLiteral = 17925,
    Template = 17958,
    Unary = 39,
    CallScope = 1448,
    CallMember = 1161,
    CallFunction = 1162,
    AccessMember = 9323,
    AccessKeyed = 9324,
    TaggedTemplate = 1197,
    Binary = 46,
    Conditional = 63,
    Assign = 8208,
    ValueConverter = 36913,
    BindingBehavior = 38962,
    HtmlLiteral = 51,
    ArrayBindingPattern = 65556,
    ObjectBindingPattern = 65557,
    BindingIdentifier = 65558,
    ForOfStatement = 6199,
    Interpolation = 24
}
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
export interface IExpressionHydrator {
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
export declare class Unparser implements IVisitor<void> {
    text: string;
    static unparse(expr: IsExpressionOrStatement): string;
    visitAccessMember(expr: AccessMemberExpression): void;
    visitAccessKeyed(expr: AccessKeyedExpression): void;
    visitAccessThis(expr: AccessThisExpression): void;
    visitAccessScope(expr: AccessScopeExpression): void;
    visitArrayLiteral(expr: ArrayLiteralExpression): void;
    visitObjectLiteral(expr: ObjectLiteralExpression): void;
    visitPrimitiveLiteral(expr: PrimitiveLiteralExpression): void;
    visitCallFunction(expr: CallFunctionExpression): void;
    visitCallMember(expr: CallMemberExpression): void;
    visitCallScope(expr: CallScopeExpression): void;
    visitTemplate(expr: TemplateExpression): void;
    visitTaggedTemplate(expr: TaggedTemplateExpression): void;
    visitUnary(expr: UnaryExpression): void;
    visitBinary(expr: BinaryExpression): void;
    visitConditional(expr: ConditionalExpression): void;
    visitAssign(expr: AssignExpression): void;
    visitValueConverter(expr: ValueConverterExpression): void;
    visitBindingBehavior(expr: BindingBehaviorExpression): void;
    visitArrayBindingPattern(expr: ArrayBindingPattern): void;
    visitObjectBindingPattern(expr: ObjectBindingPattern): void;
    visitBindingIdentifier(expr: BindingIdentifier): void;
    visitHtmlLiteral(expr: HtmlLiteralExpression): void;
    visitForOfStatement(expr: ForOfStatement): void;
    visitInterpolation(expr: Interpolation): void;
    private writeArgs;
}
export declare class CustomExpression {
    readonly value: string;
    constructor(value: string);
    evaluate(_f: LF, _s: Scope, _l: IServiceLocator, _c: IConnectable | null): string;
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
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(f: LF, s: Scope, l: IServiceLocator, val: unknown): unknown;
    bind(f: LF, s: Scope, b: IConnectableBinding): void;
    unbind(f: LF, s: Scope, b: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
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
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(f: LF, s: Scope, l: IServiceLocator, val: unknown): unknown;
    unbind(_f: LF, _s: Scope, b: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class AssignExpression {
    readonly target: IsAssignable;
    readonly value: IsAssign;
    get $kind(): ExpressionKind.Assign;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(target: IsAssignable, value: IsAssign);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(f: LF, s: Scope, l: IServiceLocator, val: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class ConditionalExpression {
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    get $kind(): ExpressionKind.Conditional;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class AccessThisExpression {
    readonly ancestor: number;
    static readonly $this: AccessThisExpression;
    static readonly $parent: AccessThisExpression;
    get $kind(): ExpressionKind.AccessThis;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(ancestor?: number);
    evaluate(_f: LF, s: Scope, _l: IServiceLocator, _c: IConnectable | null): IBindingContext | undefined;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class AccessScopeExpression {
    readonly name: string;
    readonly ancestor: number;
    get $kind(): ExpressionKind.AccessScope;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(name: string, ancestor?: number);
    evaluate(f: LF, s: Scope, _l: IServiceLocator, c: IConnectable | null): IBindingContext | IOverrideContext;
    assign(f: LF, s: Scope, _l: IServiceLocator, val: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class AccessMemberExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    get $kind(): ExpressionKind.AccessMember;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(object: IsLeftHandSide, name: string);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(f: LF, s: Scope, l: IServiceLocator, val: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class AccessKeyedExpression {
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    get $kind(): ExpressionKind.AccessKeyed;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(object: IsLeftHandSide, key: IsAssign);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(f: LF, s: Scope, l: IServiceLocator, val: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class CallScopeExpression {
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly ancestor: number;
    get $kind(): ExpressionKind.CallScope;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(name: string, args: readonly IsAssign[], ancestor?: number);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class CallMemberExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: readonly IsAssign[];
    get $kind(): ExpressionKind.CallMember;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(object: IsLeftHandSide, name: string, args: readonly IsAssign[]);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class CallFunctionExpression {
    readonly func: IsLeftHandSide;
    readonly args: readonly IsAssign[];
    get $kind(): ExpressionKind.CallFunction;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(func: IsLeftHandSide, args: readonly IsAssign[]);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class BinaryExpression {
    readonly operation: BinaryOperator;
    readonly left: IsBinary;
    readonly right: IsBinary;
    get $kind(): ExpressionKind.Binary;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class UnaryExpression {
    readonly operation: UnaryOperator;
    readonly expression: IsLeftHandSide;
    get $kind(): ExpressionKind.Unary;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(operation: UnaryOperator, expression: IsLeftHandSide);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class PrimitiveLiteralExpression<TValue extends null | undefined | number | boolean | string = null | undefined | number | boolean | string> {
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
    evaluate(_f: LF, _s: Scope, _l: IServiceLocator, _c: IConnectable | null): TValue;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class HtmlLiteralExpression {
    readonly parts: readonly HtmlLiteralExpression[];
    get $kind(): ExpressionKind.HtmlLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(parts: readonly HtmlLiteralExpression[]);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): string;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown, _projection?: ResourceDefinition): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class ArrayLiteralExpression {
    readonly elements: readonly IsAssign[];
    static readonly $empty: ArrayLiteralExpression;
    get $kind(): ExpressionKind.ArrayLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(elements: readonly IsAssign[]);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): readonly unknown[];
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class ObjectLiteralExpression {
    readonly keys: readonly (number | string)[];
    readonly values: readonly IsAssign[];
    static readonly $empty: ObjectLiteralExpression;
    get $kind(): ExpressionKind.ObjectLiteral;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(keys: readonly (number | string)[], values: readonly IsAssign[]);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): Record<string, unknown>;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class TemplateExpression {
    readonly cooked: readonly string[];
    readonly expressions: readonly IsAssign[];
    static readonly $empty: TemplateExpression;
    get $kind(): ExpressionKind.Template;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(cooked: readonly string[], expressions?: readonly IsAssign[]);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): string;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
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
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): string;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class ArrayBindingPattern {
    readonly elements: readonly IsAssign[];
    get $kind(): ExpressionKind.ArrayBindingPattern;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(elements: readonly IsAssign[]);
    evaluate(_f: LF, _s: Scope, _l: IServiceLocator, _c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class ObjectBindingPattern {
    readonly keys: readonly (string | number)[];
    readonly values: readonly IsAssign[];
    get $kind(): ExpressionKind.ObjectBindingPattern;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(keys: readonly (string | number)[], values: readonly IsAssign[]);
    evaluate(_f: LF, _s: Scope, _l: IServiceLocator, _c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class BindingIdentifier {
    readonly name: string;
    get $kind(): ExpressionKind.BindingIdentifier;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(name: string);
    evaluate(_f: LF, _s: Scope, _l: IServiceLocator | null, _c: IConnectable | null): string;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
export declare class ForOfStatement {
    readonly declaration: BindingIdentifierOrPattern;
    readonly iterable: IsBindingBehavior;
    get $kind(): ExpressionKind.ForOfStatement;
    get hasBind(): false;
    get hasUnbind(): false;
    constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior);
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): unknown;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    count(_f: LF, result: Collection | number | null | undefined): number;
    iterate(f: LF, result: Collection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void;
    bind(f: LF, s: Scope, b: IConnectableBinding): void;
    unbind(f: LF, s: Scope, b: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
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
    evaluate(f: LF, s: Scope, l: IServiceLocator, c: IConnectable | null): string;
    assign(_f: LF, _s: Scope, _l: IServiceLocator, _obj: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
    toString(): string;
}
//# sourceMappingURL=ast.d.ts.map
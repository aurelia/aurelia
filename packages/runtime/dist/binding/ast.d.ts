import { IIndexable, IServiceLocator, StrictPrimitive } from '@aurelia/kernel';
import { IBindScope } from '../lifecycle';
import { Collection, IBindingContext, IOverrideContext, IScope, LifecycleFlags, ObservedCollection } from '../observation';
import { IBinding } from './binding';
import { IConnectableBinding } from './connectable';
export declare type IsPrimary = AccessThis | AccessScope | ArrayLiteral | ObjectLiteral | PrimitiveLiteral | Template;
export declare type IsLiteral = ArrayLiteral | ObjectLiteral | PrimitiveLiteral | Template;
export declare type IsLeftHandSide = IsPrimary | CallFunction | CallMember | CallScope | AccessMember | AccessKeyed | TaggedTemplate;
export declare type IsUnary = IsLeftHandSide | Unary;
export declare type IsBinary = IsUnary | Binary;
export declare type IsConditional = IsBinary | Conditional;
export declare type IsAssign = IsConditional | Assign;
export declare type IsValueConverter = IsAssign | ValueConverter;
export declare type IsBindingBehavior = IsValueConverter | BindingBehavior;
export declare type IsAssignable = AccessScope | AccessKeyed | AccessMember | Assign;
export declare type IsExpression = IsBindingBehavior | Interpolation;
export declare type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | HtmlLiteral;
export declare type Connects = AccessScope | ArrayLiteral | ObjectLiteral | Template | Unary | CallScope | AccessMember | AccessKeyed | TaggedTemplate | Binary | Conditional | ValueConverter | BindingBehavior | ForOfStatement;
export declare type Observes = AccessScope | AccessKeyed | AccessMember;
export declare type CallsFunction = CallFunction | CallScope | CallMember | TaggedTemplate;
export declare type IsResource = ValueConverter | BindingBehavior;
export declare type HasBind = BindingBehavior;
export declare type HasUnbind = ValueConverter | BindingBehavior;
export declare type HasAncestor = AccessThis | AccessScope | CallScope;
export interface IVisitor<T = unknown> {
    visitAccessKeyed(expr: AccessKeyed): T;
    visitAccessMember(expr: AccessMember): T;
    visitAccessScope(expr: AccessScope): T;
    visitAccessThis(expr: AccessThis): T;
    visitArrayBindingPattern(expr: ArrayBindingPattern): T;
    visitArrayLiteral(expr: ArrayLiteral): T;
    visitAssign(expr: Assign): T;
    visitBinary(expr: Binary): T;
    visitBindingBehavior(expr: BindingBehavior): T;
    visitBindingIdentifier(expr: BindingIdentifier): T;
    visitCallFunction(expr: CallFunction): T;
    visitCallMember(expr: CallMember): T;
    visitCallScope(expr: CallScope): T;
    visitConditional(expr: Conditional): T;
    visitForOfStatement(expr: ForOfStatement): T;
    visitHtmlLiteral(expr: HtmlLiteral): T;
    visitInterpolation(expr: Interpolation): T;
    visitObjectBindingPattern(expr: ObjectBindingPattern): T;
    visitObjectLiteral(expr: ObjectLiteral): T;
    visitPrimitiveLiteral(expr: PrimitiveLiteral): T;
    visitTaggedTemplate(expr: TaggedTemplate): T;
    visitTemplate(expr: Template): T;
    visitUnary(expr: Unary): T;
    visitValueConverter(expr: ValueConverter): T;
}
export interface IExpression {
    readonly $kind: ExpressionKind;
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
    assign?(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, value: unknown): unknown;
    bind?(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
    unbind?(flags: LifecycleFlags, scope: IScope, binding: IBinding): void;
}
export declare const enum ExpressionKind {
    Connects = 32,
    Observes = 64,
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
    ForOfStatement = 55,
    Interpolation = 24
}
export declare function connects(expr: IsExpressionOrStatement): expr is Connects;
export declare function observes(expr: IsExpressionOrStatement): expr is Observes;
export declare function callsFunction(expr: IsExpressionOrStatement): expr is CallsFunction;
export declare function hasAncestor(expr: IsExpressionOrStatement): expr is HasAncestor;
export declare function isAssignable(expr: IsExpressionOrStatement): expr is IsAssignable;
export declare function isLeftHandSide(expr: IsExpressionOrStatement): expr is IsLeftHandSide;
export declare function isPrimary(expr: IsExpressionOrStatement): expr is IsPrimary;
export declare function isResource(expr: IsExpressionOrStatement): expr is IsResource;
export declare function hasBind(expr: IsExpressionOrStatement): expr is HasBind;
export declare function hasUnbind(expr: IsExpressionOrStatement): expr is HasUnbind;
export declare function isLiteral(expr: IsExpressionOrStatement): expr is IsLiteral;
export declare function arePureLiterals(expressions: ReadonlyArray<IsExpressionOrStatement> | undefined): expressions is IsLiteral[];
export declare function isPureLiteral(expr: IsExpressionOrStatement): expr is IsLiteral;
export declare class BindingBehavior implements IExpression {
    $kind: ExpressionKind.BindingBehavior;
    readonly expression: IsBindingBehavior;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    readonly behaviorKey: string;
    private readonly expressionHasBind;
    private readonly expressionHasUnbind;
    constructor(expression: IsBindingBehavior, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ValueConverter implements IExpression {
    $kind: ExpressionKind.ValueConverter;
    readonly expression: IsValueConverter;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    readonly converterKey: string;
    constructor(expression: IsValueConverter, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Assign implements IExpression {
    $kind: ExpressionKind.Assign;
    readonly target: IsAssignable;
    readonly value: IsAssign;
    constructor(target: IsAssignable, value: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Conditional implements IExpression {
    $kind: ExpressionKind.Conditional;
    assign: IExpression['assign'];
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessThis implements IExpression {
    static readonly $this: AccessThis;
    static readonly $parent: AccessThis;
    $kind: ExpressionKind.AccessThis;
    assign: IExpression['assign'];
    connect: IExpression['connect'];
    readonly ancestor: number;
    constructor(ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): IBindingContext | undefined;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessScope implements IExpression {
    $kind: ExpressionKind.AccessScope;
    readonly name: string;
    readonly ancestor: number;
    constructor(name: string, ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): IBindingContext | IBindScope | IOverrideContext;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessMember implements IExpression {
    $kind: ExpressionKind.AccessMember;
    readonly object: IsLeftHandSide;
    readonly name: string;
    constructor(object: IsLeftHandSide, name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessKeyed implements IExpression {
    $kind: ExpressionKind.AccessKeyed;
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    constructor(object: IsLeftHandSide, key: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallScope implements IExpression {
    $kind: ExpressionKind.CallScope;
    assign: IExpression['assign'];
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    readonly ancestor: number;
    constructor(name: string, args: ReadonlyArray<IsAssign>, ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallMember implements IExpression {
    $kind: ExpressionKind.CallMember;
    assign: IExpression['assign'];
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    constructor(object: IsLeftHandSide, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallFunction implements IExpression {
    $kind: ExpressionKind.CallFunction;
    assign: IExpression['assign'];
    readonly func: IsLeftHandSide;
    readonly args: ReadonlyArray<IsAssign>;
    constructor(func: IsLeftHandSide, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare type BinaryOperator = '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';
export declare class Binary implements IExpression {
    $kind: ExpressionKind.Binary;
    assign: IExpression['assign'];
    readonly operation: BinaryOperator;
    readonly left: IsBinary;
    readonly right: IsBinary;
    constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    private ['&&'];
    private ['||'];
    private ['=='];
    private ['==='];
    private ['!='];
    private ['!=='];
    private ['instanceof'];
    private ['in'];
    private ['+'];
    private ['-'];
    private ['*'];
    private ['/'];
    private ['%'];
    private ['<'];
    private ['>'];
    private ['<='];
    private ['>='];
    accept<T>(visitor: IVisitor<T>): T;
}
export declare type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';
export declare class Unary implements IExpression {
    $kind: ExpressionKind.Unary;
    assign: IExpression['assign'];
    readonly operation: UnaryOperator;
    readonly expression: IsLeftHandSide;
    constructor(operation: UnaryOperator, expression: IsLeftHandSide);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    ['void'](f: LifecycleFlags, s: IScope, l: IServiceLocator): undefined;
    ['typeof'](f: LifecycleFlags, s: IScope, l: IServiceLocator): string;
    ['!'](f: LifecycleFlags, s: IScope, l: IServiceLocator): boolean;
    ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator): number;
    ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator): number;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class PrimitiveLiteral<TValue extends StrictPrimitive = StrictPrimitive> implements IExpression {
    static readonly $undefined: PrimitiveLiteral<undefined>;
    static readonly $null: PrimitiveLiteral<null>;
    static readonly $true: PrimitiveLiteral<true>;
    static readonly $false: PrimitiveLiteral<false>;
    static readonly $empty: PrimitiveLiteral<string>;
    $kind: ExpressionKind.PrimitiveLiteral;
    connect: IExpression['connect'];
    assign: IExpression['assign'];
    readonly value: TValue;
    constructor(value: TValue);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): TValue;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class HtmlLiteral implements IExpression {
    $kind: ExpressionKind.HtmlLiteral;
    assign: IExpression['assign'];
    readonly parts: ReadonlyArray<HtmlLiteral>;
    constructor(parts: ReadonlyArray<HtmlLiteral>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayLiteral implements IExpression {
    static readonly $empty: ArrayLiteral;
    $kind: ExpressionKind.ArrayLiteral;
    assign: IExpression['assign'];
    readonly elements: ReadonlyArray<IsAssign>;
    constructor(elements: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): ReadonlyArray<unknown>;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectLiteral implements IExpression {
    static readonly $empty: ObjectLiteral;
    $kind: ExpressionKind.ObjectLiteral;
    assign: IExpression['assign'];
    readonly keys: ReadonlyArray<number | string>;
    readonly values: ReadonlyArray<IsAssign>;
    constructor(keys: ReadonlyArray<number | string>, values: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): Record<string, unknown>;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Template implements IExpression {
    static readonly $empty: Template;
    $kind: ExpressionKind.Template;
    assign: IExpression['assign'];
    readonly cooked: ReadonlyArray<string>;
    readonly expressions: ReadonlyArray<IsAssign>;
    constructor(cooked: ReadonlyArray<string>, expressions?: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TaggedTemplate implements IExpression {
    $kind: ExpressionKind.TaggedTemplate;
    assign: IExpression['assign'];
    readonly cooked: ReadonlyArray<string> & {
        raw?: ReadonlyArray<string>;
    };
    readonly func: IsLeftHandSide;
    readonly expressions: ReadonlyArray<IsAssign>;
    constructor(cooked: ReadonlyArray<string> & {
        raw?: ReadonlyArray<string>;
    }, raw: ReadonlyArray<string>, func: IsLeftHandSide, expressions?: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayBindingPattern implements IExpression {
    $kind: ExpressionKind.ArrayBindingPattern;
    readonly elements: ReadonlyArray<IsAssign>;
    constructor(elements: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectBindingPattern implements IExpression {
    $kind: ExpressionKind.ObjectBindingPattern;
    readonly keys: ReadonlyArray<string | number>;
    readonly values: ReadonlyArray<IsAssign>;
    constructor(keys: ReadonlyArray<string | number>, values: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BindingIdentifier implements IExpression {
    $kind: ExpressionKind.BindingIdentifier;
    readonly name: string;
    constructor(name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export declare class ForOfStatement implements IExpression {
    $kind: ExpressionKind.ForOfStatement;
    assign: IExpression['assign'];
    readonly declaration: BindingIdentifierOrPattern;
    readonly iterable: IsBindingBehavior;
    constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    count(result: ObservedCollection | number | null | undefined): number;
    iterate(result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Interpolation implements IExpression {
    $kind: ExpressionKind.Interpolation;
    assign: IExpression['assign'];
    readonly parts: ReadonlyArray<string>;
    readonly expressions: ReadonlyArray<IsBindingBehavior>;
    readonly isMulti: boolean;
    readonly firstExpression: IsBindingBehavior;
    constructor(parts: ReadonlyArray<string>, expressions?: ReadonlyArray<IsBindingBehavior>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
//# sourceMappingURL=ast.d.ts.map
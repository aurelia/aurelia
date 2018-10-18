import { IIndexable, IServiceLocator } from '@aurelia/kernel';
import { IBinding } from './binding';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { IConnectableBinding } from './connectable';
import { Collection, ObservedCollection } from './observation';
export declare type StrictPrimitive = string | number | boolean | null | undefined;
/**
 * StrictAny is a somewhat strongly typed alternative to 'any', in an effort to try to get rid of all 'any''s
 * It's not even remotely foolproof however, and this can largely be attributed to the fact that TypeScript imposes
 * far more constraints on what arithmic is allowed than vanilla JS does.
 * We don't necessarily want to impose the same constraints on users (e.g. by performing auto conversions or throwing),
 * because even though that behavior would technically be "better", it could also be experienced as unpredictable.
 * We'd generally not want to ask more of users than to simply understand how vanilla JS works, and let them account for its quirks themselves.
 * This gives end users less framework-specific things to learn.
 * Consequently, it's impossible to achieve any kind of strict type checking in the AST and generally in the observers.
 * We're trying to achieve some middle ground by applying some explicit type casts where TypeScript would otherwise not allow compilation.
 */
export declare type StrictAny = StrictPrimitive | IIndexable | Function;
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
export interface IVisitor<T = any> {
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
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
    assign?(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null, value: StrictAny): StrictAny;
    bind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
    unbind?(flags: BindingFlags, scope: IScope, binding: IBinding): void;
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
export declare function arePureLiterals(expressions: ReadonlyArray<IsExpressionOrStatement>): expressions is IsLiteral[];
export declare function isPureLiteral(expr: IsExpressionOrStatement): expr is IsLiteral;
export declare class BindingBehavior implements IExpression {
    readonly expression: IsBindingBehavior;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.BindingBehavior;
    readonly behaviorKey: string;
    private readonly expressionHasBind;
    private readonly expressionHasUnbind;
    constructor(expression: IsBindingBehavior, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    bind(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ValueConverter implements IExpression {
    readonly expression: IsValueConverter;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.ValueConverter;
    readonly converterKey: string;
    constructor(expression: IsValueConverter, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Assign implements IExpression {
    readonly target: IsAssignable;
    readonly value: IsAssign;
    $kind: ExpressionKind.Assign;
    constructor(target: IsAssignable, value: IsAssign);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Conditional implements IExpression {
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    $kind: ExpressionKind.Conditional;
    assign: IExpression['assign'];
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessThis implements IExpression {
    readonly ancestor: number;
    static readonly $this: AccessThis;
    static readonly $parent: AccessThis;
    $kind: ExpressionKind.AccessThis;
    assign: IExpression['assign'];
    connect: IExpression['connect'];
    constructor(ancestor?: number);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessScope implements IExpression {
    readonly name: string;
    readonly ancestor: number;
    $kind: ExpressionKind.AccessScope;
    constructor(name: string, ancestor?: number);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessMember implements IExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    $kind: ExpressionKind.AccessMember;
    constructor(object: IsLeftHandSide, name: string);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessKeyed implements IExpression {
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    $kind: ExpressionKind.AccessKeyed;
    constructor(object: IsLeftHandSide, key: IsAssign);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, value: StrictAny): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallScope implements IExpression {
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    readonly ancestor: number;
    $kind: ExpressionKind.CallScope;
    assign: IExpression['assign'];
    constructor(name: string, args: ReadonlyArray<IsAssign>, ancestor?: number);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator | null): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallMember implements IExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.CallMember;
    assign: IExpression['assign'];
    constructor(object: IsLeftHandSide, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallFunction implements IExpression {
    readonly func: IsLeftHandSide;
    readonly args: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.CallFunction;
    assign: IExpression['assign'];
    constructor(func: IsLeftHandSide, args: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare type BinaryOperator = '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';
export declare class Binary implements IExpression {
    readonly operation: BinaryOperator;
    readonly left: IsBinary;
    readonly right: IsBinary;
    $kind: ExpressionKind.Binary;
    assign: IExpression['assign'];
    constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
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
    readonly operation: UnaryOperator;
    readonly expression: IsLeftHandSide;
    $kind: ExpressionKind.Unary;
    assign: IExpression['assign'];
    constructor(operation: UnaryOperator, expression: IsLeftHandSide);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    ['void'](f: BindingFlags, s: IScope, l: IServiceLocator): undefined;
    ['typeof'](f: BindingFlags, s: IScope, l: IServiceLocator): string;
    ['!'](f: BindingFlags, s: IScope, l: IServiceLocator): boolean;
    ['-'](f: BindingFlags, s: IScope, l: IServiceLocator): number;
    ['+'](f: BindingFlags, s: IScope, l: IServiceLocator): number;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class PrimitiveLiteral<TValue extends StrictPrimitive = StrictPrimitive> implements IExpression {
    readonly value: TValue;
    static readonly $undefined: PrimitiveLiteral<undefined>;
    static readonly $null: PrimitiveLiteral<null>;
    static readonly $true: PrimitiveLiteral<true>;
    static readonly $false: PrimitiveLiteral<false>;
    static readonly $empty: PrimitiveLiteral<string>;
    $kind: ExpressionKind.PrimitiveLiteral;
    connect: IExpression['connect'];
    assign: IExpression['assign'];
    constructor(value: TValue);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): TValue;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class HtmlLiteral implements IExpression {
    readonly parts: ReadonlyArray<HtmlLiteral>;
    $kind: ExpressionKind.HtmlLiteral;
    assign: IExpression['assign'];
    constructor(parts: ReadonlyArray<HtmlLiteral>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayLiteral implements IExpression {
    readonly elements: ReadonlyArray<IsAssign>;
    static readonly $empty: ArrayLiteral;
    $kind: ExpressionKind.ArrayLiteral;
    assign: IExpression['assign'];
    constructor(elements: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): ReadonlyArray<StrictAny>;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectLiteral implements IExpression {
    readonly keys: ReadonlyArray<number | string>;
    readonly values: ReadonlyArray<IsAssign>;
    static readonly $empty: ObjectLiteral;
    $kind: ExpressionKind.ObjectLiteral;
    assign: IExpression['assign'];
    constructor(keys: ReadonlyArray<number | string>, values: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): Record<string, StrictAny>;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Template implements IExpression {
    readonly cooked: ReadonlyArray<string>;
    readonly expressions?: ReadonlyArray<IsAssign>;
    static readonly $empty: Template;
    $kind: ExpressionKind.Template;
    assign: IExpression['assign'];
    constructor(cooked: ReadonlyArray<string>, expressions?: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TaggedTemplate implements IExpression {
    readonly cooked: ReadonlyArray<string> & {
        raw?: ReadonlyArray<string>;
    };
    readonly func: IsLeftHandSide;
    readonly expressions?: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.TaggedTemplate;
    assign: IExpression['assign'];
    constructor(cooked: ReadonlyArray<string> & {
        raw?: ReadonlyArray<string>;
    }, raw: ReadonlyArray<string>, func: IsLeftHandSide, expressions?: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayBindingPattern implements IExpression {
    readonly elements: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.ArrayBindingPattern;
    constructor(elements: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): any;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectBindingPattern implements IExpression {
    readonly keys: ReadonlyArray<string | number>;
    readonly values: ReadonlyArray<IsAssign>;
    $kind: ExpressionKind.ObjectBindingPattern;
    constructor(keys: ReadonlyArray<string | number>, values: ReadonlyArray<IsAssign>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): any;
    assign(flags: BindingFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): any;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BindingIdentifier implements IExpression {
    readonly name: string;
    $kind: ExpressionKind.BindingIdentifier;
    constructor(name: string);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export declare class ForOfStatement implements IExpression {
    readonly declaration: BindingIdentifierOrPattern;
    readonly iterable: IsBindingBehavior;
    $kind: ExpressionKind.ForOfStatement;
    assign: IExpression['assign'];
    constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): StrictAny;
    count(result: ObservedCollection | number | null | undefined): number;
    iterate(result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: any) => void): void;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Interpolation implements IExpression {
    readonly parts: ReadonlyArray<string>;
    readonly expressions: ReadonlyArray<IsBindingBehavior>;
    $kind: ExpressionKind.Interpolation;
    assign: IExpression['assign'];
    readonly isMulti: boolean;
    readonly firstExpression: IsBindingBehavior;
    constructor(parts: ReadonlyArray<string>, expressions: ReadonlyArray<IsBindingBehavior>);
    evaluate(flags: BindingFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: BindingFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
//# sourceMappingURL=ast.d.ts.map
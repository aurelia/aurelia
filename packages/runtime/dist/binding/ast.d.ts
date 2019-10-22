import { IIndexable, IServiceLocator, StrictPrimitive } from '@aurelia/kernel';
import { BinaryOperator, BindingIdentifierOrPattern, CallsFunction, Connects, HasAncestor, HasBind, HasUnbind, IAccessKeyedExpression, IAccessMemberExpression, IAccessScopeExpression, IAccessThisExpression, IArrayBindingPattern, IArrayLiteralExpression, IAssignExpression, IBinaryExpression, IBindingBehaviorExpression, IBindingIdentifier, ICallFunctionExpression, ICallMemberExpression, ICallScopeExpression, IConditionalExpression, IExpression, IForOfStatement, IHtmlLiteralExpression, IInterpolationExpression, IObjectBindingPattern, IObjectLiteralExpression, IPrimitiveLiteralExpression, IsAssign, IsAssignable, IsBinary, IsBindingBehavior, IsExpressionOrStatement, IsLeftHandSide, IsLiteral, IsPrimary, IsResource, IsValueConverter, ITaggedTemplateExpression, ITemplateExpression, IUnaryExpression, IValueConverterExpression, IVisitor, Observes, UnaryOperator } from '../ast';
import { ExpressionKind, LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { Collection, IBindingContext, IOverrideContext, IScope, ObservedCollection } from '../observation';
import { BindingBehaviorInstance } from '../resources/binding-behavior';
import { IConnectableBinding } from './connectable';
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
export declare function arePureLiterals(expressions: readonly IsExpressionOrStatement[] | undefined): expressions is IsLiteral[];
export declare function isPureLiteral(expr: IsExpressionOrStatement): expr is IsLiteral;
export declare class CustomExpression {
    readonly value: string;
    constructor(value: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string;
}
export declare class BindingBehaviorExpression implements IBindingBehaviorExpression {
    readonly $kind: ExpressionKind.BindingBehavior;
    expression: IsBindingBehavior;
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly behaviorKey: string;
    constructor(expression: IsBindingBehavior, name: string, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding & {
        [key: string]: BindingBehaviorInstance | undefined;
    }): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding & {
        [key: string]: BindingBehaviorInstance | undefined;
    }): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ValueConverterExpression implements IValueConverterExpression {
    readonly $kind: ExpressionKind.ValueConverter;
    readonly expression: IsValueConverter;
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly converterKey: string;
    constructor(expression: IsValueConverter, name: string, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AssignExpression implements IAssignExpression {
    readonly $kind: ExpressionKind.Assign;
    readonly target: IsAssignable;
    readonly value: IsAssign;
    constructor(target: IsAssignable, value: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ConditionalExpression implements IConditionalExpression {
    readonly $kind: ExpressionKind.Conditional;
    assign: IExpression['assign'];
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessThisExpression implements IAccessThisExpression {
    static readonly $this: AccessThisExpression;
    static readonly $parent: AccessThisExpression;
    readonly $kind: ExpressionKind.AccessThis;
    assign: IExpression['assign'];
    connect: IExpression['connect'];
    readonly ancestor: number;
    constructor(ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): IBindingContext | undefined;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessScopeExpression implements IAccessScopeExpression {
    readonly $kind: ExpressionKind.AccessScope;
    readonly name: string;
    readonly ancestor: number;
    constructor(name: string, ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): IBindingContext | IBinding | IOverrideContext;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessMemberExpression implements IAccessMemberExpression {
    readonly $kind: ExpressionKind.AccessMember;
    readonly object: IsLeftHandSide;
    readonly name: string;
    constructor(object: IsLeftHandSide, name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessKeyedExpression implements IAccessKeyedExpression {
    readonly $kind: ExpressionKind.AccessKeyed;
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    constructor(object: IsLeftHandSide, key: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallScopeExpression implements ICallScopeExpression {
    readonly $kind: ExpressionKind.CallScope;
    assign: IExpression['assign'];
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly ancestor: number;
    constructor(name: string, args: readonly IsAssign[], ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallMemberExpression implements ICallMemberExpression {
    readonly $kind: ExpressionKind.CallMember;
    assign: IExpression['assign'];
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: readonly IsAssign[];
    constructor(object: IsLeftHandSide, name: string, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallFunctionExpression implements ICallFunctionExpression {
    readonly $kind: ExpressionKind.CallFunction;
    assign: IExpression['assign'];
    readonly func: IsLeftHandSide;
    readonly args: readonly IsAssign[];
    constructor(func: IsLeftHandSide, args: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BinaryExpression implements IBinaryExpression {
    readonly $kind: ExpressionKind.Binary;
    assign: IExpression['assign'];
    readonly operation: BinaryOperator;
    readonly left: IsBinary;
    readonly right: IsBinary;
    constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
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
export declare class UnaryExpression implements IUnaryExpression {
    readonly $kind: ExpressionKind.Unary;
    assign: IExpression['assign'];
    readonly operation: UnaryOperator;
    readonly expression: IsLeftHandSide;
    constructor(operation: UnaryOperator, expression: IsLeftHandSide);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    ['void'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): undefined;
    ['typeof'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): string;
    ['!'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): boolean;
    ['-'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number;
    ['+'](f: LifecycleFlags, s: IScope, l: IServiceLocator, p?: string): number;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class PrimitiveLiteralExpression<TValue extends StrictPrimitive = StrictPrimitive> implements IPrimitiveLiteralExpression {
    static readonly $undefined: PrimitiveLiteralExpression<undefined>;
    static readonly $null: PrimitiveLiteralExpression<null>;
    static readonly $true: PrimitiveLiteralExpression<true>;
    static readonly $false: PrimitiveLiteralExpression<false>;
    static readonly $empty: PrimitiveLiteralExpression<string>;
    readonly $kind: ExpressionKind.PrimitiveLiteral;
    connect: IExpression['connect'];
    assign: IExpression['assign'];
    readonly value: TValue;
    constructor(value: TValue);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): TValue;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class HtmlLiteralExpression implements IHtmlLiteralExpression {
    readonly $kind: ExpressionKind.HtmlLiteral;
    assign: IExpression['assign'];
    readonly parts: readonly HtmlLiteralExpression[];
    constructor(parts: readonly HtmlLiteralExpression[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayLiteralExpression implements IArrayLiteralExpression {
    static readonly $empty: ArrayLiteralExpression;
    readonly $kind: ExpressionKind.ArrayLiteral;
    assign: IExpression['assign'];
    readonly elements: readonly IsAssign[];
    constructor(elements: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): readonly unknown[];
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectLiteralExpression implements IObjectLiteralExpression {
    static readonly $empty: ObjectLiteralExpression;
    readonly $kind: ExpressionKind.ObjectLiteral;
    assign: IExpression['assign'];
    readonly keys: readonly (number | string)[];
    readonly values: readonly IsAssign[];
    constructor(keys: readonly (number | string)[], values: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): Record<string, unknown>;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TemplateExpression implements ITemplateExpression {
    static readonly $empty: TemplateExpression;
    readonly $kind: ExpressionKind.Template;
    assign: IExpression['assign'];
    readonly cooked: readonly string[];
    readonly expressions: readonly IsAssign[];
    constructor(cooked: readonly string[], expressions?: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TaggedTemplateExpression implements ITaggedTemplateExpression {
    readonly $kind: ExpressionKind.TaggedTemplate;
    assign: IExpression['assign'];
    readonly cooked: readonly string[] & {
        raw?: readonly string[];
    };
    readonly func: IsLeftHandSide;
    readonly expressions: readonly IsAssign[];
    constructor(cooked: readonly string[] & {
        raw?: readonly string[];
    }, raw: readonly string[], func: IsLeftHandSide, expressions?: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayBindingPattern implements IArrayBindingPattern {
    readonly $kind: ExpressionKind.ArrayBindingPattern;
    readonly elements: readonly IsAssign[];
    constructor(elements: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectBindingPattern implements IObjectBindingPattern {
    readonly $kind: ExpressionKind.ObjectBindingPattern;
    readonly keys: readonly (string | number)[];
    readonly values: readonly IsAssign[];
    constructor(keys: readonly (string | number)[], values: readonly IsAssign[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable, part?: string): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BindingIdentifier implements IBindingIdentifier {
    readonly $kind: ExpressionKind.BindingIdentifier;
    readonly name: string;
    constructor(name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, part?: string): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ForOfStatement implements IForOfStatement {
    readonly $kind: ExpressionKind.ForOfStatement;
    assign: IExpression['assign'];
    readonly declaration: BindingIdentifierOrPattern;
    readonly iterable: IsBindingBehavior;
    constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): unknown;
    count(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined): number;
    iterate(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Interpolation implements IInterpolationExpression {
    readonly $kind: ExpressionKind.Interpolation;
    assign: IExpression['assign'];
    readonly parts: readonly string[];
    readonly expressions: readonly IsBindingBehavior[];
    readonly isMulti: boolean;
    readonly firstExpression: IsBindingBehavior;
    constructor(parts: readonly string[], expressions?: readonly IsBindingBehavior[]);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, part?: string): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding, part?: string): void;
    accept<T>(visitor: IVisitor<T>): T;
}
//# sourceMappingURL=ast.d.ts.map
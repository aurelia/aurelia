import { IIndexable, IServiceLocator, StrictPrimitive } from '@aurelia/kernel';
import { BinaryOperator, BindingIdentifierOrPattern, CallsFunction, Connects, HasAncestor, HasBind, HasUnbind, IAccessKeyedExpression, IAccessMemberExpression, IAccessScopeExpression, IAccessThisExpression, IArrayBindingPattern, IArrayLiteralExpression, IAssignExpression, IBinaryExpression, IBindingBehaviorExpression, IBindingIdentifier, ICallFunctionExpression, ICallMemberExpression, ICallScopeExpression, IConditionalExpression, IExpression, IForOfStatement, IHtmlLiteralExpression, IInterpolationExpression, IObjectBindingPattern, IObjectLiteralExpression, IPrimitiveLiteralExpression, IsAssign, IsAssignable, IsBinary, IsBindingBehavior, IsExpressionOrStatement, IsLeftHandSide, IsLiteral, IsPrimary, IsResource, IsValueConverter, ITaggedTemplateExpression, ITemplateExpression, IUnaryExpression, IValueConverterExpression, IVisitor, Observes, UnaryOperator } from '../ast';
import { ExpressionKind, LifecycleFlags } from '../flags';
import { IBinding } from '../lifecycle';
import { Collection, IBindingContext, IOverrideContext, IScope, ObservedCollection } from '../observation';
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
export declare function arePureLiterals(expressions: ReadonlyArray<IsExpressionOrStatement> | undefined): expressions is IsLiteral[];
export declare function isPureLiteral(expr: IsExpressionOrStatement): expr is IsLiteral;
export declare class BindingBehavior implements IBindingBehaviorExpression {
    readonly $kind: ExpressionKind.BindingBehavior;
    readonly expression: IsBindingBehavior;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    readonly behaviorKey: string;
    constructor(expression: IsBindingBehavior, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ValueConverter implements IValueConverterExpression {
    readonly $kind: ExpressionKind.ValueConverter;
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
export declare class Assign implements IAssignExpression {
    readonly $kind: ExpressionKind.Assign;
    readonly target: IsAssignable;
    readonly value: IsAssign;
    constructor(target: IsAssignable, value: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Conditional implements IConditionalExpression {
    readonly $kind: ExpressionKind.Conditional;
    assign: IExpression['assign'];
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessThis implements IAccessThisExpression {
    static readonly $this: AccessThis;
    static readonly $parent: AccessThis;
    readonly $kind: ExpressionKind.AccessThis;
    assign: IExpression['assign'];
    connect: IExpression['connect'];
    readonly ancestor: number;
    constructor(ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): IBindingContext | undefined;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessScope implements IAccessScopeExpression {
    readonly $kind: ExpressionKind.AccessScope;
    readonly name: string;
    readonly ancestor: number;
    constructor(name: string, ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): IBindingContext | IBinding | IOverrideContext;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessMember implements IAccessMemberExpression {
    readonly $kind: ExpressionKind.AccessMember;
    readonly object: IsLeftHandSide;
    readonly name: string;
    constructor(object: IsLeftHandSide, name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class AccessKeyed implements IAccessKeyedExpression {
    readonly $kind: ExpressionKind.AccessKeyed;
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    constructor(object: IsLeftHandSide, key: IsAssign);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallScope implements ICallScopeExpression {
    readonly $kind: ExpressionKind.CallScope;
    assign: IExpression['assign'];
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    readonly ancestor: number;
    constructor(name: string, args: ReadonlyArray<IsAssign>, ancestor?: number);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallMember implements ICallMemberExpression {
    readonly $kind: ExpressionKind.CallMember;
    assign: IExpression['assign'];
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: ReadonlyArray<IsAssign>;
    constructor(object: IsLeftHandSide, name: string, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class CallFunction implements ICallFunctionExpression {
    readonly $kind: ExpressionKind.CallFunction;
    assign: IExpression['assign'];
    readonly func: IsLeftHandSide;
    readonly args: ReadonlyArray<IsAssign>;
    constructor(func: IsLeftHandSide, args: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Binary implements IBinaryExpression {
    readonly $kind: ExpressionKind.Binary;
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
export declare class Unary implements IUnaryExpression {
    readonly $kind: ExpressionKind.Unary;
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
export declare class PrimitiveLiteral<TValue extends StrictPrimitive = StrictPrimitive> implements IPrimitiveLiteralExpression {
    static readonly $undefined: PrimitiveLiteral<undefined>;
    static readonly $null: PrimitiveLiteral<null>;
    static readonly $true: PrimitiveLiteral<true>;
    static readonly $false: PrimitiveLiteral<false>;
    static readonly $empty: PrimitiveLiteral<string>;
    readonly $kind: ExpressionKind.PrimitiveLiteral;
    connect: IExpression['connect'];
    assign: IExpression['assign'];
    readonly value: TValue;
    constructor(value: TValue);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): TValue;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class HtmlLiteral implements IHtmlLiteralExpression {
    readonly $kind: ExpressionKind.HtmlLiteral;
    assign: IExpression['assign'];
    readonly parts: ReadonlyArray<HtmlLiteral>;
    constructor(parts: ReadonlyArray<HtmlLiteral>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ArrayLiteral implements IArrayLiteralExpression {
    static readonly $empty: ArrayLiteral;
    readonly $kind: ExpressionKind.ArrayLiteral;
    assign: IExpression['assign'];
    readonly elements: ReadonlyArray<IsAssign>;
    constructor(elements: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): ReadonlyArray<unknown>;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectLiteral implements IObjectLiteralExpression {
    static readonly $empty: ObjectLiteral;
    readonly $kind: ExpressionKind.ObjectLiteral;
    assign: IExpression['assign'];
    readonly keys: ReadonlyArray<number | string>;
    readonly values: ReadonlyArray<IsAssign>;
    constructor(keys: ReadonlyArray<number | string>, values: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): Record<string, unknown>;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Template implements ITemplateExpression {
    static readonly $empty: Template;
    readonly $kind: ExpressionKind.Template;
    assign: IExpression['assign'];
    readonly cooked: ReadonlyArray<string>;
    readonly expressions: ReadonlyArray<IsAssign>;
    constructor(cooked: ReadonlyArray<string>, expressions?: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class TaggedTemplate implements ITaggedTemplateExpression {
    readonly $kind: ExpressionKind.TaggedTemplate;
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
export declare class ArrayBindingPattern implements IArrayBindingPattern {
    readonly $kind: ExpressionKind.ArrayBindingPattern;
    readonly elements: ReadonlyArray<IsAssign>;
    constructor(elements: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ObjectBindingPattern implements IObjectBindingPattern {
    readonly $kind: ExpressionKind.ObjectBindingPattern;
    readonly keys: ReadonlyArray<string | number>;
    readonly values: ReadonlyArray<IsAssign>;
    constructor(keys: ReadonlyArray<string | number>, values: ReadonlyArray<IsAssign>);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, obj: IIndexable): unknown;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class BindingIdentifier implements IBindingIdentifier {
    readonly $kind: ExpressionKind.BindingIdentifier;
    readonly name: string;
    constructor(name: string);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null): string;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class ForOfStatement implements IForOfStatement {
    readonly $kind: ExpressionKind.ForOfStatement;
    assign: IExpression['assign'];
    readonly declaration: BindingIdentifierOrPattern;
    readonly iterable: IsBindingBehavior;
    constructor(declaration: BindingIdentifierOrPattern, iterable: IsBindingBehavior);
    evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator): unknown;
    count(result: ObservedCollection | number | null | undefined): number;
    iterate(result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void;
    connect(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    bind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectableBinding): void;
    accept<T>(visitor: IVisitor<T>): T;
}
export declare class Interpolation implements IInterpolationExpression {
    readonly $kind: ExpressionKind.Interpolation;
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
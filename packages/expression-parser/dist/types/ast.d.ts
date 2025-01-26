import type { IVisitor } from './ast.visitor';
export type ExpressionKind = 'AccessThis' | 'AccessGlobal' | 'AccessBoundary' | 'AccessScope' | 'ArrayLiteral' | 'ObjectLiteral' | 'PrimitiveLiteral' | 'New' | 'Template' | 'Unary' | 'CallScope' | 'CallMember' | 'CallFunction' | 'CallGlobal' | 'AccessMember' | 'AccessKeyed' | 'TaggedTemplate' | 'Binary' | 'Conditional' | 'Assign' | 'ArrowFunction' | 'ValueConverter' | 'BindingBehavior' | 'ArrayBindingPattern' | 'ObjectBindingPattern' | 'BindingIdentifier' | 'ForOfStatement' | 'Interpolation' | 'ArrayDestructuring' | 'ObjectDestructuring' | 'DestructuringAssignmentLeaf' | 'Custom';
export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+' | '++' | '--';
export type BinaryOperator = '??' | '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '**' | '<' | '>' | '<=' | '>=';
export type AssignmentOperator = '=' | '/=' | '*=' | '+=' | '-=';
export type IsPrimary = AccessThisExpression | AccessBoundaryExpression | AccessScopeExpression | AccessGlobalExpression | ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression | NewExpression;
export type IsLiteral = ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLeftHandSide = IsPrimary | CallGlobalExpression | CallFunctionExpression | CallMemberExpression | CallScopeExpression | AccessMemberExpression | AccessKeyedExpression | TaggedTemplateExpression;
export type IsUnary = IsLeftHandSide | UnaryExpression;
export type IsBinary = IsUnary | BinaryExpression;
export type IsConditional = IsBinary | ConditionalExpression;
export type IsAssign = IsConditional | AssignExpression | ArrowFunction;
export type IsValueConverter = IsAssign | ValueConverterExpression;
export type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
export type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
export type IsExpression = IsBindingBehavior | Interpolation;
export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
export type AnyBindingExpression<TCustom extends CustomExpression = CustomExpression> = Interpolation | ForOfStatement | TCustom | IsBindingBehavior;
export declare class CustomExpression {
    readonly value: unknown;
    readonly $kind = "Custom";
    constructor(value: unknown);
    evaluate(...params: unknown[]): unknown;
    assign(...params: unknown[]): unknown;
    bind(...params: unknown[]): void;
    unbind(...params: unknown[]): void;
    accept<T>(_visitor: IVisitor<T>): T;
}
export declare class BindingBehaviorExpression {
    readonly expression: IsBindingBehavior;
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly $kind = "BindingBehavior";
    /**
     * The name of the property to store a binding behavior on the binding when binding
     */
    readonly key: string;
    constructor(expression: IsBindingBehavior, name: string, args: readonly IsAssign[]);
}
export declare class ValueConverterExpression {
    readonly expression: IsValueConverter;
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly $kind = "ValueConverter";
    constructor(expression: IsValueConverter, name: string, args: readonly IsAssign[]);
}
export declare class AssignExpression {
    readonly target: IsAssignable;
    readonly value: IsAssign;
    readonly op: AssignmentOperator;
    readonly $kind = "Assign";
    constructor(target: IsAssignable, value: IsAssign, op?: AssignmentOperator);
}
export declare class ConditionalExpression {
    readonly condition: IsBinary;
    readonly yes: IsAssign;
    readonly no: IsAssign;
    readonly $kind = "Conditional";
    constructor(condition: IsBinary, yes: IsAssign, no: IsAssign);
}
export declare class AccessGlobalExpression {
    readonly name: string;
    readonly $kind: 'AccessGlobal';
    constructor(name: string);
}
export declare class AccessThisExpression {
    readonly ancestor: number;
    readonly $kind: 'AccessThis';
    constructor(ancestor?: number);
}
export declare class AccessBoundaryExpression {
    readonly $kind: 'AccessBoundary';
}
export declare class AccessScopeExpression {
    readonly name: string;
    readonly ancestor: number;
    readonly $kind = "AccessScope";
    constructor(name: string, ancestor?: number);
}
export declare class AccessMemberExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly optional: boolean;
    readonly $kind: 'AccessMember';
    readonly accessGlobal: boolean;
    constructor(object: IsLeftHandSide, name: string, optional?: boolean);
}
export declare class AccessKeyedExpression {
    readonly object: IsLeftHandSide;
    readonly key: IsAssign;
    readonly optional: boolean;
    readonly $kind = "AccessKeyed";
    readonly accessGlobal: boolean;
    constructor(object: IsLeftHandSide, key: IsAssign, optional?: boolean);
}
export declare class NewExpression {
    readonly func: IsLeftHandSide;
    readonly args: readonly IsAssign[];
    readonly $kind = "New";
    constructor(func: IsLeftHandSide, args: readonly IsAssign[]);
}
export declare class CallScopeExpression {
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly ancestor: number;
    readonly optional: boolean;
    readonly $kind = "CallScope";
    constructor(name: string, args: readonly IsAssign[], ancestor?: number, optional?: boolean);
}
export declare class CallMemberExpression {
    readonly object: IsLeftHandSide;
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly optionalMember: boolean;
    readonly optionalCall: boolean;
    readonly $kind = "CallMember";
    constructor(object: IsLeftHandSide, name: string, args: readonly IsAssign[], optionalMember?: boolean, optionalCall?: boolean);
}
export declare class CallFunctionExpression {
    readonly func: IsLeftHandSide;
    readonly args: readonly IsAssign[];
    readonly optional: boolean;
    readonly $kind = "CallFunction";
    constructor(func: IsLeftHandSide, args: readonly IsAssign[], optional?: boolean);
}
export declare class CallGlobalExpression {
    readonly name: string;
    readonly args: readonly IsAssign[];
    readonly $kind = "CallGlobal";
    constructor(name: string, args: readonly IsAssign[]);
}
export declare class BinaryExpression {
    readonly operation: BinaryOperator;
    readonly left: IsBinary;
    readonly right: IsBinary;
    readonly $kind: 'Binary';
    constructor(operation: BinaryOperator, left: IsBinary, right: IsBinary);
}
export declare class UnaryExpression {
    readonly operation: UnaryOperator;
    readonly expression: IsLeftHandSide;
    readonly pos: 0 | 1;
    readonly $kind = "Unary";
    constructor(operation: UnaryOperator, expression: IsLeftHandSide, pos?: 0 | 1);
}
export declare class PrimitiveLiteralExpression<TValue extends null | undefined | number | boolean | string = null | undefined | number | boolean | string> {
    readonly value: TValue;
    static readonly $undefined: PrimitiveLiteralExpression<undefined>;
    static readonly $null: PrimitiveLiteralExpression<null>;
    static readonly $true: PrimitiveLiteralExpression<true>;
    static readonly $false: PrimitiveLiteralExpression<false>;
    static readonly $empty: PrimitiveLiteralExpression<string>;
    readonly $kind = "PrimitiveLiteral";
    constructor(value: TValue);
}
export declare class ArrayLiteralExpression {
    readonly elements: readonly IsAssign[];
    static readonly $empty: ArrayLiteralExpression;
    readonly $kind = "ArrayLiteral";
    constructor(elements: readonly IsAssign[]);
}
export declare class ObjectLiteralExpression {
    readonly keys: readonly (number | string)[];
    readonly values: readonly IsAssign[];
    static readonly $empty: ObjectLiteralExpression;
    readonly $kind = "ObjectLiteral";
    constructor(keys: readonly (number | string)[], values: readonly IsAssign[]);
}
export declare class TemplateExpression {
    readonly cooked: readonly string[];
    readonly expressions: readonly IsAssign[];
    static readonly $empty: TemplateExpression;
    readonly $kind = "Template";
    constructor(cooked: readonly string[], expressions?: readonly IsAssign[]);
}
export declare class TaggedTemplateExpression {
    readonly cooked: readonly string[] & {
        raw?: readonly string[];
    };
    readonly func: IsLeftHandSide;
    readonly expressions: readonly IsAssign[];
    readonly $kind = "TaggedTemplate";
    constructor(cooked: readonly string[] & {
        raw?: readonly string[];
    }, raw: readonly string[], func: IsLeftHandSide, expressions?: readonly IsAssign[]);
}
export declare class ArrayBindingPattern {
    readonly elements: readonly IsAssign[];
    readonly $kind = "ArrayBindingPattern";
    constructor(elements: readonly IsAssign[]);
}
export declare class ObjectBindingPattern {
    readonly keys: readonly (string | number)[];
    readonly values: readonly IsAssign[];
    readonly $kind = "ObjectBindingPattern";
    constructor(keys: readonly (string | number)[], values: readonly IsAssign[]);
}
export declare class BindingIdentifier {
    readonly name: string;
    readonly $kind = "BindingIdentifier";
    constructor(name: string);
}
export declare class ForOfStatement {
    readonly declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression;
    readonly iterable: IsBindingBehavior;
    readonly semiIdx: number;
    readonly $kind = "ForOfStatement";
    constructor(declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression, iterable: IsBindingBehavior, semiIdx: number);
}
export declare class Interpolation {
    readonly parts: readonly string[];
    readonly expressions: readonly IsBindingBehavior[];
    readonly $kind = "Interpolation";
    readonly isMulti: boolean;
    readonly firstExpression: IsBindingBehavior;
    constructor(parts: readonly string[], expressions?: readonly IsBindingBehavior[]);
}
/** This is an internal API */
export declare class DestructuringAssignmentExpression {
    readonly $kind: 'ArrayDestructuring' | 'ObjectDestructuring';
    readonly list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[];
    readonly source: AccessMemberExpression | AccessKeyedExpression | undefined;
    readonly initializer: IsBindingBehavior | undefined;
    constructor($kind: 'ArrayDestructuring' | 'ObjectDestructuring', list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[], source: AccessMemberExpression | AccessKeyedExpression | undefined, initializer: IsBindingBehavior | undefined);
}
/** This is an internal API */
export declare class DestructuringAssignmentSingleExpression {
    readonly target: AccessMemberExpression;
    readonly source: AccessMemberExpression | AccessKeyedExpression;
    readonly initializer: IsBindingBehavior | undefined;
    readonly $kind = "DestructuringAssignmentLeaf";
    constructor(target: AccessMemberExpression, source: AccessMemberExpression | AccessKeyedExpression, initializer: IsBindingBehavior | undefined);
}
/** This is an internal API */
export declare class DestructuringAssignmentRestExpression {
    readonly target: AccessMemberExpression;
    readonly indexOrProperties: string[] | number;
    readonly $kind = "DestructuringAssignmentLeaf";
    constructor(target: AccessMemberExpression, indexOrProperties: string[] | number);
}
export declare class ArrowFunction {
    args: BindingIdentifier[];
    body: IsAssign;
    rest: boolean;
    readonly $kind = "ArrowFunction";
    constructor(args: BindingIdentifier[], body: IsAssign, rest?: boolean);
}
//# sourceMappingURL=ast.d.ts.map
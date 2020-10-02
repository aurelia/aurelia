import {
  IServiceLocator,
  StrictPrimitive
} from '@aurelia/kernel';
import {
  ExpressionKind,
  LifecycleFlags
} from './flags';
import {
  Collection,
  IScope,
  ObservedCollection
} from './observation';

export type IsPrimary = IAccessThisExpression | IAccessScopeExpression | IArrayLiteralExpression | IObjectLiteralExpression | IPrimitiveLiteralExpression | ITemplateExpression;
export type IsLiteral = IArrayLiteralExpression | IObjectLiteralExpression | IPrimitiveLiteralExpression | ITemplateExpression;
export type IsLeftHandSide = IsPrimary | ICallFunctionExpression | ICallMemberExpression | ICallScopeExpression | IAccessMemberExpression | IAccessKeyedExpression | ITaggedTemplateExpression;
export type IsUnary = IsLeftHandSide | IUnaryExpression;
export type IsBinary = IsUnary | IBinaryExpression;
export type IsConditional = IsBinary | IConditionalExpression;
export type IsAssign = IsConditional | IAssignExpression;
export type IsValueConverter = IsAssign | IValueConverterExpression;
export type IsBindingBehavior = IsValueConverter | IBindingBehaviorExpression;
export type IsAssignable = IAccessScopeExpression | IAccessKeyedExpression | IAccessMemberExpression | IAssignExpression;
export type IsExpression = IsBindingBehavior | IInterpolationExpression;
export type IsExpressionOrStatement = IsExpression | IForOfStatement | BindingIdentifierOrPattern | IHtmlLiteralExpression;
export type Connects = IAccessScopeExpression | IArrayLiteralExpression | IObjectLiteralExpression | ITemplateExpression | IUnaryExpression | ICallScopeExpression | IAccessMemberExpression | IAccessKeyedExpression | ITaggedTemplateExpression | IBinaryExpression | IConditionalExpression | IValueConverterExpression | IBindingBehaviorExpression | IForOfStatement;
export type Observes = IAccessScopeExpression | IAccessKeyedExpression | IAccessMemberExpression;
export type CallsFunction = ICallFunctionExpression | ICallScopeExpression | ICallMemberExpression | ITaggedTemplateExpression;
export type IsResource = IValueConverterExpression | IBindingBehaviorExpression;
export type HasBind = IBindingBehaviorExpression | IForOfStatement;
export type HasUnbind = IValueConverterExpression | IBindingBehaviorExpression | IForOfStatement;
export type HasAncestor = IAccessThisExpression | IAccessScopeExpression | ICallScopeExpression;
export type AnyBindingExpression = IInterpolationExpression | IForOfStatement | IsBindingBehavior;

export interface IHydrator {
  hydrate(jsonExpr: any): any;
}
export interface IVisitor<T = unknown> {
  visitAccessKeyed(expr: IAccessKeyedExpression): T;
  visitAccessMember(expr: IAccessMemberExpression): T;
  visitAccessScope(expr: IAccessScopeExpression): T;
  visitAccessThis(expr: IAccessThisExpression): T;
  visitArrayBindingPattern(expr: IArrayBindingPattern): T;
  visitArrayLiteral(expr: IArrayLiteralExpression): T;
  visitAssign(expr: IAssignExpression): T;
  visitBinary(expr: IBinaryExpression): T;
  visitBindingBehavior(expr: IBindingBehaviorExpression): T;
  visitBindingIdentifier(expr: IBindingIdentifier): T;
  visitCallFunction(expr: ICallFunctionExpression): T;
  visitCallMember(expr: ICallMemberExpression): T;
  visitCallScope(expr: ICallScopeExpression): T;
  visitConditional(expr: IConditionalExpression): T;
  visitForOfStatement(expr: IForOfStatement): T;
  visitHtmlLiteral(expr: IHtmlLiteralExpression): T;
  visitInterpolation(expr: IInterpolationExpression): T;
  visitObjectBindingPattern(expr: IObjectBindingPattern): T;
  visitObjectLiteral(expr: IObjectLiteralExpression): T;
  visitPrimitiveLiteral(expr: IPrimitiveLiteralExpression): T;
  visitTaggedTemplate(expr: ITaggedTemplateExpression): T;
  visitTemplate(expr: ITemplateExpression): T;
  visitUnary(expr: IUnaryExpression): T;
  visitValueConverter(expr: IValueConverterExpression): T;
}

export interface IExpression {
  readonly $kind: ExpressionKind;
  accept<T>(visitor: IVisitor<T>): T;
  connect(flags: LifecycleFlags, scope: IScope, binding: IConnectable, part?: string): void;
  evaluate(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, part?: string): unknown;
  assign?(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator | null, value: unknown, part?: string): unknown;
  bind?(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
  unbind?(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
}

export interface IConnectable {
  readonly locator: IServiceLocator;
  observeProperty(flags: LifecycleFlags, obj: object, propertyName: string): void;
}

export interface IBindingBehaviorExpression extends IExpression {
  readonly $kind: ExpressionKind.BindingBehavior;
  readonly expression: IsBindingBehavior;
  readonly name: string;
  readonly args: readonly IsAssign[];
  readonly behaviorKey: string;
  assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
  bind(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
}

export interface IValueConverterExpression extends IExpression {
  readonly $kind: ExpressionKind.ValueConverter;
  readonly expression: IsValueConverter;
  readonly name: string;
  readonly args: readonly IsAssign[];
  readonly converterKey: string;
  assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
}

export interface IAssignExpression extends IExpression {
  readonly $kind: ExpressionKind.Assign;
  readonly target: IsAssignable;
  readonly value: IsAssign;
  assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
}

export interface IConditionalExpression extends IExpression {
  readonly $kind: ExpressionKind.Conditional;
  readonly condition: IsBinary;
  readonly yes: IsAssign;
  readonly no: IsAssign;
}

export interface IAccessThisExpression extends IExpression {
  readonly $kind: ExpressionKind.AccessThis;
  readonly ancestor: number;
}

export interface IAccessScopeExpression extends IExpression {
  readonly $kind: ExpressionKind.AccessScope;
  readonly name: string;
  readonly ancestor: number;
  assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
}

export interface IAccessMemberExpression extends IExpression {
  readonly $kind: ExpressionKind.AccessMember;
  readonly object: IsLeftHandSide;
  readonly name: string;
  assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
}

export interface IAccessKeyedExpression extends IExpression {
  readonly $kind: ExpressionKind.AccessKeyed;
  readonly object: IsLeftHandSide;
  readonly key: IsAssign;
  assign(flags: LifecycleFlags, scope: IScope, locator: IServiceLocator, value: unknown, part?: string): unknown;
}

export interface ICallScopeExpression extends IExpression {
  readonly $kind: ExpressionKind.CallScope;
  readonly name: string;
  readonly args: readonly IsAssign[];
  readonly ancestor: number;
}

export interface ICallMemberExpression extends IExpression {
  readonly $kind: ExpressionKind.CallMember;
  readonly object: IsLeftHandSide;
  readonly name: string;
  readonly args: readonly IsAssign[];
}

export interface ICallFunctionExpression extends IExpression {
  readonly $kind: ExpressionKind.CallFunction;
  readonly func: IsLeftHandSide;
  readonly args: readonly IsAssign[];
}

export type BinaryOperator = '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';

export interface IBinaryExpression extends IExpression {
  readonly $kind: ExpressionKind.Binary;
  readonly operation: BinaryOperator;
  readonly left: IsBinary;
  readonly right: IsBinary;
}

export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';

export interface IUnaryExpression extends IExpression {
  readonly $kind: ExpressionKind.Unary;
  readonly operation: UnaryOperator;
  readonly expression: IsLeftHandSide;
}
export interface IPrimitiveLiteralExpression<TValue extends StrictPrimitive = StrictPrimitive> extends IExpression {
  readonly $kind: ExpressionKind.PrimitiveLiteral;
  readonly value: TValue;
}

export interface IHtmlLiteralExpression extends IExpression {
  readonly $kind: ExpressionKind.HtmlLiteral;
  readonly parts: readonly IHtmlLiteralExpression[];
}

export interface IArrayLiteralExpression extends IExpression {
  readonly $kind: ExpressionKind.ArrayLiteral;
  readonly elements: readonly IsAssign[];
}

export interface IObjectLiteralExpression extends IExpression {
  readonly $kind: ExpressionKind.ObjectLiteral;
  readonly keys: readonly (number | string)[];
  readonly values: readonly IsAssign[];
}

export interface ITemplateExpression extends IExpression {
  readonly $kind: ExpressionKind.Template;
  readonly cooked: readonly string[];
  readonly expressions: readonly IsAssign[];
}

export interface ITaggedTemplateExpression extends IExpression {
  readonly $kind: ExpressionKind.TaggedTemplate;
  readonly cooked: readonly string[] & { raw?: readonly string[] };
  readonly func: IsLeftHandSide;
  readonly expressions: readonly IsAssign[];
}

export interface IArrayBindingPattern extends IExpression {
  readonly $kind: ExpressionKind.ArrayBindingPattern;
  readonly elements: readonly IsAssign[];
}

export interface IObjectBindingPattern extends IExpression {
  readonly $kind: ExpressionKind.ObjectBindingPattern;
  readonly keys: readonly (string | number)[];
  readonly values: readonly IsAssign[];
}

export interface IBindingIdentifier extends IExpression {
  readonly $kind: ExpressionKind.BindingIdentifier;
  readonly name: string;
}

export type BindingIdentifierOrPattern = IBindingIdentifier | IArrayBindingPattern | IObjectBindingPattern;

export interface IForOfStatement extends IExpression {
  readonly $kind: ExpressionKind.ForOfStatement;
  readonly declaration: BindingIdentifierOrPattern;
  readonly iterable: IsBindingBehavior;

  count(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined): number;
  iterate(flags: LifecycleFlags, result: ObservedCollection | number | null | undefined, func: (arr: Collection, index: number, item: unknown) => void): void;
  bind(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
  unbind(flags: LifecycleFlags, scope: IScope, binding: IConnectable): void;
}

export interface IInterpolationExpression extends IExpression {
  readonly $kind: ExpressionKind.Interpolation;
  readonly parts: readonly string[];
  readonly expressions: readonly IsBindingBehavior[];
  readonly isMulti: boolean;
  readonly firstExpression: IsBindingBehavior;
}

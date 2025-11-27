/* eslint-disable @typescript-eslint/no-unused-vars */
import { emptyArray } from '@aurelia/kernel';
import type { IVisitor } from './ast.visitor';

/** @internal */ export const ekAccessThis = 'AccessThis';
/** @internal */ export const ekAccessBoundary = 'AccessBoundary';
/** @internal */ export const ekAccessGlobal = 'AccessGlobal';
/** @internal */ export const ekAccessScope = 'AccessScope';
/** @internal */ export const ekArrayLiteral = 'ArrayLiteral';
/** @internal */ export const ekObjectLiteral = 'ObjectLiteral';
/** @internal */ export const ekPrimitiveLiteral = 'PrimitiveLiteral';
/** @internal */ export const ekNew = 'New';
/** @internal */ export const ekTemplate = 'Template';
/** @internal */ export const ekUnary = 'Unary';
/** @internal */ export const ekCallScope = 'CallScope';
/** @internal */ export const ekCallMember = 'CallMember';
/** @internal */ export const ekCallFunction = 'CallFunction';
/** @internal */ export const ekCallGlobal = 'CallGlobal';
/** @internal */ export const ekAccessMember = 'AccessMember';
/** @internal */ export const ekAccessKeyed = 'AccessKeyed';
/** @internal */ export const ekTaggedTemplate = 'TaggedTemplate';
/** @internal */ export const ekBinary = 'Binary';
/** @internal */ export const ekConditional = 'Conditional';
/** @internal */ export const ekAssign = 'Assign';
/** @internal */ export const ekArrowFunction = 'ArrowFunction';
/** @internal */ export const ekValueConverter = 'ValueConverter';
/** @internal */ export const ekBindingBehavior = 'BindingBehavior';
/** @internal */ export const ekArrayBindingPattern = 'ArrayBindingPattern';
/** @internal */ export const ekObjectBindingPattern = 'ObjectBindingPattern';
/** @internal */ export const ekBindingIdentifier = 'BindingIdentifier';
/** @internal */ export const ekForOfStatement = 'ForOfStatement';
/** @internal */ export const ekInterpolation = 'Interpolation';
/** @internal */ export const ekArrayDestructuring = 'ArrayDestructuring';
/** @internal */ export const ekObjectDestructuring = 'ObjectDestructuring';
/** @internal */ export const ekDestructuringAssignmentLeaf = 'DestructuringAssignmentLeaf';
/** @internal */ export const ekCustom = 'Custom';

export type ExpressionKind =
  | 'AccessThis'
  | 'AccessGlobal'
  | 'AccessBoundary'
  | 'AccessScope'
  | 'ArrayLiteral'
  | 'ObjectLiteral'
  | 'PrimitiveLiteral'
  | 'New'
  | 'Template'
  | 'Unary'
  | 'CallScope'
  | 'CallMember'
  | 'CallFunction'
  | 'CallGlobal'
  | 'AccessMember'
  | 'AccessKeyed'
  | 'TaggedTemplate'
  | 'Binary'
  | 'Conditional'
  | 'Assign'
  | 'ArrowFunction'
  | 'ValueConverter'
  | 'BindingBehavior'
  | 'ArrayBindingPattern'
  | 'ObjectBindingPattern'
  | 'BindingIdentifier'
  | 'ForOfStatement'
  | 'Interpolation'
  | 'ArrayDestructuring'
  | 'ObjectDestructuring'
  | 'DestructuringAssignmentLeaf'
  | 'Custom';

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

// Kept as a class because it carries runtime behavior methods (evaluate, assign, etc.)
export class CustomExpression {
  public readonly $kind = ekCustom;
  public constructor(public readonly value: unknown) {}
  public evaluate(...params: unknown[]): unknown { return this.value; }
  public assign(...params: unknown[]): unknown { return params; }
  public bind(...params: unknown[]): void { /* empty */ }
  public unbind(...params: unknown[]): void { /* empty */ }
  public accept<T>(_visitor: IVisitor<T>): T { return (void 0)!; }
}

export interface BindingBehaviorExpression {
  readonly $kind: 'BindingBehavior';
  readonly key: string;
  readonly expression: IsBindingBehavior;
  readonly name: string;
  readonly args: readonly IsAssign[];
}

export function createBindingBehaviorExpression(expression: IsBindingBehavior, name: string, args: readonly IsAssign[]): BindingBehaviorExpression {
  return { $kind: ekBindingBehavior, key: `_bb_${name}`, expression, name, args };
}

export interface ValueConverterExpression {
  readonly $kind: 'ValueConverter';
  readonly expression: IsValueConverter;
  readonly name: string;
  readonly args: readonly IsAssign[];
}

export function createValueConverterExpression(expression: IsValueConverter, name: string, args: readonly IsAssign[]): ValueConverterExpression {
  return { $kind: ekValueConverter, expression, name, args };
}

export interface AssignExpression {
  readonly $kind: 'Assign';
  readonly target: IsAssignable;
  readonly value: IsAssign;
  readonly op: AssignmentOperator;
}

export function createAssignExpression(target: IsAssignable, value: IsAssign, op: AssignmentOperator = '='): AssignExpression {
  return { $kind: ekAssign, target, value, op };
}

export interface ConditionalExpression {
  readonly $kind: 'Conditional';
  readonly condition: IsBinary;
  readonly yes: IsAssign;
  readonly no: IsAssign;
}

export function createConditionalExpression(condition: IsBinary, yes: IsAssign, no: IsAssign): ConditionalExpression {
  return { $kind: ekConditional, condition, yes, no };
}

export interface AccessGlobalExpression {
  readonly $kind: 'AccessGlobal';
  readonly name: string;
}

export function createAccessGlobalExpression(name: string): AccessGlobalExpression {
  return { $kind: ekAccessGlobal, name };
}

export interface AccessThisExpression {
  readonly $kind: 'AccessThis';
  readonly ancestor: number;
}

export function createAccessThisExpression(ancestor: number = 0): AccessThisExpression {
  return { $kind: ekAccessThis, ancestor };
}

export interface AccessBoundaryExpression {
  readonly $kind: 'AccessBoundary';
}

export const AccessBoundary: AccessBoundaryExpression = { $kind: ekAccessBoundary };

export function createAccessBoundaryExpression(): AccessBoundaryExpression {
  return AccessBoundary;
}

export interface AccessScopeExpression {
  readonly $kind: 'AccessScope';
  readonly name: string;
  readonly ancestor: number;
}

export function createAccessScopeExpression(name: string, ancestor: number = 0): AccessScopeExpression {
  return { $kind: ekAccessScope, name, ancestor };
}

export interface AccessMemberExpression {
  readonly $kind: 'AccessMember';
  readonly accessGlobal: boolean;
  readonly object: IsLeftHandSide;
  readonly name: string;
  readonly optional: boolean;
}

function isAccessGlobal(ast: IsLeftHandSide) {
  return ast.$kind === ekAccessGlobal || ((ast.$kind === ekAccessMember || ast.$kind === ekAccessKeyed) && ast.accessGlobal);
}

export function createAccessMemberExpression(object: IsLeftHandSide, name: string, optional: boolean = false): AccessMemberExpression {
  return { $kind: ekAccessMember, accessGlobal: isAccessGlobal(object), object, name, optional };
}

export interface AccessKeyedExpression {
  readonly $kind: 'AccessKeyed';
  readonly accessGlobal: boolean;
  readonly object: IsLeftHandSide;
  readonly key: IsAssign;
  readonly optional: boolean;
}

export function createAccessKeyedExpression(object: IsLeftHandSide, key: IsAssign, optional: boolean = false): AccessKeyedExpression {
  return { $kind: ekAccessKeyed, accessGlobal: isAccessGlobal(object), object, key, optional };
}

export interface NewExpression {
  readonly $kind: 'New';
  readonly func: IsLeftHandSide;
  readonly args: readonly IsAssign[];
}

export function createNewExpression(func: IsLeftHandSide, args: readonly IsAssign[]): NewExpression {
  return { $kind: ekNew, func, args };
}

export interface CallScopeExpression {
  readonly $kind: 'CallScope';
  readonly name: string;
  readonly args: readonly IsAssign[];
  readonly ancestor: number;
  readonly optional: boolean;
}

export function createCallScopeExpression(name: string, args: readonly IsAssign[], ancestor: number = 0, optional: boolean = false): CallScopeExpression {
  return { $kind: ekCallScope, name, args, ancestor, optional };
}

export interface CallMemberExpression {
  readonly $kind: 'CallMember';
  readonly object: IsLeftHandSide;
  readonly name: string;
  readonly args: readonly IsAssign[];
  readonly optionalMember: boolean;
  readonly optionalCall: boolean;
}

export function createCallMemberExpression(object: IsLeftHandSide, name: string, args: readonly IsAssign[], optionalMember: boolean = false, optionalCall: boolean = false): CallMemberExpression {
  return { $kind: ekCallMember, object, name, args, optionalMember, optionalCall };
}

export interface CallFunctionExpression {
  readonly $kind: 'CallFunction';
  readonly func: IsLeftHandSide;
  readonly args: readonly IsAssign[];
  readonly optional: boolean;
}

export function createCallFunctionExpression(func: IsLeftHandSide, args: readonly IsAssign[], optional: boolean = false): CallFunctionExpression {
  return { $kind: ekCallFunction, func, args, optional };
}

export interface CallGlobalExpression {
  readonly $kind: 'CallGlobal';
  readonly name: string;
  readonly args: readonly IsAssign[];
}

export function createCallGlobalExpression(name: string, args: readonly IsAssign[]): CallGlobalExpression {
  return { $kind: ekCallGlobal, name, args };
}

export interface BinaryExpression {
  readonly $kind: 'Binary';
  readonly operation: BinaryOperator;
  readonly left: IsBinary;
  readonly right: IsBinary;
}

export function createBinaryExpression(operation: BinaryOperator, left: IsBinary, right: IsBinary): BinaryExpression {
  return { $kind: ekBinary, operation, left, right };
}

export interface UnaryExpression {
  readonly $kind: 'Unary';
  readonly operation: UnaryOperator;
  readonly expression: IsLeftHandSide;
  readonly pos: 0 | 1;
}

export function createUnaryExpression(operation: UnaryOperator, expression: IsLeftHandSide, pos: 0 | 1 = 0): UnaryExpression {
  return { $kind: ekUnary, operation, expression, pos };
}

export interface PrimitiveLiteralExpression<TValue extends null | undefined | number | boolean | string = null | undefined | number | boolean | string> {
  readonly $kind: 'PrimitiveLiteral';
  readonly value: TValue;
}

export const PrimitiveLiteral = {
  $undefined: { $kind: ekPrimitiveLiteral, value: undefined } satisfies PrimitiveLiteralExpression<undefined>,
  $null: { $kind: ekPrimitiveLiteral, value: null } satisfies PrimitiveLiteralExpression<null>,
  $true: { $kind: ekPrimitiveLiteral, value: true } satisfies PrimitiveLiteralExpression<true>,
  $false: { $kind: ekPrimitiveLiteral, value: false } satisfies PrimitiveLiteralExpression<false>,
  $empty: { $kind: ekPrimitiveLiteral, value: '' } satisfies PrimitiveLiteralExpression<string>,
};

export function createPrimitiveLiteral<T extends null | undefined | number | boolean | string>(value: T): PrimitiveLiteralExpression<T> {
  return { $kind: ekPrimitiveLiteral, value };
}

export interface ArrayLiteralExpression {
  readonly $kind: 'ArrayLiteral';
  readonly elements: readonly IsAssign[];
}

export const ArrayLiteral = {
  $empty: { $kind: ekArrayLiteral, elements: emptyArray } satisfies ArrayLiteralExpression
};

export function createArrayLiteralExpression(elements: readonly IsAssign[]): ArrayLiteralExpression {
  return { $kind: ekArrayLiteral, elements };
}

export interface ObjectLiteralExpression {
  readonly $kind: 'ObjectLiteral';
  readonly keys: readonly (number | string)[];
  readonly values: readonly IsAssign[];
}

export const ObjectLiteral = {
  $empty: { $kind: ekObjectLiteral, keys: emptyArray, values: emptyArray } satisfies ObjectLiteralExpression
};

export function createObjectLiteralExpression(keys: readonly (number | string)[], values: readonly IsAssign[]): ObjectLiteralExpression {
  return { $kind: ekObjectLiteral, keys, values };
}

export interface TemplateExpression {
  readonly $kind: 'Template';
  readonly cooked: readonly string[];
  readonly expressions: readonly IsAssign[];
}

export const Template = {
  $empty: { $kind: ekTemplate, cooked: [''], expressions: emptyArray } satisfies TemplateExpression
};

export function createTemplateExpression(cooked: readonly string[], expressions: readonly IsAssign[] = emptyArray): TemplateExpression {
  return { $kind: ekTemplate, cooked, expressions };
}

export interface TaggedTemplateExpression {
  readonly $kind: 'TaggedTemplate';
  readonly cooked: readonly string[] & { raw?: readonly string[] };
  readonly func: IsLeftHandSide;
  readonly expressions: readonly IsAssign[];
}

export function createTaggedTemplateExpression(cooked: readonly string[] & { raw?: readonly string[] }, raw: readonly string[], func: IsLeftHandSide, expressions: readonly IsAssign[] = emptyArray): TaggedTemplateExpression {
  cooked.raw = raw;
  return { $kind: ekTaggedTemplate, cooked, func, expressions };
}

export interface ArrayBindingPattern {
  readonly $kind: 'ArrayBindingPattern';
  readonly elements: readonly IsAssign[];
}

export function createArrayBindingPattern(elements: readonly IsAssign[]): ArrayBindingPattern {
  return { $kind: ekArrayBindingPattern, elements };
}

export interface ObjectBindingPattern {
  readonly $kind: 'ObjectBindingPattern';
  readonly keys: readonly (string | number)[];
  readonly values: readonly IsAssign[];
}

export function createObjectBindingPattern(keys: readonly (string | number)[], values: readonly IsAssign[]): ObjectBindingPattern {
  return { $kind: ekObjectBindingPattern, keys, values };
}

export interface BindingIdentifier {
  readonly $kind: 'BindingIdentifier';
  readonly name: string;
}

export function createBindingIdentifier(name: string): BindingIdentifier {
  return { $kind: ekBindingIdentifier, name };
}

export interface ForOfStatement {
  readonly $kind: 'ForOfStatement';
  readonly declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression;
  readonly iterable: IsBindingBehavior;
  readonly semiIdx: number;
}

export function createForOfStatement(declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression, iterable: IsBindingBehavior, semiIdx: number): ForOfStatement {
  return { $kind: ekForOfStatement, declaration, iterable, semiIdx };
}

export interface Interpolation {
  readonly $kind: 'Interpolation';
  readonly isMulti: boolean;
  readonly firstExpression: IsBindingBehavior;
  readonly parts: readonly string[];
  readonly expressions: readonly IsBindingBehavior[];
}

export function createInterpolation(parts: readonly string[], expressions: readonly IsBindingBehavior[] = emptyArray): Interpolation {
  return {
    $kind: ekInterpolation,
    isMulti: expressions.length > 1,
    firstExpression: expressions[0],
    parts,
    expressions
  };
}

export interface DestructuringAssignmentExpression {
  readonly $kind: 'ArrayDestructuring' | 'ObjectDestructuring';
  readonly list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[];
  readonly source: AccessMemberExpression | AccessKeyedExpression | undefined;
  readonly initializer: IsBindingBehavior | undefined;
}

export function createDestructuringAssignmentExpression($kind: 'ArrayDestructuring' | 'ObjectDestructuring', list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[], source: AccessMemberExpression | AccessKeyedExpression | undefined, initializer: IsBindingBehavior | undefined): DestructuringAssignmentExpression {
  return { $kind, list, source, initializer };
}

export interface DestructuringAssignmentSingleExpression {
  readonly $kind: 'DestructuringAssignmentLeaf';
  readonly target: AccessMemberExpression;
  readonly source: AccessMemberExpression | AccessKeyedExpression;
  readonly initializer: IsBindingBehavior | undefined;
}

export function createDestructuringAssignmentSingleExpression(target: AccessMemberExpression, source: AccessMemberExpression | AccessKeyedExpression, initializer: IsBindingBehavior | undefined): DestructuringAssignmentSingleExpression {
  return { $kind: ekDestructuringAssignmentLeaf, target, source, initializer };
}

export interface DestructuringAssignmentRestExpression {
  readonly $kind: 'DestructuringAssignmentLeaf';
  readonly target: AccessMemberExpression;
  readonly indexOrProperties: string[] | number;
}

export function createDestructuringAssignmentRestExpression(target: AccessMemberExpression, indexOrProperties: string[] | number): DestructuringAssignmentRestExpression {
  return { $kind: ekDestructuringAssignmentLeaf, target, indexOrProperties };
}

export interface ArrowFunction {
  readonly $kind: 'ArrowFunction';
  readonly args: BindingIdentifier[];
  readonly body: IsAssign;
  readonly rest: boolean;
}

export function createArrowFunction(args: BindingIdentifier[], body: IsAssign, rest: boolean = false): ArrowFunction {
  return { $kind: ekArrowFunction, args, body, rest };
}

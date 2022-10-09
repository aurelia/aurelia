import { emptyArray } from '@aurelia/kernel';
import type { IBinding, IConnectable } from '../observation';
import type { Scope } from '../observation/binding-context';
import type { IConnectableBinding } from './connectable';

import type { ISignaler } from '../observation/signaler';
import type { IVisitor } from './ast.visitor';

export {
  astVisit,
  IVisitor,
  Unparser
} from './ast.visitor';

export const enum ExpressionKind {
  AccessThis,
  AccessScope,
  ArrayLiteral,
  ObjectLiteral,
  PrimitiveLiteral,
  Template,
  Unary,
  CallScope,
  CallMember,
  CallFunction,
  AccessMember,
  AccessKeyed,
  TaggedTemplate,
  Binary,
  Conditional,
  Assign,
  ArrowFunction,
  ValueConverter,
  BindingBehavior,
  ArrayBindingPattern,
  ObjectBindingPattern,
  BindingIdentifier,
  ForOfStatement,
  Interpolation,
  ArrayDestructuring,
  ObjectDestructuring,
  DestructuringAssignmentLeaf,
  DestructuringAssignmentRestLeaf,
  Custom,
}

export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';

export type BinaryOperator = '??' | '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';

export type IsPrimary = AccessThisExpression | AccessScopeExpression | ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLiteral = ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
export type IsLeftHandSide = IsPrimary | CallFunctionExpression | CallMemberExpression | CallScopeExpression | AccessMemberExpression | AccessKeyedExpression | TaggedTemplateExpression;
export type IsUnary = IsLeftHandSide | UnaryExpression;
export type IsBinary = IsUnary | BinaryExpression;
export type IsConditional = IsBinary | ConditionalExpression;
export type IsAssign = IsConditional | AssignExpression | ArrowFunction;
export type IsValueConverter = CustomExpression | IsAssign | ValueConverterExpression;
export type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
export type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
export type IsExpression = IsBindingBehavior | Interpolation;
export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
export type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
export type AnyBindingExpression = Interpolation | ForOfStatement | IsBindingBehavior;

export class CustomExpression {
  public readonly $kind = ExpressionKind.Custom;
  public constructor(
    public readonly value: unknown,
  ) {}

  public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): unknown {
    return this.value;
  }

  public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
    return val;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public bind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
    // empty
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public unbind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
    // empty
  }

  public accept<T>(_visitor: IVisitor<T>): T {
    return (void 0)!;
  }
}

export type BindingBehaviorInstance<T extends {} = {}> = {
  type?: 'instance' | 'factory';
  bind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
  unbind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
} & T;

export class BindingBehaviorExpression {
  public readonly $kind = ExpressionKind.BindingBehavior;
  /**
   * The name of the property to store a binding behavior on the binding when binding
   */
  public readonly key: string;

  public constructor(
    public readonly expression: IsBindingBehavior,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
    this.key = `_bb_${name}`;
  }
}

export type ValueConverterInstance<T extends {} = {}> = {
  signals?: string[];
  toView(input: unknown, ...args: unknown[]): unknown;
  fromView?(input: unknown, ...args: unknown[]): unknown;
} & T;

export class ValueConverterExpression {
  public readonly $kind = ExpressionKind.ValueConverter;
  public constructor(
    public readonly expression: IsValueConverter,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
  ) {
  }
}

export class AssignExpression {
  public readonly $kind = ExpressionKind.Assign;

  public constructor(
    public readonly target: IsAssignable,
    public readonly value: IsAssign,
  ) {}
}

export class ConditionalExpression {
  public readonly $kind = ExpressionKind.Conditional;
  public constructor(
    public readonly condition: IsBinary,
    public readonly yes: IsAssign,
    public readonly no: IsAssign,
  ) {}
}

export class AccessThisExpression {
  public static readonly $this: AccessThisExpression = new AccessThisExpression(0);
  public static readonly $parent: AccessThisExpression = new AccessThisExpression(1);
  public readonly $kind: ExpressionKind.AccessThis = ExpressionKind.AccessThis;

  public constructor(
    public readonly ancestor: number = 0,
  ) {}
}

export class AccessScopeExpression {
  public readonly $kind = ExpressionKind.AccessScope;
  public constructor(
    public readonly name: string,
    public readonly ancestor: number = 0,
  ) {}
}

export class AccessMemberExpression {
  public readonly $kind: ExpressionKind.AccessMember = ExpressionKind.AccessMember;
  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
    public readonly optional: boolean = false,
  ) {}
}

export class AccessKeyedExpression {
  public readonly $kind = ExpressionKind.AccessKeyed;
  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly key: IsAssign,
    public readonly optional: boolean = false,
  ) {}
}

export class CallScopeExpression {
  public readonly $kind = ExpressionKind.CallScope;
  public constructor(
    public readonly name: string,
    public readonly args: readonly IsAssign[],
    public readonly ancestor: number = 0,
    public readonly optional: boolean = false,
  ) {}
}

export class CallMemberExpression {
  public readonly $kind = ExpressionKind.CallMember;
  public constructor(
    public readonly object: IsLeftHandSide,
    public readonly name: string,
    public readonly args: readonly IsAssign[],
    public readonly optionalMember: boolean = false,
    public readonly optionalCall: boolean = false,
  ) {}
}

export class CallFunctionExpression {
  public readonly $kind = ExpressionKind.CallFunction;
  public constructor(
    public readonly func: IsLeftHandSide,
    public readonly args: readonly IsAssign[],
    public readonly optional: boolean = false,
  ) {}
}

export class BinaryExpression {
  public readonly $kind: ExpressionKind.Binary = ExpressionKind.Binary;
  public constructor(
    public readonly operation: BinaryOperator,
    public readonly left: IsBinary,
    public readonly right: IsBinary,
  ) {}
}

export class UnaryExpression {
  public readonly $kind = ExpressionKind.Unary;
  public constructor(
    public readonly operation: UnaryOperator,
    public readonly expression: IsLeftHandSide,
  ) {}
}
export class PrimitiveLiteralExpression<TValue extends null | undefined | number | boolean | string = null | undefined | number | boolean | string> {
  public static readonly $undefined: PrimitiveLiteralExpression<undefined> = new PrimitiveLiteralExpression<undefined>(void 0);
  public static readonly $null: PrimitiveLiteralExpression<null> = new PrimitiveLiteralExpression<null>(null);
  public static readonly $true: PrimitiveLiteralExpression<true> = new PrimitiveLiteralExpression<true>(true);
  public static readonly $false: PrimitiveLiteralExpression<false> = new PrimitiveLiteralExpression<false>(false);
  public static readonly $empty: PrimitiveLiteralExpression<string> = new PrimitiveLiteralExpression<''>('');
  public readonly $kind = ExpressionKind.PrimitiveLiteral;

  public constructor(
    public readonly value: TValue,
  ) {}
}

export class ArrayLiteralExpression {
  public static readonly $empty: ArrayLiteralExpression = new ArrayLiteralExpression(emptyArray);
  public readonly $kind = ExpressionKind.ArrayLiteral;
  public constructor(
    public readonly elements: readonly IsAssign[],
  ) {}
}

export class ObjectLiteralExpression {
  public static readonly $empty: ObjectLiteralExpression = new ObjectLiteralExpression(emptyArray, emptyArray);
  public readonly $kind = ExpressionKind.ObjectLiteral;
  public constructor(
    public readonly keys: readonly (number | string)[],
    public readonly values: readonly IsAssign[],
  ) {}
}

export class TemplateExpression {
  public static readonly $empty: TemplateExpression = new TemplateExpression(['']);
  public readonly $kind = ExpressionKind.Template;
  public constructor(
    public readonly cooked: readonly string[],
    public readonly expressions: readonly IsAssign[] = emptyArray,
  ) {}
}

export class TaggedTemplateExpression {
  public readonly $kind = ExpressionKind.TaggedTemplate;
  public constructor(
    public readonly cooked: readonly string[] & { raw?: readonly string[] },
    raw: readonly string[],
    public readonly func: IsLeftHandSide,
    public readonly expressions: readonly IsAssign[] = emptyArray,
  ) {
    cooked.raw = raw;
  }
}

export class ArrayBindingPattern {
  public readonly $kind = ExpressionKind.ArrayBindingPattern;
  // We'll either have elements, or keys+values, but never all 3
  public constructor(
    public readonly elements: readonly IsAssign[],
  ) {}
}

export class ObjectBindingPattern {
  public readonly $kind = ExpressionKind.ObjectBindingPattern;
  // We'll either have elements, or keys+values, but never all 3
  public constructor(
    public readonly keys: readonly (string | number)[],
    public readonly values: readonly IsAssign[],
  ) {}
}

export class BindingIdentifier {
  public readonly $kind = ExpressionKind.BindingIdentifier;
  public constructor(
    public readonly name: string,
  ) {}
}

// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
export class ForOfStatement {
  public readonly $kind = ExpressionKind.ForOfStatement;
  public constructor(
    public readonly declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression,
    public readonly iterable: IsBindingBehavior,
    public readonly semiIdx: number,
  ) {}
}

/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
export class Interpolation {
  public readonly $kind = ExpressionKind.Interpolation;
  public readonly isMulti: boolean;
  public readonly firstExpression: IsBindingBehavior;
  public constructor(
    public readonly parts: readonly string[],
    public readonly expressions: readonly IsBindingBehavior[] = emptyArray,
  ) {
    this.isMulti = expressions.length > 1;
    this.firstExpression = expressions[0];
  }
}

// spec: https://tc39.es/ecma262/#sec-destructuring-assignment
/** This is an internal API */
export class DestructuringAssignmentExpression {
  public constructor(
    public readonly $kind: ExpressionKind.ArrayDestructuring | ExpressionKind.ObjectDestructuring,
    public readonly list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[],
    public readonly source: AccessMemberExpression | AccessKeyedExpression | undefined,
    public readonly initializer: IsBindingBehavior | undefined,
  ) { }
}

/** This is an internal API */
export class DestructuringAssignmentSingleExpression {
  public readonly $kind = ExpressionKind.DestructuringAssignmentLeaf;
  public constructor(
    public readonly target: AccessMemberExpression,
    public readonly source: AccessMemberExpression | AccessKeyedExpression,
    public readonly initializer: IsBindingBehavior | undefined,
  ) { }
}

/** This is an internal API */
export class DestructuringAssignmentRestExpression {
  public readonly $kind = ExpressionKind.DestructuringAssignmentLeaf;
  public constructor(
    public readonly target: AccessMemberExpression,
    public readonly indexOrProperties: string[] | number,
  ) { }
}

export class ArrowFunction {
  public readonly $kind = ExpressionKind.ArrowFunction;
  public constructor(
    public args: BindingIdentifier[],
    public body: IsAssign,
    public rest: boolean = false,
  ) {}
}

// -----------------------------------
// this interface causes issues to sourcemap mapping in devtool
// chuck it at the bottom to avoid such issue
/**
 * An interface describing the object that can evaluate Aurelia AST
 */
 export interface IAstEvaluator {
  /** describe whether the evaluator wants to evaluate in strict mode */
  strict?: boolean;
  /** describe whether the evaluator wants a bound function to be returned, in case the returned value is a function */
  boundFn?: boolean;
  /** describe whether the evaluator wants to evaluate the function call in strict mode */
  strictFnCall?: boolean;
  /** Allow an AST to retrieve a signaler instance for connecting/disconnecting */
  getSignaler?(): ISignaler;
  /** Allow an AST to retrieve a value converter that it needs */
  getConverter?<T>(name: string): ValueConverterInstance<T> | undefined;
  /** Allow an AST to retrieve a binding behavior that it needs */
  getBehavior?<T>(name: string): BindingBehaviorInstance<T> | undefined;
}

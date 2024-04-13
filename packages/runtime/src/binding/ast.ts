// import { emptyArray } from '@aurelia/kernel';
// import type { IBinding, IConnectable } from '../observation';
// import type { Scope } from '../observation/scope';
// import type { IConnectableBinding } from './connectable';

// import type { ISignaler } from '../observation/signaler';
// // import type { IVisitor } from './ast.visitor';

// // export {
// //   astVisit,
// //   IVisitor,
// //   Unparser
// // } from './ast.visitor';

// /** @internal */ export const ekAccessThis = 'AccessThis';
// /** @internal */ export const ekAccessBoundary = 'AccessBoundary';
// /** @internal */ export const ekAccessGlobal = 'AccessGlobal';
// /** @internal */ export const ekAccessScope = 'AccessScope';
// /** @internal */ export const ekArrayLiteral = 'ArrayLiteral';
// /** @internal */ export const ekObjectLiteral = 'ObjectLiteral';
// /** @internal */ export const ekPrimitiveLiteral = 'PrimitiveLiteral';
// /** @internal */ export const ekTemplate = 'Template';
// /** @internal */ export const ekUnary = 'Unary';
// /** @internal */ export const ekCallScope = 'CallScope';
// /** @internal */ export const ekCallMember = 'CallMember';
// /** @internal */ export const ekCallFunction = 'CallFunction';
// /** @internal */ export const ekCallGlobal = 'CallGlobal';
// /** @internal */ export const ekAccessMember = 'AccessMember';
// /** @internal */ export const ekAccessKeyed = 'AccessKeyed';
// /** @internal */ export const ekTaggedTemplate = 'TaggedTemplate';
// /** @internal */ export const ekBinary = 'Binary';
// /** @internal */ export const ekConditional = 'Conditional';
// /** @internal */ export const ekAssign = 'Assign';
// /** @internal */ export const ekArrowFunction = 'ArrowFunction';
// /** @internal */ export const ekValueConverter = 'ValueConverter';
// /** @internal */ export const ekBindingBehavior = 'BindingBehavior';
// /** @internal */ export const ekArrayBindingPattern = 'ArrayBindingPattern';
// /** @internal */ export const ekObjectBindingPattern = 'ObjectBindingPattern';
// /** @internal */ export const ekBindingIdentifier = 'BindingIdentifier';
// /** @internal */ export const ekForOfStatement = 'ForOfStatement';
// /** @internal */ export const ekInterpolation = 'Interpolation';
// /** @internal */ export const ekArrayDestructuring = 'ArrayDestructuring';
// /** @internal */ export const ekObjectDestructuring = 'ObjectDestructuring';
// /** @internal */ export const ekDestructuringAssignmentLeaf = 'DestructuringAssignmentLeaf';
// /** @internal */ export const ekCustom = 'Custom';

// export type ExpressionKind =
//   | 'AccessThis'
//   | 'AccessGlobal'
//   | 'AccessBoundary'
//   | 'AccessScope'
//   | 'ArrayLiteral'
//   | 'ObjectLiteral'
//   | 'PrimitiveLiteral'
//   | 'Template'
//   | 'Unary'
//   | 'CallScope'
//   | 'CallMember'
//   | 'CallFunction'
//   | 'CallGlobal'
//   | 'AccessMember'
//   | 'AccessKeyed'
//   | 'TaggedTemplate'
//   | 'Binary'
//   | 'Conditional'
//   | 'Assign'
//   | 'ArrowFunction'
//   | 'ValueConverter'
//   | 'BindingBehavior'
//   | 'ArrayBindingPattern'
//   | 'ObjectBindingPattern'
//   | 'BindingIdentifier'
//   | 'ForOfStatement'
//   | 'Interpolation'
//   | 'ArrayDestructuring'
//   | 'ObjectDestructuring'
//   | 'DestructuringAssignmentLeaf'
//   | 'Custom';

// export type UnaryOperator = 'void' | 'typeof' | '!' | '-' | '+';

// export type BinaryOperator = '??' | '&&' | '||' | '==' | '===' | '!=' | '!==' | 'instanceof' | 'in' | '+' | '-' | '*' | '/' | '%' | '<' | '>' | '<=' | '>=';

// export type IsPrimary = AccessThisExpression | AccessBoundaryExpression | AccessScopeExpression | AccessGlobalExpression | ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
// export type IsLiteral = ArrayLiteralExpression | ObjectLiteralExpression | PrimitiveLiteralExpression | TemplateExpression;
// export type IsLeftHandSide = IsPrimary | CallGlobalExpression | CallFunctionExpression | CallMemberExpression | CallScopeExpression | AccessMemberExpression | AccessKeyedExpression | TaggedTemplateExpression;
// export type IsUnary = IsLeftHandSide | UnaryExpression;
// export type IsBinary = IsUnary | BinaryExpression;
// export type IsConditional = IsBinary | ConditionalExpression;
// export type IsAssign = IsConditional | AssignExpression | ArrowFunction;
// export type IsValueConverter = CustomExpression | IsAssign | ValueConverterExpression;
// export type IsBindingBehavior = IsValueConverter | BindingBehaviorExpression;
// export type IsAssignable = AccessScopeExpression | AccessKeyedExpression | AccessMemberExpression | AssignExpression;
// export type IsExpression = IsBindingBehavior | Interpolation;
// export type BindingIdentifierOrPattern = BindingIdentifier | ArrayBindingPattern | ObjectBindingPattern;
// export type IsExpressionOrStatement = IsExpression | ForOfStatement | BindingIdentifierOrPattern | DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression;
// export type AnyBindingExpression = Interpolation | ForOfStatement | IsBindingBehavior;

// export class CustomExpression {
//   public readonly $kind = ekCustom;
//   public constructor(
//     public readonly value: unknown,
//   ) {}

//   public evaluate(_s: Scope, _e: IAstEvaluator | null, _c: IConnectable | null): unknown {
//     return this.value;
//   }

//   public assign(s: Scope, e: IAstEvaluator | null, val: unknown): unknown {
//     return val;
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   public bind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
//     // empty
//   }

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   public unbind(s: Scope, b: IAstEvaluator & IConnectableBinding): void {
//     // empty
//   }

//   public accept<T>(_visitor: IVisitor<T>): T {
//     return (void 0)!;
//   }
// }

// export type BindingBehaviorInstance<T extends {} = {}> = {
//   type?: 'instance' | 'factory';
//   bind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
//   unbind?(scope: Scope, binding: IBinding, ...args: unknown[]): void;
// } & T;

// export class BindingBehaviorExpression {
//   public readonly $kind = ekBindingBehavior;
//   /**
//    * The name of the property to store a binding behavior on the binding when binding
//    */
//   public readonly key: string;

//   public constructor(
//     public readonly expression: IsBindingBehavior,
//     public readonly name: string,
//     public readonly args: readonly IsAssign[],
//   ) {
//     this.key = `_bb_${name}`;
//   }
// }

// export type ValueConverterInstance<T extends {} = {}> = {
//   signals?: string[];
//   toView(input: unknown, ...args: unknown[]): unknown;
//   fromView?(input: unknown, ...args: unknown[]): unknown;
// } & T;

// export class ValueConverterExpression {
//   public readonly $kind = ekValueConverter;
//   public constructor(
//     public readonly expression: IsValueConverter,
//     public readonly name: string,
//     public readonly args: readonly IsAssign[],
//   ) {
//   }
// }

// export class AssignExpression {
//   public readonly $kind = ekAssign;

//   public constructor(
//     public readonly target: IsAssignable,
//     public readonly value: IsAssign,
//   ) {}
// }

// export class ConditionalExpression {
//   public readonly $kind = ekConditional;
//   public constructor(
//     public readonly condition: IsBinary,
//     public readonly yes: IsAssign,
//     public readonly no: IsAssign,
//   ) {}
// }

// export class AccessGlobalExpression {
//   public readonly $kind: 'AccessGlobal' = ekAccessGlobal;

//   public constructor(
//     public readonly name: string,
//   ) {}
// }

// export class AccessThisExpression {
//   public readonly $kind: 'AccessThis' = ekAccessThis;

//   public constructor(
//     public readonly ancestor: number = 0,
//   ) {}
// }

// export class AccessBoundaryExpression {
//   public readonly $kind: 'AccessBoundary' = ekAccessBoundary;
// }

// export class AccessScopeExpression {
//   public readonly $kind = ekAccessScope;
//   public constructor(
//     public readonly name: string,
//     public readonly ancestor: number = 0,
//   ) {}
// }

// const isAccessGlobal = (ast: IsLeftHandSide) => (
//   ast.$kind === ekAccessGlobal ||
//   (
//     ast.$kind === ekAccessMember ||
//     ast.$kind === ekAccessKeyed
//   ) && ast.accessGlobal
// );

// export class AccessMemberExpression {
//   public readonly $kind: 'AccessMember' = ekAccessMember;
//   public readonly accessGlobal: boolean;
//   public constructor(
//     public readonly object: IsLeftHandSide,
//     public readonly name: string,
//     public readonly optional: boolean = false,
//   ) {
//     this.accessGlobal = isAccessGlobal(object);
//   }
// }

// export class AccessKeyedExpression {
//   public readonly $kind = ekAccessKeyed;
//   public readonly accessGlobal: boolean;
//   public constructor(
//     public readonly object: IsLeftHandSide,
//     public readonly key: IsAssign,
//     public readonly optional: boolean = false,
//   ) {
//     this.accessGlobal = isAccessGlobal(object);
//   }
// }

// export class CallScopeExpression {
//   public readonly $kind = ekCallScope;
//   public constructor(
//     public readonly name: string,
//     public readonly args: readonly IsAssign[],
//     public readonly ancestor: number = 0,
//     public readonly optional: boolean = false,
//   ) {}
// }

// export class CallMemberExpression {
//   public readonly $kind = ekCallMember;
//   public constructor(
//     public readonly object: IsLeftHandSide,
//     public readonly name: string,
//     public readonly args: readonly IsAssign[],
//     public readonly optionalMember: boolean = false,
//     public readonly optionalCall: boolean = false,
//   ) {}
// }

// export class CallFunctionExpression {
//   public readonly $kind = ekCallFunction;
//   public constructor(
//     public readonly func: IsLeftHandSide,
//     public readonly args: readonly IsAssign[],
//     public readonly optional: boolean = false,
//   ) {}
// }

// export class CallGlobalExpression {
//   public readonly $kind = ekCallGlobal;
//   public constructor(
//     public readonly name: string,
//     public readonly args: readonly IsAssign[]
//   ) {}
// }

// export class BinaryExpression {
//   public readonly $kind: 'Binary' = ekBinary;
//   public constructor(
//     public readonly operation: BinaryOperator,
//     public readonly left: IsBinary,
//     public readonly right: IsBinary,
//   ) {}
// }

// export class UnaryExpression {
//   public readonly $kind = ekUnary;
//   public constructor(
//     public readonly operation: UnaryOperator,
//     public readonly expression: IsLeftHandSide,
//   ) {}
// }
// export class PrimitiveLiteralExpression<TValue extends null | undefined | number | boolean | string = null | undefined | number | boolean | string> {
//   public static readonly $undefined: PrimitiveLiteralExpression<undefined> = new PrimitiveLiteralExpression<undefined>(void 0);
//   public static readonly $null: PrimitiveLiteralExpression<null> = new PrimitiveLiteralExpression<null>(null);
//   public static readonly $true: PrimitiveLiteralExpression<true> = new PrimitiveLiteralExpression<true>(true);
//   public static readonly $false: PrimitiveLiteralExpression<false> = new PrimitiveLiteralExpression<false>(false);
//   public static readonly $empty: PrimitiveLiteralExpression<string> = new PrimitiveLiteralExpression<''>('');
//   public readonly $kind = ekPrimitiveLiteral;

//   public constructor(
//     public readonly value: TValue,
//   ) {}
// }

// export class ArrayLiteralExpression {
//   public static readonly $empty: ArrayLiteralExpression = new ArrayLiteralExpression(emptyArray);
//   public readonly $kind = ekArrayLiteral;
//   public constructor(
//     public readonly elements: readonly IsAssign[],
//   ) {}
// }

// export class ObjectLiteralExpression {
//   public static readonly $empty: ObjectLiteralExpression = new ObjectLiteralExpression(emptyArray, emptyArray);
//   public readonly $kind = ekObjectLiteral;
//   public constructor(
//     public readonly keys: readonly (number | string)[],
//     public readonly values: readonly IsAssign[],
//   ) {}
// }

// export class TemplateExpression {
//   public static readonly $empty: TemplateExpression = new TemplateExpression(['']);
//   public readonly $kind = ekTemplate;
//   public constructor(
//     public readonly cooked: readonly string[],
//     public readonly expressions: readonly IsAssign[] = emptyArray,
//   ) {}
// }

// export class TaggedTemplateExpression {
//   public readonly $kind = ekTaggedTemplate;
//   public constructor(
//     public readonly cooked: readonly string[] & { raw?: readonly string[] },
//     raw: readonly string[],
//     public readonly func: IsLeftHandSide,
//     public readonly expressions: readonly IsAssign[] = emptyArray,
//   ) {
//     cooked.raw = raw;
//   }
// }

// export class ArrayBindingPattern {
//   public readonly $kind = ekArrayBindingPattern;
//   // We'll either have elements, or keys+values, but never all 3
//   public constructor(
//     public readonly elements: readonly IsAssign[],
//   ) {}
// }

// export class ObjectBindingPattern {
//   public readonly $kind = ekObjectBindingPattern;
//   // We'll either have elements, or keys+values, but never all 3
//   public constructor(
//     public readonly keys: readonly (string | number)[],
//     public readonly values: readonly IsAssign[],
//   ) {}
// }

// export class BindingIdentifier {
//   public readonly $kind = ekBindingIdentifier;
//   public constructor(
//     public readonly name: string,
//   ) {}
// }

// // https://tc39.github.io/ecma262/#sec-iteration-statements
// // https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
// export class ForOfStatement {
//   public readonly $kind = ekForOfStatement;
//   public constructor(
//     public readonly declaration: BindingIdentifierOrPattern | DestructuringAssignmentExpression,
//     public readonly iterable: IsBindingBehavior,
//     public readonly semiIdx: number,
//   ) {}
// }

// /*
// * Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
// * so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
// * but this class might be a candidate for removal if it turns out it does provide all we need
// */
// export class Interpolation {
//   public readonly $kind = ekInterpolation;
//   public readonly isMulti: boolean;
//   public readonly firstExpression: IsBindingBehavior;
//   public constructor(
//     public readonly parts: readonly string[],
//     public readonly expressions: readonly IsBindingBehavior[] = emptyArray,
//   ) {
//     this.isMulti = expressions.length > 1;
//     this.firstExpression = expressions[0];
//   }
// }

// // spec: https://tc39.es/ecma262/#sec-destructuring-assignment
// /** This is an internal API */
// export class DestructuringAssignmentExpression {
//   public constructor(
//     public readonly $kind: 'ArrayDestructuring' | 'ObjectDestructuring',
//     public readonly list: readonly (DestructuringAssignmentExpression | DestructuringAssignmentSingleExpression | DestructuringAssignmentRestExpression)[],
//     public readonly source: AccessMemberExpression | AccessKeyedExpression | undefined,
//     public readonly initializer: IsBindingBehavior | undefined,
//   ) { }
// }

// /** This is an internal API */
// export class DestructuringAssignmentSingleExpression {
//   public readonly $kind = ekDestructuringAssignmentLeaf;
//   public constructor(
//     public readonly target: AccessMemberExpression,
//     public readonly source: AccessMemberExpression | AccessKeyedExpression,
//     public readonly initializer: IsBindingBehavior | undefined,
//   ) { }
// }

// /** This is an internal API */
// export class DestructuringAssignmentRestExpression {
//   public readonly $kind = ekDestructuringAssignmentLeaf;
//   public constructor(
//     public readonly target: AccessMemberExpression,
//     public readonly indexOrProperties: string[] | number,
//   ) { }
// }

// export class ArrowFunction {
//   public readonly $kind = ekArrowFunction;
//   public constructor(
//     public args: BindingIdentifier[],
//     public body: IsAssign,
//     public rest: boolean = false,
//   ) {}
// }

// // -----------------------------------
// // this interface causes issues to sourcemap mapping in devtool
// // chuck it at the bottom to avoid such issue
// /**
//  * An interface describing the object that can evaluate Aurelia AST
//  */
//  export interface IAstEvaluator {
//   /** describe whether the evaluator wants to evaluate in strict mode */
//   strict?: boolean;
//   /** describe whether the evaluator wants a bound function to be returned, in case the returned value is a function */
//   boundFn?: boolean;
//   /** describe whether the evaluator wants to evaluate the function call in strict mode */
//   strictFnCall?: boolean;
//   /** Allow an AST to retrieve a signaler instance for connecting/disconnecting */
//   getSignaler?(): ISignaler;
//   /** Allow an AST to retrieve a value converter that it needs */
//   getConverter?<T extends {}>(name: string): ValueConverterInstance<T> | undefined;
//   /** Allow an AST to retrieve a binding behavior that it needs */
//   getBehavior?<T extends {}>(name: string): BindingBehaviorInstance<T> | undefined;
// }

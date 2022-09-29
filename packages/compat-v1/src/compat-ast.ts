/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Constructable } from '@aurelia/kernel';
import { AccessKeyedExpression, AccessMemberExpression, AccessScopeExpression, AccessThisExpression, ArrayBindingPattern, ArrayLiteralExpression, ArrowFunction, AssignExpression, astAssign, astBind, astEvaluate, astUnbind, astVisit, BinaryExpression, BindingBehaviorExpression, BindingIdentifier, CallFunctionExpression, CallMemberExpression, CallScopeExpression, ConditionalExpression, DestructuringAssignmentExpression, DestructuringAssignmentRestExpression, DestructuringAssignmentSingleExpression, ForOfStatement, Interpolation, ObjectBindingPattern, ObjectLiteralExpression, PrimitiveLiteralExpression, TaggedTemplateExpression, TemplateExpression, UnaryExpression, ValueConverterExpression } from '@aurelia/runtime';

let defined = false;
export function defineAstMethods() {
  if (defined) {
    return;
  }
  defined = true;
  const def = (Klass: Constructable, name: string, value: unknown) => Object.defineProperty(
    Klass.prototype,
    name,
    { configurable: true, enumerable: false, writable: true, value }
  );

  [
    BindingBehaviorExpression,
    ValueConverterExpression,
    AssignExpression,
    ConditionalExpression,
    AccessThisExpression,
    AccessScopeExpression,
    AccessMemberExpression,
    AccessKeyedExpression,
    CallScopeExpression,
    CallMemberExpression,
    CallFunctionExpression,
    BinaryExpression,
    UnaryExpression,
    PrimitiveLiteralExpression,
    ArrayLiteralExpression,
    ObjectLiteralExpression,
    TemplateExpression,
    TaggedTemplateExpression,
    ArrayBindingPattern,
    ObjectBindingPattern,
    BindingIdentifier,
    ForOfStatement,
    Interpolation,
    DestructuringAssignmentExpression,
    DestructuringAssignmentSingleExpression,
    DestructuringAssignmentRestExpression,
    ArrowFunction,
  ].forEach(ast => {
    def(ast, 'evaluate', function (this: typeof ast, ...args: unknown[]) {
      return (astEvaluate as any)(this, ...args);
    });
    def(ast, 'assign', function (this: typeof ast, ...args: unknown[]) {
      return (astAssign as any)(this, ...args);
    });
    def(ast, 'accept', function (this: typeof ast, ...args: unknown[]) {
      return (astVisit as any)(this, ...args);
    });
    def(ast, 'bind', function (this: typeof ast, ...args: unknown[]) {
      return (astBind as any)(this, ...args);
    });
    def(ast, 'unbind', function (this: typeof ast, ...args: unknown[]) {
      return (astUnbind as any)(this, ...args);
    });
    console.warn('"evaluate"/"assign"/"accept"/"visit"/"bind"/"unbind" are only valid on AST with $kind Custom.'
      + ' Or import and use astEvaluate/astAssign/astVisit/astBind/astUnbind accordingly.'
    );
  });
}

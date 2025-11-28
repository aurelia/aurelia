/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Constructable } from '@aurelia/kernel';
import { astVisit, CustomExpression } from '@aurelia/expression-parser';
import {
  astAssign,
  astBind,
  astEvaluate,
  astUnbind,
} from '@aurelia/runtime';

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

  const originalEvaluate = CustomExpression.prototype.evaluate as any;
  const originalAssign = CustomExpression.prototype.assign as any;
  const originalAccept = CustomExpression.prototype.accept as any;
  const originalBind = CustomExpression.prototype.bind as any;
  const originalUnbind = CustomExpression.prototype.unbind as any;

  [
    CustomExpression,
  ].forEach(ast => {
    def(ast, 'evaluate', function (this: typeof ast, ...args: unknown[]) {
      // Avoid infinite recursion for CustomExpression where astEvaluate delegates
      // back to ast.evaluate by reusing the original implementation when the $kind
      // is already Custom.
      return (this as any).$kind === 'Custom'
        ? originalEvaluate.apply(this, args)
        : (astEvaluate as any)(this, ...args);
    });
    def(ast, 'assign', function (this: typeof ast, ...args: unknown[]) {
      return (this as any).$kind === 'Custom'
        ? originalAssign.apply(this, args)
        : (astAssign as any)(this, ...args);
    });
    def(ast, 'accept', function (this: typeof ast, ...args: unknown[]) {
      return (this as any).$kind === 'Custom'
        ? originalAccept.apply(this, args)
        : (astVisit as any)(this, ...args);
    });
    def(ast, 'bind', function (this: typeof ast, ...args: unknown[]) {
      return (this as any).$kind === 'Custom'
        ? originalBind.apply(this, args)
        : (astBind as any)(this, ...args);
    });
    def(ast, 'unbind', function (this: typeof ast, ...args: unknown[]) {
      return (this as any).$kind === 'Custom'
        ? originalUnbind.apply(this, args)
        : (astUnbind as any)(this, ...args);
    });
  });
  console.warn('"evaluate"/"assign"/"accept"/"visit"/"bind"/"unbind" are only valid on AST with ast $kind "Custom".'
    + ' Import and use astEvaluate/astAssign/astVisit/astBind/astUnbind accordingly.'
  );
}

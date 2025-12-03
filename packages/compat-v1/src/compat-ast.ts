/* eslint-disable no-console */

let defined = false;
/**
 * Previously, this function added v1-style methods (evaluate, assign, bind, unbind, accept)
 * to AST class prototypes for backwards compatibility.
 *
 * Since the AST refactor that changed AST nodes from classes to interfaces,
 * this is no longer possible. The only AST that remains a class is CustomExpression,
 * which already has these methods defined natively.
 *
 * This function now only prints a deprecation warning.
 */
export function defineAstMethods() {
  if (defined) {
    return;
  }
  defined = true;
  console.warn('AST prototype methods (.evaluate, .assign, .accept, .bind, .unbind) are no longer supported. '
    + 'Import and use astEvaluate/astAssign/astVisit/astBind/astUnbind instead. '
    + 'CustomExpression already has these methods defined natively.'
  );
}

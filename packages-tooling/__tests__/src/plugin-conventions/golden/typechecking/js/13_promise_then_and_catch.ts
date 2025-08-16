/* AUTO-GENERATED: 13_promise_then_and_catch
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_r1: Awaited<__Template_Type_Common__['data']> } & { __Template_TypeCheck_Synthetic_e1: any }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><div promise.bind="${access(o => o.data, 'data')}"><template then="${access(o => o.__Template_TypeCheck_Synthetic_r1, 'r')}">${access(o => o.__Template_TypeCheck_Synthetic_r1.users[(0)].email, 'r.users[(0)].email')}</template><template catch="${access(o => o.__Template_TypeCheck_Synthetic_e1, 'e')}">${access(o => o.__Template_TypeCheck_Synthetic_e1.message, 'e.message')}</template></div></template>`;
}


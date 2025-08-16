/* AUTO-GENERATED: 02_let_and_indexing
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, '__Template_TypeCheck_Synthetic_deep1'> & { __Template_TypeCheck_Synthetic_deep1: __Template_Type_Common__['obj']['deep'] }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><let deep.bind="${access(o => o.obj[('key')].deep, 'obj[\'key\'].deep')}"></let>${access(o => o.__Template_TypeCheck_Synthetic_deep1.v, 'deep.v')}</template>`;
}


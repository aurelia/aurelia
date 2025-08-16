/* AUTO-GENERATED: 14_this_vs_with_overlay
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_deep1: (Omit<Common, 'secret'> & { secret(): () => number })['obj']['deep'] }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><div with.bind="${access(o => o.obj[('key')], 'obj[\'key\']')}">${access(o => o.__Template_TypeCheck_Synthetic_deep1.v, 'deep.v')} ${access(o => o.firstName, 'this.firstName')}</div></template>`;
}


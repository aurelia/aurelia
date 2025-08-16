/* AUTO-GENERATED: 12_repeat_object_key_access
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_k1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['obj']> }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><div repeat.for="${access(o => o.__Template_TypeCheck_Synthetic_k1, 'k')} of ${access(o => o.obj, 'obj')}">${access(o => o.obj[o.__Template_TypeCheck_Synthetic_k1].deep.v, 'obj[k].deep.v')}</div></template>`;
}


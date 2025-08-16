/* AUTO-GENERATED: 10_union_nonpublic_reexposed
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common_Other__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } | Other & { $parent: any }} __Template_Type_Common_Other__
   */
  /**
   * @template {__Template_Type_Common_Other__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template>${access(o => o.status, 'status')} ${access(o => o.items.size, 'items.size')} ${access(o => o.firstName, 'firstName')}</template>`;
}


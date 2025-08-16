/* AUTO-GENERATED: 01_plain_interpolation_and_this
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template>${access(o => o.firstName, 'firstName')} ${access(o => o.lastName, 'this.lastName')}</template>`;
}


/* AUTO-GENERATED: 11_let_to_binding_context_shadow
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, 'firstname'> & { firstname: ('Overridden') }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><let to-binding-context firstName.bind="'Overridden'"></let>${access(o => o.firstName, 'firstName')}</template>`;
}


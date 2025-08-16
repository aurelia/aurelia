/* AUTO-GENERATED: 04_repeat_array
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_it1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['items']> } & { $index: number, $first: boolean, $last: boolean, $even: boolean, $odd: boolean, $length: number }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><li repeat.for="${access(o => o.__Template_TypeCheck_Synthetic_it1, 'it')} of ${access(o => o.items, 'items')}">${access(o => o.$index, '$index')} - ${access(o => o.__Template_TypeCheck_Synthetic_it1.name, 'it.name')}</li></template>`;
}


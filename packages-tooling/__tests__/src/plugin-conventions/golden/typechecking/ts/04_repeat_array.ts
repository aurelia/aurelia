/* AUTO-GENERATED: 04_repeat_array
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_it1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['items']> } & { $index: number, $first: boolean, $last: boolean, $even: boolean, $odd: boolean, $length: number };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><li repeat.for="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_it1, 'it')} of ${access<__Template_Type_Common__>(o => o.items, 'items')}">${access<__Template_Type_Common__>(o => o.$index, '$index')} - ${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_it1.name, 'it.name')}</li></template>`;
}


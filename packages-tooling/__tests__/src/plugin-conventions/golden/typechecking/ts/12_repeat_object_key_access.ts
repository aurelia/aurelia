/* AUTO-GENERATED: 12_repeat_object_key_access
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_k1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['obj']> };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><div repeat.for="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_k1, 'k')} of ${access<__Template_Type_Common__>(o => o.obj, 'obj')}">${access<__Template_Type_Common__>(o => o.obj[o.__Template_TypeCheck_Synthetic_k1].deep.v, 'obj[k].deep.v')}</div></template>`;
}


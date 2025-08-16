/* AUTO-GENERATED: 06_repeat_map_destructure
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_k1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['map']>[0], __Template_TypeCheck_Synthetic_v1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['map']>[1] };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><div repeat.for="${access<__Template_Type_Common__>(o => (o.__Template_TypeCheck_Synthetic_k1,o.__Template_TypeCheck_Synthetic_v1), '[k,v]')} of ${access<__Template_Type_Common__>(o => o.map, 'map')}">[${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_k1, 'k')}] (${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_v1.x, 'v.x')}, ${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_v1.y, 'v.y')})</div></template>`;
}


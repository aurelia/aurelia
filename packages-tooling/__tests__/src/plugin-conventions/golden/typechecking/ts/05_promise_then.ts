/* AUTO-GENERATED: 05_promise_then
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_r1: Awaited<__Template_Type_Common__['data']> };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><div promise.bind="${access<__Template_Type_Common__>(o => o.data, 'data')}"><template then="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1, 'r')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1.users[(0)].email, 'r.users[(0)].email')}</template></div></template>`;
}


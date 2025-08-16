/* AUTO-GENERATED: 13_promise_then_and_catch
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_r1: Awaited<__Template_Type_Common__['data']> } & { __Template_TypeCheck_Synthetic_e1: any };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><div promise.bind="${access<__Template_Type_Common__>(o => o.data, 'data')}"><template then="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1, 'r')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1.users[(0)].email, 'r.users[(0)].email')}</template><template catch="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_e1, 'e')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_e1.message, 'e.message')}</template></div></template>`;
}


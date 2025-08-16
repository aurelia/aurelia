/* AUTO-GENERATED: 03_with_and_call
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_deep1: (Omit<Common, 'secret'> & { secret(): () => number })['obj']['deep'] };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><div with.bind="${access<__Template_Type_Common__>(o => o.obj[('key')], 'obj[\'key\']')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_deep1.v, 'deep.v')}<button click.trigger="${access<__Template_Type_Common__>(o => o.doThing((1),('ok')), 'doThing(1, 'ok')')}"></button></div></template>`;
}


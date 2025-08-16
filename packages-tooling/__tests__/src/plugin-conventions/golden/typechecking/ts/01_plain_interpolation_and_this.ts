/* AUTO-GENERATED: 01_plain_interpolation_and_this
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')} ${access<__Template_Type_Common__>(o => o.lastName, 'this.lastName')}</template>`;
}


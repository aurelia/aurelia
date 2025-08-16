/* AUTO-GENERATED: 10_union_nonpublic_reexposed
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common_Other__ = Omit<Common, 'secret'> & { secret(): () => number } | Other & { $parent: any };
function __typecheck_template_Common_Other__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>${access<__Template_Type_Common_Other__>(o => o.status, 'status')} ${access<__Template_Type_Common_Other__>(o => o.items.size, 'items.size')} ${access<__Template_Type_Common_Other__>(o => o.firstName, 'firstName')}</template>`;
}


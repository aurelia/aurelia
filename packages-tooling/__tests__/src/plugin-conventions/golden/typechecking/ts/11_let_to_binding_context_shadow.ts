/* AUTO-GENERATED: 11_let_to_binding_context_shadow
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, 'firstname'> & { firstname: ('Overridden') };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><let to-binding-context firstName.bind="'Overridden'"></let>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')}</template>`;
}


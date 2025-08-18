/* AUTO-GENERATED: 20_let_shadow_vs_binding_context
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <let firstName.bind="'X'"></let>
//       <div>${firstName} ${this.firstName}</div>
//       <let to-binding-context firstName.bind="'Y'"></let>
//       <div>${firstName} ${this.firstName}</div>
//     </template>
//
// CLASSES:
export {}
class Common {
 public firstName: string
 public lastName: string
 public items: Array<{ id: number; name: string }>
 public map: Map<string, { x: number; y: number }>
 public obj: Record<string, { deep: { v: boolean } }>
 public data: Promise<{ users: Array<{ id: number; email: string }> }>
 public doThing: (x: number, y: string) => void
 private secret: () => number
}

// === EMIT ===

type __Template_Type_Common__ = Omit<Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, '__Template_TypeCheck_Synthetic_firstname1'> & { __Template_TypeCheck_Synthetic_firstname1: ('X') }, 'firstname'> & { firstname: ('Y') };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>
      <let firstName.bind="'X'"></let>
      <div>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')} ${access<__Template_Type_Common__>(o => o.firstName, 'this.firstName')}</div>
      <let to-binding-context firstName.bind="'Y'"></let>
      <div>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')} ${access<__Template_Type_Common__>(o => o.firstName, 'this.firstName')}</div>
    </template>`;
}


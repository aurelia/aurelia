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


function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, '__Template_TypeCheck_Synthetic_firstname1'> & { __Template_TypeCheck_Synthetic_firstname1: ('X') }, 'firstname'> & { firstname: ('Y') }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template>
      <let firstName.bind="'X'"></let>
      <div>${access(o => o.firstName, 'firstName')} ${access(o => o.firstName, 'this.firstName')}</div>
      <let to-binding-context firstName.bind="'Y'"></let>
      <div>${access(o => o.firstName, 'firstName')} ${access(o => o.firstName, 'this.firstName')}</div>
    </template>`;
}


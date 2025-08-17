/* AUTO-GENERATED: 07_keyed_access_with_local_key
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><let key.bind="'key'"></let>${obj[key].deep.v}</template>
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
   * @typedef {Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, '__Template_TypeCheck_Synthetic_key1'> & { __Template_TypeCheck_Synthetic_key1: ('key') }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><let key.bind="'key'"></let>${access(o => o.obj[o.__Template_TypeCheck_Synthetic_key1].deep.v, 'obj[key].deep.v')}</template>`;
}


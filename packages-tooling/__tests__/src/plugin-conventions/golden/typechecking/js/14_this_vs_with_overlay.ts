/* AUTO-GENERATED: 14_this_vs_with_overlay
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><div with.bind="obj['key']">${deep.v} ${this.firstName}</div></template>
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
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_deep1: (Omit<Common, 'secret'> & { secret(): () => number })['obj']['deep'] }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><div with.bind="${access(o => o.obj[('key')], 'obj[\'key\']')}">${access(o => o.__Template_TypeCheck_Synthetic_deep1.v, 'deep.v')} ${access(o => o.firstName, 'this.firstName')}</div></template>`;
}


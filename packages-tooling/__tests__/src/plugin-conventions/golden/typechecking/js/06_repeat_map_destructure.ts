/* AUTO-GENERATED: 06_repeat_map_destructure
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><div repeat.for="[k, v] of map">[${k}] (${v.x}, ${v.y})</div></template>
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
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_k1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['map']>[0], __Template_TypeCheck_Synthetic_v1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['map']>[1] }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template><div repeat.for="${access(o => (o.__Template_TypeCheck_Synthetic_k1,o.__Template_TypeCheck_Synthetic_v1), '[k,v]')} of ${access(o => o.map, 'map')}">[${access(o => o.__Template_TypeCheck_Synthetic_k1, 'k')}] (${access(o => o.__Template_TypeCheck_Synthetic_v1.x, 'v.x')}, ${access(o => o.__Template_TypeCheck_Synthetic_v1.y, 'v.y')})</div></template>`;
}


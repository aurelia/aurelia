/* AUTO-GENERATED: 10_union_nonpublic_reexposed
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>${status} ${items.size} ${firstName}</template>
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

class Other {
 public status: "idle" | "busy"
 public items: Set<{ id: number; tags: string[] }>()
}

// === EMIT ===


function __typecheck_template_Common_Other__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } | Other & { $parent: any }} __Template_Type_Common_Other__
   */
  /**
   * @template {__Template_Type_Common_Other__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template>${access(o => o.status, 'status')} ${access(o => o.items.size, 'items.size')} ${access(o => o.firstName, 'firstName')}</template>`;
}


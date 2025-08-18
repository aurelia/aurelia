/* AUTO-GENERATED: 19_portal_uses_parent_scope
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <template portal>
//         ${firstName} ${this.lastName} ${$parent && $parent.firstName}
//       </template>
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
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template>
      <template portal>
        ${access(o => o.firstName, 'firstName')} ${access(o => o.lastName, 'this.lastName')} ${access(o => o.($parent&&$parent.firstName), '($parent&&$parent.firstName)')}
      </template>
    </template>`;
}


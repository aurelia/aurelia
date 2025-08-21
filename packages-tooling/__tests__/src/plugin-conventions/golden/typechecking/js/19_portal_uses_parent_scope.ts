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
 public deep: { v: boolean }
 public data: Promise<{ users: Array<{ id: number; email: string }> }>
 public kind: "a" | "b" | "c"
 public elementId: string
 public greeting: string
 public composeVm: unknown
 public doThing: (x: number, y: string) => void
 private secret: () => number
}

// === EMIT ===
// @ts-check
/**
 * @template TCollection
 * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
 */
/**
 * @template T
 * @param {(o: T) => unknown} _fn
 * @returns {void}
 */
function __au$access(_fn) { /* no-op */ }function __typecheck_template_Common__() {
  /**
   * @template T
   * @param {(o: T) => unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  const access = (typecheck, expr) => expr;
  return `<template>
      <template portal>
        ${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.portal, "firstName")} ${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.lastName, "this.lastName")} ${access((/** @type {__AU_TTC_T0_F0} */(o)) => (o.$parent) && (o.$parent.firstName), "($parent&&$parent.firstName)")}
      </template>
    </template>`;
}

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
  return `<template><div repeat.for="${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.v.y, "[$this[(0)]:$this.k$this[(1)]:$this.v]")} of ${access((_o) => void 0, "map")}">[${access((/** @type {__AU_TTC_T0_F0} */(o)) => o, "k")}] (${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.k, "v.x")}, ${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.v.x, "v.y")})</div></template>`;
}

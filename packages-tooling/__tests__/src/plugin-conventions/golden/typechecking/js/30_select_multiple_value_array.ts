/* AUTO-GENERATED: 30_select_multiple_value_array
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <select multiple value.bind="selected">
//         <option repeat.for="it of items" value.bind="it.name">${it.name}</option>
//       </select>
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

class Form {
 public flag: boolean
 public selected: string[]
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
function __au$access(_fn) { /* no-op */ }function __typecheck_template_Common_Form__() {
  /**
   * @template T
   * @param {(o: T) => unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  const access = (typecheck, expr) => expr;
  return `<template>
      <select multiple value.bind="${access((/** @type {__AU_TTC_T0_F0} */(o)) => o, "selected")}">
        <option repeat.for="${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.it.name, "it")} of ${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.it.name, "items")}" value.bind="${access((_o) => void 0, "it.name")}">${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.selected, "it.name")}</option>
      </select>
    </template>`;
}

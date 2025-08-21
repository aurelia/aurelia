/* AUTO-GENERATED: 17_repeat_number_contextuals
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div repeat.for="i of 3">
//         i=${i}
//         idx=${$index}
//         len=${$length}
//         first=${$first}
//         last=${$last}
//         even=${$even}
//         odd=${$odd}
//         mid=${$middle}
//       </div>
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
      <div repeat.for="${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$middle, "i")} of ${access((_o) => void 0, "(3)")}">
        i=${access((/** @type {__AU_TTC_T0_F0} */(o)) => o, "i")}
        idx=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.i, "$index")}
        len=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$index, "$length")}
        first=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$length, "$first")}
        last=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$first, "$last")}
        even=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$last, "$even")}
        odd=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$even, "$odd")}
        mid=${access((/** @type {__AU_TTC_T0_F1} */(o)) => o.$odd, "$middle")}
      </div>
    </template>`;
}

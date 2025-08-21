/* AUTO-GENERATED: 08_nested_with_repeat_promise_complex
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <section with.bind="obj['key']">
//         <article repeat.for="u of $parent.items">
//           <div promise.bind="data">
//             <template then="r">${u.name}-${r.users[$index]?.email}</template>
//           </div>
//         </article>
//       </section>
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
      <section with.bind="${access((/** @type {__AU_TTC_T0_F3} */(o)) => o.data, "obj['key']")}">
        <article repeat.for="${access((/** @type {__AU_TTC_T0_F4} */(o)) => o.u.name, "u")} of ${access((/** @type {__AU_TTC_T0_F4} */(o)) => o.r.users[o.$index]?.email, "$parent.items")}">
          <div promise.bind="${access((_o) => void 0, "data")}">
            <template then="${access((_o) => void 0, "r")}">${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.obj["key"], "u.name")}-${access((/** @type {__AU_TTC_T0_F1} */(o)) => o, "r.users[$index]?.email")}</template>
          </div>
        </article>
      </section>
    </template>`;
}

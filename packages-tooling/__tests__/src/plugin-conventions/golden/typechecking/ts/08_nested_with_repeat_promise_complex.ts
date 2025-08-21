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
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
type __AU_TTC_T0_F0 = (Common) & { $parent: unknown };
type __AU_TTC_T0_F1 = (Common)['obj']['key'] & { $this: (Common)['obj']['key'] } & (Common) & { $parent: unknown };
type __AU_TTC_T0_F2 = (Common) & { $parent: unknown } & { u: CollectionElement<unknown>; $index: number; $first: boolean; $last: boolean; $even: boolean; $odd: boolean; $length: number; $middle: boolean };
type __AU_TTC_T0_F3 = (Common)['data'] & { $this: (Common)['data'] } & (Common) & { $parent: unknown };
type __AU_TTC_T0_F4 = (Awaited<(Common)['data']>) & { $this: Awaited<(Common)['data']> } & (Common) & { $parent: unknown } & { r: Awaited<(Common)['data']> };
function __typecheck_template_Common__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>
      <section with.bind="${access<__AU_TTC_T0_F3>(o => o.data, "obj['key']")}">
        <article repeat.for="${access<__AU_TTC_T0_F4>(o => o.u.name, "u")} of ${access<__AU_TTC_T0_F4>(o => o.r.users[o.$index]?.email, "$parent.items")}">
          <div promise.bind="${access((_o) => void 0, "data")}">
            <template then="${access((_o) => void 0, "r")}">${access<__AU_TTC_T0_F0>(o => o.obj["key"], "u.name")}-${access<__AU_TTC_T0_F1>(o => o, "r.users[$index]?.email")}</template>
          </div>
        </article>
      </section>
    </template>`;
}

/* AUTO-GENERATED: 31_switch_inside_repeat_case_expr
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div repeat.for="u of items">
//         <div switch.bind="u.id % 2">
//           <template case.bind="0">${u.name}-even</template>
//           <template case.bind="1">${u.name}-odd</template>
//         </div>
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
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
type __AU_TTC_T0_F0 = (Common) & { $parent: unknown };
type __AU_TTC_T0_F1 = (Common) & { $parent: unknown } & { u: CollectionElement<(Common)['items']>; $index: number; $first: boolean; $last: boolean; $even: boolean; $odd: boolean; $length: number; $middle: boolean };
function __typecheck_template_Common__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>
      <div repeat.for="${access<__AU_TTC_T0_F1>(o => o.u.name, "u")} of ${access<__AU_TTC_T0_F1>(o => o.u.name, "items")}">
        <div switch.bind="${access<__AU_TTC_T0_F1>(o => 0, "u.id % 2")}">
          <template case.bind="0">${access<__AU_TTC_T0_F0>(o => o, "u.name")}-even</template>
          <template case.bind="1">${access<__AU_TTC_T0_F1>(o => (o.u.id) % (2), "u.name")}-odd</template>
        </div>
      </div>
    </template>`;
}

/* AUTO-GENERATED: 18_switch_no_scope_no_narrowing
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div switch.bind="kind">
//         <template case.bind="'a'">${firstName}</template>
//         <template case.bind="'b'">${lastName}</template>
//         <template default-case>${firstName}</template>
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
function __typecheck_template_Common__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>
      <div switch.bind="${access<__AU_TTC_T0_F0>(o => o.firstName, "kind")}">
        <template case.bind="'a'">${access<__AU_TTC_T0_F0>(o => o.kind, "firstName")}</template>
        <template case.bind="'b'">${access<__AU_TTC_T0_F0>(o => o.firstName, "lastName")}</template>
        <template default-case>${access<__AU_TTC_T0_F0>(o => o.lastName, "firstName")}</template>
      </div>
    </template>`;
}

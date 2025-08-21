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
 public deep: { v: boolean }
 public data: Promise<{ users: Array<{ id: number; email: string }> }>
 public kind: "a" | "b" | "c"
 public elementId: string
 public greeting: string
 public composeVm: unknown
 public doThing: (x: number, y: string) => void
 private secret: () => number
}

class Other {
 public status: "idle" | "busy"
 public items: Set<{ id: number; tags: string[] }>
}

// === EMIT ===
// @ts-check
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
type __AU_TTC_T0_F0 = (Common | Other) & { $parent: unknown };
function __typecheck_template_Common_Other__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>${access<__AU_TTC_T0_F0>(o => o.status, "status")} ${access<__AU_TTC_T0_F0>(o => o.items.size, "items.size")} ${access<__AU_TTC_T0_F0>(o => o.firstName, "firstName")}</template>`;
}

/* AUTO-GENERATED: 13_promise_then_and_catch
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div promise.bind="data"><template then="r">${r.users[0].email}</template><template catch="e">${e.message}</template></div>
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
type __AU_TTC_T0_F1 = (Common)['data'] & { $this: (Common)['data'] } & (Common) & { $parent: unknown };
type __AU_TTC_T0_F2 = (Awaited<(Common)['data']>) & { $this: Awaited<(Common)['data']> } & (Common) & { $parent: unknown } & { r: Awaited<(Common)['data']> };
type __AU_TTC_T0_F3 = (Common)['data'] & { $this: (Common)['data'] } & (Common) & { $parent: unknown } & { e: any };
function __typecheck_template_Common__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>
      <div promise.bind="${access<__AU_TTC_T0_F3>(o => o.e.message, "data")}"><template then="${access((_o) => void 0, "r")}">${access<__AU_TTC_T0_F1>(o => o.data, "r.users[(0)].email")}</template><template catch="${access((_o) => void 0, "e")}">${access<__AU_TTC_T0_F2>(o => o.r.users[0].email, "e.message")}</template></div>
    </template>`;
}

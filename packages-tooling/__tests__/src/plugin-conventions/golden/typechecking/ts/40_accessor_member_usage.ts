/* AUTO-GENERATED: 40_accessor_member_usage
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>${fullName}</template>
//
// CLASSES:
export {}
class Accessors {
 public fullName: string
}

// === EMIT ===
// @ts-check
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
type __AU_TTC_T0_F0 = (Accessors) & { $parent: unknown };
function __typecheck_template_Accessors__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>${access<__AU_TTC_T0_F0>(o => o.fullName, "fullName")}</template>`;
}

/* AUTO-GENERATED: 28_input_checkbox_two_way_refinement
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><input type="checkbox" checked.bind="flag" /></template>
//
// CLASSES:
export {}
class Form {
 public flag: boolean
 public selected: string[]
}

// === EMIT ===
// @ts-check
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
type __AU_TTC_T0_F0 = (Form) & { $parent: unknown };
function __typecheck_template_Form__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template><input type="checkbox" checked.bind="${access<__AU_TTC_T0_F0>(o => o.flag, "flag")}" /></template>`;
}

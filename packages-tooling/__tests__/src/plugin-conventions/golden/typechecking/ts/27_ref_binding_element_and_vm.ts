/* AUTO-GENERATED: 27_ref_binding_element_and_vm
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div ref="el"></div>
//       <au-compose ref="vmRef"></au-compose>
//     </template>
//
// CLASSES:
export {}
class Refs {
 public el: HTMLElement | null
 public vmRef: unknown
}

// === EMIT ===
// @ts-check
type CollectionElement<TCollection> = TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never;
/* @internal */
const __au$access = <T>(_fn: (o: T) => unknown): void => { /* no-op */ };
type __AU_TTC_T0_F0 = (Refs) & { $parent: unknown };
function __typecheck_template_Refs__(): string {
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string): string => expr;
  return `<template>
      <div ref="${access<__AU_TTC_T0_F0>(o => o.el, "el")}"></div>
      <au-compose ref="${access<__AU_TTC_T0_F0>(o => o.vmRef, "vmRef")}"></au-compose>
    </template>`;
}

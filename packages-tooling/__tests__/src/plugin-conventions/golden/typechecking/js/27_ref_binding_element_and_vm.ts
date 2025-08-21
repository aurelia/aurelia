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
/**
 * @template TCollection
 * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
 */
/**
 * @template T
 * @param {(o: T) => unknown} _fn
 * @returns {void}
 */
function __au$access(_fn) { /* no-op */ }function __typecheck_template_Refs__() {
  /**
   * @template T
   * @param {(o: T) => unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  const access = (typecheck, expr) => expr;
  return `<template>
      <div ref="${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.el, "el")}"></div>
      <au-compose ref="${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.vmRef, "vmRef")}"></au-compose>
    </template>`;
}

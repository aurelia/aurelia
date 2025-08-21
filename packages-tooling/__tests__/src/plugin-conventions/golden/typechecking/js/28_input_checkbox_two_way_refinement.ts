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
/**
 * @template TCollection
 * @typedef {TCollection extends Array<infer TElement> ? TElement : TCollection extends Set<infer TElement> ? TElement : TCollection extends Map<infer TKey, infer TValue> ? [TKey, TValue] : TCollection extends number ? number : TCollection extends object ? any : never} CollectionElement
 */
/**
 * @template T
 * @param {(o: T) => unknown} _fn
 * @returns {void}
 */
function __au$access(_fn) { /* no-op */ }function __typecheck_template_Form__() {
  /**
   * @template T
   * @param {(o: T) => unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  const access = (typecheck, expr) => expr;
  return `<template><input type="checkbox" checked.bind="${access((/** @type {__AU_TTC_T0_F0} */(o)) => o.flag, "flag")}" /></template>`;
}

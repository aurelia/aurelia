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
 public data: Promise<{ users: Array<{ id: number; email: string }> }>
 public doThing: (x: number, y: string) => void
 private secret: () => number
}

// === EMIT ===

type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>
      <div switch.bind="${access<__Template_Type_Common__>(o => o.kind, 'kind')}">
        <template case.bind="'a'">${access<__Template_Type_Common__>(o => o.firstName, 'firstName')}</template>
        <template case.bind="'b'">${access<__Template_Type_Common__>(o => o.lastName, 'lastName')}</template>
        <template default-case>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')}</template>
      </div>
    </template>`;
}


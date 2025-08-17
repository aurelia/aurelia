/* AUTO-GENERATED: 04_repeat_array
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><li repeat.for="it of items">${$index} - ${it.name}</li></template>
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

type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_it1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['items']> } & { $index: number, $first: boolean, $last: boolean, $even: boolean, $odd: boolean, $length: number };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><li repeat.for="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_it1, 'it')} of ${access<__Template_Type_Common__>(o => o.items, 'items')}">${access<__Template_Type_Common__>(o => o.$index, '$index')} - ${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_it1.name, 'it.name')}</li></template>`;
}


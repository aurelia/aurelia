/* AUTO-GENERATED: 12_repeat_object_key_access
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><div repeat.for="k of obj">${obj[k].deep.v}</div></template>
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

type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_k1: CollectionElement<(Omit<Common, 'secret'> & { secret(): () => number })['obj']> };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><div repeat.for="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_k1, 'k')} of ${access<__Template_Type_Common__>(o => o.obj, 'obj')}">${access<__Template_Type_Common__>(o => o.obj[o.__Template_TypeCheck_Synthetic_k1].deep.v, 'obj[k].deep.v')}</div></template>`;
}


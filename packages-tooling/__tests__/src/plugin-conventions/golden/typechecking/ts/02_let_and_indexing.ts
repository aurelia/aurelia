/* AUTO-GENERATED: 02_let_and_indexing
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><let deep.bind="obj['key'].deep"></let>${deep.v}</template>
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

type __Template_Type_Common__ = Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, '__Template_TypeCheck_Synthetic_deep1'> & { __Template_TypeCheck_Synthetic_deep1: __Template_Type_Common__['obj']['deep'] };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><let deep.bind="${access<__Template_Type_Common__>(o => o.obj[('key')].deep, 'obj[\'key\'].deep')}"></let>${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_deep1.v, 'deep.v')}</template>`;
}


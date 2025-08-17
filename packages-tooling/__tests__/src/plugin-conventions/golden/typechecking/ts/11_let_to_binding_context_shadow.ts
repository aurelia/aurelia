/* AUTO-GENERATED: 11_let_to_binding_context_shadow
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template><let to-binding-context firstName.bind="'Overridden'"></let>${firstName}</template>
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

type __Template_Type_Common__ = Omit<Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any }, 'firstname'> & { firstname: ('Overridden') };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template><let to-binding-context firstName.bind="'Overridden'"></let>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')}</template>`;
}


/* AUTO-GENERATED: 01_plain_interpolation_and_this
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>${firstName} ${this.lastName}</template>
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
  return `<template>${access<__Template_Type_Common__>(o => o.firstName, 'firstName')} ${access<__Template_Type_Common__>(o => o.lastName, 'this.lastName')}</template>`;
}


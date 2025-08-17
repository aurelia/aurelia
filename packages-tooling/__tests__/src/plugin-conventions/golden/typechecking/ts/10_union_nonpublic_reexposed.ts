/* AUTO-GENERATED: 10_union_nonpublic_reexposed
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>${status} ${items.size} ${firstName}</template>
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

class Other {
 public status: "idle" | "busy"
 public items: Set<{ id: number; tags: string[] }>()
}

// === EMIT ===

type __Template_Type_Common_Other__ = Omit<Common, 'secret'> & { secret(): () => number } | Other & { $parent: any };
function __typecheck_template_Common_Other__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>${access<__Template_Type_Common_Other__>(o => o.status, 'status')} ${access<__Template_Type_Common_Other__>(o => o.items.size, 'items.size')} ${access<__Template_Type_Common_Other__>(o => o.firstName, 'firstName')}</template>`;
}


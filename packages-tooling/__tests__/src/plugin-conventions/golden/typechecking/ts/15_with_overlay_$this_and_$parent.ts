/* AUTO-GENERATED: 15_with_overlay_$this_and_$parent
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div with.bind="deep">
//         ${$this.v} ${$parent.firstName} ${this.firstName}
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

type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_v1: (Omit<Common, 'secret'> & { secret(): () => number })['deep']['v'] };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>
      <div with.bind="${access<__Template_Type_Common__>(o => o.deep, 'deep')}">
        ${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_v1, 'v')} ${access<__Template_Type_Common__>(o => o.$parent.firstName, '$parent.firstName')} ${access<__Template_Type_Common__>(o => o.firstName, 'this.firstName')}
      </div>
    </template>`;
}


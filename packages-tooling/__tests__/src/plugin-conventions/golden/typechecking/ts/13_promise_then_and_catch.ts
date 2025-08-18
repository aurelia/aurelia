/* AUTO-GENERATED: 13_promise_then_and_catch
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div promise.bind="data"><template then="r">${r.users[0].email}</template><template catch="e">${e.message}</template></div>
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

type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_r1: Awaited<__Template_Type_Common__['data']> } & { __Template_TypeCheck_Synthetic_e1: any };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>
      <div promise.bind="${access<__Template_Type_Common__>(o => o.data, 'data')}"><template then="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1, 'r')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1.users[(0)].email, 'r.users[(0)].email')}</template><template catch="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_e1, 'e')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_e1.message, 'e.message')}</template></div>
    </template>`;
}


/* AUTO-GENERATED: 17_repeat_number_contextuals
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */

// === SOURCE ===
// HTML:
// <template>
//       <div repeat.for="i of 3">
//         i=${i}
//         idx=${$index}
//         len=${$length}
//         first=${$first}
//         last=${$last}
//         even=${$even}
//         odd=${$odd}
//         mid=${$middle}
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

type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic___TypeCheck_RangeIterable__1: 3 } & { __Template_TypeCheck_Synthetic_i1: CollectionElement<__Template_Type_Common__['__Template_TypeCheck_Synthetic___TypeCheck_RangeIterable__1']> } & { $index: number, $first: boolean, $last: boolean, $even: boolean, $odd: boolean, $length: number };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>
      <div repeat.for="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_i1, 'i')} of ${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic___TypeCheck_RangeIterable__1, '3')}">
        i=${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_i1, 'i')}
        idx=${access<__Template_Type_Common__>(o => o.$index, '$index')}
        len=${access<__Template_Type_Common__>(o => o.$length, '$length')}
        first=${access<__Template_Type_Common__>(o => o.$first, '$first')}
        last=${access<__Template_Type_Common__>(o => o.$last, '$last')}
        even=${access<__Template_Type_Common__>(o => o.$even, '$even')}
        odd=${access<__Template_Type_Common__>(o => o.$odd, '$odd')}
        mid=${access<__Template_Type_Common__>(o => o.$middle, '$middle')}
      </div>
    </template>`;
}


/* AUTO-GENERATED: 08_nested_with_repeat_promise_complex
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */


type __Template_Type_Common__ = Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_u1: CollectionElement<__Template_Type_Common__> } & { __Template_TypeCheck_Synthetic_r1: Awaited<__Template_Type_Common__['data']> } & { __Template_TypeCheck_Synthetic_$index1: (Omit<Common, 'secret'> & { secret(): () => number })['obj']['$index'] };
function __typecheck_template_Common__() {
  
  const access = <T extends object>(typecheck: (o: T) => unknown, expr: string) => expr;
  return `<template>
  <section with.bind="${access<__Template_Type_Common__>(o => o.obj[('key')], 'obj[\'key\']')}">
    <article repeat.for="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_u1, 'u')} of ${access<__Template_Type_Common__>(o => o.$parent.items, '$parent.items')}">
      <div promise.bind="${access<__Template_Type_Common__>(o => o.data, 'data')}">
        <template then="${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1, 'r')}">${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_u1.name, 'u.name')}-${access<__Template_Type_Common__>(o => o.__Template_TypeCheck_Synthetic_r1.users[o.__Template_TypeCheck_Synthetic_$index1]?.email, 'r.users[$index]?.email')}</template>
      </div>
    </article>
  </section>
</template>`;
}


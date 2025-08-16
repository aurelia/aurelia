/* AUTO-GENERATED: 08_nested_with_repeat_promise_complex
 * Do not edit by hand. Update with: npm run gen:ttc-goldens
 */



function __typecheck_template_Common__() {
  
  /**
   * @typedef {Omit<Common, 'secret'> & { secret(): () => number } & { $parent: any } & { __Template_TypeCheck_Synthetic_u1: CollectionElement<__Template_Type_Common__> } & { __Template_TypeCheck_Synthetic_r1: Awaited<__Template_Type_Common__['data']> } & { __Template_TypeCheck_Synthetic_$index1: (Omit<Common, 'secret'> & { secret(): () => number })['obj']['$index'] }} __Template_Type_Common__
   */
  /**
   * @template {__Template_Type_Common__} T
   * @param {function(T): unknown} typecheck
   * @param {string} expr
   * @returns {string}
   */
  
  const access = (typecheck, expr) => expr;
  return `<template>
  <section with.bind="${access(o => o.obj[('key')], 'obj[\'key\']')}">
    <article repeat.for="${access(o => o.__Template_TypeCheck_Synthetic_u1, 'u')} of ${access(o => o.$parent.items, '$parent.items')}">
      <div promise.bind="${access(o => o.data, 'data')}">
        <template then="${access(o => o.__Template_TypeCheck_Synthetic_r1, 'r')}">${access(o => o.__Template_TypeCheck_Synthetic_u1.name, 'u.name')}-${access(o => o.__Template_TypeCheck_Synthetic_r1.users[o.__Template_TypeCheck_Synthetic_$index1]?.email, 'r.users[$index]?.email')}</template>
      </div>
    </article>
  </section>
</template>`;
}


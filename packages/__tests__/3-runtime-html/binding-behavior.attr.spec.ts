import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/attr-binding-behavior.spec.ts', function () {
  // it('unbind() should clear the DataAttributeObserver from the binding', function () {
  //   // TODO: it doesn't actually do, and it should
  // });
  it('works with property binding', function () {
    const { getBy } = createFixture
      .html`<div bla.bind="1 & attr">`
      .build();
    assert.strictEqual(getBy('div').getAttribute('bla'), '1');
  });
});

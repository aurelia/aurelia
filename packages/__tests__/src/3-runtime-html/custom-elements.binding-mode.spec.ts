import {
  BindingMode,
  CustomElement
} from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.binding-mode.spec.ts', function () {

  it.only('use default binding mode from the definition for all bindables', async function () {
    const { component, assertTextContain } = createFixture(
      `<my-el component.ref="el" a.bind="value" b.bind="value2">`,
      class App {
        value = '1';
        value2 = '2';
        el: { a: string; b: string };
      },
      [CustomElement.define({
        name: 'my-el',
        template: 'a is:${a} b is:${b}',
        bindables: ['a', 'b'],
        defaultBindingMode: BindingMode.twoWay,
      })]
    );

    assertTextContain('a is:1 b is:2');

    component.el.a = '3';
    component.el.b = '4';
    assert.strictEqual(component.value, '3');
    assert.strictEqual(component.value2, '4');
    await Promise.resolve();
    assertTextContain('a is:3 b is:4');
  });
});

import { capture, customElement, CustomElement, CustomElementDefinition } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.decorator.spec.ts', function () {
  describe('@capture', function () {
    it('retrieves capture on class annonated', function () {
      @capture()
      class El {}

      const { capture: $capture } = CustomElementDefinition.create('el', El);
      assert.deepStrictEqual($capture, true);
    });

    it('retries capture on class annotated with filter function', function () {
      const filter = () => true;
      @capture(filter)
      class El {}

      const { capture: $capture } = CustomElementDefinition.create('el', El);
      assert.deepStrictEqual($capture, filter);
    });

    it('setups the right value when decorated before @customElement', function () {
      @capture()
      @customElement({ name: 'el' })
      class El {}

      const { capture: $capture } = CustomElement.getDefinition(El);
      assert.deepStrictEqual($capture, true);
    });

    it('setups the right value when decorated after @customElement', function () {
      @customElement({ name: 'el' })
      @capture()
      class El {}

      const { capture: $capture } = CustomElement.getDefinition(El);
      assert.deepStrictEqual($capture, true);
    });
  });
});

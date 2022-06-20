import { capture, CustomElementDefinition } from '@aurelia/runtime-html';
import { assert } from '@aurelia/testing';

describe('3-runtime-html/custom-elements.decorator.spec.ts', function () {
  describe('@capture', function () {
    it('retrieves capture on class annonated', function () {
      @capture
      class El {}

      const { capture: $capture } = CustomElementDefinition.create('el', El);
      assert.deepStrictEqual($capture, true);
    });
  });
});

import { IContainer } from '@aurelia/kernel';
import { PropertyBinding, AttrBindingBehavior, DataAttributeAccessor } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

describe('3-runtime-html/attr-binding-behavior.spec.ts', function () {
  let target: any;
  let targetProperty: string;
  let container: IContainer;
  let sut: AttrBindingBehavior;
  let binding: PropertyBinding;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    const ctx = TestContext.create();
    target = ctx.createElement('div');
    targetProperty = 'foo';
    sut = new AttrBindingBehavior();
    container = ctx.container;
    binding = new PropertyBinding(
      { state: 0 },
      container,
      undefined,
      undefined,
      undefined,
      target,
      targetProperty,
      {} as any
    );
    sut.bind(undefined, undefined, binding);
  });

  it('bind()   should put a DataAttributeObserver on the binding', function () {
    assert.strictEqual(binding.targetObserver instanceof DataAttributeAccessor, true, `binding.targetObserver instanceof DataAttributeAccessor`);
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', function () {
  //   // TODO: it doesn't actually do, and it should
  // });
});

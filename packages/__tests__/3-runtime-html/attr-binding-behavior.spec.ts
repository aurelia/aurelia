import { IContainer } from '@aurelia/kernel';
import { PropertyBinding } from '@aurelia/runtime';
import { AttrBindingBehavior, DataAttributeAccessor } from '@aurelia/runtime-html';
import { TestContext, assert } from '@aurelia/testing';

describe('AttrBindingBehavior', function () {
  let target: any;
  let targetProperty: string;
  let container: IContainer;
  let sut: AttrBindingBehavior;
  let binding: PropertyBinding;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    const ctx = TestContext.createHTMLTestContext();
    target = ctx.createElement('div');
    targetProperty = 'foo';
    sut = new AttrBindingBehavior();
    container = ctx.container;
    binding = new PropertyBinding(undefined, target, targetProperty, undefined, undefined, container);
    sut.bind(undefined, undefined, binding);
  });

  it('bind()   should put a DataAttributeObserver on the binding', function () {
    assert.strictEqual(binding.targetObserver instanceof DataAttributeAccessor, true, `binding.targetObserver instanceof DataAttributeAccessor`);
    assert.strictEqual(binding.targetObserver['obj'] === target, true, `binding.targetObserver['obj'] === target`);
    assert.strictEqual(binding.targetObserver['propertyKey'] === targetProperty, true, `binding.targetObserver['propertyKey'] === targetProperty`);
  });

  // it('unbind() should clear the DataAttributeObserver from the binding', function () {
  //   // TODO: it doesn't actually do, and it should
  // });
});

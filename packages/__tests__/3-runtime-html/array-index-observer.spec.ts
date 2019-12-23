import { TestContext, assert } from '@aurelia/testing';
import { IInputElement, ValueAttributeObserver } from '@aurelia/runtime-html';
import { LifecycleFlags, ArrayIndexObserver, ISubscriber } from '@aurelia/runtime';

describe('3-runtime-html/array-index-observer.spec.ts', function() {
  it('observer array index correctly', function() {
    const { observerLocator } = createFixture();
    const arr = [1, 2, 3];
    const index_0_observer = observerLocator.getObserver(LifecycleFlags.none, arr, '0') as ArrayIndexObserver;
    
    let callcount = 0;
    const index_0_subscriber: ISubscriber = {
      handleChange() {
        callcount++;
      }
    }
    index_0_observer.subscribe(index_0_subscriber);
    assert.instanceOf(index_0_observer, ArrayIndexObserver);
    arr[0] = 5;
    assert.strictEqual(index_0_observer.currentValue, 1);
    arr.splice(0, 1, 4);
    assert.strictEqual(index_0_observer.currentValue, 4);
    assert.strictEqual(callcount, 1);

    index_0_observer.setValue(0, LifecycleFlags.none);
    assert.strictEqual(callcount, 2);
    assert.strictEqual(arr[0], 0);
  });

  function createFixture() {
    const ctx = TestContext.createHTMLTestContext();
    const { container, lifecycle, observerLocator, scheduler } = ctx;
    const el = ctx.createElementFromMarkup(`<input />`) as IInputElement;
    ctx.doc.body.appendChild(el);

    const sut = ctx.observerLocator.getObserver(LifecycleFlags.none, el, 'value') as ValueAttributeObserver;
    ctx.observerLocator.getObserver(LifecycleFlags.none, el, 'value');

    return { ctx, container, lifecycle, observerLocator, el, sut, scheduler };
  }
});

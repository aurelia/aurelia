import { DI } from '@aurelia/kernel';
import { expect } from 'chai';
import { Hooks, ILifecycle, LifecycleFlags, PromiseTask, State } from '../src/index';
import { IComponent, ILifecycleHooks, Lifecycle } from '../src/lifecycle';

describe('Lifecycle', function () {

  it('initializes properties', function () {
    const sut = new Lifecycle();

    const linkedListProps = [
      'flush',
      'bound',
      'mount',
      'attached',
      'unmount',
      'detached',
      'unbindAfterDetach',
      'unbound',
    ];

    for (const prop of linkedListProps) {
      const countProp = `${prop}Count`;
      const headProp = `${prop}Head`;
      const tailProp = `${prop}Tail`;
      expect(sut[countProp]).to.equal(0, `sut.${countProp}`);
      expect(sut[headProp]).to.equal(sut, `sut.${headProp}`);
      expect(sut[tailProp]).to.equal(sut, `sut.${tailProp}`);
    }

    const numericProps = [
      'bindDepth',
      'attachDepth',
      'detachDepth',
      'unbindDepth',
    ];

    for (const prop of numericProps) {
      expect(sut[prop]).to.equal(0, `sut.${prop}`);
    }

    const functionProps = [
      'flush',
      'bound',
      '$mount',
      'attached',
      '$unmount',
      'detached',
      '$unbind',
      'unbound',
    ];

    for (const prop of functionProps) {
      expect(sut[prop]).to.be.a('function', `sut.${prop}`);
    }

    const objectProps = [
      '$nextFlush',
      '$nextBound',
      '$nextMount',
      '$nextAttached',
      '$nextUnmount',
      '$nextDetached',
      '$nextUnbindAfterDetach',
      '$nextUnbound',
    ];

    for (const prop of objectProps) {
      expect(sut[prop]).to.be.a('object', `sut.${prop}`);
    }

    expect(sut.flushed).to.equal(undefined, 'sut.flushed');
    expect(sut.task).to.equal(undefined, 'sut.task');
    expect(sut.promise).to.be.instanceof(Promise, 'sut.promise');

    // ensure no undefined properties on initialization
    for (const prop in sut) {
      expect(sut[prop]).to.not.equal(undefined, `sut.${prop}`);
    }
  });

  // TODO: more tests needed
  describe('endBind()', function () {
    it('handles task first', async function () {
      const sut = new Lifecycle();
      const flags = LifecycleFlags.none;

      let callbackCalled = false;
      let callbackValue;
      const value = {};
      const promise = new Promise(resolve => {
        setTimeout(() => {
          resolve(value);
        },         50);
      });

      let boundCalled = false;
      const subject1: ILifecycleHooks = {
        $nextBound: null,
        bound(_flags: LifecycleFlags): void {
          expect(callbackCalled).to.equal(true, 'callbackCalled');
          expect(callbackValue).to.equal(callbackValue, 'callbackValue');
          boundCalled = true;
        }
      };

      const task = new PromiseTask(promise, cbValue => {
        callbackCalled = true;
        callbackValue = cbValue;
      });

      sut.beginBind();
      sut.enqueueBound(subject1);
      sut.registerTask(task);

      const lifecycleTask = sut.endBind(flags);

      expect(callbackCalled).to.equal(false, 'callbackCalled');
      expect(boundCalled).to.equal(false, 'boundCalled');

      await lifecycleTask.wait();

      expect(boundCalled).to.equal(true, 'boundCalled');

    });
  });

});

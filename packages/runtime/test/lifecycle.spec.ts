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
      '$nextUnbound',
    ];

    for (const prop of objectProps) {
      expect(sut[prop]).to.be.a('object', `sut.${prop}`);
    }

    expect(sut.flushed).to.equal(null, 'sut.flushed');
    expect(sut.promise).to.be.instanceof(Promise, 'sut.promise');

    // ensure no undefined properties on initialization
    for (const prop in sut) {
      expect(sut[prop]).to.not.equal(undefined, `sut.${prop}`);
    }
  });
});

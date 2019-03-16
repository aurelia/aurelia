import { DI, IContainer } from '@aurelia/kernel';
import { Binding } from '@aurelia/runtime';
import { expect } from 'chai';
import { SelfBindingBehavior } from '@aurelia/runtime-html';

describe('SelfBindingBehavior', function () {
  const container: IContainer = DI.createContainer();
  let sut: SelfBindingBehavior;
  let binding: Binding;
  let originalCallSource: () => void;

  beforeEach(function () {
    sut = new SelfBindingBehavior();
    binding = new Binding(undefined, undefined, undefined, undefined, undefined, container as any);
    originalCallSource = binding['callSource'] = function () { return; };
    binding['targetEvent'] = 'foo';
    sut.bind(undefined, undefined, binding as any);
  });

  // TODO: test properly (different binding types)
  it('bind()   should apply the correct behavior', function () {
    expect(binding['selfEventCallSource'] === originalCallSource).to.equal(true);
    expect(binding['callSource'] === originalCallSource).to.equal(false);
    expect(typeof binding['callSource']).to.equal('function');
  });

  it('unbind() should revert the original behavior', function () {
    sut.unbind(undefined, undefined, binding as any);
    expect(binding['selfEventCallSource']).to.equal(null);
    expect(binding['callSource'] === originalCallSource).to.equal(true);
  });
});

import { DI, IContainer, Registration } from '@aurelia/kernel';
import { PropertyBinding, IPlatform, SelfBindingBehavior } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/self-binding-behavior.spec.ts', function () {
  let container: IContainer;
  let sut: SelfBindingBehavior;
  let binding: PropertyBinding;
  let originalCallSource: () => void;

  // eslint-disable-next-line mocha/no-hooks
  beforeEach(function () {
    container = DI.createContainer();
    Registration.instance(IPlatform, { }).register(container);
    sut = new SelfBindingBehavior();
    binding = new PropertyBinding({ state: 0 }, undefined, undefined, undefined, undefined, undefined, container as any, {} as any);
    originalCallSource = binding['callSource'] = function () { return; };
    binding['targetEvent'] = 'foo';
    sut.bind(undefined, binding as any);
  });

  // TODO: test properly (different binding types)
  it('[UNIT] bind()   should apply the correct behavior', function () {
    assert.strictEqual(binding['selfEventCallSource'] === originalCallSource, true, `binding['selfEventCallSource'] === originalCallSource`);
    assert.strictEqual(binding['callSource'] === originalCallSource, false, `binding['callSource'] === originalCallSource`);
    assert.strictEqual(typeof binding['callSource'], 'function', `typeof binding['callSource']`);
  });

  it('[UNIT] unbind() should revert the original behavior', function () {
    sut.unbind(undefined, binding as any);
    assert.strictEqual(binding['selfEventCallSource'], null, `binding['selfEventCallSource']`);
    assert.strictEqual(binding['callSource'] === originalCallSource, true, `binding['callSource'] === originalCallSource`);
  });

  it('works with event binding', function () {
    let count = 0;
    const { getBy } = createFixture
      .component({
        call() {
          count++;
        },
        call2() {
          count = 2;
        }
      })
      .html`<div click.trigger="call() & self"><button click.trigger="call2()">Click me</button></div>`
      .build();

    getBy('button').click();
    assert.strictEqual(count, 2);

    getBy('div').click();
    assert.strictEqual(count, 3);
  });
});

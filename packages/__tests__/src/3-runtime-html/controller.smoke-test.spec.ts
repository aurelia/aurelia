import { resolve } from '@aurelia/kernel';
import { Controller, CustomElement, customElement, ICustomElementViewModel, IHydratedController, INode, registerHostNode } from '@aurelia/runtime-html';
import { assert, createFixture } from '@aurelia/testing';

describe('3-runtime-html/controller.smoke-test.spec.ts', function () {

  it('explicit hydration host and hostController can be provided', async function () {
    @customElement({ name: 'c-1', template: 'c1' })
    class CeOne { }

    @customElement({ name: 'c-2', template: 'c2' })
    class CeTwo implements ICustomElementViewModel {
      public readonly ce2El: Element = resolve(INode) as Element;

      public attached(_initiator: IHydratedController): void | Promise<void> {
        // at this point, the element should be in the DOM
        assert.strictEqual(this.ce2El.parentElement, ce1El);
      }
    }

    const { appHost, stop, startPromise, platform } = createFixture(
      `<c-1></c-1>`,
      class { },
      [CeOne, CeTwo],
    );
    await startPromise;

    const ce1El = appHost.querySelector('c-1');
    assert.html.innerEqual(ce1El, 'c1');

    const ce1Ctrl = CustomElement.for(ce1El);

    // activate c-2
    const childCtn = ce1Ctrl.container.createChild({ inheritParentResources: true });
    const ce2El = platform.document.createElement('c-2');
    registerHostNode(childCtn, ce2El);
    assert.html.innerEqual(ce2El, '');
    const ce2Vm = childCtn.invoke(CeTwo);
    assert.strictEqual(ce2Vm.ce2El, ce2El);
    const ce2Ctrl = Controller.$el(childCtn, ce2Vm, ce2El, { hostController: ce1Ctrl as unknown as Controller, projections: null });
    await ce2Ctrl.activate(ce2Ctrl, ce1Ctrl);

    // post-activation assertion
    assert.html.textContent(ce2El, 'c2');
    assert.html.textContent(ce1El, 'c1c2');
    assert.strictEqual(ce1El.contains(ce2El), true);

    // deactivate c-2
    await ce2Ctrl.deactivate(ce2Ctrl, ce1Ctrl);

    // post-deactivation assertion
    assert.html.textContent(ce2El, '');
    assert.html.textContent(ce1El, 'c1');
    assert.strictEqual(ce1El.contains(ce2El), false);

    await stop(true);
  });
});

import { expect } from 'chai';
import { Constructable } from '../../../../../kernel/src/index';
import { BindingFlags, Lifecycle, LifecycleFlags, IAttach, IView } from '../../../../src/index';
import { ViewFake } from '../fakes/view-fake';
import { hydrateCustomAttribute } from '../behavior-assistance';
import { createScope } from '../scope-assistance';

export function ensureSingleChildTemplateControllerBehaviors<T extends Constructable>(
  Type: T,
  getChildView: (attribute: InstanceType<T>) => IView
  ) {
  it('creates a child instance from its template', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    expect(child).to.be.instanceof(ViewFake);
  });

  it('enforces the attach lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let attachCalled = false;
    child.$attach = function() { attachCalled = true; };

    runAttachLifecycle(attribute);

    expect(attachCalled).to.be.true;
  });

  it('adds a child instance at the render location when attaching', () => {
    const { attribute, location } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    runAttachLifecycle(attribute);

    expect(location.previousSibling)
      .to.be.equal(child.$nodes.lastChild);
  });

  it('enforces the bind lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let bindCalled = false;
    child.$bind = function() { bindCalled = true; };

    attribute.$bind(BindingFlags.fromBind, createScope());

    expect(bindCalled).to.be.true;
  });

  it('enforces the detach lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let detachCalled = false;
    child.$detach = function() { detachCalled = true; };

    runAttachLifecycle(attribute);
    runDetachLifecycle(attribute);

    expect(detachCalled).to.be.true;
  });

  it('enforces the unbind lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = getChildView(attribute);

    let unbindCalled = false;
    child.$unbind = function() { unbindCalled = true; };

    attribute.$bind(BindingFlags.fromBind, createScope());
    attribute.$unbind(BindingFlags.fromUnbind);

    expect(unbindCalled).to.be.true;
  });

  function runAttachLifecycle(item: IAttach) {
    const attachLifecycle = Lifecycle.beginAttach(null, LifecycleFlags.none);
    attachLifecycle.attach(item);
    attachLifecycle.end();
  }

  function runDetachLifecycle(item: IAttach) {
    const detachLifecycle = Lifecycle.beginDetach(LifecycleFlags.none);
    detachLifecycle.detach(item);
    detachLifecycle.end();
  }
}

import { expect } from 'chai';
import { Constructable } from '../../../../../kernel/src/index';
import { BindingFlags } from '../../../../src/index';
import { ViewFake } from '../fakes/view-fake';
import { hydrateCustomAttribute } from '../behavior-assistance';
import { createScope } from '../scope-assistance';

export function ensureSingleChildTemplateControllerBehaviors(Type: Constructable) {
  it('creates a child instance from its template', () => {
    const { attribute } = hydrateCustomAttribute(Type);

    expect(attribute['$child']).to.be.instanceof(ViewFake);
  });

  it('enforces the attach lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = attribute['$child'];

    let attachCalled = false;
    child.$attach = function() { attachCalled = true; };

    attribute.$attach(null, null);

    expect(attachCalled).to.be.true;
  });

  it('adds a child instance at the render location when attaching', () => {
    const { attribute, location } = hydrateCustomAttribute(Type);

    attribute.$attach(null);

    expect(location.previousSibling)
      .to.be.equal(attribute['$child'].$nodes.lastChild);
  });

  it('enforces the bind lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = attribute['$child'];

    let bindCalled = false;
    child.$bind = function() { bindCalled = true; };

    attribute.$bind(BindingFlags.fromBind, createScope());

    expect(bindCalled).to.be.true;
  });

  it('enforces the detach lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = attribute['$child'];

    let detachCalled = false;
    child.$detach = function() { detachCalled = true; };

    attribute.$attach(null, null);
    attribute.$detach(null);

    expect(detachCalled).to.be.true;
  });

  it('enforces the unbind lifecycle of its child instance', () => {
    const { attribute } = hydrateCustomAttribute(Type);
    const child = attribute['$child'];

    let unbindCalled = false;
    child.$unbind = function() { unbindCalled = true; };

    attribute.$bind(BindingFlags.fromBind, createScope());
    attribute.$unbind(BindingFlags.fromUnbind);

    expect(unbindCalled).to.be.true;
  });
}

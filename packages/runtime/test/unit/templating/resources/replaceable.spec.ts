import { expect } from 'chai';
import { Replaceable, IRenderingEngine, IVisualFactory, IRenderLocation, DOM, CustomAttributeResource } from "@aurelia/runtime";
import { DI, Registration } from '@aurelia/kernel';
import { VisualFactoryFake } from "../fakes/visual-factory-fake";
import { VisualFake } from '../fakes/visual-fake';

describe('The replaceable template controller', () => {
  function createRenderLocation() {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    return DOM.convertToRenderLocation(child);
  }

  function hydrateReplaceable() {
    const container = DI.createContainer();
    const location = createRenderLocation();

    container.register(
      Registration.singleton(IVisualFactory, VisualFactoryFake),
      Registration.instance(IRenderLocation, location),
      Replaceable
    );

    const replaceable = container.get<Replaceable>(
      CustomAttributeResource.key('replaceable')
    );

    replaceable.$hydrate(container.get(IRenderingEngine));

    return {replaceable, location};
  }

  it('creates a child instance from its template', () => {
    const { replaceable } = hydrateReplaceable();

    expect(replaceable['$child']).to.be.instanceof(VisualFake);
  });

  it('adds a child instance at the render location', () => {
    const {replaceable, location} = hydrateReplaceable();

    expect(location.previousSibling)
      .to.be.eq(replaceable['$child'].$view.lastChild);
  });

  it('enforces the bind lifecycle of its child instance', () => {
    const { replaceable } = hydrateReplaceable();
    const child = replaceable['$child'];

    let bindCalled = false;
    child.$bind = function() { bindCalled = true; };

    replaceable.$bind(null, null);

    expect(bindCalled).to.be.true;
  });

  it('enforces the attach lifecycle of its child instance', () => {
    const { replaceable } = hydrateReplaceable();
    const child = replaceable['$child'];

    let attachCalled = false;
    child.$attach = function() { attachCalled = true; };

    replaceable.$attach(null, null);

    expect(attachCalled).to.be.true;
  });

  it('enforces the detach lifecycle of its child instance', () => {
    const { replaceable } = hydrateReplaceable();
    const child = replaceable['$child'];

    let detachCalled = false;
    child.$detach = function() { detachCalled = true; };

    replaceable.$attach(null, null);
    replaceable.$detach(null);

    expect(detachCalled).to.be.true;
  });

  it('enforces the unbind lifecycle of its child instance', () => {
    const { replaceable } = hydrateReplaceable();
    const child = replaceable['$child'];

    let unbindCalled = false;
    child.$unbind = function() { unbindCalled = true; };

    replaceable.$bind(null, null);
    replaceable.$unbind(null);

    expect(unbindCalled).to.be.true;
  });
});

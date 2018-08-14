import { expect } from 'chai';
import { BindingFlags, ICustomAttributeType } from "@aurelia/runtime";
import { ViewFake } from '../fakes/view-fake';
import { hydrateCustomAttribute } from '../attribute-assistance';
import { createScope } from '../scope-assistance';
import { Constructable } from '../../../../node_modules/@aurelia/kernel';

export function ensureSingleChildTemplateControllerBehaviors(Type: Constructable) {
  const AttributeType: ICustomAttributeType = Type as any;
  const attributeName = AttributeType.description.name;

  describe(`The ${attributeName} template controller`, () => {
    it('creates a child instance from its template', () => {
      const { attribute } = hydrateCustomAttribute(Type);

      expect(attribute['$child']).to.be.instanceof(ViewFake);
    });

    it('adds a child instance at the render location', () => {
      const { attribute, location } = hydrateCustomAttribute(Type);

      expect(location.previousSibling)
        .to.be.equal(attribute['$child'].$nodes.lastChild);
    });

    it('enforces the bind lifecycle of its child instance', () => {
      const { attribute } = hydrateCustomAttribute(Type);
      const child = attribute['$child'];

      let bindCalled = false;
      child.$bind = function() { bindCalled = true; };

      attribute.$bind(BindingFlags.none, createScope());

      expect(bindCalled).to.be.true;
    });

    it('enforces the attach lifecycle of its child instance', () => {
      const { attribute } = hydrateCustomAttribute(Type);
      const child = attribute['$child'];

      let attachCalled = false;
      child.$attach = function() { attachCalled = true; };

      attribute.$attach(null, null);

      expect(attachCalled).to.be.true;
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

      attribute.$bind(BindingFlags.none, createScope());
      attribute.$unbind(BindingFlags.none);

      expect(unbindCalled).to.be.true;
    });
  });
}

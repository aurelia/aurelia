import { expect } from 'chai';
import { CustomAttributeResource, CustomElementResource } from '../../src/index';

describe('CustomElementResource', () => {
  describe(`define`, () => {
    it(`creates a new class when applied to null`, () => {
      const type = CustomElementResource.define('foo', null);
      expect(typeof type).to.equal('function');
      expect(typeof type.constructor).to.equal('function');
      expect(type.name).to.equal('HTMLOnlyElement');
      expect(typeof type.prototype).to.equal('object');
    });

    it(`creates a new class when applied to undefined`, () => { // how though?? it explicitly checks for null??
      const type = (CustomElementResource as any).define('foo');
      expect(typeof type).to.equal('function');
      expect(typeof type.constructor).to.equal('function');
      expect(type.name).to.equal('HTMLOnlyElement');
      expect(typeof type.prototype).to.equal('object');
    });

    it(`names the resource 'unnamed' if no name is provided`, () => {
      const type = CustomElementResource.define({} as any, class Foo {});
      expect(type.description.name).to.equal('unnamed');
    });
  });

  describe(`keyFrom`, () => {
    it(`returns the correct key`, () => {
      expect(CustomElementResource.keyFrom('foo')).to.equal('custom-element:foo');
    });
  });

  describe(`isType`, () => {
    it(`returns true when given a resource with the correct kind`, () => {
      const type = CustomElementResource.define('foo', class Foo {});
      expect(CustomElementResource.isType(type)).to.equal(true);
    });

    it(`returns false when given a resource with the wrong kind`, () => {
      const type = CustomAttributeResource.define('foo', class Foo {});
      expect(CustomElementResource.isType(type)).to.equal(false);
    });
  });

  describe(`behaviorFor`, () => {
    it(`returns $customElement variable if it exists`, () => {
      expect(CustomElementResource.behaviorFor({$customElement: 'foo'} as any)).to.equal('foo');
    });

    it(`returns null if the $customElement variable does nots`, () => {
      expect(CustomElementResource.behaviorFor({} as any)).to.equal(null);
    });
  });
});

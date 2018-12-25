import { customAttribute, CustomAttributeResource } from '../../../src/index';
import { expect } from 'chai';

describe('CustomAttributeResource', () => {
  it('name is custom-attribute', () => {
    expect(CustomAttributeResource.name).to.equal('custom-attribute');
  });

  it('keyFrom() returns the full key', () => {
    expect(CustomAttributeResource.keyFrom('foo')).to.equal('custom-attribute:foo');
  });

  it('isType returns true if it is a custom-attribute', () => {
    const Type = customAttribute('foo')(class {});
    expect(CustomAttributeResource.isType(Type)).to.equal(true, 'isTy[e');
  });

  it('isType returns false if it is NOT a custom-attribute', () => {
    expect(CustomAttributeResource.isType(class {})).to.equal(false, 'isType');
  });
});

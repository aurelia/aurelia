import { expect } from 'chai';
import { createTemplateController } from '@aurelia/testing';

describe('@templateController', function () {
  it('marks the resource as a template controller if it only has a name', function () {
    const { Type } = createTemplateController('foo');
    expect(Type.description.isTemplateController).to.equal(true, 'isTemplateController');
  });

  it('marks the resource as a template controller if it has a def', function () {
    const { Type } = createTemplateController({ name: 'foo' });
    expect(Type.description.isTemplateController).to.equal(true, 'isTemplateController');
  });
});

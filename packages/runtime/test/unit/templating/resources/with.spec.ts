import { expect } from 'chai';
import { With, BindingFlags } from "@aurelia/runtime";
import { hydrateCustomAttribute } from '../attribute-assistance';
import { createScope } from '../scope-assistance';
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "with" template controller', () => {
  ensureSingleChildTemplateControllerBehaviors(With);

  it("updates its child's binding context when its value changes", () => {
    const { attribute } = hydrateCustomAttribute(With);
    const child = attribute['$child'];

    attribute.$bind(BindingFlags.none, createScope());

    let withValue = {};
    attribute.value = withValue;
    expect(child.$scope.bindingContext).to.equal(withValue);

    withValue = {};
    attribute.value = withValue;
    expect(child.$scope.bindingContext).to.equal(withValue);
  });
});

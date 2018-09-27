import { expect } from 'chai';
import { With, BindingFlags } from '../../../../src/index';
import { hydrateCustomAttribute } from '../behavior-assistance';
import { createScope } from '../scope-assistance';
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "with" template controller', () => {
  ensureSingleChildTemplateControllerBehaviors(
    With,
    w => w['currentView']
  );

  it("updates its child's binding context when its value changes", () => {
    const { attribute } = hydrateCustomAttribute(With);
    const child = attribute['currentView'];

    attribute.$bind(BindingFlags.fromBind, createScope());

    let withValue = {};
    attribute.value = withValue;
    expect(child.$scope.bindingContext).to.equal(withValue);

    withValue = {};
    attribute.value = withValue;
    expect(child.$scope.bindingContext).to.equal(withValue);
  });
});

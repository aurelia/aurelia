import { expect } from 'chai';
import { LifecycleFlags, With } from '@aurelia/runtime';
import { createScopeForTest } from '../../../util';
import { ensureSingleChildTemplateControllerBehaviors, hydrateCustomAttribute } from './template-controller-tests';

describe('The "with" template controller', function () {
  ensureSingleChildTemplateControllerBehaviors(With, w => w['currentView']);

  it('updates its child\'s binding context when its value changes', function () {
    const { attribute } = hydrateCustomAttribute(With);
    const child = attribute['currentView'];

    attribute.$bind(LifecycleFlags.fromBind, createScopeForTest());

    let withValue = {};
    attribute.value = withValue;
    expect(child.$scope.bindingContext).to.equal(withValue);

    withValue = {};
    attribute.value = withValue;
    expect(child.$scope.bindingContext).to.equal(withValue);
  });
});

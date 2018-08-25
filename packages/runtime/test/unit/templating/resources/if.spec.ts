import { expect } from 'chai';
import { If, Else } from "@aurelia/runtime";
import { hydrateCustomAttribute } from '../attribute-assistance';
import { createScope } from '../scope-assistance';
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "if" template controller', () => {
  it("updates its child's binding context when its value changes", () => {
    const { attribute: ifAttr } = hydrateCustomAttribute(If);


  });
});

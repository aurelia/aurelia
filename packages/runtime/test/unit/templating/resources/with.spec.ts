import { expect } from 'chai';
import { With, BindingFlags } from "@aurelia/runtime";
import { ViewFake } from '../fakes/view-fake';
import { hydrateCustomAttribute } from '../attribute-assistance';
import { createScope } from '../scope-assistance';
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "with" template controller', () => {
  ensureSingleChildTemplateControllerBehaviors(With);
});

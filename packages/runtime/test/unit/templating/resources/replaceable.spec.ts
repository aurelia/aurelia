import { Replaceable } from "@aurelia/runtime";
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "replaceable" template controller', () => {
  ensureSingleChildTemplateControllerBehaviors(Replaceable);
});

import { Replaceable } from "../../../../src/index";
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "replaceable" template controller', () => {
  ensureSingleChildTemplateControllerBehaviors(Replaceable);
});

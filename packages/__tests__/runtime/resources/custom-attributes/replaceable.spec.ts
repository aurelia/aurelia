import { Replaceable, ICustomAttributeType } from '@aurelia/runtime';
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "replaceable" template controller', function () {
  ensureSingleChildTemplateControllerBehaviors(
    Replaceable as typeof Replaceable & ICustomAttributeType,
    replaceable => replaceable['currentView']
  );
});

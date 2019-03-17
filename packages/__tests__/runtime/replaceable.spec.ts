import { Replaceable, ICustomAttributeType } from '@aurelia/runtime';
import { ensureSingleChildTemplateControllerBehaviors } from '@aurelia/testing';

describe('The "replaceable" template controller', function () {
  ensureSingleChildTemplateControllerBehaviors(
    Replaceable as typeof Replaceable & ICustomAttributeType,
    replaceable => replaceable['currentView']
  );
});

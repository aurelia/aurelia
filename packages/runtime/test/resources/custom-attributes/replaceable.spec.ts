import { Replaceable } from '../../../src/index';
import { ensureSingleChildTemplateControllerBehaviors } from './template-controller-tests';

describe('The "replaceable" template controller', function() {
  ensureSingleChildTemplateControllerBehaviors(
    Replaceable,
    replaceable => replaceable['currentView']
  );
});

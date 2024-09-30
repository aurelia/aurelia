import Aurelia from 'aurelia';
import { AppRoot } from './app-root';
import { Edit } from './edit';
import { ValidationHtmlConfiguration } from '@aurelia/validation-html';

(async () => {
  try {
    await Aurelia.register(ValidationHtmlConfiguration, Edit)
      .app(AppRoot)
      .start();
  } catch (ex) {
    console.log(ex);
  }
})();

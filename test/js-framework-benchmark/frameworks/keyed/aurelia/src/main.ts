
import { PLATFORM } from 'aurelia-pal';

export function configure(aurelia) {
  aurelia.use
    .defaultBindingLanguage()
    .defaultResources();

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));

}

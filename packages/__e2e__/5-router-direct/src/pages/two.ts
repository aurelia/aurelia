import { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';

export class Two {
  static $au: CustomElementStaticAuDefinition = {
    type: 'custom-element',
    name: 'two-route',
    template: `Two page`
  };
  async loading() {
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}

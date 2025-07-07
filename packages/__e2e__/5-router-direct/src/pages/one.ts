import { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';

export class One {
  static $au: CustomElementStaticAuDefinition = {
    type: 'custom-element',
    name: 'one-route',
    template: `One page`
  };
  async loading() {
    return new Promise(resolve => setTimeout(resolve, 10));
  }
}

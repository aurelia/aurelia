import { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';

export class MyInput {
  static $au: CustomElementStaticAuDefinition = {
    type: 'custom-element',
    name: 'my-input',
    bindables: ['value']
  };
  value = '';
}

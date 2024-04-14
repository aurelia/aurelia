import { CustomElementStaticAuDefinition } from '@aurelia/runtime-html';

export class CustomMessage {
  static $au: CustomElementStaticAuDefinition = {
    type: 'custom-element',
    name: 'custom-message',
    template: `<div>\${message}</div>`,
    bindables: ['message']
  }
  public message?: string;
}

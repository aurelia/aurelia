import { bindable, customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'custom-message',
  template: `<div>\${message}</div>`
})
export class CustomMessage {
  @bindable public message: string;
}

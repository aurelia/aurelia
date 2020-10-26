import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'inventory',
  template: `A list of my stuff <input>`,
})
export class Inventory { }

import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'inventory',
  template: `A list of my stuff <input>`,
})
export class Inventory { }

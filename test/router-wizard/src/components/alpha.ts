import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'alpha',
  template: `ALPHA <input> <a href="beta">Beta</a>`,
})
export class Alpha { }

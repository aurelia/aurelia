import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'alpha',
  template: `ALPHA <input> <a href="beta">Beta</a>`,
})
export class Alpha { }

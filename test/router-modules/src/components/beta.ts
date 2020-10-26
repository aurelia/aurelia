import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'beta',
  template: `BETA <input> <a href="alpha">Alpha</a>`,
})
export class Beta { }

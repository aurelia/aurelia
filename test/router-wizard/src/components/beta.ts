import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'beta',
  template: `BETA <input> <a href="alpha">Alpha</a>`,
})
export class Beta { }

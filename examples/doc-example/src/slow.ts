import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'slow',
  template: `
Slow
`})
export class Slow {
  public loading(params) {
    console.log('Slow params', params);
  }

  public binding() {
    return new Promise(r => setTimeout(r, 2000));
  }
}

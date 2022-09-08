import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'fast',
  template: `
Fast
`})
export class Fast {
  public loading(parameters, instruction, navigation) {
    console.log('Fast load:', parameters, instruction, navigation);
  }
  // public detaching() {
  //   return new Promise(r => setTimeout(r, 1000));
  // }
}

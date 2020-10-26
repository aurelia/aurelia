import { customElement } from '@aurelia/runtime-html';

@customElement({
  name: 'cancel',
  template: `THE BIG BOARD! <input>`,
})
export class Cancel {
  public async canEnter() {
    return false;
  }
}

import { customElement } from '@aurelia/runtime';

@customElement({
  name: 'cancel',
  template: `THE BIG BOARD! <input>`,
})
export class Cancel {
  public async canEnter() {
    return false;
  }
}
